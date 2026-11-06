/* ==========================================================================
   About page — copy the contact email
   A click (or keyboard activation) selects the address and copies it,
   then briefly shows a localized "Copied" status.
   ========================================================================== */
(function () {
  "use strict";

  var emailEl = document.querySelector("[data-copy-email]");
  if (!emailEl) return;

  var value = emailEl.getAttribute("data-copy-email");
  var status = document.querySelector("[data-copy-status]");
  var timer = null;

  function selectEmail() {
    var range = document.createRange();
    range.selectNodeContents(emailEl);
    var sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function showCopied() {
    if (!status) return;
    status.hidden = false;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { status.hidden = true; }, 2200);
  }

  function fallbackCopy() {
    selectEmail();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    if (ok) showCopied();
  }

  emailEl.addEventListener("click", function () {
    selectEmail();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () {
        selectEmail();
        showCopied();
      }, fallbackCopy);
    } else {
      fallbackCopy();
    }
  });
})();
