/**
 * attachMediaMotion — scroll-triggered animations for the Vietnamese fresh-grad CV.
 *
 * Uses IntersectionObserver for section/card/photo/badge/chip reveals plus a
 * single, rAF-batched frame loop shared by the scroll progress bar, the hero
 * parallax drift and the hero pointer interaction. The document renders static
 * markup; this script only flips `data-visible="true"` on observed elements
 * (CSS owns every transition) and drives a handful of GPU-friendly transforms.
 *
 * Motion is gated three ways: the root `data-motion` attribute
 * (immersive / subtle / still), `prefers-reduced-motion`, and a mobile
 * (<641px) early-out — all of which fall back to a static, fully-visible layout.
 *
 * Self-contained: also embedded verbatim in exported HTML via a `?raw` import.
 * Returns a disposer function that tears everything down.
 *
 * `options` turns individual effects off. Everything defaults to ON so the
 * preview document and the exported HTML keep their full choreography; the
 * live EDITOR opts out of every effect that would fight React or the caret
 * (see EDITOR_MOTION below) while keeping the scroll parallax.
 */
export function attachMediaMotion(root, options) {
  if (!root) return () => {};

  const {
    reveals = true, // IntersectionObserver reveal choreography (opacity/transform)
    heroName = true, // rewrites the h1's text nodes — never in an editable document
    gpaCountUp = true, // rewrites the GPA text node
    cardTilt = true, // pointer tilt on entry cards
    cursor = true, // custom dot cursor
    pointerParallax = true, // hero photo follows the pointer
    progressBar = true, // fixed scroll-progress bar
    heroDrift = true, // hero photo + ambient scroll parallax
    scrollHint = true, // fade the "scroll down" indicator away
  } = options || {};

  const motionMode = root.dataset.motion || "immersive";

  // Every element that can be revealed. forceVisible() flips all of them on so
  // still / reduced-motion / mobile render a complete, static document.
  const REVEAL_SELECTOR = [
    "[data-section]",
    "[data-entry-card]",
    "[data-hero-name]",
    ".grad-hero-photo",
    ".grad-hero-photo-frame",
    ".grad-hero-ambient",
    ".grad-hero-rule",
    ".grad-hero-objective",
    ".grad-hero-meta",
    ".grad-hero-contact",
    ".grad-hero-scroll",
    ".grad-cert-badge",
    ".grad-chip",
    ".grad-entry-photos img",
    ".grad-edu-photo",
    ".grad-ending",
  ].join(", ");

  const forceVisible = () => {
    // When the caller owns visibility (the editor reveals with framer-motion),
    // stamping data-visible would double up two competing animation systems.
    if (!reveals) return;
    root.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
      el.setAttribute("data-visible", "true");
    });
    // Also show letter-reveal spans immediately.
    root.querySelectorAll("[data-hero-name] .hero-letter").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  };

  // ── Static fallbacks (no ceremony, everything visible) ──
  // Still mode: no animation at all, but the document must be fully visible.
  if (motionMode === "still") {
    forceVisible();
    return () => {};
  }

  // Respect prefers-reduced-motion: show everything, animate nothing.
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    forceVisible();
    return () => {};
  }

  // Small screens: skip the ceremony entirely (mobile-priority). Expensive
  // motion (parallax, tilt, pointer tracking, progress bar) is desktop-only.
  if (window.innerWidth < 641) {
    forceVisible();
    return () => {};
  }

  // Without IntersectionObserver nothing would ever flip data-visible, so
  // every default-hidden section/chip/badge would stay invisible forever.
  if (typeof IntersectionObserver === "undefined") {
    forceVisible();
    return () => {};
  }

  const observers = [];
  const cleanups = [];
  /** Every element whose inline transitionDelay we set — reset on dispose. */
  const delayedEls = [];
  const canHover = window.matchMedia("(hover: hover) and (min-width: 641px)").matches;

  const setDelay = (el, ms) => {
    if (!el) return;
    el.style.transitionDelay = `${ms}ms`;
    delayedEls.push(el);
  };

  // ── Hero name reveal ──
  // Gradient-text themes (nebula/ember/aurora/prism) paint the name via
  // `background-clip: text` + `-webkit-text-fill-color: transparent` on the h1.
  // Splitting the h1 into `display: inline-block` per-character spans breaks that:
  // an inline-block child box does NOT receive the parent's text-clipped background,
  // and the spans inherit the transparent fill — so every letter renders invisible.
  // For those themes we animate the h1 as a whole word (fade + slide) and leave its
  // own text intact so `background-clip: text` keeps working. Solid-text themes
  // (mono) have no gradient, so the per-character letter reveal is safe there.
  const heroNameEl = root.querySelector("[data-hero-name]");
  if (heroName && heroNameEl && heroNameEl.textContent.trim()) {
    const text = heroNameEl.textContent;
    const nameCS = window.getComputedStyle(heroNameEl);
    const fill = (
      nameCS.webkitTextFillColor ||
      nameCS.getPropertyValue("-webkit-text-fill-color") ||
      ""
    )
      .trim()
      .toLowerCase();
    const isGradientText =
      fill === "transparent" || fill === "rgba(0, 0, 0, 0)" || fill === "rgba(0,0,0,0)";

    if (isGradientText) {
      // Whole-word reveal: keep the h1's own text so the gradient clips to it.
      heroNameEl.style.opacity = "0";
      heroNameEl.style.transform = "translateY(16px)";
      heroNameEl.style.transition =
        "opacity 0.6s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)";
      const wordTimer = setTimeout(() => {
        heroNameEl.style.opacity = "1";
        heroNameEl.style.transform = "translateY(0)";
      }, 200);
      cleanups.push(() => {
        clearTimeout(wordTimer);
        heroNameEl.style.opacity = "";
        heroNameEl.style.transform = "";
        heroNameEl.style.transition = "";
      });
    } else {
      // Per-character letter reveal (solid-text themes).
      heroNameEl.textContent = "";
      heroNameEl.setAttribute("aria-label", text);
      const letters = [];
      for (let i = 0; i < text.length; i++) {
        const span = document.createElement("span");
        span.className = "hero-letter";
        span.textContent = text[i];
        span.style.cssText = `
          display: inline-block;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.4s ease ${i * 0.035}s, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.035}s;
        `;
        if (text[i] === " ") span.style.whiteSpace = "pre";
        heroNameEl.appendChild(span);
        letters.push(span);
      }
      const timer = setTimeout(() => {
        letters.forEach((span) => {
          span.style.opacity = "1";
          span.style.transform = "translateY(0)";
        });
      }, 200);
      cleanups.push(() => {
        clearTimeout(timer);
        heroNameEl.textContent = text;
      });
    }
  }

  // ── Shared rAF frame loop ──
  // Scroll and pointer work is coalesced into ONE animation frame so we never
  // read layout more than once per frame and never stack rAF callbacks.
  let frameId = null;
  const frameTasks = [];
  const runFrame = () => {
    frameId = null;
    for (let i = 0; i < frameTasks.length; i++) frameTasks[i]();
  };
  const scheduleFrame = () => {
    if (frameId !== null) return;
    frameId = requestAnimationFrame(runFrame);
  };

  // ── Scroll progress bar (2px, fixed to the top of the viewport) ──
  if (progressBar) {
  const progressBarEl = document.createElement("div");
  progressBarEl.className = "scroll-progress";
  progressBarEl.setAttribute("aria-hidden", "true");
  progressBarEl.style.setProperty("--scroll-progress", "0");
  // Theme-aware gradient: read the document's tokens (they live on .grad-document,
  // not on <body>, so they don't cascade to the bar automatically).
  try {
    const cs = window.getComputedStyle(root);
    const primary = cs.getPropertyValue("--primary").trim();
    const accent = cs.getPropertyValue("--accent").trim();
    if (primary) progressBarEl.style.background = `linear-gradient(90deg, ${primary}, ${accent || primary})`;
  } catch (_) {
    /* fall back to the CSS default gradient */
  }
  document.body.appendChild(progressBarEl);
  cleanups.push(() => {
    if (progressBarEl.parentNode) progressBarEl.parentNode.removeChild(progressBarEl);
  });

  const docEl = document.documentElement;
  frameTasks.push(() => {
    const scrollTop = window.scrollY || docEl.scrollTop || 0;
    const docHeight = docEl.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
    progressBarEl.style.setProperty("--scroll-progress", String(progress));
  });
  }

  // ── Hero parallax drift (scroll) + pointer interaction ──
  const heroPhoto = root.querySelector("[data-hero-photo]");
  const heroFrame = root.querySelector(".grad-hero-photo-frame");
  let heroReady = false; // pointer parallax waits until the entrance settles
  let pointerX = 0;
  let pointerY = 0;
  let pointerActive = false;

  if (heroDrift && motionMode === "immersive" && heroPhoto) {
    // The photo column reserves `--hero-drift` worth of breathing room, so the
    // drift can never push the portrait into the copy below it.
    const range = parseFloat(
      window.getComputedStyle(root).getPropertyValue("--hero-drift-range")
    ) || 50;
    frameTasks.push(() => {
      const rect = heroPhoto.getBoundingClientRect();
      const viewH = window.innerHeight;
      if (rect.top < viewH && rect.bottom > 0) {
        const progress = (viewH - rect.top) / (viewH + rect.height);
        const drift = (progress - 0.5) * range;
        heroPhoto.style.transform = `translateY(${drift.toFixed(2)}px)`;
      }
    });
  }

  // Ambient wash drifts at a slower rate than the portrait — the depth cue
  // that makes the hero read as parallax rather than a single moving layer.
  // Written as a custom property, not as `transform`: the entrance reveal owns
  // the ambient layer's transform, and an inline one would cancel it. CSS
  // composes the two (see --hero-ambient-shift in media-document.css).
  const heroAmbient = root.querySelector(".grad-hero-ambient");
  if (heroDrift && motionMode !== "still" && heroAmbient) {
    let lastShift = null;
    frameTasks.push(() => {
      const scrollTop = window.scrollY || 0;
      if (scrollTop > window.innerHeight * 1.5) return;
      const shift = Math.round(scrollTop * 0.12);
      if (shift === lastShift) return;
      lastShift = shift;
      heroAmbient.style.setProperty("--hero-ambient-shift", `${shift}px`);
    });
    cleanups.push(() => {
      heroAmbient.style.removeProperty("--hero-ambient-shift");
    });
  }

  if (pointerParallax && canHover && motionMode === "immersive" && heroFrame) {
    const applyPointer = () => {
      if (!heroReady || !pointerActive) return;
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((pointerX - rect.left) / rect.width - 0.5) * 16; // ±8px
      const y = ((pointerY - rect.top) / rect.height - 0.5) * 16;
      heroFrame.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    };
    frameTasks.push(applyPointer);

    const onPointerMove = (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      pointerActive = true;
      scheduleFrame();
    };
    const onPointerLeave = () => {
      pointerActive = false;
      heroFrame.style.transform = "";
    };
    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", onPointerLeave, { passive: true });
    cleanups.push(() => {
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      heroFrame.style.transform = "";
      heroFrame.style.transition = "";
    });
  }

  // ── Scroll indicator fade (hide once the reader starts scrolling) ──
  let scrollHintHidden = false;
  const onFirstScroll = () => {
    if (!scrollHint || scrollHintHidden) return;
    if ((window.scrollY || 0) < 8) return;
    scrollHintHidden = true;
    const scrollEl = root.querySelector(".grad-hero-scroll");
    if (scrollEl) scrollEl.setAttribute("data-hidden", "true");
  };

  const onScroll = () => {
    onFirstScroll();
    scheduleFrame();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  cleanups.push(() => window.removeEventListener("scroll", onScroll));

  // ── Hero entrance choreography (timed sequence) ──
  const heroSection = root.querySelector('[data-section="hero"]');
  const heroChoreography = () => {
    if (!heroSection) return;
    heroSection.setAttribute("data-visible", "true");
    heroSection.classList.add("hero-entered");
    cleanups.push(() => heroSection.classList.remove("hero-entered"));

    const seq = [
      { el: heroSection.querySelector(".grad-hero-ambient"), delay: 150 },
      { el: heroSection.querySelector(".grad-hero-photo-frame"), delay: 350 },
      { el: heroSection.querySelector("[data-hero-name]"), delay: 550 },
      { el: heroSection.querySelector(".grad-hero-rule"), delay: 700 },
      { el: heroSection.querySelector(".grad-hero-objective"), delay: 750 },
      { el: heroSection.querySelector(".grad-hero-meta"), delay: 850 },
      { el: heroSection.querySelector(".grad-hero-contact"), delay: 900 },
      { el: heroSection.querySelector(".grad-hero-scroll"), delay: 1300 },
    ];

    // Subtle compresses the whole entrance into ~400ms.
    const plan =
      motionMode === "immersive" ? seq : seq.map((item, i) => ({ el: item.el, delay: i * 50 }));

    let last = 0;
    plan.forEach(({ el, delay }) => {
      if (!el) return;
      setDelay(el, delay);
      last = Math.max(last, delay);
      requestAnimationFrame(() => el.setAttribute("data-visible", "true"));
    });

    // Once the entrance settles, hand the photo frame a snappy transform
    // transition so the pointer parallax feels responsive (not 0.6s laggy).
    const readyTimer = setTimeout(() => {
      heroReady = true;
      if (heroFrame) heroFrame.style.transition = "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)";
    }, last + 700);
    cleanups.push(() => clearTimeout(readyTimer));
  };
  if (reveals) heroChoreography();

  // ── Section reveal choreography (number → heading → content stagger) ──
  const revealSection = (section) => {
    section.setAttribute("data-visible", "true");
    const number = section.querySelector(".grad-section-number");
    const heading = section.querySelector(".grad-heading");
    const content = section.querySelectorAll(
      ".grad-edu-timeline, .grad-entries, .grad-skills-section, .grad-certificates, .grad-ending"
    );
    if (motionMode === "immersive") {
      setDelay(number, 0);
      setDelay(heading, 80);
      content.forEach((el) => setDelay(el, 200));
    } else {
      setDelay(number, 0);
      setDelay(heading, 30);
      content.forEach((el) => setDelay(el, 60));
    }
  };

  // ── GPA count-up ──
  const gpaEl = gpaCountUp ? root.querySelector("[data-gpa]") : null;
  const gpaOriginal = gpaEl ? gpaEl.textContent : "";
  let gpaRaf = null;
  const animateGPA = () => {
    if (!gpaEl) return;
    const target = parseFloat(gpaEl.getAttribute("data-gpa"));
    if (isNaN(target)) return;
    const duration = motionMode === "immersive" ? 800 : 400;
    const startTime = performance.now();
    gpaEl.textContent = "GPA: 0.00";
    const update = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      gpaEl.textContent = `GPA: ${(target * eased).toFixed(2)}`;
      if (progress < 1) {
        gpaRaf = requestAnimationFrame(update);
      } else {
        gpaEl.textContent = gpaOriginal; // restore the author's exact formatting
        gpaRaf = null;
      }
    };
    if (gpaRaf !== null) cancelAnimationFrame(gpaRaf);
    gpaRaf = requestAnimationFrame(update);
  };

  if (reveals) {
  // 1. Section reveal — fade + slide at 10% intersection.
  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section = entry.target;
        const kind = section.getAttribute("data-section");
        if (kind === "hero") {
          section.setAttribute("data-visible", "true");
        } else {
          revealSection(section);
          if (kind === "education") animateGPA();
        }
        sectionObs.unobserve(section);
      });
    },
    { threshold: 0.1 }
  );
  root.querySelectorAll("[data-section]").forEach((el) => sectionObs.observe(el));
  observers.push(sectionObs);

  // 2. Entry cards — staggered reveal within their section.
  const cardObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const parent = entry.target.closest(".grad-entries");
          if (parent) {
            const cards = [...parent.querySelectorAll("[data-entry-card]")];
            const idx = cards.indexOf(entry.target);
            setDelay(entry.target, idx * 100);
          }
          entry.target.setAttribute("data-visible", "true");
          cardObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  root.querySelectorAll("[data-entry-card]").forEach((el) => cardObs.observe(el));
  observers.push(cardObs);

  // 3. Photos — clip-path + scale reveal.
  const photoObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-visible", "true");
          photoObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  root
    .querySelectorAll(".grad-hero-photo, .grad-entry-photos img, .grad-edu-photo")
    .forEach((el) => photoObs.observe(el));
  observers.push(photoObs);

  // 4. Certificate badges — staggered stamp.
  const certObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const container = entry.target.closest(".grad-certificates");
          if (container) {
            const badges = [...container.querySelectorAll(".grad-cert-badge")];
            const idx = badges.indexOf(entry.target);
            setDelay(entry.target, idx * 70);
          }
          entry.target.setAttribute("data-visible", "true");
          certObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  root.querySelectorAll(".grad-cert-badge").forEach((el) => certObs.observe(el));
  observers.push(certObs);

  // 5. Skill / hobby chips — staggered pop.
  const chipObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const container = entry.target.closest(".grad-chips");
          if (container) {
            const chips = [...container.querySelectorAll(".grad-chip")];
            const idx = chips.indexOf(entry.target);
            setDelay(entry.target, idx * 45);
          }
          entry.target.setAttribute("data-visible", "true");
          chipObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  root.querySelectorAll(".grad-chip").forEach((el) => chipObs.observe(el));
  observers.push(chipObs);

  // ── Reveal failsafe ──
  // If the tab is backgrounded during load, first IntersectionObserver
  // callbacks can be deferred indefinitely and on-screen content stays stuck
  // at opacity:0 (blank sections in preview/exports). After a grace period,
  // force-reveal anything already intersecting the viewport that is still
  // pending; off-screen targets keep their normal scroll reveal.
  const revealFailsafe = setTimeout(() => {
    const viewH = window.innerHeight || 0;
    root.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
      if (el.getAttribute("data-visible") === "true") return;
      const rect = el.getBoundingClientRect();
      if (rect.top < viewH && rect.bottom > 0) el.setAttribute("data-visible", "true");
    });
  }, 2500);
  cleanups.push(() => clearTimeout(revealFailsafe));
  }

  // ── Card tilt (desktop, hover-capable, max 3°) ──
  if (cardTilt && canHover) {
    const bound = [];
    root.querySelectorAll("[data-entry-card]").forEach((card) => {
      let rect = null;
      const onEnter = () => {
        rect = card.getBoundingClientRect(); // cache once — no layout reads while moving
        card.style.transition = "transform 0.12s ease-out";
      };
      const onMove = (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${(x * 3).toFixed(2)}deg) rotateX(${(-y * 3).toFixed(2)}deg) translateY(-2px)`;
      };
      const onLeave = () => {
        rect = null;
        card.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
        card.style.transform = "";
      };
      card.addEventListener("pointerenter", onEnter);
      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);
      bound.push({ card, onEnter, onMove, onLeave });
    });
    cleanups.push(() => {
      bound.forEach(({ card, onEnter, onMove, onLeave }) => {
        card.removeEventListener("pointerenter", onEnter);
        card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerleave", onLeave);
        card.style.transform = "";
        card.style.transition = "";
      });
    });
  }

  // Kick the frame loop once so the progress bar and parallax start correct.
  scheduleFrame();

  // === Custom Cursor (desktop, hover-capable only) ===
  let cursorEl = null;
  let cursorRing = null;
  let cursorRaf = null;

  function initCursor() {
    if (!cursor) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 641px)").matches) return;
    if (motionMode === "still") return;

    // Create cursor elements
    cursorEl = document.createElement("div");
    cursorEl.className = "custom-cursor";
    cursorEl.setAttribute("aria-hidden", "true");

    cursorRing = document.createElement("div");
    cursorRing.className = "custom-cursor-ring";
    cursorRing.setAttribute("aria-hidden", "true");

    document.body.appendChild(cursorEl);
    document.body.appendChild(cursorRing);
    document.body.classList.add("has-custom-cursor");

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    function onMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Check if over interactive element
      const target = e.target;
      const isInteractive = target.closest("a, button, [data-entry-card], .grad-chip, .grad-cert-badge");
      const isImage = target.closest("img, .grad-hero-photo");

      cursorEl.classList.toggle("is-interactive", !!isInteractive);
      cursorEl.classList.toggle("is-image", !!isImage);
      cursorRing.classList.toggle("is-interactive", !!isInteractive);
      cursorRing.classList.toggle("is-image", !!isImage);
    }

    function animateCursor() {
      // Dot follows immediately
      cursorEl.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;

      // Ring follows with slight lag
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.transform = `translate(${ringX - 16}px, ${ringY - 16}px)`;

      cursorRaf = requestAnimationFrame(animateCursor);
    }

    document.addEventListener("pointermove", onMove, { passive: true });
    cursorRaf = requestAnimationFrame(animateCursor);

    // Store cleanup ref
    cursorCleanup = () => {
      document.removeEventListener("pointermove", onMove);
      if (cursorRaf) cancelAnimationFrame(cursorRaf);
      cursorEl?.remove();
      cursorRing?.remove();
      document.body.classList.remove("has-custom-cursor");
    };
  }

  let cursorCleanup = null;
  initCursor();

  // ── Disposer — disconnect observers, drop listeners, cancel rAFs, reset DOM. ──
  return () => {
    cursorCleanup?.();
    observers.forEach((obs) => obs.disconnect());
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch (_) {
        /* noop */
      }
    });
    if (frameId !== null) cancelAnimationFrame(frameId);
    if (gpaRaf !== null) cancelAnimationFrame(gpaRaf);
    frameId = null;
    gpaRaf = null;
    if (gpaEl) gpaEl.textContent = gpaOriginal;
    delayedEls.forEach((el) => {
      el.style.transitionDelay = "";
    });
    root.querySelectorAll("[data-visible]").forEach((el) => el.removeAttribute("data-visible"));
    root.querySelectorAll("[data-hidden]").forEach((el) => el.removeAttribute("data-hidden"));
    if (heroPhoto) heroPhoto.style.transform = "";
    if (heroFrame) {
      heroFrame.style.transform = "";
      heroFrame.style.transition = "";
    }
  };
}

/**
 * The option set the LIVE EDITOR attaches with. Everything that rewrites text
 * nodes (hero-name split, GPA count-up), competes with framer-motion's own
 * reveals, or gets in the way of placing a caret (card tilt, the dot cursor,
 * pointer parallax over the photo's edit controls) is off; the scroll parallax
 * — the reason the preview feels alive — stays on.
 */
export const EDITOR_MOTION = {
  reveals: false,
  heroName: false,
  gpaCountUp: false,
  cardTilt: false,
  cursor: false,
  pointerParallax: false,
  progressBar: true,
  heroDrift: true,
  scrollHint: true,
};

export default attachMediaMotion;
