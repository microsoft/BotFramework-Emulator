var gulp = require('gulp');

// TODO: We should expose CSS programmatically in Web Chat
gulp.task('copy:webchat:css', function () {
  return gulp
    .src('node_modules/@bfemulator/custom-botframework-webchat/botchat.css')
    .pipe(gulp.dest('./public/external/css'));
});

// Copy media files to external
gulp.task('copy:media', function () {
  return gulp
    .src('src/ui/media/**/*')
    .pipe(gulp.dest('./public/external/media'));
});

gulp.task('copy:intercom:css', function() {
  return gulp
    .src('node_modules/@intercom/ui-fabric/css/fabric.min.css')
    .pipe(gulp.dest('./public/external/css'));
});

// Copy @intercom/ui-fabric media files
gulp.task('copy:intercom', function() {
  return gulp
    .src([
      'node_modules/@intercom/ui-fabric/themes/seti/seti.woff'
    ])
    .pipe(gulp.dest('./public/external/media'));
});

gulp.task('copy', [
  'copy:media',
  'copy:webchat:css',
  'copy:intercom:css',
  'copy:intercom'
]);
