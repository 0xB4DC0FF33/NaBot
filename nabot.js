const http = require('http');
const https = require('https');
const request = require('request');
const jsdom = require('jsdom');
const fs = require('fs');
const yt = require('ytdl-core');
const Discord = require("discord.js");

const tokens = require('./config.json');

module.exports =
{
  // Music queue
  queue: {},

  //////////////
  // SETTERS  //
  //////////////
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
    var url = this.args[0] ? "search.json?q="+this.args[0]+"&filter_id=56027" : "images.json";
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
      if (err) return callback("An error has occurred : "+err);
      return callback(data);
    });
  },
  invite: function(callback) {
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
  setgame: function(callback) {
    if (this.args) return this.bot.user.setGame(this.args.join(" "));
    return callback("No game specified !");
  },

  /////////////
  //  MUSIC  //
  /////////////
  join: function(callback) {
    var msg = this.msg;
    return new Promise(function(resolve, reject) {
      var voiceChannel = msg.member.voiceChannel ? msg.member.voiceChannel : this.fetchVoiceChannel();
      if (!voiceChannel || voiceChannel.type !== 'voice') return callback('I couldn\'t connect to your voice channel...');
      voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
      callback("Channel "+voiceChannel.name+" joined !");
    });
  },
  leave: function(callback) {
    var msg = this.msg;
    return new Promise(function(resolve, reject) {
      var voiceChannel = msg.member.voiceChannel;
      if (!voiceChannel || voiceChannel.type !== 'voice') return callback('I couldn\'t leave your voice channel...');
      voiceChannel.leave().then(connection => resolve(connection)).catch(err => reject(err));
      callback("Leave the channel "+voiceChannel.name);
    });
  },
  play: function(callback) {
    var msg = this.msg;
    if (!msg.guild.voiceConnection) return this.join(callback).then(() => this.play(callback));
    if (this.queue[msg.guild.id].playing) return callback('Already Playing');
    if (!this.queue[msg.guild.id].songs) return this.add(callback).then(() => this.play(callback));
    let dispatcher;
    this.queue[msg.guild.id].playing = true;

    (function play(song){
      msg.channel.send(`Playing: **${song.title}** as requested by: **${song.requester}**`);
      var streamOpts = {seek: 0, volume: 1, passes: 3};
      dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, {audioonly: true}), streamOpts);
      // let collector = msg.channel.createCollector(m => m);
      dispatcher.on('end', () => {
				// collector.stop();
				play(queue[msg.guild.id].songs.shift());
			});
			dispatcher.on('error', (err) => {
				return msg.channel.send('error: ' + err).then(() => {
					// collector.stop();
					play(queue[msg.guild.id].songs.shift());
				});
      });
    })(this.queue[msg.guild.id].songs.shift());
  },
  add: function(callback) {
    if (!this.args) return callback("Please specify a YouTube link.");
    var url = this.args[0];
    yt.getInfo(url, (err, info) => {
      if(err) return msg.channel.send('Invalid YouTube Link: ' + err);
      if (!this.queue.hasOwnProperty(this.msg.guild.id)) this.queue[this.msg.guild.id] = {}, this.queue[this.msg.guild.id].playing = false, this.queue[this.msg.guild.id].songs = [];
      this.queue[this.  msg.guild.id].songs.push({url: url, title: info.title, requester: this.msg.author.username});
      callback(`added **${info.title}** to the queue`);
    });
  },
  queue: function(callback) {
		if (this.queue[this.msg.guild.id] === undefined) return this.msg.channel.send(`Add some songs to the queue first with ${tokens.prefix}add`);
		let tosend = [];
		this.queue[this.msg.guild.id].songs.forEach((song, i) => { tosend.push(`${i+1}. ${song.title} - Requested by: ${song.requester}`);});
		callback(`__**${this.msg.guild.name}'s Music Queue:**__ Currently **${tosend.length}** songs queued ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
  },
  /////////////////////////
  //  UTILITY FUNCTIONS  //
  /////////////////////////
  getJsonFromUrl: (url, callback) => {
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
  },
  fetchVoiceChannel: () => {
    for (chan of this.msg.guild.channels) {
      if (chan.type == "voice") {
        return chan;
      }
    }
  }
};
