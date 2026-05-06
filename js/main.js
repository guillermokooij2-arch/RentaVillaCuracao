/* ============================================================
   RentaVillaCuracao — js/main.js
   Last updated: 2026
   Linked from: index.html (loaded after Leaflet)

   TABLE OF CONTENTS
   1.  Villa Data (HOUSES_DATA)
   2.  Config (Supabase backend, WhatsApp, owner email)
   3.  Calendar State
   4.  Global Variables
   5.  DOMContentLoaded Init
   6.  Language Toggle
   7.  Leaflet Map
   8.  Villa Modal (open / close / tab switch)
   9.  iCal Fetch & Parser
   10. Calendar Renderer
   11. Price Summary
   12. Booking Mini Form
   13. Photo Gallery (tab 2)
   14. Lightbox
   15. Contact Form
   16. Car Rental WhatsApp
   17. FAQ Accordion
   18. Legal Modal
   ============================================================ */

/* ============================================================
   HOUSES DATA — all villa info with coordinates, photos, iCal
   ============================================================ */
var HOUSES_DATA = {
    'casa-dushi-dolores': {
        name: 'Casa Dushi Dolores', location: 'Jan Thiel, Marbella Estate',
        lat: 12.088301803572978, lng: -68.87373723058218,
        bedrooms: 3, guests: 6, pool: true, price: 145, priceBase: 145, priceExtra: 17.5, cleaningFee: 150,
        tags: 'pool luxury',
        desc_nl: 'Gelegen op Marbella Estate in Jan Thiel heeft deze villa een grote schaduwrijke porch met koelkast en eettafel. Het royale chloorvrije privézwembad met ligbedjes zorgt voor het ultieme vakantiegevoel. KolenBBQ, 3 slaapkamers, 2 badkamers, airco in alle vertrekken, smartTV met Nederlandse zenders, wifi. Kinderstoel en babybedje aanwezig. Prijs v.a. €145 (1-4 pers.), elke extra persoon €17,50 p.p.p.n.',
        desc_en: 'Located on Marbella Estate in Jan Thiel, this villa features a large shaded porch with fridge and dining table. The spacious chlorine-free private pool with sun loungers creates the ultimate holiday feeling. Charcoal BBQ, 3 bedrooms, 2 bathrooms, A/C throughout, smart TV with Dutch channels, Wi-Fi. High chair and baby cot available. Price from €145 (1-4 persons), each extra person €17.50 p.p.p.n.',
        hero: 'images/casa-dushi-dolores/hero.webp',
        fallbackHero: 'https://images.pexels.com/photos/2476632/pexels-photo-2476632.jpeg?auto=compress&cs=tinysrgb&w=1200',
        photos: ['images/casa-dushi-dolores/hero.webp','images/casa-dushi-dolores/woonkamer.webp','images/casa-dushi-dolores/pool1.webp','images/casa-dushi-dolores/keuken.webp','images/casa-dushi-dolores/porch.webp','images/casa-dushi-dolores/palapa.webp','images/casa-dushi-dolores/slaapkamer.webp','images/casa-dushi-dolores/badkamer.webp','images/casa-dushi-dolores/slaapkamer2.webp'],
        icalUrl: 'calendars/casa-dushi-dolores.ics'
    },
    'casa-prikichi': {
        name: 'Casa Prikichi', location: 'Jan Thiel, Marbella Estate',
        lat: 12.088211344128547, lng: -68.87312412955495,
        bedrooms: 3, guests: 8, pool: true, price: 145, priceBase: 145, priceExtra: 17.5, cleaningFee: 150,
        tags: 'pool large',
        desc_nl: 'Comfortabele villa op het beveiligde Marbella Estate in Jan Thiel met chloorvrij privézwembad. 3 slaapkamers (2 met LED TV) en 2 badkamers in het hoofdhuis, plus een aparte studio met eigen badkamer en tweepersoonsbed. Buitenkeuken met Big Green Egg, overdekt terras, ligbedjes, vaatwasser, Nespresso, waterkoker en broodrooster. Studio is apart bij te boeken voor €50 per nacht. Prijs v.a. €145 (1-4 pers.), elke extra persoon €17,50 p.p.p.n.',
        desc_en: 'Comfortable villa on the gated Marbella Estate in Jan Thiel with chlorine-free private pool. 3 bedrooms (2 with LED TV) and 2 bathrooms in the main house, plus a separate studio with private bathroom and double bed. Outdoor kitchen with Big Green Egg, covered terrace, sun loungers, dishwasher, Nespresso, kettle and toaster. Studio can be booked separately for €50 per night. Price from €145 (1-4 persons), each extra person €17.50 p.p.p.n.',
        hero: 'images/casa-prikichi/hero.webp',
        fallbackHero: 'https://images.pexels.com/photos/2507010/pexels-photo-2507010.jpeg?auto=compress&cs=tinysrgb&w=1200',
        photos: ['images/casa-prikichi/hero.webp','images/casa-prikichi/voorkant.webp','images/casa-prikichi/woonkamer.webp','images/casa-prikichi/keuken.webp','images/casa-prikichi/badkamer.webp','images/casa-prikichi/slaapkamer.webp','images/casa-prikichi/slaapkamer2.webp','images/casa-prikichi/slaapkamer3.webp','images/casa-prikichi/pool.webp','images/casa-prikichi/porch.webp','images/casa-prikichi/porch2.webp'],
        icalUrl: 'calendars/casa-prikichi.ics'
    },
    'villa-c7': {
        name: 'Villa Dushi', location: 'Jan Thiel, Marbella Estate',
        lat: 12.08967484687068, lng: -68.87418348567267,
        bedrooms: 3, guests: 6, pool: true, price: 145, priceBase: 145, priceExtra: 17.5, cleaningFee: 150,
        tags: 'pool luxury',
        desc_nl: 'Luxe ingerichte villa in Jan Thiel met open keuken voorzien van koffiezetapparaat, magnetron, oven, grote koelkast en vaatwasser. Buiten: wasmachine, grote Palapa met loungeset, tweede koelkast, eettafel en TV met Nederlandse zenders. Chloorvrij privézwembad met ligbedjes, buitendouche en buitentoilet. 3 slaapkamers en 2 badkamers. Prijs v.a. €145 (1-4 pers.), elke extra persoon €17,50 p.p.p.n.',
        desc_en: 'Luxuriously equipped villa in Jan Thiel with open kitchen including coffee maker, microwave, oven, large fridge and dishwasher. Outside: washing machine, large Palapa with lounge set, second fridge, dining table and TV with Dutch channels. Chlorine-free private pool with sun loungers, outdoor shower and toilet. 3 bedrooms, 2 bathrooms. Price from €145 (1-4 persons), each extra person €17.50 p.p.p.n.',
        hero: 'images/villa-c7/hero.webp',
        fallbackHero: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1200',
        photos: ['images/villa-c7/hero.webp','images/villa-c7/voorkant.webp','images/villa-c7/woonkamer.webp','images/villa-c7/keuken.webp','images/villa-c7/slaapkamer.webp','images/villa-c7/slaapkamer2.webp','images/villa-c7/badkamer.webp','images/villa-c7/pool.webp','images/villa-c7/porch.webp','images/villa-c7/poolporch.webp'],
        icalUrl: 'calendars/villa-dushi.ics'
    },
    'villa-dushi-bida': {
        name: 'Villa Dushi Bida', location: 'Jan Thiel, Marbella Estate',
        lat: 12.089451915557628, lng: -68.87419756726972,
        bedrooms: 3, guests: 6, pool: true, price: 145, priceBase: 145, priceExtra: 17.5, cleaningFee: 150,
        tags: 'pool luxury',
        desc_nl: 'Luxe villa op Marbella Estate in Jan Thiel. Wat hoger gelegen zodat er altijd een heerlijk briesje is. Mega grote Palapa met loungeset, buitenbar met koelkast, grote eettafel en TV met Nederlandse zenders. GasBBQ, buitendouche en buitentoilet. Chloorvrij privézwembad met ligbedjes. 3 slaapkamers, 2 badkamers, royale ingerichte keuken. Prijs v.a. €145 (1-4 pers.), elke extra persoon €17,50 p.p.p.n.',
        desc_en: 'Luxury villa on Marbella Estate in Jan Thiel. Elevated position means there is always a pleasant breeze. Mega large Palapa with lounge set, outdoor bar with fridge, large dining table and TV with Dutch channels. Gas BBQ, outdoor shower and toilet. Chlorine-free private pool with sun loungers. 3 bedrooms, 2 bathrooms, fully equipped kitchen. Price from €145 (1-4 persons), each extra person €17.50 p.p.p.n.',
        hero: 'images/villa-dushi-bida/hero.webp',
        fallbackHero: 'https://images.pexels.com/photos/2598638/pexels-photo-2598638.jpeg?auto=compress&cs=tinysrgb&w=1200',
        photos: ['images/villa-dushi-bida/hero.webp','images/villa-dushi-bida/voorkant.webp','images/villa-dushi-bida/woonkamer.webp','images/villa-dushi-bida/woonkamer2.webp','images/villa-dushi-bida/slaapkamer.webp','images/villa-dushi-bida/badkamer.webp','images/villa-dushi-bida/porch.webp','images/villa-dushi-bida/porchpool.webp'],
        icalUrl: 'calendars/villa-dushi-bida.ics'
    },
    'villa-abdo': {
        name: 'Villa Abdo', location: 'Jan Thiel, Marbella Estate',
        lat: 12.08788363922401, lng: -68.87407789545766,
        bedrooms: 3, guests: 6, pool: true, price: 145, priceBase: 145, priceExtra: 17.5, cleaningFee: 150,
        tags: 'pool luxury',
        desc_nl: 'Heerlijke villa op het beveiligde Marbella Estate in Jan Thiel. Grote schaduwrijke porch met loungeset en eettafel met uitzicht op het privézwembad met ligbedjes. KolenBBQ, airco in alle vertrekken, 3 slaapkamers, 2 badkamers. Mega smart TV met diverse buitenlandse zenders, Nespresso, magnetron, afwas- en wasmachine. Prijs v.a. €145 (1-4 pers.), elke extra persoon €17,50 p.p.p.n.',
        desc_en: 'Wonderful villa on the gated Marbella Estate in Jan Thiel. Large shaded porch with lounge set and dining table overlooking the private pool with sun loungers. Charcoal BBQ, A/C throughout, 3 bedrooms, 2 bathrooms. Mega smart TV with international channels, Nespresso, microwave, dishwasher and washing machine. Price from €145 (1-4 persons), each extra person €17.50 p.p.p.n.',
        hero: 'images/villa-abdo/hero.webp',
        fallbackHero: 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1200',
        photos: ['images/villa-abdo/hero.webp','images/villa-abdo/voorkant.webp','images/villa-abdo/woonkamer.webp','images/villa-abdo/keuken.webp','images/villa-abdo/slaapkamer.webp','images/villa-abdo/badkamer.webp','images/villa-abdo/pool.webp','images/villa-abdo/porch.webp'],
        icalUrl: 'calendars/villa-abdo.ics'
    },
    'kas-granjero': {
        name: 'Kas Granjero', location: 'Jan Thiel, Marbella Estate',
        lat: 12.087534600615394, lng: -68.87263762428553,
        bedrooms: 3, guests: 6, pool: true, price: 145, priceBase: 145, priceExtra: 17.5, cleaningFee: 150,
        tags: 'pool luxury',
        desc_nl: 'Smaakvolle villa in Jan Thiel, hoger gelegen met uitzicht richting de zoutpannen en altijd goed op de wind. Privézwembad met kinderbadje, buitendouche en gasBBQ. 3 slaapkamers, 2 moderne badkamers, ingerichte keuken, TV met alle zenders van de wereld en wifi. Prijs v.a. €145 (1-4 pers.), elke extra persoon €17,50 p.p.p.n.',
        desc_en: "Tasteful villa in Jan Thiel, elevated with views towards the salt flats and always a nice breeze. Private pool with children's section, outdoor shower and gas BBQ. 3 bedrooms, 2 modern bathrooms, equipped kitchen, TV with all world channels and Wi-Fi. Price from €145 (1-4 persons), each extra person €17.50 p.p.p.n.",
        hero: 'images/kas-granjero/hero.webp',
        fallbackHero: 'https://images.pexels.com/photos/2440471/pexels-photo-2440471.jpeg?auto=compress&cs=tinysrgb&w=1200',
        photos: ['images/kas-granjero/hero.webp','images/kas-granjero/voorkant.webp','images/kas-granjero/woonkamer.webp','images/kas-granjero/woonkamer2.webp','images/kas-granjero/badkamer.webp','images/kas-granjero/badkamer2.webp','images/kas-granjero/slaapkamer.webp','images/kas-granjero/slaapkamer2.webp','images/kas-granjero/slaapkamer3.webp','images/kas-granjero/porch.webp','images/kas-granjero/porch2.webp','images/kas-granjero/pool.webp'],
        icalUrl: 'calendars/kas-granjero.ics'
    },
    'veranosol': {
        name: 'Veranosol', location: 'Jan Thiel, Marbella Estate',
        lat: 12.091275162138269, lng: -68.87394653393862,
        bedrooms: 3, guests: 6, pool: true, price: 145, priceBase: 145, priceExtra: 17.5, cleaningFee: 150,
        tags: 'pool luxury',
        desc_nl: 'Luxe moderne villa op Marbella Estate in Jan Thiel, vlakbij Seaquarium Beach en Jan Thiel baai. Tropische tuin, grote Palapa met buitenkoelkast, privézwembad met ligbedjes. 3 slaapkamers, 2 badkamers (+ volledige buitenbadkamer), airco overal, smart TV met IPTV, open keuken volledig uitgerust, wifi. Handdoeken en linnengoed aanwezig. Prijs v.a. €145 (1-4 pers.), elke extra persoon €17,50 p.p.p.n.',
        desc_en: 'Luxury modern villa on Marbella Estate in Jan Thiel, close to Seaquarium Beach and Jan Thiel bay. Tropical garden, large Palapa with outdoor fridge, private pool with sun loungers. 3 bedrooms, 2 bathrooms (+ full outdoor bathroom), A/C throughout, smart TV with IPTV, fully equipped open kitchen, Wi-Fi. Towels and bed linen provided. Price from €145 (1-4 persons), each extra person €17.50 p.p.p.n.',
        hero: 'images/veranosol/hero.webp',
        fallbackHero: 'https://images.pexels.com/photos/2476632/pexels-photo-2476632.jpeg?auto=compress&cs=tinysrgb&w=1200',
        photos: ['images/veranosol/hero.webp','images/veranosol/chillings.webp','images/veranosol/woonkamer.webp','images/veranosol/woonkamer2.webp','images/veranosol/keuken.webp','images/veranosol/badkamer.webp','images/veranosol/slaapkamer.webp','images/veranosol/slaapkamer2.webp','images/veranosol/slaapkamer3.webp','images/veranosol/palapabar.webp','images/veranosol/onderpalapa.webp','images/veranosol/pool.webp','images/veranosol/badkamerbuiten.webp'],
        icalUrl: 'calendars/veranosol.ics'
    }
};

