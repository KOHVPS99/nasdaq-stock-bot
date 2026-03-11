const { SlashCommandBuilder } = require("discord.js");
const { getPrice } = require("../services/finnhub");

const tickers = [
"AAPL","TSLA","NVDA","AMD","MSFT","META","BBAI","SOFI",
"PLTR","NVTS","SERV","INTC","MU","COIN","ROKU","RIVN",
"LCID","HOOD","AFRM","UPST"
];

module.exports = {

data: new SlashCommandBuilder()
.setName("find")
.setDescription("Find stocks above or below a USD price")
.addNumberOption(option =>
option.setName("price")
.setDescription("Price in USD")
.setRequired(true))
.addStringOption(option =>
option.setName("type")
.setDescription("Search type")
.setRequired(true)
.addChoices(
{ name: "higher", value: "higher" },
{ name: "lower", value: "lower" }
)
),

async execute(interaction){

const price = interaction.options.getNumber("price");
const type = interaction.options.getString("type");

await interaction.reply("🔎 Scanning stocks...");

let results = [];

for(const ticker of tickers){

try{

const stockPrice = await getPrice(ticker);

if(!stockPrice) continue;

if(type === "higher" && stockPrice > price){
results.push(`${ticker} — $${stockPrice} USD`);
}

if(type === "lower" && stockPrice < price){
results.push(`${ticker} — $${stockPrice} USD`);
}

}catch(err){}

}

if(results.length === 0){

return interaction.editReply(
`No stocks found ${type} than $${price} USD`
);

}

interaction.editReply(

`📊 Stocks ${type} than $${price} USD\n\n` +
results.join("\n")

);

}

};
