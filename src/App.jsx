import React, { useEffect, useState } from "react";

const services = [
  ["plane", "Airport Transfer", "A seamless airport welcome with flight tracking and complimentary waiting time."],
  ["steering", "Chauffeur-driven Car", "A professional chauffeur and immaculate vehicle, available by the hour or day."],
  ["route", "Intercity Routes", "Private, comfortable long-distance travel between cities on your own schedule."],
  ["helicopter", "Helicopter Charter", "Skip the traffic with exclusive point-to-point helicopter journeys."],
  ["jet", "Private Jet Charter", "Bespoke private aviation with discreet, end-to-end ground coordination."],
  ["yacht", "Yacht Charter", "Curated yacht experiences for private escapes, events and coastal transfers."],
  ["taxi", "Airport Taxi", "Dependable fixed-price airport journeys with premium service standards."],
  ["shuttle", "Airport Shuttle", "Efficient group transportation for hotels, events and travel partners."],
];

const fleet = [
  ["V Class Standard", "Up to 6", "6 bags", "Executive comfort"],
  ["V Class Lux", "Up to 6", "6 bags", "Refined interior"],
  ["V Class Ultra Lux", "Up to 5", "5 bags", "First-class cabin"],
  ["Sprinter Standard", "Up to 13", "13 bags", "Group travel"],
  ["Sprinter Ultra Lux", "Up to 9", "9 bags", "Private lounge"],
  ["E Class", "Up to 3", "2 bags", "Business sedan"],
  ["S Class", "Up to 3", "2 bags", "Flagship comfort"],
  ["Maybach", "Up to 3", "2 bags", "The finest arrival"],
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
        <a className="phone-link" href="tel:+442045700700"><Icon name="phone" size={17}/> +44 20 4570 0700</a>
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
    }, 2000);
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
            <source src="/videos/luxury-van-v3.mp4" type="video/mp4" />
          </video>
          <BookingForm visible={showSearch} />
          <img src="/images/vip-badge.png" alt="VIP badge" className="hero-badge" />
        </section>

        <section className="section services" id="private-services">
          <SectionHeading eyebrow="TAILORED JOURNEYS" title="Every journey, impeccably arranged." text="From the airport runway to the marina, our specialists coordinate every detail with absolute discretion." />
          <div className="service-grid">
            {services.map(([icon, title, text], index) => (
              <article className={`service-card service-${index + 1}`} key={title}>
                <div className="service-number">0{index + 1}</div>
                <div className="service-icon"><Icon name={icon} size={26}/></div>
                <div className="service-copy"><h3>{title}</h3><p>{text}</p><a href="#contact">View Details <Icon name="arrow" size={16}/></a></div>
              </article>
            ))}
          </div>
        </section>

        <section className="section fleet" id="fleet">
          <SectionHeading center eyebrow="THE VIPTRANSFER.COM FLEET" title="Travel without compromise." text="A curated fleet of late-model vehicles, selected for comfort, presence and immaculate condition." />
          <div className="fleet-grid">
            {fleet.map(([name, passengers, bags, note], index) => (
              <article className="vehicle-card" key={name}>
                <div className={`vehicle-visual vehicle-${index + 1}`}>
                  <span>{note}</span>
                  <div className="car-silhouette"><i/><b/></div>
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

        <section className="trust" id="corporate">
          <div className="trust-image"><div className="experience"><strong>26+</strong><span>YEARS OF<br/>EXCELLENCE</span></div></div>
          <div className="trust-content">
            <SectionHeading eyebrow="A STANDARD ABOVE" title="Built on experience. Defined by service." text="For more than two decades, we have looked after executives, families and distinguished guests with thoughtful, dependable travel." />
            <div className="trust-list">
              {["Professional, vetted chauffeurs", "Licensed travel agency", "24/7 global assistance", "Transparent fixed pricing", "Flight monitoring included", "Discreet corporate accounts"].map((item) => <div key={item}><span><Icon name="check" size={15}/></span>{item}</div>)}
            </div>
            <a className="text-link" href="#contact">Discover the viptransfer.com standard <Icon name="arrow" size={17}/></a>
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
            <span className="eyebrow">YOUR JOURNEY AWAITS</span>
            <h2>Reserve Your Premium Transfer Now.</h2>
            <p>Our travel specialists are available around the clock to create a journey tailored entirely to you.</p>
            <div className="contact-methods">
              <a href="tel:+442045700700"><small>CALL US</small><strong>+44 20 4570 0700</strong></a>
              <a href="mailto:info@viptransfer.com"><small>EMAIL US</small><strong>info@viptransfer.com</strong></a>
            </div>
          </div>
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-row"><label><span>Your name</span><input placeholder="Full name"/></label><label><span>Contact number</span><input type="tel" placeholder="+44"/></label></div>
            <label><span>Email address</span><input type="email" placeholder="name@email.com"/></label>
            <label><span>How can we assist?</span><textarea rows="3" placeholder="Tell us about your journey..."/></label>
            <button className="btn btn-gold" type="submit">Send Enquiry <Icon name="arrow" size={18}/></button>
          </form>
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
