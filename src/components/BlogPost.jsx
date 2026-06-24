import { useEffect } from "react";
import { getPostBySlug } from "../data/blogPosts";
import { WHATSAPP_URL } from "../data/content";
import { useI18n } from "../i18n/I18nContext";

function injectArticleLd(post, c, lang) {
  const id = "ld-article";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: c.title,
    description: c.excerpt,
    image: `https://viptransfer.com${post.cover}`,
    inLanguage: lang,
    author: { "@type": "Organization", name: "VIP Transfer" },
    publisher: {
      "@type": "Organization",
      name: "VIP Transfer",
      logo: { "@type": "ImageObject", url: "https://viptransfer.com/images/viptransfer-logo.png" },
    },
    mainEntityOfPage: `https://viptransfer.com/blog/${post.slug}`,
  });
}

export default function BlogPost({ slug, navigate }) {
  const { t, lang } = useI18n();
  const post = getPostBySlug(slug);
  const c = post ? post.content[lang] || post.content.en : null;

  useEffect(() => {
    if (!post || !c) return undefined;
    const prevTitle = document.title;
    document.title = `${c.title} | VIP Transfer`;
    injectArticleLd(post, c, lang);
    return () => {
      document.title = prevTitle;
      document.getElementById("ld-article")?.remove();
    };
  }, [post, c, lang]);

  if (!post || !c) {
    return (
      <div className="blogpost">
        <div className="blogpost-inner">
          <button type="button" className="blogpost-back" onClick={() => navigate("/")}>
            ← {t("blog.backToBlog")}
          </button>
          <h1 className="blogpost-title">404</h1>
        </div>
      </div>
    );
  }

  return (
    <article className="blogpost">
      <div className="blogpost-hero" style={{ backgroundImage: `url("${post.cover}")` }}>
        <div className="blogpost-hero-overlay" />
        <div className="blogpost-hero-content">
          <button type="button" className="blogpost-back" onClick={() => navigate("/")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            {t("blog.backToBlog")}
          </button>
          <span className="blogpost-meta">{post.date[lang] || post.date.en} · {post.readTime[lang] || post.readTime.en} {t("blog.minRead")}</span>
          <h1 className="blogpost-title">{c.title}</h1>
        </div>
      </div>

      <div className="blogpost-inner">
        <p className="blogpost-lead">{c.lead}</p>

        {c.sections.map((section, i) => (
          <section className="blogpost-section" key={i}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </section>
        ))}

        <p className="blogpost-conclusion">{c.conclusion}</p>

        <div className="blogpost-cta">
          <div className="blogpost-cta-text">
            <h3>{t("blog.ctaTitle")}</h3>
            <p>{t("blog.ctaText")}</p>
          </div>
          <div className="blogpost-cta-actions">
            <button type="button" className="blogpost-cta-btn blogpost-cta-btn--gold" onClick={() => navigate("/")}>
              {t("blog.ctaButton")}
            </button>
            <a className="blogpost-cta-btn blogpost-cta-btn--wa" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {t("blog.ctaWhatsapp")}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
