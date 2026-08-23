const quotes = new Map();

const QUOTE_TTL_MS = Number(process.env.QUOTE_TTL_MS) || 15 * 60 * 1000;

const removeExpired = () => {
  const now = Date.now();
  for (const [quoteKey, quote] of quotes) {
    if (quote.expiresAt <= now) {
      quotes.delete(quoteKey);
    }
  }
};

const saveQuote = (quoteKey, quote) => {
  removeExpired();
  quotes.set(quoteKey, {
    ...quote,
    expiresAt: Date.now() + QUOTE_TTL_MS,
  });
};

const takeQuote = (quoteKey) => {
  removeExpired();
  const quote = quotes.get(quoteKey);
  if (quote) {
    quotes.delete(quoteKey);
  }
  return quote;
};

const getQuote = (quoteKey) => {
  removeExpired();
  return quotes.get(quoteKey);
};

const countQuotes = () => {
  removeExpired();
  return quotes.size;
};

module.exports = { saveQuote, getQuote, takeQuote, countQuotes };