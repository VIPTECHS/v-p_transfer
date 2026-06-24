const images = [
  { src: "/images/fleet/v-class-lux.jpg", alt: "Mercedes V-Class luxury interior" },
  { src: "/images/fleet/s-class.jpg", alt: "Mercedes S-Class chauffeur car" },
  { src: "/images/services/Airport-Transfer.jpg", alt: "Airport meet and greet service" },
  { src: "/images/fleet/sprinter-ultra-lux.jpg", alt: "Mercedes Sprinter VIP" },
  { src: "/images/fleet/maybach.jpg", alt: "Mercedes Maybach executive" },
  { src: "/images/services/Chauffeur-driven-Car.jpg", alt: "Chauffeur driven premium car" },
];

export default function Gallery() {
  return (
    <section className="gallery" id="gallery">
      <div className="container">
        <p className="eyebrow">GALLERY</p>
        <h2>Premium fleet & service moments</h2>
        <div className="gallery-grid">
          {images.map((img) => (
            <figure key={img.src} className="gallery-item">
              <img src={img.src} alt={img.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
