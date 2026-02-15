const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const { spawn } = require('child_process');

const STREAM_URL = process.env.STREAM_URL;
const GUILD_ID = process.env.GUILD_ID;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;
const TOKEN = process.env.TOKEN;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

client.on('error', console.error);
process.on('unhandledRejection', console.error);

client.once('ready', async () => {
  try {
    console.log(`Logged in as ${client.user.tag}`);

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) throw new Error("Guild not found");

    const channel = guild.channels.cache.get(VOICE_CHANNEL_ID);
    if (!channel) throw new Error("Voice channel not found");

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });

    const ffmpeg = spawn('ffmpeg', [
      '-re',
      '-i', STREAM_URL,
      '-f', 's16le',
      '-ar', '48000',
      '-ac', '2',
      'pipe:1'
    ]);

    const resource = createAudioResource(ffmpeg.stdout, {
      inputType: StreamType.Raw
    });

    const player = createAudioPlayer();
    player.play(resource);
    connection.subscribe(player);

  } catch (err) {
    console.error("ERROR:", err);
  }
});

client.login(TOKEN);
