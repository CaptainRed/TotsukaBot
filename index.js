const Discord = require("discord.js");
const YTDL = require("ytdl-core");

const TOKEN = "NDU1MDIxMDg1ODM5MzI3MjQz.DnGxqg.k36H3Ntbv1GJycy04oLGa1Wwjr4";
const PREFIX = ".";

var fortunes = [ "haha no", "ya", "idk probably", "fuck off" ];

var servers = {};

const bot = new Discord.Client();


function play(connection, message) {
  var server = servers[message.guild.id];

  server.dispatcher = connection.playStream(YTDL(server.queue[0], "audioony"));

  server.queue.shift();

  server.dispatcher.on("end", function() {
    if(server.queue[0]) play(connection,message);
    else connection.disconnect();
  });
}

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on("message", function(message) {
  if (message.author.equals(bot.user)) return;

  if(!message.content.startsWith(PREFIX)) return;

  var args = message.content.substring(PREFIX.length).split(" ");

  switch(args[0].toLowerCase()) {
    case "ping":
        message.channel.sendMessage("pong!");
        break;
    case "8ball":
        if(args[1]) message.channel.sendMessage(fortunes[Math.floor(Math.random() * fortunes.length)]);
        else message.channel.sendMessage("Can't read that...");
        break;
    case "pl":
        if(!args[1]) {
          message.channel.sendMessage(message.author.toString() + " you're gonna need a link, forgive me!");
          return;
        }

        if(!message.member.voiceChannel) {
          message.channel.sendMessage(message.author.toString() + " you... you need to be in the voice channel!");
          return;
        }

        if(!servers[message.guild.id]) servers[message.guild.id] = { queue: [] };

        var server = servers[message.guild.id];

        server.queue.push(args[1]);

        if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
          play(connection, message);
        });

        break;
    case "skip":
        var server = servers[message.guild.id];

        if(server.dispatcher) server.dispatcher.end();
        break;
    case "stop":
        var server = servers[message.guild.id];

        if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
        break;
    default:
        message.channel.sendMessage("I don't know that command...");
  }

});

bot.login(TOKEN);
