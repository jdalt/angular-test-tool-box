var gulp = require('gulp')
var concat = require('gulp-concat')


gulp.task('build', function() {
  return gulp.src(['./src/module.js','./src/!(-test).js'])
    .pipe(concat('tool-box.js'))
    .pipe(gulp.dest('./dist/'))
})
