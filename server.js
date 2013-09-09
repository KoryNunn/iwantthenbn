var http = require('http'),
    beeline = require('beeline'),
    port = process.env.PORT || 9000,
    latestData,
    lastCount,
    apiKey = require('./key.json'),
    pollRate = 3000;

function setNoCacheResponse(response){
   response.setHeader("Cache-Control", "no-cache, private, no-store, must-revalidate, max-age=0, max-stale=0, post-check=0, pre-check=0");
   response.setHeader("Pragma", "no-cache");
   response.setHeader("Expires", 0);
}

function updateCount(){
    http.get({
        host: 'api.change.org',
        path: '/v1/petitions/1292760?api_key=' + apiKey.key
    }, function(result) {
        if (result.statusCode === 200) {
            var body = [];
            result.setEncoding('utf8');
            result.on('data', function(chunk) {
                body.push(chunk);
            });
            result.on('end', function() {
                latestData = JSON.parse(body.join(''));
                if(lastCount){
                    latestData.rate = Math.max((latestData.signature_count - lastCount) / (pollRate/1000), 0.1);
                }
                lastCount = latestData.signature_count;
            });
        } else {
            console.log('Received non-ok response: ' + result.statusCode);
        }
    });
}

updateCount();

setInterval(updateCount, pollRate);

var router = beeline.route({
    '/signatures': function(request, response) {
        response.end(JSON.stringify({
            signatureCount:latestData.signature_count,
            rate: latestData.rate
        }));
    },
    '/': function(request, response){
        setNoCacheResponse(response);
        return beeline.staticFile('./public/index.html','text/html', 0)(request, response);
    },
    "/robots /robots.txt":  function(request, response, tokens, values){
        routeHelpers.setNoCacheResponse(response);
        bee.staticFile("./public/robots.txt", "text/plain", 0)(request, response, tokens, values);
    },
    '`path...`': beeline.staticDir('./public', {
        ".txt": "text/plain",
        ".html": "text/html",
        ".css": "text/css",
        ".ico": "image/x-icon",
        ".swf": "application/x-shockwave-flash",
        ".js": "application/javascript" }, 0)
});

var server = http.createServer(router);

server.listen(port);