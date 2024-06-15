const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { DeezerPlugin } = require("@distube/deezer");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { printWatermark } = require('./util/pw');
const config = require("./config.js");
const fs = require("fs");
const path = require('path');

const client = new Client({
  intents: Object.keys(GatewayIntentBits).map((a) => {
    return GatewayIntentBits[a];
  }),
});

client.config = config;
client.commands = new Collection();

client.player = new DisTube(client, {
  leaveOnStop: config.opt.voiceConfig.leaveOnStop,
  leaveOnFinish: config.opt.voiceConfig.leaveOnFinish,
  leaveOnEmpty: config.opt.voiceConfig.leaveOnEmpty.status,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  plugins: [
    new SpotifyPlugin(),
    new SoundCloudPlugin(),
    new YtDlpPlugin(),
    new DeezerPlugin(),
  ],
});
process.env.YTDL_NO_UPDATE = true;
const player = client.player;

fs.readdir("./events", (_err, files) => {
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0]; 
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
});
fs.readdir("./events/player", (_err, files) => {
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    const player_events = require(`./events/player/${file}`);
    let playerName = file.split(".")[0];
    player.on(playerName, player_events.bind(null, client));
    delete require.cache[require.resolve(`./events/player/${file}`)];
  });
});

fs.readdir(config.commandsDir, (err, files) => {
  if (err) throw err;
  files.forEach((f) => {
    if (f.endsWith(".js")) {
      let props = require(`${config.commandsDir}/${f}`);
      client.commands.set(props.name, props);
    }
  });
});

if (config.TOKEN || process.env.TOKEN) {
  client.login(config.TOKEN || process.env.TOKEN).catch((e) => {
    console.log('TOKEN ERROR❌❌');
  });
} else {
  setTimeout(() => {
    console.log('TOKEN ERROR❌❌');
  }, 2000);
}

if(config.mongodbURL || process.env.MONGO){
  const mongoose = require("mongoose")
  mongoose.connect(config.mongodbURL || process.env.MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  }).then(async () => {
    console.log('\x1b[32m%s\x1b[0m', `|    🍔 Connected MongoDB!`)
  }).catch((err) => {
    console.log('\x1b[32m%s\x1b[0m', `|    🍔 Failed to connect MongoDB!`)})
} else {
  console.log('\x1b[32m%s\x1b[0m', `|    🍔 Error MongoDB!`)
}

const express = require("express");
const app = express();
const port = 3000;
app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});
app.listen(port, () => {
  console.log(`🔗 Listening to GlaceYT: http://localhost:${port}`);
});

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

client.on('ready', async () => {
  const rest = new REST({ version: '9' }).setToken(config.TOKEN || process.env.TOKEN);

  (async () => {
    try {
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: client.commands.map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options })) },
      );

      console.log('Successfully registered application commands.');
    } catch (error) {
      console.error(error);
    }
  })();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.run(client, interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
  }
});
