const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll dice using #d# format separated by commas. Accepts d4/d6/d8/d12/d20.')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('Comma separated values of dice rolls in #d# format. Accepts d4/d6/d8/d12/d20.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const regex = /\d+d(4|6|8|12|20)/;
        const input = interaction.options.getString('input');
        const dice = input.split(',');
        const rolls = new Map();
        let total = 0;
        let output = `${interaction.user.username} rolled:\n`

        for (const d of dice) {
           if(!regex.test(d)){
               output = 'ERROR: Input not #d# format separated by commas OR not d4/d6/d8/d12/d20.';
               await interaction.reply(output)
               console.log(`${input}: ${output}`);
               return;
           }
           if(!rolls.has(d)){
               rolls.set(d, []);
           }

           const nums = d.split('d');
           const count = nums[0];
           const values = nums[1];

            for (let i = 0; i < count; i++) {
                const roll = Math.floor(Math.random()*values) + 1;
                rolls.set(d, [...rolls.get(d), roll]);
                total += roll;
            }

            output += `${d}:\t\t[${rolls.get(d)}]\n`;
        }

        output += `Total Value:\t${total}`;
        await interaction.reply(output);
        console.log(output);
    },
};
