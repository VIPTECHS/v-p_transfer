import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import BookingForm from "./BookingForm";

const HERO_FRAME_COUNT = 300;
const HERO_PRELOAD_STEP = 8;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const getHeroFrameSrc = (index) => `/frames/ezgif-frame-${String(index + 1).padStart(3, "0")}.webp`;

const INTRO_START_DELAY_MS = 1500; // wait after load before the opening video plays
const INTRO_HOLD_MS = 2000; // how long the opening video plays before scroll unlocks
const INTRO_FADE_MS = 600;

export default function Hero({ onSearch }) {
  const { t } = useI18n();
  const [frameIndex, setFrameIndex] = useState(0);
  const [sequenceReady, setSequenceReady] = useState(false);
  const [introActive, setIntroActive] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [videoVisible, setVideoVisible] = useState(false);
  const [introFading, setIntroFading] = useState(false);
  const heroRef = useRef(null);
  const latestFrameRef = useRef(0);
  const rafRef = useRef(0);

  const frameSrc = useMemo(() => getHeroFrameSrc(frameIndex), [frameIndex]);

  // Opening sequence: hold the page for ~1.5s, then play the video for ~2s
  // (scroll stays locked the whole time), then fade out and hand off to the
  // scroll-linked frame sequence.
  useEffect(() => {
    if (!introActive) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const startTimer = window.setTimeout(() => setVideoVisible(true), INTRO_START_DELAY_MS);
    const fadeTimer = window.setTimeout(
      () => setIntroFading(true),
      INTRO_START_DELAY_MS + INTRO_HOLD_MS,
    );
    const endTimer = window.setTimeout(() => {
      setVideoVisible(false);
      setIntroActive(false);
      document.body.style.overflow = prevOverflow;
    }, INTRO_START_DELAY_MS + INTRO_HOLD_MS + INTRO_FADE_MS);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(endTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [introActive]);

  // Scroll-linked copy: the "VIP" line fades in after frame 124 (door open).
  const clamp01 = (value) => Math.min(1, Math.max(0, value));
  const vipOpacity = clamp01((frameIndex - 124) / 20);
  // Scroll cue fades out quickly once the user starts scrolling.
  const cueOpacity = introActive ? 0 : clamp01((14 - frameIndex) / 14);

  useEffect(() => {
    const first = new Image();
    first.onload = () => setSequenceReady(true);
    first.src = getHeroFrameSrc(0);

    for (let index = 0; index < HERO_FRAME_COUNT; index += HERO_PRELOAD_STEP) {
      const img = new Image();
      img.src = getHeroFrameSrc(index);
    }
  }, []);

  useEffect(() => {
    const updateFrame = () => {
      const hero = heroRef.current;
      if (!hero) return;

      const distance = Math.max(1, hero.offsetHeight - window.innerHeight);
      const progress = clamp(-hero.getBoundingClientRect().top / distance);
      const nextFrame = Math.round(progress * (HERO_FRAME_COUNT - 1));

      if (nextFrame !== latestFrameRef.current) {
        latestFrameRef.current = nextFrame;
        setFrameIndex(nextFrame);

        for (let offset = 1; offset <= 10; offset += 1) {
          const warmIndex = clamp(nextFrame + offset, 0, HERO_FRAME_COUNT - 1);
          const img = new Image();
          img.src = getHeroFrameSrc(warmIndex);
        }
      }
    };

    const scheduleUpdate = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = 0;
        updateFrame();
      });
    };

    updateFrame();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    const interval = window.setInterval(updateFrame, 80);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.clearInterval(interval);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleHeroWheel = (event) => {
    const hero = heroRef.current;
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    if (rect.top > 0 || rect.bottom < window.innerHeight * 0.45) return;

    const distance = Math.max(1, hero.offsetHeight - window.innerHeight);
    const currentProgress = clamp(latestFrameRef.current / (HERO_FRAME_COUNT - 1));
    const nextProgress = clamp(currentProgress + event.deltaY / distance);
    const nextFrame = Math.round(nextProgress * (HERO_FRAME_COUNT - 1));

    latestFrameRef.current = nextFrame;
    setFrameIndex(nextFrame);
  };

  return (
    <section
      ref={heroRef}
      className={`hero ${sequenceReady ? "hero-sequence-ready" : ""}`}
      id="home"
      onWheelCapture={handleHeroWheel}
    >
      {videoVisible && (
        <div className={`hero-intro-video ${introFading ? "is-fading" : ""}`} aria-hidden="true">
          <video
            src="/videos/video_ana.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            tabIndex={-1}
          />
        </div>
      )}

      <div className="hero-sequence-stage">
        <div className="hero-poster" aria-hidden="true" />
        <img
          className="hero-sequence-canvas"
          src={frameSrc}
          alt=""
          aria-hidden="true"
          draggable="false"
          onLoad={() => setSequenceReady(true)}
        />

        <div className="hero-copy" aria-hidden="true">
          <p
            className="hero-copy-vip"
            style={{
              opacity: vipOpacity,
              transform: `translate(-50%, -50%) translateY(${(1 - vipOpacity) * 34}px)`,
            }}
          >
            {t("hero.vipPre")}
            <br />
            <span className="hero-gold">{t("hero.vipWord")}</span>
            <br />
            {t("hero.vipPost")}
          </p>
        </div>

        <div
          className="hero-scroll-cue"
          aria-hidden="true"
          style={{ opacity: cueOpacity, pointerEvents: "none" }}
        >
          <span className="hero-scroll-cue-label">{t("hero.scrollCue")}</span>
          <svg viewBox="0 0 24 28" width="48" height="56" fill="none">
            <path
              d="M5 6l7 7 7-7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 14l7 7 7-7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <BookingForm visible={!introActive} onSearch={onSearch} />
      </div>
    </section>
  );
}
