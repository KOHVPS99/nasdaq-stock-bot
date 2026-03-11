const { SlashCommandBuilder } = require("discord.js");
const { removeUserAlert } = require("../utils/storage");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("untrack")
    .setDescription("Remove one or more alerts for a NASDAQ stock")
    .addStringOption((option) =>
      option
        .setName("symbol")
        .setDescription("Ticker symbol, for example AAPL")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Optional: remove only buy or sell alerts")
        .setRequired(false)
        .addChoices(
          { name: "buy", value: "buy" },
          { name: "sell", value: "sell" }
        )
    ),

  async execute(interaction) {
    const symbol = interaction.options.getString("symbol", true).toUpperCase();
    const type = interaction.options.getString("type");

    const removed = removeUserAlert(interaction.user.id, symbol, type);

    if (!removed) {
      return await interaction.reply({
        content: `⚠️ No matching alerts found for **${symbol}**.`,
        ephemeral: true
      });
    }

    return await interaction.reply({
      content: `✅ Removed **${removed}** alert(s) for **${symbol}**${type ? ` (${type})` : ""}.`,
      ephemeral: true
    });
  }
};
