# Phil Dental Clinic

A standalone HTML, CSS, and vanilla JavaScript website adapted from the NOVA master experience, in a separate folder from Rawclass. No Git repository, hosting account, deployment workflow, or credentials are included or configured.

## Preview and build

Install Node.js 20 or newer. In this folder, run:

```sh
npm install
npm run build
npm run dev
```

Open `http://localhost:4173`. Stop with Ctrl+C. Run `npm run build` after editing; the preview serves the generated `dist` folder. Browser modules require a server rather than double-clicking the HTML file.

Build command: `npm run build`. Output: `dist`. The included `vercel.json` declares only those settings. For your own Vercel import, choose the Other framework preset. No deployment automation is included.

## Where to edit

| Content | File |
| --- | --- |
| Clinic details, theme, gallery and voice welcome | `src/js/config.js` |
| Educational dental topics | `src/js/care-topics.js` |
| Assistant knowledge and responses | `src/js/ai/knowledge-base.js`, `src/js/ai/intent-engine.js` |
| Page structure and metadata | `index.html` |
| Phil styling and responsive rules | `src/css/phil.css` |
| Hero-to-About scroll transition | `src/js/ui/cinematic.js` |
| Official logo animation controller | `src/js/ui/brand-logo.js` |
| Images, SVGs and licensed fonts | `public/assets` |
| Build and preview scripts | `scripts` |

Other CSS files retain the template's interaction styles. The Phil palette is defined in `phil.css` and `config.js`; edit both when changing default theme colours. Edit source files, not regenerated `dist` files.

## Verified and missing information

Supplied details are the clinic name, address, telephone, Plus Code, appointment policy, toilet facilities, and credit/debit card payment methods. No verified treatment catalogue, prices, hours, clinician credentials, WhatsApp number, Instagram account, or testimonials were provided. Missing fields stay empty or are omitted.

Care cards are labelled as general education, not a verified Phil treatment catalogue. Only set a topic's `verified` property to true after clinic confirmation. Add approved service descriptions and prices when available. No fabricated results, reviews, credentials, or statistics are included.

The supplied Phil identity is integrated from `public/assets/brand`. The navbar, welcome platform, footer, and favicon use optimized variants. The periodic animation pauses when the logo is offscreen or the page is hidden and is disabled for reduced-motion visitors.

## Assistant, voice, and appointments

The assistant uses the retained local JavaScript intent engine and configured knowledge. It has no remote language model or API key. It explains general dental topics and supplied clinic details; it cannot diagnose symptoms or prescribe medicines.

The welcome screen appears on the first visit in a browser session, with chat and website choices. Only an anonymous session flag is saved in sessionStorage. Chat and form data stay in memory. The Dynamic Island reopens the assistant; returning to the website restores the page position.

Text-to-speech starts after a click. Available voices depend on the device. Microphone recognition requires HTTPS or localhost, browser support, and permission; it may use the browser provider's network service. Typing remains available. Sounds are off until enabled. Reduced motion disables cinematic scroll, card tilt, and orb motion.

The appointment form prepares preferences for review and copying. It does not send requests or confirm appointments. With only the verified phone supplied, visitors call the clinic to discuss availability. Google Maps loads after a click; directions use the supplied address without invented coordinates.

## Media and privacy

All site imagery and licensed fonts are bundled locally. See `ASSET-NOTES.md`. Responsive AVIF and WebP sources prevent oversized mobile downloads. There are no analytics, external font requests, video downloads, or third-party chat requests. Maps are optional external content.

## Brief completion note

The uploaded prompt ends in section 8 after “The light expands”. The template's retained welcome choices, voice controls, gallery, and enquiry flow complete that experience. No unseen later requirements were assumed.
