// /commands/deadlock/dlstats.js

const { stat } = require('fs/promises');
const { request } = require('undici');

const heros = require('../../data/heros.json');

function findHero(heroID){ 
        const found = heros.find(hero =>
            hero.id == heroID //cant do strict or it wont pass as int == str        
            );

        return found.name
}

module.exports = {
    name: "dlstats",
    description: "Fetch player stats by Steam ID", //TODO maybe change
    async execute(message, args){
        if (!args[0]){
            return message.reply("You must provide a Steam ID. Example `!dlstats 76561198089969130`");
        }

        const steamID = args[0];

        try{
            //call deadlock api match history endpoint
            const { statusCode, body } = await request(`https://api.deadlock-api.com/v1/players/${steamID}/match-history`);
            console.log(statusCode);

            if(statusCode !== 200){
                const errorMessages = {
                    429: "Rate Limit Exceeded nooooooo :(",
                    400: "Provided parameters are invalid !!! :(",
                    500: "Fetching player match history failed :("
                };
                const msg = errorMessages[statusCode]|| "API returned an unknown error :(";
                return message.reply(msg);
            };

            const matches = await body.json();

            if (!matches || matches.lenght === 0){
                return message.reply("No matches found.");
            }

            let wins = 0;
            let losses = 0;
            let kills = 0;
            let deaths = 0;
            let assists = 0;
            let hero_level = 0;
            let played = {};

            for (const match of matches){
                if (match.player_team === match.match_result){
                    wins++;
                }
                else{
                    losses++;
                }
                kills += match.player_kills;
                deaths += match.player_deaths;
                assists += match.player_assists;
                hero_level += match.hero_level;

                if(!played[match.hero_id]){
                    played[match.hero_id] = 1;

                }
                else{
                    played[match.hero_id] += 1;
                }

            }

            const total = wins + losses;
            const winrate = ((wins / total) * 100).toFixed(1);
            const avg_level = ((hero_level / total) * 100).toFixed(0);

            const topHero = Object.entries(played).sort((a, b) => b[1] - a[1])[0]; //to get most played
            const secHero = Object.entries(played).sort((a, b) => b[1] - a[1])[1];
            const thirdHero = Object.entries(played).sort((a, b) => b[1] - a[1])[2];
            
            


            //basic summary from returned stats
            //TODO adjust fields based on API response shape
            await message.reply({
                embeds: [
                    {
                        title: `Deadlock Stats for Steam ID: ${steamID}`,
                        fields:[
                            {name: "Total Matches", value: `${total}  -->`, inline: true},
                            {name: "Wins", value: `${wins}`, inline: true},
                            {name: "Losses", value: `${losses}`, inline: true},
                            {name: "Winrate", value: `${winrate}%`, inline: false},
                            {name: "Deaths", value: `${deaths}`, inline: true},
                            {name: "Kills", value: `${kills}`, inline: true},
                            {name: "Assists", value: `${assists}`, inline: true},
                            {name: "Avg Hero Level", value: `${avg_level}`, inline: true},
                            {name: "Top Played", value: `${findHero(topHero[0])} --> ${topHero[1]}\n${findHero(secHero[0])} --> ${secHero[1]}\n${findHero(thirdHero[0])} --> ${thirdHero[1]}\n`, inline: true},
                        ],
                        color: 0x00AE86 //TODO
                    }
                ]
            });
        }catch (err){
            console.error(err);
            message.reply("There was a network error fetching stats :(");
        }

    }
};