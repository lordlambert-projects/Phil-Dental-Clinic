import { careTopics } from "./care-topics.js";
const responsiveMedia = (name, folder = "") => ({
  src: `assets/images/${folder}${name}-960.webp`,
  width: 1536,
  height: 1024,
  webp: [480, 960, 1536].map((width) => ({
    src: `assets/images/${folder}${name}-${width}.webp`,
    width,
  })),
  avif: [480, 960, 1536].map((width) => ({
    src: `assets/images/${folder}${name}-${width}.avif`,
    width,
  })),
});
const generatedGalleryMedia = (name) => responsiveMedia(name, "gallery/");
const illustrativeCaption =
  "AI-generated illustrative imagery. Not a photograph of Phil Dental Clinic, its team, or its patients.";
export const clinicConfig = {
  "demoMode": false,
  "name": "Phil Dental Clinic",
  "tagline": "A better dental experience begins here.",
  "description": "Thoughtful conversations about your dental care. Find Phil Dental Clinic at Lagos Airport Hotel, Awolowo Way, Ikeja.",
  "phone": "08066310546",
  "phoneInternational": "+2348066310546",
  "whatsapp": "",
  "email": "",
  "instagram": "",
  "address": "Suite B1, Lagos Airport Hotel, Ekiti Plaza, 111 Awolowo Way, Ikeja, Lagos 100261, Nigeria",
  "mapsUrl": "https://www.google.com/maps/dir/?api=1&destination=Phil%20Dental%20Clinic%2C%20Suite%20B1%2C%20Lagos%20Airport%20Hotel%2C%20Ekiti%20Plaza%2C%20111%20Awolowo%20Way%2C%20Ikeja%2C%20Lagos%20100261%2C%20Nigeria",
  "plusCode": "J84W+GW Lagos",
  "bookingUrl": "",
  "openingHours": [],
  "location": {
    "mapEmbedUrl": "",
    "mapLabel": "Phil Dental Clinic \u00b7 Lagos Airport Hotel, Ikeja"
  },
  "accessibility": [
    "Wheelchair-accessible toilet",
    "Gender-neutral toilets",
    "Toilet facilities"
  ],
  "paymentMethods": [
    "Credit cards",
    "Debit cards"
  ],
  "appointmentPolicy": [
    "Appointment required",
    "Appointments recommended"
  ],
  "onSiteServices": false,
  "voice": {
    "language": "en-NG",
    "rate": 0.96,
    "welcomeOnWebsite": "Welcome to Phil Dental Clinic\u2019s digital experience. Explore dental care, find us in Ikeja, or prepare an appointment enquiry. Your virtual receptionist is here whenever you need guidance."
  },
  "islandMessages": [
    "How can I help you today?",
    "Planning your visit to Ikeja?",
    "Let\u2019s talk about your smile.",
    "Need help with an appointment?"
  ],
  "logo": "assets/brand/phil-logo-3d-320.webp",
  "logoSrcset": "assets/brand/phil-logo-3d-320.webp 320w, assets/brand/phil-logo-3d-640.webp 640w, assets/brand/phil-logo-3d-960.webp 960w",
  "logoFallback": "assets/brand/phil-logo-official-fallback.png",
  "theme": {
    "primary": "#12B8BB",
    "secondary": "#0D8F96",
    "accent": "#53E5E5",
    "background": "#061218",
    "backgroundSecondary": "#091C26",
    "surface": "#112B35",
    "card": "#102730",
    "text": "#F5FCFD",
    "muted": "#A7C3CA"
  },
  "hero": {
    "headline": [
      "A better dental",
      "experience begins here."
    ],
    "description": "Discover thoughtful dental care in Ikeja, where patience, clear communication, and your comfort matter.",
    "image": "assets/images/hero-960.webp",
    "media": responsiveMedia("hero"),
    "approved": true,
    "alt": "AI-generated illustration of a Black woman dentist speaking with a patient in a modern dental chair"
  },
  "about": {
    "title": "Behind every smile,\na person.",
    "description": "Your questions deserve space. Your next step deserves clarity. Begin a conversation with Phil Dental Clinic in Ikeja about your concerns, the care you are considering, and what you would like to know before your visit.",
    "image": "assets/images/consultation-960.webp",
    "media": responsiveMedia("consultation"),
    "alt": "AI-generated illustration of a dental consultation, not Phil Dental Clinic staff or patients",
    "approved": true,
    "principles": [
      [
        "",
        "A conversation first",
        "Bring your questions. Ask about your options, costs, and what to expect."
      ],
      [
        "",
        "A visit, thoughtfully planned",
        "Appointments are required. Call ahead to confirm a date and current opening hours."
      ],
      [
        "",
        "Space for your needs",
        "Ask the clinic about your individual needs before you travel."
      ]
    ]
  },
  "staff": [],
  "galleryHeading": "A Closer Look at Dental Care.",
  "galleryIntro": "Five glimpses from the collection. Open the gallery to explore all twelve visuals in a focused, full-screen view.",
  "gallery": [
    {
      "id": "hero",
      "title": "Care begins with connection",
      "alt": "Illustration of a dentist explaining care to a patient",
      "media": responsiveMedia("hero"),
      "src": "assets/images/hero-960.webp",
      "caption": "AI-generated illustrative imagery. Not a photograph of Phil Dental Clinic, its team, or its patients.",
      "kind": "generated",
      "verifiedClinicPhoto": false,
      "approved": true,
      "featured": true
    },
    {
      "id": "interior",
      "title": "Room to breathe",
      "alt": "Illustration of a sunlit contemporary dental treatment room",
      "media": responsiveMedia("interior"),
      "src": "assets/images/interior-960.webp",
      "caption": "AI-generated illustrative imagery. Not a photograph of Phil Dental Clinic, its team, or its patients.",
      "kind": "generated",
      "verifiedClinicPhoto": false,
      "approved": true,
      "featured": false
    },
    {
      "id": "consultation",
      "title": "A conversation, not a rush",
      "alt": "Illustration of a dentist discussing information with a patient",
      "media": responsiveMedia("consultation"),
      "src": "assets/images/consultation-960.webp",
      "caption": "AI-generated illustrative imagery. Not a photograph of Phil Dental Clinic, its team, or its patients.",
      "kind": "generated",
      "verifiedClinicPhoto": false,
      "approved": true,
      "featured": false
    },
    {
      "id": "reception",
      "title": "A welcoming first impression",
      "alt": "Illustrative modern dental reception and waiting area",
      "media": generatedGalleryMedia("reception"),
      "src": "assets/images/gallery/reception-960.webp",
      "caption": illustrativeCaption,
      "kind": "generated",
      "verifiedClinicPhoto": false,
      "approved": true,
      "featured": false
    },
    {
      "id": "xray-consultation",
      "title": "Clarity through conversation",
      "alt": "Illustration of a dentist explaining a dental X-ray to a patient",
      "media": generatedGalleryMedia("xray-consultation"),
      "src": "assets/images/gallery/xray-consultation-960.webp",
      "caption": illustrativeCaption,
      "kind": "generated",
      "verifiedClinicPhoto": false,
      "approved": true,
      "featured": false
    },
    {
      "id": "equipment",
      "title": "Prepared with care",
      "alt": "Illustrative dental chair and prepared equipment tray",
      "media": generatedGalleryMedia("equipment"),
      "src": "assets/images/gallery/equipment-960.webp",
      "caption": illustrativeCaption,
      "kind": "generated",
      "verifiedClinicPhoto": false,
      "approved": true,
      "featured": false
    },
    {
      "id": "cleaning-preparation",
      "title": "Comfort before care",
      "alt": "Illustration of a dental professional preparing a patient for cleaning",
      "media": generatedGalleryMedia("cleaning-preparation"),
      "src": "assets/images/gallery/cleaning-preparation-960.webp",
      "caption": illustrativeCaption,
      "kind": "generated",
      "verifiedClinicPhoto": false,
      "approved": true,
      "featured": false
    },
    {
      "id": "care-team",
      "title": "Thoughtful teamwork",
      "alt": "Illustration of dental professionals discussing a care plan",
      "media": generatedGalleryMedia("care-team"),
      "src": "assets/images/gallery/care-team-960.webp",
      "caption": illustrativeCaption,
      "kind": "generated",
      "verifiedClinicPhoto": false,
      "approved": true,
      "featured": false
    },
    {
      "id": "consultation-lounge",
      "title": "A calmer place to begin",
      "alt": "Illustrative contemporary dental consultation lounge",
      "media": generatedGalleryMedia("consultation-lounge"),
      "src": "assets/images/gallery/consultation-lounge-960.webp",
      "caption": illustrativeCaption,
      "kind": "generated",
      "verifiedClinicPhoto": false,
      "approved": true,
      "featured": false
    },
    {
      "id": "chair-consultation",
      "title": "Your next step, explained",
      "alt": "Illustration of a dentist speaking with a patient in a dental chair",
      "media": generatedGalleryMedia("chair-consultation"),
      "src": "assets/images/gallery/chair-consultation-960.webp",
      "caption": illustrativeCaption,
      "kind": "generated",
      "verifiedClinicPhoto": false,
      "approved": true,
      "featured": false
    },
    {
      "id": "sterilization",
      "title": "Ready for every visit",
      "alt": "Illustrative dental sterilization and preparation area",
      "media": generatedGalleryMedia("sterilization"),
      "src": "assets/images/gallery/sterilization-960.webp",
      "caption": illustrativeCaption,
      "kind": "generated",
      "verifiedClinicPhoto": false,
      "approved": true,
      "featured": false
    },
    {
      "id": "family-consultation",
      "title": "Care for every conversation",
      "alt": "Illustration of a dentist speaking with a parent and young patient",
      "media": generatedGalleryMedia("family-consultation"),
      "src": "assets/images/gallery/family-consultation-960.webp",
      "caption": illustrativeCaption,
      "kind": "generated",
      "verifiedClinicPhoto": false,
      "approved": true,
      "featured": false
    }
  ],
  "beforeAfter": [],
  "comparisonFrames": [],
  "testimonials": [
    {
      "text": "Excellent customer service and well detailed information.",
      "author": "Patient feedback",
      "source": "Shared with Phil Dental Clinic",
      "approved": true
    },
    {
      "text": "Wonderful job done with patience.",
      "author": "Patient feedback",
      "source": "Shared with Phil Dental Clinic",
      "approved": true
    },
    {
      "text": "Detailed information on dental care and improvement.",
      "author": "Patient feedback",
      "source": "Shared with Phil Dental Clinic",
      "approved": true
    },
    {
      "text": "Doctor was so patient with me.",
      "author": "Patient feedback",
      "source": "Shared with Phil Dental Clinic",
      "approved": true
    }
  ],
  "reviewHighlights": [],
  "aiWelcome": "I can help you plan a visit, find our Ikeja address, explain general dental topics, or prepare an appointment enquiry. For treatment availability, prices, and opening hours, please call 08066310546.",
  "seo": {
    "title": "Phil Dental Clinic | A Better Dental Experience in Ikeja",
    "description": "Find Phil Dental Clinic at Suite B1, Lagos Airport Hotel, Ekiti Plaza, 111 Awolowo Way, Ikeja, Lagos. Call 08066310546 to arrange an appointment."
  }
};
clinicConfig.services = careTopics;
export const enabledServices = () => clinicConfig.services.filter(s => s.enabled && (s.verified || s.educational));
export const approvedGallery = () => clinicConfig.gallery.filter(g => g.approved).sort((a,b)=>Number(Boolean(b.featured))-Number(Boolean(a.featured)));
