const { SlashCommandBuilder } = require("discord.js");
const crypto = require("crypto");
const { isNasdaqStock, getQuote } = require("../services/finnhub");
const { addAlert, getUserAlerts } = require("../utils/storage");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("track")
    .setDescription("Track a NASDAQ stock and get pinged when target price is hit")
    .addStringOption((option) =>
      option
        .setName("symbol")
        .setDescription("Ticker symbol, for example AAPL")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("price")
        .setDescription("Target price")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("buy = alert when price goes down to target, sell = alert when price goes up to target")
        .setRequired(true)
        .addChoices(
          { name: "buy", value: "buy" },
          { name: "sell", value: "sell" }
        )
    ),

  async execute(interaction) {
    const symbol = interaction.options.getString("symbol", true).toUpperCase();
    const targetPrice = interaction.options.getNumber("price", true);
    const targetType = interaction.options.getString("type", true).toLowerCase();

    await interaction.deferReply({ ephemeral: true });

    try {
      const allowed = await isNasdaqStock(symbol);
      if (!allowed) {
        return await interaction.editReply(`❌ ${symbol} is not a NASDAQ stock.`);
      }

      const quote = await getQuote(symbol);

      const existing = getUserAlerts(interaction.user.id).find(
        (a) =>
          a.symbol === symbol &&
          a.targetPrice === targetPrice &&
          a.targetType === targetType
      );

      if (existing) {
        return await interaction.editReply(
          `⚠️ You already track **${symbol}** at **$${targetPrice.toFixed(2)}** for **${targetType}**.`
        );
      }

      addAlert({
        id: crypto.randomUUID(),
        userId: interaction.user.id,
        channelId: interaction.channelId,
        symbol,
        targetPrice,
        targetType,
        createdAt: new Date().toISOString()
      });

      return await interaction.editReply(
        `✅ Tracking **${symbol}** for **${targetType.toUpperCase()}** at **$${targetPrice.toFixed(2)}**.\n` +
          `Current price: **$${quote.current.toFixed(2)}**\n` +
          `You will be pinged here when the target is hit.`
      );
    } catch (err) {
      console.error(err);
      return await interaction.editReply("❌ Failed to create tracking alert.");
    }
  }
};
