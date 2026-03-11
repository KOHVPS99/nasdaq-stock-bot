const { SlashCommandBuilder } = require("discord.js");
const { getQuote, isNasdaqStock } = require("../services/finnhub");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("price")
    .setDescription("Get the current price for a NASDAQ stock")
    .addStringOption((option) =>
      option
        .setName("symbol")
        .setDescription("Ticker symbol, for example AAPL")
        .setRequired(true)
    ),

  async execute(interaction) {
    const symbol = interaction.options.getString("symbol", true).toUpperCase();

    await interaction.deferReply();

    try {
      const allowed = await isNasdaqStock(symbol);
      if (!allowed) {
        return await interaction.editReply(`❌ ${symbol} is not a NASDAQ stock.`);
      }

      const quote = await getQuote(symbol);

      return await interaction.editReply(
        `📈 **${symbol}**\n` +
          `Current: **$${quote.current.toFixed(2)}**\n` +
          `Open: **$${quote.open.toFixed(2)}**\n` +
          `High: **$${quote.high.toFixed(2)}**\n` +
          `Low: **$${quote.low.toFixed(2)}**\n` +
          `Prev Close: **$${quote.previousClose.toFixed(2)}**\n` +
          `Change: **${quote.change.toFixed(2)} (${quote.percentChange.toFixed(2)}%)**`
      );
    } catch (err) {
      console.error(err);
      return await interaction.editReply("❌ Failed to fetch stock price.");
    }
  }
};
