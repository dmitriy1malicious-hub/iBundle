# Changelog

All notable committed changes to this project are documented here.

## `0f48aab` - refactor(fetch): added axios

### Changed

- Replaced the unsupported Node.js `fetch` implementation with `axios` for UniUni API requests.
- Preserved JSON response handling, UniUni business-error handling, and base64 PDF label processing.
- Documented the pricing-then-label request flow using the returned `quoteKey` and `buyKey`.
- Documented `GET /api/shipments/:shipmentId/label` for retrieving a generated label and decoding its Base64 data into a PDF.

## 2026-08-23

### `b1886a9` - feat(label): uniuni canada flow

#### Added

- Added the UniUni Canada production client using `https://sj.uniexpress.ca`.
- Added bearer-token authentication through `/storeauth/customertoken` with cached token expiry handling.
- Added live pricing through `/version2/orders/estimateshipping`.
- Added real shipment creation through `/orders/createbusinessorder`.
- Added real PDF label generation through `/orders/printlabel`.
- Added `quoteStore.js` for opaque, expiring quote keys.
- Added `.env.example` with UniUni credentials, customer ID, production URL, and quote TTL settings.

#### Changed

- Changed `POST /api/shipments/pricing` to return live rates and `quoteKey` without creating a shipment ID or local shipment record.
- Changed `POST /api/shipments/labels` to accept `quoteKey` and `buyKey`, create the provider shipment and label, and persist locally only after provider success.
- Changed shipment validation and `MOCK_SHIPMENT` to require sender and recipient addresses and Canadian postal codes.
- Changed label data handling to preserve base64 content from UniUni responses.
- Updated README and Swagger documentation for the quote-first workflow and local-only cancellation.
- Changed the package version to `0.0.1`.

#### Fixed

- Fixed nested UniUni token responses using `data.access_token`.
- Fixed Unix timestamp handling for UniUni token expiry.
- Added validation for UniUni business errors returned with HTTP `200`.
- Added raw PDF byte handling so label content is not corrupted by UTF-8 decoding.

## 2026-08-23

### `e57422b` - chore(git): gitIgnore update

- Updated `.gitignore` to exclude local environment and generated files from version control.

## 2026-08-20

### `96db747` - feat(label): init endpoints

- Added the initial Express shipment labels API.
- Added shipment pricing, label creation, label retrieval, shipment retrieval, listing, and cancellation endpoints.
- Added in-memory shipment storage and shipment validation/rate helpers.
- Added Swagger UI and OpenAPI documentation.
- Added the initial project setup, dependency lockfile, README, and sample shipment payload.
