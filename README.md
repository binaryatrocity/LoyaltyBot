LoyaltyBot
=========

A TwitchTV viewer reward system

Written in JavaScript and Node

Overview
--------

LoyaltyBot is a chat bot that allows you to reward viewers with loyalty points for hanging out on your stream. It's
main purpose is to allow you, the broadcaster, to reward the viewers that are dedicated to watching your stream as
opposed to the viewers that just stop by for a quick giveaway and leave.

####Features

- Fully functioning auction and raffle systems
- Betting and voting systems in place
- Double loyalty points for subscribers/loyal viewers

####Extras

- Moderator commands (currently in development, semi functional)
- Web frontend
- Currency exchange between bots

####Future Features/Extras

- Free subscriber/paid non-subscriber Jukebox (still in development)
- Stream title updates posted to twitter (still in development)

Basic Setup
-----------

example.js

````javascript
var loyaltybot = require('./../lib/initialize.js');

loyaltybot.initialize({
    // twitch info
    twitch : {
        channel     : 'loyalty',
        bot         : {name: 'LoyaltyBot', password: 'loyalty!loyalty!loyalty!'},
        subscribers : 'https://spreadsheets.google.com/feeds/list/****/od6/public/basic?alt=json'
    },

    // currency info
    currency : {
        name     : 'Points',
        payrate  : 15,
        host     : '127.0.0.1',
        user     : 'mysql_user',
        password : 'mysql_password',
        database : 'mysql_database',
        website  : 'http://www.loyaltypoints.com',
        modpowers: true, // NEW
        sub_ty_msg: 'SUBHYPE', // NEW
    },
    web: {
        port:   8000,
        slogan: 'WEBSITE SLOGAN HERE',
        logo: 'logo.jpg',
        twitter: 'example',
        chatlog: false,
        statdir: 'example',
        fanart: [
            {
                url: "https://imageurl.com/image.png",
                user: "Author",
                user_link: "http://authorurl.com"
            },
            {
                url: "https://imageurl.com/image.png",
                user: "Author",
                user_link: "http://authorurl.com"
            },
        ],
    },

    // optional features
    commands: true,
    exchanges: {'option_name':8001, 'gdollars':8002},
    ignorelist: ['jtv', 'bot_potato', 'moobot']
});
````

Configuration Options
---------------------
Twitch

- ````channel````: the channel name (in lower case)
- ````bot.name````: the account name of the bot
- ````bot.password````: the password for the bot
- ````subscribers````: a google doc that contains subscriber names (more info on this later)

Currency

- ````name````: custom name for the loyalty points
- ````payrate````: how often to hand out loyalty points (in minutes)
- ````host````: mysql database hostname/ip
- ````user````: username for the mysql database
- ````password````: password for the mysql database
- ````database````: mysql database name
- ````website````: provides loyalty bot with an offsite location for checking currency. can also be and be an empty ````string````
- ````modpowers````: let moderators use streamer-only commands? (boolean true/false)
- ````sub_ty_msg````: message to print when new subscription is detected

Optional

- ````commands````: enable/disable the ability to use moderator commands. boolean: accepts ````true```` or ````false````
- ````exchanges````: set ports for other bots, allows currency exchange between
- ````gnorelist````: usernames to ignore,  remove bot and things like moobot from the hiscore list

Preparing to Setup Your Channel's Bot
-------------------------------------

####Create a new bot account

In order to use LoyaltyBot's features you will need to create a new [TwitchTV Account](http://www.twitch.tv/signup). You can name it anything
you wish, all you need to do is pass the username/password to ````bot.name```` and ````bot.password````

####Create the subscriber/loyal viewer list on Google Docs

Since TwitchTV does not have subscriber information in their api, LoyaltyBot needs a way to obtain that information.
That's where [Google Docs](http://docs.google.com/) comes in.

In the following order:

- Create a new spreadsheet
- Set cell A1 as the header "Username"
- Subscriber names (must be lower case) will then be in column A starting in cell A2 and below (Fig. 1)
- Set the subscriber list to public and change the type to json (Fig. 2)

Side Notes:

- Even if you do not have a subscription button, you can still add loyal viewers to this list for the double loyalty point benefits.
- Why Google Docs and not the MySQL database? Simplicity. It's easier to manually update a google doc spreadsheet daily
then it is to update a MySQL table.

*Figure 1:*

![Column Setup](http://i.imgur.com/eyQOwGz.jpg)

*Figure 2:*

![Create Link](http://i.imgur.com/jDU9xOR.jpg)

####Setting up MySQL tables

LoyaltyBot stores all of the viewer info and moderator commands in a MySQL database and requires specifc table/field names.

LoyaltyBot takes care of all table creation, however if by some chance you need to manually setup the tables the following
contains information about them:

Viewer
- Table Name: ````viewers````
- Field Names: ````user```` [primary key, not null, varchar], ````points```` [not null, integer]

Commands
- Table Name: ````commands````
- Field Names: ````id```` [primary key, autoincrement, not null, integer], ````command```` [not null, text], ````text```` [not null, longtext], ````auth```` [default: 1, integer]
