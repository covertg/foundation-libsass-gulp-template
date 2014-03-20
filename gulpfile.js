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
var browserSync = require('browser-sync');
var π = require('gulp-load-plugins')({ camelize: true } ); // Load everything that matches 'gulp-*' from package.json (all the good names were taken)

var production = util.env.type === 'dist'; // Set production mode


// Copy html/etc
gulp.task('html', function() {
    gulp.src(pathsIn.html)
        .pipe(π.cached('html-cache')) // Only returns changed files. We can't do this with js concat or sass because they map lots of files into one
        .pipe(gulp.dest(pathsOut.html));
});


// Compile & minify sass
gulp.task('sass', function() {
    gulp.src(pathsIn.sass)
        .pipe(π.sass({
            includePaths: [pathsIn.sassFoundation],
            outputStyle: 'nested'
        }))
        .pipe(production ? π.autoprefixer('last 2 versions').pipe(π.csso()) : util.noop()) // Minify, optimize and prefix if production
        .pipe(gulp.dest(pathsOut.css));
});


// Concatenate & minify JS
gulp.task('js', function() {
    gulp.src([pathsIn.jsFoundation, pathsIn.js, '!' + pathsIn.jsModernizr, '!' + pathsIn.jsJquery]) // Modernizr and jquery load separately, Foundation loads before app.js
        .pipe(π.concat('app.js'))
        .pipe(production ? π.uglify() : util.noop()) // Minify with uglifyjs2
        .pipe(gulp.dest(pathsOut.js));

    gulp.src([pathsIn.jsModernizr, pathsIn.jsJquery]) // Copy modernizr & jquery
        .pipe(π.cached('js-cache'))
        .pipe(production ? π.uglify() : util.noop())
        .pipe(gulp.dest(pathsOut.js));
});


// Lint JS with jshint
gulp.task('lint', function() {
    gulp.src([pathsIn.js, 'Gulpfile.js'])
        .pipe(π.cached('lint-cache'))
        .pipe(π.jshint({
            'jquery': true,
            'camelcase': true
        }))
        .pipe(π.jshint.reporter(stylish));
});

// Cross-device livereload and actions sync (i.e scrolling, clicking, ...)
gulp.task('browser-sync', function() {
    browserSync.init(dest + '**/*', {
        server: {
            baseDir: dest
        },
        //reloadDelay: 1000, // Set in ms if needed
        open: false // Don't automatically open browser
    });
});


// Build task
gulp.task('build', ['lint', 'js', 'sass', 'html']);

// Default (watch) task
gulp.task('default', ['browser-sync', 'build'], function() {
    gulp.watch([pathsIn.sass, pathsIn.sassFoundation + '**/*.scss'], ['sass']);

    gulp.watch([pathsIn.js, pathsIn.jsFoundation], ['lint', 'js']);

    gulp.watch([pathsIn.html], ['html']);
});