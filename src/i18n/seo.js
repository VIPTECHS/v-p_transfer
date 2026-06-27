import { getPostBySlug } from "../data/blogPosts";
import { getLandingPage } from "../data/landingPages";
import { getSitePage } from "../data/sitePages";
import { translations } from "./translations";

export const SITE_URL = "https://viptransfer.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/viptransfer-logo.png`;

const LANGS = ["tr", "en", "de"];

export function absoluteUrl(path) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean === "/" ? "/" : clean}`;
}

export function buildAlternates(pathBuilder) {
  const alternates = LANGS.map((lang) => ({
    hreflang: lang,
    href: absoluteUrl(pathBuilder(lang)),
  }));
  alternates.push({ hreflang: "x-default", href: absoluteUrl(pathBuilder("tr")) });
  return alternates;
}

function setMeta(selector, attr, value) {
  const el = document.querySelector(selector);
  if (el && value != null) el.setAttribute(attr, value);
}

function upsertLink(id, rel, attrs) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("link");
    el.id = id;
    document.head.appendChild(el);
  }
  el.rel = rel;
  Object.entries(attrs).forEach(([key, val]) => {
    if (val != null) el.setAttribute(key, val);
  });
}

function clearDynamicHreflang() {
  document.querySelectorAll("link[data-seo-dynamic]").forEach((el) => el.remove());
}

export function applyPageSeo({
  title,
  description,
  canonical,
  alternates = [],
  ogImage = DEFAULT_OG_IMAGE,
  ogTitle,
}) {
  if (title) document.title = title;
  if (description) {
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[name="twitter:description"]', "content", description);
  }
  const ogT = ogTitle || title;
  if (ogT) {
    setMeta('meta[property="og:title"]', "content", ogT);
    setMeta('meta[name="twitter:title"]', "content", ogT);
  }
  if (canonical) {
    upsertLink("seo-canonical", "canonical", { href: canonical });
    setMeta('meta[property="og:url"]', "content", canonical);
  }
  if (ogImage) {
    setMeta('meta[property="og:image"]', "content", ogImage);
    setMeta('meta[name="twitter:image"]', "content", ogImage);
  }

  clearDynamicHreflang();
  alternates.forEach(({ hreflang, href }) => {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = hreflang;
    link.href = href;
    link.dataset.seoDynamic = "1";
    document.head.appendChild(link);
  });
}

export function applyHomeSeo(lang) {
  const dict = translations[lang] || translations.en;
  const seo = dict.seo || {};
  const path = lang === "tr" ? "/" : `/${lang}/`;
  applyPageSeo({
    title: seo.title,
    description: seo.description,
    ogTitle: seo.ogTitle || seo.title,
    canonical: absoluteUrl(path),
    alternates: buildAlternates((l) => (l === "tr" ? "/" : `/${l}/`)),
  });
}

export function applyBlogSeo(slug, lang) {
  const post = getPostBySlug(slug);
  if (!post) return;
  const c = post.content[lang] || post.content.en;
  if (!c) return;
  const pathFor = (l) => (l === "tr" ? `/blog/${slug}` : `/${l}/blog/${slug}`);
  applyPageSeo({
    title: `${c.title} | VIP Transfer`,
    description: c.excerpt,
    canonical: absoluteUrl(pathFor(lang)),
    alternates: buildAlternates(pathFor),
    ogImage: absoluteUrl(post.cover),
  });
}

export function applyLandingSeo(slug, lang) {
  const page = getLandingPage(slug);
  if (!page) return;
  const title = page.heroTitle[lang] || page.heroTitle.en;
  const description = page.heroSubtitle[lang] || page.heroSubtitle.en;
  const pathFor = (l) => (l === "tr" ? `/${slug}` : `/${l}/${slug}`);
  applyPageSeo({
    title: `${title} | VIP Transfer`,
    description,
    canonical: absoluteUrl(pathFor(lang)),
    alternates: buildAlternates(pathFor),
  });
}

export function applySitePageSeo(slug, lang) {
  const page = getSitePage(slug);
  if (!page) return;
  const c = page.content[lang] || page.content.en;
  if (!c) return;
  const pathFor = (l) => (l === "tr" ? `/${slug}` : `/${l}/${slug}`);
  applyPageSeo({
    title: `${c.title} | VIP Transfer`,
    description: c.intro,
    canonical: absoluteUrl(pathFor(lang)),
    alternates: buildAlternates(pathFor),
  });
}

export function applyRouteSeo(route, lang) {
  if (route.type === "post") {
    applyBlogSeo(route.slug, lang);
    return;
  }
  if (route.type === "landing") {
    applyLandingSeo(route.page.slug, lang);
    return;
  }
  if (route.type === "page") {
    applySitePageSeo(route.slug, lang);
    return;
  }
  applyHomeSeo(lang);
}

export function upsertJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function removeJsonLd(id) {
  document.getElementById(id)?.remove();
}

export function injectBreadcrumbLd(items) {
  upsertJsonLd("ld-breadcrumb", {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

export function injectServiceLd({ name, description, url }) {
  upsertJsonLd("ld-service", {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: { "@type": "Organization", name: "VIP Transfer", url: SITE_URL },
    areaServed: "Istanbul, Turkey",
    url,
  });
}
