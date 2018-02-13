const gulp = require('gulp');
const shell = require('gulp-shell');

gulp.task('clean', function () {
  const clean = require('gulp-clean');
  return gulp.src('./built/', { read: false })
    .pipe(clean());
});

gulp.task('build-app', function () {
  return gulp
    .src('./package.json', { read: false })
    .pipe(shell([
      'npm run build:electron'
    ]));
});

gulp.task('build-shared', function () {
  return gulp
  .src('../shared/package.json', { read: false })
  .pipe(shell([
    'npm run build'
  ], { cwd: '../shared' }));
});

gulp.task('build-react', ['build-react:build'], function () {
  return gulp
    .src(['../client/build/**/*'])
    .pipe(gulp.dest('built/client/'));
});

gulp.task('build-react:build', function () {
  return gulp
    .src('../client/package.json', { read: false })
    .pipe(shell([
      'npm run build'
    ], { cwd: '../client' }));
});

gulp.task('build', ['clean', 'build-shared'], function () {
  return gulp.start([
    'build-app',
    'build-react'
  ]);
});
