//
// FUNCTIONS just keepin it dry
//

// Error handling
function doTask(streams) {
    streams.on('error', function(err) {
        console.warn(err.message);
    });
    return streams; // Return a stream and now we're in sync
}

// Returns a concat'ed array of paths. Use this instead of declaring arrays in case we need an array within an array
function paths() {
    var args = Array.prototype.slice.call(arguments, 0);
    var finalPaths = [];
    args.forEach(function(element) { finalPaths = finalPaths.concat(element) });
    return finalPaths; // Returns ['array', 'of', 'paths']
}

//
//  PATHS bear with me here
//

var src = 'src/';
var dest = 'build/';
var bower = 'bower_components/';
var foundation = bower + 'foundation/';

// Paths we read from
var pathsIn = {
    html: src + '**/*.{html,txt}',

    js: src + 'js/**/*.js',

    sass: src + 'scss/**/*.scss',
    sassFoundation: foundation + 'scss/', // Don't glob because sass loadPath won't understand it
    sassBourbon: bower + 'bourbon/app/assets/stylesheets/' // Same thing ^^
};
pathsIn.jsInc = paths(foundation + 'js/vendor/modernizr.js', foundation + 'js/vendor/jquery.js'); // All separate JS includes
pathsIn.noJsInc = ['!' + foundation + 'js/foundation.min.js'];
pathsIn.jsInc.forEach(function(element) { pathsIn.noJsInc.push('!' + element); }); // Used for filtering out everything in jsInc
pathsIn.jsAll = paths(foundation + 'js/**/*.js', pathsIn.js, bower + 'instantclick/instantclick.js'); // Note that Foundation is before our main js

// Paths we write to
var pathsOut = {
    html: dest,
    js: dest + 'js/',
    css: dest + 'css/',
};

//
// VARIABLES what's left of them
//

// Gulp plugins
var gulp = require('gulp');
var util = require('gulp-util');
var π = require('gulp-load-plugins')({ camelize: true } ); // Load everything that matches 'gulp-*' from package.json (has issues loading some plugins, such as gulp-util)

// Other Nodejs packages
var browserSync = require('browser-sync'); // Livereload, etc
var combine = require('stream-combiner'); // Error handling
var es = require('event-stream');
var stylish = require('jshint-stylish'); // Nice-looking console output when linting

var production = util.env.type === 'dist'; // Set production mode

//
// TASKS now let's do things
//

// Copy html/etc
gulp.task('html', function() {
    return doTask(combine(
        gulp.src(pathsIn.html),
        π.newer(pathsOut.html), // Only returns changed files
        gulp.dest(pathsOut.html)
    ));
});

// Compile & minify sass
gulp.task('sass', function() {
    return doTask(combine(
        gulp.src(pathsIn.sass), // We can't use π.newer() because (1) sass maps multiple files into less files and (2) a sass partial can change without the main file
        π.rubySass({
            loadPath: paths(pathsIn.sassFoundation, pathsIn.sassBourbon),
            style: 'nested',
            quiet: true // Deprecation warnings on Foundation will cause compile to fail
        }),
        production ? π.autoprefixer('last 2 versions').pipe(π.csso()) : util.noop(), // Prefix, minify and optimize if production
        gulp.dest(pathsOut.css)
    ));
});

// Concatenate & minify JS. Since we're dealing with two streams we can't just return a stream to stay in sync, so we callback once both streams end.
gulp.task('js', function(cb) {
    var oneDone = false; // True when one stream has finished writing

    doTask(combine(
        gulp.src(paths(pathsIn.jsAll, pathsIn.noJsInc)), // Don't concate separate js includes
        π.newer(pathsOut.js + 'app.js'), // If dest is a single file, gulp-newer uses many:1 mapping and returns all files
        π.concat('app.js'),
        production ? π.uglify() : util.noop(), // Minify with uglifyjs2
        gulp.dest(pathsOut.js),
        es.wait(function() { oneDone ? cb() : oneDone = true }) // If the other stream is finished, callback. Otherwise set oneDone = true
    ));

    doTask(combine(
        gulp.src(pathsIn.jsInc),
        π.newer(pathsOut.js),
        production ? π.uglify() : util.noop(),
        gulp.dest(pathsOut.js),
        es.wait(function() { oneDone ? cb() : oneDone = true })
    ));

});

// Lint JS with jshint
gulp.task('lint', function() {
    return doTask(combine(
        gulp.src(paths(pathsIn.js)),
        π.jshint({
            'jquery': true, // This is why we use π instead of $
            'camelcase': true
        }),
        π.jshint.reporter(stylish)
    ));
});

// Build task
gulp.task('build', ['lint', 'js', 'sass', 'html']);

// Default (watch) task
gulp.task('default', ['build'], function() {
    gulp.watch(paths(pathsIn.sass, pathsIn.sassFoundation + '**/*.scss', pathsIn.sassBourbon + '**/*.scss'), ['sass']);

    gulp.watch(pathsIn.jsAll, ['lint', 'js']);

    gulp.watch(pathsIn.html, ['html']);

    browserSync.init(dest + '**/*', {
        server: {
            baseDir: dest
        },
        //reloadDelay: 1000, // Set in ms if needed
        open: true // Don't automatically open browser
    });
});