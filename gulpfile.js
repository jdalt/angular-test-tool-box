var gulp = require('gulp')
var concat = require('gulp-concat')
var ngAnnotate = require('gulp-ng-annotate')
var watch = require('gulp-watch')


gulp.task('build', build)
gulp.task('watch', function() {
  watch('./src/*-helper.js', function(file) {
    console.log('File changed:', file.path)
    build()
  })
})

function build() {
  return gulp.src(['./src/_module.js','./src/*-helper.js'])
    .pipe(concat('tool-box.js'))
    .pipe(ngAnnotate())
    .pipe(gulp.dest('./dist/'))
}
