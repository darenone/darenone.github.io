import axios from 'axios'
import ElementUI from 'element-ui'
import config from '@/config'
import router from '@/router'
import vueInstance from '@/main.js'
import qs from 'qs'
// axios默认配置

if (config && config.baseUrl) {
  axios.defaults.baseURL = config.baseUrl
}
axios.defaults.timeout = 10 * 60 * 1000
axios.defaults.validateStatus = status => status >= 200 && status <= 500
axios.defaults.withCredentials = true

let loading = null
const resultKeepSet = new Set()
// 删除get请求里面的空值
const delEmptyValue = data => {
  Object.keys(data).forEach(i => {
    if (data[i] === '' || data[i] === undefined || data[i] === null) {
      delete data[i]
    }
  })
  return data
}

// HTTPrequest拦截
axios.interceptors.request.use(
  request => {
    if (request.method === 'get' && request.params) {
      request.params = delEmptyValue(request.params)
      request.paramsSerializer = params => {
        return qs.stringify(params, { indices: false })
      }
    }
    // 如果设置了要维持返回原样的结果，就缓存URL作为判断依据
    if (request.resultKeep) {
      const url = (request.baseURL || '') + request.url
      resultKeepSet.add(url)
    }
    request.headers.token = localStorage.getItem('token')
    // console.log(request)
    request.headers.sysid = config.sysId
    const lang = localStorage.getItem('lang')
    if (lang) {
      request.headers['Accept-Language'] = lang
    }
    if (
      (!loading && !(request.params && request.params.hideLoading)) ||
      request.url.includes('/operateLog/add')
    ) {
      loading = ElementUI.Loading.service({
        background: 'rgba(255, 255, 255, 0.1)'
      })
    }
    return request
  },
  error => Promise.reject(error)
)

const whiteList = ['/oen/recom/channelRecom']
const getErrMsg = (token, response) => {
  return (
    (token
      ? response.statusText.toUpperCase()
      : response.statusText) || '未知错误'
  )
}

// HTTPresponse拦截
axios.interceptors.response.use(
  response => {
    if (loading) {
      loading.close()
      loading = null
    }
    // console.log(response)
    // 如果HTTP响应状态为异常，就进行错误提示
    const token = localStorage.getItem('token')
    if (Number(response.status) !== 200) {
      const errMsg = getErrMsg(token, response)
      ElementUI.Message.closeAll()
      vueInstance.$debounce(() => {
        ElementUI.Message({
          showClose: true,
          type: 'error',
          message: errMsg
        })
      })
      return Promise.reject(new Error(errMsg))
    }
    const data = response.data
    if (!data || data.code === undefined) {
      return data
    }
    // 如果业务响应结果代码为异常，就进行错误提示
    const code = Number(data.code)
    let returnData = null
    const message =
      (token ? data.message.toUpperCase() : data.message) ||
      '未知错误'
    switch (code) {
      case 0:
        if (data.data) {
          // 如果当前URL设置了要维持返回原样的结果，就直接返回
          const url = response.config.url
          if (resultKeepSet.has(url)) {
            resultKeepSet.delete(url)
            returnData = data
          } else {
            returnData = data.data
          }
        }
        break
      case 2:
      case 3:
        window.location.href.indexOf('/login') === -1 && router.push('/login')
        returnData = false
        break
      default:
        if (whiteList.some(i => response.config.url.includes(i))) {
          returnData = false
        } else {
          ElementUI.Message.closeAll()
          ElementUI.Message({
            showClose: true,
            type: 'error',
            message: message
          })
          returnData = Promise.reject(new Error(message))
        }
    }
    return returnData
  },
  error => {
    // 比如无网络连接Network Error这种错误会走这里
    if (loading) {
      loading.close()
      loading = null
    }
    return Promise.reject(new Error(error))
  }
)

export default axios
