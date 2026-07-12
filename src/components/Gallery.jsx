import { useI18n } from "../i18n/I18nContext";
import { resolveIntlLocale } from "../i18n/locale";
import SectionHeading from "./SectionHeading";

const posts = [
  {
    image: "/images/cars/maybach.jpg",
    date: "2026-06-22",
    location: "Nişantaşı → İstanbul Airport",
    caption: "Arrivals in true style. Mercedes-Maybach ready at the door.",
    tags: "#viptransfer #maybach #istanbul #luxurytravel",
    likes: 1284,
  },
  {
    image: "/images/cars/van_lüx.png",
    date: "2026-06-20",
    location: "İstanbul Airport → Four Seasons Bosphorus",
    caption: "Family of six, zero stress. V-Class Lux meet & greet.",
    tags: "#viptransfer #vclass #airporttransfer #fourseasons",
    likes: 958,
  },
  {
    image: "/images/cars/van_standart inside.png",
    date: "2026-06-18",
    location: "Onboard · İstanbul",
    caption: "Step inside. Captain seats, ambient light, total comfort.",
    tags: "#interior #vclass #comfort #chauffeur",
    likes: 1742,
  },
  {
    image: "/images/cars/gls.png",
    date: "2026-06-15",
    location: "Bodrum Airport → Yalıkavak Marina",
    caption: "Summer runs along the Aegean. GLS on the move.",
    tags: "#bodrum #gls #marina #summer2026",
    likes: 1103,
  },
  {
    image: "/images/cars/eclass_brabus.png",
    date: "2026-06-12",
    location: "Sabiha Gökçen → Kadıköy",
    caption: "Business class on the road. Smooth, quiet, on time.",
    tags: "#eclass #businesstravel #sabihagokcen",
    likes: 836,
  },
  {
    image: "/images/cars/sprinter_brabus.png",
    date: "2026-06-09",
    location: "İstanbul → Bursa · Group Transfer",
    caption: "Whole crew, one ride. Sprinter group transfer done right.",
    tags: "#sprinter #grouptravel #istanbul #bursa",
    likes: 671,
  },
];

function formatDate(dateStr, lang) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(resolveIntlLocale(lang), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function VerifiedBadge() {
  return (
    <svg className="ig-verified" width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#3897f0"
        d="M12 1.5l2.6 2.1 3.3-.3 1.3 3.1 3.1 1.3-.3 3.3 2.1 2.6-2.1 2.6.3 3.3-3.1 1.3-1.3 3.1-3.3-.3L12 22.5l-2.6-2.1-3.3.3-1.3-3.1-3.1-1.3.3-3.3L-.1 10.5l2.1-2.6-.3-3.3 3.1-1.3 1.3-3.1 3.3.3L12 1.5z"
        transform="translate(0.1 0)"
      />
      <path fill="#fff" d="M10.6 14.6l-2.3-2.3-1.2 1.2 3.5 3.5 6-6-1.2-1.2z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.3 9.3 0 0 1-4-.9L3 20l1.1-4A8.4 8.4 0 1 1 21 11.5z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function Gallery({ showHeading = true }) {
  const { t, lang } = useI18n();
  const handle = t("gallery.handle");

  return (
    <section className="social-feed" id="gallery">
      <div className="container">
        {showHeading && (
          <SectionHeading
            eyebrow={t("gallery.eyebrow")}
            title={t("gallery.title")}
            text={t("gallery.text")}
          />
        )}
        <div className="social-grid">
          {posts.map((post) => (
            <article className="ig-post" key={post.image}>
              <header className="ig-post-head">
                <span className="ig-avatar-ring">
                  <img
                    className="ig-avatar"
                    src="/images/viptransfer-logo.png"
                    alt="VIP Transfer"
                    loading="lazy"
                  />
                </span>
                <div className="ig-user">
                  <span className="ig-name">{handle}<VerifiedBadge /></span>
                  <span className="ig-loc">{post.location}</span>
                </div>
                <button type="button" className="ig-more" aria-label="More">
                  <span />
                  <span />
                  <span />
                </button>
              </header>

              <div className="ig-media">
                <img src={post.image} alt={post.location} loading="lazy" />
              </div>

              <div className="ig-actions">
                <div className="ig-actions-left">
                  <button type="button" className="ig-action ig-action--like" aria-label="Like"><HeartIcon /></button>
                  <button type="button" className="ig-action" aria-label="Comment"><CommentIcon /></button>
                  <button type="button" className="ig-action" aria-label="Share"><ShareIcon /></button>
                </div>
                <button type="button" className="ig-action" aria-label="Save"><BookmarkIcon /></button>
              </div>

              <div className="ig-body">
                <span className="ig-likes">{post.likes.toLocaleString(resolveIntlLocale(lang))} {t("gallery.likes")}</span>
                <p className="ig-caption">
                  <b>{handle}</b> {post.caption}
                </p>
                <p className="ig-tags">{post.tags}</p>
                <span className="ig-comments">{t("gallery.viewComments")}</span>
                <time className="ig-time">{formatDate(post.date, lang)}</time>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
