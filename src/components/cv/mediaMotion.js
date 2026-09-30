/**
 * attachMediaMotion — scroll-triggered animations for the Vietnamese fresh-grad CV.
 *
 * Uses IntersectionObserver for section/card/photo/badge/chip reveals plus a
 * lightweight, rAF-throttled scroll listener for the hero-photo parallax drift.
 * The document itself renders static markup; this script only flips
 * `data-visible="true"` on observed elements (CSS owns every transition) and, in
 * immersive mode, drives the hero photo's transform and the hero name letter reveal.
 *
 * Self-contained: also embedded verbatim in exported HTML via a `?raw` import.
 * Returns a disposer function that tears everything down.
 */
export function attachMediaMotion(root) {
  if (!root) return () => {};

  const motionMode = root.dataset.motion || "immersive";
  if (motionMode === "still") return () => {};

  const REVEAL_SELECTOR =
    "[data-section], [data-entry-card], .grad-hero-photo, .grad-cert-badge, .grad-chip, .grad-entry-photos img, .grad-edu-photo";

  const forceVisible = () => {
    root.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
      el.setAttribute("data-visible", "true");
    });
    // Also show letter-reveal spans immediately
    root.querySelectorAll("[data-hero-name] .hero-letter").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  };

  // Respect prefers-reduced-motion: show everything, animate nothing.
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    forceVisible();
    return () => {};
  }

  // Small screens: skip the ceremony, everything is visible immediately.
  if (window.innerWidth < 641) {
    forceVisible();
    return () => {};
  }

  const observers = [];
  const cleanups = [];

  // ── Hero name letter reveal ──
  const heroNameEl = root.querySelector("[data-hero-name]");
  if (heroNameEl && heroNameEl.textContent.trim()) {
    const text = heroNameEl.textContent;
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
    // Trigger the reveal after a short delay
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

  // 1. Section reveal — fade + slide at 10% intersection.
  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-visible", "true");
          sectionObs.unobserve(entry.target);
        }
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
            entry.target.style.transitionDelay = `${idx * 100}ms`;
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

  // 3. Photos — scale reveal.
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

  // 4. Certificate badges — staggered pop.
  const certObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const container = entry.target.closest(".grad-certificates");
          if (container) {
            const badges = [...container.querySelectorAll(".grad-cert-badge")];
            const idx = badges.indexOf(entry.target);
            entry.target.style.transitionDelay = `${idx * 70}ms`;
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
            entry.target.style.transitionDelay = `${idx * 45}ms`;
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

  // 6. Hero-photo parallax (immersive only) — a dramatic translateY drift.
  let rafId = null;
  let onScroll = null;
  const heroPhoto = root.querySelector("[data-hero-photo]");
  if (motionMode === "immersive" && heroPhoto) {
    onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const rect = heroPhoto.getBoundingClientRect();
        const viewH = window.innerHeight;
        if (rect.top < viewH && rect.bottom > 0) {
          const progress = (viewH - rect.top) / (viewH + rect.height);
          const drift = (progress - 0.5) * 50; // max ±25px
          heroPhoto.style.transform = `scale(1) translateY(${drift}px)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Disposer — disconnect observers, drop listeners, reset attributes.
  return () => {
    observers.forEach((obs) => obs.disconnect());
    if (onScroll) window.removeEventListener("scroll", onScroll);
    if (rafId) cancelAnimationFrame(rafId);
    cleanups.forEach((fn) => fn());
    root.querySelectorAll("[data-visible]").forEach((el) => el.removeAttribute("data-visible"));
    if (heroPhoto) heroPhoto.style.transform = "";
  };
}

export default attachMediaMotion;
