var http = require('http');
var https = require('https');
var request = require('request');
var jsdom = require('jsdom');
var fs = require('fs');

module.exports =
{
  setBot: function(bot) {
    this.bot = bot;
  },
  setMsg: function(msg) {
    this.msg = msg;
  },
  setArgs: function(args) {
    this.args = args;
  },
  ////////////////
  //  COMMANDS  //
  ////////////////
  test: function(callback) {
    callback("The bot is working !");
  },
  ping: function(callback) {
    console.log("TEEEEEST");
    callback("Bot's ping : "+Math.round(this.bot.ping)+"ms.");
  },
  avatar: function(callback) {
    if (this.args.length != 0) {
      for (var i = 0; i < this.args.length; i++) {
        // we extract the user id from the mention
        var usrId = this.args[i].match(/\d/g);
        if (usrId) {
          usrId = usrId.join("");
          this.bot.fetchUser(usrId).then(function (usr){
            callback(usr.avatarURL);
          }).catch(function () {
            callback("User don't exists");
          });
        }
      }
    } else {
      callback(message.author.avatarURL);
    }
  },
  pony: function(callback) {
    var url = this.args[0] ? "search.json?q="+this.args[0] : "images.json";
    this["getJsonFromUrl"]("https://derpibooru.org/"+url, function(json){
      console.log("getJson callback");
      var imgs = json.search ? json.search : json.images;
      var max = imgs.length;
      if (max > 0){
        ponyNbr = Math.round(Math.random()*max);
        console.log("Max = ", max, "\nRand = ", ponyNbr);
        callback("You want a pony ?\nhttp:"+imgs[ponyNbr].image);
      } else {
        callback("i cannot find your wanted pony :'(");
      }
    });
  },
  help: function(callback) {
    fs.readFile('./helpmsg.txt', 'utf8', function (err, data){
        if (err) {
          callback("An error has occurred : "+err);
        } else {
          callback(data);
        }
      });
  },
  invite: function(callback) {
    this.bot.generateInvite(8)
      this.bot.generateInvite(8)
      .then(link => {
        callback("Invite me on your server ;)\n ${link}");
      });
  },
  xkcd: function(callback) {
    if (this.args[0] == 'last') {
        this["getJsonFromUrl"]("https://xkcd.com/info.0.json", function(json){
          callback("XKCD n°"+json.num+" : \n"+json.img);
        });
      } else {
        var max;
        this["getJsonFromUrl"]("https://xkcd.com/info.0.json", function(json){
          max = json.num
          var nbr = Math.round(Math.random()*max);
          this["getJsonFromUrl"]("https://xkcd.com/"+nbr+"/info.0.json", function(json){
            callback("XKCD n°"+json.num+" : \n"+json.img);
          });
        });
      }
  },
  commitstrip: function (callback) {
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
  },
  fortune: function(callback) {
    this["getJsonFromUrl"]("http://www.yerkee.com/api/fortune", function(json){
        callback(json.fortune);
      });
  },
  ///////////////////////////////////////////////////

  getJsonFromUrl: function (url, callback) {
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
          callback(response);
      });
    }).on('error', function(e){
          console.log("An error has occured : "+e);
          return false;
    });
  }
};
