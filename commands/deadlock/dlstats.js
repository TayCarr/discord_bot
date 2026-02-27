// /commands/deadlock/dlstats.js

//import { request } from 'undici'

const { request } = require('undici');

module.exports = {
    name: "dlstats",
    description: "Fetch player stats by Steam ID", //TODO maybe change
    async execute(message, args){
        if (!args[0]){
            return message.reply("You must provide a Steam ID. Example `!dlstats Tayllor`");
        }

        const steamID = args[0];

        try{
            //call deadlock api match history endpoint
            //const res = await fetch(`https://api.deadlock-api.com/v1/players/${steamID}/match-history`);
            const { statusCode, body } = await request(`https://api.deadlock-api.com/v1/players/${steamID}/match-history`);

            /*if (!res.ok){
                return message.reply("Failed to fetch data, double check the Steam ID");
            }
            const data = await res.json();*/

            const matches = await body.json();

            if (!matches || matches.lenght === 0){
                return message.reply("No matches found.");
            }

            let wins = 0;
            let losses = 0;

            for (const match of matches){
                if (match.player_team === match.match_result){
                    wins++;
                }
                else{
                    losses++;
                }
            }

            const total = wins + losses;
            const winrate = ((wins / total) * 100).toFixed(1);


            //basic summary from returned stats
            //TODO adjust fields based on API response shape

            /*const totalMatches = data.match_history?.length ?? 0;
            const wins = data.match_history?.filter(m => m.result === "Win").lenght ?? 0;
            const losses = totalMatches - wins;*/

            await message.reply({
                embeds: [
                    {
                        title: `Deadlock Stats for Steam ID: ${steamID}`,
                        fields:[
                            {name: "Total Matches", value: `${total}`, inline: true},
                            {name: "Wins", value: `${wins}`, inline: true},
                            {name: "Losses", value: `${losses}`, inline: true},
                            {name: "Winrate", value: `${winrate}%`, inline: true},
                        ],
                        color: 0x00AE86 //TODO
                    }
                ]
            });
        }catch (err){
            console.error(err);
            message.reply("There was an error fetching stats :(");
        }

    }
};