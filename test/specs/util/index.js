define('specs/util/index.js', [
    './path/task.js',
    'test.js'
], function (require, exports, module) {
    var test = require('test.js');

    module.exports = test.taskList('Util', [
        require('./path/task.js')
    ]);
});