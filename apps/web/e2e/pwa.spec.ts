import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:8080';

test.describe('PWA Bloco de Notas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('PWA carrega corretamente', async ({ page }) => {
    await expect(page).toHaveTitle(/Bloco de Notas PWA/);
    await expect(page.locator('[data-testid="notes-list"]')).toBeVisible();
  });

  test('Criar nova nota', async ({ page }) => {
    await page.click('[data-testid="new-note-btn"]');
    await page.fill('[data-testid="title-input"]', 'Minha Primeira Nota');
    await page.fill('[data-testid="content-input"]', 'Conteúdo da nota de teste');
    
    await expect(page.locator('[data-testid="title-input"]')).toHaveValue('Minha Primeira Nota');
    await expect(page.locator('[data-testid="content-input"]')).toHaveValue('Conteúdo da nota de teste');
  });

  test('Buscar notas', async ({ page }) => {
    // Criar uma nota
    await page.click('[data-testid="new-note-btn"]');
    await page.fill('[data-testid="title-input"]', 'Nota de Busca');
    await page.fill('[data-testid="content-input"]', 'Conteúdo para busca');
    
    // Buscar
    await page.fill('[data-testid="search-input"]', 'Busca');
    await expect(page.locator('[data-testid="notes-list"] li')).toContainText('Nota de Busca');
  });

  test('Status de sincronização visível', async ({ page }) => {
    await expect(page.locator('[data-testid="sync-status"]')).toBeVisible();
  });

  test('Exportar nota como TXT', async ({ page }) => {
    await page.click('[data-testid="new-note-btn"]');
    await page.fill('[data-testid="title-input"]', 'Nota Export');
    await page.fill('[data-testid="content-input"]', 'Conteúdo para export');
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="export-txt-btn"]')
    ]);
    
    expect(download.suggestedFilename()).toContain('.txt');
  });
});

