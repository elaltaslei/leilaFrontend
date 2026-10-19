# LEILA Yacht Experience

Trilingual static website source. English, Spanish and German pages are in `en/`, `es/` and `de/`; optimised photos and shared styles/scripts are in `assets/`. Build `dist/` before serving or publishing so the API URL is generated for the selected environment.

Run `node build-frontend.mjs` from this repository to create `dist/`. The build reads the active backend properties profile (`APP_ENV=dev` or `APP_ENV=prod`) and writes its API URL into `dist/assets/config.js`; it defaults to production.

## Content and photos

- Selected images from the original photo collection are exported as responsive WebP files in `assets/`. Most photos have 480, 960 and 1440 pixel variants. The hero has 768, 1280 and 1920 pixel desktop sizes plus a 720 pixel portrait crop for mobile.
- Keep the descriptive asset names and update all three language pages together when changing content. Responsive WebP image sets use `leila-under-sail-*` (hero), `leila-sailing-deck-*` (experience), `leila-at-anchor-*` (yacht), `leila-guests-*` (clients), `palma-cathedral-from-sea-*` (destinations), `onboard-table-*` (gastronomy), and the gallery files `leila-sailing-detail-*`, `leila-salon-*`, `leila-cabin-*`, and `bellver-castle-from-sea-*`.
- Images below the first screen load lazily and include descriptive alt text and dimensions. Preserve those attributes and width variants when updating the markup in `en/index.html`, `es/index.html` and `de/index.html`.
- Keep titles, descriptions, canonical URLs, language alternates and sitemap entries aligned between both pages.
- Confirm the boat's current authorised day and overnight capacities before changing or promoting those figures.

## Availability and enquiries

The enquiry form sends JSON to `POST {LEILA_API_BASE}/request-booking`. Run `npm start dev` from the repository root to build and serve the local site at `http://127.0.0.1:8765` and the API at `http://127.0.0.1:3001`. The published site uses the production backend URL; allowed browser origins are selected by `APP_ENV` in backend config. The backend rejects calendar conflicts, emails the captain configured in `backend/config/properties.json`, and manages approval and Stripe payment.

All Calendar API calls happen on the backend. Share the business calendar with the configured service account, use `Europe/Madrid`, and keep credentials in the backend environment file/secret store. Never expose event titles or details to website visitors.

## Legal and launch details

Booking prices and Half Charter slots are configured in `backend/config/properties.json`. Half Charter is €400 and can be requested for 10:00–14:00 or 16:00–20:00. Before bookings open, provide the legal company name and contact details, privacy notice, cookie configuration, booking/cancellation/refund terms, and any confirmed inclusions or extras. Add the real email, WhatsApp number and social URLs when supplied. No testimonials, route promises or event details are fabricated in this version.

## Publishing

The site is managed through OpenAI Sites. Keep `.openai/hosting.json` in this repository and build the frontend to `dist/`, then sync the build output into the Sites project and publish a new version. The current published site is private; request a change to the audience only when the owner is ready to share it publicly. Add the definitive domain and verify its DNS before replacing the canonical URLs and sitemap host. Submit the final sitemap to Search Console after launch.
