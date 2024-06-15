const { ApplicationCommandOptionType } = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: "n",
  description: "Make the bot say Bunny Bunny!",
  permissions: "0x0000000000000800",
  options: [],

  run: async (client, interaction) => {
    try {
      const user = interaction.user;
      const messageEmbed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setTitle('🐰 **Bunny Bunny!**')
        .setDescription('Bun**ny Bu**nny!\n\n(Inspired by Kelvin Zhang aka Twilight)')
        .setImage(`https://cdn.discordapp.com/attachments/1004341381784944703/1165201249331855380/RainbowLine.gif?ex=654f37ba&is=653cc2ba&hm=648a2e070fab36155f4171962e9c3bcef94857aca3987a181634837231500177&`);

      interaction.reply({
        content: `${user}`,
        embeds: [messageEmbed]
      }).catch(e => {});
    } catch (e) {
      console.error(e);
    }
  },
};
