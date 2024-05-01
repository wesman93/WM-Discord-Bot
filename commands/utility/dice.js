const {SlashCommandBuilder} = require('discord.js');

let swapCount = 0;
let mergeCount = 0;

// enum is TS only, this is the JS way
const SORT_METHOD = Object.freeze({
    QUICK: 0,
    MERGE: 1,
});

const quickSort = (rolls, left, right) => {
    const index = partition(rolls, left, right);

    if (left < index - 1) { // Sort left
        quickSort(rolls, left, index - 1);
    }
    if (index < right) { // Sort right
        quickSort(rolls, index, right);
    }
}

const partition = (arr, left, right) => {
    const pivot = arr[Math.floor(left + (right - left) / 2)];
    console.log(`Partition: [${arr}], ${left}, ${right}, ${pivot}`);

    while (left <= right) {
        while (arr[left] < pivot) left++;
        while (arr[right] > pivot) right--;

        if (left <= right) {
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

    arr[left] = tempR;
    arr[right] = tempL;
}

const mergeSort = (rolls) => {
    mergeCount = 0;
    const helper = [].fill(undefined, 0, rolls.length - 1);
    mergeSortRec(rolls, helper, 0, rolls.length - 1);
}

const mergeSortRec = (rolls, helper, low, high) => {
    if (low < high) {
        const middle = Math.floor(low + (high - low) / 2);
        mergeSortRec(rolls, helper, low, middle); // Merge left recursively
        mergeSortRec(rolls, helper, middle + 1, high); // Merge right recursively
        merge(rolls, helper, low, middle, high); // After both halves are merge sorted, merge them
    }
}

const merge = (rolls, helper, low, middle, high) => {
    for (let i = low; i <= high; i++) { // Copy both halves
        helper[i] = rolls[i]
    }
    console.log(`MERGING: [${rolls}], [${helper}], \nlow:\t${low}, \tmiddle:\t${middle}, \thigh:\t${high}\n`);

    let helperLeft = low;
    let helperRight = middle + 1;
    let current = low;

    while (helperLeft <= middle && helperRight <= high) {
        if (helper[helperLeft] <= helper[helperRight]) {
            rolls[current] = helper[helperLeft];
            mergeCount++;
            helperLeft++;
        } else {
            rolls[current] = helper[helperRight];
            mergeCount++;
            helperRight++;
        }
        current++;
    }

    const remaining = middle - helperLeft;
    for (let i = 0; i <= remaining; i++) {
        rolls[current + i] = helper[helperLeft + i];
        mergeCount++;
    }
    console.log(`MERGED: [${rolls}], [${helper}], \nlow:\t${low}, \tmiddle:\t${middle}, \thigh:\t${high}\n`);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll dice using #d# format separated by commas. Accepts d4/d6/d8/d12/d20.')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('Comma separated values of dice rolls in #d# format. Accepts d4/d6/d8/d12/d20.')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('sort')
                .setDescription('Sorting algorithm to apply to results.')
                .setRequired(false)
                .addChoices({name: 'quick', value: SORT_METHOD.QUICK}, {name: 'merge', value: SORT_METHOD.MERGE})
        ),
    async execute(interaction) {
        const regex = /\d+d(4|6|8|12|20)/;
        const input = interaction.options.getString('input');
        const sortMethod = interaction.options.getInteger('sort') ?? SORT_METHOD.QUICK;
        const dice = input.split(',');
        const rolls = new Map();
        let total = 0;
        let subtotal = 0;
        let output = `${interaction.user.username} rolled:\t${input}\n`

        for (const d of dice) {
            swapCount = 0;
            subtotal = 0;

            if (!regex.test(d)) {
                output = 'ERROR: Input not #d# format separated by commas OR not d4/d6/d8/d12/d20.';
                await interaction.reply(output)
                console.log(`${input}: ${output}`);
                return;
            }
            if (!rolls.has(d)) {
                rolls.set(d, []);
            }

            const nums = d.split('d');
            const count = nums[0];
            const values = nums[1];

            for (let i = 0; i < count; i++) {
                const roll = Math.floor(Math.random() * values) + 1;
                rolls.set(d, [...rolls.get(d), roll]);
                subtotal += roll
            }

            total += subtotal;
            sortMethod === SORT_METHOD.MERGE ? mergeSort(rolls.get(d)) : quickSort(rolls.get(d), 0, rolls.get(d).length - 1);
            output += `\n${d}:\t\t[${rolls.get(d)}]\n${sortMethod === SORT_METHOD.MERGE ? 'Merge' : 'Swap'} Count\t${sortMethod === 1 ? mergeCount : swapCount}\nSubtotal:\t${subtotal}\n`;
        }

        output += `\nTotal Value:\t${total}\nSort Method:\t${sortMethod === SORT_METHOD.MERGE ? 'Merge' : 'Quick'}`;
        await interaction.reply(output);
        console.log(output);
    },
};
