var gulp = require('gulp');
var clean = require('gulp-clean');
var tsc = require('gulp-tsc');

gulp.task('clean', function () {
    return gulp.src('./dist/', { read: false })
        .pipe(clean());
});

gulp.task('build-app', ['clean'], function () {
    return gulp.src(['src/**/*.ts', 'src/**/*.tsx'])
        .pipe(tsc({
            module: 'commonjs',
            moduleResolution: 'node',
            target: 'ES5',
            sourceMap: true,
            noImplicitAny: false,
            noImplicitThis: true,
            noEmitOnError: true,
            outDir: 'dist',
            additionalTscParameters: ['--jsx', 'react']
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('copy-site', ['build-app'], function () {
    return gulp.src([
        './src/**/*.html',
        './src/**/*.css'])
        .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['copy-site']);
