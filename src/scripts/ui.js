/* Project Open Lectures — shared client interactions.
   Mobile nav, reveal-on-scroll, hero tilt and the materials dialog.
   All user-facing text is rendered server-side into the dialog's data-* attrs. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- mobile menu ----------------------------------------------------- */
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
    var mq = window.matchMedia("(min-width: 761px)");
    var onChange = function () { if (mq.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

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

  /* ---- hero tilt ------------------------------------------------------- */
  function initTilt() {
    var media = document.querySelector(".lecture-hero__media");
    if (!media || reduce) return;
    var img = media.querySelector("img");
    if (!img) return;
    media.addEventListener("pointermove", function (e) {
      var r = media.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      img.style.transform =
        "perspective(900px) rotateY(" + px * 5 + "deg) rotateX(" + -py * 5 + "deg) scale(1.01)";
    });
    media.addEventListener("pointerleave", function () {
      img.style.transform = "";
    });
  }

  /* ---- materials dialog ------------------------------------------------ */
  var ICONS = { image: "▦", video: "▶", doc: "▤", other: "◆" };
  var cache = {};
  var dlg = null;
  var triggerEl = null;

  function supportsDialog() {
    return typeof window.HTMLDialogElement !== "undefined" &&
      typeof HTMLDialogElement.prototype.showModal === "function";
  }

  function attr(name) {
    return (dlg && dlg.getAttribute(name)) || "";
  }

  function sizeText(bytes) {
    var b = Number(bytes) || 0;
    var locale = attr("data-locale") || "ru-RU";
    var fmt = function (n) {
      try {
        return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(n);
      } catch (e) {
        return String(Math.round(n * 10) / 10);
      }
    };
    if (b >= 1048576) return fmt(b / 1048576) + " " + attr("data-unit-mb");
    if (b >= 1024) return fmt(b / 1024) + " " + attr("data-unit-kb");
    return fmt(b) + " " + attr("data-unit-b");
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function ensureDialog() {
    if (dlg) return dlg;
    dlg = document.getElementById("materials-dialog");
    if (!dlg) return null;
    var close = dlg.querySelector(".materials-dialog__close");
    if (close) close.addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close();
    });
    dlg.addEventListener("close", function () {
      document.body.classList.remove("materials-open");
      if (triggerEl && triggerEl.focus) triggerEl.focus();
      triggerEl = null;
    });
    return dlg;
  }

  function render(manifest) {
    var body = dlg.querySelector(".materials-dialog__body");
    body.innerHTML = "";
    body.removeAttribute("aria-busy");
    var groups = (manifest && manifest.groups) || [];
    if (!groups.length) {
      body.appendChild(el("p", "materials-dialog__status", attr("data-txt-empty")));
      return;
    }
    groups.forEach(function (group) {
      var section = el("section", "materials-dialog__group");
      section.appendChild(
        el("h3", "materials-dialog__group-title",
          group.id === "materials" ? attr("data-lbl-files") : attr("data-lbl-images")),
      );
      var list = el("ul", "materials-dialog__list");
      (group.files || []).forEach(function (file) {
        var item = el("li", "materials-dialog__item");
        var link = el("a", "materials-dialog__file");
        if (file.path) {
          link.href = "/" + file.path;
          link.setAttribute("download", file.name);
        } else {
          link.href = file.url;
          link.target = "_blank";
          link.rel = "noopener";
        }
        link.title = attr("data-txt-download");
        if (file.kind === "image" && file.path) {
          var thumb = el("img", "materials-dialog__file-thumb");
          thumb.src = "/" + file.path;
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

  function openMaterials(key, trigger) {
    if (!key || !ensureDialog()) return;
    triggerEl = trigger || document.activeElement;
    dlg.setAttribute("data-key", key);
    document.body.classList.add("materials-open");

    var folder = dlg.querySelector(".materials-dialog__foot .btn");
    if (folder) {
      folder.href =
        "https://github.com/tritonJS826/openLectures/tree/main/public/lectures/" + key;
    }

    var body = dlg.querySelector(".materials-dialog__body");
    body.setAttribute("aria-busy", "true");
    body.innerHTML = "";
    body.appendChild(el("p", "materials-dialog__status", attr("data-txt-loading")));

    if (!dlg.open) dlg.showModal();

    if (cache[key]) {
      render(cache[key]);
      return;
    }
    fetch("/lectures/" + key + "/data/materials.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (json) {
        cache[key] = json;
        if (dlg.open && dlg.getAttribute("data-key") === key) render(json);
      })
      .catch(function () {
        if (!dlg.open || dlg.getAttribute("data-key") !== key) return;
        body.removeAttribute("aria-busy");
        body.innerHTML = "";
        body.appendChild(el("p", "materials-dialog__status materials-dialog__status--error", attr("data-txt-error")));
      });
  }

  function initMaterials() {
    if (!supportsDialog()) return;
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

  initNav();
  initReveal();
  initTilt();
  initMaterials();
})();
