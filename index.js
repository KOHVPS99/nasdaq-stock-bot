require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const { processAlerts } = require("./utils/tracker");

const token = process.env.DISCORD_TOKEN;
const checkIntervalMs = Number(process.env.CHECK_INTERVAL_MS || 5000);

if (!token) {
  throw new Error("Missing DISCORD_TOKEN in environment variables.");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARNING] The command at ${filePath} is missing "data" or "execute".`);
  }
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);

  setInterval(async () => {
    await processAlerts(client);
  }, checkIntervalMs);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply("❌ There was an error while executing this command.");
    } else {
      await interaction.reply({
        content: "❌ There was an error while executing this command.",
        ephemeral: true
      });
    }
  }
});

client.login(token);
