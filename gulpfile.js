// Define paths and other variables
var src = 'src/';
var dest = 'build/';

// Paths we read from
var pathsIn = {
    html: src,

    img: src + 'img/',

    js: src + 'js/',
    jsFoundation: ['bower_components/foundation/js'], // vendor/ contains updated jquery, fastclick, etc...

    sass: src + 'scss/',
    sassIncludes: ['bower_components/foundation/scss/']

};
pathsIn.jsModernizr = [pathsIn. jsFoundation + 'vendor/modernizr.js'];
pathsIn.jsIncludes = [pathsIn.jsFoundation + '**/*.js', '!' + pathsIn.jsModernizr];
pathsIn.jsAll =  pathsIn.jsIncludes.concat(pathsIn.js);
pathsIn.sassAll = pathsIn.sassIncludes.concat(pathsIn.sass);

// Paths we write to (^ could that be cleaner? ^)
var pathsOut = {
    html: dest,
    img: dest + 'img/',
    js: dest + 'js/',
    css: dest + 'css/',
};

var gulp = require('gulp');
var util = require('gulp-util');
var stylish = require('jshint-stylish'); // Nice-looking console output when linting
var $ = require('gulp-load-plugins')({ camelize: true } ); // Load everything in package.json that matches "gulp-*"


var production = util.env.type === 'dist'; // Set production mode


// Copy html/etc and do includes
gulp.task('html', function() {
    gulp.src(pathsIn.html + '**/*.{html,txt}')
        .pipe($.include()) // Run through gulp-include
        .pipe(gulp.dest(pathsOut.html));
});


// Compile & minify sass
gulp.task('sass', function() {
    gulp.src(pathsIn.sass + '**/*.scss')
        .pipe($.sass({
            includePaths: pathsIn.sassAll,
            outputStyle: 'nested'
        }))
        .pipe(production ? $.csso() : util.noop()) // Minify and optimize with csso
        .pipe(gulp.dest(pathsOut.css));
});


// Concatenate & minify JS
gulp.task('js', function() {
    gulp.src(pathsIn.jsAll)
        .pipe($.concat('app.js'))
        .pipe(production ? $.uglify() : util.noop()) // Minify with uglifyjs2
        .pipe(gulp.dest(pathsOut.js));

    gulp.src(pathsIn.jsModernizr) // Modernizr is separate because load it at the top
        .pipe(gulp.dest(pathsOut.js));
});


// Lint JS with jshint
gulp.task('lint', function() {
    gulp.src([pathsIn.js + '**/*.js', 'Gulpfile.js'])
        .pipe($.jshint({
            'camelcase': true,
            'unused': true,
            'nonbsp': true,
            'noempty': true
        }))
        .pipe($.jshint.reporter(stylish));
});


// Default Task
gulp.task('default', ['lint', 'js', 'sass', 'html']);