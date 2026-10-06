const API_URL = import.meta.env.VITE_BOOKING_API_URL || "/api";

async function get(path) {
  const response = await fetch(`${API_URL.replace(/\/$/, "")}/blog-posts/public${path}`);
  if (!response.ok) throw new Error("BLOG_POSTS_UNAVAILABLE");
  return response.json();
}

export const fetchPublicBlogArticles = () => get("");
export const fetchPublicBlogArticle = (slug) => get(`/${encodeURIComponent(slug)}`);
