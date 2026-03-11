const { SlashCommandBuilder } = require("discord.js");
const { getUserAlerts } = require("../utils/storage");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tracked")
    .setDescription("Show your active stock alerts"),

  async execute(interaction) {
    const alerts = getUserAlerts(interaction.user.id);

    if (!alerts.length) {
      return await interaction.reply({
        content: "📭 You have no active alerts.",
        ephemeral: true
      });
    }

    const lines = alerts.map((a, index) => {
      return `${index + 1}. **${a.symbol}** | ${a.targetType.toUpperCase()} | **$${a.targetPrice.toFixed(2)}**`;
    });

    return await interaction.reply({
      content: `📌 **Your active alerts**\n\n${lines.join("\n")}`,
      ephemeral: true
    });
  }
};
