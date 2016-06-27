var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-ruby-sass'),
	autoprefix = require('gulp-autoprefixer'),
	browserSync = require('browser-sync').create();



// -- UGLIFY
// The task name is the command you type after 'gulp'
// in the command line -- 'gulp uglify' to run the uglify task
gulp.task('uglify', function() {
	// All these files …
	gulp.src('js/*.js') // * is a wildcard selector
	// minify
	.pipe(uglify())
	// and put them in the 'min' directory
	.pipe(gulp.dest('js/min'));
	// 'pipe' is a gulp method that chains tasks together
	// and passes data through those chains
});

// -- HELLO WORLD
gulp.task('helloworld', function() {
	console.log('Hello World');
});

// -- SASS
gulp.task('sass', function() {
	// gulp-ruby-sass does not use gulp.src for source files
	// return the list of  files first, then pipe into destination with gulp
	return sass('css/scss/*.scss')
	.on('error', sass.logError)
	.pipe(autoprefix({
			browsers: ['last 5 versions', '> 1%', 'ie 8', 'ie 9', 'ie10']
		}))
	.pipe(gulp.dest('css/'))
	// load new CSS files in browser when task runs
	.pipe(browserSync.reload({
	  stream: true
	}));
});

// -- BROWSER SYNC
gulp.task('browserSync', function() {
  browserSync.init({
    server: { baseDir: './' },
    // './' means the root directory
    // if html is in another folder, such as 'public', then
    // 'public' should be your baseDir

    // only files in this baseDir will be served, so if assets are in
    // outside directories, make sure to compile them into the
    // main directory. For example /scss => /public/css
  })
})

// -- WATCH
// the array is a list of tasks that should be done before 'watch' task
// array order is not important
gulp.task('watch', ['browserSync', 'sass'], function() {
	// watch is a built in method for gulp
	// pass in params for files to watch in a directory
	// array inludes names of tasks to run when gulp sees a change
	gulp.watch('js/*.js', ['uglify']);
	gulp.watch('css/scss/*.scss', ['sass']);

	// also watch for changes in html files and js files
	// if something is changed, update browser view
	gulp.watch('*.html', browserSync.reload); 
  	gulp.watch('/js/**/*.js', browserSync.reload); 
});
// 'gulp watch' will keep running after command is entered
// to stop, type ctrl + c


// default task can be before, after, or in the middle
// of gulpfile and will still run all taks in array
// probably best to put at the end so its easier to read
gulp.task('default', ['uglify', 'sass', 'watch']);