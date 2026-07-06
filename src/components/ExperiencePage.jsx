import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 181;
// Sampled from the source frames (center-top ≈ #030b0d). The page background is
// locked to this value so the letterboxed canvas edges are invisible.
const FRAME_BG = "#030a0b";
const frameSrc = (index) => `/frames/ezgif-frame-${String(index + 1).padStart(3, "0")}.jpg`;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export default function ExperiencePage({ onBook }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const counterRef = useRef(null);
  const framesRef = useRef([]);
  const loadedRef = useRef(new Set());
  const requestedRef = useRef(new Set());
  const targetRef = useRef(0);
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const currentFrameRef = useRef(-1);

  const [entered, setEntered] = useState(false);

  useEffect(() => {
    document.title = "The Experience | VIP Transfer — Cinematic Chauffeur Journey";
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute(
        "content",
        "A cinematic, scroll-linked VIP Transfer experience — from exterior presence to the private cabin, rendered frame-by-frame on canvas for buttery 60fps.",
      );
    }
    // Trigger the hero entrance on the next frame so transitions run.
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) return undefined;

    const context = canvas.getContext("2d", { alpha: false });
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      currentFrameRef.current = -1;
      drawFrame(Math.round(targetRef.current));
    };

    const drawImageCover = (image) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      context.fillStyle = FRAME_BG;
      context.fillRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      const bgScale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const bgWidth = image.naturalWidth * bgScale;
      const bgHeight = image.naturalHeight * bgScale;
      const bgX = (width - bgWidth) / 2;
      const bgY = (height - bgHeight) / 2;
      context.save();
      context.filter = "blur(18px) brightness(0.42) saturate(0.9)";
      context.drawImage(image, bgX, bgY, bgWidth, bgHeight);
      context.restore();

      const maxUpscale = 1.22;
      const fgScale = Math.min(
        (width * 0.92) / image.naturalWidth,
        (height * 0.86) / image.naturalHeight,
        maxUpscale,
      );
      const fgWidth = image.naturalWidth * fgScale;
      const fgHeight = image.naturalHeight * fgScale;
      const fgX = (width - fgWidth) / 2;
      const fgY = (height - fgHeight) / 2;
      context.drawImage(image, fgX, fgY, fgWidth, fgHeight);
    };

    function drawFrame(frameIndex) {
      const index = Math.max(0, Math.min(FRAME_COUNT - 1, frameIndex));
      const drawableIndex = loadedRef.current.has(index) ? index : findNearestLoaded(index);
      const image = framesRef.current[drawableIndex];
      if (!image || !loadedRef.current.has(drawableIndex)) return;
      if (currentFrameRef.current === drawableIndex) return;
      currentFrameRef.current = drawableIndex;
      drawImageCover(image);
      if (counterRef.current) {
        counterRef.current.textContent = String(drawableIndex + 1).padStart(3, "0");
      }
    }

    function findNearestLoaded(index) {
      if (loadedRef.current.size === 0) return 0;
      for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
        const before = index - offset;
        const after = index + offset;
        if (before >= 0 && loadedRef.current.has(before)) return before;
        if (after < FRAME_COUNT && loadedRef.current.has(after)) return after;
      }
      return 0;
    }

    const queueLoad = (index, priority = false) => {
      const safeIndex = Math.max(0, Math.min(FRAME_COUNT - 1, index));
      if (requestedRef.current.has(safeIndex)) return;
      requestedRef.current.add(safeIndex);
      const image = document.createElement("img");
      image.decoding = "async";
      image.loading = "eager";
      image.onload = () => {
        loadedRef.current.add(safeIndex);
        if (priority || Math.abs(safeIndex - Math.round(targetRef.current)) <= 3) {
          currentFrameRef.current = -1;
          ensureLoop();
        }
      };
      image.src = frameSrc(safeIndex);
      if (image.complete && image.naturalWidth > 0) {
        loadedRef.current.add(safeIndex);
        if (priority) {
          currentFrameRef.current = -1;
          ensureLoop();
        }
      }
      framesRef.current[safeIndex] = image;
    };

    const warmAround = (center) => {
      for (let offset = -18; offset <= 24; offset += 1) queueLoad(center + offset);
    };

    const preloadInitial = () => {
      queueLoad(0, true);
      queueLoad(FRAME_COUNT - 1);
      for (let index = 1; index < Math.min(42, FRAME_COUNT); index += 1) queueLoad(index);
      window.setTimeout(() => {
        for (let index = 42; index < FRAME_COUNT; index += 1) queueLoad(index);
      }, 250);
    };

    const progress = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      return total > 0 ? clamp(-rect.top / total) : 0;
    };

    const tick = () => {
      runningRef.current = false;
      const frame = Math.round(targetRef.current);
      warmAround(frame);
      drawFrame(frame);
    };

    const ensureLoop = () => {
      if (!runningRef.current) {
        runningRef.current = true;
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      const p = progress();
      stage.style.setProperty("--p", p.toFixed(4));
      targetRef.current = p * (FRAME_COUNT - 1);
      warmAround(Math.round(targetRef.current));
      drawFrame(Math.round(targetRef.current));
      ensureLoop();
    };

    preloadInitial();
    resize();
    onScroll();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <main
      className={`sv-page${entered ? " is-in" : ""}`}
      lang="en"
      style={{ backgroundColor: FRAME_BG }}
    >
      <div className="sv-grain" aria-hidden="true" />

      <section className="sv-hero" aria-label="VIP Transfer experience introduction">
        <div className="sv-hero-glow" aria-hidden="true" />
        <div className="sv-shell">
          <p className="sv-kicker sv-rise">VIP Transfer — The Experience</p>
          <h1 className="sv-hero-title">
            <span className="sv-line"><span className="sv-rise">Journey</span></span>
            <span className="sv-line"><span className="sv-rise sv-line-accent">Redefined.</span></span>
          </h1>
          <p className="sv-lede sv-rise">
            A cinematic scroll through premium chauffeur travel — from exterior
            presence to the quiet of the private cabin. Every frame, on demand.
          </p>
          <span className="sv-scroll sv-rise">Scroll to Explore</span>
        </div>
        <div className="sv-hero-corner sv-rise" aria-hidden="true">
          <span>Est. 1998</span>
          <span>Chauffeur Collection</span>
        </div>
      </section>

      <section className="sv-sequence" ref={sectionRef} aria-label="Scroll linked cinematic sequence">
        <div className="sv-stage" ref={stageRef}>
          <canvas ref={canvasRef} className="sv-canvas" aria-hidden="true" />
          <div className="sv-vignette" aria-hidden="true" />

          <div className="sv-copy sv-copy--one">
            <p>01</p>
            <h2>Presence before arrival.</h2>
            <span>Studio-dark exterior, quiet reflections, and a calm first impression.</span>
          </div>

          <div className="sv-copy sv-copy--two">
            <p>02</p>
            <h2>Step inside the cabin.</h2>
            <span>Warm ambient light, privacy glass, and lounge-grade comfort.</span>
          </div>

          <div className="sv-copy sv-copy--three">
            <p>03</p>
            <h2>Private comfort, precisely timed.</h2>
            <span>Every arrival, route, and handoff is handled before the journey begins.</span>
          </div>

          <div className="sv-hud" aria-hidden="true">
            <span className="sv-hud-count">
              <b ref={counterRef}>001</b> / {FRAME_COUNT}
            </span>
            <span className="sv-progress"><span /></span>
            <span className="sv-hud-label">Sequence</span>
          </div>
        </div>
      </section>

      <section className="sv-footer-cta" aria-label="Book the VIP Transfer experience">
        <div className="sv-hero-glow sv-hero-glow--warm" aria-hidden="true" />
        <div className="sv-shell">
          <p className="sv-kicker">Private Chauffeur Service</p>
          <h2>Your premium transfer starts here.</h2>
          <p className="sv-lede">
            Airport meet &amp; greet, city-to-city, and bespoke itineraries —
            reserved in a single touch.
          </p>
          <button className="sv-cta" type="button" onClick={onBook}>
            <span>Book the experience</span>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>
    </main>
  );
}
