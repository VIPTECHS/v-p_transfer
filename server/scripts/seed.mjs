import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../prisma/.env") });

const prisma = new PrismaClient();

const fleetKeys = [
  { key: "vClassStandard", name: "Mercedes V-Class Standard" },
  { key: "vClassLux", name: "Mercedes V-Class Lux" },
  { key: "sClass", name: "Mercedes S-Class" },
  { key: "sprinterStandard", name: "Mercedes Sprinter" },
];

const COUNTRIES_AND_CITIES = [
  { name: "Türkiye", code: "TR", cities: ["İstanbul","Ankara","İzmir","Antalya","Bursa","Adana","Konya","Gaziantep","Mersin","Diyarbakır","Kayseri","Eskişehir","Trabzon","Samsun","Denizli","Malatya","Kahramanmaraş","Van","Şanlıurfa","Erzurum","Batman","Elazığ","Muğla","Bodrum","Fethiye","Marmaris","Kuşadası","Çeşme","Alanya","Side","Kapadokya","Dalaman"] },
  { name: "Kuzey Kıbrıs Türk Cumhuriyeti", code: "CY-N", cities: ["Lefkoşa","Girne","Gazimağusa","Güzelyurt","İskele","Lefke","Ercan"] },
  { name: "Cyprus", code: "CY", cities: ["Nicosia","Limassol","Larnaca","Paphos","Ayia Napa","Protaras","Paralimni"] },
  { name: "Greece", code: "GR", cities: ["Athens","Thessaloniki","Heraklion","Patras","Larissa","Volos","Rhodes","Corfu","Chania","Mykonos","Santorini","Zakynthos","Kavala","Alexandroupoli","Ioannina"] },
  { name: "United Kingdom", code: "GB", cities: ["London","Manchester","Birmingham","Edinburgh","Glasgow","Liverpool","Bristol","Leeds","Sheffield","Newcastle","Cardiff","Belfast","Oxford","Cambridge","Brighton","Bath","York","Nottingham","Southampton","Aberdeen"] },
  { name: "Germany", code: "DE", cities: ["Berlin","Munich","Frankfurt","Hamburg","Cologne","Düsseldorf","Stuttgart","Dortmund","Essen","Leipzig","Bremen","Dresden","Hanover","Nuremberg","Bonn","Mannheim","Heidelberg","Freiburg","Baden-Baden"] },
  { name: "France", code: "FR", cities: ["Paris","Marseille","Lyon","Toulouse","Nice","Nantes","Strasbourg","Montpellier","Bordeaux","Lille","Cannes","Saint-Tropez","Avignon","Aix-en-Provence","Monaco","Biarritz","Chamonix","Deauville"] },
  { name: "Italy", code: "IT", cities: ["Rome","Milan","Naples","Florence","Venice","Turin","Bologna","Genoa","Palermo","Catania","Verona","Bari","Amalfi","Positano","Sorrento","Capri","Sardinia","Como","Siena","Pisa"] },
  { name: "Spain", code: "ES", cities: ["Madrid","Barcelona","Valencia","Seville","Malaga","Bilbao","Palma de Mallorca","Alicante","Ibiza","Marbella","Granada","Tenerife","Las Palmas","Córdoba","San Sebastián","Toledo","Salamanca"] },
  { name: "Portugal", code: "PT", cities: ["Lisbon","Porto","Faro","Funchal","Albufeira","Cascais","Sintra","Évora","Coimbra","Braga","Lagos","Vilamoura"] },
  { name: "Netherlands", code: "NL", cities: ["Amsterdam","Rotterdam","The Hague","Utrecht","Eindhoven","Groningen","Maastricht","Leiden","Delft","Haarlem"] },
  { name: "Belgium", code: "BE", cities: ["Brussels","Antwerp","Ghent","Bruges","Liège","Leuven","Namur","Charleroi"] },
  { name: "Switzerland", code: "CH", cities: ["Zurich","Geneva","Basel","Bern","Lausanne","Lucerne","St. Gallen","Lugano","Interlaken","Zermatt","Davos","St. Moritz"] },
  { name: "Austria", code: "AT", cities: ["Vienna","Salzburg","Innsbruck","Graz","Linz","Klagenfurt","Bregenz","Hallstatt"] },
  { name: "Sweden", code: "SE", cities: ["Stockholm","Gothenburg","Malmö","Uppsala","Västerås","Örebro","Linköping","Helsingborg"] },
  { name: "Norway", code: "NO", cities: ["Oslo","Bergen","Trondheim","Stavanger","Tromsø","Drammen","Kristiansand","Ålesund"] },
  { name: "Denmark", code: "DK", cities: ["Copenhagen","Aarhus","Odense","Aalborg","Esbjerg","Roskilde","Helsingør"] },
  { name: "Finland", code: "FI", cities: ["Helsinki","Tampere","Turku","Oulu","Espoo","Vantaa","Rovaniemi","Jyväskylä"] },
  { name: "Iceland", code: "IS", cities: ["Reykjavik","Akureyri","Keflavik","Selfoss"] },
  { name: "Ireland", code: "IE", cities: ["Dublin","Cork","Galway","Limerick","Waterford","Killarney","Kilkenny"] },
  { name: "Poland", code: "PL", cities: ["Warsaw","Krakow","Gdańsk","Wrocław","Poznań","Łódź","Katowice","Lublin","Szczecin"] },
  { name: "Czech Republic", code: "CZ", cities: ["Prague","Brno","Ostrava","Plzeň","Karlovy Vary","Český Krumlov","Liberec"] },
  { name: "Hungary", code: "HU", cities: ["Budapest","Debrecen","Szeged","Miskolc","Pécs","Győr","Eger"] },
  { name: "Romania", code: "RO", cities: ["Bucharest","Cluj-Napoca","Timișoara","Iași","Constanța","Brașov","Sibiu","Craiova"] },
  { name: "Bulgaria", code: "BG", cities: ["Sofia","Plovdiv","Varna","Burgas","Ruse","Stara Zagora","Bansko","Sunny Beach"] },
  { name: "Croatia", code: "HR", cities: ["Zagreb","Split","Dubrovnik","Rijeka","Zadar","Pula","Šibenik","Hvar"] },
  { name: "Slovenia", code: "SI", cities: ["Ljubljana","Maribor","Bled","Portorož","Koper","Piran"] },
  { name: "Serbia", code: "RS", cities: ["Belgrade","Novi Sad","Niš","Kragujevac","Subotica"] },
  { name: "Montenegro", code: "ME", cities: ["Podgorica","Budva","Kotor","Tivat","Herceg Novi","Bar"] },
  { name: "Bosnia and Herzegovina", code: "BA", cities: ["Sarajevo","Mostar","Banja Luka","Tuzla","Zenica"] },
  { name: "North Macedonia", code: "MK", cities: ["Skopje","Ohrid","Bitola","Tetovo","Kumanovo"] },
  { name: "Albania", code: "AL", cities: ["Tirana","Durrës","Vlorë","Shkodër","Saranda","Berat","Gjirokastër"] },
  { name: "Kosovo", code: "XK", cities: ["Pristina","Prizren","Peja","Gjakova","Mitrovica"] },
  { name: "Moldova", code: "MD", cities: ["Chișinău","Bălți","Tiraspol"] },
  { name: "Ukraine", code: "UA", cities: ["Kyiv","Lviv","Odessa","Kharkiv","Dnipro"] },
  { name: "Belarus", code: "BY", cities: ["Minsk","Gomel","Mogilev","Vitebsk","Grodno","Brest"] },
  { name: "Lithuania", code: "LT", cities: ["Vilnius","Kaunas","Klaipėda","Šiauliai","Panevėžys"] },
  { name: "Latvia", code: "LV", cities: ["Riga","Daugavpils","Liepāja","Jūrmala","Ventspils"] },
  { name: "Estonia", code: "EE", cities: ["Tallinn","Tartu","Narva","Pärnu"] },
  { name: "Slovakia", code: "SK", cities: ["Bratislava","Košice","Prešov","Žilina","Banská Bystrica","Nitra"] },
  { name: "Luxembourg", code: "LU", cities: ["Luxembourg City","Esch-sur-Alzette","Differdange"] },
  { name: "Malta", code: "MT", cities: ["Valletta","Sliema","St. Julian's","Mdina","Gozo"] },
  { name: "Russia", code: "RU", cities: ["Moscow","Saint Petersburg","Kazan","Sochi","Novosibirsk","Yekaterinburg","Nizhny Novgorod","Vladivostok","Kaliningrad","Rostov-on-Don"] },
  { name: "United States", code: "US", cities: ["New York","Los Angeles","Chicago","Miami","San Francisco","Las Vegas","Houston","Dallas","Boston","Seattle","Washington DC","Atlanta","Denver","Philadelphia","San Diego","Orlando","Phoenix","Portland","Nashville","Austin","Honolulu"] },
  { name: "Canada", code: "CA", cities: ["Toronto","Vancouver","Montreal","Calgary","Ottawa","Edmonton","Quebec City","Winnipeg","Halifax","Victoria","Whistler","Banff"] },
  { name: "Mexico", code: "MX", cities: ["Mexico City","Cancún","Guadalajara","Monterrey","Playa del Carmen","Los Cabos","Puerto Vallarta","Tulum","Mérida","Oaxaca"] },
  { name: "Brazil", code: "BR", cities: ["São Paulo","Rio de Janeiro","Brasília","Salvador","Fortaleza","Belo Horizonte","Manaus","Curitiba","Recife","Porto Alegre","Florianópolis","Buzios"] },
  { name: "Argentina", code: "AR", cities: ["Buenos Aires","Córdoba","Mendoza","Rosario","Bariloche","Salta","Mar del Plata","Ushuaia","Iguazú"] },
  { name: "Colombia", code: "CO", cities: ["Bogotá","Medellín","Cartagena","Cali","Barranquilla","Santa Marta","San Andrés"] },
  { name: "Chile", code: "CL", cities: ["Santiago","Valparaíso","Viña del Mar","Concepción","Puerto Montt","Punta Arenas","Antofagasta"] },
  { name: "Peru", code: "PE", cities: ["Lima","Cusco","Arequipa","Trujillo","Iquitos","Puno","Machu Picchu"] },
  { name: "Ecuador", code: "EC", cities: ["Quito","Guayaquil","Cuenca","Galápagos"] },
  { name: "Uruguay", code: "UY", cities: ["Montevideo","Punta del Este","Colonia del Sacramento"] },
  { name: "Venezuela", code: "VE", cities: ["Caracas","Maracaibo","Valencia","Barquisimeto","Margarita Island"] },
  { name: "Panama", code: "PA", cities: ["Panama City","Colón","David","Bocas del Toro"] },
  { name: "Costa Rica", code: "CR", cities: ["San José","Liberia","Puerto Limón","Tamarindo"] },
  { name: "Cuba", code: "CU", cities: ["Havana","Varadero","Santiago de Cuba","Trinidad","Viñales"] },
  { name: "Dominican Republic", code: "DO", cities: ["Santo Domingo","Punta Cana","Puerto Plata","La Romana","Samaná"] },
  { name: "Jamaica", code: "JM", cities: ["Kingston","Montego Bay","Ocho Rios","Negril"] },
  { name: "Bahamas", code: "BS", cities: ["Nassau","Freeport","Paradise Island","Exuma"] },
  { name: "Puerto Rico", code: "PR", cities: ["San Juan","Ponce","Mayagüez","Vieques"] },
  { name: "Guatemala", code: "GT", cities: ["Guatemala City","Antigua","Flores"] },
  { name: "Honduras", code: "HN", cities: ["Tegucigalpa","San Pedro Sula","Roatán"] },
  { name: "El Salvador", code: "SV", cities: ["San Salvador","Santa Ana"] },
  { name: "Nicaragua", code: "NI", cities: ["Managua","Granada","León"] },
  { name: "Trinidad and Tobago", code: "TT", cities: ["Port of Spain","San Fernando","Tobago"] },
  { name: "Barbados", code: "BB", cities: ["Bridgetown","Holetown","Speightstown"] },
  { name: "United Arab Emirates", code: "AE", cities: ["Dubai","Abu Dhabi","Sharjah","Ajman","Ras Al Khaimah","Fujairah","Al Ain"] },
  { name: "Saudi Arabia", code: "SA", cities: ["Riyadh","Jeddah","Mecca","Medina","Dammam","NEOM","Al Khobar","Taif","Abha"] },
  { name: "Qatar", code: "QA", cities: ["Doha","Lusail","Al Wakrah","Al Khor"] },
  { name: "Bahrain", code: "BH", cities: ["Manama","Muharraq","Riffa"] },
  { name: "Kuwait", code: "KW", cities: ["Kuwait City","Hawalli","Salmiya","Farwaniya"] },
  { name: "Oman", code: "OM", cities: ["Muscat","Salalah","Sohar","Nizwa","Sur"] },
  { name: "Jordan", code: "JO", cities: ["Amman","Aqaba","Petra","Dead Sea","Jerash","Madaba"] },
  { name: "Lebanon", code: "LB", cities: ["Beirut","Jounieh","Byblos","Baalbek","Sidon","Tripoli"] },
  { name: "Israel", code: "IL", cities: ["Tel Aviv","Jerusalem","Haifa","Eilat","Herzliya","Netanya","Beer Sheva"] },
  { name: "Egypt", code: "EG", cities: ["Cairo","Alexandria","Hurghada","Sharm El Sheikh","Luxor","Aswan","Giza","Marsa Alam","Dahab"] },
  { name: "Morocco", code: "MA", cities: ["Casablanca","Marrakech","Rabat","Fez","Tangier","Agadir","Essaouira","Chefchaouen","Ouarzazate"] },
  { name: "Tunisia", code: "TN", cities: ["Tunis","Sousse","Hammamet","Djerba","Monastir","Carthage","Sidi Bou Said"] },
  { name: "Algeria", code: "DZ", cities: ["Algiers","Oran","Constantine","Annaba","Tlemcen"] },
  { name: "Libya", code: "LY", cities: ["Tripoli","Benghazi","Misrata"] },
  { name: "South Africa", code: "ZA", cities: ["Cape Town","Johannesburg","Durban","Pretoria","Port Elizabeth","Stellenbosch","Knysna","Franschhoek"] },
  { name: "Kenya", code: "KE", cities: ["Nairobi","Mombasa","Malindi","Diani Beach","Nakuru","Kisumu"] },
  { name: "Tanzania", code: "TZ", cities: ["Dar es Salaam","Zanzibar","Arusha","Dodoma","Mwanza"] },
  { name: "Nigeria", code: "NG", cities: ["Lagos","Abuja","Port Harcourt","Kano","Ibadan","Enugu"] },
  { name: "Ghana", code: "GH", cities: ["Accra","Kumasi","Tamale","Cape Coast"] },
  { name: "Ethiopia", code: "ET", cities: ["Addis Ababa","Dire Dawa","Gondar","Lalibela","Bahir Dar"] },
  { name: "Rwanda", code: "RW", cities: ["Kigali","Butare","Gisenyi","Musanze"] },
  { name: "Uganda", code: "UG", cities: ["Kampala","Entebbe","Jinja","Mbarara"] },
  { name: "Mauritius", code: "MU", cities: ["Port Louis","Grand Baie","Flic en Flac","Belle Mare"] },
  { name: "Seychelles", code: "SC", cities: ["Victoria","Beau Vallon","Praslin","La Digue"] },
  { name: "Madagascar", code: "MG", cities: ["Antananarivo","Nosy Be","Toamasina"] },
  { name: "Mozambique", code: "MZ", cities: ["Maputo","Beira","Vilankulo"] },
  { name: "Zambia", code: "ZM", cities: ["Lusaka","Livingstone","Ndola"] },
  { name: "Zimbabwe", code: "ZW", cities: ["Harare","Bulawayo","Victoria Falls"] },
  { name: "Botswana", code: "BW", cities: ["Gaborone","Maun","Kasane","Francistown"] },
  { name: "Namibia", code: "NA", cities: ["Windhoek","Swakopmund","Walvis Bay","Sossusvlei"] },
  { name: "Senegal", code: "SN", cities: ["Dakar","Saint-Louis","Thiès","Saly"] },
  { name: "Ivory Coast", code: "CI", cities: ["Abidjan","Yamoussoukro","Bouaké","Grand-Bassam"] },
  { name: "Cameroon", code: "CM", cities: ["Douala","Yaoundé","Limbe","Kribi"] },
  { name: "DR Congo", code: "CD", cities: ["Kinshasa","Lubumbashi","Goma","Kisangani"] },
  { name: "Angola", code: "AO", cities: ["Luanda","Benguela","Lobito","Huambo"] },
  { name: "China", code: "CN", cities: ["Beijing","Shanghai","Guangzhou","Shenzhen","Chengdu","Hangzhou","Xi'an","Nanjing","Chongqing","Wuhan","Suzhou","Tianjin","Dalian","Qingdao","Kunming","Sanya","Guilin","Lhasa","Macau","Hong Kong"] },
  { name: "Japan", code: "JP", cities: ["Tokyo","Osaka","Kyoto","Yokohama","Nagoya","Sapporo","Fukuoka","Kobe","Hiroshima","Nara","Okinawa","Hakone","Nikko","Kamakura"] },
  { name: "South Korea", code: "KR", cities: ["Seoul","Busan","Incheon","Jeju","Daegu","Daejeon","Gwangju","Gyeongju"] },
  { name: "India", code: "IN", cities: ["Mumbai","New Delhi","Bangalore","Chennai","Kolkata","Hyderabad","Pune","Ahmedabad","Jaipur","Goa","Agra","Udaipur","Varanasi","Kochi","Amritsar","Rishikesh","Darjeeling","Shimla"] },
  { name: "Thailand", code: "TH", cities: ["Bangkok","Phuket","Chiang Mai","Pattaya","Krabi","Koh Samui","Hua Hin","Chiang Rai","Koh Phangan","Koh Lanta"] },
  { name: "Vietnam", code: "VN", cities: ["Ho Chi Minh City","Hanoi","Da Nang","Hoi An","Nha Trang","Phu Quoc","Hue","Sapa","Halong Bay","Dalat"] },
  { name: "Indonesia", code: "ID", cities: ["Jakarta","Bali","Surabaya","Bandung","Yogyakarta","Lombok","Medan","Makassar","Komodo"] },
  { name: "Malaysia", code: "MY", cities: ["Kuala Lumpur","Penang","Langkawi","Johor Bahru","Kota Kinabalu","Malacca","Ipoh","Kuching"] },
  { name: "Singapore", code: "SG", cities: ["Singapore","Sentosa","Marina Bay","Changi"] },
  { name: "Philippines", code: "PH", cities: ["Manila","Cebu","Boracay","Palawan","Davao","Bohol","Siargao","Clark"] },
  { name: "Cambodia", code: "KH", cities: ["Phnom Penh","Siem Reap","Sihanoukville","Kampot"] },
  { name: "Myanmar", code: "MM", cities: ["Yangon","Mandalay","Bagan","Inle Lake","Naypyidaw"] },
  { name: "Laos", code: "LA", cities: ["Vientiane","Luang Prabang","Vang Vieng"] },
  { name: "Sri Lanka", code: "LK", cities: ["Colombo","Kandy","Galle","Ella","Sigiriya","Trincomalee","Negombo","Bentota"] },
  { name: "Nepal", code: "NP", cities: ["Kathmandu","Pokhara","Chitwan","Lumbini","Nagarkot"] },
  { name: "Maldives", code: "MV", cities: ["Malé","Hulhumalé","Maafushi","Addu City"] },
  { name: "Bangladesh", code: "BD", cities: ["Dhaka","Chittagong","Cox's Bazar","Sylhet"] },
  { name: "Pakistan", code: "PK", cities: ["Islamabad","Karachi","Lahore","Peshawar","Faisalabad","Multan"] },
  { name: "Uzbekistan", code: "UZ", cities: ["Tashkent","Samarkand","Bukhara","Khiva"] },
  { name: "Kazakhstan", code: "KZ", cities: ["Astana","Almaty","Shymkent","Aktau"] },
  { name: "Georgia", code: "GE", cities: ["Tbilisi","Batumi","Kutaisi","Borjomi","Kazbegi","Telavi"] },
  { name: "Armenia", code: "AM", cities: ["Yerevan","Gyumri","Dilijan","Jermuk"] },
  { name: "Azerbaijan", code: "AZ", cities: ["Baku","Gabala","Sheki","Ganja","Lankaran"] },
  { name: "Mongolia", code: "MN", cities: ["Ulaanbaatar","Darkhan","Erdenet"] },
  { name: "Taiwan", code: "TW", cities: ["Taipei","Kaohsiung","Taichung","Tainan","Hualien","Kenting"] },
  { name: "Australia", code: "AU", cities: ["Sydney","Melbourne","Brisbane","Perth","Adelaide","Gold Coast","Cairns","Darwin","Hobart","Canberra","Byron Bay","Great Barrier Reef"] },
  { name: "New Zealand", code: "NZ", cities: ["Auckland","Wellington","Queenstown","Christchurch","Rotorua","Dunedin","Hamilton","Taupo"] },
  { name: "Fiji", code: "FJ", cities: ["Suva","Nadi","Denarau Island","Coral Coast"] },
  { name: "French Polynesia", code: "PF", cities: ["Papeete","Bora Bora","Moorea","Tahiti"] },
  { name: "Iraq", code: "IQ", cities: ["Baghdad","Erbil","Sulaymaniyah","Basra","Najaf"] },
  { name: "Iran", code: "IR", cities: ["Tehran","Isfahan","Shiraz","Tabriz","Mashhad","Yazd","Kerman"] },
  { name: "Afghanistan", code: "AF", cities: ["Kabul","Herat","Mazar-i-Sharif","Kandahar"] },
  { name: "Turkmenistan", code: "TM", cities: ["Ashgabat","Türkmenbaşy","Mary"] },
  { name: "Tajikistan", code: "TJ", cities: ["Dushanbe","Khujand","Kulob"] },
  { name: "Kyrgyzstan", code: "KG", cities: ["Bishkek","Osh","Karakol","Issyk-Kul"] },
  { name: "Yemen", code: "YE", cities: ["Sana'a","Aden","Taiz"] },
  { name: "Syria", code: "SY", cities: ["Damascus","Aleppo","Latakia","Homs"] },
  { name: "Palestine", code: "PS", cities: ["Ramallah","Bethlehem","Hebron","Jericho","Nablus"] },
  { name: "Brunei", code: "BN", cities: ["Bandar Seri Begawan","Seria","Tutong"] },
  { name: "Bhutan", code: "BT", cities: ["Thimphu","Paro","Punakha"] },
  { name: "Togo", code: "TG", cities: ["Lomé","Kara","Sokodé"] },
  { name: "Benin", code: "BJ", cities: ["Cotonou","Porto-Novo","Parakou"] },
  { name: "Burkina Faso", code: "BF", cities: ["Ouagadougou","Bobo-Dioulasso"] },
  { name: "Mali", code: "ML", cities: ["Bamako","Timbuktu","Mopti"] },
  { name: "Niger", code: "NE", cities: ["Niamey","Agadez","Zinder"] },
  { name: "Chad", code: "TD", cities: ["N'Djamena","Moundou","Sarh"] },
  { name: "Sudan", code: "SD", cities: ["Khartoum","Omdurman","Port Sudan"] },
  { name: "South Sudan", code: "SS", cities: ["Juba","Malakal","Wau"] },
  { name: "Eritrea", code: "ER", cities: ["Asmara","Massawa","Keren"] },
  { name: "Djibouti", code: "DJ", cities: ["Djibouti City","Ali Sabieh","Tadjoura"] },
  { name: "Somalia", code: "SO", cities: ["Mogadishu","Hargeisa","Berbera"] },
  { name: "Gabon", code: "GA", cities: ["Libreville","Port-Gentil","Franceville"] },
  { name: "Congo", code: "CG", cities: ["Brazzaville","Pointe-Noire"] },
  { name: "Central African Republic", code: "CF", cities: ["Bangui","Bimbo"] },
  { name: "Equatorial Guinea", code: "GQ", cities: ["Malabo","Bata"] },
  { name: "Guinea", code: "GN", cities: ["Conakry","Kankan","Nzérékoré"] },
  { name: "Guinea-Bissau", code: "GW", cities: ["Bissau","Bafatá"] },
  { name: "Sierra Leone", code: "SL", cities: ["Freetown","Bo","Kenema"] },
  { name: "Liberia", code: "LR", cities: ["Monrovia","Buchanan","Gbarnga"] },
  { name: "Mauritania", code: "MR", cities: ["Nouakchott","Nouadhibou"] },
  { name: "Gambia", code: "GM", cities: ["Banjul","Serekunda","Brikama"] },
  { name: "Cape Verde", code: "CV", cities: ["Praia","Mindelo","Sal","Boa Vista"] },
  { name: "São Tomé and Príncipe", code: "ST", cities: ["São Tomé","Santo Amaro"] },
  { name: "Comoros", code: "KM", cities: ["Moroni","Mutsamudu"] },
  { name: "Eswatini", code: "SZ", cities: ["Mbabane","Manzini","Lobamba"] },
  { name: "Lesotho", code: "LS", cities: ["Maseru","Teyateyaneng"] },
  { name: "Malawi", code: "MW", cities: ["Lilongwe","Blantyre","Mzuzu","Zomba"] },
  { name: "Burundi", code: "BI", cities: ["Bujumbura","Gitega"] },
  { name: "Timor-Leste", code: "TL", cities: ["Dili","Baucau"] },
  { name: "Papua New Guinea", code: "PG", cities: ["Port Moresby","Lae","Mount Hagen"] },
  { name: "Samoa", code: "WS", cities: ["Apia"] },
  { name: "Tonga", code: "TO", cities: ["Nukuʻalofa"] },
  { name: "Vanuatu", code: "VU", cities: ["Port Vila","Luganville"] },
  { name: "Solomon Islands", code: "SB", cities: ["Honiara","Gizo"] },
  { name: "Belize", code: "BZ", cities: ["Belize City","San Pedro","Placencia","Caye Caulker"] },
  { name: "Guyana", code: "GY", cities: ["Georgetown","Linden"] },
  { name: "Suriname", code: "SR", cities: ["Paramaribo","Nieuw Nickerie"] },
  { name: "Haiti", code: "HT", cities: ["Port-au-Prince","Cap-Haïtien","Jacmel"] },
  { name: "Paraguay", code: "PY", cities: ["Asunción","Ciudad del Este","Encarnación"] },
  { name: "Bolivia", code: "BO", cities: ["La Paz","Santa Cruz","Sucre","Cochabamba","Uyuni"] },
  { name: "Antigua and Barbuda", code: "AG", cities: ["St. John's","Jolly Harbour"] },
  { name: "Saint Lucia", code: "LC", cities: ["Castries","Soufrière","Rodney Bay"] },
  { name: "Grenada", code: "GD", cities: ["St. George's","Grand Anse"] },
  { name: "Saint Kitts and Nevis", code: "KN", cities: ["Basseterre","Charlestown"] },
  { name: "Dominica", code: "DM", cities: ["Roseau","Portsmouth"] },
  { name: "Saint Vincent", code: "VC", cities: ["Kingstown","Bequia"] },
  { name: "Aruba", code: "AW", cities: ["Oranjestad","Palm Beach","Eagle Beach"] },
  { name: "Curaçao", code: "CW", cities: ["Willemstad","Westpunt"] },
  { name: "Bermuda", code: "BM", cities: ["Hamilton","St. George's"] },
  { name: "Cayman Islands", code: "KY", cities: ["George Town","Seven Mile Beach"] },
  { name: "Turks and Caicos", code: "TC", cities: ["Providenciales","Grand Turk"] },
  { name: "Monaco", code: "MC", cities: ["Monte Carlo","Monaco-Ville","La Condamine","Fontvieille"] },
  { name: "Andorra", code: "AD", cities: ["Andorra la Vella","Escaldes-Engordany"] },
  { name: "Liechtenstein", code: "LI", cities: ["Vaduz","Schaan","Balzers"] },
  { name: "San Marino", code: "SM", cities: ["San Marino","Serravalle"] },
];

async function main() {
  // Fleet
  for (const v of fleetKeys) {
    await prisma.vehicle.upsert({
      where: { key: v.key },
      update: { name: v.name },
      create: { key: v.key, name: v.name, isActive: true },
    });
  }

  // Demo driver
  const driverCount = await prisma.driver.count();
  if (driverCount === 0) {
    await prisma.driver.create({
      data: { name: "Demo Şoför", phone: "+905551234567", email: "driver@viptransfer.com", isActive: true },
    });
  }

  // Countries & Cities
  let countryCount = 0;
  let cityCount = 0;

  for (const entry of COUNTRIES_AND_CITIES) {
    const country = await prisma.country.upsert({
      where: { code: entry.code },
      update: {},
      create: { name: entry.name, code: entry.code, isActive: true },
    });
    countryCount++;

    for (const cityName of entry.cities) {
      await prisma.city.upsert({
        where: { name_countryId: { name: cityName, countryId: country.id } },
        update: {},
        create: { name: cityName, countryId: country.id, isActive: true },
      });
      cityCount++;
    }
  }

  console.log(`Seed completed: ${countryCount} countries, ${cityCount} cities.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
