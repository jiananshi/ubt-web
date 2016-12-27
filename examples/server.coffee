
http = require 'http'
url = require 'url'

app = http.createServer (req, res) ->
  queryData = url.parse(req.url, true).query
  console.log queryData
  console.log req.headers
  res.end 'something'

app.listen 3000
console.log 'Listening on 3000.'
