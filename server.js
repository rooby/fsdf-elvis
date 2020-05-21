process.env.NO_PROXY = "localhost";

var SERVICES_ROOT = "http://www.ga.gov.au/explorer-web";

var config = require("./lib/config");
var express = require("express");
var bodyParser = require('body-parser');

var fs = require("fs");
var os = require('os');
var request = require('request');
var mappers = require("./lib/mapper-picker");

// For positioning. We need a token
var Token = require("./lib/token");
var token = new Token(config.fmeToken);


request.gzip = false;

//var httpProxy = require('http-proxy');
var app = express();
//app.use(bodyParser.json({limit: '50mb'}));

app.use(function(req, res, next) {
   // service uses pipes and body parser reads the stream and closes it.
   if(req.url.indexOf("/service/") === 0) {
       return next();
   } else {
       bodyParser.json({limit: '30mb'})(req,res,next);
   }
});


var url = require('url');
var X2JS = require('x2js');

// A bit ugly but we will get rid of it soon.
var TOUCHPATH = "/home/ec2-user/touched/touched";

var StringDecoder = require('string_decoder').StringDecoder;
var yargs = require('yargs').options({
    'port': {
        'default': 3000,
        'description': 'Port to listen on.'
    },
    'public': {
        'type': 'boolean',
        'description': 'Run a public server that listens on all interfaces.'
    },
    'upstream-proxy': {
        'description': 'A standard proxy server that will be used to retrieve data.  Specify a URL including port, e.g. "http://proxy:8000".'
    },
    'bypass-upstream-proxy-hosts': {
        'description': 'A comma separated list of hosts that will bypass the specified upstream_proxy, e.g. "lanhost1,lanhost2"'
    },
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'description': 'Show this help.'
    }
});
var argv = yargs.argv;
var port = process.env.PORT || argv.port;
var dontProxyHeaderRegex = /^(?:Host|Proxy-Connection|Accept-Encoding|Connection|Keep-Alive|Transfer-Encoding|TE|Trailer|Proxy-Authorization|Proxy-Authenticate|Upgrade)$/i;
// There should only ever be a couple. We do a contains on the requested host.
var validHosts = config.validHosts;
var upstreamProxy = argv['upstream-proxy'];

// eventually this mime type configuration will need to change
// https://github.com/visionmedia/send/commit/d2cb54658ce65948b0ed6e5fb5de69d022bef941
var mime = express.static.mime;
mime.define({
    'application/json': ['czml', 'json', 'geojson', 'topojson'],
    'model/vnd.gltf+json': ['gltf'],
    'model/vnd.gltf.binary': ['bgltf'],
    'text/plain': ['glsl']
});

// serve static files
app.use(express.static("dist"));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.all('/service/*', function (req, res, next) {
    var method, r;

    method = req.method.toLowerCase();

    console.log("URL: " + method + " " + SERVICES_ROOT + req.url);

    switch (method) {
        case "get":
            r = request.get({
                uri: SERVICES_ROOT + req.url,
                json: req.body
            });
            break;
        case "put":
            r = request.put({
                uri: SERVICES_ROOT + req.url,
                json: req.body
            });
            break;
        case "post":
            r = request.post({
                uri: SERVICES_ROOT + req.url,
                json: req.body
            });
            break;
        case "delete":
            r = request.del({
                uri: SERVICES_ROOT + req.url,
                json: req.body
            });
            break;
        default:
            return res.send("invalid method");
    }
    return req.pipe(r).pipe(res);
});

/*
 * Initiate jobs on FME server.
 *
*/

let privateKey = config.elevation.recaptchaPrivateKey;
let recaptcha = new (require("./lib/recaptcha"))(privateKey);
let serviceBroker = new (require("./lib/serviceBroker"))(config.elevation);

app.post('/elevation/initiateJob', function (req, res, next) {
   let data = req.body;

   //console.log("initiate job: " + JSON.stringify(data, null, 3));

   recaptcha.verify(req.connection.remoteAddress, data.parameters.recaptcha, function(error, response, body) {
      if(!error) {
         delete data.parameters.recaptcha;
         serviceBroker.execute(data).then(message => {
            res.status(200).send(message);
         });
      } else {
         res.status(403).send(body);
      }
   });
});

