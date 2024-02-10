const gulp = require('gulp');
const { parallel } = require('gulp');
const concat = require('gulp-concat-css');
const plumber = require('gulp-plumber');
const del = require('del');
const browserSync = require('browser-sync').create();

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
  return gulp.src('src/**/*.html')
        .pipe(plumber())
                .pipe(gulp.dest('dist/'))
                .pipe(browserSync.reload({stream: true})); 
}

// склеивание css файла и заливаем все в dist Бандлим. создаем бандл
function css() {
  return gulp.src('src/**/*.css')
        .pipe(plumber())
        .pipe(concat('bundle.css'))
                .pipe(gulp.dest('dist/'))
                .pipe(browserSync.reload({stream: true}));
}

//Копируем фото всех форматов. Пламбер не нужен потому что фото не меняется и не создает ошибки.
function images() {
  return gulp.src('src/images/**/*.{jpg,png,svg,gif,ico,webp,avif}')
            .pipe(gulp.dest('dist/images'))
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
}

// команда объединяющая все 4. gulp.series() объединяет их в одну команду. 
// а gulp.parallel() говорит что clean будет выполняться первая, а html css и images выполнятся вместе паралельно
const build = gulp.series(clean, gulp.parallel(html, css, images));

// Объединяем ее в паралель с задачей Build и будем вызывать сборку если наблюдатель заметил изменения!
const watchapp = parallel(build, watchFiles, serve);

exports.clean = clean;
exports.images = images; 
exports.css = css; 
exports.html = html; 

exports.build = build;
exports.watchapp = watchapp;
exports.default = watchapp;
// *Запуск задачи watchapp следит за файлами в src/ и делает пересборку после каждого изменения этих файлов.
//  Отключить такое слежение в терминале можно клавишами CTRL + C8*