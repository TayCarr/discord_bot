// /commands/deadlock/dlitem.js

//i think for this command i want to pull up item stats, the user will give the name (in game name) and then i will check items.json for the id number to search for the info


const { request } = require('undici');
const items = require('../../data/items.json');

module.exports = {
    name: "dlitem",
    description: "Fetch item info and stats", //TODO maybe change
    async execute(message, args){
        if (!args[0]){
            return message.reply("You must provide an item name (or if known ID number). Example `!dlitem Mystical Piano`"); //i guess need to check multiple args?
        }

        const itemName = args.join(' ').toLowerCase();
        console.log(`looking for ${itemName}`);

        const found = items.find(item =>
            item.name.toLowerCase() === itemName || //passes
            item.class_name.toLowerCase() === itemName || //passes
            item.id == itemName //cant do strict or it wont pass as int == str          
            );
            

        if(!found){
            return message.reply("Item not found."); //TODO should i do the embed format?

        }
        console.log(`id is ${found.id}: ${found.class_name}`);

        try{
            //call deadlock api item endpoint
            const response = await fetch(
                `https://assets.deadlock-api.com/v2/items/${found.id}`
            );
            const itemData = await response.json();
            
            await message.reply({//for active item could instead assign string if false or true 
                embeds: [
                    {
                        title: `${itemData.name}`,
                        fields:[
                            {name: "", value: `${itemData.shop_image}`, inline: false},
                            {name: "", value: `${itemData.description.desc}`, inline: false}, //TODO the desc sometimes has like css styles or something ummmm sigh
                            {name: "Is active item?", value: `${itemData.is_active_item}`, inline: false},
                            {name: "Cost:", value: `${itemData.cost}`, inline: false},
                            {name: "Type:", value: `${itemData.item_slot_type}`, inline: false},
                            {name: "Item Cooldown:", value: `${itemData.properties.AbilityCooldown.value} seconds`, inline: false},
                            {name: "Item Duration:", value: `${itemData.properties.AbilityDuration.value} seconds`, inline: false},
                            {name: "Item Tier:", value: `${itemData.item_tier}`, inline: false},
                        ],
                        color: 0x00AE86 //TODO
                    }
                ]
            });
        }catch (err){
            console.error(err);
            message.reply("There was an error fetching item stats :(");
        }

    }
};