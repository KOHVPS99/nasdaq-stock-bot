const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("price")
    .setDescription("Get stock price")
    .addStringOption(option =>
      option.setName("symbol")
        .setDescription("Stock ticker")
        .setRequired(true)
    ),

  async execute(interaction) {
    const symbol = interaction.options.getString("symbol").toUpperCase();

    const res = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
    );

    const data = res.data;

    if (!data.c || data.c === 0) {
      return interaction.reply({
        content: `❌ ${symbol} is not a valid stock.`,
        ephemeral: true
      });
    }

    await interaction.reply(
      `📈 **${symbol}** price: **$${data.c}**`
    );
  }
};