var CONFIG = {
    supabaseFunctionsUrl: 'https://slscbdrmhzhopvpvcome.supabase.co/functions/v1',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsc2NiZHJtaHpob3B2cHZjb21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTAxNTQsImV4cCI6MjA5MzMyNjE1NH0.66fOcX8w_NO87XYY2gtmO5_f4yu3gYD2eObV2oq63UU',
    whatsappNumber: '59996779250',
    ownerEmail: 'rentavillacuracao@gmail.com'
};

function backendEndpoint(name) {
    if (!CONFIG.supabaseFunctionsUrl) return '';
    return CONFIG.supabaseFunctionsUrl.replace(/\/$/, '') + '/' + name;
}

function backendHeaders(extra) {
    var h = {
        'Content-Type': 'application/json',
        'apikey': CONFIG.supabaseAnonKey,
        'Authorization': 'Bearer ' + CONFIG.supabaseAnonKey
    };
    return Object.assign(h, extra || {});
}

function parseBackendResponse(response) {
    return response.text().then(function(text) {
        var data = {};
        if (text) {
            try {
                data = JSON.parse(text);
            } catch (err) {
                data = { error: text };
            }
        }
        if (!response.ok || data.ok === false) {
            var message = data.error || data.message || 'Request failed';
            if (data.details && typeof data.details === 'string') {
                message += ': ' + data.details;
            }
            throw new Error(message);
        }
        return data;
    });
}

/* ============================================================
   CALENDAR STATE
   ============================================================ */
var calState = {
    baseMonth: new Date(),
    arrival: null,
    departure: null,
    blockedDates: [],
    villa: null,
    phase: 0 // 0=select arrival, 1=select departure
};

