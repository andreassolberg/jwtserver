const
  NotFound = require('./NotFound'),
  JWKS = require('jwtfed').JWKS,
  // EntityStatementSigner = .EntityStatementSigner,
  // EntityStatement = require()
  fs = require('fs'),
  jwtfed = require('jwtfed'),
  URL = require('url').URL

class WebFingerAPI {

    constructor(config) {
      this.config = config
      this.jwks = new JWKS(JSON.parse(fs.readFileSync('./etc/jwks.json', "utf8")))

      let essource = this.config.get('essource')
      let esfile = './etc/es-' + essource + '.json'
      console.log("Loading es from [" + essource + "], looking up file " + esfile)

      this.statements = JSON.parse(fs.readFileSync(esfile, "utf8"))
      this.signer = new jwtfed.EntityStatementSigner(this.jwks)
      // this.baseurl = config.get('baseurl') // 'http://localhost:3000/'
      this.baseurl = new URL('/', this.config.get('issuer'))
      this.fedrel = config.get('rel')
    }

    query(query) {
      return new Promise((resolve, reject) => {
        let ep = (new URL('/federation-api/entitystatements', this.baseurl)).toString()
        let links = []
        if (!query.rel) {
          return reject(new Error("Missing parameter rel"))
        }
        if (!query.resource) {
          return reject(new Error("Missing parameter resource"))
        }
        if (query.resource === this.config.get('issuer')) {

          links.push({
            "rel": this.fedrel,
            "href": ep
          })
        }
        if (!this.statements.hasOwnProperty(query.resource)) {

          return reject(new NotFound("Could not find requested resource. This entity will not issue any entity statments about this entity"))
        }
        if (query.rel === this.fedrel) {
          if (this.statements.hasOwnProperty(query.resource)) {
            links.push({
              "rel": this.fedrel,
              "href": ep + '?entity=' + encodeURIComponent(query.resource)
            })
          }
        }
        return resolve({
          subject: query.resource,
          links
        })
      })
    }

    federationAPI(query) {
      return new Promise((resolve, reject) => {
        let sub = null
        let iss = null

        if (!query.iss) {
          return reject(new NotFound("Missing required parameter [iss]"))
        }
        iss = query.iss
        if (iss !== this.config.get('issuer')) {
          return reject(new NotFound("Unexpected [iss]. This is " + this.config.get('issuer')))
        }
        if (query.sub) {
          sub = query.sub
        } else {
          sub = iss
        }
        if (!this.statements.hasOwnProperty(sub)) {
          console.error("Could not find " + sub)
          return reject(new NotFound("Could not find requested resource. This entity will not issue any entity statments about this entity"))
        }


        let statement
        if (sub === this.config.get('issuer')) {
          statement = this.statements['_']
          statement.jwks = {
            keys: [this.jwks.getJWT('verify', this.config.get('key'))]
          }
        } else {
          statement = this.statements[sub]
        }

        if (statement.hasOwnProperty('_jwk')) {
          statement.jwks = {
            keys: [this.jwks.getJWT('verify', statement['_jwk'])]
          }
          delete statement['_jwk']
        }

        let es = new jwtfed.EntityStatement()
        es.add(statement)
        es.add({
          iss: iss,
          sub: sub
        })

        if (query.decoded) {
          return resolve(es.getJWT())
        }
        let ess = this.signer.sign(es, this.config.get('key'))
        resolve(ess)

      })
    }
    entitystatement(query) {
      return new Promise((resolve, reject) => {

        let resource
        if (query.entity) {
          resource = query.entity
          if (!this.statements.hasOwnProperty(resource)) {
            console.error("Could not find " + resource)
            return reject(new NotFound("Could not find requested resource. This entity will not issue any entity statments about this entity"))
          }
        } else {
          resource = this.config.get('issuer')
        }
        let statement
        if (resource === this.config.get('issuer')) {
          statement = this.statements['_']
          statement.jwks = {
            keys: [this.jwks.getJWT('verify', this.config.get('key'))]
          }
        } else {
          statement = this.statements[query.entity]
        }

        if (statement.hasOwnProperty('_jwk')) {
          statement.jwks = {
            keys: [this.jwks.getJWT('verify', statement['_jwk'])]
          }
          delete statement['_jwk']
        }

        let es = new jwtfed.EntityStatement()
        es.add(statement)
        es.add({
          iss: this.config.get('issuer'),
          sub: resource
        })

        if (query.decoded) {
          return resolve(es.getJWT())
        }
        let ess = this.signer.sign(es, this.config.get('key'))
        resolve(ess)

      })
    }

}

module.exports = WebFingerAPI
