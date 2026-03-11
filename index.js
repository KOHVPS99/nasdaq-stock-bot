require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Events, REST, Routes } = require("discord.js");
const { processAlerts } = require("./utils/tracker");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token) {
  throw new Error("Missing DISCORD_TOKEN");
}

if (!clientId) {
  throw new Error("Missing DISCORD_CLIENT_ID");
}

if (!guildId) {
  throw new Error("Missing DISCORD_GUILD_ID");
}

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else {
    console.log(`Command ${file} missing data or execute`);
  }
}

async function deployCommands() {
  const rest = new REST({ version: "10" }).setToken(token);

  try {
    console.log("Deploying slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log("Slash commands deployed successfully.");
  } catch (error) {
    console.error("Command deploy failed:", error);
  }
}

client.once(Events.ClientReady, async () => {
  console.log(`Bot online as ${client.user.tag}`);

  await deployCommands();

  const interval = Number(process.env.CHECK_INTERVAL_MS || 5000);

  setInterval(async () => {
    await processAlerts(client);
  }, interval);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    if (interaction.replied || interaction.deferred) {
      await interaction.editReply("There was an error executing this command.");
    } else {
      await interaction.reply({
        content: "There was an error executing this command.",
        ephemeral: true
      });
    }
  }
});

client.login(token);
