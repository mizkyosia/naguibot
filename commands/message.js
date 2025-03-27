const { SlashCommandBuilder } = require('@discordjs/builders');
const { InteractionContextType, MessageFlags } = require('discord.js');
const cron = require('cron');

const { getRandomMessage, buildInfoMessage, buildRandomMessage } = require('../src/randomMessage');


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
        .addSubcommand(s => s.setName('fetch').setDescription('Renvoie un message aléatoire').addBooleanOption(o => o.setName('hide').setDescription('Rend le message visible uniquement par l\'auteur de la commande')))
    ,
    /**
     * 
     * @param {import('discord.js').Interaction} interaction 
     * @param {*} client 
     * @returns 
     */
    async execute(interaction, client) {
        let subcommand = interaction.options.getSubcommand();

        if (subcommand == "fetch") {
            return interaction.reply({ flags: (interaction.options.getBoolean('hide') ? MessageFlags.Ephemeral : 0), ...await buildRandomMessage(interaction.guild, 'Message random') });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        let allData = client.times.get(interaction.guildId) ?? [];

        if (subcommand == "info") {
            return interaction.editReply(buildInfoMessage(allData));
        }

        if (allData.length >= 10) return interaction.editReply({ flags: MessageFlags.Ephemeral, content: 'Le nombre maximum de messages (10) a été atteint !' });

        const channel = interaction.options.getChannel("channel"),
            hour = interaction.options.getNumber("hour"),
            minute = interaction.options.getNumber("minute");

        const newData = {
            channelId: channel.id,
            hour,
            minute,
            job: new cron.CronJob(`${minute} ${hour} * * *`, getRandomMessage.bind(null, interaction.guildId, channel.id, client))
        };
        newData.job.start();
        allData.push(newData);

        client.times.set(interaction.guildId, allData);

        interaction.editReply({ content: `Le message random sera envoyé dans <#${channel.id}> tous les jours à \`${hour}:${minute}\`` });
    }
}