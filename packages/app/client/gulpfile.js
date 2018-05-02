//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

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

gulp.task('copy:fuselab:css', function() {
  return gulp
    .src('node_modules/@fuselab/ui-fabric/css/fabric.min.css')
    .pipe(gulp.dest('./public/external/css'));
});

// Copy @intercom/ui-fabric media files
gulp.task('copy:fuselab', function() {
  return gulp
    .src([
      'node_modules/@fuselab/ui-fabric/themes/seti/seti.woff'
    ])
    .pipe(gulp.dest('./public/external/media'));
});

gulp.task('copy', gulp.parallel(
  'copy:media',
  'copy:webchat:css',
  'copy:fuselab:css',
  'copy:fuselab'
));
