// Define paths & other variables
var src = 'src/';
var dest = 'build/';
var foundation = 'bower_components/foundation/';

// Paths we read from
var pathsIn = {
    html: src + '**/*.{html,txt}',

    js: src + 'js/**/*.js',
    jsFoundation: foundation + 'js/**/*.js', // js/vendor/ contains updated jquery, fastclick, modernizr, etc...
    jsModernizr: foundation + 'js/vendor/modernizr.js',
    jsJquery: foundation + 'js/vendor/jquery.js',

    sass: src + 'scss/**/*.scss',
    sassFoundation: foundation + 'scss/' // Don't glob because node-sass' includePaths won't understand it
};

// Paths we write to
var pathsOut = {
    html: dest,
    js: dest + 'js/',
    css: dest + 'css/',
};

var gulp = require('gulp');
var util = require('gulp-util');
var stylish = require('jshint-stylish'); // Nice-looking console output when linting
var π = require('gulp-load-plugins')({ camelize: true } ); // All the good names were taken (load everything that matches 'gulp-*' from package.json)

var production = util.env.type === 'dist'; // Set production mode


// Copy html/etc
gulp.task('html', function() {
    gulp.src(pathsIn.html)
        .pipe(gulp.dest(pathsOut.html));
});


// Compile & minify sass
gulp.task('sass', function() {
    gulp.src(pathsIn.sass)
        .pipe(π.sass({
            includePaths: [pathsIn.sassFoundation],
            outputStyle: 'nested'
        }))
        .pipe(production ? π.autoprefixer().pipe(π.csso()) : util.noop()) // Minify, optimize and prefix if production
        .pipe(gulp.dest(pathsOut.css));
});


// Concatenate & minify JS
gulp.task('js', function() {
    gulp.src([pathsIn.jsFoundation, pathsIn.js, '!' + pathsIn.jsModernizr, '!' + pathsIn.jsJquery]) // Modernizr and jquery load separately, Foundation loads before app.js
        .pipe(π.concat('app.js'))
        .pipe(production ? π.uglify() : util.noop()) // Minify with uglifyjs2
        .pipe(gulp.dest(pathsOut.js));

    gulp.src([pathsIn.jsModernizr, pathsIn.jsJquery]) // Copy modernizr & jquery
        .pipe(production ? π.uglify() : util.noop())
        .pipe(gulp.dest(pathsOut.js));
});


// Lint JS with jshint
gulp.task('lint', function() {
    gulp.src([pathsIn.js, 'Gulpfile.js'])
        .pipe(π.jshint({
            'jquery': true,
            'camelcase': true
        }))
        .pipe(π.jshint.reporter(stylish));
});


// Build task
gulp.task('build', ['lint', 'js', 'sass', 'html']);

// Default (watch) task
gulp.task('default', ['build'], function() {
    gulp.watch([pathsIn.sass, pathsIn.sassFoundation], ['sass']);

    gulp.watch([pathsIn.js, pathsIn.jsFoundation], ['lint', 'js']);

    gulp.watch([pathsIn.html], ['html']);
});