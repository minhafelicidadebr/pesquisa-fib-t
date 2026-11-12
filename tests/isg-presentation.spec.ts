import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { createSyntheticDemo } from "../src/features/isg-presentation/data/presentation-adapter";
import { SLIDES } from "../src/features/isg-presentation/content/slides";

/** Todos os dados e credenciais deste arquivo são fictícios. Rede externa bloqueada. */
async function mockBackend(context: BrowserContext) {
  const state = {
    valid: true,
    offline: false,
    suppressed: false,
    ttl: 2700000,
    actions: [] as string[],
    scopes: [] as unknown[],
  };
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/functions/v1/isg-results")) {
      if (state.offline) return route.abort("failed");
      const body = route.request().postDataJSON();
      state.actions.push(body.action);
      if (body.action === "login") {
        state.scopes.push(body.scope);
        const expectedPassword =
          body.scope === "results"
            ? "senha-admin-sintetica"
            : "senha-ift-sintetica";
        if (body.password !== expectedPassword)
          return route.fulfill({ json: { ok: false } });
        return route.fulfill({
          json: {
            ok: true,
            token: "synthetic-session",
            expiresAt: Date.now() + state.ttl,
            role: body.scope === "presentation" ? "ift" : "admin",
          },
        });
      }
      if (!state.valid)
        return route.fulfill({ status: 401, json: { ok: false } });
      if (body.action === "validate-session")
        return route.fulfill({
          json: {
            ok: true,
            authorized: true,
            role: "ift",
            expiresAt: Date.now() + state.ttl,
          },
        });
      const demo = createSyntheticDemo();
      return route.fulfill({
        json: {
          ok: true,
          suppressed: state.suppressed,
          threshold: 7,
          status: "Agregado FICTÍCIO de teste",
          n: 18,
          globalScore: 52.6,
          factors: demo.factors,
          domains: demo.domains,
          questions: [],
        },
      });
    }
    if (!["127.0.0.1", "localhost"].includes(url.hostname))
      return route.abort();
    return route.continue();
  });
  return state;
}
async function login(page: Page) {
  await page.goto("/isg/apresentacao");
  await page
    .getByLabel("Credencial administrativa do IFT")
    .fill("senha-ift-sintetica");
  await page.getByRole("button", { name: "Acessar apresentação" }).click();
  await expect(
    page.getByRole("button", { name: "Usar dados fictícios" }),
  ).toBeVisible();
}
async function demo(page: Page) {
  await login(page);
  await page.getByRole("button", { name: "Usar dados fictícios" }).click();
  await expect(page.locator(".p-slide-abertura")).toBeVisible();
}
async function go(page: Page, id: string) {
  await page.getByRole("button", { name: "Abrir índice de capítulos" }).click();
  await page
    .locator(".p-chapter-list button")
    .nth(SLIDES.findIndex((s) => s.id === id))
    .click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.locator(`.p-slide-${id}`)).toBeVisible();
}

test("visitante anônimo não consulta agregados nem abre conteúdo protegido", async ({
  page,
  context,
}) => {
  const backend = await mockBackend(context);
  await page.goto("/isg/apresentacao?slide=global");
  await expect(page.getByLabel("Credencial administrativa do IFT")).toBeVisible();
  await expect(page.locator(".p-deck-region")).toHaveCount(0);
  expect(backend.actions).toEqual([]);
  expect(
    await page.locator('meta[name="robots"]').getAttribute("content"),
  ).toBe("noindex, nofollow");
});

