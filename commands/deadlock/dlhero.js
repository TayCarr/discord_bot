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

            const response2 = await fetch(
                `https://assets.deadlock-api.com/v2/items/by-hero-id/${heroData.id}`
            );
            const heroAbilities = await response2.json();
            
            await message.reply({
                embeds: [
                    {
                        title: `${heroData.name}`,
                        //TODO hero abilities !!!
                        //description: heroData.description.lore,//some of the descriptions are sooooo long so maybe i just do tags?//i think i do a sep lore command!!
                        //.role and .playstyle but all the new heros are missing it?
                        description: `*${heroData.tags.join(', ')}*`, 
                        thumbnail: { url: heroData.images.hero_card_gloat},//thumbnail
                        fields:[
                            //{name: "", value: heroData.hideout_rich_presence || "N/A", inline: true},//i do like this but idk where to put... TODO
                            {name: "Difficulty", value: `${heroData.complexity}`, inline: true},
                            //{name: "Type:", value: `${itemData.item_slot_type}`, inline: false},
                            {
                                name: "Gun",
                                thumbnail: heroData.shop_stat_display.weapon_image,
                                value: heroData.gun_tag || "idk its a candle",
                                inline: false
                              },
                            //{name: "Item Duration:", value: `${itemData.properties.AbilityDuration.value} seconds`, inline: false},
                            {
                                name: "Hero Type",
                                value: heroData.hero_type || "*little guy*",
                                inline: false
                              },
                              {
                                name: "Reductions",
                                value: `Spirit: ${spiritReduc}%\nBullet: ${weaponReduc}%`,
                                inline: false
                              },
                            {name: "Starting Stats", 
                            value: `Max move speed: ${heroData.starting_stats.max_move_speed.value}\nSprint Speed: ${heroData.starting_stats.sprint_speed.value}\nLight melee damage: ${heroData.starting_stats.light_melee_damage.value}\nHeavy melee damage: ${heroData.starting_stats.heavy_melee_damage.value}\nMax health: ${heroData.starting_stats.max_health.value}\nBase health regen: ${heroData.starting_stats.base_health_regen.value}\nStamina: ${heroData.starting_stats.stamina.value}`, 
                            inline: false},
                            {
                                name: "**Abilities:**",
                                value: `${heroAbilities[0].name} | ${heroAbilities[1].name} | ${heroAbilities[2].name} | **${heroAbilities[3].name}**`, 
                                //out of order... billy abrams bebop calico doorman celeste graves holliday infernus ivy kelvin lady geist lash mcginnis mina mirage paige pocket sinclair venator victor viscous vyper warden wraith
                                //and its like not the same out of order.... AAAAAA
                                //i am just using hero item id look up idk if their ability order is better but i think thats also messed
                                inline: true
                            }
                            //possible values
                            //Stamina regen /s: ${heroData.starting_stats.stamina_regen_per_second.value} //it looks like everyone has the same 0.2222 so i think removing since its standard rate
                            //Reload speed: ${heroData.starting_stats.reload_speed.value} //looks like all heros are at 1
                            
                        ],
                        //pull the hero rgb but need to convert to number, just got this from gpt tbh bit shifting stuff
                        color: ((heroData.colors.ui[0] << 16) +
                                (heroData.colors.ui[1] << 8) +
                                heroData.colors.ui[2])
                    }
                ]
            });
        }catch (err){
            console.error(err);
            message.reply("There was an error fetching item stats :(");
        }

    }
};