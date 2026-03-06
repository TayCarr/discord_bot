//script to fetch from api the hero id and name
//to run script: node scripts/fetchHero.js

//ran 03/06/26

const fs = require('fs');
const path = require('path');

async function fetchHero(){
    try {
        const response = await fetch('https://assets.deadlock-api.com/v2/heroes');
        const heros = await response.json();

        const simplified = heros.map(hero => ({
            id: hero.id,
            name: hero.name
        }));

        const filePath = path.join(__dirname, '../data/heros.json');

        fs.writeFileSync(filePath, JSON.stringify(simplified, null, 2));

        console.log(`Saved ${simplified.length} heros to heros.json`);
    }catch (err){
        console.error('Error fetching heros', err);
    }

}

fetchHero();