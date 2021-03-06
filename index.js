var pluginName = 'gulp-codeclimate-reporter';
var util = require('util');
var gutil = require('gulp-util');
var through2 = require('through2');
var exec = require('mz/child_process').exec;
var merge = require('lodash.merge');
var path = require('path');

module.exports = function ccm(options) {
  options = merge({
    token: null,
    executable: path.join(__dirname, 'node_modules', '.bin', 'codeclimate-test-reporter'),
    verbose: true
  }, options || {});

  return through2.obj(function handleFile(file, encoding, callback) {
    var stream = this;

    if (file.isStream()) {
      stream.emit('error', new gutil.PluginError({
        plugin: pluginName,
        message: 'Streams are not supported.'
      }));

      return callback();
    }

    exec(util.format('CODECLIMATE_REPO_TOKEN=%s %s < "%s"', options.token, options.executable, file.path))
      .then(function execCompleted(stdout, stderr) {
        if (stderr) {
          stream.emit('error', new gutil.PluginError({
            plugin: pluginName,
            message: stderr
          }));

          return callback();
        }

        if (options.verbose) {
          gutil.log('Coverage file posted: "%s"', file.path);
        }

        stream.emit('end');
      })
      .catch(function throwPluginError(err) {
        stream.emit('error', new gutil.PluginError({
          plugin: pluginName,
          message: err.message
        }));

        callback();
      })
    ;
  });
};
