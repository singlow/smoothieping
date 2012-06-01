var Caching, app, cache, ecstatic, flatiron, http, union;

union = require('union');

flatiron = require('flatiron');

ecstatic = require('ecstatic');

http = require('http');

Caching = require('caching');

cache = new Caching('memory');

app = new flatiron.App();

app.use(flatiron.plugins.http);

app.http.before = [ecstatic(__dirname + '/public')];

app.router.get('/data/:id/:count', function(id, count) {
  var _this = this;
  return cache(id + '-' + count, 60 * 1000, function(passalong) {
    var api_options, api_request;
    api_options = {
      host: 'nodeping.com',
      port: 80,
      path: '/reports/checksjson/' + id + '/' + count
    };
    return api_request = http.get(api_options, function(res) {
      var data;
      data = '';
      res.on('data', function(chunk) {
        return data += chunk;
      });
      return res.on('end', function() {
        return passalong(null, data);
      });
    });
  }, function(err, data) {
    _this.res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    return _this.res.end(data);
  });
});

app.start(8080);

console.log('Listening on :8080');
