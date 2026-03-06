// /commands/deadlock/dlitem.js

//i think for this command i want to pull up item stats, the user will give the name (in game name) and then i will check items.json for the id number to search for the info


const { request } = require('undici');
const items = require('../../data/items.json');

function cleanDescription(itemInfo) {
    //TODO i think 3591231 lightning scroll has a section_attributes[1] aaaaaa the disclaimer that it only happens once per ult
    let descString = ''; //if nothing in this then can return as item does not have a description else build the string from each index

    for (let i = 0; i < itemInfo.length; i++) {
        if(itemInfo[i].section_attributes[0].loc_string){ //.section_attributes is an array but it seems like .loc_string is always in [0].loc_string
            //TODO check if it is passive or active and highlight that
            descString += ` ${itemInfo[i].section_attributes[0].loc_string}`;
        } 
      }

    if (descString === ''){
        return "Item name is self explanatory (maybe)."; //for those items that do not have desc just stats
    }
     
    return descString
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
        //TODO hunter's aura and diviner's kevlar(needs ') and high-velocity rounds (needs -) kinda annoying maybe add without into data saved for both
        const found = items.find(item =>
            item.name.toLowerCase().includes(itemName)  || //passes
            item.class_name.toLowerCase().includes(itemName)  || //passes
            item.id == itemName || //cant do strict or it wont pass as int == str 
            item.simple_name?.toLowerCase().includes(itemName)   //if simple_name exists run.toLowerCase else return undef        
            );

        /***************************
        const found = items.find(item =>
            item.name.toLowerCase() === itemName || //passes
            item.class_name.toLowerCase() === itemName || //passes
            item.id == itemName || //cant do strict or it wont pass as int == str 
            item.simple_name?.toLowerCase() === itemName  //if simple_name exists run.toLowerCase else return undef        
            );
        **************************/
            

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
                        description: cleanDescription(itemData.tooltip_sections),
                        //description: cleanDescription(itemData.description), //not all items have a desc in description (or passive or active) but i think all have loc_string in tooltip?

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