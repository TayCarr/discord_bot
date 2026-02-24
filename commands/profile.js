//display user profile command

module.exports = {
    name: "profile",
    execute(message, args, data){
        const id = message.author.id;

        if(!data[id]){
            return message.reply("You have no data yet!"); //TODO dif message?
        }

        const user = data[id];

        message.reply( //TODO customize
            `📜 **Your Profile**\n` +
            `Level: **${user.level}**\n` +
            `XP: **${user.xp}**\n` +
            `Coins: **${user.coins}**\n` +
            `Inventory Items: **${user.inventory.length}**` 
        );
    }
};