import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function expectInstitutionalPdf(path: string) {
  const bytes = await readFile(path);
  const source = bytes.toString("latin1");
  expect(source.startsWith("%PDF-")).toBe(true);
  expect(source.match(/\/Type\s*\/Page\b/g)).toHaveLength(4);
  for (const url of [
    "https://felicidadeparatodos.com.br/",
    "https://felicidadeparatodos.com.br/#contato",
    "https://instagram.com/felicidadeparatodosbr",
    "https://turmadobem.org.br/dentista-do-bem/",
  ]) expect(source).toContain(`/URI (${url})`);
  expect((source.match(/\/Subtype\s*\/Image\b/g) ?? []).length).toBeGreaterThanOrEqual(3);
}


const institutionalUrls = [
  "https://felicidadeparatodos.com.br/",
  "https://felicidadeparatodos.com.br/#contato",
  "https://instagram.com/felicidadeparatodosbr",
  "https://turmadobem.org.br/dentista-do-bem/",
];

async function expectInstitutionalPage(page: import("@playwright/test").Page) {
  const header = page.locator(".tdb-header");
  const footer = page.locator(".tdb-institutional-footer");
  for (const name of ["Instituto Felicidade para Todos", "Turma do Bem"]) {
    const logo = header.getByRole("img", { name, exact: true });
    await expect(logo).toBeVisible();
    await expect(logo).toHaveJSProperty("complete", true);
    const geometry = await logo.evaluate((image: HTMLImageElement) => {
      const bounds = image.getBoundingClientRect();
      return { naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
        width: bounds.width, height: bounds.height, local: new URL(image.src).origin === window.location.origin };
    });
    expect(geometry.naturalWidth).toBeGreaterThan(0);
    expect(geometry.naturalHeight).toBeGreaterThan(0);
    expect(geometry.local).toBe(true);
    expect(Math.abs((geometry.width / geometry.height) / (geometry.naturalWidth / geometry.naturalHeight) - 1)).toBeLessThan(.02);
  }
  await expect(footer).toContainText("Organização de impacto social com a missão de ativar e animar ecossistemas sustentáveis de felicidade humana, socioambiental e organizacional.");
  await expect(footer).toContainText("Impact HUB Brasília");
  await expect(footer).toContainText("SGAN 601");
  await expect(footer).toContainText("Ed. Íon");
  await expect(footer).toContainText("@felicidadeparatodosbr");
  for (const url of institutionalUrls) {
    const links = footer.locator(`a[href="${url}"]`);
    expect(await links.count()).toBeGreaterThan(0);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
      await expect(link).toHaveAttribute("rel", /noreferrer/);
      const box = await link.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }
  }
  for (const target of await header.locator("a, button").all()) {
    const box = await target.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.x).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
  }
}

for (const width of [320, 360, 390, 768, 1366]) {
  test(`landing and question have no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/turma-do-bem/fib-a");
    await expect(page.getByRole("heading", { name: /Cuidar do outro/ })).toBeVisible();
    await expectInstitutionalPage(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "Começar minha reflexão" }).click();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Ir para as perguntas" }).click();
    await expect(page.getByRole("radio")).toHaveCount(5);
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Continuar", exact: true })).toHaveCount(0);
    await expect(page.getByText(/Ao tocar em uma resposta, você avança automaticamente/)).toBeVisible();
    await page.getByRole("radio", { name: "Discordo totalmente", exact: true }).click();
    await expect(page.getByText("Pergunta 2 de 29", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/fiba-question-${width}.png`, fullPage: true });
  });
}

