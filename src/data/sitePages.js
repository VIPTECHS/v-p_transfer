// Footer bağlantı sayfaları — tek kaynak. SitePage.jsx buradan beslenir.
// Her sayfa dile göre içerik taşır: intro + başlıklı bölümler.

export const sitePages = [
  // ---------------- CORPORATE ----------------
  {
    slug: "about-us",
    column: "corporate",
    content: {
      en: {
        title: "About Us",
        intro:
          "For more than 26 years, VIPTransfer.com has set the standard in premium ground transportation — combining local expertise with global reach to deliver safe, elegant and seamless journeys.",
        sections: [
          {
            heading: "Our story",
            paragraphs: [
              "Rooted in a family business deeply connected to the world of tourism, our journey began over two and a half decades ago. Through years of expertise and strong partnerships around the globe, we have built a new standard in transportation.",
            ],
          },
          {
            heading: "What we do",
            paragraphs: [
              "As a licensed travel agency, we specialise exclusively in pre-booked chauffeur services — airport transfers, intercity routes, hourly hire and bespoke itineraries — guaranteeing reliability and peace of mind on every ride.",
            ],
          },
          {
            heading: "Our promise",
            paragraphs: [
              "Fixed fares with no hidden fees, professional uniformed chauffeurs, real-time flight tracking and a meticulously maintained fleet. Thousands of travellers trust us every year — and we earn that trust on every journey.",
            ],
          },
        ],
      },
      tr: {
        title: "Hakkımızda",
        intro:
          "VIPTransfer.com, 26 yılı aşkın süredir premium kara ulaşımında standardı belirliyor — yerel uzmanlığı küresel erişimle birleştirerek güvenli, zarif ve kusursuz yolculuklar sunuyoruz.",
        sections: [
          {
            heading: "Hikâyemiz",
            paragraphs: [
              "Turizm dünyasına derinden bağlı bir aile işletmesinden doğan yolculuğumuz, çeyrek asrı aşkın süre önce başladı. Yılların deneyimi ve dünya genelindeki güçlü iş ortaklıklarıyla ulaşımda yeni bir standart oluşturduk.",
            ],
          },
          {
            heading: "Ne yapıyoruz",
            paragraphs: [
              "Lisanslı bir seyahat acentesi olarak yalnızca önceden rezerve edilen şoförlü hizmetlere odaklanıyoruz — havalimanı transferleri, şehirlerarası rotalar, saatlik kiralama ve özel güzergâhlar — her yolculukta güvenilirlik ve huzur garantisi veriyoruz.",
            ],
          },
          {
            heading: "Sözümüz",
            paragraphs: [
              "Gizli ücret olmadan sabit fiyat, üniformalı profesyonel şoförler, gerçek zamanlı uçuş takibi ve titizlikle bakımı yapılan bir filo. Her yıl binlerce yolcu bize güveniyor — ve bu güveni her yolculukta yeniden kazanıyoruz.",
            ],
          },
        ],
      },
      de: {
        title: "Über uns",
        intro:
          "Seit über 26 Jahren setzt VIPTransfer.com den Maßstab im Premium-Bodentransport — lokale Expertise verbunden mit globaler Reichweite für sichere, elegante und nahtlose Fahrten.",
        sections: [
          {
            heading: "Unsere Geschichte",
            paragraphs: [
              "Verwurzelt in einem Familienunternehmen mit tiefer Verbindung zur Tourismuswelt, begann unsere Reise vor über zweieinhalb Jahrzehnten. Mit jahrelanger Erfahrung und starken Partnerschaften weltweit haben wir einen neuen Standard im Transport geschaffen.",
            ],
          },
          {
            heading: "Was wir tun",
            paragraphs: [
              "Als lizenzierte Reiseagentur konzentrieren wir uns ausschließlich auf vorab gebuchte Chauffeurservices — Flughafentransfers, Überlandstrecken, stundenweise Anmietung und maßgeschneiderte Routen — mit garantierter Zuverlässigkeit bei jeder Fahrt.",
            ],
          },
          {
            heading: "Unser Versprechen",
            paragraphs: [
              "Festpreise ohne versteckte Gebühren, professionelle uniformierte Chauffeure, Echtzeit-Flugverfolgung und eine sorgfältig gepflegte Flotte. Tausende Reisende vertrauen uns jedes Jahr — und wir verdienen dieses Vertrauen auf jeder Fahrt.",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "corporate-accounts",
    column: "corporate",
    content: {
      en: {
        title: "Corporate Accounts",
        intro:
          "Streamline business travel with a dedicated corporate account — consolidated billing, priority support and reliable chauffeurs your team can count on.",
        sections: [
          {
            heading: "Why companies choose us",
            paragraphs: [
              "Reliability is everything in business travel. With a pre-booked chauffeur, your vehicle is ready at the scheduled time and place — every time. Flight tracking and flexible waiting mean delays are managed for you.",
            ],
          },
          {
            heading: "Consolidated billing",
            paragraphs: [
              "All transfers are gathered into a single, organised monthly invoice. This simplifies your accounting and gives full transparency over travel spend across employees and departments.",
            ],
          },
          {
            heading: "Dedicated support",
            paragraphs: [
              "A single point of coordination for multi-city, multi-stop and group travel. Our 24/7 team plans and manages your entire itinerary so your people simply travel.",
            ],
          },
          {
            heading: "Open an account",
            paragraphs: [
              "Setting up a corporate account takes minutes. Contact our team on WhatsApp and we will tailor a programme to your company's needs.",
            ],
          },
        ],
      },
      tr: {
        title: "Kurumsal Hesaplar",
        intro:
          "Özel bir kurumsal hesapla iş seyahatini sadeleştirin — tek faturada toplanan ödemeler, öncelikli destek ve ekibinizin güvenebileceği şoförler.",
        sections: [
          {
            heading: "Şirketler neden bizi tercih ediyor",
            paragraphs: [
              "İş seyahatinde güvenilirlik her şeydir. Önceden rezerve edilen bir şoförle aracınız planlanan saatte ve yerde hazır olur — her seferinde. Uçuş takibi ve esnek bekleme ile gecikmeler sizin için yönetilir.",
            ],
          },
          {
            heading: "Tek faturada toplama",
            paragraphs: [
              "Tüm transferler tek ve düzenli bir aylık faturada toplanır. Bu, muhasebenizi sadeleştirir ve çalışanlar ile departmanlar genelinde harcamalarda tam şeffaflık sağlar.",
            ],
          },
          {
            heading: "Özel destek",
            paragraphs: [
              "Çok şehirli, çok duraklı ve grup seyahatleri için tek bir koordinasyon noktası. 7/24 ekibimiz tüm güzergâhınızı planlar ve yönetir; ekibiniz yalnızca yolculuğa odaklanır.",
            ],
          },
          {
            heading: "Hesap açın",
            paragraphs: [
              "Kurumsal hesap kurmak dakikalar sürer. WhatsApp üzerinden ekibimizle iletişime geçin; şirketinizin ihtiyaçlarına özel bir program hazırlayalım.",
            ],
          },
        ],
      },
      de: {
        title: "Firmenkonten",
        intro:
          "Optimieren Sie Geschäftsreisen mit einem dedizierten Firmenkonto — gebündelte Abrechnung, vorrangiger Support und zuverlässige Chauffeure, auf die sich Ihr Team verlassen kann.",
        sections: [
          {
            heading: "Warum Unternehmen uns wählen",
            paragraphs: [
              "Zuverlässigkeit ist bei Geschäftsreisen alles. Mit einem vorab gebuchten Chauffeur steht Ihr Fahrzeug zur geplanten Zeit am geplanten Ort bereit — jedes Mal. Flugverfolgung und flexible Wartezeiten bedeuten, dass Verzögerungen für Sie gemanagt werden.",
            ],
          },
          {
            heading: "Gebündelte Abrechnung",
            paragraphs: [
              "Alle Transfers werden in einer einzigen, übersichtlichen Monatsrechnung zusammengefasst. Das vereinfacht Ihre Buchhaltung und schafft volle Transparenz über die Reisekosten aller Mitarbeiter und Abteilungen.",
            ],
          },
          {
            heading: "Dedizierter Support",
            paragraphs: [
              "Ein einziger Koordinationspunkt für Reisen mit mehreren Städten, mehreren Stopps und Gruppen. Unser Team plant und verwaltet rund um die Uhr Ihre gesamte Route.",
            ],
          },
          {
            heading: "Konto eröffnen",
            paragraphs: [
              "Die Einrichtung eines Firmenkontos dauert nur Minuten. Kontaktieren Sie unser Team per WhatsApp, und wir gestalten ein Programm nach den Bedürfnissen Ihres Unternehmens.",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "travel-partners",
    column: "corporate",
    content: {
      en: {
        title: "Travel Partners",
        intro:
          "We work hand in hand with hotels, travel agencies, tour operators and event planners to deliver flawless ground transportation for their guests.",
        sections: [
          {
            heading: "Who we partner with",
            paragraphs: [
              "Luxury hotels, DMCs, corporate travel managers, concierge services and event organisers around the world rely on our fleet and chauffeurs to extend their own standard of service.",
            ],
          },
          {
            heading: "Partner benefits",
            paragraphs: [
              "Preferential rates, priority availability, white-glove guest handling and a single coordination point for complex itineraries. Your guests experience the same care you would give them yourself.",
            ],
          },
          {
            heading: "Become a partner",
            paragraphs: [
              "Interested in working together? Reach out via WhatsApp and our partnerships team will set up a tailored collaboration for your business.",
            ],
          },
        ],
      },
      tr: {
        title: "Seyahat Ortakları",
        intro:
          "Misafirleri için kusursuz kara ulaşımı sunmak adına otellerle, seyahat acenteleriyle, tur operatörleriyle ve etkinlik planlayıcılarıyla el ele çalışıyoruz.",
        sections: [
          {
            heading: "Kimlerle çalışıyoruz",
            paragraphs: [
              "Dünya genelinde lüks oteller, DMC'ler, kurumsal seyahat yöneticileri, konsiyerj hizmetleri ve etkinlik organizatörleri, kendi hizmet standartlarını uzatmak için filomuza ve şoförlerimize güveniyor.",
            ],
          },
          {
            heading: "Ortaklık avantajları",
            paragraphs: [
              "Ayrıcalıklı fiyatlar, öncelikli müsaitlik, üst düzey misafir karşılama ve karmaşık güzergâhlar için tek koordinasyon noktası. Misafirleriniz, sizin göstereceğiniz özenin aynısını yaşar.",
            ],
          },
          {
            heading: "Ortak olun",
            paragraphs: [
              "Birlikte çalışmak ister misiniz? WhatsApp üzerinden bize ulaşın; ortaklıklar ekibimiz işletmeniz için özel bir iş birliği kuracaktır.",
            ],
          },
        ],
      },
      de: {
        title: "Reisepartner",
        intro:
          "Wir arbeiten Hand in Hand mit Hotels, Reiseagenturen, Reiseveranstaltern und Eventplanern, um deren Gästen einen einwandfreien Bodentransport zu bieten.",
        sections: [
          {
            heading: "Mit wem wir zusammenarbeiten",
            paragraphs: [
              "Luxushotels, DMCs, Geschäftsreise-Manager, Concierge-Services und Eventorganisatoren weltweit verlassen sich auf unsere Flotte und Chauffeure, um ihren eigenen Servicestandard zu erweitern.",
            ],
          },
          {
            heading: "Partnervorteile",
            paragraphs: [
              "Vorzugskonditionen, vorrangige Verfügbarkeit, erstklassige Gästebetreuung und ein einziger Koordinationspunkt für komplexe Routen. Ihre Gäste erleben dieselbe Sorgfalt, die Sie ihnen selbst geben würden.",
            ],
          },
          {
            heading: "Partner werden",
            paragraphs: [
              "Interesse an einer Zusammenarbeit? Kontaktieren Sie uns per WhatsApp, und unser Partnerschaftsteam richtet eine maßgeschneiderte Kooperation für Ihr Unternehmen ein.",
            ],
          },
        ],
      },
    },
  },

  // ---------------- SERVICES ----------------
  {
    slug: "airport-transfer",
    column: "services",
    content: {
      en: {
        title: "Airport Transfer",
        intro:
          "From touchdown to your destination, our airport transfers combine flight tracking, a personal meet & greet and fixed pricing for a completely stress-free arrival.",
        sections: [
          {
            heading: "Meet & greet",
            paragraphs: [
              "Your professional chauffeur waits in the arrivals hall with a name sign, helps with your luggage and guides you directly to your vehicle — no searching in a crowded terminal.",
            ],
          },
          {
            heading: "Flight tracking",
            paragraphs: [
              "We monitor your flight in real time. Whether you land early or late, your chauffeur adjusts automatically, with 60 minutes of complimentary waiting on airport pick-ups.",
            ],
          },
          {
            heading: "Fixed pricing",
            paragraphs: [
              "The price you confirm at booking is final — taxes, tolls and standard airport parking included. No surge pricing, no surprises.",
            ],
          },
        ],
      },
      tr: {
        title: "Havalimanı Transferi",
        intro:
          "İnişten varış noktanıza kadar, havalimanı transferlerimiz uçuş takibi, kişisel karşılama ve sabit fiyatı bir araya getirerek tamamen stressiz bir varış sunar.",
        sections: [
          {
            heading: "Karşılama",
            paragraphs: [
              "Profesyonel şoförünüz, varış salonunda isminizin yazılı olduğu tabelayla bekler, bagajınıza yardım eder ve sizi doğrudan aracınıza yönlendirir — kalabalık terminalde arama yapmazsınız.",
            ],
          },
          {
            heading: "Uçuş takibi",
            paragraphs: [
              "Uçuşunuzu gerçek zamanlı izleriz. İster erken ister geç inin, şoförünüz buna göre ayarlanır; havalimanı karşılamalarında 60 dakika ücretsiz bekleme tanınır.",
            ],
          },
          {
            heading: "Sabit fiyat",
            paragraphs: [
              "Rezervasyonda onayladığınız fiyat nettir — vergiler, geçiş ücretleri ve standart havalimanı otoparkı dahildir. Ani zam yok, sürpriz yok.",
            ],
          },
        ],
      },
      de: {
        title: "Flughafentransfer",
        intro:
          "Von der Landung bis zu Ihrem Ziel verbinden unsere Flughafentransfers Flugverfolgung, persönliche Begrüßung und Festpreise für eine völlig stressfreie Ankunft.",
        sections: [
          {
            heading: "Meet & Greet",
            paragraphs: [
              "Ihr professioneller Chauffeur wartet mit einem Namensschild in der Ankunftshalle, hilft mit dem Gepäck und führt Sie direkt zu Ihrem Fahrzeug — kein Suchen im überfüllten Terminal.",
            ],
          },
          {
            heading: "Flugverfolgung",
            paragraphs: [
              "Wir verfolgen Ihren Flug in Echtzeit. Ob Sie früher oder später landen, Ihr Chauffeur passt sich automatisch an, mit 60 Minuten kostenloser Wartezeit bei Flughafenabholungen.",
            ],
          },
          {
            heading: "Festpreise",
            paragraphs: [
              "Der bei der Buchung bestätigte Preis ist endgültig — Steuern, Maut und Standard-Flughafenparken inklusive. Keine Aufschläge, keine Überraschungen.",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "chauffeur-service",
    column: "services",
    content: {
      en: {
        title: "Chauffeur Service",
        intro:
          "Travel in comfort with a professional chauffeur at your service — by the hour, for the day, or for a bespoke multi-stop itinerary.",
        sections: [
          {
            heading: "Professional chauffeurs",
            paragraphs: [
              "Experienced, discreet and uniformed, our chauffeurs know the roads and respect your privacy. Your vehicle becomes a quiet office or a relaxing lounge on the move.",
            ],
          },
          {
            heading: "Hourly hire",
            paragraphs: [
              "Need a car at your disposal for meetings, shopping or a city tour? Book by the hour and keep your chauffeur on hand for as long as you need.",
            ],
          },
          {
            heading: "A fleet for every occasion",
            paragraphs: [
              "From the executive E-Class to the spacious V-Class and the flagship Maybach, choose the vehicle that matches your journey and your style.",
            ],
          },
        ],
      },
      tr: {
        title: "Şoförlü Hizmet",
        intro:
          "Hizmetinizde profesyonel bir şoförle konforla seyahat edin — saatlik, günlük ya da özel çok duraklı bir güzergâh için.",
        sections: [
          {
            heading: "Profesyonel şoförler",
            paragraphs: [
              "Deneyimli, ölçülü ve üniformalı şoförlerimiz yolları bilir ve gizliliğinize saygı gösterir. Aracınız hareket halinde sessiz bir ofise ya da rahat bir salona dönüşür.",
            ],
          },
          {
            heading: "Saatlik kiralama",
            paragraphs: [
              "Toplantılar, alışveriş ya da şehir turu için emrinizde bir araç mı lazım? Saatlik rezervasyon yapın ve şoförünüzü ihtiyaç duyduğunuz süre boyunca yanınızda tutun.",
            ],
          },
          {
            heading: "Her durum için bir filo",
            paragraphs: [
              "Executive E Serisi'nden geniş V Serisi'ne ve amiral gemisi Maybach'a kadar, yolculuğunuza ve tarzınıza uyan aracı seçin.",
            ],
          },
        ],
      },
      de: {
        title: "Chauffeurservice",
        intro:
          "Reisen Sie komfortabel mit einem professionellen Chauffeur zu Ihren Diensten — stundenweise, für den ganzen Tag oder für eine maßgeschneiderte Route mit mehreren Stopps.",
        sections: [
          {
            heading: "Professionelle Chauffeure",
            paragraphs: [
              "Erfahren, diskret und uniformiert kennen unsere Chauffeure die Straßen und respektieren Ihre Privatsphäre. Ihr Fahrzeug wird zum ruhigen Büro oder zur entspannenden Lounge unterwegs.",
            ],
          },
          {
            heading: "Stundenweise Anmietung",
            paragraphs: [
              "Brauchen Sie ein Fahrzeug für Meetings, Einkäufe oder eine Stadtrundfahrt? Buchen Sie stundenweise und behalten Sie Ihren Chauffeur, solange Sie ihn benötigen.",
            ],
          },
          {
            heading: "Eine Flotte für jeden Anlass",
            paragraphs: [
              "Von der E-Klasse über die geräumige V-Klasse bis zum Flaggschiff Maybach — wählen Sie das Fahrzeug, das zu Ihrer Fahrt und Ihrem Stil passt.",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "intercity-routes",
    column: "services",
    content: {
      en: {
        title: "Intercity Routes",
        intro:
          "Comfortable, private long-distance travel between cities — with the same fixed pricing and premium standards you expect on every VIP Transfer journey.",
        sections: [
          {
            heading: "Effortless long-distance travel",
            paragraphs: [
              "Skip crowded stations and rigid timetables. Travel city to city on your own schedule, in a quiet, comfortable cabin with a professional chauffeur at the wheel.",
            ],
          },
          {
            heading: "Popular routes",
            paragraphs: [
              "Istanbul to Bursa, Sapanca, Bolu and beyond — we cover countless intercity routes across the country and arrange international transfers on request.",
            ],
          },
          {
            heading: "Fixed, all-inclusive fares",
            paragraphs: [
              "Your price covers tolls, fuel and the chauffeur — agreed up front with no per-kilometre surprises, however long the road.",
            ],
          },
        ],
      },
      tr: {
        title: "Şehirlerarası Rotalar",
        intro:
          "Şehirler arasında konforlu, özel uzun mesafe yolculuğu — her VIP Transfer yolculuğunda beklediğiniz aynı sabit fiyat ve premium standartlarla.",
        sections: [
          {
            heading: "Zahmetsiz uzun mesafe yolculuğu",
            paragraphs: [
              "Kalabalık garları ve katı tarifeleri atlayın. Şehirden şehre kendi programınıza göre, profesyonel bir şoför direksiyondayken sessiz ve konforlu bir kabinde seyahat edin.",
            ],
          },
          {
            heading: "Popüler rotalar",
            paragraphs: [
              "İstanbul'dan Bursa, Sapanca, Bolu ve ötesine — ülke genelinde sayısız şehirlerarası rotayı kapsıyor, talep üzerine uluslararası transferler düzenliyoruz.",
            ],
          },
          {
            heading: "Sabit, her şey dahil ücretler",
            paragraphs: [
              "Fiyatınız geçiş ücretlerini, yakıtı ve şoförü kapsar — yol ne kadar uzun olursa olsun, önceden anlaşılır ve kilometre başına sürpriz çıkmaz.",
            ],
          },
        ],
      },
      de: {
        title: "Überlandstrecken",
        intro:
          "Komfortable, private Langstreckenfahrten zwischen Städten — mit denselben Festpreisen und Premium-Standards, die Sie von jeder VIP-Transfer-Fahrt erwarten.",
        sections: [
          {
            heading: "Müheloses Reisen über lange Distanzen",
            paragraphs: [
              "Vermeiden Sie überfüllte Bahnhöfe und starre Fahrpläne. Reisen Sie von Stadt zu Stadt nach Ihrem eigenen Zeitplan, in einer ruhigen, komfortablen Kabine mit einem professionellen Chauffeur am Steuer.",
            ],
          },
          {
            heading: "Beliebte Strecken",
            paragraphs: [
              "Istanbul nach Bursa, Sapanca, Bolu und darüber hinaus — wir decken zahllose Überlandstrecken im ganzen Land ab und organisieren auf Anfrage internationale Transfers.",
            ],
          },
          {
            heading: "Feste All-inclusive-Preise",
            paragraphs: [
              "Ihr Preis umfasst Maut, Kraftstoff und Chauffeur — im Voraus vereinbart, ohne Überraschungen pro Kilometer, egal wie lang die Strecke ist.",
            ],
          },
        ],
      },
    },
  },

  // ---------------- LEGAL ----------------
  {
    slug: "privacy-policy",
    column: "legal",
    content: {
      en: {
        title: "Privacy Policy",
        intro:
          "This Privacy Policy explains how VIPTransfer.com collects, uses and protects your personal data when you use our website and services. Last updated: June 2026.",
        sections: [
          {
            heading: "Data we collect",
            paragraphs: [
              "We collect the information you provide when booking — such as your name, contact details, pickup and drop-off locations, flight number and travel preferences — along with basic technical data like your browser type and device for security and analytics.",
            ],
          },
          {
            heading: "How we use your data",
            paragraphs: [
              "Your data is used solely to arrange and deliver your transfer, communicate with you about your booking, provide customer support and meet our legal obligations. We never sell your personal data.",
            ],
          },
          {
            heading: "Data sharing",
            paragraphs: [
              "We share only the details necessary to fulfil your journey with the assigned chauffeur or partner agency. Trusted service providers (such as payment and communication tools) process data on our behalf under strict confidentiality.",
            ],
          },
          {
            heading: "Your rights",
            paragraphs: [
              "You may request access to, correction of, or deletion of your personal data at any time. To exercise your rights, contact us at info@viptransfer.com.",
            ],
          },
        ],
      },
      tr: {
        title: "Gizlilik Politikası",
        intro:
          "Bu Gizlilik Politikası, web sitemizi ve hizmetlerimizi kullandığınızda VIPTransfer.com'un kişisel verilerinizi nasıl topladığını, kullandığını ve koruduğunu açıklar. Son güncelleme: Haziran 2026.",
        sections: [
          {
            heading: "Topladığımız veriler",
            paragraphs: [
              "Rezervasyon sırasında sağladığınız bilgileri — adınız, iletişim bilgileriniz, alış ve bırakış noktaları, uçuş numarası ve seyahat tercihleri gibi — ayrıca güvenlik ve analiz için tarayıcı türü ve cihaz gibi temel teknik verileri toplarız.",
            ],
          },
          {
            heading: "Verilerinizi nasıl kullanırız",
            paragraphs: [
              "Verileriniz yalnızca transferinizi düzenlemek ve gerçekleştirmek, rezervasyonunuz hakkında sizinle iletişim kurmak, müşteri desteği sağlamak ve yasal yükümlülüklerimizi yerine getirmek için kullanılır. Kişisel verilerinizi asla satmayız.",
            ],
          },
          {
            heading: "Veri paylaşımı",
            paragraphs: [
              "Yalnızca yolculuğunuzu gerçekleştirmek için gerekli bilgileri, atanan şoför veya iş ortağı acente ile paylaşırız. Güvenilir hizmet sağlayıcılar (ödeme ve iletişim araçları gibi) verileri sıkı gizlilik altında bizim adımıza işler.",
            ],
          },
          {
            heading: "Haklarınız",
            paragraphs: [
              "Kişisel verilerinize erişim, bunların düzeltilmesi veya silinmesini istediğiniz zaman talep edebilirsiniz. Haklarınızı kullanmak için info@viptransfer.com adresinden bize ulaşın.",
            ],
          },
        ],
      },
      de: {
        title: "Datenschutzerklärung",
        intro:
          "Diese Datenschutzerklärung erläutert, wie VIPTransfer.com Ihre personenbezogenen Daten erfasst, verwendet und schützt, wenn Sie unsere Website und Dienste nutzen. Zuletzt aktualisiert: Juni 2026.",
        sections: [
          {
            heading: "Daten, die wir erfassen",
            paragraphs: [
              "Wir erfassen die bei der Buchung angegebenen Informationen — wie Name, Kontaktdaten, Abhol- und Zielorte, Flugnummer und Reisepräferenzen — sowie grundlegende technische Daten wie Browsertyp und Gerät für Sicherheit und Analyse.",
            ],
          },
          {
            heading: "Wie wir Ihre Daten verwenden",
            paragraphs: [
              "Ihre Daten werden ausschließlich verwendet, um Ihren Transfer zu organisieren und durchzuführen, mit Ihnen über Ihre Buchung zu kommunizieren, Kundenservice zu leisten und unsere gesetzlichen Pflichten zu erfüllen. Wir verkaufen Ihre personenbezogenen Daten niemals.",
            ],
          },
          {
            heading: "Datenweitergabe",
            paragraphs: [
              "Wir teilen nur die zur Durchführung Ihrer Fahrt notwendigen Angaben mit dem zugewiesenen Chauffeur oder Partneragentur. Vertrauenswürdige Dienstleister (etwa Zahlungs- und Kommunikationstools) verarbeiten Daten in unserem Auftrag unter strenger Vertraulichkeit.",
            ],
          },
          {
            heading: "Ihre Rechte",
            paragraphs: [
              "Sie können jederzeit Auskunft über, Berichtigung oder Löschung Ihrer personenbezogenen Daten verlangen. Um Ihre Rechte auszuüben, kontaktieren Sie uns unter info@viptransfer.com.",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "terms-conditions",
    column: "legal",
    content: {
      en: {
        title: "Terms & Conditions",
        intro:
          "These Terms & Conditions govern your use of VIPTransfer.com and the booking of our chauffeur services. By making a reservation, you agree to these terms. Last updated: June 2026.",
        sections: [
          {
            heading: "Bookings",
            paragraphs: [
              "A booking is confirmed once you receive a confirmation with a reference number. Please ensure pickup details, times and contact information are accurate, as we rely on them to deliver your transfer.",
            ],
          },
          {
            heading: "Pricing",
            paragraphs: [
              "Prices quoted at booking are fixed and include taxes, tolls and standard airport parking. Additional services requested during the journey, or waiting beyond the complimentary period, may incur extra charges agreed in advance.",
            ],
          },
          {
            heading: "Cancellations & changes",
            paragraphs: [
              "You may amend or cancel your booking by contacting our team. Cancellation terms depend on how close to the pickup time the request is made; our team will confirm any applicable conditions.",
            ],
          },
          {
            heading: "Liability",
            paragraphs: [
              "We take great care to deliver punctual, safe journeys but are not liable for delays caused by events beyond our reasonable control, such as extreme weather or road closures. Our liability is limited to the value of the affected booking.",
            ],
          },
        ],
      },
      tr: {
        title: "Şartlar ve Koşullar",
        intro:
          "Bu Şartlar ve Koşullar, VIPTransfer.com'u kullanımınızı ve şoförlü hizmetlerimizin rezervasyonunu düzenler. Rezervasyon yaparak bu şartları kabul etmiş olursunuz. Son güncelleme: Haziran 2026.",
        sections: [
          {
            heading: "Rezervasyonlar",
            paragraphs: [
              "Bir rezervasyon, referans numaralı bir onay aldığınızda kesinleşir. Transferinizi gerçekleştirmek için bunlara güvendiğimizden, lütfen alış bilgilerinin, saatlerin ve iletişim bilgilerinin doğru olduğundan emin olun.",
            ],
          },
          {
            heading: "Fiyatlandırma",
            paragraphs: [
              "Rezervasyonda belirtilen fiyatlar sabittir; vergiler, geçiş ücretleri ve standart havalimanı otoparkını içerir. Yolculuk sırasında talep edilen ek hizmetler ya da ücretsiz süreyi aşan bekleme, önceden mutabık kalınan ek ücretlere tabi olabilir.",
            ],
          },
          {
            heading: "İptal ve değişiklikler",
            paragraphs: [
              "Ekibimizle iletişime geçerek rezervasyonunuzu değiştirebilir veya iptal edebilirsiniz. İptal koşulları, talebin alış saatine ne kadar yakın yapıldığına bağlıdır; ekibimiz geçerli koşulları teyit eder.",
            ],
          },
          {
            heading: "Sorumluluk",
            paragraphs: [
              "Dakik ve güvenli yolculuklar sunmak için büyük özen gösteririz; ancak aşırı hava koşulları veya yol kapanmaları gibi makul kontrolümüz dışındaki olaylardan kaynaklanan gecikmelerden sorumlu değiliz. Sorumluluğumuz, etkilenen rezervasyonun değeriyle sınırlıdır.",
            ],
          },
        ],
      },
      de: {
        title: "Allgemeine Geschäftsbedingungen",
        intro:
          "Diese Allgemeinen Geschäftsbedingungen regeln Ihre Nutzung von VIPTransfer.com und die Buchung unserer Chauffeurservices. Mit einer Reservierung stimmen Sie diesen Bedingungen zu. Zuletzt aktualisiert: Juni 2026.",
        sections: [
          {
            heading: "Buchungen",
            paragraphs: [
              "Eine Buchung ist bestätigt, sobald Sie eine Bestätigung mit einer Referenznummer erhalten. Bitte stellen Sie sicher, dass Abholdetails, Zeiten und Kontaktdaten korrekt sind, da wir uns bei der Durchführung Ihres Transfers darauf verlassen.",
            ],
          },
          {
            heading: "Preise",
            paragraphs: [
              "Die bei der Buchung genannten Preise sind fest und beinhalten Steuern, Maut und Standard-Flughafenparken. Während der Fahrt angeforderte Zusatzleistungen oder Wartezeiten über den kostenlosen Zeitraum hinaus können im Voraus vereinbarte Zusatzkosten verursachen.",
            ],
          },
          {
            heading: "Stornierungen & Änderungen",
            paragraphs: [
              "Sie können Ihre Buchung ändern oder stornieren, indem Sie unser Team kontaktieren. Die Stornierungsbedingungen hängen davon ab, wie kurzfristig vor der Abholzeit die Anfrage erfolgt; unser Team bestätigt die geltenden Bedingungen.",
            ],
          },
          {
            heading: "Haftung",
            paragraphs: [
              "Wir bemühen uns sehr um pünktliche, sichere Fahrten, haften jedoch nicht für Verzögerungen durch Ereignisse außerhalb unserer zumutbaren Kontrolle, wie extremes Wetter oder Straßensperrungen. Unsere Haftung ist auf den Wert der betroffenen Buchung begrenzt.",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "cookie-policy",
    column: "legal",
    content: {
      en: {
        title: "Cookie Policy",
        intro:
          "This Cookie Policy explains how VIPTransfer.com uses cookies and similar technologies on our website. Last updated: June 2026.",
        sections: [
          {
            heading: "What are cookies?",
            paragraphs: [
              "Cookies are small text files stored on your device when you visit a website. They help the site work properly, remember your preferences and understand how the site is used.",
            ],
          },
          {
            heading: "How we use cookies",
            paragraphs: [
              "We use essential cookies to keep the site secure and remember settings such as your language, and analytics cookies to understand how visitors interact with our pages so we can improve them.",
            ],
          },
          {
            heading: "Managing cookies",
            paragraphs: [
              "You can control or delete cookies through your browser settings at any time. Disabling some cookies may affect how parts of the website function.",
            ],
          },
        ],
      },
      tr: {
        title: "Çerez Politikası",
        intro:
          "Bu Çerez Politikası, VIPTransfer.com'un web sitemizde çerezleri ve benzeri teknolojileri nasıl kullandığını açıklar. Son güncelleme: Haziran 2026.",
        sections: [
          {
            heading: "Çerez nedir?",
            paragraphs: [
              "Çerezler, bir web sitesini ziyaret ettiğinizde cihazınızda saklanan küçük metin dosyalarıdır. Sitenin düzgün çalışmasına, tercihlerinizi hatırlamasına ve sitenin nasıl kullanıldığını anlamamıza yardımcı olur.",
            ],
          },
          {
            heading: "Çerezleri nasıl kullanırız",
            paragraphs: [
              "Siteyi güvende tutmak ve dil gibi ayarlarınızı hatırlamak için zorunlu çerezleri; ziyaretçilerin sayfalarımızla nasıl etkileşime girdiğini anlayıp bunları iyileştirmek için analiz çerezlerini kullanırız.",
            ],
          },
          {
            heading: "Çerezleri yönetme",
            paragraphs: [
              "Tarayıcı ayarlarınız aracılığıyla çerezleri istediğiniz zaman kontrol edebilir veya silebilirsiniz. Bazı çerezlerin devre dışı bırakılması, web sitesinin bazı bölümlerinin işleyişini etkileyebilir.",
            ],
          },
        ],
      },
      de: {
        title: "Cookie-Richtlinie",
        intro:
          "Diese Cookie-Richtlinie erläutert, wie VIPTransfer.com Cookies und ähnliche Technologien auf unserer Website verwendet. Zuletzt aktualisiert: Juni 2026.",
        sections: [
          {
            heading: "Was sind Cookies?",
            paragraphs: [
              "Cookies sind kleine Textdateien, die beim Besuch einer Website auf Ihrem Gerät gespeichert werden. Sie sorgen dafür, dass die Seite ordnungsgemäß funktioniert, merken sich Ihre Präferenzen und helfen zu verstehen, wie die Seite genutzt wird.",
            ],
          },
          {
            heading: "Wie wir Cookies verwenden",
            paragraphs: [
              "Wir verwenden essenzielle Cookies, um die Seite sicher zu halten und Einstellungen wie Ihre Sprache zu speichern, sowie Analyse-Cookies, um zu verstehen, wie Besucher mit unseren Seiten interagieren, damit wir sie verbessern können.",
            ],
          },
          {
            heading: "Cookies verwalten",
            paragraphs: [
              "Sie können Cookies jederzeit über Ihre Browsereinstellungen steuern oder löschen. Das Deaktivieren einiger Cookies kann die Funktion von Teilen der Website beeinträchtigen.",
            ],
          },
        ],
      },
    },
  },
];

export function getSitePage(slug) {
  return sitePages.find((p) => p.slug === slug) || null;
}