app.get('/refreshToken', function(req, res) {
   token.refresh().then((data) => {
      res.header({
         "Content-Type": "application/json;charset=UTF-8"
      });
      res.status(200).send(data);
   });
});

app.get('/token', function(req, res) {
   token.value.then((data) => {
      res.header({
         "Content-Type": "application/json;charset=UTF-8"
      });
      res.status(200).send(data);
   });
});

// This doesn't refresh Solr straight away. It simply touches a file and it is up to something else to react to the touch
app.get('/touch', function(req, res) {
   fs.closeSync(fs.openSync(TOUCHPATH, 'w'));
   res.header({
      "Content-Type": "application/json;charset=UTF-8"
   });
   res.status(200).send({status: "success"});
});

const REFERERS = {localhost: true, "elevation.": true};

app.get('/wms/*', function (req, res, next) {
   console.log(req.headers.referer);


});

app.get('/xml2js/*', function (req, res, next) {
    // look for request like http://localhost:8080/proxy/http://example.com/file?query=1
    var remoteUrl = getRemoteUrlFromParam(req);
    if (!remoteUrl) {
        // look for request like http://localhost:8080/proxy/?http%3A%2F%2Fexample.com%2Ffile%3Fquery%3D1
        remoteUrl = Object.keys(req.query)[0];
        if (remoteUrl) {
            remoteUrl = url.parse(remoteUrl);
        }
    }

    if (!remoteUrl) {
        return res.status(400).send('No url specified.');
    }

    // We only want a very few requests to get through. Via the whitelist.
    var host = remoteUrl.host;
    if (!validHosts.some((valid) => {
        return host.indexOf(valid) > -1;
    })) {
        return res.status(403).send('Not a white listed host. Go away!');
    }

    if (!remoteUrl.protocol) {
        remoteUrl.protocol = 'http:';
    }

    var proxy;
    if (upstreamProxy && !(remoteUrl.host in bypassUpstreamProxyHosts)) {
        proxy = upstreamProxy;
    }

    // encoding : null means "body" passed to the callback will be raw bytes

    request.get({
        url: url.format(remoteUrl),
        headers: filterHeaders(req, req.headers),
        encoding: null,
        proxy: proxy
    }, function (error, response, body) {
        var code = 500;
        var x2js, text, headers, decoder = new StringDecoder('utf8');
        if(error) {
            console.log("Err", error);
        }
        if (body) {
            code = response.statusCode;
            headers = filterHeaders(req, response.headers);
            headers['Content-Type'] = 'application/json';
            res.header(headers);
            text = body.toString();
            x2js = new X2JS();
            res.status(code).send(x2js.xml2js(body.toString()));
        } else {
            console.log("No body!")
            res.status(code).send('{"error":{"code": ' + code + '}}');
        }
    });
});


app.get('/gazetteer/json', function (req, res, next) {
   console.log(JSON.stringify(req.params));
   let id = req.param("id");

   let mapper = mappers.findById(id);

   let url = mapper.createPath(id);


    request.get({
        url: url,
        headers: filterHeaders(req, req.headers),
        encoding: null
    }, function (error, response, body) {
        var code = response.statusCode;
        var x2js, text, headers, decoder = new StringDecoder('utf8');
        if(error) {
            console.log("Err", error);
        }
        if (code === 200) {
            headers = filterHeaders(req, response.headers);
            headers['Content-Type'] = 'application/json';
            res.header(headers);
            text = body.toString();
            x2js = new X2JS();
            res.status(code).send(mapper.transform(x2js.xml2js(text)));
        } else {
            console.log("No body!")
            res.status(code).send('{"error":{"code": ' + code + '}}');
        }
    });
});


