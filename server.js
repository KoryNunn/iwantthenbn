var http = require('http'),
    beeline = require('beeline'),
    port = process.env.PORT || 9000,
    latestData,
    lastCount,
    pollRate = 3000;

function updateCount(){
    http.get({
        host: 'api.change.org',
        path: '/v1/petitions/1292760?api_key='
    }, function(res) {
        if (res.statusCode === 200) {
            var body = [];
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                body.push(chunk);
            });
            res.on('end', function() {
                latestData = JSON.parse(body.join(''));
                if(lastCount){
                    latestData.rate = Math.max((latestData.signature_count - lastCount) / (pollRate/1000), 0.1);
                }
                lastCount = latestData.signature_count;
            });
        } else {
            console.log('Received non-ok response: ' + res.statusCode);
        }
    });
}

updateCount();

setInterval(updateCount, pollRate);

var router = beeline.route({ // Create a new router
    '/signatures': function(reqest, response) {
        response.end(JSON.stringify({
            signatureCount:latestData.signature_count,
            rate: latestData.rate
        }));
    },
    '/': beeline.staticFile('./public/index.html'),
    '`path...`': beeline.staticDir('./public', {
        ".txt": "text/plain",
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript" })
});

var server = http.createServer(router);

server.listen(port);

console.log("Server running at http://127.0.0.1:8000/");