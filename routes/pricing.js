const express = require('express');
const { createId, validateShipment, toUniUniShipment } = require('../shipmentUtils');
const { saveQuote, countQuotes } = require('../quoteStore');
const { estimateShipping } = require('../uniuniClient');

const router = express.Router();

router.post('/api/shipments/pricing', async (req, res) => {
  const { shipment } = req.body;
  const validationError = validateShipment(shipment);

  if (validationError) {
    return res.status(400).json({ ok: 0, error: validationError });
  }

  try {
    const quoteKey = createId('quote');
    const providerRequest = toUniUniShipment(shipment, process.env.UNIUNI_CUSTOMER_ID || '2125');
    const providerResponse = await estimateShipping(providerRequest);
    const providerRate = providerResponse.data || providerResponse;
    const total = Number(providerRate.totalAfterTax || providerRate.totalBeforeTax || providerRate.shippingCharge);
    const rate = {
      id: createId('rate'),
      buyKey: `${quoteKey}_uniuni`,
      rate: total,
      currency: providerRate.currency || 'CAD',
      total,
      provider: 'uniuni',
      providerRate,
    };

    saveQuote(quoteKey, { shipment, providerRequest, rates: [rate] });
    return res.status(200).json({ ok: 1, quoteKey, rates: [rate], quoteCount: countQuotes() });
  } catch (error) {
    return res.status(error.statusCode || 502).json({ ok: 0, error: error.message, details: error.details });
  }
});

module.exports = router;
