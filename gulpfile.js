'use strict';

const autoprefixer      = require('gulp-autoprefixer');
const browserSync       = require('browser-sync').create();
const config            = require('./config');
const del               = require('del');
const gulp              = require('gulp');
const gulp_if           = require('gulp-if');
const gulpsync          = require('gulp-sync')(gulp);
const gutil             = require('gulp-util');
const nunjucksRender    = require('gulp-nunjucks-render');
const path              = require('path');
const plumber           = require('gulp-plumber');
const rename            = require('gulp-rename');
const rev               = require('gulp-rev');
const revReplace        = require('gulp-rev-replace');
const sass              = require('gulp-sass');
const sourcemaps        = require('gulp-sourcemaps');
const svgSprite         = require('gulp-svg-sprite');
const webpack           = require('gulp-webpack');


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
    .src(config.src.html)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(nunjucksRender({
      path: [config.src.templates]
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

gulp.task('svgstore', function () {
    return gulp
        .src(config.src.icons)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore())
        .pipe(gulp.dest('./dist/public/icons'))
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
 
 Images
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

gulp.task('images', function() {
    return gulp 
        .src(config.src.img + '/**/*')
        .pipe(gulp.dest(config.dest.img))
        // Inject images with browser sync
        .pipe(browserSync.stream());
});


/*
 
 Fonts
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

gulp.task('fonts', function() {
    return gulp 
        .src(config.src.fonts + '/**/*')
        .pipe(gulp.dest(config.dest.fonts))
        // Inject fonts with browser sync
        .pipe(browserSync.stream());
});


/*
 
 Revision
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

// Clean out the build directory
gulp.task('clean', () => {
    return del(
        [
            config.dest.path + '/rev-manifest.json',
            config.dest.path + '/**/*'
        ],
        {force: true}
    );
});

// Revision assets
gulp.task('revision', function () {
    // by default, gulp would pick `assets/css` as the base,
    // so we need to set it explicitly:
    return gulp.src(
            [config.dest.path + '/public/**/*.{css,js,jpg,png,gif,svg}'],
            {base: config.dest.path}
        )
        .pipe(rev())
        // write rev'd assets to build dir
        .pipe(gulp.dest(config.dest.path))
        .pipe(rev.manifest())
        // write manifest to build dir
        .pipe(gulp.dest(config.dest.path));
});


// Update asset references
gulp.task('rev-update-references', function(){
    var manifest = gulp.src(config.dest.path + '/rev-manifest.json');

    return gulp.src(config.dest.path + '/**/**.{css,js,html}')
        .pipe(revReplace({manifest: manifest}))
        .pipe(gulp.dest(config.dest.path));
});


/*
 
 BrowserSync
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

gulp.task(
    'serve', 
    ['nunjucks', 'sass', 'webpack', 'svgSprite', 'copy-scripts', 'fonts', 'images'],
    () => {

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
    gulp.watch(
        [config.src.html, config.src.templates + '/**/*'],
        ['nunjucks'])
    .on('change', browserSync.reload);
});


/*
 
 Primary tasks
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

// We run certain tasks synchronously:

// 1. Clean out build folder
// 2. Run svg sprite to ensure compilation before included as partial
// 3. run build processes
// 4. revision assets or start browserSync

gulp.task(
    'development',
    gulpsync.sync(['clean', 'svgSprite', 'serve']));

gulp.task(
    'production',
    gulpsync.sync([
        'clean',
        ['svgSprite'],
        ['nunjucks', 'sass', 'webpack', 'copy-scripts', 'fonts', 'images'],
        'revision',
        'rev-update-references'
    ]));