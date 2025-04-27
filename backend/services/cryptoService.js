const axios = require('axios');

const getBTCPrice = async () => {
  try {
    const response = await axios.get('https://api.tradingview.com/v1/symbols/BTCUSD/quote');
    return response.data.close;
  } catch (error) {
    console.error('Error fetching BTC price:', error);
    return 50000; // Fallback price
  }
};

module.exports = { getBTCPrice };