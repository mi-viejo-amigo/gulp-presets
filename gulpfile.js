const gulp = require('gulp');
const { parallel } = require('gulp');
const concat = require('gulp-concat-css');
const plumber = require('gulp-plumber');
const del = require('del');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mediaquery = require('postcss-combine-media-query');
const cssnano = require('cssnano');
const htmlMinify = require('html-minifier');

//  Функция просмотра через сервер в реальном времени. в остальные функции html css images надо добавить ПАЙП ".pipe(browserSync.reload({stream: true}));"" что бы это выполнялось.
function serve() {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });
} 

//создание папки dist и копирование html в нее.
function html() {
  const options = {
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
    collapseWhitespace: true,
      minifyCSS: true,
      keepClosingSlash: true
  };
return gulp.src('src/**/*.html')
      .pipe(plumber())
              .on('data', function(file) {
            const buferFile = Buffer.from(htmlMinify.minify(file.contents.toString(), options))
            return file.contents = buferFile
          })
              .pipe(gulp.dest('dist/'))
      .pipe(browserSync.reload({stream: true}));
}

// склеивание css файла и заливаем все в dist Бандлим. создаем бандл
function css() {
  const plugins = [
    autoprefixer(),
    mediaquery(),
    cssnano()
];
  return gulp.src('src/**/*.css')
        .pipe(plumber())
        .pipe(concat('bundle.css'))
        .pipe(postcss(plugins))
                .pipe(gulp.dest('dist/'))
                .pipe(browserSync.reload({stream: true}));
}

//Копируем фото всех форматов. Пламбер не нужен потому что фото не меняется и не создает ошибки.
function images() {
  return gulp.src('src/images/**/*.{jpg,png,svg,gif,ico,webp,avif}')
            .pipe(gulp.dest('dist/images'))
            .pipe(browserSync.reload({stream: true}));
}

function videos() {
  return gulp.src('src/videos/**/*.{mp4,ogg,mov,avi,flv}')
            .pipe(gulp.dest('dist/videos'))
            .pipe(browserSync.reload({stream: true}));
}

// задача для отчистки папки dist/ перед каждой сборкой отчищай и начинай сборку.
function clean() {
  return del('dist');
}

//Создали функцию которая наблюдает за изменениями файлов. 
function watchFiles() {
  gulp.watch(['src/**/*.html'], html);
  gulp.watch(['src/**/*.css'], css);
  gulp.watch(['src/images/**/*.{jpg,png,svg,gif,ico,webp,avif}'], images);
  gulp.watch(['src/videos/**/*.{mp4,ogg,mov,avi,flv}'], videos);
}

// команда объединяющая все 4. gulp.series() объединяет их в одну команду. 
// а gulp.parallel() говорит что clean будет выполняться первая, а html css и images выполнятся вместе паралельно
const build = gulp.series(clean, gulp.parallel(html, css, images, videos));

// Объединяем ее в паралель с задачей Build и будем вызывать сборку если наблюдатель заметил изменения!
const watchapp = parallel(build, watchFiles, serve);

exports.clean = clean;
exports.images = images;
exports.videos = videos;
exports.css = css; 
exports.html = html; 

exports.build = build;
exports.watchapp = watchapp;
exports.default = watchapp;
// *Запуск задачи watchapp следит за файлами в src/ и делает пересборку после каждого изменения этих файлов.
//  Отключить такое слежение в терминале можно клавишами CTRL + C8*