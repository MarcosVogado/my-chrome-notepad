// Content script opcional para futuras evoluções
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "PING_CONTENT") {
    sendResponse({ ok: true, url: location.href });
  }
});
