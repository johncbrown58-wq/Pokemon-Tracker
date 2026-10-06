# Pokémon Card Tracker

A mobile-first, offline-capable collection tracker for the Pokémon Base, Jungle, and Fossil sets.

## Included
- 158 Pokémon collectibles: Base 69, Jungle 47, Fossil 42
- Organized by National Pokédex number
- Print variants such as 1st Edition, Shadowless, Unlimited, holo/non-holo are treated as the same collectible
- Search by Pokémon name, National Dex number, or card number
- All / Missing / Owned filters
- Set tabs and per-set progress
- Tap cards to toggle ownership
- Owned cards display in color; missing cards are grayed out
- Ownership saved locally on the device
- Bundled card catalog so the app can launch without the network
- Prepare Offline mode to cache all card images for flea-market use
- Market Mode for fast searching and one-tap checking
- JSON Backup / Restore for moving or protecting your collection
- Installable as a GitHub Pages web app / iPhone Home Screen app

## Offline use
Open the app while online, then tap **Prepare Offline** before going somewhere with poor or no service. The app stores its catalog locally and caches the card images for offline browsing.

## Future expansion
The app structure is ready to add additional sets and separate Trainer/Energy collections later.

Card metadata and images originate from the historical Pokémon TCG data repository.

## Live pricing setup

Live card prices use PkmnPrices TCGplayer market data. The browser app does **not** send or store your PkmnPrices API key. Instead, `price-proxy.js` is designed to run as a Cloudflare Worker with the key stored as the Worker secret `PKMNPRICES_API_KEY`.

### One-time setup

1. Create a Cloudflare account and create a Worker from the contents of `price-proxy.js`.
2. Deploy the Worker on its `workers.dev` address.
3. In the Worker, open **Settings → Variables and Secrets → Add**, choose **Secret**, name it `PKMNPRICES_API_KEY`, and paste your PkmnPrices API key. Deploy again.
4. Test `https://YOUR-WORKER-URL/health`. It should return JSON showing `"status":"ok"` and `"pricingConfigured":true`.
5. In Pokémon Tracker → **Price Settings**, enter the Worker URL and save it.
6. Tap a card. The tracker will request current TCGplayer USD market prices through the Worker.

Do not put the PkmnPrices key in this repository, in `app.js`, or in the tracker settings. If an old key was previously entered into the browser version of the tracker, revoke/replace that key in PkmnPrices after the proxy is working.
