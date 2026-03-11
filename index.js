require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

const commands = [];

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {

  const command = require(`./commands/${file}`);

  client.commands.set(command.data.name, command);

  commands.push(command.data.toJSON());
}

async function deployCommands() {

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.DISCORD_CLIENT_ID,
      process.env.DISCORD_GUILD_ID
    ),
    { body: commands }
  );

  console.log("Commands deployed");
}

client.once("ready", async () => {

  console.log(`Logged in as ${client.user.tag}`);

  await deployCommands();

});

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  await command.execute(interaction);

});

client.login(process.env.DISCORD_TOKEN);
