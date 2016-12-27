
http = require 'http'
url = require 'url'

app = http.createServer (req, res) ->

  body = ''
  req.on 'data', (chunk) -> body += chunk
  req.on 'end', -> console.log '\nBody:', body

  queryData = url.parse(req.url, true).query
  res.setHeader 'Access-Control-Allow-Origin', req.headers.origin
  res.setHeader 'Access-Control-Allow-Credentials', 'true'
  res.setHeader 'Access-Control-Allow-Headers', 'Content-Type'
  console.log '\nQuery:', queryData
  console.log '\nHeaders:', req.headers
  res.end 'something'

app.listen 3000
console.log 'Listening on 3000.'