test("institutional links open a separate tab and preserve the student's current answers", async ({ page, context }) => {
  await context.route(/^https:\/\/felicidadeparatodos\.com\.br\//, route => route.fulfill({
    status: 200, contentType: "text/html", body: "<!doctype html><title>Contato institucional</title><p>Destino de teste</p>",
  }));
  await page.goto("/turma-do-bem/fib-a");
  await page.getByRole("button", { name: "Começar minha reflexão" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Ir para as perguntas" }).click();
  await page.getByRole("radio", { name: "Discordo totalmente", exact: true }).click();
  await expect(page.getByText("Pergunta 2 de 29", { exact: true })).toBeVisible();
  const popupPromise = page.waitForEvent("popup");
  await page.locator('.tdb-institutional-footer a[href="https://felicidadeparatodos.com.br/#contato"]').click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL("https://felicidadeparatodos.com.br/#contato");
  await popup.close();
  await expect(page.getByText("Pergunta 2 de 29", { exact: true })).toBeVisible();
  await expect(page.getByText("1 respondida", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page.getByRole("radio", { checked: true })).toHaveValue("0");
});

test("going back preserves the response and reselecting it advances exactly once", async ({ page }) => {
  await page.goto("/turma-do-bem/fib-a");
  await page.getByRole("button", { name: "Começar minha reflexão" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Ir para as perguntas" }).click();
  await page.getByRole("radio", { name: "Discordo totalmente", exact: true }).click();
  await expect(page.getByText("Pergunta 2 de 29", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page.getByRole("radio", { checked: true })).toHaveValue("0");
  await page.getByRole("radio", { name: "Discordo totalmente", exact: true }).click();
  await expect(page.getByText("Pergunta 2 de 29", { exact: true })).toBeVisible();
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
});

test("keyboard arrows explore choices, while Enter and space confirm and advance", async ({ page }) => {
  await page.goto("/turma-do-bem/fib-a");
  await page.getByRole("button", { name: "Começar minha reflexão" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Ir para as perguntas" }).click();
  await page.getByRole("radio").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { checked: true })).toHaveValue("1");
  // Wait longer than the transition to prove an arrow does not start it.
  await page.waitForTimeout(350);
  await expect(page.getByText("Pergunta 1 de 29", { exact: true })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Pergunta 2 de 29", { exact: true })).toBeVisible();
  await page.getByRole("radio").nth(2).focus();
  await page.keyboard.press("Space");
  await expect(page.getByText("Pergunta 3 de 29", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
});

test("a rapid double click records only one answer and does not skip a question", async ({ page }) => {
  await page.goto("/turma-do-bem/fib-a");
  await page.getByRole("button", { name: "Começar minha reflexão" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Ir para as perguntas" }).click();
  await page.getByRole("radio", { name: "Concordo totalmente", exact: true }).dblclick({ delay: 30 });
  await expect(page.getByText("Pergunta 2 de 29", { exact: true })).toBeVisible();
  await page.waitForTimeout(350);
  await expect(page.getByText("Pergunta 2 de 29", { exact: true })).toBeVisible();
  await expect(page.getByText("1 respondida", { exact: true })).toBeVisible();
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
});

test("mobile complete flow computes the result and PDF locally after explicit review", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let scoringRequests = 0;
  let externalBrandRequests = 0;
  await page.route(/^https:\/\/(?:www\.)?(?:felicidadeparatodos\.com\.br|turmadobem\.org\.br)\//, async route => {
    externalBrandRequests++;
    await route.abort("failed");
  });
  await page.route("**/functions/v1/fiba-student-score", async route => {
    scoringRequests++;
    await route.abort("failed");
  });
  await page.goto("/turma-do-bem/fib-a");
  await page.getByRole("button", { name: "Começar minha reflexão" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Ir para as perguntas" }).click();
  for (let i = 1; i <= 29; i++) {
    await expect(page.getByText(`Pergunta ${i} de 29`, { exact: true })).toBeVisible();
    await page.getByRole("radio", { name: /Não concordo e nem discordo/ }).click();
  }
  await expect(page.getByRole("heading", { name: "Um último olhar." })).toBeVisible();
  await page.getByRole("button", { name: "Editar resposta da pergunta 14", exact: true }).click();
  await expect(page.getByRole("radio", { checked: true })).toHaveValue("2");
  // Clicking the already selected option also confirms and returns to review.
  await page.getByRole("radio", { name: /Não concordo e nem discordo/ }).click();
  await expect(page.getByRole("heading", { name: "Um último olhar." })).toBeVisible();
  // Choosing the 29th answer and editing do not submit or display a result.
  await expect(page.getByRole("button", { name: "Baixar meu PDF" })).toHaveCount(0);
  expect(scoringRequests).toBe(0);
  await page.getByRole("button", { name: "Confirmar e ver meu resultado" }).click();
  await expect(page.locator(".tdb-score-ring strong")).toHaveText("50,0");
  expect(scoringRequests).toBe(0);
  await expect(page.locator(".tdb-domain-grid article")).toHaveCount(9);
  await expect(page.locator(".tdb-demo-banner")).toHaveCount(0);
  await page.getByText("Como este resultado foi calculado", { exact: true }).click();
  await expect(page.locator(".tdb-method-details")).toContainText("Cálculo neste dispositivo");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Baixar meu PDF" }).click();
  const pdf = await download; expect(pdf.suggestedFilename()).toBe("relatorio-fib-a-turma-do-bem.pdf");
  await pdf.saveAs("/tmp/fiba-contract-result.pdf");
  await expectInstitutionalPdf("/tmp/fiba-contract-result.pdf");
  expect(externalBrandRequests).toBe(0);
  await page.screenshot({ path: "/tmp/fiba-result-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Encerrar e limpar minha sessão" }).click();
  await expect(page.getByRole("heading", { name: /Cuidar do outro/ })).toBeVisible();
});

test("preview PDF and QR are explicit, downloadable and route-specific", async ({ page }) => {
  await page.goto("/turma-do-bem/fib-a");
  await expect(page.getByRole("heading", { name: /Cuidar do outro/ })).toBeVisible();
  await page.screenshot({ path: "/tmp/fiba-landing-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Compartilhar acesso" }).click();
  await expect(page.getByRole("img", { name: /QR Code de acesso/ })).toBeVisible();
  await expect(page.locator(".tdb-qr-url")).toContainText("/turma-do-bem/fib-a");
  const qrDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Baixar QR SVG" }).click();
  await (await qrDownload).saveAs("/tmp/fiba-preview-qr.svg");
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await page.getByRole("button", { name: /Conhecer um resultado/ }).click();
  await expect(page.locator(".tdb-demo-banner")).toContainText("dados sintéticos");
  const previewDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Baixar meu PDF" }).click();
  const file = await previewDownload; expect(file.suggestedFilename()).toContain("demonstracao");
  await file.saveAs("/tmp/fiba-demo.pdf");
  await expectInstitutionalPdf("/tmp/fiba-demo.pdf");
  await page.screenshot({ path: "/tmp/fiba-result-desktop.png", fullPage: true });
});
