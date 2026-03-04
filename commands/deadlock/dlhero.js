// /commands/deadlock/dlhero.js

//i think for this command it will pull up the hero and have a little profile on them 
//pull basic info initially and later I would like to maybe have winrate, pickrate etc


const { request } = require('undici');

function cleanDescription(text) {//TODO not sure if I need maybe there is html tags remove if not
    if (!text) return "No description available.";
  
    return text
      .replace(/<[^>]*>/g, "") // remove HTML tags
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .trim();
  }

module.exports = {
    name: "dlhero",
    description: "Fetch hero info and stats", //TODO maybe change
    async execute(message, args){
        if (!args[0]){
            return message.reply("You must provide a hero name. Example `!dlhero Rem`"); //i guess need to check multiple args?
        }

        const heroName = args.join(' ').toLowerCase();
        console.log(`looking for ${heroName}`);

        try{
            //call deadlock api item endpoint
            const response = await fetch(
                `https://assets.deadlock-api.com/v2/heroes/by-name/${heroName}`
            );
            const heroData = await response.json();
            let spiritReduc = 0;
            let weaponReduc = 0;

            if (heroData.starting_stats.tech_armor_damage_reduction){
                spiritReduc = heroData.starting_stats.tech_armor_damage_reduction.value;
            }
            if (heroData.starting_stats.bullet_armor_damage_reduction){
                weaponReduc = heroData.starting_stats.bullet_armor_damage_reduction.value;
            }
            
            await message.reply({
                embeds: [
                    {
                        title: `${heroData.name}`,
                        description: heroData.description.lore,//some of the descriptions are sooooo long so maybe i just do tags?
                        //.role and .playstyle but all the new heros are missing it?
                        description: heroData.tags.join(', '), //perhaps? returns a list?
                        //image: {url: itemData.shop_image}, //large artwork
                        thumbnail: { url: heroData.images.hero_card_gloat},//thumbnail
                        fields:[
                            //{name: "", value: `${itemData.shop_image}`, inline: false},
                            //{name: "", value: `${itemData.description.desc}`, inline: false}, //TODO the desc sometimes has like css styles or something ummmm sigh
                            //{name: "Is active item?", value: `${itemData.is_active_item}`, inline: false},
                            {
                                name: "",
                                value: heroData.hideout_rich_presence || "N/A",
                                inline: true
                              },
                              {name: "Hero Complexity", value: `${heroData.complexity}`, inline: true},
                            {name: "Starting Stats", value: `Max move speed: ${heroData.starting_stats.max_move_speed.value}\nSprint Speed: ${heroData.starting_stats.sprint_speed.value}\nLight melee damage: ${heroData.starting_stats.light_melee_damage.value}\nHeavy melee damage: ${heroData.starting_stats.heavy_melee_damage.value}\nMax health: ${heroData.starting_stats.max_health.value}\nBase health regen: ${heroData.starting_stats.base_health_regen.value}\nReload speed: ${heroData.starting_stats.reload_speed.value}\nStamina: ${heroData.starting_stats.stamina.value}\nStamina regen /s: ${heroData.starting_stats.stamina_regen_per_second.value}\n`, inline: true},
                            //{name: "Type:", value: `${itemData.item_slot_type}`, inline: false},
                            
                              {
                                name: "Reductions",
                                value: `Spirit: ${spiritReduc}%`,
                                inline: true
                              },
                              {
                                name: "",
                                value: `Bullet: ${weaponReduc}%` ,
                                inline: true
                              },
                              
                            //{name: "Item Cooldown:", value: `${itemData.properties.AbilityCooldown.value} seconds`, inline: false},
                            {
                                name: "Gun",
                                value: heroData.gun_tag || "N/A",
                                inline: true
                              },
                            //{name: "Item Duration:", value: `${itemData.properties.AbilityDuration.value} seconds`, inline: false},
                            {
                                name: "Hero Type",
                                value: heroData.hero_type || "N/A",
                                inline: true
                              },
                            
                        ],
                        color: 0x00AE86 //TODO the hero specific colour
                    }
                ]
            });
        }catch (err){
            console.error(err);
            message.reply("There was an error fetching item stats :(");
        }

    }
};