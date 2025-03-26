const { MessageFlags } = require("discord.js");
const { buildInfoMessage } = require('../src/randomMessage');

module.exports = {
    async execute(interaction, args, client) {
        let subcommand = args.shift();

        if (subcommand == 'remove') {
            let allData = client.times.get(interaction.guildId) ?? [];
            let indices = args.map(i => parseInt(i));
            indices.sort((a, b) => a - b);

            for (let i = allData.length - 1; i >= 0 && indices.length > 0; i--) {
                if (i == indices[indices.length - 1]) {
                    allData[i].job.stop();
                    allData.splice(i, 1)
                    indices.pop()
                }
            }
            interaction.update(buildInfoMessage(allData));

            client.times.set(interaction.guildId, allData);

            return;
        }

        interaction.reply({ content: "Une erreur s'est produite, veuillez réessayer plus tard", flags: MessageFlags.Ephemeral})
    }
}