const swaggerUi = require('swagger-ui-express');

const createOpenApiSpecification = (port) => ({
  openapi: '3.0.3',
  info: {
    title: 'Shipment Labels API',
    version: '1.0.0',
    description: 'Local shipment pricing, label creation, listing, and cancellation API.',
  },
  servers: [{ url: `http://localhost:${port}` }],
  tags: [{ name: 'Shipments', description: 'Shipment and label lifecycle operations' }],
  paths: {
    '/api/shipments/pricing': {
      post: {
        tags: ['Shipments'],
        summary: 'Get shipment rates',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PricingRequest' } } },
        },
        responses: {
          201: { description: 'Rates calculated successfully' },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/api/shipments/labels': {
      post: {
        tags: ['Shipments'],
        summary: 'Create a label from a selected rate',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LabelRequest' } } },
        },
        responses: {
          201: { description: 'Label created successfully' },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/api/shipments': {
      get: {
        tags: ['Shipments'],
        summary: 'List remembered shipments',
        responses: { 200: { description: 'Shipment list returned successfully' } },
      },
    },
    '/api/shipments/{shipmentId}': {
      get: {
        tags: ['Shipments'],
        summary: 'Get a remembered shipment',
        parameters: [{ $ref: '#/components/parameters/ShipmentId' }],
        responses: {
          200: { description: 'Shipment returned successfully' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Shipments'],
        summary: 'Cancel a labelled shipment',
        parameters: [{ $ref: '#/components/parameters/ShipmentId' }],
        responses: {
          200: { description: 'Shipment cancelled successfully' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/api/shipments/{shipmentId}/label': {
      get: {
        tags: ['Shipments'],
        summary: 'Get a created label',
        parameters: [{ $ref: '#/components/parameters/ShipmentId' }],
        responses: {
          200: { description: 'Label returned successfully' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
  components: {
    parameters: {
      ShipmentId: {
        name: 'shipmentId',
        in: 'path',
        required: true,
        schema: { type: 'string' },
      },
    },
    responses: {
      BadRequest: {
        description: 'The request is invalid',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NotFound: {
        description: 'The requested shipment or label was not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Conflict: {
        description: 'The requested state transition is not allowed',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
    schemas: {
      Location: {
        type: 'object',
        additionalProperties: true,
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          location: { type: 'object', additionalProperties: true },
        },
      },
      ShipmentItem: {
        type: 'object',
        required: ['name', 'qty', 'price'],
        properties: {
          name: { type: 'string' },
          qty: { type: 'number', exclusiveMinimum: 0 },
          price: { type: 'number', minimum: 0 },
          currency: { type: 'string', example: 'USD' },
          sku: { type: 'string' },
          hsCode: { type: 'string' },
        },
      },
      Shipment: {
        type: 'object',
        required: ['from', 'to', 'items', 'disMetrics'],
        properties: {
          from: { $ref: '#/components/schemas/Location' },
          to: { $ref: '#/components/schemas/Location' },
          items: { type: 'array', minItems: 1, items: { $ref: '#/components/schemas/ShipmentItem' } },
          disMetrics: {
            type: 'object',
            required: ['weight', 'length', 'width', 'height'],
            properties: {
              weight: { type: 'number', exclusiveMinimum: 0 },
              length: { type: 'number', exclusiveMinimum: 0 },
              width: { type: 'number', exclusiveMinimum: 0 },
              height: { type: 'number', exclusiveMinimum: 0 },
              weightSys: { type: 'string', example: 'kg' },
              lengthSys: { type: 'string', example: 'cm' },
            },
          },
        },
      },
      PricingRequest: {
        type: 'object',
        required: ['shipment'],
        properties: { shipment: { $ref: '#/components/schemas/Shipment' } },
      },
      LabelRequest: {
        type: 'object',
        required: ['shipmentId', 'buyKey'],
        properties: {
          shipmentId: { type: 'string' },
          buyKey: { type: 'string' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          ok: { type: 'integer', enum: [0] },
          error: { type: 'string' },
        },
      },
    },
  },
});

const setupSwagger = (app, port) => {
  const specification = createOpenApiSpecification(port);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specification));
  app.get('/api-docs.json', (req, res) => res.json(specification));
};

module.exports = { setupSwagger };
