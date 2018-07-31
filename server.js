const
  WebFingerAPI = require('./lib/WebFingerAPI'),
  NotFound = require('./lib/NotFound'),
  express = require('express'),
  morgan = require('morgan'),
  nconf = require('nconf')


nconf.argv()
  .env()
  .file({ file: 'etc/config.json' })

const app = express()
app.use(morgan('combined'))
const webfinger = new WebFingerAPI(nconf)



// respond with "hello world" when a GET request is made to the homepage
app.get('/.well-known/webfinger', function (req, res, next) {
  webfinger.query(req.query)
    .then((data) => {
      res.json(data)
    })
    .catch((err) => {
      if (err instanceof NotFound) {
        res.status(404).json({"header": "Could not find resource", "error": err.message})
      }
      res.status(500).json({"header": "Generic error", "error": err.message})
    })

})

app.get('/federation-api/entitystatements', function (req, res, next) {
  webfinger.entitystatement(req.query)
    .then((data) => {

      if (typeof data === 'object') {
        return res.json(data)
      }

      res.setHeader('content-type', 'application/jwt')
      res.send(data)

    })
    .catch((err) => {
      if (err instanceof NotFound) {
        res.status(404).json({"header": "Could not find resource", "error": err.message})
      }
      res.status(500).json({"header": "Generic error", "error": err.message})
    })

})


app.listen(nconf.get('port'), () => console.log('Example app listening on port 3000!'))
