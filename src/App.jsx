import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import TrustStrip from "./components/TrustStrip";
import AirportTransfer from "./components/AirportTransfer";
import Services from "./components/Services";
import Fleet from "./components/Fleet";
import Process from "./components/Process";
import About from "./components/About";
import FAQ from "./components/FAQ";
import Blog from "./components/Blog";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppCTA from "./components/WhatsAppCTA";
import BookingWizard from "./components/booking/BookingWizard";
import BlogPost from "./components/BlogPost";
import LandingPage from "./components/LandingPage";
import Testimonials from "./components/Testimonials";
import Gallery from "./components/Gallery";
import { getLandingPage } from "./data/landingPages";

const AdminApp = lazy(() => import("./admin/AdminApp"));

function parseRoute(pathname) {
  const clean = pathname.replace(/^\/(tr|en)(?=\/|$)/, "");

  if (clean.startsWith("/admin")) {
    return { type: "admin" };
  }

  const blogMatch = clean.match(/^\/blog\/([^/]+)\/?$/);
  if (blogMatch) return { type: "post", slug: decodeURIComponent(blogMatch[1]) };

  const landing = getLandingPage(clean.replace(/^\//, "").replace(/\/$/, ""));
  if (landing) return { type: "landing", page: landing };

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
        <Header />
        <BlogPost slug={route.slug} navigate={navigate} />
        <Footer />
        <WhatsAppCTA />
      </div>
    );
  }

  if (route.type === "landing") {
    return (
      <div id="top">
        <Header />
        <LandingPage page={route.page} onSearch={setBookingData} />
        <Footer />
        <WhatsAppCTA />
      </div>
    );
  }

  if (bookingData) {
    return (
      <div id="top">
        <Header />
        <BookingWizard bookingData={bookingData} onBack={() => setBookingData(null)} />
        <Footer />
        <WhatsAppCTA />
      </div>
    );
  }

  return (
    <div id="top">
      <Header />
      <main>
        <Hero onSearch={setBookingData} />
        <TrustStrip />
        <AirportTransfer />
        <Services />
        <Fleet />
        <Process />
        <About />
        <Testimonials />
        <Gallery />
        <FAQ />
        <Blog navigate={navigate} />
        <Contact />
      </main>
      <Footer />
      <WhatsAppCTA />
    </div>
  );
}
