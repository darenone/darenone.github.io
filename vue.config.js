const { defineConfig } = require('@vue/cli-service')
/* 自定义方法resolve */
const path = require('path')
const resolve = dir => {
  return path.join(__dirname, dir)
}
module.exports = defineConfig({
  transpileDependencies: true,
  outputDir: 'docs',
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src')) // 用@代替src，在项目里你需要引入文件的时候，只需要@/api,@/config,@/mock...即可
      .set('_c', resolve('src/components')) // 用_c代替src/components,我们需要引入组件时，只需要_c/HelloWorld.vue即可
  }
})
