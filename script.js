/* ==========================================================
   Hasita Mandaleeka — Portfolio
   Plain JavaScript, no dependencies.
   ========================================================== */
(function () {
  "use strict";

  var CONTACT_EMAIL = "hasitamandalika@gmail.com";
  var STORAGE_KEY = "hm-stars-v2";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* The 7 stars are the 7 fun facts (from plan.md). */
  var FACTS = [
    {
      emoji: "💡",
      title: "A Little Entrepreneurial Spirit",
      body: "I'm a candidate for the Bergeron Entrepreneurs in Science and Technology (BEST) certificate at York University, where I've led 3 course-project ventures and learned what works (and what doesn't) firsthand."
    },
    {
      emoji: "🏦",
      title: "A Glimpse Into the Business World",
      body: "At Scotiabank, I saw both the technical and business sides of anti-money laundering, working with the AI/ML Research team and building a developer productivity dashboard."
    },
    {
      emoji: "🧠",
      title: "Apparently, I'm an INTP-T",
      body: "16Personalities calls me a “Logician”: an introverted thinker who loves asking questions and occasionally overthinks everything."
    },
    {
      emoji: "💻",
      title: "My Interest in Tech Started Early",
      body: "Before university, I completed an Information Technology Specialist High Skills Major (SHSM) alongside my Ontario Secondary School Diploma."
    },
    {
      emoji: "🌍",
      title: "Two Years of Making an Impact",
      body: "I spent two years as an Events Lead with Doctors Without Borders at York University, organizing events and supporting the club's initiatives."
    },
    {
      emoji: "🔬",
      title: "Research Before University",
      body: "My research started in high school: as a Research Assistant at York University, I contributed to a paper on how effective face masks were during the pandemic."
    },
    {
      emoji: "🛷",
      title: "Built to Race",
      body: "I was part of YorkU's GNCTR team, where we built a concrete toboggan to race."
    }
  ];

  /* ---------- Small storage helpers (storage may be blocked) ---------- */

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.found)) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ found: found }));
    } catch (e) { /* ignore */ }
  }

  function clearState() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  /* ---------- Footer year ---------- */

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Mobile nav ---------- */

  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.getElementById("nav-links");

  function closeNav() {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeNav();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navLinks.classList.contains("is-open")) {
      closeNav();
      navToggle.focus();
    }
  });

  /* ---------- Active nav link + scroll reveal ---------- */

  var sections = Array.prototype.slice.call(document.querySelectorAll("main .section"));
  var navAnchors = Array.prototype.slice.call(navLinks.querySelectorAll("a"));

  function setActive(id) {
    navAnchors.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window) {
    var activeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { activeObserver.observe(s); });

    if (!reduceMotion) {
      var revealTargets = document.querySelectorAll(".section-title, .prose, .panel, .status-panel");
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px" });
      Array.prototype.forEach.call(revealTargets, function (el) {
        el.classList.add("reveal");
        revealObserver.observe(el);
      });
    }
  }

  /* ---------- Theme toggle: space <-> Mars ---------- */

  var themeToggle = document.getElementById("theme-toggle");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    var mars = theme === "mars";
    if (mars) document.documentElement.setAttribute("data-theme", "mars");
    else document.documentElement.removeAttribute("data-theme");
    themeToggle.setAttribute("aria-pressed", mars ? "true" : "false");
    themeToggle.setAttribute("aria-label", mars ? "Switch to space theme" : "Switch to Mars theme");
    if (themeMeta) themeMeta.setAttribute("content", mars ? "#170806" : "#070b17");
    document.dispatchEvent(new CustomEvent("themechange"));
  }

  applyTheme(document.documentElement.getAttribute("data-theme") === "mars" ? "mars" : "space");

  themeToggle.addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "mars" ? "space" : "mars";
    applyTheme(next);
    try { window.localStorage.setItem("hm-theme", next); } catch (e) { /* ignore */ }
    themeToggle.classList.remove("is-switching");
    void themeToggle.offsetWidth;
    themeToggle.classList.add("is-switching");
  });

  /* ---------- Star background ---------- */

  (function starfield() {
    var canvas = document.getElementById("starfield");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var stars = [];
    var w = 0, h = 0, dpr = 1;
    var rafId = null;
    var tint = "#9be7f4";

    function readTint() {
      var v = getComputedStyle(document.documentElement).getPropertyValue("--starfield-tint").trim();
      tint = v || "#9be7f4";
    }

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round((w * h) / 7000);
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() < 0.9 ? Math.random() * 0.9 + 0.3 : Math.random() * 0.8 + 1.1,
          base: Math.random() * 0.5 + 0.25,
          speed: Math.random() * 0.0015 + 0.0005,
          phase: Math.random() * Math.PI * 2,
          tint: Math.random() < 0.12
        });
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = reduceMotion ? s.base : s.base + Math.sin(t * s.speed + s.phase) * 0.22;
        ctx.globalAlpha = Math.max(0.05, Math.min(1, a));
        ctx.fillStyle = s.tint ? tint : "#ffffff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function loop(t) {
      draw(t);
      rafId = window.requestAnimationFrame(loop);
    }

    function start() {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = null;
      if (reduceMotion) draw(0);
      else rafId = window.requestAnimationFrame(loop);
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () { build(); start(); }, 150);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (rafId) window.cancelAnimationFrame(rafId);
        rafId = null;
      } else {
        start();
      }
    });

    document.addEventListener("themechange", function () {
      readTint();
      if (reduceMotion) draw(0);
    });

    readTint();
    build();
    start();
  })();

  /* ==========================================================
     Secret Constellation: 7 twinkling stars, each a fun fact
     ========================================================== */

  var saved = loadState();
  var found = saved ? saved.found.filter(function (n) { return n >= 0 && n < 7; }) : [];

  var stars = Array.prototype.slice.call(document.querySelectorAll("#sky .star[data-star]"));
  var oracle = document.getElementById("oracle");
  var discovery = document.getElementById("discovery");
  var discoveryNum = document.getElementById("discovery-num");
  var progress = document.getElementById("progress");
  var progressFill = document.getElementById("progress-fill");
  var motto = document.getElementById("motto");

  var dialog = document.getElementById("fact-dialog");
  var factKicker = document.getElementById("fact-kicker");
  var factTitle = document.getElementById("fact-title");
  var factBody = document.getElementById("fact-body");

  /* Gold lines tracing the H, drawn once all 7 stars are found */
  var skyLines = document.getElementById("sky-lines");
  var H_EDGES = [[0, 1], [1, 2], [4, 5], [5, 6], [1, 3], [3, 5]];
  var linesDrawn = false;
  var drawAfterClose = false;

  function starPos(idx) {
    var btn = stars.filter(function (b) { return Number(b.getAttribute("data-star")) === idx; })[0];
    return {
      x: parseFloat(btn.style.getPropertyValue("--x")),
      y: parseFloat(btn.style.getPropertyValue("--y"))
    };
  }

  function drawLines(animate) {
    var w = skyLines.clientWidth || 1;
    var h = skyLines.clientHeight || 1;
    skyLines.setAttribute("viewBox", "0 0 " + w + " " + h);
    skyLines.textContent = "";
    H_EDGES.forEach(function (e, i) {
      var a = starPos(e[0]);
      var b = starPos(e[1]);
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("class", "sky-line");
      line.setAttribute("x1", a.x / 100 * w); line.setAttribute("y1", a.y / 100 * h);
      line.setAttribute("x2", b.x / 100 * w); line.setAttribute("y2", b.y / 100 * h);
      line.setAttribute("pathLength", "1");
      line.style.setProperty("--delay", (i * 0.25) + "s");
      skyLines.appendChild(line);
    });
    skyLines.classList.toggle("is-drawing", !!animate && !reduceMotion);
    linesDrawn = true;
  }

  var linesResizeTimer;
  window.addEventListener("resize", function () {
    if (!linesDrawn) return;
    window.clearTimeout(linesResizeTimer);
    linesResizeTimer = window.setTimeout(function () { drawLines(false); }, 120);
  });

  function clearLines() {
    skyLines.textContent = "";
    skyLines.classList.remove("is-drawing");
    linesDrawn = false;
  }

  function render() {
    var n = found.length;
    stars.forEach(function (btn) {
      var idx = Number(btn.getAttribute("data-star"));
      var isFound = found.indexOf(idx) !== -1;
      btn.classList.toggle("is-found", isFound);
      btn.setAttribute("aria-label", isFound
        ? "Star " + (idx + 1) + ", discovered: " + FACTS[idx].title
        : "Undiscovered star");
    });
    discovery.hidden = n === 0;
    discoveryNum.textContent = String(n);
    progress.setAttribute("aria-valuenow", String(n));
    progressFill.style.width = (n / 7 * 100) + "%";
    motto.hidden = n < 7;
    if (n < 7) { clearLines(); drawAfterClose = false; }
    else if (!linesDrawn && !drawAfterClose) drawLines(false);
  }

  function openFact(idx, isNew) {
    var n = found.length;
    factKicker.textContent = isNew ? "Star discovered · " + n + "/7" : "Star " + (idx + 1) + " · discovered";
    factTitle.textContent = FACTS[idx].title + " " + FACTS[idx].emoji;
    factBody.textContent = FACTS[idx].body;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeFact() {
    if (typeof dialog.close === "function") dialog.close();
    else { dialog.removeAttribute("open"); dialog.dispatchEvent(new Event("close")); }
  }

  /* Click anywhere (inside the message or on the backdrop) to exit. Esc also works. */
  dialog.addEventListener("click", closeFact);
  dialog.addEventListener("close", function () {
    if (drawAfterClose) {
      drawAfterClose = false;
      drawLines(true);
    }
  });

  stars.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var idx = Number(btn.getAttribute("data-star"));
      var isNew = found.indexOf(idx) === -1;
      if (isNew) {
        found.push(idx);
        saveState();
        if (found.length === 7) drawAfterClose = true;
        render();
        btn.classList.remove("is-flash");
        void btn.offsetWidth; // restart animation
        btn.classList.add("is-flash");
        window.setTimeout(function () { btn.classList.remove("is-flash"); }, 700);
      }
      openFact(idx, isNew);
    });
  });

  /* Stones: look like stars, never twinkle, and vanish when clicked */
  var stones = Array.prototype.slice.call(document.querySelectorAll("#sky .stone"));
  var stoneMsg = document.getElementById("stone-msg");
  var stoneTimer;

  stones.forEach(function (btn) {
    btn.setAttribute("aria-label", "Undiscovered star");
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-vanishing")) return;
      stoneMsg.style.setProperty("--x", btn.style.getPropertyValue("--x"));
      stoneMsg.style.setProperty("--y", btn.style.getPropertyValue("--y"));
      stoneMsg.textContent = "Not a star, this is a stone. Try again!";
      stoneMsg.classList.add("is-shown");
      btn.classList.add("is-vanishing");
      btn.setAttribute("aria-hidden", "true");
      btn.tabIndex = -1;
      window.setTimeout(function () { btn.classList.add("is-gone"); }, 900);
      window.clearTimeout(stoneTimer);
      stoneTimer = window.setTimeout(function () {
        stoneMsg.classList.remove("is-shown");
      }, 2200);
    });
  });

  function restoreStones() {
    stones.forEach(function (btn) {
      btn.classList.remove("is-vanishing", "is-gone");
      btn.removeAttribute("aria-hidden");
      btn.removeAttribute("tabindex");
    });
    stoneMsg.classList.remove("is-shown");
  }

  document.getElementById("reset-btn").addEventListener("click", function () {
    found = [];
    clearState();
    restoreStones();
    render();
  });

  /* Write the oracle line on when it scrolls into view */
  if ("IntersectionObserver" in window && !reduceMotion) {
    var oracleObserver = new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) {
        oracle.classList.add("is-writing");
        obs.disconnect();
      }
    }, { threshold: 0.6 });
    oracleObserver.observe(oracle);
  }

  render();

  /* ==========================================================
     Skills: pop-up box with where each skill comes from
     ========================================================== */

  var skillTip = document.getElementById("skill-tip");
  var activeChip = null;
  var GAP = 12;

  function placeTip(chip) {
    var r = chip.getBoundingClientRect();
    var vw = document.documentElement.clientWidth;
    var vh = window.innerHeight;
    skillTip.style.left = "0px";
    skillTip.style.top = "0px";
    var tw = skillTip.offsetWidth;
    var th = skillTip.offsetHeight;
    var side, left, top;

    if (r.right + GAP + tw <= vw - 8) {
      side = "right"; left = r.right + GAP; top = r.top + r.height / 2 - th / 2;
    } else if (r.left - GAP - tw >= 8) {
      side = "left"; left = r.left - GAP - tw; top = r.top + r.height / 2 - th / 2;
    } else {
      side = r.top > th + GAP + 70 ? "above" : "below";
      left = Math.min(Math.max(8, r.left + r.width / 2 - tw / 2), vw - tw - 8);
      top = side === "above" ? r.top - GAP - th : r.bottom + GAP;
    }
    var clampedTop = Math.min(Math.max(72, top), vh - th - 8);
    skillTip.style.left = Math.round(left) + "px";
    skillTip.style.top = Math.round(clampedTop) + "px";
    skillTip.style.setProperty("--arrow-y", Math.round(r.top + r.height / 2 - clampedTop) + "px");
    skillTip.style.setProperty("--tip-shift", side === "left" ? "6px" : "-6px");
    skillTip.setAttribute("data-side", side);
  }

  function showTip(chip) {
    if (activeChip && activeChip !== chip) hideTip();
    activeChip = chip;
    skillTip.textContent = chip.getAttribute("data-tip");
    skillTip.hidden = false;
    placeTip(chip);
    chip.classList.add("is-active");
    chip.setAttribute("aria-describedby", "skill-tip");
    skillTip.classList.add("is-shown");
  }

  function hideTip() {
    if (!activeChip) return;
    activeChip.classList.remove("is-active");
    activeChip.removeAttribute("aria-describedby");
    activeChip = null;
    skillTip.classList.remove("is-shown");
    skillTip.hidden = true;
  }

  Array.prototype.forEach.call(document.querySelectorAll("button.chip[data-tip]"), function (chip) {
    chip.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") showTip(chip); });
    chip.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hideTip(); });
    chip.addEventListener("focus", function () { showTip(chip); });
    chip.addEventListener("blur", function () { if (activeChip === chip) hideTip(); });
    /* Touch: tap to open, tap again (or anywhere else) to close */
    var wasOpen = false;
    chip.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") wasOpen = activeChip === chip;
    });
    chip.addEventListener("pointerup", function (e) {
      if (e.pointerType === "mouse") return;
      if (wasOpen) hideTip();
      else showTip(chip);
    });
  });

  document.addEventListener("pointerdown", function (e) {
    if (activeChip && !e.target.closest("button.chip")) hideTip();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hideTip();
  });
  window.addEventListener("scroll", function () { if (activeChip) placeTip(activeChip); }, { passive: true });
  window.addEventListener("resize", function () { if (activeChip) placeTip(activeChip); });

  /* ==========================================================
     Contact: copy email address
     ========================================================== */

  var copyBtn = document.getElementById("copy-btn");
  var copyStatus = document.getElementById("copy-status");
  var copyTimer;

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function showCopied(ok) {
    copyBtn.textContent = ok ? "Copied ✓" : "Press Ctrl/Cmd+C";
    copyBtn.classList.toggle("is-copied", ok);
    copyStatus.textContent = ok ? "Email address copied" : "";
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(function () {
      copyBtn.textContent = "Copy";
      copyBtn.classList.remove("is-copied");
    }, 1800);
    if (!ok) {
      var range = document.createRange();
      range.selectNodeContents(document.querySelector(".contact-email"));
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  copyBtn.addEventListener("click", function () {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(CONTACT_EMAIL).then(
        function () { showCopied(true); },
        function () { showCopied(fallbackCopy(CONTACT_EMAIL)); }
      );
    } else {
      showCopied(fallbackCopy(CONTACT_EMAIL));
    }
  });
})();
