var gulp = require('gulp');

gulp.task('copy', [
    'copy:media',
    'copy:webchat:cognitiveservices',
    'copy:webchat:css',
    'copy:monaco'
]);

// TODO: We should either repackage CognitiveServices.js into a separate package, or expose it in Web Chat
gulp.task('copy:webchat:cognitiveservices', function () {
    return gulp
        .src('node_modules/custom-botframework-webchat/CognitiveServices.js')
        .pipe(gulp.dest('./src/external/custom-botframework-webchat'));
});

// TODO: We should expose CSS programmatically in Web Chat
gulp.task('copy:webchat:css', function () {
    return gulp
        .src('node_modules/custom-botframework-webchat/botchat.css')
        .pipe(gulp.dest('./public/external/css'));
});

// Copy media files to external
gulp.task('copy:media', function () {
    return gulp
        .src('src/ui/media/**/*')
        .pipe(gulp.dest('./public/external/media'));
});

// Copy monaco to /public
gulp.task('copy:monaco', function () {
    return gulp
        .src('node_modules/monaco-editor/min/vs/**/*')
        .pipe(gulp.dest('./public/external/vs'))
});
