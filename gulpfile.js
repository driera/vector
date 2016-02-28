'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var nano = require('gulp-cssnano');
var $ = require('gulp-load-plugins')();

var frontendFolder = 'app/';
var webAssetsFolder = 'app/';

var onError = function(err) {
  $.notify.onError({
    title: 'Gulp',
    subtitle: '¡Error!',
    message: '<%= error.message %>'
  })(err);
  this.emit('end');
};

gulp.task('sass', function() {
  return gulp.src(frontendFolder + 'styles/styles.scss')
    .pipe($.sourcemaps.init())
    .pipe($.plumber({
        errorHandler: onError
    }))
    .pipe($.sass({
        onError: function() {
          return console.error.bind(console, 'Sass error:');
        }
    }))
    .pipe($.autoprefixer())
    .pipe(nano())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(webAssetsFolder + ''))
    .pipe($.livereload());
});

gulp.task('fonts', function() {
    return gulp.src(['node_modules/**/*.{eot,svg,ttf,woff,woff2}'])
        .pipe($.flatten()).pipe(gulp.dest(webAssetsFolder + 'fonts'));
});

gulp.task('uglify', function() {
    return browserify(frontendFolder + 'scripts/scripts.js')
        .transform("babelify", {presets: ["es2015", "react"]})
        .bundle()
        .on('error', function (err) {
            $.notify.onError({
                title: 'Gulp',
                subtitle: '¡Error!',
                message: '<%= error.message %>'
            })(err);
            this.emit('end');
        })
        .pipe(source('scripts.js'))
        .pipe(buffer())
        .pipe($.uglify())
        .pipe(gulp.dest(webAssetsFolder + ''));
});

gulp.task('browserify', function() {
    return browserify(frontendFolder + 'scripts/scripts.js')
        .transform("babelify", {presets: ["es2015", "react"]})
        .bundle()
        .on('error', function (err) {
            $.notify.onError({
                title: 'Gulp',
                subtitle: '¡Browserify Error!',
                message: '<%= error.message %>'
            })(err);
            this.emit('end');
        })
        .pipe(source('scripts.js'))
        .pipe(gulp.dest(webAssetsFolder + ''))
        .pipe($.livereload());
});

gulp.task('imagemin', function() {
    return gulp.src(webAssetsFolder + 'img/*')
        .pipe($.imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{
                cleanupIDs: false,
                removeViewBox: false
            }]
        }))
        .pipe(gulp.dest(webAssetsFolder + 'img'));
});

gulp.task('watch', function() {
    $.livereload.listen({
        start: true
    });
    gulp.watch(frontendFolder + '**/*.scss', ['sass']);
    gulp.watch('node_modules/*', ['fonts']);
    gulp.watch(frontendFolder + 'scripts/**/*', ['browserify']);

    return gulp.watch(webAssetsFolder + 'img/*', ['imagemin']);
});

gulp.task('default', ['sass', 'browserify', 'watch']);
gulp.task('build', ['sass', 'uglify', 'fonts']);