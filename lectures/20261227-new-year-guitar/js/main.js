/* ==========================================================================
   Lecture page — small interactions (hero image tilt, reveal)
   Respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var media = document.querySelector(".lecture-hero__media");
  if (!media || reduce) return;

  var img = media.querySelector("img");
  if (!img) return;

  media.addEventListener("pointermove", function (e) {
    var r = media.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width - 0.5;
    var py = (e.clientY - r.top) / r.height - 0.5;
    img.style.transform = "perspective(900px) rotateY(" + (px * 5) + "deg) rotateX(" + (-py * 5) + "deg) scale(1.01)";
  });
  media.addEventListener("pointerleave", function () {
    img.style.transform = "";
  });
})();
