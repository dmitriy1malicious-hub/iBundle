const express = require('express');
const shipments = require('../shipmentStore');
const { createId } = require('../shipmentUtils');

const router = express.Router();

router.post('/api/shipments/labels', (req, res) => {
  const { shipmentId, buyKey } = req.body;
  const record = shipments.get(shipmentId);

  if (!record) {
    return res.status(404).json({ ok: 0, error: 'shipment not found' });
  }

  if (record.status !== 'pending') {
    return res.status(409).json({ ok: 0, error: `shipment cannot be labelled while ${record.status}` });
  }

  const selectedRate = record.rates.find((rate) => rate.buyKey === buyKey);
  if (!selectedRate) {
    return res.status(400).json({ ok: 0, error: 'buyKey is invalid for this shipment' });
  }

  const now = new Date().toISOString();
  record.status = 'labelled';
  record.updatedAt = now;
  record.label = {
    trackingCode: createId('tracking'),
    courier: selectedRate.courierId,
    labelUrl: `/api/shipments/${shipmentId}/label`,
    labelData: 'bW9jay1sYWJlbA==',
    rate: selectedRate,
    createdAt: now,
  };

  return res.status(201).json({ ok: 1, shipment: record });
});

module.exports = router;
