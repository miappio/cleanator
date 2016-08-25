var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var cheerio = require('gulp-cheerio');
var preprocess = require('gulp-preprocess');
var gettext = require('gulp-angular-gettext');


var paths = {
  sass: ['./scss/**/*.scss']
  ,config: ['./package.json','./.config.js']
  ,html: ['./www/views/**/*.html']
};



gulp.task('nggettext_extract', function () {
  return gulp.src(['www/views/**/*.html'])
    .pipe(gettext.extract('template.pot', {
      // options to pass to angular-gettext-tools...
    }))
    .pipe(gulp.dest('po/'));
});

gulp.task('nggettext_compile', function () {
  return gulp.src('po/**/*.po')
    .pipe(gettext.compile({
      // options to pass to angular-gettext-tools...
      format: 'json'
    }))
    .pipe(gulp.dest('www/js/languages/'));
});


gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});


gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});


gulp.task('config', function () {
  return gulp.src(['config.xml'])
    .pipe(cheerio({
      run: function ($) {
        // get the version number from package.json
        $('widget').attr('version', require('./package').version);
        $('name').text(require('./package').name);
        $('description').text(require('./package').description);
        $('author').text(require('./package').author);
        $('author').attr('email', require('./package').author);
        $('author').attr('href', require('./package').homepage);

        // in development launch the app with a different html file
        //$('content').attr('src', process.env.NODE_ENV == 'development' ? 'debug.html' : 'index.html');

      },
      parserOptions: {
        xmlMode: true
      }
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('config-html', function () {
  return gulp.src(['www/index.html'])
    .pipe(cheerio({
      run: function ($) {
        $('version').text('v'+require('./package').version);
      },
      parserOptions: {
        xmlMode: true
      }
    }))
    .pipe(gulp.dest('./www/'));
});

gulp.task('config-www', function () {
  return gulp
  .src(".config.js")
  .pipe(preprocess(({context: { 
        PACKAGE_JSON_VERSION: require('./package').version, 
        PACKAGE_JSON_NAME: require('./package').name
    
    }})))
  .pipe(gulp.dest("./www/js/config/"));
});

/**
 * Defaut & Watch
 */

gulp.task('default', ['sass','config','config-www','nggettext_extract','nggettext_compile']);

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.config, ['config','config-www']);
  gulp.watch(paths.html, ['nggettext_extract','nggettext_compile']);
});
