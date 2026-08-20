const express = require('express');
const shipments = require('../shipmentStore');

const router = express.Router();

router.get('/api/shipments/:shipmentId', (req, res) => {
  const record = shipments.get(req.params.shipmentId);
  if (!record) {
    return res.status(404).json({ ok: 0, error: 'shipment not found' });
  }

  return res.json({ ok: 1, shipment: record });
});

module.exports = router;
