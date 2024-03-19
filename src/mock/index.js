import Mock from 'mockjs'

const modulesFiles = require.context('./data', true, /\.js$/)
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})
console.log(modules)
// http://192.168.55.117/services/oen/topoPosition/getTopos
Mock.mock(/\/oen\/topoPosition\/getTopos/, 'get', options => {
  // console.log(qs.parse(options.url))
  return {
    code: 0,
    data: modules.getTopos,
    exception: null,
    message: '请求成功！'
  }
})
