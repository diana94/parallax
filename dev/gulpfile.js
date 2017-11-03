var gulp                  = require('gulp'),
    connect               = require('gulp-connect'),
    pug                   = require('gulp-pug'),
    runSequence           = require('run-sequence'),
    rename                = require('gulp-rename'),
    htmlbeautify          = require('gulp-html-beautify'),
    postcss               = require('gulp-postcss'),
    cssimport             = require('postcss-import'),
    cssnext               = require('postcss-cssnext'),
    csscolorfunctions     = require('postcss-color-function'),
    cssmqpacker           = require('css-mqpacker'),
    inlinesource          = require('gulp-inline-source'),
    flatten               = require('gulp-flatten'),
    postcssShort         = require('postcss-short'),
    cssnano               = require('cssnano');

var browsersList = [
    "last 3 versions",
    "ie >= 11"
];

// Parameters
function findParamArg(paramName, listCommands) {
    var index = listCommands.indexOf(paramName);
    if (index < 0) return null;
    var value = listCommands[index + 1];
    return value;
}

var pageName = findParamArg('-page', process.argv);
var cssName = findParamArg('-style', process.argv);
var htmlFile = "*";
var htmlPath = "**/*";
var cssFile = htmlFile;
var cssPath = htmlPath;

if (pageName) {
    htmlFile = pageName;
    htmlPath = pageName + '/' + pageName;

    if (!cssName) {
        cssFile = htmlFile;
        cssPath = htmlPath;
    } else if (cssName === "common") {
        cssFile = cssName;
        cssPath = cssFile + "/" + cssFile;
    }
}

// Server
gulp.task('connect', function () {

    connect.server({
        root: '',
        livereload: true
    });
});

// Reload
gulp.task('reload', function () {

    gulp.src([
            htmlFile + '.html',
            'stylesheets/' + cssFile + '.css',
            '!stylesheets/' + cssFile + '.min.css'
        ])
        .pipe(connect.reload());
});

// Pug
gulp.task('pug', function () {
    return gulp.src('_pages/' + htmlPath + '.pug')
        .pipe(pug())
        .pipe(rename({
            dirname: ''
        }))
        .pipe(flatten({}))
        .pipe(gulp.dest('_pages'));
});

// HTML beautify
gulp.task('htmlbeautify', function() {

    return gulp.src(htmlFile + '.html')
        .pipe(htmlbeautify({
            indentSize: 4,
            end_with_newline: true
        }))
        .pipe(gulp.dest(''));
});

// CSS
gulp.task('css', function () {

    return gulp.src('_pages/' + cssPath + '.css')
        .pipe(postcss([
            cssimport(),
            postcssShort(),
            cssnext({
                browsers: browsersList
            }),
            csscolorfunctions()
        ]))
        .pipe(rename({
            dirname: '',
        }))
        .pipe(gulp.dest('stylesheets'));
});

// CSS minify
gulp.task('cssminify', function () {

    return gulp.src([
            'stylesheets/' + cssFile + '.css',
            '!stylesheets/' + cssFile + '.min.css'
        ])
        .pipe(postcss([
            cssmqpacker(),
            cssnano({
                autoprefixer: false
            })
        ]))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('stylesheets/'));
});

// CSS critical inline
gulp.task('inlinesource', function () {

    return gulp.src('_pages/*.html')
        .pipe(inlinesource())
        .pipe(gulp.dest('./'));
});

// Flow 1
gulp.task('flow-1', function () {

    runSequence('pug', 'inlinesource', 'htmlbeautify', 'reload');
});

// Flow 2
gulp.task('flow-2', function () {

    runSequence('css', 'cssminify', 'reload');
});

// Build
gulp.task('build', function () {

    runSequence('css', 'cssminify', 'pug', 'inlinesource','htmlbeautify');
});

gulp.task('go', ['connect'], function () {

    gulp.watch([
        '_blocks/**/*.pug',
        '_pages/' + htmlPath + '.pug'
    ], ['flow-1']);

    gulp.watch([
        '_blocks/**/*.css',
        '_pages/' + cssPath + '.css'
    ], ['flow-2']);
});

gulp.task('default', function () {

});
