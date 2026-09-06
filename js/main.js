/* 써포츠 홈페이지 v3 — 공통 스크립트 (의존성 없음) */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  // 1) 헤더 스크롤 상태
  var header = document.querySelector(".header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // 2) 현재 페이지 네비 하이라이트
  var current = document.body.getAttribute("data-nav");
  if (current) {
    var links = document.querySelectorAll("[data-nav-link]");
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute("data-nav-link") === current) {
        links[i].classList.add("is-current");
        links[i].setAttribute("aria-current", "page");
      }
    }
  }

  // 3) 모바일 메뉴
  var toggle = document.getElementById("menuToggle");
  var menu = document.getElementById("mobileMenu");
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.addEventListener("click", function (e) {
      if (e.target && e.target.tagName === "A") closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  // 4) 스크롤 리빌 (IntersectionObserver 미지원 시 전부 표시)
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        for (var j = 0; j < entries.length; j++) {
          if (entries[j].isIntersecting) {
            entries[j].target.classList.add("is-in");
            io.unobserve(entries[j].target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    for (var k = 0; k < reveals.length; k++) io.observe(reveals[k]);
  } else {
    for (var m = 0; m < reveals.length; m++) reveals[m].classList.add("is-in");
  }

  // 안전장치: 어떤 환경에서도 콘텐츠가 숨은 채 남지 않도록 2.5초 후 전부 표시
  setTimeout(function () {
    for (var n = 0; n < reveals.length; n++) reveals[n].classList.add("is-in");
  }, 2500);

  // 5) 문의/제안 모달
  var contactModal = document.getElementById("contactModal");
  var contactOpen = document.getElementById("contactOpen");
  function closeContact() {
    if (contactModal) contactModal.classList.remove("is-open");
  }
  if (contactModal && contactOpen) {
    contactOpen.addEventListener("click", function (e) {
      e.preventDefault();
      contactModal.classList.add("is-open");
      var btn = contactModal.querySelector("[data-modal-close]");
      if (btn) btn.focus();
    });
    contactModal.addEventListener("click", function (e) {
      if (e.target === contactModal) closeContact();
    });
    var closers = contactModal.querySelectorAll("[data-modal-close]");
    for (var c = 0; c < closers.length; c++) {
      closers[c].addEventListener("click", closeContact);
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeContact();
    });
  }

  // 6) 탭 컴포넌트 (groups 대진표 3종)
  var tabsRoot = document.querySelector("[data-tabs]");
  if (tabsRoot) {
    var btns = tabsRoot.querySelectorAll(".tabs__btn");
    var panels = tabsRoot.querySelectorAll(".tabs__panel");
    function select(idx) {
      for (var b = 0; b < btns.length; b++) {
        var on = b === idx;
        btns[b].setAttribute("aria-selected", String(on));
        btns[b].setAttribute("tabindex", on ? "0" : "-1");
        if (panels[b]) panels[b].hidden = !on;
      }
      btns[idx].focus();
    }
    for (var t = 0; t < btns.length; t++) {
      (function (idx) {
        btns[idx].addEventListener("click", function () {
          select(idx);
        });
        btns[idx].addEventListener("keydown", function (e) {
          if (e.key === "ArrowRight") select((idx + 1) % btns.length);
          if (e.key === "ArrowLeft")
            select((idx - 1 + btns.length) % btns.length);
        });
      })(t);
    }
  }

  // 7) 유튜브 최신 영상 로드 (홈 5개 / 대회탭 20개)
  var videoRoot = document.querySelector("[data-videos]");
  if (videoRoot) {
    var limit = parseInt(videoRoot.getAttribute("data-videos"), 10) || 5;
    var STATS = "https://supportsmt.com/hp-stats/videos.json";
    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }
    function card(v) {
      var dur = v.duration ? '<span class="video-card__dur">' + esc(v.duration) + "</span>" : "";
      var meta = [];
      if (v.viewCount > 0) meta.push("조회수 " + esc(v.viewCompact));
      if (v.publishedAt) meta.push(esc(v.publishedAt));
      return (
        '<a class="video-card" href="' + esc(v.url) + '" target="_blank" rel="noopener">' +
        '<div class="video-card__thumb">' +
        '<img src="' + esc(v.thumbnail) + '" alt="' + esc(v.title) + '" loading="lazy" ' +
        'onerror="this.onerror=null;this.src=\'https://i.ytimg.com/vi/' + esc(v.id) + '/hqdefault.jpg\'">' +
        '<span class="video-card__play"><span></span></span>' + dur + "</div>" +
        '<div class="video-card__body"><p class="video-card__title">' + esc(v.title) + "</p>" +
        '<p class="video-card__meta">' + meta.join(" · ") + "</p></div></a>"
      );
    }
    var ctrl = new AbortController();
    var to = setTimeout(function () { ctrl.abort(); }, 8000);
    fetch(STATS + "?cb=" + Date.now(), { signal: ctrl.signal })
      .then(function (r) { clearTimeout(to); if (!r.ok) throw 0; return r.json(); })
      .then(function (d) {
        var vids = (d && d.videos) || [];
        if (!vids.length) throw 0;
        videoRoot.innerHTML = vids.slice(0, limit).map(card).join("");
      })
      .catch(function () {
        videoRoot.innerHTML =
          '<div class="video-empty">영상을 불러오지 못했습니다. ' +
          '<a href="https://www.youtube.com/channel/UCSKQ8RcZ2vwnTKWcPR5_VtA" target="_blank" rel="noopener" style="color:var(--violet);font-weight:700;">유튜브 채널에서 보기 →</a></div>';
      });
  }

})();
