//
// PATHS, VARIABLES, FUNCTIONS...
//

// Paths
var src = 'src/';
var dest = 'build/';
var bower = 'bower_components/';
var foundation = bower + 'foundation/';

// Paths we read from
var pathsIn = {
    html: src + '**/*.{html,txt}',

    js: src + 'js/**/*.js',
    jsFoundation: foundation + 'js/**/*.js', // js/vendor/ contains updated jquery, fastclick, modernizr, etc...
    jsModernizr: foundation + 'js/vendor/modernizr.js',
    jsJquery: foundation + 'js/vendor/jquery.js',
    jsInstantClick: bower + 'instantclick/instantclick.js',

    sass: src + 'scss/**/*.scss',
    sassFoundation: foundation + 'scss/', // Don't glob because sass loadPath won't understand it
    sassBourbon: bower + 'bourbon/app/assets/stylesheets' // Same thing ^^
};
pathsIn.jsInc = [pathsIn.jsModernizr, pathsIn.jsJquery]; // All JS includes
pathsIn.noJsInc = ['!' + pathsIn.jsModernizr, '!' + pathsIn.jsJquery]; // Use array.forEach() if you have many separate includes

// Paths we write to
var pathsOut = {
    html: dest,
    js: dest + 'js/',
    css: dest + 'css/',
};

// Gulp plugins
var gulp = require('gulp');
var util = require('gulp-util');
var π = require('gulp-load-plugins')({ camelize: true } ); // Load everything that matches 'gulp-*' from package.json (all the good names were taken)

// Other Nodejs packages
var browserSync = require('browser-sync'); // Livereload, etc
var combine = require('stream-combiner'); // Error handling
var es = require('event-stream');
var stylish = require('jshint-stylish'); // Nice-looking console output when linting

// Vars n funcs
var production = util.env.type === 'dist'; // Set production mode

// Keeping the error handling DRY
function doTask(streams) {
    streams.on('error', function(err) {
        console.warn(err.message);
    });
    return streams; // Return a stream and now we're in sync
}

//
// TASKS
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
        gulp.src(pathsIn.sass),
        π.rubySass({
            loadPath: [pathsIn.sassFoundation, pathsIn.sassBourbon],
            style: 'nested',
            quiet: true // Deprecation warnings on Foundation will cause compile to fail
        }),
        production ? π.autoprefixer('last 2 versions').pipe(π.csso()) : util.noop(), // Prefix, minify and optimize if production
        gulp.dest(pathsOut.css)
    ));
});

// Concatenate & minify JS
gulp.task('js', function(cb) {
    var oneDone = false; // True when one stream has finished writing

    var main = doTask(combine(
        gulp.src([pathsIn.jsFoundation, pathsIn.js, pathsIn.jsInstantClick].concat(pathsIn.noJsInc)), // Concat Foundation before app.js, ignore separate includes
        π.newer(pathsOut.js + 'app.js'), // If dest is a single file, gulp-newer uses many:1 mapping
        π.concat('app.js'),
        production ? π.uglify() : util.noop(), // Minify with uglifyjs2
        gulp.dest(pathsOut.js),
        es.wait(function() { oneDone ? cb() : oneDone = true }) // If the other stream is finished, callback. Otherwise set oneDone = true
    ));

    var includes = doTask(combine(
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
        gulp.src([pathsIn.js, 'gulpfile,js']),
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
    gulp.watch([pathsIn.sass, pathsIn.sassFoundation + '**/*.scss', pathsIn.sassBourbon + '**/*.scss'], ['sass']);

    gulp.watch([pathsIn.js, pathsIn.jsFoundation, pathsIn.jsInstantClick, 'gulpfile.js'].concat(pathsIn.jsInc), ['lint', 'js']);

    gulp.watch([pathsIn.html], ['html']);

    browserSync.init(dest + '**/*', {
        server: {
            baseDir: dest
        },
        //reloadDelay: 1000, // Set in ms if needed
        open: false // Don't automatically open browser
    });
});