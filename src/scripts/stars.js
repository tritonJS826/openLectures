/* ==========================================================================
   Нишский Лекторий — stars.js
   A lightweight animated starfield on #stars (canvas). No image assets.
   Respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var canvas = document.getElementById("stars");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var stars = [];
  var shooting = null;
  var nextShoot = 2600;
  var last = 0;
  var running = true;

  function resize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build(w, h);
  }

  function build(w, h) {
    var count = Math.round((w * h) / 9000);
    count = Math.max(70, Math.min(count, 260));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.25,
        base: Math.random() * 0.5 + 0.25,
        tw: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.9 + 0.35,
        hue: Math.random()
      });
    }
  }

  function colorFor(s, alpha) {
    if (s.hue > 0.86) return "rgba(255, 179, 71, " + alpha + ")";
    if (s.hue > 0.72) return "rgba(90, 209, 255, " + alpha + ")";
    if (s.hue > 0.6) return "rgba(185, 140, 255, " + alpha + ")";
    return "rgba(233, 236, 245, " + alpha + ")";
  }

  function frame(t) {
    if (!running) return;
    if (!last) last = t;
    var dt = Math.min((t - last) / 1000, 0.05);
    last = t;

    var w = window.innerWidth;
    var h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      if (!reduce) s.tw += dt * s.speed;
      var a = s.base + Math.sin(s.tw) * 0.28;
      if (a < 0.05) a = 0.05;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = colorFor(s, a);
      ctx.fill();
    }

    // occasional shooting star
    if (!reduce) {
      if (!shooting) {
        nextShoot -= dt * 1000;
        if (nextShoot <= 0) {
          shooting = {
            x: Math.random() * w * 0.6,
            y: Math.random() * h * 0.4,
            vx: 420 + Math.random() * 240,
            vy: 160 + Math.random() * 120,
            life: 0,
            max: 0.9
          };
          nextShoot = 4200 + Math.random() * 5200;
        }
      } else {
        shooting.life += dt;
        shooting.x += shooting.vx * dt;
        shooting.y += shooting.vy * dt;
        var p = 1 - shooting.life / shooting.max;
        if (p <= 0) {
          shooting = null;
        } else {
          var len = 140;
          var ang = Math.atan2(shooting.vy, shooting.vx);
          var x2 = shooting.x - Math.cos(ang) * len;
          var y2 = shooting.y - Math.sin(ang) * len;
          var grad = ctx.createLinearGradient(shooting.x, shooting.y, x2, y2);
          grad.addColorStop(0, "rgba(255,255,255," + (0.85 * p) + ")");
          grad.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(shooting.x, shooting.y);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(frame);
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running = true;
      last = 0;
      requestAnimationFrame(frame);
    }
  });

  resize();
  requestAnimationFrame(frame);
})();
