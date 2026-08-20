# Shipment Labels API

A local Express mock API for getting shipment pricing, creating labels, listing remembered shipments, and cancelling labels.

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

Call `POST /api/shipments/pricing` with a `shipment` object. Each item requires `name`, `qty`, and `price`. Package dimensions require positive `weight`, `length`, `width`, and `height` values.

```json
{
  "shipment": {
    "from": {
      "name": "Sender"
    },
    "to": {
      "name": "Recipient"
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

The response contains a generated `shipmentId` and a list of rates. Save the `shipmentId` and one rate's `buyKey` for the next step.

### 2. Create a label

Call `POST /api/shipments/labels` with the saved `shipmentId` and selected `buyKey`:

```json
{
  "shipmentId": "shipment_123_abc",
  "buyKey": "request_123_standard"
}
```

The response contains the created label, tracking code, selected rate, and `labelData`.

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
| `POST` | `/api/shipments/pricing` | Calculate mock shipment rates |
| `POST` | `/api/shipments/labels` | Create a mock label from a selected rate |
| `GET` | `/api/shipments` | List remembered shipments |
| `GET` | `/api/shipments/:shipmentId` | Get one shipment |
| `GET` | `/api/shipments/:shipmentId/label` | Get one label |
| `DELETE` | `/api/shipments/:shipmentId` | Cancel a labelled shipment |

## Important Notes

- This is a local mock implementation; it does not call the real API.
- Shipment data is stored in process memory and is lost when the server restarts.
- Always call pricing first and use the returned local `shipmentId` and `buyKey`.
- An external `shipmentId` cannot be used with this local mock API.
- The generated label data is a mock base64 value, not a real shipping label PDF.

## Development

Run with automatic restart on file changes:

```bash
npm run dev
```
