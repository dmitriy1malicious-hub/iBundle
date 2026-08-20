const express = require('express');
const shipments = require('../shipmentStore');
const { calculateRates, createId, validateShipment } = require('../shipmentUtils');

const router = express.Router();

router.post('/api/shipments/pricing', (req, res) => {
  const { shipment } = req.body;
  const validationError = validateShipment(shipment);

  if (validationError) {
    return res.status(400).json({ ok: 0, error: validationError });
  }

  const shipmentId = createId('shipment');
  const requestKey = createId('request');
  const rates = calculateRates(shipment, requestKey);
  const now = new Date().toISOString();

  shipments.set(shipmentId, {
    shipmentId,
    shipment,
    requestKey,
    rates,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    label: null,
  });

  return res.status(201).json({ ok: 1, shipmentId, requestKey, rates });
});

module.exports = router;
