require("dotenv").config();
//main bot file

const {Client, GatewayIntentBits, Collection} = require("discord.js");
const fs = require("fs");
const messages = require("sql-cli/lib/messages");

const TOKEN = process.env.TOKEN;

//-------CLIENT SETUP---------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

//---------LOAD COMMANDS--------------------
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

//------------USER DATA-------------------
let data = {};

if(fs.existsSync("data.json")){
    data = JSON.parse(fs.readFileSync("data.json"));
}

function saveData(){
    fs.writeFileSync("data.json", JSON.stringify(data, null, 4));
}

//--------LEVEL FORMULA-------------
function getLevel(xp){
    return Math.floor(Math.sqrt(xp)); //simple level curve TODO??

}

//---------XP PER MESSAGE----------------
client.on("messageCreate", (message) => {
    if(message.author.bot) return;

    const id = message.author.id;

    if(!data[id]){
        data[id] = {xp: 0, level: 1, inventory: [], coins: 0 };
    }
    data[id].xp += 5;

    const newLevel = getLevel(data[id].xp);
    if(newLevel > data[id].level){
        data[id].level = newLevel;
        data[id].coins += 5; //TODO give them coins when they level
        message.channel.send(`🎉 **${message.author.username} leveled up to Level ${newLevel}! wooo hooo **`);

    }

    saveData();

    //command handling
    if(!message.content.startsWith("!")) return;
    const args = message.content.slice(1).split(/ +/);
    const cmdName = args.shift().toLowerCase();

    if(client.commands.has(cmdName)){
        client.commands.get(cmdName).execute(message, args, data, saveData);
    }
});

//---------LOGIN---------------
client.login(TOKEN);