var dirs = {
    sourceDir: './public/',
    sourceAssetsDir: './public/',
    buildDir: './build/',
    buildAssetsDir: './build/'
  };

module.exports = {
  env:        'WEB',
  port: 4000,
  react: false,
  local_api: 'http://localhost:8080/api', //app is local, api is local
  test_api: 'https://test-environment.appspot.com/api', //app is local, api is test
  build_api: '/api', //app is built for remote, api is remote
  cdn_url: '/', //used when gulp is in build mode
  sourceDir:      dirs.sourceDir,
  sourceAssetsDir:  dirs.sourceAssetsDir,
  buildDir:      dirs.buildDir,
  buildAssetsDir:    dirs.buildAssetsDir,
  globals: { React: false, '$': false, 'TweenLite': false },
  sources: {
    markup: {
      watchSource: [
        dirs.sourceAssetsDir + 'index.html',
        dirs.sourceAssetsDir + 'templates/*'
      ],
      watchFolder: dirs.sourceAssetsDir + 'templates'
    },
    sass: {
      watchSource: dirs.sourceAssetsDir + 'scss/**/*.scss'
    },
    images: {
      watchSource: [
        dirs.sourceAssetsDir + 'img/**'
      ]
    },
    browserify: {
      watchSource: [
        dirs.sourceAssetsDir + 'js/**/*',        // all js files...
        '!' + dirs.sourceAssetsDir + 'js/bundle.js',  // ...except for bundled js,
        '!' + dirs.sourceAssetsDir + 'js/lib/**/*'    // and libraries
      ],
      entryPoints: [
        {
          entry: dirs.sourceAssetsDir + 'js/main.js',
          dest: 'bundle.js'
        }
      ]
    }
  },
  targets: {
    markup: {
      bundleFileName: dirs.sourceAssetsDir + 'index.html'
    },
    sass: {
      bundleFileName: 'styles.css',
      bundleDir: dirs.sourceAssetsDir + 'css/'
    },
    images: {
      bundleDir: dirs.buildAssetsDir + 'img/'
    },
    browserify: {
      bundleDir: dirs.sourceAssetsDir + 'js/'
    }
  }
};
