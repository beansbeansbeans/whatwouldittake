var gulp = require('gulp'),
  gutil = require('gulp-util'),
  sass = require('gulp-ruby-sass'),
  connect = require('gulp-connect'),
  replace = require('gulp-batch-replace'),
  plumber = require('gulp-plumber'),
  config = require('../config'),
  gitState = require('../util/gitRevisionState'),
  handleErrors = require('../util/handleErrors');

gulp.task('sass', [], function() {
  return doSass(false);
});

gulp.task('watchSass', [], function() {
  return doSass(true);
});

function doSass(watch) {
  // gutil.log(gutil.colors.yellow('[ Sass ]'));
  if(watch) {
    return  gulp.src(config.sources.sass.watchSource)
        .pipe(plumber({ errorHandler: handleErrors }))
        .pipe(sass({ compass: true, style: "expanded", sourcemap: false }))
        .pipe(replace(gitState.getMap()))
        .pipe(gulp.dest(config.targets.sass.bundleDir))
        .pipe(gulp.dest(config.buildAssetsDir + '/css'))
        .pipe(connect.reload());
  } else {
    return  gulp.src(config.sources.sass.watchSource)
        .pipe(plumber({ errorHandler: handleErrors }))
        .pipe(sass({ compass: true, style: "expanded", sourcemap: false }))
        .pipe(replace(gitState.getMap()))
        .pipe(gulp.dest(config.targets.sass.bundleDir))
        .pipe(gulp.dest(config.buildAssetsDir + '/css'));
  }
};
