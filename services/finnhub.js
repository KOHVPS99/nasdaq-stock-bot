const axios = require("axios");

async function getPrice(symbol) {

  const now = Math.floor(Date.now() / 1000);
  const from = now - 60;

  const res = await axios.get(
    "https://finnhub.io/api/v1/stock/candle",
    {
      params: {
        symbol: symbol,
        resolution: 1,
        from: from,
        to: now,
        token: process.env.FINNHUB_API_KEY
      }
    }
  );

  if (!res.data || !res.data.c || res.data.c.length === 0) return null;

  return res.data.c[res.data.c.length - 1];
}

module.exports = { getPrice };
