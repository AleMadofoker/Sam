(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Confetti ───────────────────────────────────────────
  function fireConfetti() {
    if (prefersReduced) return;

    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const colors = ["#7eb5aa", "#3d6b7a", "#e8c47a", "#d4a574", "#e8a0a8", "#f5efe6"];
    let pieces = [];
    let frame = 0;
    const maxFrames = 180;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();

    for (let i = 0; i < 80; i++) {
      pieces.push({
        x: canvas.width * 0.5 + (Math.random() - 0.5) * canvas.width * 0.5,
        y: canvas.height * 0.35 + (Math.random() - 0.5) * 80,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * -8 - 4,
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 8,
        gravity: 0.18,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rot += p.vr;
        p.vx *= 0.99;
      });

      frame++;
      if (frame < maxFrames) {
        requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    draw();
    window.addEventListener("resize", resize, { once: true });
  }

  // ── Welcome + background music ─────────────────────────
  const bgMusic = document.getElementById("bgMusic");
  const audioToggle = document.getElementById("audioToggle");
  const welcome = document.getElementById("welcome");
  const welcomeBtn = document.getElementById("welcomeBtn");

  if (bgMusic) {
    bgMusic.volume = 0.65;

    function updateToggle(playing) {
      if (!audioToggle) return;
      audioToggle.classList.toggle("is-playing", playing);
      audioToggle.classList.toggle("is-muted", !playing);
      audioToggle.setAttribute(
        "aria-label",
        playing ? "Pausar música" : "Reproducir música"
      );
    }

    function startMusic() {
      return bgMusic.play().then(() => updateToggle(true)).catch(() => updateToggle(false));
    }

    function enterSite() {
      if (!welcome || welcome.classList.contains("welcome--leaving")) return;

      welcome.classList.add("welcome--leaving");
      document.body.classList.remove("welcome-open");

      startMusic();
      fireConfetti();

      if (audioToggle) audioToggle.hidden = false;

      setTimeout(() => {
        welcome.remove();
      }, 550);
    }

    if (welcomeBtn) {
      welcomeBtn.addEventListener("click", enterSite);
    }

    if (audioToggle) {
      audioToggle.addEventListener("click", () => {
        if (bgMusic.paused) {
          startMusic();
        } else {
          bgMusic.pause();
          updateToggle(false);
        }
      });
    }
  }

  // ── Scroll reveal ──────────────────────────────────────
  const targets = document.querySelectorAll(
    ".reveal, .pet-card, .family-photo, .cat-gallery"
  );

  targets.forEach((el) => {
    if (!el.classList.contains("reveal")) el.classList.add("reveal");
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    ).observe(el);
  });

  const heroContent = document.querySelector(".hero__content");
  if (heroContent) {
    requestAnimationFrame(() => heroContent.classList.add("visible"));
  }

  // ── Medicine section in-view ───────────────────────────
  const medBlock = document.querySelector(".block--med");
  if (medBlock) {
    new IntersectionObserver(
      ([entry]) => medBlock.classList.toggle("in-view", entry.isIntersecting),
      { threshold: 0.2 }
    ).observe(medBlock);
  }

  // ── Scroll progress ────────────────────────────────────
  const progressBar = document.querySelector(".scroll-progress__bar");
  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = docHeight > 0 ? (scrollTop / docHeight) * 100 + "%" : "0%";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  // ── Parallax blobs ─────────────────────────────────────
  if (!prefersReduced) {
    const blobs = document.querySelectorAll(".hero__blob");
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY * 0.15;
        blobs.forEach((blob, i) => {
          blob.style.transform = `translateY(${y * (i % 2 ? -1 : 1)}px)`;
        });
      },
      { passive: true }
    );
  }

  // ── Pet cards tap ──────────────────────────────────────
  document.querySelectorAll(".pet-card").forEach((card) => {
    const trigger = () => {
      card.classList.add("is-tapped");
      setTimeout(() => card.classList.remove("is-tapped"), 500);
    };
    card.addEventListener("click", trigger);
    card.addEventListener("touchstart", trigger, { passive: true });
  });

  // ── Family photos tilt ─────────────────────────────────
  if (!prefersReduced) {
    document.querySelectorAll(".family-photo").forEach((photo) => {
      const frame = photo.querySelector(".family-photo__frame");
      if (!frame) return;

      const handleMove = (e) => {
        const rect = frame.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = (clientX - rect.left) / rect.width - 0.5;
        const y = (clientY - rect.top) / rect.height - 0.5;
        frame.style.transform =
          "perspective(600px) rotateY(" + x * 10 + "deg) rotateX(" + -y * 10 + "deg) scale(1.02)";
        photo.classList.add("is-tilted");
      };

      const reset = () => {
        frame.style.transform = "";
        photo.classList.remove("is-tilted");
      };

      frame.addEventListener("mousemove", handleMove);
      frame.addEventListener("touchmove", handleMove, { passive: true });
      frame.addEventListener("mouseleave", reset);
      frame.addEventListener("touchend", reset);
    });
  }

  // ── Floating medical particles ─────────────────────────
  const canvas = document.getElementById("medParticles");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let rafId;

    const symbols = ["+", "✚", "♥", "⚕"];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 10 + 8,
        speedY: Math.random() * 0.3 + 0.1,
        speedX: (Math.random() - 0.5) * 0.2,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        opacity: Math.random() * 0.12 + 0.04,
        rotation: Math.random() * 360,
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: 18 }, createParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = "#3d6b7a";
        ctx.font = p.size + "px Fraunces, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();

        p.y -= p.speedY;
        p.x += p.speedX;
        p.rotation += 0.15;

        if (p.y < -20) {
          Object.assign(p, createParticle());
          p.y = canvas.height + 20;
        }
      });
      rafId = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener("resize", resize);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        draw();
      }
    });
  }
})();
