var Discord = require("discord.js");
var nabot = require('./nabot.js');

var config = require("./config.json");

// Variables initialization
const bot = new Discord.Client();
nabot.setBot(bot);

bot.on("message", function(message){
  var msg = message.toString();
  // If the prefix is matching
  if (msg.charAt(0) == config.prefix) {
    cmd = msg.substr(1).split(' ')[0];
    var args = msg.substr(1).split(' ');
    // We need to clean the args from empty strings
    for (var i = 0; i < args.length; i++) {
      if (args[i] == '') {
        args.splice(i, 1);
        i--;
      }
    }
    // if the command don't exist, exit the function
    if (!nabot[cmd]){return false;}

    args.shift();
    // We print the command and the author in the server's console
    console.log('######################');
    console.log('User : '+message.author.username);
    console.log('Command : '+cmd);
    console.log('Arguments : '+args.toString());

    nabot.setArgs(args);
    nabot.setMsg(message);
    var response = nabot[cmd](function(res){
      if (res) {
        console.log('Response : '+res);
        message.channel.send(res);
      }
      console.log('######################');
    });
  }
});

bot.login(config.token);
console.log("Nabot successfully connected with token : \n"+config.token);
