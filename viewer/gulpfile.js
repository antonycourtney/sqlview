var gulp = require('gulp'); 

//For cleaning out the build dir
var clean = require('gulp-clean');

//For processing react and other files into minimized files
var react = require('gulp-react');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

//For browserify build
var browserify = require('gulp-browserify');

//Mocha tests
var mochaPhantomJS = require('gulp-mocha-phantomjs');

//For re-running node when server source changes
var nodemon = require('gulp-nodemon');

//Convert all js file jsdocs annotation to markdown
var jsdoc2md = require("jsdoc-to-markdown");
var gutil = require("gulp-util");
var fs = require("fs");

//Documentation generation
gulp.task("docs", ['javascript'], function(done){
    var src = "build/js/components/main.js";
    var dest = "docs/components.md";
    var options = {};

    gutil.log("writing documentation to " + dest);

    jsdoc2md.render(src, options)
        .on("error", function(err){
            gutil.log(gutil.colors.red("jsdoc2md failed"), err.message);
        })
        .pipe(fs.createWriteStream(dest));
});

gulp.task('test', ['build_tests'], function () {
    return gulp.src('test/runner.html')
        .pipe(mochaPhantomJS());
});


gulp.task('build_tests', ['browserify'], function() {

    gutil.log("transforming tests (jsx) and running browserify");

    return gulp.src(['test/tests/*.test.js'])
        .pipe(react())
        .pipe(browserify())
        .pipe(rename('test.build.js'))
        .pipe(gulp.dest('test/build/'))
});

// Delete everything inside the build directory
gulp.task('clean', function() {
  return gulp.src(['build/*'], {read: false}).pipe(clean());
});

gulp.task('build_javascript', function() {

    gutil.log("transforming jsx to build");

    return gulp.src('js/**/*.js')
        // Turn their React JSX syntax into regular javascript
        .pipe(react())      
        // Output each one of those --> ./build/js/ directory
        .pipe(gulp.dest('build/js/'))        
        // Then take each of those and minimize
        .pipe(uglify())
        // Add .min.js to the end of each optimized file
        .pipe(rename({suffix: '.min'}))
        // Then output each optimized .min.js file --> ./build/js/ directory
        .pipe(gulp.dest('build/js/'));
});

gulp.task('browserify_viewer', ['build_javascript'], function() {

    gutil.log("running browserify");

    return gulp.src('build/js/viewer.js')
        .pipe(browserify({
            transform: ['envify']
        }))
        .pipe(rename('viewer.build.js'))
        .pipe(gulp.dest('build/js/'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('build/js/'));
});


gulp.task('browserify', ['browserify_viewer'] );

gulp.task('watch', ['clean'], function() {
    var watching = false;
    gulp.start('browserify', function() {

        // Protect against this function being called twice. (Bug?)
        if (!watching) {
            watching = true;

            // Watch for changes in public javascript code and run the 'browserify' task
            gulp.watch(['public/**/*.js', 'test/**/*.test.js'], ['browserify', 'test']);

            // Restart node if anything in build changes
            nodemon({script: 'server.js', watch: 'build'});
        }
    });
});

gulp.task('default', ['clean'], function() {
    return gulp.start('browserify');
});
