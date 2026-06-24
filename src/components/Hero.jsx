import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import BookingForm from "./BookingForm";

const HERO_VIDEO = "/videos/luxury-van-opens-v2.mp4";
const HERO_POSTER = "/images/luxury-hero.png";

export default function Hero({ onSearch }) {
  const { t } = useI18n();
  const [showSearch, setShowSearch] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSearch(true), 7000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (isMobile || !videoRef.current) return;
    const video = videoRef.current;
    video.play().catch(() => {});
  }, [isMobile]);

  return (
    <section className={`hero ${videoReady ? "hero-video-ready" : ""}`} id="home">
      <div
        className="hero-poster"
        style={{ backgroundImage: `url("${HERO_POSTER}")` }}
        aria-hidden="true"
      />

      {!isMobile && (
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={HERO_POSTER}
          aria-label={t("hero.videoLabel")}
          onLoadedData={() => setVideoReady(true)}
          onPlaying={() => setVideoReady(true)}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
      )}

      <BookingForm visible={showSearch} onSearch={onSearch} />
    </section>
  );
}
