/**
 * Module dependencies.
 */
env = process.env.NODE_ENV || 'production';
var config = require("./mobileweb/config")[env];
var express = require('express')
  , graceful = require('graceful')
  ,  user = require('./proxy/weixin/user.js')
  , fs = require('fs')
  , url = require('url')
  , http = require('http')
  , xss = require('xss')
  , path = require('path')
  , report = require("./utility/report")

var _process = {};
resource = require('./mobileweb/init');
resource.do();


var app = express();
var checkHeader = require("./utility").checkHeader;
var processRoutes_path = __dirname + "/mobileweb/routes";
fs.readdirSync(processRoutes_path).forEach(function (dir) {
    var _tempPath = processRoutes_path + '/' + dir;
    var _type = dir;
    _process[_type] = {};
    fs.readdirSync(_tempPath).forEach(function(dir){
        var __tempPath = _tempPath + '/' + dir;
        var __type = dir;
        _process[_type][__type] = {};
        fs.readdirSync(__tempPath).forEach(function(file){
            var ___tempPath = __tempPath + '/' + file;
            var ___temp = require(___tempPath);
            if (!!___temp.name) {
                console.log("loading:" + _type + "/" + __type + "/" + ___temp.name);
                _process[_type][__type][___temp.name] = ___temp.run;
            }
        });
    });
});

provider = {
    name: "微信通",
    url: 'http://gfy.com'
};
app.set('views', __dirname + '/mobileweb/views');
app.set('view engine', 'ejs');
app.set('view cache', false);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('e7ax1976'));
app.use(express.session());
app.use(app.router);

app.use('/mobileweb',function(req, res, next){

    if (!checkHeader(req.header("user-agent"))) {
         return res.send("gfy");
    }
    console.log(req.url);
    var visitor = url.parse(req.url, true, true);

    var pathname = visitor.pathname;


    var directorList = pathname.split('/');
    if (directorList[0] != '') {
        return res.send("孙长老收了神通吧");
    }
    directorList.shift();
    var businessUser = directorList.shift();
    req.businessUser = businessUser;
    req.local_domain = config.local_domain;
    req.resource_domain = config.resource_domain;
    try {

        if (typeof _process[directorList[0]][directorList[1]][directorList[2]] == 'function') {
            if ((!!visitor.query.c)  && (!!visitor.query.w) && (!!visitor.query.a)   && (!!visitor.query.u)) {
                //code
                req.c = xss(visitor.query.c);
                //wuid
                req.w = (xss(visitor.query.w)) >>> 0;
                //activity_id
                req.a = (xss(visitor.query.a)) >>> 0;
                //userid
                req.u = (xss(visitor.query.u)) >>> 0;


                return _process[directorList[0]][directorList[1]][directorList[2]](req, res, next);
            } else {
                return report.errResponseByHtml(req, res, new Error("paramer error"));
            }
        } else {
            return report.errResponseByHtml(req, res, new Error("route is not a function"));
        }
    } catch (e) {
        return report.errResponseByHtml(req, res, e);
        return res.send("孙长老收了神通吧!");
    }
});
var server = http.createServer(app);
server.close = function () {};
var worker = require( 'pm').createWorker();
graceful({
    server: server,
    worker: worker,
    error: function (err) {
        return report.errResponseByXml({body:undefined},undefined,{message:err.stack});
    },
    killTimeout: 1000
});
worker.ready(function(socket, which) {
    server.emit('connection', socket);
});

//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});
