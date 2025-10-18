import { test, expect, type BrowserContext } from '@playwright/test';

test.describe('Chrome Extension Tests', () => {
  test('should open popup and verify content', async ({ browser }) => {
    // Cria um novo contexto para o teste
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Obtém a URL do popup da extensão
    const extensionId = await getExtensionId(context);
    const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
    
    // Navega para o popup da extensão
    await page.goto(popupUrl);
    
    // Verifica se o popup carregou corretamente
    await expect(page.locator('h1')).toContainText('Notepad');
    
    // Verifica se os elementos principais estão presentes
    await expect(page.locator('textarea')).toBeVisible();
  });
  
  test('should interact with content script', async ({ browser }) => {
    // Cria um novo contexto para o teste
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Obtém o ID da extensão
    const extensionId = await getExtensionId(context);
    
    // Cria uma nova página para testar o content script
    await page.goto('https://example.com');
    
    // Verifica se o content script foi injetado corretamente
    const hasContentScript = await page.evaluate(() => {
      return typeof (window as any).myChromeNotepad !== 'undefined' || 
             document.querySelector('[data-extension="my-chrome-notepad"]') !== null;
    });
    
    expect(hasContentScript).toBeTruthy();
  });
});

// Função auxiliar para obter o ID da extensão
async function getExtensionId(context: BrowserContext): Promise<string> {
  // Método 1: Tentar obter das páginas de background já abertas
  const backgroundPages = context.backgroundPages();
  if (backgroundPages.length > 0) {
    const url = backgroundPages[0].url();
    const match = url.match(/chrome-extension:\/\/([^/]+)/);
    if (match) return match[1];
  }
  
  // Método 2: Esperar por um evento de página de background
  try {
    const backgroundPage = await context.waitForEvent('backgroundpage', { timeout: 5000 });
    const url = backgroundPage.url();
    const match = url.match(/chrome-extension:\/\/([^/]+)/);
    if (match) return match[1];
  } catch (e) {
    console.log('Timeout esperando pela página de background');
  }
  
  // Método 3: Tentar obter via service worker
  const workers = context.serviceWorkers();
  if (workers.length > 0) {
    const url = workers[0].url();
    const match = url.match(/chrome-extension:\/\/([^/]+)/);
    if (match) return match[1];
  }
  
  throw new Error('Não foi possível obter o ID da extensão');
}