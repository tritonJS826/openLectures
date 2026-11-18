/* javascript source */
/* ==========================================================================
   Нишский Лекторий — app.js
   Loads the page's single JSON (all languages), binds text, renders lists,
   and handles the RU / EN / SR language switch. No libraries, no build.
   ========================================================================== */
(function () {
  "use strict";

  var LANGS = ["ru", "en", "sr"];
  var DEFAULT_LANG = "ru";
  var STORAGE_KEY = "nis-lektorij-lang";

  var body = document.body;
  var jsonPath = body.getAttribute("data-json");
  var page = body.getAttribute("data-page") || "";
  var allData = null;
  var lang = getStoredLang();

  function getStoredLang() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return LANGS.indexOf(v) !== -1 ? v : DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function storeLang(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
  }

  function resolve(path, obj) {
    obj = obj || allData[lang];
    var parts = path.split(".");
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---- text binding ---------------------------------------------------- */
  function bindText() {
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var v = resolve(nodes[i].getAttribute("data-i18n"));
      if (typeof v === "string") nodes[i].textContent = v;
    }
    // attribute bindings: data-i18n-attr="attr:key;attr2:key2"
    var attrs = document.querySelectorAll("[data-i18n-attr]");
    for (var j = 0; j < attrs.length; j++) {
      var pairs = attrs[j].getAttribute("data-i18n-attr").split(";");
      for (var k = 0; k < pairs.length; k++) {
        var bits = pairs[k].split(":");
        if (bits.length < 2) continue;
        var attr = bits[0].trim();
        var key = bits.slice(1).join(":").trim();
        var val = resolve(key);
        if (typeof val === "string") attrs[j].setAttribute(attr, val);
      }
    }
    // meta
    var title = resolve("meta.title");
    if (typeof title === "string") document.title = title;
    var desc = resolve("meta.description");
    var metaEl = document.querySelector('meta[name="description"]');
    if (typeof desc === "string" && metaEl) metaEl.setAttribute("content", desc);
  }

  /* ---- list rendering -------------------------------------------------- */
  function cardRail(item) {
    var rail = el("div", "card-rail");
    rail.appendChild(el("span", "day", item.day || ""));
    rail.appendChild(el("span", "mon", item.mon || ""));
    return rail;
  }

  /* Cover thumbnail. Kept decorative (alt="") — the card title carries the
     meaning — and always rendered so the card grid stays aligned. */
  function cardThumb(item) {
    var box = el("span", "card-thumb");
    if (!item.thumb) {
      box.className = "card-thumb card-thumb--empty";
      return box;
    }
    var img = el("img");
    img.src = item.thumb;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    box.appendChild(img);
    return box;
  }

  function cardMeta(item) {
    var meta = el("div", "card-meta");
    if (item.speaker) meta.appendChild(el("span", null, item.speaker));
    if (item.dateText) {
      var when = el("span", null, item.dateText + (item.time ? " · " + item.time : ""));
      meta.appendChild(when);
    }
    return meta;
  }

  function buildUpcoming(item) {
    var a = el("a", "lecture-card");
    a.href = item.url;
    a.appendChild(cardRail(item));
    a.appendChild(cardThumb(item));
    var bodyEl = el("div", "card-body");
    bodyEl.appendChild(el("span", "card-badge", item.badge || ""));
    bodyEl.appendChild(el("h3", "card-title", item.title));
    bodyEl.appendChild(cardMeta(item));
    if (item.place) {
      var foot = el("div", "card-foot");
      foot.appendChild(el("span", null, item.place));
      bodyEl.appendChild(foot);
    }
    a.appendChild(bodyEl);
    a.appendChild(el("span", "card-arrow", "↗"));
    return a;
  }

  function buildArchive(item) {
    var wrap = el("article", "lecture-card lecture-card--archive");

    var main = el("a", "card-main");
    main.href = item.url;
    main.appendChild(cardRail(item));
    main.appendChild(cardThumb(item));
    var bodyEl = el("div", "card-body");
    if (item.badge) bodyEl.appendChild(el("span", "card-badge card-badge--past", item.badge));
    bodyEl.appendChild(el("h3", "card-title", item.title));
    bodyEl.appendChild(cardMeta(item));
    if (item.place) {
      var foot = el("div", "card-foot");
      foot.appendChild(el("span", null, item.place));
      bodyEl.appendChild(foot);
    }
    main.appendChild(bodyEl);
    wrap.appendChild(main);

    if (item.materialUrl) {
      var mat = el("a", "card-material");
      mat.href = item.materialUrl;
      mat.target = "_blank";
      mat.rel = "noopener";
      // Opens the "Materials" dialog; without JS the href still goes to GitHub.
      var slug = slugFromUrl(item.url);
      if (slug) mat.setAttribute("data-materials", slug);
      mat.appendChild(el("span", "icon", "↧"));
      mat.appendChild(el("span", null, item.materialLabel || "Materials"));
      wrap.appendChild(mat);
    }
    return wrap;
  }

  /* ---- materials dialog ------------------------------------------------ */
  var SLUG_RE = /lectures\/([^/]+)\/?$/;
  var ICONS = { image: "▦", video: "▶", doc: "▤", other: "◆" };
  var matCache = {};
  var matDialog = null;
  var matTrigger = null;

  function slugFromUrl(url) {
    var m = SLUG_RE.exec(url || "");
    return m ? m[1] : "";
  }

  function txt(key) {
    var v = resolve(key);
    return typeof v === "string" ? v : "";
  }

  function locale() {
    return lang === "ru" ? "ru-RU" : lang === "sr" ? "sr-RS" : "en-US";
  }

  function sizeText(bytes) {
    var b = Number(bytes) || 0;
    var fmt = function (n) {
      try {
        return new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(n);
      } catch (e) {
        return String(Math.round(n * 10) / 10);
      }
    };
    if (b >= 1048576) return fmt(b / 1048576) + " " + txt("materials.mb");
    if (b >= 1024) return fmt(b / 1024) + " " + txt("materials.kb");
    return fmt(b) + " " + txt("materials.b");
  }

  function supportsDialog() {
    return typeof window.HTMLDialogElement !== "undefined" &&
      typeof HTMLDialogElement.prototype.showModal === "function";
  }

  // Files live two levels up on lecture pages, at the site root elsewhere.
  function sitePrefix() {
    return page === "lecture" ? "../../" : "";
  }

  function ensureDialog() {
    if (matDialog) return matDialog;

    var dlg = el("dialog", "materials-dialog");
    dlg.setAttribute("aria-labelledby", "materials-title");

    var panel = el("div", "materials-dialog__panel");
    var head = el("div", "materials-dialog__head");
    var titles = el("div", "materials-dialog__titles");
    var eyebrow = el("span", "eyebrow");
    eyebrow.setAttribute("data-i18n", "materials.eyebrow");
    var heading = el("h2", "h2 materials-dialog__title");
    heading.id = "materials-title";
    heading.setAttribute("data-i18n", "materials.title");
    var note = el("p", "materials-dialog__note");
    note.setAttribute("data-i18n", "materials.note");
    titles.appendChild(eyebrow);
    titles.appendChild(heading);
    titles.appendChild(note);

    var close = el("button", "materials-dialog__close", "×");
    close.type = "button";
    close.setAttribute("data-i18n-attr", "aria-label:materials.close");
    head.appendChild(titles);
    head.appendChild(close);

    var body = el("div", "materials-dialog__body");
    var foot = el("div", "materials-dialog__foot");
    var folder = el("a", "btn btn--primary");
    folder.target = "_blank";
    folder.rel = "noopener";
    var folderText = el("span");
    folderText.setAttribute("data-i18n", "materials.folderCta");
    folder.appendChild(folderText);
    folder.appendChild(el("span", "btn__arrow", "↗"));
    foot.appendChild(folder);

    panel.appendChild(head);
    panel.appendChild(body);
    panel.appendChild(foot);
    dlg.appendChild(panel);
    document.body.appendChild(dlg);

    close.addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close(); // click on the backdrop
    });
    dlg.addEventListener("close", function () {
      document.body.classList.remove("materials-open");
      if (matTrigger && matTrigger.focus) matTrigger.focus();
      matTrigger = null;
    });

    matDialog = dlg;
    bindText(); // fill the dialog's own labels
    return dlg;
  }

  function renderMaterials(manifest) {
    var body = matDialog.querySelector(".materials-dialog__body");
    body.innerHTML = "";
    body.removeAttribute("aria-busy");

    var groups = (manifest && manifest.groups) || [];
    if (!groups.length) {
      body.appendChild(el("p", "materials-dialog__status", txt("materials.empty")));
      return;
    }

    groups.forEach(function (group) {
      var section = el("section", "materials-dialog__group");
      var label = group.id === "materials" ? "materials.groupFiles" : "materials.groupImages";
      section.appendChild(el("h3", "materials-dialog__group-title", txt(label)));
      var list = el("ul", "materials-dialog__list");

      (group.files || []).forEach(function (file) {
        var item = el("li", "materials-dialog__item");
        var link = el("a", "materials-dialog__file");
        // Files are served by the site itself, so `download` makes the browser
        // save them instead of opening GitHub (or the image inline).
        if (file.path) {
          link.href = sitePrefix() + file.path;
          link.setAttribute("download", file.name);
        } else {
          link.href = file.url;
          link.target = "_blank";
          link.rel = "noopener";
        }
        link.title = txt("materials.download");

        if (file.kind === "image" && file.path) {
          var thumb = el("img", "materials-dialog__file-thumb");
          thumb.src = sitePrefix() + file.path;
          thumb.alt = "";
          thumb.decoding = "async";
          link.appendChild(thumb);
        } else {
          var icon = el("span", "materials-dialog__file-icon", ICONS[file.kind] || ICONS.other);
          icon.setAttribute("aria-hidden", "true");
          link.appendChild(icon);
        }

        link.appendChild(el("span", "materials-dialog__file-name", file.name));
        link.appendChild(el("span", "materials-dialog__file-size", sizeText(file.size)));
        var dl = el("span", "materials-dialog__file-dl", "↧");
        dl.setAttribute("aria-hidden", "true");
        link.appendChild(dl);
        item.appendChild(link);
        list.appendChild(item);
      });

      section.appendChild(list);
      body.appendChild(section);
    });
  }

  function openMaterials(slug, trigger) {
    if (!slug) return;
    var dlg = ensureDialog();
    matTrigger = trigger || document.activeElement;
    dlg.setAttribute("data-slug", slug);
    document.body.classList.add("materials-open");

    var folder = dlg.querySelector(".materials-dialog__foot .btn");
    folder.href = "https://github.com/tritonJS826/openLectures/tree/main/lectures/" + slug;

    var body = dlg.querySelector(".materials-dialog__body");
    body.setAttribute("aria-busy", "true");
    body.innerHTML = "";
    body.appendChild(el("p", "materials-dialog__status", txt("materials.loading")));

    if (!dlg.open) dlg.showModal();

    if (matCache[slug]) {
      renderMaterials(matCache[slug]);
      return;
    }

    fetch(sitePrefix() + "lectures/" + slug + "/data/materials.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (json) {
        matCache[slug] = json;
        if (dlg.open && dlg.getAttribute("data-slug") === slug) renderMaterials(json);
      })
      .catch(function () {
        if (!dlg.open || dlg.getAttribute("data-slug") !== slug) return;
        body.removeAttribute("aria-busy");
        body.innerHTML = "";
        body.appendChild(el("p", "materials-dialog__status materials-dialog__status--error", txt("materials.error")));
      });
  }

  function initMaterials() {
    if (!supportsDialog()) return; // keep the plain GitHub links
    document.addEventListener("click", function (e) {
      if (!e.target.closest) return;
      var trigger = e.target.closest("[data-materials]");
      if (!trigger) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (typeof e.button === "number" && e.button !== 0) return;
      e.preventDefault();
      openMaterials(trigger.getAttribute("data-materials"), trigger);
    });
  }

  function buildLearn(item) {
    return el("li", null, typeof item === "string" ? item : item.text);
  }

  function buildText(item) {
    return el("p", null, typeof item === "string" ? item : item.text);
  }

  function buildPoint(item, i) {
    var art = el("article", "point");
    art.appendChild(el("h3", null, item.title));
    art.appendChild(el("p", null, item.text));
    return art;
  }

  var builders = {
    upcoming: buildUpcoming,
    archive: buildArchive,
    learn: buildLearn,
    text: buildText,
    point: buildPoint
  };

  function renderLists() {
    var containers = document.querySelectorAll("[data-list]");
    for (var i = 0; i < containers.length; i++) {
      var c = containers[i];
      var items = resolve(c.getAttribute("data-list"));
      if (!Array.isArray(items)) continue;
      var type = c.getAttribute("data-list-type") || "upcoming";
      var build = builders[type] || buildUpcoming;
      c.innerHTML = "";
      for (var j = 0; j < items.length; j++) {
        c.appendChild(build(items[j], j));
      }
    }
  }

  /* ---- language switch ------------------------------------------------- */
  function updateSwitch() {
    var btns = document.querySelectorAll("[data-lang]");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var on = b.getAttribute("data-lang") === lang;
      b.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function apply() {
    document.documentElement.setAttribute("lang", lang);
    bindText();
    renderLists();
    updateSwitch();
    // Keep an open materials dialog in the new language.
    if (matDialog && matDialog.open) {
      var slug = matDialog.getAttribute("data-slug");
      if (slug && matCache[slug]) renderMaterials(matCache[slug]);
    }
  }

  function setLang(next) {
    if (LANGS.indexOf(next) === -1 || next === lang) return;
    lang = next;
    storeLang(lang);
    apply();
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-lang]") : null;
    if (!t) return;
    e.preventDefault();
    setLang(t.getAttribute("data-lang"));
  });

  /* ---- reveal on scroll ------------------------------------------------ */
  function initReveal() {
    var nodes = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.add("is-visible");
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    for (var j = 0; j < nodes.length; j++) io.observe(nodes[j]);
  }

  /* ---- mobile menu (burger) -------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    }

    function isOpen() {
      return toggle.getAttribute("aria-expanded") === "true";
    }

    toggle.addEventListener("click", function () { setOpen(!isOpen()); });

    nav.addEventListener("click", function (e) {
      if (!e.target.closest) return;
      if (e.target.closest("a") || e.target.closest("[data-lang]")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (!isOpen() || !e.target.closest) return;
      if (e.target.closest(".nav-toggle") || e.target.closest("#site-nav")) return;
      setOpen(false);
    });

    // Close the panel when the viewport grows back to the desktop layout.
    var mq = window.matchMedia("(min-width: 761px)");
    var onChange = function () { if (mq.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ---- failure fallback ------------------------------------------------- */
  function showLoadError() {
    var containers = document.querySelectorAll("[data-list]");
    for (var i = 0; i < containers.length; i++) {
      var c = containers[i];
      if (c.querySelector("[data-load-error]")) continue;
      var p = document.createElement("p");
      p.className = "load-error";
      p.setAttribute("data-load-error", "");
      p.textContent =
        "Не удалось загрузить данные. Похоже, страница открыта как файл (file://) — " +
        "браузер блокирует чтение JSON. Запустите локальный сервер, например " +
        "«python3 -m http.server 5173», и откройте http://localhost:5173 (подробнее в README).";
      c.appendChild(p);
    }
  }

  /* ---- boot ------------------------------------------------------------ */
  function boot() {
    if (!jsonPath) { initReveal(); return; }
    fetch(jsonPath, { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (json) {
        allData = json;
        if (!json[lang]) lang = DEFAULT_LANG;
        apply();
        initReveal();
        document.dispatchEvent(new CustomEvent("content:ready", { detail: { lang: lang } }));
      })
      .catch(function (err) {
        // Fail safe: keep whatever static text is in the HTML.
        console.error("Could not load content JSON:", jsonPath, err);
        showLoadError();
        initReveal();
      });
  }

  initNav();
  initMaterials();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // Expose a small API for lecture pages if needed.
  window.NL = { setLang: setLang, getLang: function () { return lang; }, resolve: resolve };
})();
