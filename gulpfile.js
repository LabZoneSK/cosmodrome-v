var gulp = require('gulp'),
  sass = require('gulp-sass')(require('node-sass')),
  rename = require('gulp-rename'),
  webpack = require('webpack-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  server = require('gulp-express'),
  VueLoaderPlugin = require('vue-loader/lib/plugin');

gulp.task('sass', function() {
  return gulp.src('./assets/scss/app.scss')
    .pipe(sass({outputStyle: 'compressed', precision: 4})
    .on('error', sass.logError))
    .pipe(rename({
      suffix: ".min",
    }))
    .pipe(gulp.dest('./web/css/'));
})

gulp.task('sass-dev', function() {
  return gulp.src('./assets/scss/app.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded', precision: 4})
    .on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(rename({
      suffix: ".min",
    }))
    .pipe(gulp.dest('./web/css/'));
})

gulp.task('scripts', function () {
  return gulp.src('./assets/js/app.js')
    .pipe(webpack({
      mode: 'production',
      output: {
        filename: 'app.min.js',
      },
      resolve: {
        alias: {
          vue: 'vue/dist/vue.min.js',
          //vue: 'vue/dist/vue.js' dev mode
        }
      },
      module: {
        rules: [
          {
            test: /\.vue$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'vue-loader'
          },
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                "presets": [
                  [
                    "@babel/preset-env",
                    {
                      "targets": {
                        "esmodules": true
                      }
                    }
                  ]
                ]
              }
            }
          },
        ]
      },
      plugins: [
        new VueLoaderPlugin()
      ]
  }))
  .pipe(gulp.dest('./web/js'));
});

gulp.task('scripts-dev', function() {
  return gulp.src('./assets/js/app.js')
    .pipe(webpack({
      mode: 'development',
      output: {
        filename: 'app.min.js',
      },
      resolve: {
        alias: {
          vue: 'vue/dist/vue.js'
        }
      },
      module: {
        rules: [
          {
            test: /\.vue$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'vue-loader'
          },
        ]
      },
      plugins: [
        new VueLoaderPlugin()
      ]
    }))
    .pipe(gulp.dest('./web/js'));
});


gulp.task('watch-dev', function () {
  gulp.watch('./assets/scss/**/*.scss', gulp.series('sass-dev'));
  gulp.watch(['./assets/js/**/*.js', "./assets/js/**/*.vue"], gulp.series('scripts-dev'));
});

gulp.task('build', gulp.series('sass', 'scripts'));
gulp.task('build-dev', gulp.series('sass-dev', 'scripts-dev'));

gulp.task('server-dev', function () {
  gulp.series('build-dev')();
  // Start the server at the beginning of the task
  server.run(['./assets/server/app.js']);
  gulp.watch('./assets/scss/**/*.scss', gulp.series('sass-dev'));
  gulp.watch(['./assets/js/**/*.js', "./assets/js/**/*.vue"], gulp.series('scripts-dev'));
});

gulp.task('server', function () {
  gulp.series('build')();
  // Start the server at the beginning of the task
  server.run(['./assets/server/app.js']);
  gulp.watch('./assets/scss/**/*.scss', gulp.series('sass'));
  gulp.watch(['./assets/js/**/*.js', "./assets/js/**/*.vue"], gulp.series('scripts'));
});
