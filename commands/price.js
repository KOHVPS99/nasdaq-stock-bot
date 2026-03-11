const { SlashCommandBuilder } = require("discord.js");
const { getPrice } = require("../services/finnhub");

module.exports = {

data: new SlashCommandBuilder()
.setName("price")
.setDescription("Get stock price in USD")
.addStringOption(option =>
option.setName("symbol")
.setDescription("Stock ticker")
.setRequired(true)),

async execute(interaction){

const symbol = interaction.options.getString("symbol").toUpperCase();

const price = await getPrice(symbol);

if(!price){
return interaction.reply({
content:`❌ Stock not found.`,
ephemeral:true
});
}

interaction.reply(`📈 **${symbol}** price: **$${price} USD**`);

}
};
