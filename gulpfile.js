var gulp = require('gulp')
var concat = require('gulp-concat')
var ngAnnotate = require('gulp-ng-annotate')


gulp.task('build', function() {
  return gulp.src(['./src/module.js','./src/!(-test).js'])
    .pipe(concat('tool-box.js'))
    .pipe(ngAnnotate())
    .pipe(gulp.dest('./dist/'))
})
