// Sayfada hiçbir şeyi değiştirmez. Görünen metin bloklarını bulur ve her
// bloğun son satırının bittiği noktanın EKRAN konumunu masaüstü uygulamasına
// bildirir; "+" işaretini sayfa değil masaüstü uygulaması çizer.
(() => {
  const BLOCK =
    "p,li,h1,h2,h3,h4,h5,h6,blockquote,td,th,dd,dt,figcaption,label,legend,pre,div,article,section";
  const MIN_CHARS = 12;
  const MAX_ITEMS = 80;
  const MAX_TEXT = 3000;

  let origin = null; // görüntü alanının ekrandaki başlangıcı (CSS pikseli)
  let candidates = [];
  let dirty = true;
  let scheduled = false;
  let alive = true;

  addEventListener(
    "mousemove",
    (e) => {
      origin = { x: e.screenX - e.clientX, y: e.screenY - e.clientY };
    },
    { passive: true, capture: true }
  );

  function getOrigin() {
    if (origin) return origin;
    // Fare henüz sayfada gezmediyse yaklaşık hesap
    const border = Math.max(0, (outerWidth - innerWidth) / 2);
    return { x: screenX + border, y: screenY + (outerHeight - innerHeight) - border };
  }

  function collect() {
    candidates = [];
    for (const el of document.querySelectorAll(BLOCK)) {
      if (el.querySelector(BLOCK)) continue; // yalnızca en içteki bloklar
      if ((el.textContent || "").trim().length < MIN_CHARS) continue;
      candidates.push(el);
    }
    dirty = false;
  }

  function send(items) {
    if (!alive) return;
    try {
      chrome.runtime.sendMessage({ type: "blocks", items }).catch(() => {});
    } catch (_) {
      alive = false; // eklenti yeniden yüklendi; sayfa yenilenince düzelir
    }
  }

  function scan() {
    scheduled = false;
    if (document.visibilityState !== "visible") return send([]);
    if (dirty) collect();

    const o = getOrigin();
    const dpr = devicePixelRatio || 1;
    const items = [];
    const range = document.createRange();

    for (const el of candidates) {
      if (items.length >= MAX_ITEMS) break;
      if (!el.isConnected) continue;
      const box = el.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight || box.width === 0) continue;

      range.selectNodeContents(el);
      const rects = range.getClientRects();
      let last = null;
      for (let i = rects.length - 1; i >= 0; i--) {
        if (rects[i].width > 1 && rects[i].height > 1) {
          last = rects[i];
          break;
        }
      }
      if (!last) continue;

      const cy = last.top + last.height / 2;
      const px = Math.max(0, last.right - 2);
      if (cy < 0 || cy > innerHeight || px > innerWidth) continue;

      // Başka bir öğenin altında ya da kaydırma alanının dışında mı?
      const top = document.elementFromPoint(px, cy);
      if (!top || !el.contains(top)) continue;

      const text = (el.innerText || "").trim().slice(0, MAX_TEXT);
      if (text.length < MIN_CHARS) continue;

      items.push({
        x: (last.right + 4 + o.x) * dpr,
        y: (cy + o.y) * dpr,
        text,
      });
    }
    send(items);
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(scan, 80);
  }

  addEventListener("scroll", schedule, { passive: true, capture: true });
  addEventListener("resize", schedule, { passive: true });
  document.addEventListener("visibilitychange", schedule);
  new MutationObserver(() => {
    dirty = true;
    schedule();
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  setInterval(schedule, 1000); // canlılık sinyali; uygulama 2,5 sn sonra eskiyeni siler
  schedule();
})();
