'use strict';

const autoprefixer  = require('gulp-autoprefixer');
const browserSync   = require('browser-sync').create();
const gulp          = require('gulp');
const gulp_if       = require('gulp-if');
const gutil         = require('gulp-util');
var nunjucksRender  = require('gulp-nunjucks-render');
const plumber       = require('gulp-plumber');
const rename        = require('gulp-rename');
const sass          = require('gulp-sass');
const sourcemaps    = require('gulp-sourcemaps');
const svgSprite     = require('gulp-svg-sprite');
const webpack       = require('gulp-webpack');

const config        = require('./config');


/*
 
 Settings
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

// Determine environment based on argv options
const i = process.argv.indexOf('--env'),
    env = (i > -1) ? process.argv[i+1] : 'development';

// Define general on error function
const onError = function(err) {  
    console.log(err);
    gutil.beep();
};

// sass options
const sassOptions = {
  errLogToConsole: true,
  outputStyle: (env === 'development') ? 'expanded' : 'compressed'
};

// Set environmental vars for webpack
const webpackConfig = {
    development: require('./webpack-config.js')('development'),
    production: require('./webpack-config.js')('production')
};

// autoprefixer options
const autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};

// svg options
const svgOptions = {
    shape: {
        // Keep the intermediate files
        dest: 'out/intermediate-svg'
    },
    mode: {
        // Activate the «symbol» mode
        symbol: true
    },
    svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false
    }
};


/*
 
 html with nunjucks render
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

gulp.task('nunjucks', () => {
  return gulp
    .src(config.src.templates)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(nunjucksRender({
      path: [config.src.layouts]
    }))
    .pipe(gulp.dest(config.dest.html));
});


/*
 
 SASS
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

gulp.task('sass', () => {
    return gulp
        .src(config.src.sass)
        // Handle error events with plumber
        .pipe(plumber({ errorHandler: onError }))
        // Init sourcemaps if in development
        .pipe(gulp_if((env === 'development'), sourcemaps.init()))
        // Log sass errors to console
        .pipe(sass(sassOptions).on('error', sass.logError))
        // Run autoprefixer
        .pipe(autoprefixer(autoprefixerOptions))
        // Rename the file
        .pipe(rename({ basename: config.baseNames.css }))
        // Write source maps if in development
        .pipe(gulp_if((env === 'development'), sourcemaps.write()))
        .pipe(gulp.dest(config.dest.css))
        // Inject css with browser sync
        .pipe(browserSync.stream());
});


/*
 
 Webpack
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

gulp.task('webpack', () => {
    return gulp
        .src([config.src.js])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(webpack( webpackConfig[env] ))
        .pipe(rename({ basename: config.baseNames.js }))
        .pipe(gulp.dest(config.dest.js));
});


/*
 
 svg sprite
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

gulp.task('svgSprite', () => {
    return gulp
        .src(config.src.icons)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(svgSprite(svgOptions))
        .pipe(gulp.dest(config.dest.icons))
        // Inject svg with browser sync
        .pipe(browserSync.stream());
});


/*
 
 Third party scripts
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

gulp.task('copy-scripts', () => {
    return gulp
        .src(config.src.vendor)
        .pipe(rename({dirname: ''}))
        .pipe(gulp.dest(config.dest.js));
});


/*
 
 BrowserSync
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

gulp.task('serve', ['nunjucks', 'sass', 'webpack', 'svgSprite', 'copy-scripts'], () => {

    // Setup a proxy server
    browserSync.init({
        proxy: config.proxy,
        port: 3000
    });

    // Watch files for updates and inject into page
    gulp.watch(config.src.sass, ['sass']);
    gulp.watch(config.src.icons, ['svgSprite']);

    // Watch and listen for js seperately as compiling with webpack
    gulp.watch(config.src.js, ['webpack']);
    gulp.watch(config.dest.js + '/**/*.js').on('change', browserSync.reload);

    // Watch for changes to html
    gulp.watch(config.src.html, ['nunjucks']).on('change', browserSync.reload);
});


/*
 
 Primary tasks
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

gulp.task('development', ['nunjucks', 'sass', 'webpack', 'svgSprite', 'copy-scripts', 'serve']);
gulp.task('production', ['nunjucks', 'sass', 'webpack', 'svgSprite', 'copy-scripts']);