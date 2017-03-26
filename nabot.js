var Discord = require("discord.js");
var http = require('http');
var https = require('https');
var request = require('request');
var jsdom = require('jsdom');
var fs = require('fs');

var config = require("./config.json");

// Variables initialization
const NaBot = new Discord.Client();

NaBot.on("message", function(message){
  msg = message.toString();
  // If the prefix is matching
  if (msg.charAt(0) == config.prefix) {
    cmd = msg.substr(1).split(' ')[0];
    args = msg.substr(1).split(' ');
    // We need to clean the args from empty strings
    for (var i = 0; i < args.length; i++) {
      if (args[i] == '') {
        args.splice(i, 1);
        i--;
      }
    }
    args.shift();
    // We print the command and the author in the server's console
    console.log('######################');
    console.log('User : '+message.author.username);
    console.log('Command : '+cmd);
    console.log('Arguments : '+args.toString());
    console.log('######################');
    //########################################################################//
    //                  NOW... ALL THE COMMANDS                               //
    //##########################################################################
    if (cmd == 'test') {
      message.reply("No need to test... my code is perfect...");
    }
    ///////////////////////
    // Get the bot's ping//
    ///////////////////////
    else if (cmd == 'ping') {
      if (NaBot.ping > 500) {
        message.channel.send(NaBot.ping+" Gawd ! It's laggy today....");
      } else {
        message.channel.send("Ping = "+NaBot.ping);
      }
    }
    ///////////////////////////////////////////////////////////////////
    // Get my profile pic (or the avatar of a user specified in args)//
    ///////////////////////////////////////////////////////////////////
    else if (cmd == 'avatar') {
      if (args.length != 0) {
        for (var i = 0; i < args.length; i++) {
          // we extract the user id from the mention
          var usrId = args[i].match(/\d/g);
          if (usrId) {
            usrId = usrId.join("");
            NaBot.fetchUser(usrId).then(function (usr){
              message.channel.send(usr.avatarURL);
            }).catch(function () {
              message.channel.send("User don't exists");
            });
          }
        }
      } else {
        message.channel.send(message.author.avatarURL);
      }

    }
    ////////////////////////////
    // Get a random pony face //
    ////////////////////////////
    else if (cmd == 'pony') {
      var tag = args[0] ? args[0] : "";
      getJsonFromUrl("http://ponyfac.es/api.json/tag:"+tag, function(json){
        message.channel.send(getPony(json));
      });
    }
    /////////////////////////////
    // Prints the help message //
    /////////////////////////////
    else if (cmd == 'help') {
      fs.readFile('./helpmsg.txt', 'utf8', function (err, data){
        if (err) {
          message.channel.send("An error has occurred : "+err);
        } else {
          message.channel.send(data);
        }
      });
    }
    //////////////////////////////
    // Generates an invite link //
    //////////////////////////////
    else if (cmd == 'invite') {
      NaBot.generateInvite(8)
      .then(link => {
        message.channel.send(`Invite me on your channel ;)\n ${link}`);
      });
    }
    /////////////////////////////////
    // Displays a xkcd comic strip //
    /////////////////////////////////
    else if (cmd == 'xkcd') {
      if (args[0] == 'last') {
        getJsonFromUrl("https://xkcd.com/info.0.json", function(json){
          message.channel.send("XKCD n°"+json.num+" : \n"+json.img);
        });
      } else {
        var max;
        getJsonFromUrl("https://xkcd.com/info.0.json", function(json){
          max = json.num
          var nbr = Math.round(Math.random()*max);
          getJsonFromUrl("https://xkcd.com/"+nbr+"/info.0.json", function(json){
            message.channel.send("XKCD n°"+json.num+" : \n"+json.img);
          });
        });
      }
    }
    /////////////////////////////////////////
    // Displays a random commitstrip comic //
    /////////////////////////////////////////
    else if (cmd == 'commitstrip') {
      getCommitstrip(function(img) {
        message.channel.send(img);
      });
    }
    ///////////////////////////////
    // Displays a random fortune //
    ///////////////////////////////
    else if (cmd == 'fortune') {
      getJsonFromUrl("http://www.yerkee.com/api/fortune", function(json){
        message.channel.send(json.fortune);
      });
    }
  }
});

NaBot.login(config.token);
console.log("Nabot successfully connected with token : \n"+config.token);

////////////////////////////////////////////
//      COMMAND RELATED FUNCTIONS         //
////////////////////////////////////////////

function getJsonFromUrl(url,callback) {
  console.log("Calling "+url);
  var protocol = url.slice(0, 5) == 'https' ? https : http;
  protocol.get(url, function(res){
    var body = '';
    res.on('data', function(chunk){
        body += chunk;
    });
    res.on('end', function(){
        var response = JSON.parse(body);
        console.log("Successull request");

        return callback(response);
    });
  }).on('error', function(e){
        console.log("An error has occured : "+e);
        return false;
  });
}

function getPony(json) {
  max = json.faces.length;
  if (max > 0){
    ponyNbr = Math.round(Math.random()*max);
    console.log("Max = ", max, "\nRand = ", ponyNbr);
    return "You want a pony ? \nHere's "+json.faces[ponyNbr-1].category.name+"\n"+json.faces[ponyNbr].image;
  } else {
    return "i cannot find your wanted pony :'("
  }
}

function getCommitstrip(callback) {
  var url = "http://www.commitstrip.com/en/random"
  request(url, function(err, res, body){
    console.log('error:', err);
    console.log('statusCode:', res && res.statusCode);
    jsdom.env(
      body,
      ["http://code.jquery.com/jquery.js"],
      function (err, window) {
        var link = window.$("img.size-full").attr('src');
        console.log("strip's link :"+link);
        callback(link);
      }
    );
  });
}
