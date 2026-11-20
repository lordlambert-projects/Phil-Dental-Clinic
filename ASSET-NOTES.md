# Asset notes

The three photographic illustrations were generated for this project. They do not depict verified Phil Dental Clinic premises, team members, or patients. Hero and gallery disclosures and image alt text identify them as illustrative.

- `hero-*.webp`: a dentist explaining care to a patient in a dental chair.
- `consultation-*.webp`: a dentist and patient discussing information at a desk.
- `interior-*.webp`: a sunlit dental treatment room.

Each image is bundled at 480, 960, and 1536 pixels wide in both AVIF and WebP formats. AVIF is preferred by supported browsers, while WebP remains the fallback. The hero is eager-loaded; care cards and gallery images are lazy-loaded. The compact gallery requests thumbnail-sized sources and loads larger variants only in the modal. No generated clinical results or testimonials are included.

Sora and Manrope are locally bundled under the SIL Open Font License. Their licences are beside the font files in `public/assets/fonts`.

The official Phil reference supplied for this update is a very small raster image. A cleaned transparent dimensional interpretation is stored under `public/assets/brand` in 320, 640, and 960 pixel WebP variants, with a lossless transparent PNG fallback. Its dark PHIL construction, cross, blue accent, and blue “Dental Clinic” wordmark follow the supplied reference; unreadable microtext was not invented. CSS provides the occasional wave, sheen, depth, and hover perspective without video or WebGL.

Motion uses CSS and JavaScript, without video downloads or autoplay. Maps use the supplied address and click-to-load Google Maps; no coordinates were invented.
