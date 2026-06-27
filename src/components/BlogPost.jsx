import { useEffect } from "react";
import { getPostBySlug } from "../data/blogPosts";
import { WHATSAPP_URL } from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import {
  absoluteUrl,
  applyBlogSeo,
  injectBreadcrumbLd,
  removeJsonLd,
  upsertJsonLd,
} from "../i18n/seo";

function injectArticleLd(post, c, lang) {
  const pathFor = lang === "tr" ? `/blog/${post.slug}` : `/${lang}/blog/${post.slug}`;
  upsertJsonLd("ld-article", {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: c.title,
    description: c.excerpt,
    image: absoluteUrl(post.cover),
    inLanguage: lang,
    author: { "@type": "Organization", name: "VIP Transfer" },
    publisher: {
      "@type": "Organization",
      name: "VIP Transfer",
      logo: { "@type": "ImageObject", url: absoluteUrl("/images/viptransfer-logo.png") },
    },
    mainEntityOfPage: absoluteUrl(pathFor),
  });
}

export default function BlogPost({ slug, navigate }) {
  const { t, lang } = useI18n();
  const post = getPostBySlug(slug);
  const c = post ? post.content[lang] || post.content.en : null;

  useEffect(() => {
    if (!post || !c) return undefined;
    applyBlogSeo(post.slug, lang);
    injectArticleLd(post, c, lang);
    const postUrl = absoluteUrl(lang === "tr" ? `/blog/${post.slug}` : `/${lang}/blog/${post.slug}`);
    injectBreadcrumbLd([
      { name: "Home", url: absoluteUrl(lang === "tr" ? "/" : `/${lang}/`) },
      { name: t("blog.eyebrow"), url: absoluteUrl(lang === "tr" ? "/#blog" : `/${lang}/#blog`) },
      { name: c.title, url: postUrl },
    ]);
    return () => {
      removeJsonLd("ld-article");
      removeJsonLd("ld-breadcrumb");
    };
  }, [post, c, lang, t]);

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
      <div className="blogpost-hero">
        <img src={post.cover} alt={c.title} />
      </div>
      <div className="blogpost-inner">
        <button type="button" className="blogpost-back" onClick={() => navigate("/")}>
          ← {t("blog.backToBlog")}
        </button>
        <span className="blogpost-meta">
          {post.date[lang] || post.date.en} · {post.readTime[lang] || post.readTime.en} {t("blog.minRead")}
        </span>
        <h1 className="blogpost-title">{c.title}</h1>
        <p className="blogpost-lead">{c.lead}</p>

        {c.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </section>
        ))}

        {c.conclusion && (
          <section className="blogpost-conclusion">
            <p>{c.conclusion}</p>
          </section>
        )}

        <div className="blogpost-cta">
          <p>{t("blog.ctaText")}</p>
          <a className="btn btn-gold" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            {t("blog.ctaButton")}
          </a>
        </div>
      </div>
    </article>
  );
}
