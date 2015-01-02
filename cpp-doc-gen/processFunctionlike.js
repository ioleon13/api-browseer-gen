var fs = require('fs');
var request = require('request');

var HOST_URL = 'http://www.cplusplus.com';

var options = {
    method: 'GET',
    url: HOST_URL + '/reference/',
    encoding: 'utf8'
};

module.exports = function (functions, callback_) {
    var html_data;
    var final_data;
    var file_name;

    if (functions.length === 0) {
        callback_("The array was empty");
        return;
    }

    var funtionCount = 0;
    parseFunction(functions[0]);
    function parseFunction(function_) {
        options.url = HOST_URL + function_.url;
        console.log('parsing the functionlike page: ' + options.url);

        request(options, function (error, response, body) {
            if (error) {
                return console.error('Failed to request the page: ' + options.url + ', error: ' + error);
            }

            if (!error && response.statusCode === 200) {
                var split_file = function_.url.split('/');
                file_name = split_file[split_file.length-2];
                console.log("save functionlike file: " + file_name + ".html...");

                //get html data and save to html files
                var reStr = '<div\\s.*?class=\"C_supportbottom\"[^>]*><\/div><\/div>([^]*?)<div\\s.*?id=\"I_nav\"[^>]*>';
                var tagRE = new RegExp(reStr, 'gm');
                var tagMatches = body.match(tagRE);
                if (tagMatches && tagMatches.length > 0) {
                    for (var i = 0; i < tagMatches.length; i++) {
                        var valRE = new RegExp(reStr, 'm');
                        var valMatch = tagMatches[i].match(valRE);
                        html_data = valMatch[1];
                        html_data = html_data.replace(/<a href= \".*?\/([^\/]+)\/\"[^>]*><b>/g, '<a href= "$1.html"><b>');
                        html_data = html_data.replace(/<a href=\"\/([^\/]+)\"[^>]*>([^]*?)<\/a>/g, '<a href="$1.html">$2</a>');
                        html_data = html_data.replace(/<a href=\"&lt;([^]*?)&gt;\.html\">([^]*?)<\/a>/g, '<a href="$1.html">$2</a>');
                        final_data = "<!-- single file version -->\n<!DOCTYPE html>\n<html>\n<head>\n  <link href=\"css/main.css\" rel=\"stylesheet\" type=\"text/css\">\n  <meta charset=\"utf-8\" />\n</head>\n<body>" + html_data + "\n</body>\n</html>\n";
                        fs.writeFileSync("CPP-docset/Contents/Resources/Documents/" + file_name + ".html", final_data, 'utf-8');
                    }
                }

                funtionCount++;
                if (funtionCount === functions.length) {
                    callback_(null);
                    return;
                }
                parseFunction(functions[funtionCount]);
            }
        });
    }
}