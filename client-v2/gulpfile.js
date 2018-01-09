var gulp = require('gulp');

gulp.task('copy', [
    'copy:shared',
    'copy:types',
    'copy:webchat:cognitiveservices',
    'copy:webchat:css',
    'copy:monaco'
]);

// TODO: We should either repackage CognitiveServices.js into a separate package, or expose it in Web Chat
gulp.task('copy:webchat:cognitiveservices', function () {
    return gulp
        .src('node_modules/botframework-webchat/CognitiveServices.js')
        .pipe(gulp.dest('./src/external/botframework-webchat'));
});

// TODO: We should expose CSS programmatically in Web Chat
gulp.task('copy:webchat:css', function () {
    return gulp
        .src('node_modules/botframework-webchat/botchat.css')
        .pipe(gulp.dest('./public/external/css'));
});

// TODO: This task should be obsoleted when we package shared code into its own NPM package
gulp.task('copy:shared', function () {
    return gulp
        .src('../src/shared/**/*')
        .pipe(gulp.dest('./src/external/shared'));
});

// TODO: This task should be obsoleted when we package shared code into its own NPM package
gulp.task('copy:types', function () {
    return gulp
        .src('../src/types/**/*')
        .pipe(gulp.dest('./src/external/types'));
});

// Copy monaco to /public
gulp.task('copy:monaco', function () {
    return gulp
        .src('node_modules/monaco-editor/min/vs/**/*')
        .pipe(gulp.dest('./public/external/vs'))
});