app.get('/gazetteer/wfs', function (req, res, next) {
   let id = req.param("id");
   let mapper = mappers.findById(id);

   let url = mapper.createPath(id);


    request.get({
        url: url,
        headers: filterHeaders(req, req.headers),
        encoding: null
    }, function (error, response, body) {
        var code = 500;
        var text, headers, decoder = new StringDecoder('utf8');
        if(error) {
            console.log("Err", error);
        }
        if (body) {
            code = response.statusCode;
            headers = filterHeaders(req, response.headers);
            headers['Content-Type'] = 'application/xml';
            res.header(headers);
            text = body.toString();
            res.status(code).send(text);
        } else {
            console.log("No body!")
            res.status(code).send('{"error":{"code": ' + code + '}}');
        }
    });
});

// This works on my local machine for development as I have a Solr instance on a Linux box
// but it is to be expected that it will not be hit in production so doesn't need changing
// as proxying via the apache proxy will intercept and route the request to the local Solr instance.
app.get('/select', function(req, res, next) {
   var remoteUrl = req.url;
   // let wholeUrl = "http://web.geospeedster.com" +  remoteUrl;
   // let wholeUrl = "http://192.168.0.24:8983/solr/placenames" + remoteUrl;
   let wholeUrl = "http://placenames.fsdf.org.au" + remoteUrl;
   console.log(wholeUrl);


   request.get({
       url: wholeUrl,
       headers: filterHeaders(req, req.headers),
       encoding: null
   }, function (error, response, body) {
       var code = 500;

       if (response) {
           code = response.statusCode;
           res.header(filterHeaders(req, response.headers));
       }

       res.status(code).send(body);
   });
});

app.get('/proxy/*', function (req, res, next) {
    // look for request like http://localhost:8080/proxy/http://example.com/file?query=1

    var remoteUrl = getRemoteUrlFromParam(req);
    if (!remoteUrl) {
        // look for request like http://localhost:8080/proxy/?http%3A%2F%2Fexample.com%2Ffile%3Fquery%3D1
        remoteUrl = Object.keys(req.query)[0];
        if (remoteUrl) {
            remoteUrl = url.parse(remoteUrl);
        }
    }

    if (!remoteUrl) {
        return res.status(400).send('No url specified.');
    }

    // We only want a very few requests to get through. Via the whitelist.
    var host = remoteUrl.host;
    if (!validHosts.some((valid) => {
        return host && host.indexOf(valid) > -1;
    })) {
        return res.status(403).send('Not a white listed host. Go away!');
    }

    if (!remoteUrl.protocol) {
        remoteUrl.protocol = 'http:';
    }

    var proxy;
    if (upstreamProxy && !(remoteUrl.host in bypassUpstreamProxyHosts)) {
        proxy = upstreamProxy;
    }

    // encoding : null means "body" passed to the callback will be raw bytes

    request.get({
        url: url.format(remoteUrl),
        headers: filterHeaders(req, req.headers),
        encoding: null,
        proxy: proxy
    }, function (error, response, body) {
        var code = 500;

        if (response) {
            code = response.statusCode;
            res.header(filterHeaders(req, response.headers));
        }

        res.status(code).send(body);
    });
});

app.listen(port, function (err) {
    console.log("running server on port " + port);
});


function getRemoteUrlFromParam(req) {
    var remoteUrl = req.params[0];
    if (remoteUrl) {
        // add http:// to the URL if no protocol is present
        if (!/^https?:\/\//.test(remoteUrl)) {
            // Now double slashes are removed on some URL's by some servers (which is the right behaviour)
            if (!/^https?:\//.test(remoteUrl)) {
               remoteUrl = 'http://' + remoteUrl;
            } else {
               remoteUrl = remoteUrl.replace(":/", "://");
            }
        }
        remoteUrl = url.parse(remoteUrl);
        // copy query string
        remoteUrl.search = url.parse(req.url).search;
    }
    return remoteUrl;
}

function filterHeaders(req, headers) {
    var result = {};
    // filter out headers that are listed in the regex above
    Object.keys(headers).forEach(function (name) {
        if (!dontProxyHeaderRegex.test(name)) {
            result[name] = headers[name];
        }
    });
    return result;
}