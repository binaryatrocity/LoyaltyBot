var express = require('express'),
    bodyParser = require('body-parser'),
    utils = require('./utils.js'),
    https = require('https');

//---- Construct ----
function API(db, currency, options) {
    var __self = this;

    __self.db = db;
    __self.currency = currency;

    __self.port = options.port || 9000;
    __self.statdir = options.statdir;
    __self.check_data = 4;//minutes
    __self.first_check = true;
    __self.slogan = '';
}

// ---- Methods ----
API.prototype.start = function () {
    var __self = this;
    __self.srv = express();
    __self.srv.set('view engine', 'jade');
    __self.srv.set('views', 'web/templates');
    __self.srv.use(bodyParser());
    __self.srv.use(express.static('./web/public'));


    // ---- Helpers ----
    __self.srv.locals.ucfirst = function(value){
        return value.charAt(0).toUpperCase() + value.slice(1);
    };
    __self.srv.locals.slicelast = function(value){
        return value.slice(0, -1);
    };

    // ---- Endpoints ----
    __self.srv.get('/api/ladder/all', function(req, res){
        // Returns the entire ladder from top to bottom
        sql = 'SELECT * FROM viewers ORDER BY points DESC;';
        __self.db.execute(sql, function(rows) {
            var data = new Object();
            data['viewers'] = rows;
            data['total'] = rows.length;
            res.send(data);
        });
    });
    __self.srv.get('/api/ladder/:numarg([0-9]+)', function(req, res){
        // Returns top int(:id) users from the ladder
        sql = 'SELECT * FROM viewers ORDER BY points DESC LIMIT '+req.params.numarg+';';
        __self.db.execute(sql, function(rows) {
            var data = new Object();
            data['viewers'] = rows;
            data['total'] = rows.length;
            res.send(data);
        });
    });

    __self.srv.get('/api/bet', function(req, res){
        // Returns all of the bet data together
        data = new Object();
        data['status'] = __self.currency.bets_status;
        data['board'] = __self.currency.bets_board;
        data['viewers'] = __self.currency.bets_viewers;
        data['total_viewers'] = __self.currency.bets_viewers.length;
        res.send(data);
    });
    __self.srv.get('/api/bet/status', function(req, res){
        // Returns the current bet status
        res.send(__self.currency.bets_status);
    });
    __self.srv.get('/api/bet/board', function(req, res){
        // Returns the current bet board
        res.send(__self.currency.bets_board);
    });
    __self.srv.get('/api/bet/viewers', function(req, res){
        // Returns the current bet viewers
        res.send(__self.currency.bets_viewers);
    });

    __self.srv.listen(__self.port);
    console.log('Started website at '+__self.port);

};

module.exports = function (db, currency, options) {
    return new API(db, currency,  options);
};
