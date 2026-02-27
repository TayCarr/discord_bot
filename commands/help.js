//view bot commands
//TODO nicer format
//hopefully remember to update as i go...

module.exports = {
    name: "help",
    execute(message, args, data){

        message.reply({ //TODO customize
            embeds: [
                {
                    title: `**Commands!**`,
                    fields:[
                        {name: "**!profile**", value: `\t-> view your profile card`, inline: false},
                        {name: "**!inventory**", value: `\t-> view what is in your inventory`, inline: false},
                        {name: "**!fish**", value: `\t-> fish for fish`, inline: false},
                        {name: "**!dlstats <SteamID>**", value: `\t-> view players Deadlock stats`, inline: false},
                    ],
                    color: 0x00AE86 //TODO
                }
            ]
             
    });
    }
};