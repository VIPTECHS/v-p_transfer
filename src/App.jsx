import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero.jsx?scroll-sequence-v=4";
import AirportTransfer from "./components/AirportTransfer";
import Services from "./components/Services";
import Fleet from "./components/Fleet";
import About from "./components/About";
import Blog from "./components/Blog";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppCTA from "./components/WhatsAppCTA";
import BlogPost from "./components/BlogPost";
import LandingPage from "./components/LandingPage";
import SitePage from "./components/SitePage";
import Testimonials from "./components/Testimonials";
import MediaPage from "./components/MediaPage";
import FAQPage from "./components/FAQPage";
import ExperiencePage from "./components/ExperiencePage";
import { getLandingPage } from "./data/landingPages";
import { getSitePage } from "./data/sitePages";
import { LANG_PREFIX_RE } from "./i18n/locale";
import { useI18n } from "./i18n/I18nContext";
import { applyHomeSeo } from "./i18n/seo";

const AdminApp = lazy(() => import("./admin/AdminApp"));
const BookingWizard = lazy(() => import("./components/booking/BookingWizard"));

function HomeSeo() {
  const { lang } = useI18n();
  useEffect(() => {
    applyHomeSeo(lang);
  }, [lang]);
  return null;
}

function parseRoute(pathname) {
  const clean = pathname.replace(LANG_PREFIX_RE, "");

  if (clean.startsWith("/admin")) {
    return { type: "admin" };
  }

  const blogMatch = clean.match(/^\/blog\/([^/]+)\/?$/);
  if (blogMatch) return { type: "post", slug: decodeURIComponent(blogMatch[1]) };

  const slug = clean.replace(/^\//, "").replace(/\/$/, "");

  if (clean === "/deneyim") return { type: "experience" };

  if (clean === "/medyada-biz") return { type: "media" };

  if (clean === "/yardim") return { type: "faq" };

  const landing = getLandingPage(slug);
  if (landing) return { type: "landing", page: landing };

  const sitePage = getSitePage(slug);
  if (sitePage) return { type: "page", slug: sitePage.slug };

  return { type: "home" };
}

export default function App() {
  const [bookingData, setBookingData] = useState(null);
  const [route, setRoute] = useState(() =>
    typeof window !== "undefined" ? parseRoute(window.location.pathname) : { type: "home" },
  );

  useEffect(() => {
    const onPop = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((path) => {
    window.history.pushState(null, "", path);
    setRoute(parseRoute(path));
    setBookingData(null);
    window.scrollTo(0, 0);
  }, []);

  const startBooking = useCallback(() => {
    setRoute({ type: "home" });
    setBookingData({ type: "transfer" });
    window.scrollTo(0, 0);
  }, []);

  if (route.type === "admin") {
    return (
      <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#888", display: "grid", placeItems: "center" }}>Yükleniyor...</div>}>
        <AdminApp />
      </Suspense>
    );
  }

  if (route.type === "post") {
    return (
      <div id="top">
        <Header isHome={false} navigate={navigate} onBook={startBooking} />
        <BlogPost slug={route.slug} navigate={navigate} />
        <Footer navigate={navigate} />
        <WhatsAppCTA />
      </div>
    );
  }

  if (route.type === "page") {
    return (
      <div id="top">
        <Header isHome={false} navigate={navigate} onBook={startBooking} />
        <SitePage slug={route.slug} navigate={navigate} />
        <Footer navigate={navigate} />
        <WhatsAppCTA />
      </div>
    );
  }

  if (route.type === "landing") {
    return (
      <div id="top">
        <Header isHome={false} navigate={navigate} onBook={startBooking} />
        <LandingPage page={route.page} onSearch={setBookingData} />
        <Footer navigate={navigate} />
        <WhatsAppCTA />
      </div>
    );
  }

  if (route.type === "faq") {
    return (
      <div id="top">
        <Header isHome={false} navigate={navigate} onBook={startBooking} />
        <FAQPage navigate={navigate} />
        <Footer navigate={navigate} />
        <WhatsAppCTA />
      </div>
    );
  }

  if (route.type === "media") {
    return (
      <div id="top">
        <Header isHome={false} navigate={navigate} onBook={startBooking} />
        <MediaPage navigate={navigate} />
        <Footer navigate={navigate} />
        <WhatsAppCTA />
      </div>
    );
  }

  if (route.type === "experience") {
    return (
      <div id="top">
        <ExperiencePage onBook={startBooking} />
      </div>
    );
  }

  if (bookingData) {
    return (
      <div id="top">
        <Header isHome={false} navigate={navigate} onBook={startBooking} />
        <Suspense fallback={<div className="bw-page" style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>…</div>}>
          <BookingWizard bookingData={bookingData} onBack={() => setBookingData(null)} />
        </Suspense>
        <Footer navigate={navigate} />
        <WhatsAppCTA />
      </div>
    );
  }

  return (
    <div id="top">
      <HomeSeo />
      <Header isHome navigate={navigate} onBook={startBooking} />
      <main>
        <Hero onSearch={setBookingData} />
        <AirportTransfer />
        <Fleet onSearch={setBookingData} />
        <Services />
        <About />
        <Testimonials />
        <Blog navigate={navigate} />
        <Contact />
      </main>
      <Footer navigate={navigate} />
      <WhatsAppCTA />
    </div>
  );
}
