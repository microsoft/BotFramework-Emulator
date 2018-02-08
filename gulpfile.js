const gulp = require('gulp');
const install = require('gulp-install');
const shell = require('gulp-shell');

gulp.task('clean', function () {
    const clean = require('gulp-clean');
    return gulp.src('./app/', { read: false })
        .pipe(clean());
});

gulp.task('build-app', function () {
    return gulp
        .src('./package.json', { read: false })
        .pipe(shell([
            'npm run build:electron'
        ]));
});

gulp.task('build-react', ['build-react:build'], function () {
    return gulp
        .src(['./client-v2/build/**/*'])
        .pipe(gulp.dest('app/client/'));
});

gulp.task('build-react:build', function () {
    return gulp
        .src('./client-v2/package.json', { read: false })
        .pipe(shell([
            'npm run build'
        ], { cwd: './client-v2' }));
});

gulp.task('build-site', function () {
    return gulp.src([
        './src/**/*.html',
        './src/**/*.css'])
        .pipe(gulp.dest('app/'));
});

gulp.task('build', ['clean'], function() {
    return gulp.start([
        'build-app',
        'build-react',
        'build-site'
    ]);
});
