import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import autoprefixer from 'autoprefixer';
import fs from 'fs';
import path, { resolve } from 'path';
// import helpers from './src/_helpers/index';

import helpers from './src/web/pub/_helpers/index';

// src 내 빌드 파일 엔트리(html, js, css) 만들기

// const partialPath = 'src/_partials';  // partials 경로
// const helperPath = 'src/_helpers';  // helpers 경로 (엔트리 예외처리)

const partialPath = 'src/web/pub/_partials';
const helperPath = 'src/web/pub/_helpers';

const getEntries = dir => {
  const htmlEntries = {};

  if(dir.length === dir.replace(partialPath, '').length && dir.length === dir.replace(helperPath, '').length ) {
    fs.readdirSync(dir).forEach(item => {
      const itemPath = path.join(dir, item);
  
      if(fs.statSync(itemPath).isFile()) {
        if(path.extname(item) == '.html' || path.extname(item) == '.js' || path.extname(item) == '.css') {
          htmlEntries[itemPath] = resolve(__dirname, itemPath);
        }
      } else {
        Object.assign(htmlEntries, getEntries(itemPath));
      }
    });
  }

  return htmlEntries;
};

const getContexts = dir => {
  const contexts = {};

  fs.readdirSync(dir).forEach(item => {
    const itemPath = path.join(dir, item);

    if(fs.statSync(itemPath).isFile()) {
      if(path.extname(item) == '.json') {
        contexts[itemPath.replace('src','').replace('config.json', 'html')] = JSON.parse(fs.readFileSync(itemPath));
      }
    } else {
      Object.assign(contexts, getContexts(itemPath));
    }
  });

  return contexts;
}

const pageData = getContexts('src');
console.log(getEntries('src'));
export default defineConfig({
// export default {
  root: 'src',
  base: '/',
  publicDir: '../public',
  // publicDir: path.resolve(__dirname, "src/web/pub/img"),
  // assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    // outDir: '../dist',
    outDir: '../dist',
    assetsDir: './',
    cssMinify: false,
    // cssMinify: true,
    overwrite: true,
    rollupOptions: {
      minify: false,
      input: getEntries('src'),
      output: {
        assetFileNames: (entry) => {
          if(path.extname(entry.name) == '.css') {
            return entry.name.replace('src/', '');
          }
          return entry.name;
        },
        entryFileNames: (entry) => {
          if(path.extname(entry.name) == '.js') {
            return path.relative("src", entry.name);
          }
          return entry.name;
        },
      }
    }
  },
  // assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg'],  
  plugins: [
    handlebars({
      // partialDirectory: resolve(__dirname, 'src/_partials'), //partials 경로 설정
      //partials 경로 설정
      partialDirectory: [
        resolve(__dirname, 'src/web/pub/_partials/common'),
        resolve(__dirname, 'src/web/pub/_partials/input'),
        resolve(__dirname, 'src/web/pub/_partials/contents'),
        resolve(__dirname, 'src/web/pub/_partials'),
      ],
      context(pagePath) {
        console.log('test2---');
        console.log(pageData);
        console.log(pagePath);
        return pageData[pagePath];
      },
      helpers, // helpers 등록
      // html: {
      //   inject: {
      //     injectTo: 'head',
      //     // HTML 수정: 경로 변경
      //     inject: (html) => html
      //     // .replace(/href="\/src\/web\/pub\/css\/(common|style)\.css"/g, 'href="/css/$1.css"')
      //       .replace(/href="\/src\/web\/pub\/css\/(common|common)\.css"/g, 'href="/css/$1.css"')
      //       .replace(/href="\/src\/web\/pub\/css\/(common|style)\.css"/g, 'href="/css/$1.css"'),
      //       // .replace(/src="\/src\/web\/pub\/js\/(jquery-3\.7\.1|common)\.min\.js"/g, 'src="../../../../js/$1.min.js"'),
      //   },
      // },
    }),
  ],
  css: {
    // devSourcemap: true,
    postcss: {
      plugins: [
        autoprefixer({
          overrideBrowserslist: ['> 1%', 'last 2 versions', 'Firefox ESR'],
        }),
      ],
    },
    // preprocessorOptions: {
    //   scss: {
    //     additionalData: '@import "@/styles/variables.scss";', // 필요한 SCSS 변수 또는 믹스인 임포트
    //   }
    // }
  },
  server: {
    open: '/web/pub/index.html',
    port: 8081,
  }
});