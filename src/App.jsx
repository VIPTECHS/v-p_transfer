import React, { useEffect, useState } from "react";

const services = [
  ["Chauffeur-driven Car", "Travel in luxury vehicles driven by experts for comfort and peace of mind.", "/images/services/Chauffeur-driven-Car.jpg"],
  ["Intercity Routes", "Enjoy smooth, private journeys between cities with comfort and total flexibility.", "/images/services/Intercity-Routes.jpg"],
  ["Airport Transfer", "Seamless airport rides delivered with comfort, punctuality, and reliability.", "/images/services/Airport-Transfer.jpg"],
  ["Helicopter Charter", "Fly swiftly over city traffic in a private helicopter for time-saving travel.", "/images/services/Helicopter-Charter.jpg"],
  ["Private Jet Charter", "Experience tailored jet flights offering privacy, speed, and absolute comfort.", "/images/services/Private-Jet-Charter.jpg"],
  ["Yacht Charter", "Relax on luxury yachts perfect for leisure, private events, or coastal escapes.", "/images/services/Yacht-Charter.jpg"],
  ["Airport Taxi", "Secure timely rides from the airport with fixed fares and courteous drivers.", "/images/services/Airport-Taxi.jpg"],
  ["Airport Shuttle", "Travel affordably with shared rides that remain safe, quick, and efficient.", "/images/services/Airport-Shuttle.jpg"],
];

const fleet = [
  ["V Class Standard", "6 Passengers", "6 Luggage", "/images/fleet/v-class-standard.jpg"],
  ["V Class Lux", "6 Passengers", "6 Luggage", "/images/fleet/v-class-lux.jpg"],
  ["V Class Ultra Lux", "6 Passengers", "5 Luggage", "/images/fleet/v-class-ultra-lux.jpg"],
  ["Sprinter Standard", "16 Passengers", "16 Luggage", "/images/fleet/sprinter-standard.jpg"],
  ["Sprinter Ultra Lux", "9 Passengers", "9 Luggage", "/images/fleet/sprinter-ultra-lux.jpg"],
  ["E Class", "3 Passengers", "3 Luggage", "/images/fleet/e-class.jpg"],
  ["S Class", "2 Passengers", "3 Luggage", "/images/fleet/s-class.jpg"],
  ["Maybach", "2 Passengers", "3 Luggage", "/images/fleet/maybach.jpg"],
];

const faqs = [
  ["What is included in an airport transfer?", "Your booking includes a private vehicle, professional chauffeur, flight tracking, airport meet and greet, luggage assistance and complimentary waiting time."],
  ["Is the price fixed?", "Yes. The confirmed price includes taxes, tolls and standard airport parking. There are no surge charges or hidden fees."],
  ["Which vehicle should I choose?", "Our booking team can recommend the ideal vehicle based on your passenger count, luggage and preferred level of comfort."],
  ["How long will my chauffeur wait?", "Airport bookings include 60 minutes of complimentary waiting after your flight lands. Other pick-ups include 15 minutes."],
  ["Can I book a return transfer?", "Yes. Add a return journey during booking or contact our 24/7 travel team to arrange a multi-stop itinerary."],
  ["Can I get support through WhatsApp?", "Absolutely. Our travel team is available 24/7 on WhatsApp for bookings, updates and chauffeur coordination."],
];

