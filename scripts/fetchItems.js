//script to fetch from api the item id, class_name, name
//since item lookup with api only supports id and class_name look up but they are long numbers/names that differ from in game name
//to run script: node scripts/fetchItems.js

//ran 02/27/26

//would need to run when new items are added so maybe add a check if not in add else skip to next item?? or i guess just run it and itll writeover for fresh data incase id changes or anything?

const fs = require('fs');
const path = require('path');

async function fetchItems(){
    try {
        const response = await fetch('https://assets.deadlock-api.com/v2/items');
        const items = await response.json();

        const simplified = items.map(item => ({
            id: item.id,
            class_name: item.class_name,
            name: item.name
        }));

        const filePath = path.join(__dirname, '../data/items.json');

        fs.writeFileSync(filePath, JSON.stringify(simplified, null, 2));

        console.log(`Saved ${simplified.length} items to items.json`);
    }catch (err){
        console.error('Error fetching items', err);
    }

}

fetchItems();
