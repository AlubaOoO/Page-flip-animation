const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  lintOnSave: false,
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm-bundler.js'
      }
    }
  }
})
