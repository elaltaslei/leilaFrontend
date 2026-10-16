# LEILA Yacht Experience

Buildless trilingual website source. English, Spanish and German pages are in `en/`, `es/` and `de/`; optimised photos and shared styles/scripts are in `assets/`.

Run `node build-frontend.mjs` from this repository to create `dist/`.

## Content and photos

- Selected images from the original photo collection are exported as responsive WebP files in `assets/`. Most photos have 480, 960 and 1440 pixel variants. The hero has 768, 1280 and 1920 pixel desktop sizes plus a 720 pixel portrait crop for mobile.
- Keep the descriptive asset names and update all three language pages together when changing content. Responsive WebP image sets use `leila-under-sail-*` (hero), `leila-sailing-deck-*` (experience), `leila-at-anchor-*` (yacht), `leila-guests-*` (clients), `palma-cathedral-from-sea-*` (destinations), `onboard-table-*` (gastronomy), and the gallery files `leila-sailing-detail-*`, `leila-salon-*`, `leila-cabin-*`, and `bellver-castle-from-sea-*`.
- Images below the first screen load lazily and include descriptive alt text and dimensions. Preserve those attributes and width variants when updating the markup in `en/index.html`, `es/index.html` and `de/index.html`.
- Keep titles, descriptions, canonical URLs, language alternates and sitemap entries aligned between both pages.
- Confirm the boat's current authorised day and overnight capacities before changing or promoting those figures.

## Availability and enquiries

The enquiry form sends JSON to `POST {LEILA_API_BASE}/request-booking`. Local previews use `http://localhost:3001/api`; the published GitHub Pages build stays disabled until a public backend URL is configured in `assets/config.js`. Set it to `https://<backend-host>/api` after deploying the backend. The backend rejects calendar conflicts, emails the captain configured in backend `config/properties.json`, and manages acceptance/rejection and Stripe payment. The website never claims a requested date is available or confirmed before payment.

All Calendar API calls happen on the backend. Share the business calendar with the configured service account, use `Europe/Madrid`, and keep credentials in the backend environment file/secret store. Never expose event titles or details to website visitors.

## Legal and launch details

Before bookings open, provide the legal company name and contact details, privacy notice, cookie configuration, booking/cancellation/refund terms, and any confirmed inclusions or extras. Add the real email, WhatsApp number and social URLs when supplied. No prices, testimonials, route promises or event details are fabricated in this version.

## Publishing

The site is managed through OpenAI Sites. Keep `.openai/hosting.json` in this repository and build the frontend to `dist/`, then sync the build output into the Sites project and publish a new version. The current published site is private; request a change to the audience only when the owner is ready to share it publicly. Add the definitive domain and verify its DNS before replacing the canonical URLs and sitemap host. Submit the final sitemap to Search Console after launch.
