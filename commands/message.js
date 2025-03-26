const { SlashCommandBuilder } = require('@discordjs/builders');
const { InteractionContextType, MessageFlags } = require('discord.js');
const cron = require('cron');

const { getRandomMessage, buildInfoMessage } = require('../src/randomMessage');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('message')
        .setContexts([InteractionContextType.Guild])
        .setDescription('Configuration des messages automatiques sur le serveur')
        .addSubcommand(s =>
            s.setName("add").setDescription('Met en place un message random automatique, envoyé tous les jours à la même heure. Max 10').addChannelOption(o => o.setName('channel').setDescription('Le channel où le message random doit être envoyé').setRequired(true))
                .addNumberOption(o => o.setName('hour').setDescription('Heure à laquelle le message s\'envoie').setMinValue(0).setMaxValue(23).setRequired(true))
                .addNumberOption(o => o.setName('minute').setDescription('Minute à laquelle le message s\'envoie').setMinValue(0).setMaxValue(59).setRequired(true))
        )
        .addSubcommand(s => s.setName('info').setDescription('Donne des infos sur le setup actuel du message'))
    ,
    /**
     * 
     * @param {import('discord.js').Interaction} interaction 
     * @param {*} client 
     * @returns 
     */
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        let subcommand = interaction.options.getSubcommand();

        let allData = client.times.get(interaction.guildId) ?? [];

        if (subcommand == "info") {
            return interaction.editReply(buildInfoMessage(allData));
        }

        if(allData.length >= 10) return interaction.editReply({ flags: MessageFlags.Ephemeral, content: 'Le nombre maximum de messages (10) a été atteint !'});

        const channel = interaction.options.getChannel("channel"),
            hour = interaction.options.getNumber("hour"),
            minute = interaction.options.getNumber("minute");

        const newData = {
            guildId: interaction.guildId,
            channelId: channel.id,
            hour,
            minute,
            job: null
        };
        newData.job = new cron.CronJob(`${minute} ${hour} * * *`, getRandomMessage.bind(newData, client))
        newData.job.start();
        allData.push(newData);

        client.times.set(interaction.guildId, allData);

        interaction.editReply({ content: `Le message random sera envoyé dans <#${channel.id}> tous les jours à \`${hour}:${minute}\`` });
    }
}