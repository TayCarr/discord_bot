// /commands/deadlock/dlitem.js

//i think for this command i want to pull up item stats, the user will give the name (in game name) and then i will check items.json for the id number to search for the info


const { request } = require('undici');
const items = require('../../data/items.json');

function cleanDescription(itemInfo) {
    //TODO 4075861416 (spirit rend) 2 passives it uses locstring 710436191 (capacitor) has passive as locstring but the active is in desc (but also in loc str)
    //800008313 (crushing fists) same thing as capacitor, 3585132399 (fortitude) 2 passives both in loc 2947183272 (radiant regeneration)
    //3361811174 (cheat death) only one loc string idk why none in desc same with 1250307611 (juggernaut) 3577481646 (mystic reverb)
    //493591231 (lightning scroll) has like a little disclaimer only in loc section 
    if (!itemInfo.desc){
        if (!itemInfo.passive && !itemInfo.active){
            return "Item name is self explanatory (maybe).";
        } 
        else{
            text = itemInfo.passive;
        }

    }
    else{
        text = itemInfo.desc;
    }

    if(itemInfo.active){
        if(!text){
            text = itemInfo.active;
        }
        else{
            text = text + '** Active: **' + itemInfo.active;
        }
        
    }
  
     
    return text
      .replace(/<[^>]*>/g, " ") // remove HTML tags
      .replace(/\n/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/{g:citadel_binding:'Reload'}/g, " reload ")
      .trim();
  }

module.exports = {
    name: "dlitem",
    description: "Fetch item info and stats", //TODO maybe change
    async execute(message, args){
        if (!args[0]){
            return message.reply("You must provide an item name (or if known ID number). Example `!dlitem Mystical Piano`"); //i guess need to check multiple args?
        }

        const itemName = args.join(' ').toLowerCase();
        console.log(`looking for ${itemName}`);
        //hunter's aura and diviner's kevlar(needs ') and high-velocity rounds (needs -) kinda annoying maybe add without into data saved for both

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

            //TODO i want to have the stat adjustments displayed too !!!
            await message.reply({//for active item could instead assign string if false or true 
                embeds: [
                    {
                        title: `${itemData.name}`,
                        description: cleanDescription(itemData.description),
                        //description: cleanDescription(itemData.description?.desc), //siphon bullets (ex) is itemData.description.passive aaaaaaaa
                        //i thought maybe a other passive items also had .passive but NO siphon bullets ???? why????
                        //extended magazine just no description

                        //image: {url: itemData.shop_image}, //large artwork
                        thumbnail: { url: itemData.shop_image },//thumbnail
                        fields:[
                            //{name: "", value: `${itemData.shop_image}`, inline: false},
                            //{name: "", value: `${itemData.description.desc}`, inline: false}, //TODO the desc sometimes has like css styles or something ummmm sigh
                            //{name: "Is active item?", value: `${itemData.is_active_item}`, inline: false},
                            {
                                name: "Type",
                                value: itemData.item_slot_type || "N/A",
                                inline: true
                              },
                              {name: "Item Tier", value: `${itemData.item_tier}`, inline: true},
                            {name: "Cost", value: `${itemData.cost}`, inline: true},
                            //{name: "Type:", value: `${itemData.item_slot_type}`, inline: false},
                            
                              {
                                name: "Active Item",
                                value: itemData.is_active_item ? "Yes" : "No",
                                inline: true
                              },
                            //{name: "Item Cooldown:", value: `${itemData.properties.AbilityCooldown.value} seconds`, inline: false},
                            {
                                name: "Cooldown",
                                value: itemData.properties?.AbilityCooldown?.value
                                  ? `${itemData.properties.AbilityCooldown.value} sec`
                                  : "N/A",
                                inline: true
                              },
                            //{name: "Item Duration:", value: `${itemData.properties.AbilityDuration.value} seconds`, inline: false},
                            {
                                name: "Duration",
                                value: itemData.properties?.AbilityDuration?.value
                                  ? `${itemData.properties.AbilityDuration.value} sec`
                                  : "N/A",
                                inline: true
                              },
                              //TODO maybe could add upgrade if have any??
                            
                        ],
                        color: 0x00AE86 //TODO maybe change it based on what the item is like gun spirit vitality??
                    }
                ]
            });
        }catch (err){
            console.error(err);
            message.reply("There was an error fetching item stats :(");
        }

    }
};