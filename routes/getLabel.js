const express = require('express');
const shipments = require('../shipmentStore');

const router = express.Router();

router.get('/api/shipments/:shipmentId/label', (req, res) => {
  const record = shipments.get(req.params.shipmentId);
  if (!record || !record.label) {
    return res.status(404).json({ ok: 0, error: 'label not found' });
  }

  return res.json({ ok: 1, shipmentId: record.shipmentId, label: record.label });
});

module.exports = router;
