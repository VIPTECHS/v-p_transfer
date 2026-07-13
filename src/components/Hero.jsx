import { useI18n } from "../i18n/I18nContext";
import BookingForm from "./BookingForm";

const HERO_IMAGE_SRC = "/frames/ezgif-frame-300.webp";

export default function Hero({ onSearch }) {
  const { t } = useI18n();

  return (
    <section className="hero" id="home">
      <div className="hero-sequence-stage">
        <img
          className="hero-sequence-canvas"
          src={HERO_IMAGE_SRC}
          alt=""
          aria-hidden="true"
          draggable="false"
          fetchPriority="high"
        />

        <div className="hero-copy">
          <h1 className="hero-copy-vip">
            {t("hero.vipPre")}
            <br />
            <span className="hero-gold">{t("hero.vipWord")}</span>
            <br />
            {t("hero.vipPost")}
          </h1>
        </div>

        <BookingForm visible onSearch={onSearch} />
      </div>
    </section>
  );
}
