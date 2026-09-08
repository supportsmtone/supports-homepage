/* 써포츠 홈페이지 접속 현황 비콘 (2026-09-06)
 * - 페이지 로드 1회당 1 페이지뷰. 방문자 id(localStorage, 1년) / 세션 id(sessionStorage) 로 서버가 방문자·세션 집계.
 * - 개인정보 없음(IP·이름 미수집). 봇은 서버 UA 필터. 실패해도 페이지 동작에 영향 없음.
 */
(function () {
  try {
    var ENDPOINT = "https://asia-northeast3-supports3-adcf5.cloudfunctions.net/hpTrack";
    function uid() {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      var s = "", c = "abcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < 24; i++) s += c.charAt(Math.floor(Math.random() * c.length));
      return "v-" + s;
    }
    var vid = null, sid = null;
    try { vid = localStorage.getItem("hp_vid"); if (!vid) { vid = uid(); localStorage.setItem("hp_vid", vid); } } catch (e) { vid = uid(); }
    try { sid = sessionStorage.getItem("hp_sid"); if (!sid) { sid = uid(); sessionStorage.setItem("hp_sid", sid); } } catch (e) { sid = uid(); }
    var payload = JSON.stringify({
      page: location.pathname,
      ref: document.referrer || "",
      vid: vid,
      sid: sid,
      lang: (navigator.language || "").slice(0, 8)
    });
    var sent = false;
    if (navigator.sendBeacon) {
      try { sent = navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "text/plain" })); } catch (e) { sent = false; }
    }
    if (!sent && window.fetch) {
      fetch(ENDPOINT, { method: "POST", mode: "cors", keepalive: true, headers: { "Content-Type": "text/plain" }, body: payload }).catch(function () {});
    }
  } catch (e) { /* no-op */ }
})();
