import { useEffect, useState } from "react";
import { getPostBySlug } from "../data/blogPosts";
import { fetchPublicBlogArticle } from "../api/blogPosts";
import { WHATSAPP_URL } from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import {
  absoluteUrl,
  applyBlogSeo,
  applyPageSeo,
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
    image: absoluteUrl(post.cover || post.coverImage || "/images/viptransfer-logo.png"),
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
  const staticPost = getPostBySlug(slug);
  const [remotePost, setRemotePost] = useState(null);
  const [remoteLoading, setRemoteLoading] = useState(!staticPost);
  useEffect(() => {
    if (staticPost) {
      setRemoteLoading(false);
      return undefined;
    }
    let active = true;
    setRemoteLoading(true);
    setRemotePost(null);
    fetchPublicBlogArticle(slug)
      .then((article) => { if (active) setRemotePost(article); })
      .catch(() => { if (active) setRemotePost(null); })
      .finally(() => { if (active) setRemoteLoading(false); });
    return () => { active = false; };
  }, [slug, staticPost]);

  const post = staticPost || remotePost;
  const c = post ? (post.content?.[lang] || post.translations?.[lang] || post.content?.en || post.translations?.en || post.translations?.tr) : null;
  const cover = post?.cover || post?.coverImage || "/images/cars/gls.png";
  const date = post?.date?.[lang] || post?.date?.en || (post?.publishedAt || post?.createdAt
    ? new Date(post.publishedAt || post.createdAt).toLocaleDateString(lang === "tr" ? "tr-TR" : lang === "de" ? "de-DE" : "en-GB", { month: "long", year: "numeric" })
    : "");
  const readTime = post?.readTime?.[lang] || post?.readTime?.en || (c ? Math.max(1, Math.ceil(`${c.title} ${c.lead} ${c.sections?.flatMap((section) => section.paragraphs || []).join(" ")}`.split(/\s+/).length / 200)) : 1);

  useEffect(() => {
    if (!post || !c) return undefined;
    if (staticPost) applyBlogSeo(post.slug, lang);
    else {
      const postPath = lang === "tr" ? `/blog/${post.slug}` : `/${lang}/blog/${post.slug}`;
      applyPageSeo({
        title: `${c.title} | VIP Transfer`,
        description: c.excerpt,
        canonical: absoluteUrl(postPath),
        ogImage: absoluteUrl(cover),
      });
    }
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
  }, [post, c, lang, t, staticPost, cover]);

  if (!post || !c) {
    if (remoteLoading) return <div className="blogpost"><div className="blogpost-inner"><p>{t("common.loading") || "Yükleniyor…"}</p></div></div>;
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
        <img src={cover} alt={c.title} />
      </div>
      <div className="blogpost-inner">
        <button type="button" className="blogpost-back" onClick={() => navigate("/")}>
          ← {t("blog.backToBlog")}
        </button>
        <span className="blogpost-meta">
          {date} · {readTime} {t("blog.minRead")}
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
