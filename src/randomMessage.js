const Discord = require('discord.js');
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('@discordjs/builders')

module.exports = {
    buildInfoMessage: function (allData) {
        const message = {
            flags: Discord.MessageFlags.Ephemeral,
            embeds: [{
                author: {
                    name: `${allData.length} messages - 10 max`
                },
                title: "Messages randoms",
                description: allData.length == 0 ? "_Aucun messsage mis en place !_" :
                    allData.reduce((a, c, i) => a + `**${i+1} :** \`${c.hour}:${c.minute}\` <#${c.channelId}>\n`, '')
            }],
        }

        if (allData.length > 0) {
            message.components = [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("message remove")
                        .setMaxValues(allData.length)
                        .setMinValues(0)
                        .setPlaceholder("Messages automatiques à supprimer")
                        .setDisabled(allData.length == 0)
                        .addOptions(...allData.map((_, i) => new StringSelectMenuOptionBuilder().setLabel(i.toString()).setValue(i.toString())))
                )
            ]
        }

        return message;
    },
    getRandomMessage: async function (client) {
        const guild = client.guilds.cache.get(this.guildId);
        const channel = guild.channels.cache.get(this.channelId);

        let textChannels = guild.channels.cache.filter((c) => c.type === Discord.ChannelType.GuildText && c.viewable);
        const randomChannel = textChannels.random()

        if (!randomChannel) return channel.send('Aucun salon n\'est visible pour le bot !');

        const minDate = guild.createdTimestamp;
        const maxDate = Date.now();

        let messages = (await randomChannel.messages.fetch({
            around: Discord.SnowflakeUtil.generate({
                timestamp: Math.floor(Math.random() * (maxDate - minDate) + minDate)
            })
        })).filter(m => !m.author.bot);

        const msg = messages.random();

        return await channel.send({
            embeds: [{
                title: `Message du jour`,
                url: msg.url,
                description: msg.content,
                author: {
                    name: msg.member?.nickname ?? msg.author.displayName,
                    icon_url: msg.member?.avatarURL() ?? msg.author.avatarURL(),
                },
                timestamp: new Date(msg.createdTimestamp).toISOString(),
                footer: {
                    text: `#${randomChannel.name}`
                }
            }]
        });
    }
}