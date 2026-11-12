import { createServer } from "node:http";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import ts from "typescript";

// Adaptador de desenvolvimento: executa o handler real da edge function em Node.
// Não disponibiliza URL/chave de banco, não grava credenciais e não gera bypass.
const project = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const secret = process.env.ISG_RESULTS_IFT_PASSWORD;
if (!secret?.trim()) {
  console.error(
    "Defina ISG_RESULTS_IFT_PASSWORD apenas para este ensaio local. A credencial não será exibida nem gravada.",
  );
  process.exit(1);
}
const temporary = await mkdtemp(path.join(tmpdir(), "isg-local-handler-"));
for (const file of ["session", "index"]) {
  let source = await readFile(
    path.join(project, "supabase/functions/isg-results", `${file}.ts`),
    "utf8",
  );
  if (file === "index")
    source = source
      .replace(/^import \{ serve \} from .*;\n/m, "")
      .replace('from "./session.ts"', 'from "./session.mjs"')
      .replace(/\nserve\(handleIsgResultsRequest\);\s*$/, "\n");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText;
  await writeFile(path.join(temporary, `${file}.mjs`), compiled, {
    mode: 0o600,
  });
}
globalThis.Deno = {
  env: {
    get: (key) => (key === "ISG_RESULTS_IFT_PASSWORD" ? secret : undefined),
  },
};
const { handleIsgResultsRequest } = await import(
  pathToFileURL(path.join(temporary, "index.mjs")).href
);
const server = createServer(async (request, response) => {
  if (request.url !== "/functions/v1/isg-results") {
    response.writeHead(404);
    response.end();
    return;
  }
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 16384) {
        response.writeHead(413);
        response.end();
        return;
      }
      chunks.push(chunk);
    }
    const method = request.method ?? "GET";
    const result = await handleIsgResultsRequest(
      new Request("http://127.0.0.1:54399/functions/v1/isg-results", {
        method,
        headers: request.headers,
        ...(method === "GET" || method === "HEAD"
          ? {}
          : { body: Buffer.concat(chunks) }),
      }),
    );
    response.writeHead(result.status, Object.fromEntries(result.headers));
    response.end(Buffer.from(await result.arrayBuffer()));
  } catch {
    response.writeHead(500);
    response.end("Falha no servidor local.");
  }
});
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(54399, "127.0.0.1", resolve);
});
console.log(
  "Controle de acesso local ativo em 127.0.0.1:54399; consultas à base desabilitadas.",
);
const backendOnly = process.argv.includes("--backend-only");
const child = backendOnly
  ? null
  : spawn(
      process.execPath,
      [
        path.join(project, "node_modules/vite/bin/vite.js"),
        "--host",
        "127.0.0.1",
        "--port",
        "8080",
        "--strictPort",
      ],
      {
        cwd: project,
        stdio: "inherit",
        env: {
          ...process.env,
          ISG_RESULTS_IFT_PASSWORD: "",
          VITE_SUPABASE_URL: "http://127.0.0.1:54399",
          VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_local_presentation",
        },
      },
    );
let closing = false;
const close = async () => {
  if (closing) return;
  closing = true;
  child?.kill("SIGTERM");
  server.close();
  await rm(temporary, { recursive: true, force: true });
};
process.on("SIGINT", () => void close());
process.on("SIGTERM", () => void close());
child?.on("exit", () => void close());