const Icon = ({ name, size = 22 }) => {
  const paths = {
    plane: <><path d="m3 11 18-5-6 6 3 5-2 1-5-4-4 3-2-1 3-4-5-1Z"/><path d="m11 12 3-9 2 1-1 8"/></>,
    steering: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M3.5 10h17M12 14v7m0-9-5 7m5-7 5 7"/></>,
    route: <><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3"/></>,
    helicopter: <><path d="M7 10h9a4 4 0 0 1 4 4H7a3 3 0 0 1 0-6h4"/><path d="M12 8V5m-5 0h10M4 18h14m-2-4v4M6 14v4"/></>,
    jet: <><path d="M2 16 22 8l-8 7 5 4-2 1-7-3-5 3-2-1 4-4-5 1Z"/><path d="m10 15 3-11 2 1-1 8"/></>,
    yacht: <><path d="m4 14 3 5h10l3-5H4Z"/><path d="M12 14V4l6 8h-6m0-6L7 13"/><path d="M3 22c2-1 3-1 5 0 2-1 3-1 5 0 2-1 3-1 5 0"/></>,
    taxi: <><path d="m5 10 2-5h10l2 5"/><path d="M4 10h16v8H4z"/><path d="M6 18v2m12-2v2M7 14h.01M17 14h.01M9 5V3h6v2"/></>,
    shuttle: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M6 8h12v6H6zM7 19v2m10-2v2M7 16h.01M17 16h.01"/></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
    bag: <><rect x="5" y="7" width="14" height="14" rx="2"/><path d="M9 7V5a3 3 0 0 1 6 0v2M9 11v6m6-6v6"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <a className="brand" href="#top" aria-label="viptransfer.com home">
        <img src="/images/viptransfer-logo.png" alt="viptransfer.com" />
      </a>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
        <span/><span/><span/>
      </button>
      <nav className={open ? "nav open" : "nav"} aria-label="Main navigation">
        {["Home", "Corporate", "Private Services", "Airport Transfer", "Blog", "Help"].map((item) => (
          <a href={`#${item.toLowerCase().replaceAll(" ", "-")}`} onClick={() => setOpen(false)} key={item}>{item}</a>
        ))}
      </nav>
      <div className="header-actions">
        <a className="phone-link" href="tel:+908502554847"><Icon name="phone" size={16}/> +90 850 255 48 47</a>
        <a className="btn btn-gold btn-small" href="#booking">Book Now</a>
      </div>
    </header>
  );
}

function BookingForm({ visible }) {
  const [bookingType, setBookingType] = useState("transfer");

  return (
    <form className={`booking-form ${visible ? "visible" : ""}`} id="booking" onSubmit={(e) => e.preventDefault()}>
      <div className="booking-tabs" aria-label="Booking type">
        <button
          type="button"
          className={bookingType === "transfer" ? "active" : ""}
          onClick={() => setBookingType("transfer")}
        >
          Transfer
        </button>
        <button
          type="button"
          className={bookingType === "hourly" ? "active" : ""}
          onClick={() => setBookingType("hourly")}
        >
          Hourly
        </button>
      </div>

      <div className="form-fields">
        <div className="field-group">
          <label htmlFor="pickup-date" className="field-label">Pickup date &amp; time</label>
          <div className="field-input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="field-icon calendar-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <input
              id="pickup-date"
              type="text"
              defaultValue="Fri, Jun 12, 2026, 02:30"
              aria-label="Pickup date and time"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="from-where" className="field-label">From Where</label>
          <div className="field-input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="3" className="field-icon dot-gold">
              <circle cx="12" cy="12" r="8" fill="#ffffff" />
              <circle cx="12" cy="12" r="3" fill="#d4af37" />
            </svg>
            <input id="from-where" type="text" placeholder="Address, airport, hotel, ..." aria-label="From Where" />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="to-where" className="field-label">To Where</label>
          <div className="field-input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#171717" strokeWidth="3" className="field-icon dot-charcoal">
              <circle cx="12" cy="12" r="8" fill="#ffffff" />
              <circle cx="12" cy="12" r="3" fill="#171717" />
            </svg>
            <input id="to-where" type="text" placeholder="Address, airport, hotel, ..." aria-label="To Where" />
            <button type="button" className="swap-btn" aria-label="Swap directions">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="swap-icon">
                <path d="M7 21V3M7 3l4 4M7 3L3 7M17 3v18M17 21l-4-4M17 21l4-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <button className="btn-search" type="submit">
        Search
      </button>
    </form>
  );
}

function SectionHeading({ eyebrow, title, text, center = false }) {
  return <div className={`section-heading ${center ? "center" : ""}`}><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}

