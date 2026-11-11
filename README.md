# YOUR BRAND — ethnic wear catalog starter

A colorful responsive Next.js + TypeScript + Tailwind CSS frontend. Sample products are hardcoded in `src/app/page.tsx`. No database, admin authentication, or contact-form backend exists yet.

## Requirements
- Node.js 20.9+ (prefer current LTS)
- npm

## Run locally
1. Unzip the folder and open it in VS Code.
2. Open a terminal in the `your-brand-starter` directory.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local`.
5. Optionally set `NEXT_PUBLIC_WHATSAPP_NUMBER` to your business number in international format (digits only, no +).
6. Run `npm run dev`.
7. Visit http://localhost:3000.

## Edit the catalog
Update the `products` array in `src/app/page.tsx`. Product images are currently emoji placeholders; replace with licensed or your own images before launch.

## Security status
This is **frontend-only**. There are no credentials, customer accounts, database connections, contact-form submissions, or admin routes. WhatsApp inquiries open an external WhatsApp URL only after a number is configured. Do not store secrets in `NEXT_PUBLIC_` variables. Before production launch, add authenticated server-side administration, secure product image storage, a validated/rate-limited contact endpoint, and security tests.
