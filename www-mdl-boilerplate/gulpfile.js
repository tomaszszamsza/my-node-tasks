const
  gulp = require('gulp'),
  gulpSequence = require('gulp-sequence'),//po udostepnieniu v4 gulpa będzie zbędne (gulp.series ma być wbudowany)
  rename = require('gulp-rename'),
  //---
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  //---
  imagemin = require('gulp-imagemin'),
  //---
  async = require('async'),
  iconfont = require('gulp-iconfont'),
  consolidate = require('gulp-consolidate');






//----------------------------
//Własne style generowane na podstawie sass
//----------------------------
gulp.task('sass:main', function() {
  //wynik trzeba przypisac do zmiennej zamiast od razu uzyć return (gulp-sass czasami się sypie)
  var result =
    gulp.src('./src/scss/main.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({errLogToConsole:true, outputStyle:'compressed'}).on('error', sass.logError))
      .pipe(autoprefixer({ browsers:['last 2 versions'], cascade:false }))
      .pipe(sourcemaps.write('.', {includeContent:false}))
      .pipe(gulp.dest('./css'))
      .pipe(rename('main.min.css'))
      .pipe(gulp.dest('./css'));
    return result;
});





//----------------------------
//Kopiowanie i optymalizacja wskazanych obrazków
//----------------------------
gulp.task('images:main', function() {
  var result =
      gulp.src('./src/img/**/*')
      .pipe(imagemin())
      .pipe(gulp.dest('./img/'));
    return result;
});




//----------------------------
//Generowanie fonta/css'a z ikonek svg
//Pomoc: https://www.npmjs.com/package/gulp-iconfont https://github.com/cognitom/symbols-for-sketch/blob/master/templates/fontawesome-style.css
//----------------------------
gulp.task('webfont:main', function(done){
  var iconStream = gulp.src(['./src/webfont/*.svg'])
    .pipe(iconfont({ fontName: 'my-font' }));
 
  async.parallel([
    function handleGlyphs (cb) {
      iconStream.on('glyphs', function(glyphs, options) {
        gulp.src('./src/webfont/_template.css')
          .pipe(consolidate('underscore', {
            glyphs: glyphs,
            fontName: options.fontName,
            fontDate: new Date().getTime(),
            fontPath: './css/webfonts',
            className: 's'
          }))
          .pipe(gulp.dest('./css/webfonts/fonts.css'))
          .on('finish', cb);
      });
    },
    function handleFonts (cb) {
      iconStream
        .pipe(gulp.dest('./css/webfonts/fonts.css'))
        .on('finish', cb);
    }
  ], done);
});










//----------------------------
//Zadania domyślne - kompilacja+watch
//----------------------------
//Kod dla zachowania zgodności (gulp v3/v4)
if(!gulp.series)
  gulp.series = gulpSequence;

gulp.task('watch', function() {
  gulp.watch(['./src/scss/**/*'], gulp.series('sass:main'));
  gulp.watch(['./src/img/**/*'], gulp.series('images:main'));
  gulp.watch(['./src/webfont/*'], gulp.series('webfont:main'));
});


gulp.task('default', gulp.series(['sass:main','images:main','webfont:main'],'watch'));
gulp.task('build', gulp.series(['sass:main','images:main','webfont:main']));