/* ============================================================
   GLOBALS
   ============================================================ */
var currentLang = 'nl';
var currentVillaId = null;
var leafletMap = null;
var mapMarkers = {};
var galleryIndex = 0;
var galleryPhotos = [];
var _lbIndex = 0;

/* ============================================================
   DOMContentLoaded INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {

    /* --- Scroll animations --- */
    var scrollObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
            if (e.isIntersecting) { e.target.classList.add('is-visible'); scrollObs.unobserve(e.target); }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.animate-on-scroll').forEach(function(el) { scrollObs.observe(el); });

    /* --- Nav scroll shadow --- */
    window.addEventListener('scroll', function() {
        document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 20);
    });

    /* --- Hamburger --- */
    document.getElementById('hamburger').addEventListener('click', function() {
        document.getElementById('navLinks').classList.toggle('mobile-open');
    });
    document.querySelectorAll('.nav-links a').forEach(function(a) {
        a.addEventListener('click', function() { document.getElementById('navLinks').classList.remove('mobile-open'); });
    });

    /* --- Keyboard shortcuts --- */
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeVillaModal();
            document.getElementById('legalModal').classList.remove('active');
            document.body.style.overflow = '';
            closeLightbox();
        }
        if (document.getElementById('lightboxOverlay').classList.contains('active')) {
            if (e.key === 'ArrowLeft') lightboxNav(-1);
            if (e.key === 'ArrowRight') lightboxNav(1);
        }
    });

    /* --- Click outside villa modal --- */
    document.getElementById('villaModal').addEventListener('click', function(e) {
        if (e.target === this) closeVillaModal();
    });

    /* --- Gallery swipe --- */
    var gw = document.getElementById('galleryWrap');
    var touchX0 = 0;
    gw.addEventListener('touchstart', function(e) { touchX0 = e.touches[0].clientX; }, {passive:true});
    gw.addEventListener('touchend', function(e) {
        var diff = touchX0 - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { galleryNav(diff > 0 ? 1 : -1); }
    }, {passive:true});

    /* --- Render villa expand-strip --- */
    renderVillaStrip();

    /* --- Init Leaflet Map (lazy: only when map view is selected) --- */
    // Map is initialized on first toggle to map view.

    /* --- Discover card-stack --- */
    initDiscoverStack();

});

/* ============================================================
   DISCOVER CARD STACK (fanned, 3D, drag/swipe/dots)
   ============================================================ */
var DISCOVER_ITEMS = [
    {
        id: 'stranden',
        tag: 'activiteit',
        tagText: { nl: 'Stranden', en: 'Beaches' },
        title: { nl: 'Stranden & baaien', en: 'Beaches & bays' },
        desc: {
            nl: 'Knip, Cas Abao, Jan Thiel, Porto Marie Curacao heeft meer dan 35 stranden. Van rustige baaien tot gezellige strandclubs, voor elk wat wils.',
            en: 'Knip, Cas Abao, Jan Thiel, Porto Marie Curacao has over 35 beaches. From quiet bays to lively beach clubs, something for everyone.'
        },
        cta: { nl: 'Curacao Tourist Board', en: 'Curacao Tourist Board' },
        href: 'https://www.opnaarcuracao.nl/stranden/',
        img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
    },
    {
        id: 'snorkelen-duiken',
        tag: 'activiteit',
        tagText: { nl: 'Snorkelen & duiken', en: 'Snorkel & dive' },
        title: { nl: 'Snorkelen & duiken', en: 'Snorkelling & diving' },
        desc: {
            nl: 'Helder water, kleurrijke koraalriffen en scheepswrakken. Curacao is een van de beste duikbestemmingen van het Caribisch gebied ook voor beginners.',
            en: 'Crystal-clear water, colourful coral reefs and shipwrecks. Curacao is one of the top dive destinations in the Caribbean great for beginners too.'
        },
        cta: { nl: 'Bekijk duiklocaties', en: 'View dive sites' },
        href: 'https://www.wearetravellers.nl/middenamerika/curacao/snorkelen-curacao/',
        img: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=1200&q=80'
    },
    {
        id: 'willemstad',
        tag: 'activiteit',
        tagText: { nl: 'Willemstad', en: 'Willemstad' },
        title: { nl: 'Willemstad & cultuur', en: 'Willemstad & culture' },
        desc: {
            nl: 'Willemstad met zijn kleurrijke handelskades, drijvende markt, lokale restaurants en de beroemde Koningin Emmabrug.',
            en: 'Willemstad with its colourful trading wharves, floating market, local restaurants and the iconic Queen Emma Bridge.'
        },
        cta: { nl: 'Ontdek Willemstad', en: 'Explore Willemstad' },
        href: 'https://www.wearetravellers.nl/middenamerika/curacao/wat-te-doen-in-willemstad/',
        img: 'https://images.unsplash.com/photo-1500627964684-141351970a7f?auto=format&fit=crop&w=1200&q=80'
    },
    {
        id: 'natuur',
        tag: 'activiteit',
        tagText: { nl: 'Natuur & outdoor', en: 'Nature & outdoor' },
        title: { nl: 'Natuur & outdoor', en: 'Nature & outdoor' },
        desc: {
            nl: 'Christoffelpark, Shete Boka, flamingo\'s bij de zoutpannen, kajakken en boottochten naar Klein Curacao. Avontuur voor de hele familie.',
            en: 'Christoffel Park, Shete Boka, flamingos at the salt flats, kayaking and boat trips to Klein Curacao. Adventure for the whole family.'
        },
        cta: { nl: 'Meer activiteiten', en: 'More activities' },
        href: 'https://www.christoffelpark.org/nl_NL',
        img: 'https://images.unsplash.com/photo-1597106776019-b4ecc878c202?auto=format&fit=crop&w=1200&q=80'
    },
    {
        id: 'hostess',
        tag: 'hostess',
        tagText: { nl: 'Vragen? Neem contact op', en: 'Questions? Get in touch' },
        title: { nl: 'Uw gastvrouw helpt u', en: 'Your hostess is here for you' },
        desc: {
            nl: 'Vragen over activiteiten, aanbevelingen of uw verblijf? Uw gastvrouw staat voor u klaar. Wilt u uw woning aanbieden op dit platform? Neem ook gerust contact op.',
            en: 'Questions about activities, recommendations or your stay? Your hostess is happy to help. Want to list your property on this platform? Feel free to reach out.'
        },
        cta: { nl: 'Stuur een bericht', en: 'Send a message' },
        href: '#contact',
        img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'
    }
];

var cstackState = {
    active: 0,
    dragging: false,
    startX: 0,
    dx: 0,
    hoverTimer: null,
    hoverTarget: null,
    transitionUntil: 0
};

