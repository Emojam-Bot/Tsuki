const Discord = require("discord.js");
const keepAlive = require("./server");
const random = require('random');
const fs = require('fs');
const jsonfile = require('jsonfile');

require("dotenv").config();

const { MessageEmbed, Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const ignoreList = require('./ignore.json')

// Create stats.json file in not created
var stats = {};
if (fs.existsSync('stats.json')){
    stats = jsonfile.readFileSync('stats.json');
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
  client.user.setActivity('withercubes.xyz')
})

client.on('messageCreate', (message) => {
    // Ignores messages sent by or sent in from the list in ignore.json
    if (message.author.bot){
        return;
    }

    if (message.channel.name == ignoreList.channel1 || message.channel.name == ignoreList.channel2 || message.channel.name == ignoreList.channel3 || message.channel.name == ignoreList.channel4 || message.channel.name == ignoreList.channel5 || message.channel.name == ignoreList.channel6){
        return;
    }

    if (message.guild.id in stats === false){
        stats[message.guild.id] = {};
    }

    const guildStats = stats[message.guild.id];
    if (message.author.id in guildStats === false){
        guildStats[message.author.id] = {
            xp: 0,
            level: 0,
            required_xp: 0,
            last_message: 0
        };
    }

    const userStats = guildStats[message.author.id];
    // Limit the XP for a user for every 1 minute
    if (Date.now() - userStats.last_message > 60){
    userStats.xp += random.int(5, 10); //give xp from 5 to 10
    userStats.last_message = Date.now();

    const xpToNextLevel = 5 * Math.pow(userStats.level, 2) + 50 * userStats.level + 100; // MEE6 XP calculation
    if (userStats.xp >= xpToNextLevel){
        userStats.level++;
        userStats.xp = userStats.xp - xpToNextLevel;
        userStats.required_xp = xpToNextLevel
        message.channel.send(message.author.toString() + ' has reached level ' + userStats.level); // Send message to user after increasing a level
    }
    userStats.required_xp = xpToNextLevel
    jsonfile.writeFileSync('stats.json', stats);

    console.log(message.author.username + ' now has ' + userStats.xp);
    console.log(xpToNextLevel + ' XP needed for next level');
}
    const parts = message.content.split(' ');

    if (parts[0] === '!ping'){
        message.reply("pong");
    }

    if (parts[0] === '!ee'){
        const embed = new Discord.MessageEmbed()
        .setColor("#AEB2B5")
        .setTitle("Rank Card of " + message.author.username + '#' + message.author.discriminator )
        .setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        .setThumbnail(message.author.displayAvatarURL())
        .addFields(
            { name: "Level", value: String(userStats.level), inline: true },
            { name: "XP", value: String(userStats.xp) + "/" + String(userStats.required_xp), inline: true },
            { name: "Markdown", value: "You can put all the *usual* **__Markdown__** inside of them.", inline: true }
        )
        /*
        * Blank field, useful to create some space.
        */
        .addField("\u200b", "\u200b")
        /*
        * With Discord now allowing messages to contain up to 10 embeds, we need to put it in an array.
        */
        message.channel.send({ embeds: [embed] });
    }
})

keepAlive()
client.login(process.env.BOTTOKEN)