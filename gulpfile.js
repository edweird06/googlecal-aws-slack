/// <reference path="typings/index.d.ts" />

const gulp = require('gulp');
const del = require('del');
const packageJson = require('./package.json');
var zip = require('gulp-vinyl-zip');

gulp.task('clean-dist', function () {
    return del(['./dist/**/*.*', './dist/*']);
});

gulp.task('copy-node-modules', ['clean-dist'], function () {
    var modulesToCopy = Object.keys(packageJson.dependencies).map(dependency => {
        return './node_modules/' + dependency + '/**/*.*';
    });
    // Copy node modules to dist directory.
    return gulp.src(modulesToCopy, { base: './node_modules' })
        .pipe(gulp.dest('./dist/node_modules'));
});

gulp.task('copy-src', ['clean-dist'], function () {
    return gulp.src(['./src/**/*', './package.json'])
        .pipe(gulp.dest('./dist'));
});

gulp.task('zip-lambda', ['copy-node-modules', 'copy-src'], function () {
    var pattern = './dist/**/*';

    return gulp.src(pattern)
        .pipe(zip.dest('./dist/lambda.zip'));
});

gulp.task('default', ['clean-dist', 'copy-node-modules', 'copy-src', 'zip-lambda']);