const { load, save } = require("./storage");
const { getPrice } = require("../services/finnhub");

async function processAlerts(client){

const alerts = load();

for(const alert of alerts){

const price = await getPrice(alert.symbol);

if(!price) continue;

if(alert.targetType === "sell" && price >= alert.targetPrice){

const channel = await client.channels.fetch(alert.channelId);

channel.send(
`🚨 <@${alert.userId}> ${alert.symbol} hit **$${price} USD**`
);

}

}

}

module.exports = { processAlerts };
