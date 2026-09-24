/** Self-contained enhancement: also embedded verbatim in exported HTML. */
export default function attachMediaMotion(root) {
  if (!root) return () => {};
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 961px) and (min-height: 701px)");
  const button = root.querySelector("[data-motion-toggle]");
  const nav = root.querySelector(".media-navigation");
  const hero = root.querySelector(".media-hero");
  const heroImage = root.querySelector(".media-hero-photo img");
  const tracks = Array.from(root.querySelectorAll("[data-photo-track]")).map((track) => ({
    track, stack: track.querySelector(".media-photo-stack"), photos: Array.from(track.querySelectorAll("[data-cycle-photo]")),
  }));
  const driftFrames = Array.from(root.querySelectorAll("[data-parallax-frame], [data-cycle-photo]"));
  const navLinks = Array.from(root.querySelectorAll("[data-section-link]"));
  const sections = navLinks.map((link) => ({ link, section: root.querySelector(link.getAttribute("href")) }));
  let paused = false;
  let frame = 0;
  let disposed = false;
  let active = "still";
  let printState = [];
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function paint() {
    frame = 0;
    if (disposed) return;
    const navHeight = nav ? nav.offsetHeight : 74;
    root.style.setProperty("--media-nav-height", navHeight + "px");
    if (active !== "still") {
      if (hero && heroImage) {
        const rect = hero.getBoundingClientRect();
        const shift = clamp(-rect.top * .06, -12, 35);
        heroImage.style.setProperty("--hero-y", shift + "px");
      }
      tracks.forEach(({ track, stack, photos }) => {
        if (active !== "immersive" || photos.length < 2 || !stack) return;
        const rect = track.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const distance = Math.max(1, rect.height - stack.offsetHeight);
        const progress = clamp((navHeight + 24 - rect.top) / distance, 0, 1);
        const position = progress * (photos.length - 1);
        const lower = Math.floor(position);
        photos.forEach((photo, i) => {
          // Keep previous frames opaque underneath the arriving frame: no empty crossfade.
          const opacity = i <= lower ? 1 : i === lower + 1 ? position - lower : 0;
          photo.style.setProperty("--frame-opacity", String(opacity));
          photo.style.setProperty("--frame-scale", String(1.04 - .04 * clamp(position - i + .5, 0, 1)));
          photo.setAttribute("aria-hidden", String(i !== Math.round(position)));
        });
      });
      driftFrames.forEach((element) => {
        if (active === "immersive" && element.hasAttribute("data-cycle-photo")) return;
        const rect = element.getBoundingClientRect();
        if (!rect.height || rect.bottom < 0 || rect.top > window.innerHeight) return;
        const drift = clamp((window.innerHeight / 2 - rect.top - rect.height / 2) * .02, -7, 7);
        element.style.setProperty("--drift", drift + "px");
      });
    }
    let current = null;
    sections.forEach((item) => {
      if (item.section && item.section.getBoundingClientRect().top <= navHeight + 100) current = item.link;
    });
    navLinks.forEach((link) => {
      if (link === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  function schedule() {
    if (!frame && !disposed) frame = requestAnimationFrame(paint);
  }
  function configure() {
    active = !paused && !reduced.matches && desktop.matches ? root.dataset.motion || "still" : "still";
    root.dataset.motionActive = active;
    tracks.forEach(({ track, photos }) => {
      const detailed = root.classList.contains("pace-detailed");
      const height = detailed ? 160 + Math.max(0, photos.length - 1) * 30 : 105 + Math.max(0, photos.length - 1) * 16;
      track.style.setProperty("--track-height", height + "vh");
      photos.forEach((photo) => photo.removeAttribute("aria-hidden"));
    });
    if (button) {
      button.hidden = reduced.matches || !desktop.matches || root.dataset.motion === "still";
      button.textContent = paused ? "Enable motion" : "Pause motion";
      button.setAttribute("aria-pressed", String(paused));
    }
    schedule();
  }
  function toggleMotion() { paused = !paused; configure(); }
  function click(event) {
    const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
    if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = root.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    if (target.tagName === "DETAILS") target.open = true;
    target.scrollIntoView({ block: "start", behavior: active === "still" ? "instant" : "smooth" });
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    try { window.history.replaceState(null, "", link.getAttribute("href")); } catch { /* Local-file history may be restricted. */ }
    schedule();
  }
  function openHash() {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (target && root.contains(target)) {
      if (target.tagName === "DETAILS") target.open = true;
      target.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }
  function beforePrint() {
    printState = Array.from(root.querySelectorAll("details")).map((detail) => [detail, detail.open]);
    printState.forEach(([detail]) => { detail.open = true; });
  }
  function afterPrint() {
    printState.forEach(([detail, open]) => { detail.open = open; });
    printState = [];
    schedule();
  }
  const resize = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
  resize?.observe(root);
  if (nav) resize?.observe(nav);
  button?.addEventListener("click", toggleMotion);
  root.addEventListener("click", click);
  root.addEventListener("load", schedule, true);
  root.addEventListener("toggle", schedule, true);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", configure, { passive: true });
  window.addEventListener("hashchange", openHash);
  window.addEventListener("beforeprint", beforePrint);
  window.addEventListener("afterprint", afterPrint);
  reduced.addEventListener("change", configure);
  desktop.addEventListener("change", configure);
  configure();
  openHash();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resize?.disconnect();
    button?.removeEventListener("click", toggleMotion);
    root.removeEventListener("click", click);
    root.removeEventListener("load", schedule, true);
    root.removeEventListener("toggle", schedule, true);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", configure);
    window.removeEventListener("hashchange", openHash);
    window.removeEventListener("beforeprint", beforePrint);
    window.removeEventListener("afterprint", afterPrint);
    reduced.removeEventListener("change", configure);
    desktop.removeEventListener("change", configure);
    tracks.forEach(({ photos }) => photos.forEach((photo) => photo.removeAttribute("aria-hidden")));
    delete root.dataset.motionActive;
  };
}
