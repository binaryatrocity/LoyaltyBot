var express = require('express'),
    bodyParser = require('body-parser'),
    utils = require('./utils.js'),
    https = require('https');

//---- Construct ----
function WEB(db, currency, options) {
    var __self = this;

    __self.db = db;
    __self.currency = currency;

    __self.port = options.port || 9000;
    __self.title = options.title;
    __self.currency_name = options.currency;
    __self.logo = options.logo;
    __self.twitter = options.twitter;
    __self.fanart = options.fanart;
    __self.statdir = options.statdir;
    __self.check_data = 4;//minutes
    __self.first_check = true;
    __self.slogan = '';
}

// ---- Methods ----
WEB.prototype.start = function () {
    var __self = this;
    __self.srv = express();
    __self.srv.set('view engine', 'jade');
    __self.srv.set('views', 'web/templates');
    __self.srv.use(bodyParser());
    __self.srv.use(express.static('./web/public'));

    __self.render_opts = {
        title: __self.title,
        slogan: __self.slogan,
        logo: __self.logo,
        twitter: __self.twitter,
        fanart: __self.fanart,
        currency: __self.currency_name,
    };

    // get twitch/twitter data
    function update_data() {
        var time = utils.make_interval(__self.check_data);
        if (time === 0 || __self.first_check) {
            if(__self.first_check) __self.first_check = false;
            https.get('https://api.twitch.tv/kraken/channels/' + __self.title, function (response) {
                var body = '';

                // put together response
                response.on('data', function (chunk) {
                    body += chunk;
                });

                // log file creation
                response.on('end', function () {
                    var json = null;
                    try {
                        json = JSON.parse(body);
                        __self.slogan = json.status;
                        __self.render_opts.slogan = json.status;
                    } catch (err) {
                        console.log('Error grabbing Twitch data in Web.JS: '+err);
                    }
                    setTimeout(update_data, 1000);
                });
            });
        } else {
            setTimeout(update_data, time);
        }
    }


    // ---- Helpers ----
    __self.srv.locals.ucfirst = function(value){
        return value.charAt(0).toUpperCase() + value.slice(1);
    };
    __self.srv.locals.slicelast = function(value){
        return value.slice(0, -1);
    };

    // ---- Routes -----
    __self.srv.get('/', function(req, res) {
        //lets get the top 5
        sql = 'SELECT * FROM viewers ORDER BY points DESC LIMIT 10;';
        __self.db.execute(sql, function(rows) {
            var opts = __self.render_opts;
            opts.rows = rows;
            opts.bet_status = __self.currency.bets_status;
            opts.bet_board = __self.currency.bets_board;
            opts.bet_viewers = __self.currency.bets_viewers;

            res.render('index', opts);
        });
    });
    __self.srv.get('/ladder', function(req, res) {
        //get the whole viewer list
        sql = 'SELECT * FROM viewers ORDER BY points DESC;';
        __self.db.execute(sql, function(rows) {
            var opts = __self.render_opts;
            opts.rows = rows;
            res.render('ladder', opts);
        });
    });
    __self.srv.get('/stats', function(req, res) {
        var opts = __self.render_opts;
        opts.statdir = __self.statdir;
        res.render('stats', opts);
    });
    __self.srv.get('/fanart', function(req, res) {
        res.render('fanart', __self.render_opts);
    });

    /* Raw data for android app */
    __self.srv.get('/api/test', function(req, res) {
        res.send("Hey, its Potatr. This data was pulled from the web.");
    });
    __self.srv.get('/api/viewer_dump', function(req, res) {
        sql = 'SELECT * FROM viewers ORDER BY points DESC;';
        __self.db.execute(sql, function(rows) {
            ladder_data = new Object();
            rows.forEach(function(element, index, array){
                ladder_data[element.user] = element.points;
            });
            res.send(ladder_data);
        });
    });
    __self.srv.post('/api/exchange', function(req, res) {
        var name = req.body.name.toLowerCase(),
            amount = parseInt(req.body.amount, 10);

        if (req.ip == '127.0.0.1') {
            if ( __self.currency.viewer_list.indexOf(name) > -1 ) {
                __self.currency.adjust_currency('add', amount, name);
                res.send('1');
            } else {
                res.send('0');
            }
        }
    });

    __self.srv.listen(__self.port);
    update_data();
    console.log('Started website at '+__self.port);

};

module.exports = function (db, currency, options) {
    return new WEB(db, currency,  options);
};