function App() {
  const [activeFaq, setActiveFaq] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSearch(true);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="top">
      <Header />
      <main>
        <section className="hero" id="home">
          <video
            className="hero-video"
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-label="Luxury VIP van interior"
          >
            <source src="/videos/vip-hero-0617.mp4" type="video/mp4" />
          </video>
          <BookingForm visible={showSearch} />
        </section>

        <section className="trust-strip" aria-label="Customer satisfaction and trusted partners">
          <div className="trust-strip-copy">
            <strong>Uncompromising Commitment to Customer Satisfaction</strong>
            <p>We go above and beyond to ensure every journey is smooth, safe, and exceptional.</p>
          </div>
          <div className="trust-strip-brands">
            <img className="partner-logo partner-logo-tripadvisor" src="/images/partners/tripadvisor.png" alt="Tripadvisor" />
            <img className="partner-logo partner-logo-google" src="/images/partners/google-reviews.png" alt="Google Reviews 5.0" />
            <img className="partner-logo partner-logo-kitsab" src="/images/partners/kitsab.png" alt="KITSAB" />
          </div>
        </section>

        <section className="section services" id="private-services">
          <SectionHeading eyebrow="OUR SERVICES" title="Premium transfer solutions, arranged with care." text="Discover a range of premium transfer solutions designed for comfort, reliability, and style." />
          <div className="service-grid">
            {services.map(([title, text, image], index) => (
              <article className={`service-card service-${index + 1}`} key={title}>
                <div className="service-visual">
                  <img src={image} alt={title} loading="lazy" />
                </div>
                <div className="service-copy">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section fleet" id="fleet">
          <SectionHeading
            center
            eyebrow="OUR EXCLUSIVE VEHICLE COLLECTION"
            title="Explore Our Premium Vehicle Fleet"
            text="Discover our diverse range of vehicles, each offering exceptional comfort, style, and capacity to suit every journey. From elegant sedans to spacious vans, VIPTransfer.com ensures your ride matches your needs perfectly."
          />
          <p className="fleet-intro">At VIPTransfer.com, we take pride in our curated fleet of premium vehicles, ensuring safety, comfort, and elegance on every journey. Whether you’re booking an airport transfer, a corporate ride, or transport for a special occasion, our selection from sophisticated sedans to spacious luxury vans is meticulously maintained to deliver a flawless experience. Each vehicle offers generous capacity and refined interiors, reflecting our dedication to exceptional service. Choose the ideal car for your needs and travel with confidence, knowing VIPTransfer.com provides top-quality transportation solutions wherever you go.</p>
          <div className="fleet-grid">
            {fleet.map(([name, passengers, bags, image]) => (
              <article className="vehicle-card" key={name}>
                <div className="vehicle-visual">
                  <img src={image} alt={name} loading="lazy" />
                </div>
                <div className="vehicle-info">
                  <div><small>PREMIUM COLLECTION</small><h3>{name}</h3></div>
                  <div className="vehicle-specs"><span><Icon name="users" size={17}/>{passengers}</span><span><Icon name="bag" size={17}/>{bags}</span></div>
                  <a className="vehicle-select" href="#booking">Select Vehicle <Icon name="arrow" size={16}/></a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section process">
          <SectionHeading center eyebrow="EFFORTLESS BY DESIGN" title="Your journey in four simple steps." />
          <div className="steps">
            {[
              ["01", "Enter Your Route", "Tell us where and when you would like to travel."],
              ["02", "Choose Your Vehicle", "Select the class that best suits your journey."],
              ["03", "Confirm Booking", "Receive a fixed price and instant confirmation."],
              ["04", "Meet Your Chauffeur", "Your chauffeur arrives early and ready to assist."],
            ].map(([number, title, text]) => <div className="step" key={number}><span>{number}</span><div className="step-dot"/><h3>{title}</h3><p>{text}</p></div>)}
          </div>
        </section>

        <section className="trust about" id="corporate">
          <div className="trust-image"><div className="experience"><strong>26+</strong><span>YEARS OF<br/>EXCELLENCE</span></div></div>
          <div className="trust-content">
            <SectionHeading
              eyebrow="ABOUT US"
              title="Local insight. Global standards."
              text="With more than 26 years of expertise, VIPTransfer.com combines local insight with global standards to deliver safe, luxurious, and seamless travel experiences worldwide."
            />
            <div className="about-story">
              <p>At VIPTransfer.com, our story stretches back over 26 years, rooted in a family business deeply connected to the world of tourism. From humble beginnings, we have evolved into far more than just a transfer company, driven by our enduring passion for delivering exceptional travel experiences.</p>
              <p>Through decades of expertise and strong partnerships around the globe, we have established a new standard in transportation, offering journeys defined by safety, comfort, and luxury. Our fleet of premium vehicles and professional drivers ensures that every transfer upholds the highest levels of service and care.</p>
              <p>As a licensed travel agency, we specialise exclusively in pre-booked car services, guaranteeing reliability and peace of mind for our clients. Guided by our philosophy, <strong>“Local in the world,”</strong> we seamlessly blend local insight with global standards, bringing unique touches to every journey.</p>
              <p>What began as an online service in Turkey has now expanded into the United States, the European Union, and the Far East. Day by day, we continue to grow our network, working towards our goal of serving more than 300 airports worldwide by 2025, ensuring that travellers across the globe can experience the VIPTransfer.com difference.</p>
              <p>Beyond land transportation, we are committed to providing our guests with luxurious comfort in the air and at sea, creating seamless connections and unforgettable moments. Every journey with us is designed to transform travel into an experience where every detail matters, and each moment feels special.</p>
              <p>Thousands of satisfied customers trust VIPTransfer.com for their travel needs, confident in our commitment to excellence, discretion, and personalised service. We invite you to discover a world where travel is more than simply reaching your destination; it’s about travelling in style, comfort, and complete peace of mind.</p>
            </div>
            <p className="about-note">Our Turkey operations are carried out by <strong>Türsab A-14186 Dilkar Travel.</strong></p>
          </div>
        </section>

        <section className="section faq" id="help">
          <SectionHeading center eyebrow="GOOD TO KNOW" title="Frequently asked questions." />
          <div className="faq-list">
            {faqs.map(([question, answer], index) => (
              <div className={`faq-item ${activeFaq === index ? "active" : ""}`} key={question}>
                <button onClick={() => setActiveFaq(activeFaq === index ? -1 : index)} aria-expanded={activeFaq === index}>
                  <span><i>0{index + 1}</i>{question}</span><b>{activeFaq === index ? "−" : "+"}</b>
                </button>
                <div className="faq-answer"><p>{answer}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="contact-copy">
            <span className="eyebrow">CONTACT</span>
            <h2>Contact</h2>
            <p>We’re here to help with your travel plans, bookings, or any questions. Reach out to the VIPTransfer.com team for prompt and professional assistance.</p>
          </div>
          <div className="office-grid">
            <article className="office-card">
              <span className="office-number">01</span>
              <h3>Istanbul Office</h3>
              <p className="office-company">Dilkar Travel Türsab A-14186</p>
              <address>Marmara Kule Esentepe mah kelebek sok no 2 D 176 Kartal / İstanbul</address>
              <a href="mailto:info@viptransfer.com">info@viptransfer.com</a>
              <a href="tel:+908502554847">+90 850 255 48 47</a>
            </article>
            <article className="office-card">
              <span className="office-number">02</span>
              <h3>Cyprus Office</h3>
              <address>Ankara Cd. Green Star Plaza No:11 Alsancak Girne/KKTC</address>
              <a href="mailto:info@viptransfer.com">info@viptransfer.com</a>
              <a href="tel:+908502554847">+90 850 255 48 47</a>
            </article>
            <article className="office-card">
              <span className="office-number">03</span>
              <h3>England Office</h3>
              <address>11 Coldbath Square<br/>London England</address>
              <a href="mailto:info@viptransfer.com">info@viptransfer.com</a>
              <a href="tel:+908502554847">+90 850 255 48 47</a>
            </article>
          </div>
          <p className="operations-note">Our Turkey operations are carried out by <strong>Türsab A-14186 Dilkar Travel.</strong></p>
        </section>
      </main>

      <footer>
        <div className="footer-top">
          <div className="footer-brand"><a className="brand" href="#top"><img src="/images/viptransfer-logo.png" alt="viptransfer.com" /></a><p>Exceptional journeys, personally arranged.</p><div className="socials"><a href="#instagram">Ig</a><a href="#linkedin">Li</a><a href="#facebook">Fb</a></div></div>
          {[
            ["Corporate", "About Us", "Corporate Accounts", "Travel Partners"],
            ["Services", "Airport Transfer", "Chauffeur Service", "Intercity Routes"],
            ["Private Services", "Private Jet", "Helicopter Charter", "Yacht Charter"],
            ["Legal", "Privacy Policy", "Terms & Conditions", "Cookie Policy"],
          ].map(([title, ...links]) => <div className="footer-column" key={title}><h3>{title}</h3>{links.map(link => <a href="#contact" key={link}>{link}</a>)}</div>)}
        </div>
        <div className="footer-bottom"><span>© 2026 viptransfer.com. All rights reserved.</span><span>London · Paris · Dubai · Istanbul · Worldwide</span></div>
      </footer>
    </div>
  );
}

export default App;
