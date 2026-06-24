import { useI18n } from "../i18n/I18nContext";

const reviews = [
  { name: "James M.", location: "London", text: "Flawless IST pickup. Driver tracked our delayed flight and waited with a sign. Highly recommend.", rating: 5 },
  { name: "Ayşe K.", location: "Istanbul", text: "Mercedes V-Class was spotless. Professional service from booking to drop-off.", rating: 5 },
  { name: "Marco R.", location: "Milan", text: "Fixed price, no surprises. Best airport transfer experience in Istanbul.", rating: 5 },
  { name: "Sarah L.", location: "New York", text: "Booked SAW to hotel at midnight. Smooth, safe, and premium throughout.", rating: 5 },
];

export default function Testimonials() {
  const { t } = useI18n();

  return (
    <section className="testimonials" id="reviews">
      <div className="container">
        <p className="eyebrow">{t("testimonials.eyebrow")}</p>
        <h2>{t("testimonials.title")}</h2>
        <div className="testimonials-grid">
          {reviews.map((r) => (
            <article key={r.name} className="testimonial-card">
              <div className="testimonial-stars" aria-label={`${r.rating} stars`}>
                {"★".repeat(r.rating)}
              </div>
              <p className="testimonial-text">"{r.text}"</p>
              <footer>
                <strong>{r.name}</strong>
                <span>{r.location}</span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
