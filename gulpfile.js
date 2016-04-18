
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    cleanCSS = require('gulp-clean-css');

gulp.task('js', function() {
    return gulp.src('src/print.js')
        .pipe(uglify())
        .pipe(rename('print.min.js'))
        .pipe(gulp.dest('dist/'));
});


gulp.task('css', function() {
    return gulp.src('src/print.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename('print.min.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['js', 'css']);

gulp.task('watch', function () {
    gulp.watch('src/*.js', ['js']);
});