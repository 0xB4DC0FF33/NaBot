var Discord = require("discord.js");

var $;
require("jsdom").env("", function(err, window) {
	if (err) {
		console.error(err);
		return;
	}
	$ = require("jquery")(window);
});

var NaBot = new Discord.Client();

const token = 'MTcwODc5MjcyOTEzODYyNjU2.Ci29Ig.gCxV_Crozs0KvkE0MQjlcP2Bvfg';    // Bot's API token

const fullMaps = new Array( "Dust", "Dust II", "Nuke", "Aztec", "Cobblestone", "Overpass", "Mirage", "Inferno", "Cache", "Office", // Full CS:GO map list
"Vertigo", "Assault", "Italy", "Militia", "Train", "Coast", "Cruise", "Mikla", "Empire", "Santorini", "Royal", "Tulip");

 
NaBot.on("message", function(message){
  var command = message.toString().split(' ');
	
	if(command[0] === "$ping") {                                            // Test message, to see if the bot successfully read messages
	  NaBot.reply(message, "OVER 9000 ! bien ta grotte ? :D");
	}else if(command[0] === "$testMaps") {                                  // getMaps function test command
	  NaBot.reply(message, getMaps(5));
	}else if(command[0] === "$maps"){                        		// Main command => Get randoms CS:GO maps
	  NaBot.reply(message, getMaps(parseInt(command[1], 10)).toString());
	}else if(command[0] === "$stats"){
	  NaBot.reply(message, getStats(parseInt(command[1], 10)).toString());
	}
	
});

 /**
  * FUNCTION GET MAPS
  * 
  * Will return random maps from CS:GO
  * 
  * Args = int = Number of wanted maps
  * Return  = str = Message to print
  *
  **/

function getMaps(number) {
  console.log("function getMaps called with args : number = "+number);
  var remainMaps = fullMaps;
  var mapToPrint = new Array();
  
  for (var i = 0; i < number; i++) {
    var random = Math.floor(Math.random()*remainMaps.length);
    var map = remainMaps[random];
    
    mapToPrint.push(map);
    remainMaps.splice(remainMaps.indexOf(map), 1);
  }
  var str = "";
  for (var i = 1; i <= mapToPrint.length; i++) {
    str += "\n\tMap n°"+i+" : "+mapToPrint[i-1];
  }
  console.log(str);
  return str;
}

function getStats(UID) {
  var APIkey = '0F8BE87F0091E9A22CD6D4CA3EF6A5E7';
  var req = 'http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=440&key='+APIkey+'&steamid='+UID;
  var response = '';
  var json = $.getJSON(req, function (json) {
    var timePlayed = parseInt((json.total_time_played/60)/60, 10); // CONVERT SECONDS IN HOURS
	  var totalKills = json.total_kills;
  	var totalDeaths = json.total_deaths;
  	var ratio = parseInt(totalKills/totalDeaths, 10);
  	console.log('lalalala');
  	response = "GLOBAL STATS :\n\tKills: "+totalKills+"\n\tDeaths: "+totalDeaths+"\n\tRatio: "+ratio+"\n\tTime played:"+timePlayed;
  }).fail(function() {
    console.log( "error" );
  });
  return response;
}

NaBot.loginWithToken(token);



