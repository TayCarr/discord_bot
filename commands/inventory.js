//view your inventory 
//TODO nicer format

module.exports = {
    name: "inventory",
    execute(message, args, data){
        const id = message.author.id;

        if(!data[id]){
            return message.reply("You have no data yet!"); //TODO dif message?
        }

        const user = data[id];

        message.reply( //TODO customize
            `**Your Inventory**\n` +
            `**${user.inventory}**` 
        );
    }
};