test("mantém as credenciais e sessões do painel e da apresentação separadas", async ({
  page,
  context,
}) => {
  const backend = await mockBackend(context);
  await page.goto("/isg/resultados");
  await page.getByLabel("Credencial administrativa").fill("senha-admin-sintetica");
  await page.getByRole("button", { name: "Acessar painel" }).click();
  await expect(page.getByRole("heading", { name: "Painel Executivo FIB-T" })).toBeVisible();
  expect(backend.scopes).toEqual(["results"]);
  expect(
    await page.evaluate(() =>
      JSON.parse(sessionStorage.getItem("isg_results_session") ?? "null")?.role,
    ),
  ).toBe("admin");

  await page.goto("/isg/apresentacao");
  await expect(page.getByLabel("Credencial administrativa do IFT")).toBeVisible();
  await page
    .getByLabel("Credencial administrativa do IFT")
    .fill("senha-admin-sintetica");
  await page.getByRole("button", { name: "Acessar apresentação" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Não foi possível validar o acesso.",
  );
  expect(backend.scopes).toEqual(["results", "presentation"]);
  expect(await page.locator(".p-deck-region").count()).toBe(0);

  await page.evaluate(() => sessionStorage.removeItem("isg_results_session"));
  await page.goto("/isg/resultados");
  await page.getByLabel("Credencial administrativa").fill("senha-ift-sintetica");
  await page.getByRole("button", { name: "Acessar painel" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Não foi possível validar o acesso.",
  );
  expect(backend.scopes).toEqual(["results", "presentation", "results"]);
});

test("uma sessão local inventada é recusada pelo servidor", async ({
  page,
  context,
}) => {
  const backend = await mockBackend(context);
  backend.valid = false;
  await page.addInitScript(() =>
    sessionStorage.setItem(
      "isg_presentation_session",
      JSON.stringify({ token: "inventado", expiresAt: Date.now() + 60000, role: "ift" }),
    ),
  );
  await page.goto("/isg/apresentacao");
  await expect(page.getByLabel("Credencial administrativa do IFT")).toBeVisible();
  expect(backend.actions).toEqual(["validate-session"]);
});

test("valida acesso sem ler a base e mantém histórico separado da API", async ({
  page,
  context,
}) => {
  const backend = await mockBackend(context);
  await login(page);
  expect(backend.scopes).toEqual(["presentation"]);
  const historical = {
    ...createSyntheticDemo(),
    sourceKind: "historical_report",
    status: "Histórico FICTÍCIO",
    issuedAt: "2026-01-01",
    reviewState: "document_transcription",
  };
  await page.getByLabel("Selecionar arquivo histórico").setInputFiles({
    name: "historico-ficticio.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(historical)),
  });
  await expect(page.locator(".p-source-status")).toContainText("01/01/2026");
  expect(backend.actions).not.toContain("aggregates");
  await go(page, "global");
  await expect(page.locator(".p-deck-region .p-global-number")).toContainText(
    "61,2",
  );
  await page
    .getByRole("button", { name: "Retrato histórico", exact: true })
    .click();
  await page.getByRole("button", { name: "Consultar agregado atual" }).click();
  await expect(page.locator(".p-deck-region .p-global-number")).toContainText(
    "52,6",
  );
  await expect(page.locator(".p-source-status")).toContainText("API congelada");
  expect(backend.actions.filter((s) => s === "aggregates")).toHaveLength(1);
  await go(page, "dominios");
  expect(backend.actions.filter((s) => s === "aggregates")).toHaveLength(1);
});

test("arquivo incompatível é rejeitado e preserva o retrato ativo", async ({
  page,
  context,
}) => {
  await mockBackend(context);
  await demo(page);
  await page
    .getByRole("button", { name: "Demonstração fictícia", exact: true })
    .click();
  await page.getByLabel("Selecionar arquivo histórico").setInputFiles({
    name: "invalido.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      '{"sourceKind":"historical_report","html":"<script>window.bad=true</script>"}',
    ),
  });
  await expect(page.getByRole("alert")).toContainText("Arquivo incompatível");
  await page.getByRole("button", { name: "Fechar aprofundamento" }).click();
  await expect(page.locator(".p-source-switch")).toContainText(
    "Demonstração fictícia",
  );
  expect(await page.evaluate(() => "bad" in window)).toBe(false);
});

test("todos os 20 slides e CTAs funcionam com retorno de foco e pausa de atalhos", async ({
  page,
  context,
}) => {
  await mockBackend(context);
  await demo(page);
  for (const slide of SLIDES.slice(1)) {
    await go(page, slide.id);
    const trigger = page.getByRole("button", { name: slide.cta, exact: true });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const url = page.url();
    await page.keyboard.press("ArrowRight");
    expect(page.url()).toBe(url);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
  }
  await expect(
    page.getByRole("button", { name: "Reiniciar", exact: true }),
  ).toBeVisible();
});

test("teclado, histórico do navegador e compreensão por ação explícita", async ({
  page,
  context,
}) => {
  await mockBackend(context);
  await demo(page);
  await page.locator("#title-abertura").focus();
  await page.keyboard.press("PageDown");
  await expect(page).toHaveURL(/slide=percurso/);
  await page.goBack();
  await expect(page.locator(".p-slide-abertura")).toBeVisible();
  await go(page, "leitura");
  await page.getByRole("button", { name: "Testar minha compreensão" }).click();
  await expect(page.getByText("Não.", { exact: true })).toBeHidden();
  await page.getByRole("button", { name: "Mostrar explicação" }).click();
  await expect(page.getByText("Não.", { exact: true })).toBeVisible();
});

test("supressão retornada pela API não deixa escores disponíveis", async ({
  page,
  context,
}) => {
  const backend = await mockBackend(context);
  backend.suppressed = true;
  await login(page);
  await page.getByRole("button", { name: "Consultar agregado atual" }).click();
  await expect(
    page.getByRole("heading", { name: "Resultados suprimidos nesta fonte" }),
  ).toBeVisible();
  await expect(page.locator(".p-global-number")).toHaveCount(0);
  await expect(page.locator(".p-deck-region")).toHaveCount(0);
});

test("pactuação começa vazia, exige revisão e exporta o rascunho escolhido", async ({
  page,
  context,
}) => {
  await mockBackend(context);
  await demo(page);
  await go(page, "pactuacao");
  await page
    .getByRole("button", { name: "Preparar os próximos passos", exact: true })
    .click();
  await page.getByLabel("Recuperação e condições", { exact: true }).check();
  await expect(page.getByLabel("Ação", { exact: true })).toBeEmpty();
  await page
    .getByLabel("Ação", { exact: true })
    .fill("Testar prioridade semanal fictícia");
  await page.getByLabel("Responsável por função").fill("Coordenação fictícia");
  await expect(
    page.getByRole("button", { name: "Baixar Markdown" }),
  ).toBeDisabled();
  await page.getByLabel("Revisei o rascunho", { exact: false }).check();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Baixar Markdown" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("rascunho-pactuacao.md");
  const stream = await file.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const content = Buffer.concat(chunks).toString("utf8");
  expect(content).toContain("Testar prioridade semanal fictícia");
  expect(content).toContain("Coordenação fictícia");
  expect(content).toContain("A pactuar");
});

test("console sincroniza navegação e é limpo quando a sessão é encerrada", async ({
  page,
  context,
}) => {
  const backend = await mockBackend(context);
  await demo(page);
  const opened = page.waitForEvent("popup");
  await page
    .getByRole("button", {
      name: "Abrir console do representante em outra janela",
    })
    .click();
  const consolePage = await opened;
  await expect(
    consolePage.getByText("Conectado à janela de apresentação", {
      exact: false,
    }),
  ).toBeVisible();
  expect(
    backend.actions.filter((s) => s === "validate-session").length,
  ).toBeGreaterThan(1);
  await consolePage
    .getByRole("button", { name: "Próximo", exact: true })
    .click();
  await expect(page).toHaveURL(/slide=percurso/);
  await expect(consolePage.locator(".p-console-current h2")).toHaveText(
    SLIDES[1].title,
  );
  await consolePage
    .getByRole("button", { name: "Iniciar", exact: true })
    .click();
  await expect(
    consolePage.getByRole("button", { name: "Pausar", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Encerrar sessão administrativa" })
    .click();
  await expect(page.getByLabel("Credencial administrativa do IFT")).toBeVisible();
  await expect(
    consolePage.getByLabel("Credencial administrativa do IFT"),
  ).toBeVisible();
  await expect(consolePage.locator(".p-speaker-notes")).toHaveCount(0);
});

test("fechar console preserva a projeção e pop-up bloqueado oferece notas locais", async ({
  page,
  context,
}) => {
  await mockBackend(context);
  await demo(page);
  const opened = page.waitForEvent("popup");
  await page
    .getByRole("button", {
      name: "Abrir console do representante em outra janela",
    })
    .click();
  await (await opened).close();
  await page
    .getByRole("button", { name: "Próximo slide", exact: true })
    .click();
  await expect(page).toHaveURL(/slide=percurso/);
  await page.evaluate(() => {
    window.open = () => null;
  });
  await page
    .getByRole("button", {
      name: "Abrir console do representante em outra janela",
    })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Notas locais visíveis nesta janela",
  );
});

test("expiração conhecida limpa o retrato e exige nova autenticação", async ({
  page,
  context,
}) => {
  await mockBackend(context);
  await demo(page);
  await page.evaluate(() => {
    const s = JSON.parse(sessionStorage.getItem("isg_presentation_session"));
    s.expiresAt = Date.now() - 1;
    sessionStorage.setItem("isg_presentation_session", JSON.stringify(s));
  });
  await expect(page.getByLabel("Credencial administrativa do IFT")).toBeVisible();
  await expect(page.locator(".p-deck-region")).toHaveCount(0);
});

test("falha temporária de rede preserva apenas o retrato já autorizado", async ({
  page,
  context,
}) => {
  const backend = await mockBackend(context);
  await demo(page);
  backend.offline = true;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Sem confirmação recente de rede" }),
  ).toBeVisible();
  await expect(page.locator(".p-slide-abertura")).toBeVisible();
});

test("leitura móvel, busca integral, impressão e metadados ao sair", async ({
  page,
  context,
}) => {
  await mockBackend(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await demo(page);
  await expect(page.locator(".p-mode-reading")).toBeVisible();
  await page
    .getByRole("button", { name: "Biblioteca de apoio", exact: true })
    .click();
  await page
    .getByRole("button", { name: "As 32 questões", exact: true })
    .click();
  await expect(page.getByRole("dialog").locator("tbody tr")).toHaveCount(32);
  await page.getByRole("searchbox").fill("Q24");
  await expect(page.getByRole("dialog").locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "Fechar aprofundamento" }).click();
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".p-print-only")).toBeVisible();
  await expect(page.locator(".p-speaker-notes")).toHaveCount(0);
  await page.emulateMedia({ media: "screen" });
  await page.getByRole("button", { name: "Preferências de movimento" }).count();
  await page.locator(".p-preferences summary").click();
  await page
    .getByRole("link", { name: "Voltar ao painel administrativo" })
    .click();
  await expect(page).toHaveURL(/isg\/resultados/);
});
