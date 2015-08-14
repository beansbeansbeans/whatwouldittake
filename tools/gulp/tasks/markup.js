var gulp = require('gulp'),
  gutil = require('gulp-util'),
  handlebars = require('gulp-compile-handlebars'),
  config = require('../config'),
  parseArgs = require('minimist')(process.argv.slice(2)),
  gitState = require('../util/gitRevisionState'),
  handleErrors = require('../util/handleErrors');

gulp.task('markup', [], function() {
  // gutil.log(gutil.colors.yellow('[ Dom ]'));
  var buildMode = parseArgs['_'][0] === 'build';

  var templateData = {
      base_api_url:  (parseArgs.local_api === true) ? config.local_api : (parseArgs['_'][0] === 'build') ? config.build_api : config.test_api,
      base_url: buildMode ? config.cdn_url : '/',
      react_url: '//cdnjs.cloudflare.com/ajax/libs/react/0.13.1/react-with-addons' + (buildMode && '.min' || '') + '.js',
      GIT_REVISION:   gitState.options.revState
    },
    templateOptions = {
      batch:      [config.sources.markup.watchFolder]
    };

  return   gulp.src(config.targets.markup.bundleFileName)
      .pipe(handlebars(templateData, templateOptions))
      .on('error', handleErrors)
      .pipe(gulp.dest(config.buildDir));
});
