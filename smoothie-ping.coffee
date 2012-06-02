union = require('union')
flatiron = require('flatiron')
ecstatic = require('ecstatic')
http = require('http')
Caching = require('caching')

cache = new Caching('memory')

app = new flatiron.App()
app.use(flatiron.plugins.http)

app.http.before = [
    ecstatic(__dirname + '/public', {autoIndex: false, cache: 3600})
]

app.router.get 'data/:id/:count', (id, count)->
  cache id+'-'+count, 60*1000, (passalong)->
    api_options = {
      host: 'nodeping.com'
      port: 80
      path: '/reports/checksjson/' + id + '/' + count
    }
    api_request = http.get api_options, (res)->
      data = ''
      res.on 'data', (chunk)->
        data += chunk
      res.on 'end', ->
        passalong(null, data)
  , (err, data)=>
    this.res.writeHead(200, { 'Content-Type': 'application/json' })
    this.res.end(data)


app.start(8080)

console.log('Listening on :8080')
