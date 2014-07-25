/**
 * api:
 *      Commands(irc object, database object);
 *
 * example:
 *      commands = require('./mysql/commands.js')(irc, db, {
 *          bot_name : 'bot name',
 *          currency: 'currency name'
 *      });
 */

//-------- Construct ---------
function Commands(irc, db, options) {
    var __self = this;

    __self.irc = irc;
    __self.db = db;

    // config
    __self.config = options || {};
    __self.config.bot_name = options.bot_name || '';
    __self.config.currency = options.currency || 'coins';
    __self.config.exchange = options.exchange || {};
    __self.command_list = [];
}

//-------- Methods --------
Commands.prototype.start = function() {
    var __self = this,
        sql = 'SELECT * FROM commands';

    __self.db.execute(sql, function(rows) {
        for (var i = 0; i < rows.length; i++) {
            __self.command_list.push(rows[i].command);
        }
    });
};

Commands.prototype.commands = function(data) {
    var __self = this,
        command_check = data[3].slice(1).charAt(0),
        command = data[3].slice(2);

    // check if potential command was called and match it with stored commands
    // if the bots name is used as a command, then display all of the available commands
    if(command_check === '!' && __self.command_list.indexOf(command) >= 0) {
        var sql = 'SELECT * FROM commands WHERE command = \'' + command + '\'';

        // get command info from database
        __self.db.execute(sql, function(rows) {
            // filter through command results
            for (var i = 0; i < rows.length; i++) {
                // match db command with called command
                if (rows[i].command = command) {
                    /*
                    // display based on viewer auth
                    if (rows[i].auth === 1) {
                        __self.irc.emit('message',{message:'> '+rows[i].text, options:{caller: __self.irc.caller(data[0]), auth: 1}});
                        break;
                    } else if (rows[i].auth === 0) {
                        __self.irc.emit('message',{message:'> '+rows[i].text, options:null});
                        break;
                    }
                    */
                    __self.irc.emit('message',{message:'> '+rows[i].text, options:null});
                }
            }
        });
    } else if (command_check === '!' && command === __self.config.bot_name.toLowerCase()) {
        var commands = '> Commands: !' + __self.config.currency.toLowerCase() + ', !top, !rank, ';
        if(Object.keys(__self.config.exchange).length != 0) commands += '!exchange, ';
        for (var i = 0; i < __self.command_list.length; i++) {
            if (i !== __self.command_list.length - 1) {
                commands += '!' + __self.command_list[i] + ', ';
            } else {
                commands += '!' + __self.command_list[i];
            }
        }
        __self.irc.emit('message',{message:commands, options:null});
    }
};

Commands.prototype.add = function(command, text) {
    var __self = this;

    // escape string for sql sanity
    var txt = text.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function(char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char;
        }
            });

    var sql = 'INSERT INTO commands (command, text) VALUES (\''+command+'\', \''+txt+'\');';
        
    // add the command to the database
    __self.db.execute(sql, function(data) {
        var message = '> Add Command: !' + command + ' has been added.';

        __self.command_list.push(command);
        __self.irc.emit('message',{message:message, options:null});
    });
};

Commands.prototype.remove = function(command) {
    var __self = this,
    index = __self.command_list.indexOf(command); 

    if( index >= 0) {
        var sql = 'DELETE FROM commands WHERE command=\''+command+'\';';
        
        // remove the command from the database
        __self.db.execute(sql, function(data) {
            var message = '> Delete Command: !' + command + ' has been removed.';
            
            __self.command_list.splice(index, 1);
            __self.irc.emit('message',{message:message, options:null});
        });
    }
};

module.exports = function(irc, db, options) {
    return new Commands(irc, db, options);
};
