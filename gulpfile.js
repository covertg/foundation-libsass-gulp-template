// Define paths and other variables
var src = 'src/';
var dest = 'build/';

// Paths we read from
var pathsIn = {
    html: src + '**/*.{html,txt}',
    img: src + 'img/',
    js: src + 'js/**/*.js',
    sass: src + 'scss/**/*.scss',

    sassIncludes: ['bower_components/foundation/scss/'],
    jsIncludes: 'bower_components/foundation/js/**/*.js', // foundation/js/vendor includes jquery, modernizr, fastclick...
    jsModernizr: 'bower_components/foundation/js/vendor/modernizr.js'
};

// Paths we write to
var pathsOut = {
    html: dest,
    img: dest + 'img/',
    js: dest + 'js/',
    css: dest + 'css/',
};

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({ camelize: true } ); // Load everything in package.json that matches "gulp-*"
var jsFilter = $.filter('!' + pathsIn.jsModernizr); // Don't concat modernizr

// Copy html/etc and do includes
gulp.task('html', function() {
    gulp.src(pathsIn.html) // Source all .html and .txt
        .pipe($.cached('html-cache'))
        .pipe($.include()) // Run through gulp-include
        .pipe(gulp.dest(pathsOut.html));
});

// Lint JS with jshint
gulp.task('lint', function() {
    gulp.src(pathsIn.js)
        .pipe($.cached('jsin-cache'))
        .pipe($.jshint())
        .pipe($.jshint.reporter('default'));
});


// Compile & minify sass
gulp.task('sass', function() {
    gulp.src(pathsIn.sass)
        .pipe($.sass({ includePaths: pathsIn.sassIncludes }))
        .pipe($.cached('sass-cache'))
        .pipe(gulp.dest(pathsOut.css))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.csso()) // Minify and optimize with csso
        .pipe(gulp.dest(pathsOut.css));
});


// Concatenate & minify JS
gulp.task('js', function() {
    gulp.src([pathsIn.js, pathsIn.jsIncludes])
        .pipe(jsFilter)
        .pipe($.concat('app.js'))
        .pipe($.cached('jsout-cache'))
        .pipe(gulp.dest(pathsOut.js))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.uglify()) // Minify with uglify.js
        .pipe(gulp.dest(pathsOut.js));
    // Modernizr is separate because we don't lazy load it
    gulp.src(pathsIn.jsModernizr)
        .pipe($.cached('modernizr-cache'))
        .pipe(gulp.dest(pathsOut.js));

});


// Default Task
gulp.task('default', ['lint', 'js', 'sass', 'html']);