function initDiscoverStack() {
    var stage = document.getElementById('cstackStage');
    if (!stage) return;
    renderDiscoverStack();

    document.getElementById('cstackPrev').addEventListener('click', function() { cstackGo(-1); });
    document.getElementById('cstackNext').addEventListener('click', function() { cstackGo(1); });

    stage.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') cstackGo(-1);
        if (e.key === 'ArrowRight') cstackGo(1);
    });

    /* Drag/swipe on stage */
    var onStart = function(x, y) {
        cstackState.dragging = true;
        cstackState.startX = x;
        cstackState.startY = y || 0;
        cstackState.dx = 0;
        cstackState.dy = 0;
        if (cstackState.hoverTimer) clearTimeout(cstackState.hoverTimer);
        var activeCard = stage.querySelector('.cstack-card.active');
        if (activeCard) activeCard.classList.add('is-dragging');
    };
    var onMove = function(x, y, e) {
        if (!cstackState.dragging) return;
        cstackState.dx = x - cstackState.startX;
        cstackState.dy = (y || 0) - cstackState.startY;
        if (Math.abs(cstackState.dy) > Math.abs(cstackState.dx) + 8) return;
        if (e && e.cancelable) e.preventDefault();
        var activeCard = stage.querySelector('.cstack-card.active');
        if (activeCard) activeCard.style.transform = activeCard.dataset.baseTransform + ' translateX(' + cstackState.dx + 'px)';
    };
    var onEnd = function() {
        if (!cstackState.dragging) return;
        cstackState.dragging = false;
        var activeCard = stage.querySelector('.cstack-card.active');
        if (activeCard) activeCard.classList.remove('is-dragging');
        var threshold = 70;
        var isHorizontal = Math.abs(cstackState.dx) > Math.abs(cstackState.dy || 0);
        if (isHorizontal && cstackState.dx > threshold) cstackGo(-1);
        else if (isHorizontal && cstackState.dx < -threshold) cstackGo(1);
        else renderDiscoverStack();
        cstackState.dx = 0;
        cstackState.dy = 0;
    };

    stage.addEventListener('mousedown', function(e) {
        if (e.button !== 0 || e.target.closest('.cstack-card-cta')) return;
        if (!e.target.closest('.cstack-card.active')) return;
        onStart(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', function(e) { onMove(e.clientX, e.clientY); });
    window.addEventListener('mouseup', onEnd);
    stage.addEventListener('touchstart', function(e) { onStart(e.touches[0].clientX, e.touches[0].clientY); }, {passive:true});
    stage.addEventListener('touchmove', function(e) { onMove(e.touches[0].clientX, e.touches[0].clientY, e); }, {passive:false});
    stage.addEventListener('touchend', onEnd);
}

function cstackGo(dir) {
    var len = DISCOVER_ITEMS.length;
    cstackState.active = (cstackState.active + dir + len) % len;
    cstackState.transitionUntil = Date.now() + 720;
    renderDiscoverStack();
}

function cstackSet(idx) {
    if (idx === cstackState.active) return;
    cstackState.active = idx;
    cstackState.transitionUntil = Date.now() + 720;
    renderDiscoverStack();
}

function renderDiscoverStack() {
    var stage = document.getElementById('cstackStage');
    var dots = document.getElementById('cstackDots');
    if (!stage) return;
    var items = DISCOVER_ITEMS;
    var active = cstackState.active;
    var len = items.length;
    var lang = currentLang || 'nl';

    var maxOffset = 2;
    var spreadDeg = 14;
    var depthPx = 90;
    var spacingPx = 80;

    var needsBuild = stage.children.length !== items.length || stage.dataset.lang !== lang;
    if (needsBuild) {
        var html = '';
        items.forEach(function(it, i) {
            var tagClass = it.tag === 'hostess' ? 'cstack-card-tag hostess' : 'cstack-card-tag';
            html +=
                '<div class="cstack-card" ' +
                'data-index="' + i + '" ' +
                'onclick="cstackCardClick(' + i + ', event)" ' +
                'onpointerenter="cstackCardHover(' + i + ', event)" ' +
                'onpointerleave="cstackCardLeave(' + i + ')">' +
                    '<img src="' + it.img + '" alt="' + it.title[lang] + '" draggable="false">' +
                    '<div class="cstack-card-overlay"></div>' +
                    '<div class="cstack-card-body">' +
                        '<span class="' + tagClass + '">' + it.tagText[lang] + '</span>' +
                        '<div class="cstack-card-title">' + it.title[lang] + '</div>' +
                        '<div class="cstack-card-desc">' + it.desc[lang] + '</div>' +
                        '<a class="cstack-card-cta" href="' + it.href + '">' + it.cta[lang] + '</a>' +
                    '</div>' +
                '</div>';
        });
        stage.innerHTML = html;
        stage.dataset.lang = lang;
    }

    items.forEach(function(it, i) {
        var raw = i - active;
        var alt = raw > 0 ? raw - len : raw + len;
        var off = Math.abs(alt) < Math.abs(raw) ? alt : raw;
        var abs = Math.abs(off);
        var hidden = abs > maxOffset;
        var isActive = off === 0;

        var rotateZ = off * spreadDeg;
        var x = off * spacingPx;
        var y = abs * 8 - (isActive ? 18 : 0);
        var z = -abs * depthPx;
        var scale = isActive ? 1.03 : (1 - abs * 0.05);
        var rotateX = isActive ? 0 : 8;

        var transform = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(' + z + 'px) rotateZ(' + rotateZ + 'deg) rotateX(' + rotateX + 'deg) scale(' + scale + ')';
        var zIndex = 100 - abs;

        var card = stage.querySelector('.cstack-card[data-index="' + i + '"]');
        if (!card) return;
        card.classList.toggle('active', isActive);
        card.classList.toggle('hidden', hidden);
        card.style.transform = transform;
        card.style.zIndex = zIndex;
        card.dataset.baseTransform = transform;
        card.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    });

    /* Dots */
    var dhtml = '';
    items.forEach(function(it, i) {
        dhtml += '<button class="cstack-dot' + (i === active ? ' active' : '') + '" onclick="cstackSet(' + i + ')" aria-label="' + it.title[lang] + '"></button>';
    });
    dots.innerHTML = dhtml;
}

function cstackCardHover(idx, e) {
    if (idx === cstackState.active || cstackState.dragging) return;
    if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches) return;
    if (e && e.pointerType && e.pointerType !== 'mouse') return;
    if (Date.now() < cstackState.transitionUntil) return;
    if (cstackState.hoverTimer) clearTimeout(cstackState.hoverTimer);
    cstackState.hoverTarget = idx;
    cstackState.hoverTimer = setTimeout(function() {
        var card = document.querySelector('.cstack-card[data-index="' + idx + '"]');
        if (
            card &&
            cstackState.hoverTarget === idx &&
            !cstackState.dragging &&
            Date.now() >= cstackState.transitionUntil &&
            card.matches(':hover')
        ) {
            cstackSet(idx);
        }
    }, 180);
}

function cstackCardLeave(idx) {
    if (cstackState.hoverTarget !== idx) return;
    cstackState.hoverTarget = null;
    if (cstackState.hoverTimer) clearTimeout(cstackState.hoverTimer);
}

function cstackCardClick(idx, e) {
    if (idx !== cstackState.active) {
        e.preventDefault();
        cstackSet(idx);
    }
    /* if already active and click was on the CTA <a>, default link navigation proceeds */
}

/* ============================================================
   VILLA EXPAND STRIP (alternative to map view)
   ============================================================ */
function renderVillaStrip() {
    var strip = document.getElementById('villaStrip');
    if (!strip) return;
    var ids = Object.keys(HOUSES_DATA);
    var html = '';
    ids.forEach(function(id, idx) {
        var v = HOUSES_DATA[id];
        var isExpanded = idx === Math.floor(ids.length / 2);
        html +=
            '<div class="villa-strip-card' + (isExpanded ? ' expanded' : '') + '" ' +
            'data-villa-id="' + id + '" ' +
            'onmouseenter="expandStripCard(this)" ' +
            'onclick="handleVillaCardClick(this,\'' + id + '\',event)">' +
                '<img src="' + v.hero + '" onerror="this.src=\'' + v.fallbackHero + '\'" alt="' + v.name + '" loading="lazy">' +
                '<span class="villa-strip-cta">' +
                    (currentLang === 'nl' ? 'Bekijk →' : 'View →') +
                '</span>' +
                '<div class="villa-strip-card-collapsed">' + v.name + '</div>' +
                '<div class="villa-strip-card-info">' +
                    '<span class="name">' + v.name + '</span>' +
                    '<span class="price">' +
                        (currentLang === 'nl' ? 'v.a. €' + v.priceBase + ' / nacht' : 'from €' + v.priceBase + ' / night') +
                    '</span>' +
                    '<span class="meta">' +
                        '🛏️ ' + v.bedrooms + ' · 👥 ' + v.guests +
                        (v.pool ? ' · 🏊 ' + (currentLang === 'nl' ? 'Privézwembad' : 'Private pool') : '') +
                    '</span>' +
                '</div>' +
            '</div>';
    });
    strip.innerHTML = html;
    initMobileVillaAutoExpand();
    updateMobileVillaFocus();
}

function expandStripCard(el) {
    var siblings = el.parentNode.querySelectorAll('.villa-strip-card');
    siblings.forEach(function(s) { s.classList.remove('expanded'); });
    el.classList.add('expanded');
}

function isMobileVillaList() {
    return window.matchMedia && window.matchMedia('(max-width: 600px)').matches;
}

function handleVillaCardClick(el, id, e) {
    if (isMobileVillaList() && !el.classList.contains('expanded')) {
        e.preventDefault();
        expandStripCard(el);
        return;
    }
    openVillaModal(id);
}

var villaFocusRaf = null;
var villaAutoExpandReady = false;

function initMobileVillaAutoExpand() {
    if (villaAutoExpandReady) return;
    villaAutoExpandReady = true;
    var schedule = function() {
        if (villaFocusRaf) return;
        villaFocusRaf = requestAnimationFrame(function() {
            villaFocusRaf = null;
            updateMobileVillaFocus();
        });
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
}

function updateMobileVillaFocus() {
    if (!isMobileVillaList()) return;
    var strip = document.getElementById('villaStrip');
    if (!strip || strip.offsetParent === null) return;
    var cards = Array.prototype.slice.call(strip.querySelectorAll('.villa-strip-card'));
    if (!cards.length) return;

    var focusY = window.innerHeight * 0.52;
    var best = null;
    var bestDistance = Infinity;
    cards.forEach(function(card) {
        var rect = card.getBoundingClientRect();
        if (rect.bottom < 80 || rect.top > window.innerHeight - 80) return;
        var center = rect.top + rect.height / 2;
        var distance = Math.abs(center - focusY);
        if (distance < bestDistance) {
            bestDistance = distance;
            best = card;
        }
    });
    if (best && !best.classList.contains('expanded')) expandStripCard(best);
}

function setVillaView(view) {
    var strip = document.getElementById('villaStripWrap');
    var mapView = document.getElementById('villaMapView');
    var btnStrip = document.getElementById('viewBtnStrip');
    var btnMap = document.getElementById('viewBtnMap');
    if (view === 'map') {
        strip.style.display = 'none';
        mapView.style.display = '';
        btnStrip.classList.remove('active');
        btnMap.classList.add('active');
        if (!leafletMap) {
            initLeafletMap();
        } else {
            setTimeout(function() { leafletMap.invalidateSize(); }, 60);
        }
    } else {
        strip.style.display = '';
        mapView.style.display = 'none';
        btnStrip.classList.add('active');
        btnMap.classList.remove('active');
    }
}

/* ============================================================
   LANGUAGE
   ============================================================ */
function setLang(lang) {
    currentLang = lang;
    document.body.classList.toggle('lang-en', lang === 'en');
    document.querySelectorAll('.lang-btn').forEach(function(b) {
        b.classList.toggle('active', b.textContent.trim() === lang.toUpperCase());
    });
    renderCalendar();
    renderVillaStrip();
    renderDiscoverStack();
}

/* ============================================================
   LEAFLET MAP
   ============================================================ */
function initLeafletMap() {
    leafletMap = L.map('villaMap', { zoomControl: true, scrollWheelZoom: false }).setView([12.0886, -68.8736], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(leafletMap);

    Object.keys(HOUSES_DATA).forEach(function(id) {
        var v = HOUSES_DATA[id];
        if (!v.lat || !v.lng) return;
        addMapPin(id, v);
    });
}

function addMapPin(id, v) {
    var pinHtml =
        '<div class="map-pin-outer" style="min-width:120px;">' +
        '<div class="map-pin-card">' +
        '<img src="' + v.hero + '" onerror="this.src=\'' + v.fallbackHero + '\'" style="width:120px;height:72px;object-fit:cover;display:block;" alt="' + v.name + '">' +
        '<div style="background:var(--color-primary);color:#fff;font-family:var(--font-heading);font-weight:700;font-size:.78rem;text-align:center;padding:3px 6px;line-height:1.3;">' +
        v.name + '<br><span style="font-size:.82rem;">v.a. \u20AC' + v.price + ' / nacht</span>' +
        '</div>' +
        '</div>' +
        '<div class="map-pin-tail"></div>' +
        '</div>';

    var icon = L.divIcon({
        className: '',
        html: pinHtml,
        iconSize: [120, 110],
        iconAnchor: [60, 110],
        popupAnchor: [0, -110]
    });

    var marker = L.marker([v.lat, v.lng], { icon: icon })
        .addTo(leafletMap)
        .on('click', function() { openVillaModal(id); });

    mapMarkers[id] = { marker: marker, tags: v.tags || '' };
}

function filterMapPins(tag, el) {
    document.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
    if (el) { el.classList.add('active'); if (el.nextElementSibling && el.nextElementSibling.classList.contains('filter-tab')) {} }
    // Deactivate the other "all" sibling
    document.querySelectorAll('.filter-tab').forEach(function(t) {
        if (t.onclick && t.onclick.toString().includes("'all'") && t !== el) t.classList.remove('active');
    });
    Object.keys(mapMarkers).forEach(function(id) {
        var m = mapMarkers[id];
        var show = (tag === 'all' || m.tags.includes(tag));
        if (show) { if (!leafletMap.hasLayer(m.marker)) { m.marker.addTo(leafletMap); } }
        else { if (leafletMap.hasLayer(m.marker)) { leafletMap.removeLayer(m.marker); } }
    });
}

/* ============================================================
   VILLA MODAL
   ============================================================ */
function openVillaModal(villaId) {
    var v = HOUSES_DATA[villaId];
    if (!v) return;
    currentVillaId = villaId;

    /* Hero image */
    var heroEl = document.getElementById('vmodalHero');
    heroEl.src = v.hero;
    heroEl.onerror = function() { this.src = v.fallbackHero; this.onerror = null; };
    heroEl.alt = v.name;

    /* Title & meta */
    document.getElementById('vmodalTitle').textContent = v.name;
    document.getElementById('vmodalLocation').innerHTML = '📍 ' + v.location;

    var isNL = currentLang === 'nl';
    document.getElementById('vmodalMeta').innerHTML =
        '<span>🛏️ ' + v.bedrooms + ' ' + (isNL ? 'slaapkamers' : 'bedrooms') + '</span>' +
        '<span>👥 ' + v.guests + ' ' + (isNL ? 'gasten max.' : 'guests max.') + '</span>' +
        (v.pool ? '<span>🏊 ' + (isNL ? 'Privézwembad' : 'Private pool') + '</span>' : '') +
        '<span>💰 v.a. €' + v.priceBase + '</span>';

    document.getElementById('vmodalDesc').textContent = isNL ? v.desc_nl : v.desc_en;

    /* Google Maps button */
    var mapsUrl = 'https://www.google.com/maps?q=' + v.lat + ',' + v.lng;
    var mapsBtn = document.getElementById('vmodalMapsBtn');
    mapsBtn.href = mapsUrl;
    mapsBtn.style.display = 'inline-flex';

    /* Reset tab to details */
    switchVmodalTab(document.getElementById('tabBtn-details'), 'tab-details');

    /* Reset calendar state */
    calState.villa = v;
    calState.arrival = null;
    calState.departure = null;
    calState.blockedDates = [];
    calState.baseMonth = new Date();
    calState.baseMonth.setDate(1);
    calState.phase = 0;

    /* Reset form fields */
    document.getElementById('aanvraagNaam').value = '';
    document.getElementById('aanvraagEmail').value = '';
    document.getElementById('aanvraagGasten').value = '';
    document.getElementById('aanvraagTel').value = '';
    document.getElementById('aanvraagBericht').value = '';
    updateAanvraagBtn();

    /* Render calendar */
    renderCalendar();

    /* Fetch availability */
    fetchIcal(v.icalUrl, villaId);

    /* Setup gallery */
    galleryPhotos = v.photos;
    galleryIndex = 0;
    renderGallery();

    /* Show modal */
    document.getElementById('villaModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    // Scroll to top of modal
    document.getElementById('villaModalInner').scrollTop = 0;
}

function closeVillaModal() {
    document.getElementById('villaModal').classList.remove('active');
    document.body.style.overflow = '';
    currentVillaId = null;
}

function switchVmodalTab(btn, tabId) {
    document.querySelectorAll('.vmodal-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.vmodal-tab-content').forEach(function(c) { c.classList.remove('active'); });
    btn.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

/* ============================================================
   iCAL — reads local .ics files from the calendars/ folder.
   Place your exported .ics files there (Airbnb, Booking.com
   or Google Calendar export). Requires a web server to fetch.
   ============================================================ */
function fetchIcal(url, villaId) {
    var availabilityEndpoint = backendEndpoint('get-availability');
    if (availabilityEndpoint && villaId) {
        var from = dateToStr(new Date());
        var toDate = new Date();
        toDate.setMonth(toDate.getMonth() + 18);
        var backendUrl = availabilityEndpoint + '?villa=' + encodeURIComponent(villaId) +
            '&from=' + encodeURIComponent(from) +
            '&to=' + encodeURIComponent(dateToStr(toDate));

        fetch(backendUrl, { cache: 'no-store', headers: backendHeaders() })
            .then(function(r) {
                if (!r.ok) throw new Error('backend availability unavailable');
                return r.json();
            })
            .then(function(data) {
                if (data && data.ok && Array.isArray(data.blockedDates)) {
                    calState.blockedDates = data.blockedDates;
                    renderCalendar();
                } else if (url) {
                    fetchLocalIcal(url);
                }
            })
            .catch(function() {
                if (url) fetchLocalIcal(url);
            });
        return;
    }

    if (url) fetchLocalIcal(url);
}

function fetchLocalIcal(url) {
    fetch(url, { cache: 'no-store' })
        .then(function(r) {
            if (!r.ok) throw new Error('not found');
            return r.text();
        })
        .then(function(txt) {
            if (txt) {
                calState.blockedDates = parseIcal(txt);
                renderCalendar();
            }
        })
        .catch(function() {
            /* .ics file not available or running locally without server.
               All dates shown as available until file is placed in calendars/ */
        });
}

function parseIcal(text) {
    var blocked = [];
    var events = text.split('BEGIN:VEVENT');
    for (var i = 1; i < events.length; i++) {
        var ev = events[i];
        // Support both DTSTART:YYYYMMDD and DTSTART;VALUE=DATE:YYYYMMDD and DTSTART;TZID=...:YYYYMMDD
        var sMatch = ev.match(/DTSTART(?:;[^:\r\n]*)?:(\d{8})/);
        var eMatch = ev.match(/DTEND(?:;[^:\r\n]*)?:(\d{8})/);
        if (sMatch && eMatch) {
            var s = sMatch[1];
            var e = eMatch[1];
            var cur = new Date(parseInt(s.slice(0,4)), parseInt(s.slice(4,6))-1, parseInt(s.slice(6,8)));
            var end = new Date(parseInt(e.slice(0,4)), parseInt(e.slice(4,6))-1, parseInt(e.slice(6,8)));
            while (cur < end) {
                blocked.push(dateToStr(cur));
                cur.setDate(cur.getDate() + 1);
            }
        }
    }
    return blocked;
}

function dateToStr(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
}
function pad2(n) { return n < 10 ? '0' + n : '' + n; }

/* ============================================================
   CUSTOM CALENDAR RENDERER
   ============================================================ */
var MONTH_NL = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'];
var MONTH_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var DAY_NL = ['Ma','Di','Wo','Do','Vr','Za','Zo'];
var DAY_EN = ['Mo','Tu','We','Th','Fr','Sa','Su'];

function renderCalendar() {
    if (!calState.villa) return;
    var m1 = new Date(calState.baseMonth);
    var m2 = new Date(m1); m2.setMonth(m2.getMonth() + 1);

    var months = currentLang === 'nl' ? MONTH_NL : MONTH_EN;
    var days = currentLang === 'nl' ? DAY_NL : DAY_EN;

    document.getElementById('calTitle1').textContent = months[m1.getMonth()] + ' ' + m1.getFullYear();
    document.getElementById('calTitle2').textContent = months[m2.getMonth()] + ' ' + m2.getFullYear();
    document.getElementById('calNavLabel').textContent = months[m1.getMonth()] + ' – ' + months[m2.getMonth()] + ' ' + m2.getFullYear();

    renderMonthGrid('calGrid1', m1, days);
    renderMonthGrid('calGrid2', m2, days);
    updateCalStatus();
    updatePriceSummary();
}

function renderMonthGrid(gridId, date, days) {
    var grid = document.getElementById(gridId);
    var year = date.getFullYear();
    var month = date.getMonth();
    var today = new Date(); today.setHours(0,0,0,0);
    var firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    var html = '';
    days.forEach(function(d) { html += '<div class="cal-day-header">' + d + '</div>'; });
    for (var i = 0; i < firstWeekday; i++) html += '<div class="cal-day empty"></div>';

    for (var d = 1; d <= daysInMonth; d++) {
        var cur = new Date(year, month, d);
        cur.setHours(0,0,0,0);
        var ds = dateToStr(cur);
        var isPast = cur < today;
        var isBlocked = calState.blockedDates.indexOf(ds) !== -1;
        var isArrival = calState.arrival && ds === dateToStr(calState.arrival);
        var isDeparture = calState.departure && ds === dateToStr(calState.departure);
        var inRange = calState.arrival && calState.departure && cur > calState.arrival && cur < calState.departure;
        // Check if any blocked date falls in range
        var isBlockedInRange = inRange && isBlocked;

        var cls = 'cal-day';
        if (isPast) cls += ' cal-past';
        if (isBlocked) cls += ' cal-blocked';
        if (!isPast && !isBlocked) cls += ' cal-available';
        if (isArrival) cls += ' cal-arrival';
        if (isDeparture) cls += ' cal-departure';
        if (inRange && !isBlocked) cls += ' cal-in-range';

        var onclick = (isPast || isBlocked) ? '' : ' onclick="calClick(\'' + ds + '\')"';
        var title = isBlocked ? (currentLang === 'nl' ? ds + ' - bezet' : ds + ' - reserved') : ds;
        html += '<div class="' + cls + '"' + onclick + ' title="' + title + '">' + d + '</div>';
    }
    grid.innerHTML = html;
}

function calClick(ds) {
    var clicked = new Date(ds + 'T00:00:00');
    if (calState.phase === 0 || (calState.arrival && calState.departure)) {
        // Start new selection
        calState.arrival = clicked;
        calState.departure = null;
        calState.phase = 1;
    } else if (calState.phase === 1) {
        if (clicked > calState.arrival) {
            // Check no blocked dates in range
            var hasBlocked = false;
            var check = new Date(calState.arrival);
            check.setDate(check.getDate() + 1);
            while (check < clicked) {
                if (calState.blockedDates.indexOf(dateToStr(check)) !== -1) { hasBlocked = true; break; }
                check.setDate(check.getDate() + 1);
            }
            if (hasBlocked) {
                // Reset and start from this date
                calState.arrival = clicked;
                calState.departure = null;
            } else {
                calState.departure = clicked;
                calState.phase = 0;
            }
        } else {
            calState.arrival = clicked;
            calState.departure = null;
        }
    }
    renderCalendar();
    updateAanvraagBtn();
}

function calNavMonth(dir) {
    calState.baseMonth.setMonth(calState.baseMonth.getMonth() + dir);
    renderCalendar();
}

function updateCalStatus() {
    var el = document.getElementById('calStatus');
    if (!calState.arrival && !calState.departure) {
        el.innerHTML = currentLang === 'nl'
            ? '<span>👆 Klik op uw aankomstdatum</span>'
            : '<span>👆 Click on your arrival date</span>';
    } else if (calState.arrival && !calState.departure) {
        var fmt = calState.arrival.toLocaleDateString(currentLang === 'nl' ? 'nl-NL' : 'en-GB', {day:'numeric',month:'long'});
        el.innerHTML = currentLang === 'nl'
            ? '✅ Aankomst: <strong>' + fmt + '</strong> klik nu op uw vertrekdatum'
            : '✅ Arrival: <strong>' + fmt + '</strong> now click your departure date';
    } else if (calState.arrival && calState.departure) {
        var nights = Math.round((calState.departure - calState.arrival) / 86400000);
        var a = calState.arrival.toLocaleDateString(currentLang === 'nl' ? 'nl-NL' : 'en-GB', {day:'numeric',month:'short'});
        var d = calState.departure.toLocaleDateString(currentLang === 'nl' ? 'nl-NL' : 'en-GB', {day:'numeric',month:'short'});
        el.innerHTML = currentLang === 'nl'
            ? '🗓️ <strong>' + a + ' → ' + d + '</strong> (' + nights + ' nachten)'
            : '🗓️ <strong>' + a + ' → ' + d + '</strong> (' + nights + ' nights)';
    }
}

function updatePriceSummary() {
    var emptyEl = document.getElementById('priceSummaryEmpty');
    var rowsEl = document.getElementById('priceSummaryRows');
    if (!calState.arrival || !calState.departure || !calState.villa) {
        emptyEl.style.display = '';
        rowsEl.style.display = 'none';
        return;
    }
    emptyEl.style.display = 'none';
    rowsEl.style.display = '';
    var v = calState.villa;
    var nights = Math.round((calState.departure - calState.arrival) / 86400000);
    var nightPrice = v.priceBase * nights;
    var total = nightPrice + v.cleaningFee;
    var isNL = currentLang === 'nl';
    document.getElementById('priceRowNights').innerHTML =
        '<span>' + nights + ' ' + (isNL ? 'nachten' : 'nights') + ' × €' + v.priceBase + '</span><span>€' + nightPrice + '</span>';
    document.getElementById('priceRowCleaning').innerHTML =
        '<span>' + (isNL ? 'Eindschoonmaak' : 'Final cleaning') + '</span><span>€' + v.cleaningFee + '</span>';
    document.getElementById('priceRowTotal').innerHTML =
        '<span>' + (isNL ? 'Totaal (schatting)' : 'Total (estimate)') + '</span><span>€' + total + '</span>';
}

/* ============================================================
   BOOKING MINI FORM
   ============================================================ */
var otpVerifiedToken = null;
var otpVerifiedEmail = null;

function updateAanvraagBtn() {
    var naam = document.getElementById('aanvraagNaam').value.trim();
    var email = document.getElementById('aanvraagEmail').value.trim();
    var gasten = document.getElementById('aanvraagGasten').value;
    var hasDates = calState.arrival && calState.departure;
    var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    var formReady = naam && validEmail && gasten && hasDates;

    // If email changed after verification, reset token
    if (otpVerifiedEmail && email !== otpVerifiedEmail) {
        otpVerifiedToken = null;
        otpVerifiedEmail = null;
        document.getElementById('otpStep').style.display = 'none';
        document.getElementById('btnAanvraag').textContent = '';
        document.getElementById('btnAanvraag').innerHTML = '✉️ <span data-lang="nl">Stuur aanvraag</span><span data-lang="en">Send request</span>';
    }

    if (formReady && !otpVerifiedToken) {
        // Show verify button instead of send button
        document.getElementById('btnAanvraag').disabled = true;
        if (document.getElementById('otpStep').style.display === 'none') {
            document.getElementById('btnAanvraag').disabled = false;
            document.getElementById('btnAanvraag').innerHTML = '📧 <span data-lang="nl">E-mail verifiëren</span><span data-lang="en">Verify email</span>';
            document.getElementById('btnAanvraag').onclick = function() { requestOtp(false); };
        }
    } else if (formReady && otpVerifiedToken) {
        document.getElementById('btnAanvraag').disabled = false;
        document.getElementById('btnAanvraag').innerHTML = '✉️ <span data-lang="nl">Stuur aanvraag</span><span data-lang="en">Send request</span>';
        document.getElementById('btnAanvraag').onclick = stuurAanvraag;
    } else {
        document.getElementById('btnAanvraag').disabled = true;
        document.getElementById('btnAanvraag').innerHTML = '✉️ <span data-lang="nl">Stuur aanvraag</span><span data-lang="en">Send request</span>';
        document.getElementById('btnAanvraag').onclick = stuurAanvraag;
    }
}

function onOtpInput() {
    var val = document.getElementById('otpInput').value.trim();
    document.getElementById('btnVerifyOtp').disabled = val.length !== 6;
}

function requestOtp(isResend) {
    var email = document.getElementById('aanvraagEmail').value.trim();
    var endpoint = backendEndpoint('send-otp');
    if (!endpoint) return;

    var btn = document.getElementById('btnAanvraag');
    btn.disabled = true;
    btn.innerHTML = '⏳ <span data-lang="nl">Code versturen...</span><span data-lang="en">Sending code...</span>';

    fetch(endpoint, {
        method: 'POST',
        headers: backendHeaders(),
        body: JSON.stringify({ email: email, language: currentLang })
    })
    .then(parseBackendResponse)
    .then(function(data) {
        document.getElementById('otpStep').style.display = 'block';
        document.getElementById('otpInput').value = '';
        document.getElementById('otpError').style.display = 'none';
        document.getElementById('btnVerifyOtp').disabled = true;
        btn.disabled = true;
        btn.innerHTML = currentLang === 'nl' ? '📧 Code verstuurd – vul in hierboven' : '📧 Code sent – enter above';
    })
    .catch(function(err) {
        btn.disabled = false;
        btn.innerHTML = '📧 <span data-lang="nl">E-mail verifiëren</span><span data-lang="en">Verify email</span>';
        alert(err.message || (currentLang === 'nl' ? 'Kon code niet versturen.' : 'Could not send code.'));
    });
}

function verifyOtp() {
    var email = document.getElementById('aanvraagEmail').value.trim();
    var code = document.getElementById('otpInput').value.trim();
    var endpoint = backendEndpoint('verify-otp');
    if (!endpoint) return;

    var btn = document.getElementById('btnVerifyOtp');
    btn.disabled = true;
    btn.innerHTML = '<span data-lang="nl">Bezig...</span><span data-lang="en">Checking...</span>';

    fetch(endpoint, {
        method: 'POST',
        headers: backendHeaders(),
        body: JSON.stringify({ email: email, code: code })
    })
    .then(parseBackendResponse)
    .then(function(data) {
        if (!data.token) throw new Error('Invalid code');
        otpVerifiedToken = data.token;
        otpVerifiedEmail = email;
        document.getElementById('otpStep').style.display = 'none';
        updateAanvraagBtn();
    })
    .catch(function(err) {
        var errEl = document.getElementById('otpError');
        errEl.textContent = err.message || (currentLang === 'nl' ? 'Ongeldige code.' : 'Invalid code.');
        errEl.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = '<span data-lang="nl">Bevestigen</span><span data-lang="en">Confirm</span>';
    });
}

function stuurAanvraag() {
    var v = HOUSES_DATA[currentVillaId];
    if (!v || !calState.arrival || !calState.departure) return;
    var naam = document.getElementById('aanvraagNaam').value.trim();
    var email = document.getElementById('aanvraagEmail').value.trim();
    var gasten = document.getElementById('aanvraagGasten').value;
    var tel = document.getElementById('aanvraagTel').value.trim() || 'niet opgegeven';
    var bericht = document.getElementById('aanvraagBericht').value.trim() || '';
    var nights = Math.round((calState.departure - calState.arrival) / 86400000);
    var checkinIso = dateToStr(calState.arrival);
    var checkoutIso = dateToStr(calState.departure);
    var arrival = calState.arrival.toLocaleDateString('nl-NL', {day:'2-digit',month:'2-digit',year:'numeric'});
    var departure = calState.departure.toLocaleDateString('nl-NL', {day:'2-digit',month:'2-digit',year:'numeric'});
    var estimatedTotal = v.priceBase * nights + v.cleaningFee;

    var subject = encodeURIComponent('Boekingsaanvraag: ' + v.name);
    var body = encodeURIComponent(
        'Nieuwe boekingsaanvraag\n\n' +
        'Villa: ' + v.name + '\n' +
        'Aankomst: ' + arrival + '\n' +
        'Vertrek: ' + departure + '\n' +
        'Aantal nachten: ' + nights + '\n' +
        'Aantal gasten: ' + gasten + '\n' +
        'Naam: ' + naam + '\n' +
        'E-mail: ' + email + '\n' +
        'Telefoon: ' + tel + '\n' +
        (bericht ? 'Bericht: ' + bericht + '\n' : '') +
        '\nSchatting: \u20AC' + estimatedTotal + ' (excl. logeerbelasting en borg)'
    );

    var endpoint = backendEndpoint('submit-booking-request');
    if (!endpoint) {
        window.location.href = 'mailto:' + CONFIG.ownerEmail + '?subject=' + subject + '&body=' + body;
        showAanvraagSuccess();
        return;
    }

    var btn = document.getElementById('btnAanvraag');
    btn.disabled = true;
    btn.textContent = currentLang === 'nl' ? 'Aanvraag versturen...' : 'Sending request...';

    fetch(endpoint, {
        method: 'POST',
        headers: backendHeaders(),
        body: JSON.stringify({
            villaId: currentVillaId,
            villaSlug: currentVillaId,
            name: naam,
            email: email,
            phone: tel === 'niet opgegeven' ? '' : tel,
            checkin: checkinIso,
            checkout: checkoutIso,
            guests: gasten,
            message: bericht,
            estimatedTotal: estimatedTotal,
            language: currentLang,
            sourceUrl: window.location.href,
            otpToken: otpVerifiedToken
        })
    })
        .then(function(r) {
            return r.json().then(function(data) {
                if (!r.ok || !data.ok) {
                    var err = new Error(data && data.error ? data.error : 'Request failed');
                    err.status = r.status;
                    throw err;
                }
                return data;
            });
        })
        .then(function() {
            otpVerifiedToken = null;
            otpVerifiedEmail = null;
            showAanvraagSuccess();
        })
        .catch(function(err) {
            var msg = err && err.status === 409
                ? (currentLang === 'nl' ? 'Deze data lijken niet meer beschikbaar. Kies andere data of stuur een WhatsApp-bericht.' : 'These dates no longer appear available. Please choose other dates or send a WhatsApp message.')
                : (currentLang === 'nl' ? 'Versturen lukt nu niet. Probeer WhatsApp of e-mail.' : 'Could not send right now. Please try WhatsApp or email.');
            alert(msg);
            btn.innerHTML = 'âœ‰ï¸ <span data-lang="nl">Stuur aanvraag</span><span data-lang="en">Send request</span>';
            updateAanvraagBtn();
        });
}

function showAanvraagSuccess() {
    var btn = document.getElementById('btnAanvraag');
    btn.disabled = true;
    btn.innerHTML = '✅ ' + (currentLang === 'nl' ? 'Aanvraag verstuurd!' : 'Request sent!');
    btn.style.background = '#22c55e';
    setTimeout(function() {
        btn.style.background = '';
        btn.innerHTML = '✉️ <span data-lang="nl">Stuur aanvraag</span><span data-lang="en">Send request</span>';
        updateAanvraagBtn();
    }, 4000);
}

function stuurWhatsApp() {
    var v = HOUSES_DATA[currentVillaId];
    if (!v) return;
    var naam = document.getElementById('aanvraagNaam').value.trim() || '(naam nog in te vullen)';
    var email = document.getElementById('aanvraagEmail').value.trim() || '';
    var gasten = document.getElementById('aanvraagGasten').value || '(nog in te vullen)';
    var tel = document.getElementById('aanvraagTel').value.trim() || '';
    var bericht = document.getElementById('aanvraagBericht').value.trim() || '';
    var isNL = currentLang === 'nl';
    var arrival = calState.arrival ? calState.arrival.toLocaleDateString('nl-NL') : '(nog te kiezen)';
    var departure = calState.departure ? calState.departure.toLocaleDateString('nl-NL') : '(nog te kiezen)';
    var msg = encodeURIComponent(
        (isNL ? 'Hallo! Ik wil graag een villa huren:\n\n' : 'Hello! I would like to rent a villa:\n\n') +
        '\uD83C\uDFE0 Villa: ' + v.name + '\n' +
        '\uD83D\uDCC5 Aankomst: ' + arrival + '\n' +
        '\uD83D\uDCC5 Vertrek: ' + departure + '\n' +
        '\uD83D\uDC65 Gasten: ' + gasten + '\n' +
        '\uD83D\uDC64 Naam: ' + naam + '\n' +
        '\uD83D\uDCE7 Email: ' + email +
        (tel ? '\n\uD83D\uDCF1 Tel: ' + tel : '') +
        (bericht ? '\n\uD83D\uDCAC ' + bericht : '')
    );
    window.open('https://wa.me/' + CONFIG.whatsappNumber + '?text=' + msg, '_blank');
}

/* ============================================================
   PHOTO GALLERY (Tab 2)
   ============================================================ */
function renderGallery() {
    if (!galleryPhotos.length) return;
    var img = document.getElementById('galleryMainImg');
    img.src = galleryPhotos[galleryIndex];
    img.alt = 'Foto ' + (galleryIndex + 1);
    document.getElementById('galleryCounter').textContent = (galleryIndex + 1) + ' / ' + galleryPhotos.length;

    var thumbs = document.getElementById('galleryThumbs');
    thumbs.innerHTML = galleryPhotos.map(function(p, i) {
        return '<div class="gallery-thumb' + (i === galleryIndex ? ' active' : '') + '" onclick="galleryGoTo(' + i + ')">' +
               '<img src="' + p + '" alt="foto ' + (i+1) + '" onerror="this.parentElement.style.display=\'none\'">' +
               '</div>';
    }).join('');
}

function galleryNav(dir) {
    galleryIndex = (galleryIndex + dir + galleryPhotos.length) % galleryPhotos.length;
    renderGallery();
}

function galleryGoTo(i) {
    galleryIndex = i;
    renderGallery();
}

/* ============================================================
   LIGHTBOX (for full-screen from gallery thumbs)
   ============================================================ */
function openLightbox(index) {
    _lbIndex = index;
    var img = document.getElementById('lightboxImg');
    img.src = galleryPhotos[_lbIndex];
    document.getElementById('lightboxCounter').textContent = (_lbIndex + 1) + ' / ' + galleryPhotos.length;
    document.getElementById('lightboxOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function lightboxNav(dir) {
    _lbIndex = (_lbIndex + dir + galleryPhotos.length) % galleryPhotos.length;
    var img = document.getElementById('lightboxImg');
    img.src = galleryPhotos[_lbIndex];
    document.getElementById('lightboxCounter').textContent = (_lbIndex + 1) + ' / ' + galleryPhotos.length;
}
function closeLightbox() {
    document.getElementById('lightboxOverlay').classList.remove('active');
    document.body.style.overflow = '';
}
function lightboxClickOutside(e) {
    if (e.target === document.getElementById('lightboxOverlay')) closeLightbox();
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function sendContactForm(e) {
    e.preventDefault();
    var btn = document.getElementById('contactSubmitBtn');
    var form = document.getElementById('contactForm');
    var fd = new FormData(form);
    var data = { name: fd.get('name'), email: fd.get('email'), message: fd.get('message'), language: currentLang, sourceUrl: window.location.href };
    var isNL = currentLang === 'nl';
    btn.classList.add('sending');

    var endpoint = backendEndpoint('submit-contact-message');
    if (endpoint) {
        fetch(endpoint, {
            method: 'POST',
            headers: backendHeaders(),
            body: JSON.stringify(data)
        })
            .then(function(r) {
                return r.json().then(function(payload) {
                    if (!r.ok || !payload.ok) throw new Error(payload && payload.error ? payload.error : 'Request failed');
                    return payload;
                });
            })
            .then(function() {
                btn.classList.remove('sending'); btn.classList.add('sent');
                btn.textContent = isNL ? '✅ Bericht verstuurd!' : '✅ Message sent!';
                form.reset();
                setTimeout(function() { btn.classList.remove('sent'); btn.innerHTML = isNL ? '✉️ Verstuur bericht' : '✉️ Send message'; }, 4000);
            })
            .catch(function() {
                var s = encodeURIComponent('Contact via RentaVillaCuracao');
                var b = encodeURIComponent('Naam: ' + data.name + '\nE-mail: ' + data.email + '\n\n' + data.message);
                window.location.href = 'mailto:' + CONFIG.ownerEmail + '?subject=' + s + '&body=' + b;
                btn.classList.remove('sending');
            });
    } else {
        var s = encodeURIComponent('Contact via RentaVillaCuracao');
        var b = encodeURIComponent('Naam: ' + data.name + '\nE-mail: ' + data.email + '\n\n' + data.message);
        window.location.href = 'mailto:' + CONFIG.ownerEmail + '?subject=' + s + '&body=' + b;
        btn.classList.remove('sending');
    }
}

/* ============================================================
   CAR RENTAL WhatsApp
   ============================================================ */
function bookCarWhatsApp(carName, pricePerDay) {
    var isNL = currentLang === 'nl';
    var msg = encodeURIComponent(
        (isNL ? 'Hallo! Ik wil graag een auto huren:\n\n' : 'Hello! I would like to rent a car:\n\n') +
        '🚗 Auto: ' + carName + '\n' +
        '💰 ' + (isNL ? 'Prijs' : 'Price') + ': €' + pricePerDay + (isNL ? ' per dag\n' : ' per day\n') +
        (isNL ? '📅 Huurperiode: (graag invullen)\n👤 Naam: \n📧 E-mail: ' : '📅 Rental period: (please fill in)\n👤 Name: \n📧 Email: ')
    );
    window.open('https://wa.me/' + CONFIG.whatsappNumber + '?text=' + msg, '_blank');
}

/* ============================================================
   FAQ
   ============================================================ */
function toggleFaq(btn) {
    var item = btn.closest('.faq-item');
    var wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(function(i) {
        i.classList.remove('open');
        var question = i.querySelector('.faq-question');
        if (question) question.setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
    }
}

/* ============================================================
   LEGAL MODAL
   ============================================================ */
function openModal(type) {
    document.getElementById('privacyContent').style.display = type === 'privacy' ? '' : 'none';
    document.getElementById('termsContent').style.display = type === 'terms' ? '' : 'none';
    document.getElementById('legalModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeLegalModal(e) {
    if (e.target === document.getElementById('legalModal')) {
        document.getElementById('legalModal').classList.remove('active');
        document.body.style.overflow = '';
    }
}
