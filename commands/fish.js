//fishing command

module.exports = {
    name: "fish",
    execute(message, args, data, saveData){
        const id = message.author.id;

        if(!data[id]){
            data[id] = {xp: 0, level: 1, inventory: [], coins: 0 };
        }

        //weighted random drop table TODO!!
        const drops = [
            ["🐟 Common Fish", 70],
            ["🐠 Uncommon Fish", 20],
            ["🐡 Rare Fish", 8],
            ["🐉 Legendary Sea Dragon", 2],
        ];

        let roll = Math.random() * 100; //TODO is this true random??
        let caught;

        for(const [item, chance] of drops){
            if( roll < chance){
                caught = item;
                break;
            }
            roll -= chance;
        }

        data[id].inventory.push(caught);
        data[id].xp += 1; //TODO give them xp for fishing
        saveData();

        message.reply(`🎣 You caught **${caught}**!`);
    }
};