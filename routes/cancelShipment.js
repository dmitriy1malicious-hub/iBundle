const express = require('express');
const shipments = require('../shipmentStore');

const router = express.Router();

router.delete('/api/shipments/:shipmentId', (req, res) => {
  const record = shipments.get(req.params.shipmentId);
  if (!record) {
    return res.status(404).json({ ok: 0, error: 'shipment not found' });
  }

  if (record.status === 'cancelled') {
    return res.status(409).json({ ok: 0, error: 'shipment is already cancelled' });
  }

  if (record.status !== 'labelled') {
    return res.status(409).json({ ok: 0, error: 'only labelled shipments can be cancelled' });
  }

  record.status = 'cancelled';
  record.updatedAt = new Date().toISOString();
  return res.json({ ok: 1, shipment: record });
});

module.exports = router;
