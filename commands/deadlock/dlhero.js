// /commands/deadlock/dlhero.js

//i think for this command it will pull up the hero and have a little profile on them 
//pull basic info initially and later I would like to maybe have winrate, pickrate etc

//getting help from gpt to incorporate discord buttons at first i was doing reactions but i saw the suggestion to do faster cleaner version of discord buttons !!
//buttons will have pages for the abilities stat info going to start very basic with the shared stats
//later will have to expand on each indiv hero stats
//TODO add a page with hero stats that are like win rate ban rate pick rate etc more high level player stat stuff
//suggested items?
//just build on it i guess...

const { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType 
} = require('discord.js'); //import button components 


const { request } = require('undici');

function cleanDescription(text) {//TODO not sure if I need maybe there is html tags remove if not
    if (!text) return "No description available.";
  
    return text
    //rem has this in his text should be "Tag Along" {g:citadel_binding:'Ability2'} 
      .replace(/<[^>]*>/g, " ") // remove HTML tags
      .replace(/\n/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .trim();
  }

module.exports = {
    name: "dlhero",
    description: "Fetch hero info and stats", //TODO maybe change
    async execute(message, args){
        if (!args[0]){
            return message.reply("You must provide a hero name. Example `!dlhero Rem`"); 
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
            
            //i was building some loop but ummm asking chatgpt and was given this
            /******const ability_names = [];
            for (let i = 1; i <= 4; i++) {
                const abilityOrder = heroData.items[`signature${i}`];//didnt know how to access this way and was given the rest lmao
            
                const ability = heroAbilities.find(
                    a => a.class_name === abilityOrder
                );
            
                if (ability) {
                    ability_names.push(ability.name);
                }
            }******/
            //console.log(ability_names);

            //save the entire ability in order for later access in the different card pages 
            const abilities = [];

            for(let i = 1; i <= 4; i++){
                const abilityOrder = heroData.items[`signature${i}`];

                const ability = heroAbilities.find(a => a.class_name === abilityOrder);
                if(ability){
                    abilities.push(ability);
                }
            }

            //create buttons
            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('hero')
                .setLabel('Hero')
                .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                .setCustomId('ability1')
                .setLabel('1')
                .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                .setCustomId('ability2')
                .setLabel('2')
                .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                .setCustomId('ability3')
                .setLabel('3')
                .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                .setCustomId('ability4')
                .setLabel('4')
                .setStyle(ButtonStyle.Secondary),
            )

            //TODO fill this embed instead ig
            /*const heroEmbed = {
                title: `${heroData.name}`,
                ...
            }; */

            
            const card = await message.reply({
                embeds: [ //TODO define the embed separately, it keeps getting suggested...
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
                            {
                                name: "Gun",
                                thumbnail: heroData.shop_stat_display.weapon_image,
                                value: heroData.gun_tag || "idk its a candle",
                                inline: false
                              },
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
                                //TODO silver has the second set of abilities (bootkick->ability_werewolf_maulingleap) SIGH they dont have the hero id linked to it 
                                value: `${abilities[0].name} | ${abilities[1].name} | ${abilities[2].name} | **${abilities[3].name}**`, 
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
                ],
                components: [row]
            });

            //add button listener
            const collector = card.createMessageComponentCollector({
                ComponentType: ComponentType.Button,
                time: 60000 //stop listening after 60 seconds
            });

            //handle button press
            collector.on('collect', async(interaction) => {
                if(interaction.user.id !== message.author.id){ //if the user is not the original author 
                    return interaction.reply({
                        content: "back off.",
                        ephemeral: true //TODO whats this
                    });
                }

                //hero button
                if(interaction.customId === "hero"){
                    return interaction.update({
                        embeds: [heroEmbed], //TODO will need to do the embed builder...
                        components: [row]
                    });
                }

                //ability buttons
                //TODO think of way for it to be customized with hero abilities and each ability is also custom...
                const abilityIndex = parseInt(interaction.customId.replace("ability", "")) - 1;

                const ability = abilities[abilityIndex];

                const abilityEmbed = {
                    title: `${heroData.name} - ${ability.name}`,
                    description: cleanDescription(ability.description.desc), //TODO these descriptions are FUCKED
                    thumbnail:{
                        url: ability.image
                    },
                    fields:[
                        {
                            name: "Cooldown",
                            value: `${ability.properties.AbilityCooldown.value}` || "0",
                            inline: false
                        },
                        {
                            name: "Ability Duration",
                            value: `${ability.properties.AbilityDuration.value}` || "0",
                            inline: false
                        },
                        {
                            name: "Damage",
                            //value: ability.properties.Damage.value || "0",//not all abilities have dmg...
                            value: "aaaaaa",
                            inline: false
                        },
                    ],

                    color: ((heroData.colors.ui[0] << 16) +
                            (heroData.colors.ui[1] << 8) +
                            heroData.colors.ui[2])
                };

                await interaction.update({
                    embeds: [abilityEmbed],
                    components: [row]
                });
            });

            

        }catch (err){
            console.error(err);
            message.reply("There was an error fetching hero stats :(");
        }

    }
};