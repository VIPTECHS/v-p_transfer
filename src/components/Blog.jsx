import { blogPosts } from "../data/blogPosts";
import { fetchPublicBlogArticles } from "../api/blogPosts";
import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import SectionHeading from "./SectionHeading";

export default function Blog({ navigate }) {
  const { t, lang } = useI18n();
  const [publishedArticles, setPublishedArticles] = useState([]);

  useEffect(() => {
    let active = true;
    fetchPublicBlogArticles().then((articles) => {
      if (active) setPublishedArticles(Array.isArray(articles) ? articles : []);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const open = (slug) => (event) => {
    event.preventDefault();
    navigate?.(`/blog/${slug}`);
  };

  return (
    <section className="section blog" id="blog">
      <SectionHeading
        center
        eyebrow={t("blog.eyebrow")}
        title={t("blog.title")}
        text={t("blog.text")}
      />
      <div className="blog-grid">
        {[...publishedArticles.filter((article) => !blogPosts.some((post) => post.slug === article.slug)), ...blogPosts].slice(0, 6).map((post) => {
          const c = post.translations?.[lang] || post.translations?.en || post.content?.[lang] || post.content?.en;
          if (!c) return null;
          const cover = post.cover || post.coverImage || "/images/cars/gls.png";
          const date = post.date?.[lang] || post.date?.en || new Date(post.publishedAt || post.createdAt).toLocaleDateString(lang === "tr" ? "tr-TR" : lang === "de" ? "de-DE" : "en-GB", { month: "long", year: "numeric" });
          const readTime = post.readTime?.[lang] || post.readTime?.en || Math.max(1, Math.ceil(`${c.title} ${c.excerpt}`.split(/\s+/).length / 200));
          return (
            <article className="blog-card" key={post.slug}>
              <a className="blog-card-cover" href={`/blog/${post.slug}`} onClick={open(post.slug)} aria-label={c.title}>
                <img src={cover} alt={c.title} loading="lazy" />
              </a>
              <div className="blog-card-body">
                <span className="blog-date">{date} · {readTime} {t("blog.minRead")}</span>
                <h3>
                  <a href={`/blog/${post.slug}`} onClick={open(post.slug)}>{c.title}</a>
                </h3>
                <p>{c.excerpt}</p>
                <a className="text-link" href={`/blog/${post.slug}`} onClick={open(post.slug)}>{t("blog.readMore")}</a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
