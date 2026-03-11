const axios = require("axios");

async function getPrice(symbol){

  const res = await axios.get(
    `https://finnhub.io/api/v1/quote`,
    {
      params:{
        symbol: symbol,
        token: process.env.FINNHUB_API_KEY
      }
    }
  );

  return res.data.c;
}

module.exports = { getPrice };
