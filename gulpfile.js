/* DON'T FORGET:
tasks are async
any edits to includes in ./src may be lost */

// Define paths and other variables
var src = 'src/';
var dest = 'build/';

// Paths we read from
var pathsIn = {
    img: src + 'img/',
    js: src + 'js/**/*.js',
    sass: src + 'scss/**/*.scss',

    sassIncludes: ['bower_components/foundation/scss/'],
    jsIncludes: 'bower_components/foundation/js/**/*.js' // foundation/js/vendor includes jquery, modernizr, fastclick...
};

// Paths we write to
var pathsOut = {
    img: dest + 'img/',
    js: dest + 'js/',
    css: dest + 'css/',
};

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({ camelize: true } ); // Load everything in package.json that matches "gulp-*"


// Lint JS with jshint
gulp.task('lint', function() {
    gulp.src(pathsIn.js)
        .pipe($.jshint())
        .pipe($.jshint.reporter('default'));
});


// Compile & minify sass
gulp.task('sass', function() {
    gulp.src(pathsIn.sass)
        .pipe($.sass({ includePaths: pathsIn.sassIncludes }))
        .pipe(gulp.dest(pathsOut.css))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.csso()) // Minify and optimize with csso
        .pipe(gulp.dest(pathsOut.css));
});


// Concatenate & minify JS
gulp.task('js', function() {
    gulp.src([pathsIn.js, pathsIn.jsIncludes])
        .pipe($.concat('app.js'))
        .pipe(gulp.dest(pathsOut.js))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.uglify()) // Minify with uglify.js
        .pipe(gulp.dest(pathsOut.js));
});


// Default Task
gulp.task('default', ['lint', 'sass', 'js']);