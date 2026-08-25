const axios = require('axios');

const BASE_URL = process.env.UNIUNI_BASE_URL || 'https://sj.uniexpress.ca';
const CLIENT_ID = process.env.UNIUNI_CLIENT_ID;
const CLIENT_SECRET = process.env.UNIUNI_CLIENT_SECRET;
const CUSTOMER_ID = process.env.UNIUNI_CUSTOMER_ID || '2125';

let cachedToken = null;

class UniUniError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.name = 'UniUniError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

const request = async (path, options = {}) => {
  const { responseType, method, body, headers } = options;
  const response = await axios({
    url: `${BASE_URL}${path}`,
    method,
    data: body,
    responseType: responseType === 'label' ? 'arraybuffer' : 'json',
    validateStatus: () => true,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(headers || {}),
    },
  });

  const contentType = response.headers['content-type'] || '';
  if (responseType === 'label' && !contentType.includes('application/json')) {
    const labelData = Buffer.from(response.data).toString('base64');
    if (response.status < 200 || response.status >= 300) {
      throw new UniUniError('UniUni request failed', response.status, { contentType });
    }
    return { data: labelData, encoding: 'base64', contentType };
  }

  const responseBody = Buffer.isBuffer(response.data)
    ? response.data.toString('utf8')
    : response.data;
  let parsedBody = responseBody;
  if (typeof responseBody === 'string') {
    try {
      parsedBody = responseBody ? JSON.parse(responseBody) : null;
    } catch {
      parsedBody = responseBody;
    }
  }

  if (parsedBody && !Array.isArray(parsedBody)
    && (parsedBody.status !== undefined || parsedBody.err_code !== undefined)
    && (parsedBody.status !== 'SUCCESS' || Number(parsedBody.err_code) !== 0)) {
    throw new UniUniError('UniUni request returned a business error', 502, parsedBody);
  }

  if (response.status < 200 || response.status >= 300) {
    throw new UniUniError('UniUni request failed', response.status, parsedBody);
  }

  return parsedBody;
};

const getToken = async () => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new UniUniError('UniUni credentials are not configured', 500);
  }

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const body = await request('/storeauth/customertoken?grant_type=client_credentials', {
    method: 'POST',
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  const tokenData = body.data || body;
  const token = tokenData.access_token || tokenData.token;
  if (!token) {
    throw new UniUniError('UniUni token response did not contain an access token', 502, body);
  }

  const expiresIn = Number(tokenData.expires_in);
  const expiresAt = expiresIn > 1e12
    ? expiresIn
    : expiresIn > 1e9
      ? expiresIn * 1000
      : Date.now() + Math.max(expiresIn || 24 * 60 * 60, 60) * 1000;
  cachedToken = { value: token, expiresAt: expiresAt - 60 * 1000 };
  return token;
};

const authorizedRequest = async (path, options = {}) => {
  const token = await getToken();
  return request(path, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
};

const estimateShipping = (payload) => authorizedRequest('/version2/orders/estimateshipping', {
  method: 'POST',
  body: JSON.stringify({ ...payload, customer_id: payload.customer_id || CUSTOMER_ID }),
});

const createShipment = (payload) => authorizedRequest('/orders/createbusinessorder', {
  method: 'POST',
  body: JSON.stringify({ ...payload, customer_no: payload.customer_no || CUSTOMER_ID }),
});

const printLabel = (payload) => authorizedRequest('/orders/printlabel', {
  method: 'POST',
  responseType: 'label',
  body: JSON.stringify(payload),
});

module.exports = {
  UniUniError,
  estimateShipping,
  createShipment,
  printLabel,
};