import { useEffect, useRef } from "react";
import { useI18n } from "../i18n/I18nContext";

const VIDEO = "/videos/video_ana.mp4";
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

// Atoms "scroll scrub": scroll progress is mapped continuously to
// video.currentTime. The video stays paused; a single requestAnimationFrame
// loop eases a displayed time toward the scroll target and writes currentTime
// at most once per frame. "VIP TRANSFER" holds, then fades as you scroll in,
// and the pinned stage hands off to the real homepage below.
export default function ScrollIntro() {
  const { t } = useI18n();
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const videoRef = useRef(null);

  const durationRef = useRef(0);
  const targetRef = useRef(0);
  const displayRef = useRef(0);
  const rafRef = useRef(0);
  const runningRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!section || !stage || !video) return undefined;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      section.classList.add("scroll-intro--static");
      return undefined;
    }

    const progress = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      return total > 0 ? clamp(-rect.top / total) : 0;
    };

    // Single rAF loop: ease displayed time toward target, write once per frame.
    const tick = () => {
      const duration = durationRef.current;
      if (!duration) {
        runningRef.current = false;
        return;
      }
      const target = targetRef.current;
      const next = displayRef.current + (target - displayRef.current) * 0.12;
      const settled = Math.abs(target - next) < 0.004;
      displayRef.current = settled ? target : next;
      if (video.readyState >= 1) {
        try {
          video.currentTime = displayRef.current;
        } catch {
          /* seeking not ready yet */
        }
      }
      if (settled) {
        runningRef.current = false;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
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
      if (durationRef.current) {
        targetRef.current = p * durationRef.current;
        ensureLoop();
      }
    };

    const onMeta = () => {
      durationRef.current = video.duration || 0;
      onScroll();
    };

    // Keep the video paused — we only seek it.
    video.pause();
    if (video.readyState >= 1 && video.duration) onMeta();
    else video.addEventListener("loadedmetadata", onMeta);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="scroll-intro" ref={sectionRef} aria-label="VIP Transfer">
      <div className="si-stage" ref={stageRef}>
        <video
          ref={videoRef}
          className="si-video"
          src={VIDEO}
          muted
          playsInline
          preload="auto"
          tabIndex={-1}
          aria-hidden="true"
        />
        <div className="si-scrim" aria-hidden="true" />
        <div className="si-title">
          <span className="si-eyebrow">{t("intro.eyebrow")}</span>
          <span className="si-wordmark">VIP TRANSFER</span>
        </div>
        <div className="si-cue" aria-hidden="true">
          <span>{t("intro.scroll")}</span>
          <span className="si-cue-line" />
        </div>
      </div>
    </section>
  );
}
