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
