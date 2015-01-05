define('specs/util/path/task.js', ['test.js'], function (require, exports, module) {
    var test = require('test.js');
    G.config({
        version: {
            "specs/util/path/a.js": 123456
        },
        map: [
            [/^(.*?\/(specs\/.*)(\.(js|css)))$/i, function (match, url, id, ext) {
                var now = Date.now();
                var version = G.config('version')[id + ext];
                if (!version) {
                    version = now - now % (G.config('expire') || 86400);
                }

                return url + '?v=' + version;
            }]
        ]
    });

    module.exports = test.task('util.path.map', function (done) {
        require.async('./a.js', function () {

        });
        test.assert(/\.js\?v=123456$/.test(G.Module.cache['specs/util/path/a.js'].url), 'version appended');
        done();
    });
});