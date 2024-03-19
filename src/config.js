/** ======================================== 配置加载模块 ======================================== */

import Crypto from 'crypto-js'

/** 环境变量 */
const env = process.env.NODE_ENV

/** 系统配置 */
const config = window.__config__ || {}

// 根据环境变量加载系统配置
if (env === 'development' && config.devConf) {
  valueObject(config, config.devConf)
} else if (env === 'test' && config.testConf) {
  valueObject(config, config.testConf)
} else if (env === 'production' && config.prodConf) {
  valueObject(config, config.prodConf)
  config.wsBaseUrl = `${location.protocol.replace('http', 'ws')}${location.host}${
    config.baseUrl || ''
  }`
}
console.log(config)
// 配置Websocket地址
if (!config.wsBaseUrl) {
  config.wsBaseUrl = config.baseUrl.replace('http', 'ws')
}
// 配置MQTT连接信息
if (config.mqtt) {
  if (config.mqtt.service && !config.mqtt.service.includes('//')) {
    if (config.baseUrl.includes('//')) {
      config.mqtt.service = `${config.baseUrl.replace('http', 'mqtt')}${config.mqtt.service}`
    } else {
      config.mqtt.service = `mqtt://${location.host}${config.baseUrl || ''}${config.mqtt.service}`
    }
  }
  if (config.mqtt.password) {
    const pwd = Crypto.enc.Base64.parse(config.mqtt.password)
    config.mqtt.password = pwd.toString(Crypto.enc.Utf8)
  }
}

/**
 * 对象递归赋值
 *
 * @param target 目标对象
 * @param source 来源对象
 */
function valueObject(target, source) {
  if (!target || !source) {
    return
  }
  for (const [k, v] of Object.entries(source)) {
    if (v != null && typeof v === 'object' && Object.keys(v).length) {
      if (!target[k]) {
        target[k] = {}
      }
      valueObject(target[k], v)
    } else {
      target[k] = v
    }
  }
}

export default config
