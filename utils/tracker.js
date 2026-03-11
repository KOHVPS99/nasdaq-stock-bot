const { getQuote } = require("../services/finnhub");
const { getAlerts, removeAlertById } = require("./storage");

let isRunning = false;

async function processAlerts(client) {
  if (isRunning) return;
  isRunning = true;

  try {
    const alerts = getAlerts();
    if (!alerts.length) return;

    // Avoid duplicate quote calls for same symbol in the same cycle
    const uniqueSymbols = [...new Set(alerts.map((a) => a.symbol))];
    const quoteMap = new Map();

    for (const symbol of uniqueSymbols) {
      try {
        const quote = await getQuote(symbol);
        quoteMap.set(symbol, quote);
      } catch (err) {
        console.error(`Quote fetch failed for ${symbol}:`, err.message);
      }
    }

    for (const alert of alerts) {
      const quote = quoteMap.get(alert.symbol);
      if (!quote) continue;

      const current = quote.current;
      let hit = false;

      if (alert.targetType === "sell" && current >= alert.targetPrice) {
        hit = true;
      }

      if (alert.targetType === "buy" && current <= alert.targetPrice) {
        hit = true;
      }

      if (!hit) continue;

      try {
        const channel = await client.channels.fetch(alert.channelId);
        if (!channel || !channel.isTextBased()) continue;

        await channel.send({
          content:
            `🚨 **PRICE ALERT**\n\n` +
            `<@${alert.userId}>\n` +
            `**${alert.symbol}** hit your **${alert.targetType.toUpperCase()}** target.\n` +
            `Target: **$${alert.targetPrice.toFixed(2)}**\n` +
            `Current: **$${current.toFixed(2)}**`
        });

        // Remove after trigger so it only fires once
        removeAlertById(alert.id);
      } catch (err) {
        console.error(`Failed to send alert for ${alert.symbol}:`, err.message);
      }
    }
  } finally {
    isRunning = false;
  }
}

module.exports = {
  processAlerts
};
