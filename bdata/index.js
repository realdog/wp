var fs = require('fs');
var content = fs.readFileSync(__dirname + '/data/json', {encoding :'utf8'});
try {
    module.exports = JSON.parse(content);
} catch (e) {
    console.log(e);
}
