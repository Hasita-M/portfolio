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

  /* ---------- Star background ---------- */

  (function starfield() {
    var canvas = document.getElementById("starfield");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var stars = [];
    var w = 0, h = 0, dpr = 1;
    var rafId = null;

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
        ctx.fillStyle = s.tint ? "#9be7f4" : "#ffffff";
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
    else dialog.removeAttribute("open");
  }

  /* Click anywhere (inside the message or on the backdrop) to exit. Esc also works. */
  dialog.addEventListener("click", closeFact);

  stars.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var idx = Number(btn.getAttribute("data-star"));
      var isNew = found.indexOf(idx) === -1;
      if (isNew) {
        found.push(idx);
        saveState();
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
