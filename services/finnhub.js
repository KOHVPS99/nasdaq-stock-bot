const axios = require("axios");

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

if (!FINNHUB_API_KEY) {
  throw new Error("Missing FINNHUB_API_KEY in environment variables.");
}

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

async function getQuote(symbol) {
  const { data } = await http.get("/quote", {
    params: {
      symbol: symbol.toUpperCase(),
      token: FINNHUB_API_KEY
    }
  });

  if (!data || typeof data.c !== "number") {
    throw new Error(`Invalid quote response for ${symbol}`);
  }

  return {
    symbol: symbol.toUpperCase(),
    current: data.c,
    change: data.d,
    percentChange: data.dp,
    high: data.h,
    low: data.l,
    open: data.o,
    previousClose: data.pc,
    timestamp: data.t
  };
}

// Validates US symbol and checks if it belongs to NASDAQ.
async function isNasdaqStock(symbol) {
  const upper = symbol.toUpperCase();

  const { data } = await http.get("/stock/symbol", {
    params: {
      exchange: "US",
      token: FINNHUB_API_KEY
    }
  });

  if (!Array.isArray(data)) return false;

  // Finnhub US symbol list commonly includes "mic" such as XNAS for NASDAQ
  const match = data.find((item) => {
    return (
      item.symbol?.toUpperCase() === upper &&
      item.mic?.toUpperCase() === "XNAS" &&
      item.type?.toUpperCase() === "EQS"
    );
  });

  return Boolean(match);
}

module.exports = {
  getQuote,
  isNasdaqStock
};
