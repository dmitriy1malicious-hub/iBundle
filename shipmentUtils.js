const createId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const validateShipment = (shipment) => {
  if (!isObject(shipment)) {
    return 'shipment must be an object';
  }

  if (!isObject(shipment.from) || !isObject(shipment.to)) {
    return 'shipment.from and shipment.to are required objects';
  }

  if (!Array.isArray(shipment.items) || shipment.items.length === 0) {
    return 'shipment.items must be a non-empty array';
  }

  const invalidItem = shipment.items.find((item) => (
    !isObject(item)
    || typeof item.name !== 'string'
    || !Number.isFinite(Number(item.qty))
    || Number(item.qty) <= 0
    || !Number.isFinite(Number(item.price))
    || Number(item.price) < 0
  ));

  if (invalidItem) {
    return 'each item requires name, positive qty, and non-negative price';
  }

  if (!isObject(shipment.disMetrics)) {
    return 'shipment.disMetrics is required';
  }

  const dimensions = ['weight', 'length', 'width', 'height'];
  if (dimensions.some((field) => !Number.isFinite(Number(shipment.disMetrics[field]))
    || Number(shipment.disMetrics[field]) <= 0)) {
    return 'shipment.disMetrics requires positive weight, length, width, and height';
  }

  return null;
};

const calculateRates = (shipment, requestKey) => {
  const itemValue = shipment.items.reduce((total, item) => total + (Number(item.qty) * Number(item.price)), 0);
  const weight = Number(shipment.disMetrics.weight);
  const baseRate = Number((12 + (weight * 2.5) + (itemValue * 0.01)).toFixed(2));

  return [
    {
      id: createId('rate'),
      buyKey: `${requestKey}_standard`,
      rate: baseRate,
      currency: 'USD',
      total: baseRate,
      extras: {},
      courierId: 'mock-courier',
      courierDesc: 'Mock Courier',
      service: 'MOCK_STANDARD',
      serviceDesc: 'Standard delivery',
      handoverMethod: 'dropoff',
      days: 5,
      daysDesc: '5-7',
    },
    {
      id: createId('rate'),
      buyKey: `${requestKey}_express`,
      rate: Number((baseRate * 1.75).toFixed(2)),
      currency: 'USD',
      total: Number((baseRate * 1.75).toFixed(2)),
      extras: {},
      courierId: 'mock-courier',
      courierDesc: 'Mock Courier',
      service: 'MOCK_EXPRESS',
      serviceDesc: 'Express delivery',
      handoverMethod: 'pickup',
      days: 2,
      daysDesc: '2-3',
    },
  ];
};

module.exports = { calculateRates, createId, validateShipment };
