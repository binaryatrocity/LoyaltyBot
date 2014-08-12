var http = require('http');

//---- Construct ----
function API(db, currency, options) {
    var __self = this;

    __self.db = db;
    __self.currency = currency;
    __self.port = options.port || 9000;
}

// ---- Methods ----
API.prototype.start = function () {
    var __self = this;
    __self.srv = http.createServer( function(req, res) {
        if (req.method == "GET") {
            if (req.url == "/api/ladder/all") {
                // Returns the entire ladder from top to bottom
                sql = 'SELECT * FROM viewers ORDER BY points DESC;';
                __self.db.execute(sql, function(rows) {
                    var data = new Object();
                    data['viewers'] = rows;
                    data['total'] = rows.length;
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(data));
                });
            } else if (/^\/api\/ladder\/[0-9]+$/.test(req.url)) {
                // Returns top X users from the ladder
                sql = 'SELECT * FROM viewers ORDER BY points DESC LIMIT '+req.url.match(/\d+/g)+';';
                __self.db.execute(sql, function(rows) {
                    var data = new Object();
                    data['viewers'] = rows;
                    data['total'] = rows.length;
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(data));
                });
            } else if (req.url == "/api/bet") {
                // Returns all of the bet data together
                data = new Object();
                data['status'] = __self.currency.bets_status;
                data['board'] = __self.currency.bets_board;
                data['viewers'] = __self.currency.bets_viewers;
                data['total_viewers'] = __self.currency.bets_viewers.length;
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(data));
            } else if (req.url == "/api/bet/status") {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(__self.currency.bets_status));
            } else if (req.url == "/api/bet/board") {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(__self.currency.bets_board));
            } else if (req.url == "/api/bet/viewers") {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(__self.currency.bets_viewers));
            } else {
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.end("404");
            }
        }
    });

    __self.srv.listen(__self.port, '0.0.0.0');
    console.log('Serving api data at '+__self.port);

};

module.exports = function (db, currency, options) {
    return new API(db, currency,  options);
};
