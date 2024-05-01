const { SlashCommandBuilder } = require('discord.js');

let swapCount = 0;
const quickSort = (rolls, left, right) => {
    const index = partition (rolls, left, right);

    console.log(`${left} < ${index-1}`);
    console.log(`${index} > ${right}`);
    if (left < index - 1){ // Sort left
        quickSort(rolls, left, index-1);
    }
    if (index < right){ // Sort right
        quickSort(rolls, index, right);
    }
}

const partition = (arr, left, right) => {
    const pivot = arr[Math.floor(left+(right-left)/2)];
    console.log(`Partition: [${arr}], ${left}, ${right}, ${pivot}`);

    while(left <= right){
        while(arr[left] < pivot) left++;
        while(arr[right] > pivot) right--;

        if(left <= right){
            swap(arr, left, right);
            left++;
            right--;
        }
    }

    return left;
}

const swap = (arr, left, right) => {
    const tempL = arr[left];
    const tempR = arr[right];
    swapCount++;

    console.log(`Swap: [${arr}], ${tempL}, ${tempR}`);
    console.log(`Swap Count: ${swapCount}`);

    arr[left] = tempR;
    arr[right] = tempL;
}

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
        let subtotal = 0;
        let output = `${interaction.user.username} rolled:\t${input}\n`

        for (const d of dice) {
            swapCount = 0;
            subtotal = 0;

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
                subtotal += roll
            }

            total += subtotal;
            quickSort(rolls.get(d), 0, rolls.get(d).length-1);
            output += `\n${d}:\t\t[${rolls.get(d)}]\nSwap Count\t${swapCount}\nSubtotal:\t${subtotal}\n`;
        }

        output += `\nTotal Value:\t${total}`;
        await interaction.reply(output);
        console.log(output);
    },
};
