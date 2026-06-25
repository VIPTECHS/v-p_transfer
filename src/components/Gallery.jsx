import { useI18n } from "../i18n/I18nContext";
import SectionHeading from "./SectionHeading";

const posts = [
  {
    image: "/images/fleet/v-class-lux.jpg",
    date: "2026-06-20",
    location: "Istanbul Airport → Four Seasons",
  },
  {
    image: "/images/fleet/s-class.jpg",
    date: "2026-06-18",
    location: "Sabiha Gökçen → Kadıköy",
  },
  {
    image: "/images/services/Airport-Transfer.jpg",
    date: "2026-06-15",
    location: "IST Airport Meet & Greet",
  },
  {
    image: "/images/fleet/sprinter-ultra-lux.jpg",
    date: "2026-06-12",
    location: "Istanbul → Bursa VIP Group",
  },
  {
    image: "/images/fleet/maybach.jpg",
    date: "2026-06-10",
    location: "Nişantaşı → Istanbul Airport",
  },
  {
    image: "/images/services/Chauffeur-driven-Car.jpg",
    date: "2026-06-08",
    location: "Bodrum Airport → Yalıkavak",
  },
];

function formatDate(dateStr, lang) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Gallery() {
  const { t, lang } = useI18n();

  return (
    <section className="social-feed" id="gallery">
      <div className="container">
        <SectionHeading
          eyebrow={t("gallery.eyebrow")}
          title={t("gallery.title")}
          text={t("gallery.text")}
        />
        <div className="social-grid">
          {posts.map((post) => (
            <article className="social-card" key={post.image}>
              <div className="social-card-header">
                <img
                  className="social-avatar"
                  src="/images/viptransfer-logo.png"
                  alt="VIP Transfer"
                  loading="lazy"
                />
                <div>
                  <span className="social-name">VIP Transfer</span>
                  <span className="social-date">{formatDate(post.date, lang)}</span>
                </div>
              </div>
              <div className="social-card-image">
                <img src={post.image} alt={post.location} loading="lazy" />
              </div>
              <div className="social-card-body">
                <p className="social-location">📍 {post.location}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
