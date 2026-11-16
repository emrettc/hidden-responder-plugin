// Sayfadan gelen blok listesini yerel masaüstü uygulamasına iletir.
// Port, config.json içindeki "port" ile aynı olmalı (manifest.json'da da geçiyor).
const ENDPOINT = "http://127.0.0.1:8765/blocks";

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!msg || msg.type !== "blocks") return;
  fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tab: sender.tab ? sender.tab.id : 0, items: msg.items }),
  }).catch(() => {}); // uygulama kapalıysa sessizce geç
});
