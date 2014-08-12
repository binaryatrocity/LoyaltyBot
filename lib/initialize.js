var file = require('fs');

//create logs directory
file.exists(__dirname+'/../logs', function (exists) {
    if (!exists) {
        file.mkdir(__dirname+'/../logs');
    }
});

process.on('uncaughtException', function(err) {
    file.appendFile(__dirname+'/../logs/error-log.txt', err.message + '\r\n' + err.stack + '\r\n', function() {});
});

exports.initialize = function(options) {
    var config = options || {}, db, irc, commands, dashboard, currency;

//-------- Setup -------
    irc = require('./irc.js')({
        name    : config.twitch.bot.name,
        pass    : config.twitch.bot.password,
        channel : '#' + config.twitch.channel,
        chatlog : config.twitch.chatlog
    });
    db = require('./mysql.js')({
        host     : config.currency.host,
        user     : config.currency.user,
        password : config.currency.password,
        database : config.currency.database
    });
    commands = require('./commands.js')(irc, db, {
        bot_name : config.twitch.bot.name,
        currency : config.currency.name
    });
    currency = require('./currency.js')(irc, db, commands, {
        currency    : config.currency.name,
        payrate     : config.currency.payrate,
        subscribers : config.twitch.subscribers,
        website     : config.currency.website,
        modpowers   : config.currency.modpowers,
        ignorelist  : config.ignorelist,
        sub_ty_msg  : config.currency.sub_ty_msg
    });
    api = require('./api.js')(db, currency, {
        port        : config.api.port,
        statdir     : config.twitch.channel
    });

//-------- Start -------
    irc.start();
    db.start();
    currency.start();
    api.start();
    if (config.commands === true) commands.start();

    irc.on('data', function (data) {
        console.log(data);
        irc.realtime(data);
    });

    irc.on('command', function (data) {
        currency.commands(data);
        if (config.commands === true) commands.commands(data);
    });

    irc.on('message', function (msg) {
       irc.queue(msg);
    });

};
