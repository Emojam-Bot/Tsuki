const Discord = require("discord.js");
const keepAlive = require("./server");
const random = require('random');
const fs = require('fs');
const jsonfile = require('jsonfile');
const Levels = require("discord-xp");

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
  client.user.setActivity('testing.xyz')
})

client.on('messageCreate', async (message) => {
    // Ignores messages sent by or sent in from the list in ignore.json
    if (!message.guild) return;
    if (message.author.bot) return;
    if (message.channel.name == ignoreList.channel1 || message.channel.name == ignoreList.channel2 || message.channel.name == ignoreList.channel3 || message.channel.name == ignoreList.channel4 || message.channel.name == ignoreList.channel5 || message.channel.name == ignoreList.channel6) return;

    if (message.guild.id in stats === false){
        stats[message.guild.id] = {};
    }

    const guildStats = stats[message.guild.id];
    if (message.author.id in guildStats === false){
        guildStats[message.author.id] = {
            last_message: 0
        };
    }

    const userStats = guildStats[message.author.id];
    // Limit the XP for a user for every 1 minute
    if (Date.now() - userStats.last_message > 60000){
    const randomAmountOfXp = Math.floor(Math.random() * 29) + 1; // Min 1, Max 10
    userStats.last_message = Date.now();
    const hasLeveledUp = await Levels.appendXp(message.author.id, message.guild.id, randomAmountOfXp);
    if (hasLeveledUp) {   
      const user = await Levels.fetch(message.author.id, message.guild.id);   
      message.channel.send(`${message.author}, congratulations! You have leveled up to **${user.level}**. :tada:`);   
    }
    jsonfile.writeFileSync('stats.json', stats);
}
    const parts = message.content.split(' ');

    if (parts[0] === '!ping'){
        message.channel.send(`Bot Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
    }

    if (parts[0] === '!lb'){
        const rawLeaderboard = await Levels.fetchLeaderboard(message.guild.id, 10); // We grab top 10 users with most xp in the current server.
        if (rawLeaderboard.length < 1) return reply("Nobody's in leaderboard yet.");
        const leaderboard = await Levels.computeLeaderboard(client, rawLeaderboard, true); // We process the leaderboard.
        const lb = leaderboard.map(e => `${e.position}. ${e.username}#${e.discriminator}\nLevel: ${e.level}\nXP: ${e.xp.toLocaleString()}`); // We map the outputs.
        const embed = new Discord.MessageEmbed()
        .setColor("#58B9FF")
        .setTitle("Server Leaderboard")
        .setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        .addFields(
            { name: "Leaderboard:", value: String(lb.join("\n\n")), inline: true}
        )
        message.channel.send({ embeds: [embed] });
    }

    if (parts[0] === '!rank'){
        const target = message.mentions.users.first() || message.author; // Grab the target.
        const user = await Levels.fetch(target.id, message.guild.id, true); // Selects the target from the database.
        const embed = new Discord.MessageEmbed()
        .setColor("#AEB2B5")
        .setTitle("Rank Card of " + message.author.username + '#' + message.author.discriminator )
        .setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        .setThumbnail(message.author.displayAvatarURL())
        .addFields(
            { name: "Rank", value: String(user.position), inline: true},
            { name: "Level", value: String(user.level), inline: true },
            { name: "XP", value: String(user.xp) + "/" + String(Levels.xpFor(user.level + 1)), inline: true }
        )
        message.channel.send({ embeds: [embed] });
    }
})

keepAlive()
Levels.setURL(process.env.DB);
client.login(process.env.BOTTOKEN)