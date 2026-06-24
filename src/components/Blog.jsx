import { blogPosts } from "../data/blogPosts";
import { useI18n } from "../i18n/I18nContext";
import SectionHeading from "./SectionHeading";

export default function Blog({ navigate }) {
  const { t, lang } = useI18n();

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
        {blogPosts.map((post) => {
          const c = post.content[lang] || post.content.en;
          return (
            <article className="blog-card" key={post.slug}>
              <a className="blog-card-cover" href={`/blog/${post.slug}`} onClick={open(post.slug)} aria-label={c.title}>
                <img src={post.cover} alt={c.title} loading="lazy" />
              </a>
              <div className="blog-card-body">
                <span className="blog-date">{post.date[lang] || post.date.en} · {post.readTime[lang] || post.readTime.en} {t("blog.minRead")}</span>
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
