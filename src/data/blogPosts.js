// Blog yazıları — tek kaynak. Hem liste (Blog.jsx) hem detay (BlogPost.jsx) buradan beslenir.
// Her yazı dile göre tam içerik taşır: lead, başlıklı bölümler ve sonuç.

export const blogPosts = [
  {
    slug: "dogru-araci-secmek",
    key: "b1",
    cover: "/images/cars/gls.png",
    readTime: { tr: 6, en: 6 },
    date: { tr: "Mayıs 2026", en: "May 2026" },
    content: {
      tr: {
        title: "Havalimanı transferiniz için doğru aracı nasıl seçersiniz",
        excerpt: "Sedanlardan sprinterlere — yolcu ve bagaj sayısına göre araç sınıfı seçim rehberi.",
        lead: "Doğru araç seçimi, konforlu bir transferin temelidir. Yanlış sınıf bir araç, dar bir yolculuğa ya da gereksiz bir masrafa dönüşebilir. Bu rehberde, yolcu sayınıza, bagajınıza ve seyahat amacınıza göre size en uygun aracı nasıl seçeceğinizi adım adım anlatıyoruz.",
        sections: [
          {
            heading: "Önce iki soruyu yanıtlayın",
            paragraphs: [
              "Araç seçimine başlamadan önce iki temel soruyu netleştirin: Kaç kişi seyahat ediyorsunuz ve toplam kaç parça bagajınız var? Bu iki sayı, uygun araç sınıfını büyük ölçüde belirler.",
              "Unutmayın: koltuk sayısı kadar bagaj kapasitesi de önemlidir. Dört kişilik bir grup, büyük valizlerle seyahat ediyorsa, dört koltuklu bir sedan yetersiz kalabilir.",
            ],
          },
          {
            heading: "Sedan: çiftler ve iş seyahatleri için",
            paragraphs: [
              "Mercedes E Serisi ve S Serisi sedanlarımız, bir veya iki yolcu için ideal seçimdir. Sessiz, zarif ve konforlu kabinleriyle iş toplantısına ya da özel bir akşam yemeğine giderken mükemmel bir izlenim bırakır.",
              "E Serisi günlük transferler için dengeli bir konfor sunarken, S Serisi ve Maybach üst düzey misafirler, VIP karşılamalar ve özel günler için tasarlanmıştır.",
            ],
          },
          {
            heading: "V Serisi & Sprinter: aileler ve gruplar için",
            paragraphs: [
              "Kalabalık bir aile, arkadaş grubu ya da kurumsal bir ekip için Mercedes V Serisi (Vito) araçlarımız 6 yolcuya kadar geniş bir iç hacim ve bol bagaj alanı sunar.",
              "Daha büyük gruplarda ise Sprinter araçlarımız 9 ila 16 yolcuya kadar konforlu bir çözümdür. Bol bagajlı havalimanı transferlerinde herkesin ve her valizin rahatça sığması için en güvenli tercihtir.",
            ],
          },
          {
            heading: "Emin değilseniz, sorun",
            paragraphs: [
              "Hangi sınıfın size uygun olduğundan emin değilseniz, rezervasyon ekibimiz yolcu sayınıza, bagajınıza ve konfor beklentinize göre ideal aracı ücretsiz olarak önerir. WhatsApp üzerinden birkaç dakika içinde net bir tavsiye alabilirsiniz.",
            ],
          },
        ],
        conclusion: "Doğru araç sınıfını seçmek, yolculuğunuzun konforunu doğrudan etkiler. Yolcu ve bagaj sayınızı netleştirin, seyahat amacınızı düşünün; gerisini biz hallederiz.",
      },
      en: {
        title: "How to choose the right vehicle for your airport transfer",
        excerpt: "From sedans to sprinters — a practical guide to matching vehicle class with passengers and luggage.",
        lead: "Choosing the right vehicle is the foundation of a comfortable transfer. The wrong class can mean a cramped journey or an unnecessary expense. In this guide we walk you through how to pick the ideal vehicle based on your passenger count, luggage and the purpose of your trip.",
        sections: [
          {
            heading: "Start with two questions",
            paragraphs: [
              "Before choosing a vehicle, clarify two essentials: how many people are travelling, and how many pieces of luggage do you have in total? These two numbers largely determine the right vehicle class.",
              "Remember: luggage capacity matters just as much as seat count. A group of four travelling with large suitcases may not fit comfortably in a four-seat sedan.",
            ],
          },
          {
            heading: "Sedan: for couples and business travel",
            paragraphs: [
              "Our Mercedes E-Class and S-Class sedans are the ideal choice for one or two passengers. With quiet, elegant and comfortable cabins, they make a perfect impression on the way to a meeting or a special dinner.",
              "The E-Class offers balanced comfort for everyday transfers, while the S-Class and Maybach are designed for high-profile guests, VIP welcomes and special occasions.",
            ],
          },
          {
            heading: "V-Class & Sprinter: for families and groups",
            paragraphs: [
              "For a large family, a group of friends or a corporate team, our Mercedes V-Class (Vito) vehicles offer generous interior space and ample luggage room for up to 6 passengers.",
              "For larger groups, our Sprinters comfortably carry 9 to 16 passengers. They are the safest choice for airport transfers with plenty of luggage, ensuring everyone and every suitcase fits with ease.",
            ],
          },
          {
            heading: "Not sure? Just ask",
            paragraphs: [
              "If you are unsure which class suits you, our booking team will gladly recommend the ideal vehicle based on your passenger count, luggage and comfort expectations — free of charge. You can get a clear recommendation within minutes on WhatsApp.",
            ],
          },
        ],
        conclusion: "Choosing the right vehicle class directly shapes the comfort of your journey. Clarify your passenger and luggage count, consider the purpose of your trip, and leave the rest to us.",
      },
    },
  },
  {
    slug: "istanbul-havalimani-transferleri",
    key: "b2",
    cover: "/images/blog/istanbul-airport.jpg",
    readTime: { tr: 7, en: 7 },
    date: { tr: "Nisan 2026", en: "April 2026" },
    content: {
      tr: {
        title: "İstanbul havalimanı transferleri: varışta neler beklemelisiniz",
        excerpt: "IST ve SAW varışları için karşılama, bekleme süreleri ve sabit fiyatlar açıklanıyor.",
        lead: "İstanbul, iki büyük havalimanıyla dünyanın en yoğun ulaşım merkezlerinden biri. İstanbul Havalimanı (IST) ve Sabiha Gökçen (SAW) varışlarında sorunsuz, lüks bir karşılama deneyimi için neler beklemeniz gerektiğini açıklıyoruz.",
        sections: [
          {
            heading: "İniş öncesi: uçuşunuzu biz takip ederiz",
            paragraphs: [
              "Rezervasyonunuzu yaptığınız andan itibaren uçuşunuzu gerçek zamanlı izleriz. Uçağınız erken iner ya da rötar yaparsa, şoförünüz buna göre ayarlanır — yeniden plan yapmanıza gerek kalmaz.",
              "Bu sayede, uçaktan indiğinizde şoförünüz çoktan havalimanında, sizi bekliyor olur.",
            ],
          },
          {
            heading: "Karşılama: isminizin yazılı olduğu tabela",
            paragraphs: [
              "Bagajınızı aldıktan sonra, varış salonunda isminizin yazılı olduğu bir tabelayla sizi karşılayan profesyonel şoförünüzle buluşursunuz. Kalabalık bir terminalde araç aramakla zaman kaybetmezsiniz.",
              "Şoförünüz bagajlarınızı taşımanıza yardımcı olur ve sizi doğrudan aracınıza yönlendirir.",
            ],
          },
          {
            heading: "Bekleme süresi: 60 dakika ücretsiz",
            paragraphs: [
              "Havalimanı karşılamalarında, uçağınızın iniş saatinden itibaren 60 dakika ücretsiz bekleme süresi tanınır. Pasaport kontrolü ya da bagaj teslimi uzasa bile telaşlanmanıza gerek yoktur.",
            ],
          },
          {
            heading: "IST mi, SAW mı? İkisinde de aynı standart",
            paragraphs: [
              "İster Avrupa yakasındaki İstanbul Havalimanı'na (IST), ister Anadolu yakasındaki Sabiha Gökçen'e (SAW) inin; aynı profesyonel karşılama, sabit fiyat ve konforlu araç standardını sunarız.",
              "Şehir merkezine olan mesafe iki havalimanında farklı olsa da, fiyatınız rezervasyon sırasında sabitlenir — trafik veya mesafe nedeniyle sürpriz bir ücret çıkmaz.",
            ],
          },
        ],
        conclusion: "İstanbul'a inişiniz, yolculuğunuzun en stressiz anı olmalı. Uçuş takibi, isimli karşılama, ücretsiz bekleme ve sabit fiyatla; varıştan varış noktanıza kadar her detayı biz üstleniriz.",
      },
      en: {
        title: "Istanbul airport transfers: what to expect on arrival",
        excerpt: "Meet and greet, waiting times, and fixed fares explained for IST and SAW arrivals.",
        lead: "With two major airports, Istanbul is one of the world's busiest transport hubs. Here is what to expect for a seamless, luxurious welcome on arrival at Istanbul Airport (IST) and Sabiha Gökçen (SAW).",
        sections: [
          {
            heading: "Before you land: we track your flight",
            paragraphs: [
              "From the moment you book, we monitor your flight in real time. If your plane lands early or is delayed, your chauffeur adjusts accordingly — there is no need for you to replan.",
              "As a result, your chauffeur is already at the airport waiting for you the moment you step off the plane.",
            ],
          },
          {
            heading: "Meet and greet: a name sign waiting for you",
            paragraphs: [
              "After collecting your luggage, you will meet your professional chauffeur holding a name sign in the arrivals hall. No time wasted searching for a vehicle in a crowded terminal.",
              "Your chauffeur helps with your bags and guides you directly to your vehicle.",
            ],
          },
          {
            heading: "Waiting time: 60 minutes complimentary",
            paragraphs: [
              "For airport pick-ups, you receive 60 minutes of complimentary waiting from the moment your flight lands. Even if passport control or baggage claim takes longer, there is no need to rush.",
            ],
          },
          {
            heading: "IST or SAW? The same standard at both",
            paragraphs: [
              "Whether you land at Istanbul Airport (IST) on the European side or Sabiha Gökçen (SAW) on the Anatolian side, we deliver the same professional welcome, fixed price and comfortable vehicle standard.",
              "Although the distance to the city centre differs between the two airports, your price is locked in at booking — no surprise charges for traffic or distance.",
            ],
          },
        ],
        conclusion: "Your arrival in Istanbul should be the most stress-free moment of your journey. With flight tracking, a name-sign welcome, complimentary waiting and a fixed price, we handle every detail from arrival to destination.",
      },
    },
  },
  {
    slug: "kurumsal-seyahat-soforlu-hizmet",
    key: "b3",
    cover: "/images/blog/corporate-travel.jpg",
    readTime: { tr: 6, en: 6 },
    date: { tr: "Mart 2026", en: "March 2026" },
    content: {
      tr: {
        title: "Kurumsal seyahat: neden önceden rezerve edilmiş şoförler kazanır",
        excerpt: "Dünya çapında iş seyahatinde güvenilirlik, gizlilik ve konsolide faturalandırma.",
        lead: "İş dünyasında zaman en değerli varlıktır. Önceden rezerve edilmiş şoförlü hizmet, kurumsal seyahatte anlık taksi çağırmanın çok ötesinde bir güven, verimlilik ve itibar sunar. İşte nedeni.",
        sections: [
          {
            heading: "Güvenilirlik: araç her zaman hazır",
            paragraphs: [
              "Önemli bir toplantıya ya da uçuşa yetişmeniz gerektiğinde, anlık araç bulma belirsizliğini göze alamazsınız. Önceden rezerve edilmiş bir şoför, planlanan saatte, planlanan yerde hazırdır.",
              "Uçuş takibi ve esnek bekleme süreleriyle, gecikmeler bile sizin için yönetilir.",
            ],
          },
          {
            heading: "Gizlilik ve profesyonellik",
            paragraphs: [
              "Profesyonel şoförlerimiz, kurumsal misafirlerin gizlilik beklentisini bilir. Aracınız, hareket halinde sessiz bir ofis; telefon görüşmeleriniz ve belgeleriniz güvende.",
              "Üniformalı, deneyimli şoförler markanızın itibarını yansıtır — önemli müşterilerinizi karşılarken fark yaratır.",
            ],
          },
          {
            heading: "Konsolide faturalandırma",
            paragraphs: [
              "Çok sayıda çalışan ve sık seyahat söz konusu olduğunda, her yolculuğu ayrı ayrı takip etmek zahmetlidir. Kurumsal hesabınızla tüm transferler tek bir düzenli faturada toplanır.",
              "Bu, muhasebe süreçlerinizi sadeleştirir ve harcamalarınız üzerinde tam şeffaflık sağlar.",
            ],
          },
          {
            heading: "Tek bir koordinasyon noktası",
            paragraphs: [
              "Çok şehirli, çok duraklı ya da grup seyahatlerinde, 7/24 ekibimiz tüm güzergâhınızı sizin için planlar ve koordine eder. Tek bir iletişim noktasından tüm yolculuğu yönetirsiniz.",
            ],
          },
        ],
        conclusion: "Kurumsal seyahatte önceden rezerve edilmiş şoförlü hizmet; güvenilirlik, gizlilik ve sadeleştirilmiş faturalandırmayı bir araya getirir. İşinize odaklanın, ulaşımı bize bırakın.",
      },
      en: {
        title: "Corporate travel: why pre-booked chauffeurs win",
        excerpt: "Reliability, discretion, and consolidated billing for business travellers worldwide.",
        lead: "In business, time is the most valuable asset. Pre-booked chauffeur service offers far more than hailing a taxi on the spot — it delivers trust, efficiency and reputation in corporate travel. Here is why.",
        sections: [
          {
            heading: "Reliability: the car is always ready",
            paragraphs: [
              "When you need to catch an important meeting or flight, you cannot afford the uncertainty of finding a car on the spot. A pre-booked chauffeur is ready at the scheduled time and place.",
              "With flight tracking and flexible waiting times, even delays are managed for you.",
            ],
          },
          {
            heading: "Discretion and professionalism",
            paragraphs: [
              "Our professional chauffeurs understand the privacy expectations of corporate guests. Your vehicle becomes a quiet office on the move; your calls and documents stay secure.",
              "Uniformed, experienced chauffeurs reflect your brand's reputation — making a difference when welcoming important clients.",
            ],
          },
          {
            heading: "Consolidated billing",
            paragraphs: [
              "With many employees and frequent travel, tracking each journey separately is cumbersome. With your corporate account, all transfers are gathered into a single, organised invoice.",
              "This simplifies your accounting and provides full transparency over your spending.",
            ],
          },
          {
            heading: "A single point of coordination",
            paragraphs: [
              "For multi-city, multi-stop or group travel, our 24/7 team plans and coordinates your entire itinerary for you. You manage the whole journey from a single point of contact.",
            ],
          },
        ],
        conclusion: "In corporate travel, pre-booked chauffeur service brings together reliability, discretion and simplified billing. Focus on your business and leave the transport to us.",
      },
    },
  },
];

export function getPostBySlug(slug) {
  return blogPosts.find((p) => p.slug === slug) || null;
}
