import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nContext";

const IMG = "/images/luxury-hero.png";

// Cursor-driven "spotlight of colour": a desaturated copy of the hero image
// sits on top of the full-colour original and is punched through by a soft
// radial mask that follows the pointer. Pure CSS mask — no WebGL, no video.
export default function ExperienceReveal() {
  const { t } = useI18n();
  const stageRef = useRef(null);
  const rafRef = useRef(0);
  const target = useRef({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduce || !fine) return undefined; // static full-colour on touch / reduced motion

    const apply = () => {
      rafRef.current = 0;
      stage.style.setProperty("--reveal-x", `${target.current.x}%`);
      stage.style.setProperty("--reveal-y", `${target.current.y}%`);
    };
    const onMove = (event) => {
      const rect = stage.getBoundingClientRect();
      target.current = {
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      };
      if (!rafRef.current) rafRef.current = requestAnimationFrame(apply);
    };
    const onEnter = () => setActive(true);
    const onLeave = () => setActive(false);

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerenter", onEnter);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerenter", onEnter);
      stage.removeEventListener("pointerleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const bg = { backgroundImage: `url(${IMG})` };

  return (
    <section className="reveal-band" aria-label={t("reveal.title")}>
      <div
        ref={stageRef}
        className={`reveal-stage${active ? " is-active" : ""}`}
      >
        <div className="reveal-layer reveal-layer--color" style={bg} aria-hidden="true" />
        <div className="reveal-layer reveal-layer--muted" style={bg} aria-hidden="true" />
        <div className="reveal-scrim" aria-hidden="true" />

        <div className="reveal-content">
          <span className="reveal-eyebrow">{t("reveal.eyebrow")}</span>
          <h2>{t("reveal.title")}</h2>
          <p>{t("reveal.text")}</p>
          <span className="reveal-hint">{t("reveal.hint")}</span>
        </div>
      </div>
    </section>
  );
}
