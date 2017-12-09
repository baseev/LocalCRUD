var gulp = require('gulp'),
 	connect = require('gulp-connect'),
 	openURL = require('open');
 var port = 9001;

gulp.task('webserver', function() {
  connect.server({
    root: ['.'],
    livereload: true,
    port: port
  });
});

gulp.task('open', [], function () {
  openURL('http://localhost:'+port);
});

gulp.task('default', ['webserver']);