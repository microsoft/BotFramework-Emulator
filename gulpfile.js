/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var gulp = require('gulp');
var sequence = require('run-sequence');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var typescript = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var debug = require('gulp-debug');

gulp.task('build-all', function () {
    sequence(
        'clean',
        'build-system',
        'build-css',
        'build-app',
        'copy-site'
    );
});

gulp.task('clean', function () {
    return gulp.src('./dist/', { read: false })
        .pipe(clean());
});

gulp.task('build-system', function () {
    return gulp.src('node_modules/systemjs/dist/system.src.js')
        .pipe(rename('system.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-css', function () {
});

gulp.task('build-app', function () {
    var project = typescript.createProject('tsconfig.json');

    var tsResult = project.src()
        .pipe(sourcemaps.init())
        .pipe(project());

    return tsResult.js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
});

gulp.task('copy-site', function () {
    return gulp.src([
        './src/**/*.html',
        './src/**/*.css'])
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build-all']);
