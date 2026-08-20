const express = require('express');
const shipments = require('../shipmentStore');

const router = express.Router();

router.get('/api/shipments', (req, res) => {
  res.json({ ok: 1, shipments: Array.from(shipments.values()) });
});

module.exports = router;
