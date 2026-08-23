# Shipment Labels API

An Express API backed by UniUni Canada production for live shipment pricing and real label creation. Cancellation remains local-only by design.

## Setup

Install dependencies:

```bash
npm install
```

Start the API with Swagger enabled:

```bash
npm run swagger
```

The server runs at `http://localhost:3000`.

## Swagger UI

Open the interactive API documentation:

[http://localhost:3000/api-docs/](http://localhost:3000/api-docs/)

The raw OpenAPI document is available at:

[http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)

Use **Try it out** in Swagger UI to send requests.

## Usage Sequence

### 1. Get pricing

Call `POST /api/shipments/pricing` with a `shipment` object. Each item requires `name`, `qty`, and `price`; sender and recipient require `name`, `address`, and Canadian `postalCode`. Package dimensions require positive `weight`, `length`, `width`, and `height` values.

```json
{
  "shipment": {
    "from": {
    "name": "Sender",
    "address": "10271 Shellbridge Way, Richmond, BC",
    "postalCode": "V6X 2W8"
    },
    "to": {
    "name": "Recipient",
    "address": "65 Front Street West, Toronto, ON",
    "postalCode": "M5J 1E6"
    },
    "items": [
      {
        "name": "Book",
        "qty": 1,
        "price": 20,
        "currency": "USD"
      }
    ],
    "disMetrics": {
      "weight": 1,
      "length": 20,
      "width": 15,
      "height": 5,
      "weightSys": "kg",
      "lengthSys": "cm"
    }
  }
}
```

Example curl request:

```bash
curl -X POST http://localhost:3000/api/shipments/pricing \
  -H "Content-Type: application/json" \
  -d @MOCK_SHIPMENT
```

The response contains a server-held `quoteKey` and live UniUni rates. Pricing does not create a shipment or shipment ID. Save the `quoteKey` and one rate's `buyKey` for the next step.

### 2. Create a label

Call `POST /api/shipments/labels` with the saved `quoteKey` and selected `buyKey`:

```json
{
  "quoteKey": "quote_123_abc",
  "buyKey": "quote_123_abc_uniuni"
}
```

The response contains the real UniUni shipment, tracking code, selected rate, and PDF `labelData`. The local shipment record is created only after both provider calls succeed.

### 3. List shipments

Call `GET /api/shipments` to retrieve all shipments remembered by the running application. Use this endpoint to select a shipment for later actions.

### 4. Retrieve a shipment or label

Retrieve one shipment:

```bash
curl http://localhost:3000/api/shipments/YOUR_SHIPMENT_ID
```

Retrieve its label:

```bash
curl http://localhost:3000/api/shipments/YOUR_SHIPMENT_ID/label
```

### 5. Cancel a label

A shipment must have status `labelled` before it can be cancelled:

```bash
curl -X DELETE http://localhost:3000/api/shipments/YOUR_SHIPMENT_ID
```

The shipment status changes to `cancelled`.

## API Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/shipments/pricing` | Get live UniUni rates without creating a shipment |
| `POST` | `/api/shipments/labels` | Create a real UniUni shipment and label from a quote |
| `GET` | `/api/shipments` | List remembered shipments |
| `GET` | `/api/shipments/:shipmentId` | Get one shipment |
| `GET` | `/api/shipments/:shipmentId/label` | Get one label |
| `DELETE` | `/api/shipments/:shipmentId` | Cancel a labelled shipment |

## Important Notes

- UniUni Canada production is used through `https://sj.uniexpress.ca`.
- Configure `UNIUNI_CLIENT_ID`, `UNIUNI_CLIENT_SECRET`, and `UNIUNI_CUSTOMER_ID` in `.env`.
- Shipment data is stored in process memory and is lost when the server restarts.
- Quotes expire after 15 minutes by default. Always call pricing first and use the returned `quoteKey` and `buyKey`.
- Cancellation changes only the local status and does not call UniUni.

## Development

Run with automatic restart on file changes:

```bash
npm run dev
```
