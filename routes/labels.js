const express = require('express');
const shipments = require('../shipmentStore');
const { getQuote, takeQuote } = require('../quoteStore');
const { createShipment, printLabel } = require('../uniuniClient');

const router = express.Router();

router.post('/api/shipments/labels', async (req, res) => {
  const { quoteKey, buyKey } = req.body;
  const quote = getQuote(quoteKey);

  if (!quote) {
    return res.status(404).json({ ok: 0, error: 'quote not found or expired' });
  }

  const selectedRate = quote.rates.find((rate) => rate.buyKey === buyKey);
  if (!selectedRate) {
    return res.status(400).json({ ok: 0, error: 'buyKey is invalid for this shipment' });
  }

  takeQuote(quoteKey);
  try {
    const providerResponse = await createShipment(quote.providerRequest);
    const providerShipment = providerResponse.data || providerResponse;
    const trackingCode = providerShipment.tno || providerShipment.tracking_no || providerShipment.trackingNumber;
    if (!trackingCode) {
      return res.status(502).json({ ok: 0, error: 'UniUni shipment response did not contain a tracking number' });
    }

    const labelResponse = await printLabel({ packageId: trackingCode, labelType: 6, labelFormat: 'pdf', type: 'base64' });
    const now = new Date().toISOString();
    const record = {
      shipmentId: trackingCode,
      shipment: quote.shipment,
      rates: quote.rates,
      status: 'labelled',
      createdAt: now,
      updatedAt: now,
      label: {
        trackingCode,
        courier: 'uniuni',
        labelUrl: `/api/shipments/${trackingCode}/label`,
        labelData: labelResponse.data || labelResponse,
        labelEncoding: labelResponse.encoding || 'base64',
        rate: selectedRate,
        providerShipment,
        createdAt: now,
      },
    };
    shipments.set(trackingCode, record);
    return res.status(201).json({ ok: 1, shipment: record });
  } catch (error) {
    return res.status(error.statusCode || 502).json({ ok: 0, error: error.message, details: error.details });
  }
});

module.exports = router;
