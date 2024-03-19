import i18n from '@/i18n'
import ElementUI from 'element-ui'
import cryptoJs from 'crypto-js'

/**
 * 普通数组转树结构
 * @param {Array} source 原数据
 * @param {String} id 键值
 * @param {String} parentId 父级键值
 * @param {String} children 子级键值
 * @returns 树结构
 */
const buildTree = (source, id, parentId, children) => {
  const cloneData = JSON.parse(JSON.stringify(source))
  return cloneData.filter(father => {
    const branchArr = cloneData.filter(child => father[id] === child[parentId])
    branchArr.length > 0 ? (father[children] = branchArr) : ''
    return father[parentId] === '0' // 如果第一层不是parentId=0，请自行修改
  })
}

/**
 * 通过关键字深度筛选树结构数据
 * @param {Array} data 原数据
 * @param {String} key 键值
 * @param {String} childKey 子级键值
 * @param {String} keywords 筛选关键字
 * @returns 筛选后的数组
 */
const deepSearch = (data, key, childKey, keywords) => {
  const baseData = JSON.parse(JSON.stringify(data))
  const newArr = []
  baseData.forEach(item => {
    if (item[childKey] && item[childKey].length > 0) {
      item[childKey] = deepSearch(item[childKey], key, childKey, keywords)
    }
    if (item[key].indexOf(keywords) !== -1 || (item[childKey] && item[childKey].length > 0)) {
      newArr.push(item)
    }
  })
  return newArr
}

/**
 * 下载文件
 * @param {String} data Blob数据
 * @param {String} fileName 下载保存的文件名
 * @param {String} blobType Blob类型
 */
const downloadFile = (
  data,
  fileName,
  blobType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
) => {
  const blob = new Blob([data], {
    type: blobType
  })
  const downloadElement = document.createElement('a')
  // 创建下载的链接
  const href = window.URL.createObjectURL(blob)
  downloadElement.href = href
  // 下载后文件名
  downloadElement.download = fileName
  document.body.appendChild(downloadElement)
  // 点击下载
  downloadElement.click()
  // 下载完成移除元素
  document.body.removeChild(downloadElement)
  // 释放掉blob对象
  window.URL.revokeObjectURL(href)
}

// 通过子id？获取父级
const getParentsById = (tree, id, key) => {
  for (const i in tree) {
    if (tree[i][key] === id) {
      return [tree[i]]
    }
    if (tree[i].children) {
      const node = getParentsById(tree[i].children, id, key)
      if (node !== undefined) {
        const rsNode = node.concat(tree[i])
        return rsNode
      }
    }
  }
}

const deepClone = obj => {
  const objClone = Array.isArray(obj) ? [] : {}
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        objClone[key] = deepClone(obj[key])
      } else {
        objClone[key] = obj[key]
      }
    }
  }
  return objClone
}

// 时间转秒
const timeToSec = time => {
  let s = ''
  const hour = time.split(':')[0]
  const min = time.split(':')[1]
  s = Number(hour * 3600) + Number(min * 60)
  return s
}

/**
 * 格式化时间
 * 调用formatDate(strDate, 'yyyy-MM-dd');
 * @param strDate（中国标准时间、时间戳等）
 * @param strFormat（返回格式）
 */
const formatDate = (strDate, strFormat = 'yyyy-MM-dd HH:mm:ss') => {
  if (!strDate) return ''
  strDate = new Date(strDate)

  if (strDate instanceof Date) {
    const dict = {
      yyyy: strDate.getFullYear(),
      M: strDate.getMonth() + 1,
      d: strDate.getDate(),
      H: strDate.getHours(),
      m: strDate.getMinutes(),
      s: strDate.getSeconds(),
      MM: ('' + (strDate.getMonth() + 101)).substring(1),
      dd: ('' + (strDate.getDate() + 100)).substring(1),
      HH: ('' + (strDate.getHours() + 100)).substring(1),
      mm: ('' + (strDate.getMinutes() + 100)).substring(1),
      ss: ('' + (strDate.getSeconds() + 100)).substring(1)
    }
    return strFormat.replace(/(yyyy|MM?|dd?|HH?|mm?|ss?)/g, function() {
      return dict[arguments[0]]
    })
  } else {
    return ''
  }
}

// 获取整点秒时间
const getDateTime = time => {
  let date = new Date()
  if (time) {
    date = new Date(time)
  }

  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const h = date.getHours()
  const mm = date.getMinutes()
  return (
    y +
    '-' +
    (m < 10 ? '0' + m : m) +
    '-' +
    (d < 10 ? '0' + d : d) +
    ' ' +
    (h < 10 ? '0' + h : h) +
    ':' +
    (mm < 10 ? '0' + mm : mm) +
    ':00'
  )
}

const pickerOptionsClassMonth = _this => {
  const shortcuts = [
    {
      text: _this.$t('LATEST_WEEK'),
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        picker.$emit('pick', [start, end])
      }
    },
    {
      text: _this.$t('LAST_MONTH'), // '最近一个月',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        picker.$emit('pick', [start, end])
      }
    },
    {
      text: _this.$t('LAST_3_MONTHS'), // '最近三个月',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
        picker.$emit('pick', [start, end])
      }
    }
  ]

  return { shortcuts }
}

const pickerOptionsClassOneWeek = _this => {
  const shortcuts = [
    {
      text: _this.$t('LAST_FIVE_MINUTES'), // '最近五分钟',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 300 * 1000)
        picker.$emit('pick', [start, end])
      }
    },
    {
      text: _this.$t('LAST_HOUR'), // '最近一小时',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000)
        picker.$emit('pick', [start, end])
      }
    },
    {
      text: _this.$t('RECENTLY_A_DAY'), // '最近一天',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
        picker.$emit('pick', [start, end])
      }
    },
    {
      text: _this.$t('LATEST_WEEK'), // '最近一周',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        picker.$emit('pick', [start, end])
      }
    },
    {
      text: _this.$t('LAST_MONTH'), // '最近一月',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        picker.$emit('pick', [start, end])
      }
    },
    {
      text: _this.$t('LAST_3_MONTHS'), // '最近三月',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
        picker.$emit('pick', [start, end])
      }
    },
    {
      text: _this.$t('LAST_YEAR'), // '最近一年',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
        picker.$emit('pick', [start, end])
      }
    }
  ]
  return { shortcuts }
}

/**
 * 筛选整合推荐路由信息
 * @param {Object} data 推荐路由信息
 * @param {Boolean} noRepeat 是否去重
 * @returns
 */
const formatRecommend = (data, noRepeat) => {
  // 剔除没有通道推荐出来的
  data = data.filter(i => i.channel.TIME && i.channel.LOSS)
  // 拼接组合数据：双芯数据拼接到一条里面
  const newList = []
  data.forEach(i => {
    // 同链路通道拼接：设置链路唯一linkId 使用通道id拼接保证一定是唯一的
    i.linkId = i.segmentList.map(j => j.id).join()
    const theIndex = newList.findIndex(j => j.linkId === i.linkId)
    i.channel.LOSS.channelType = 'loss'
    i.channel.TIME.channelType = 'time'
    if (theIndex !== -1) {
      newList[theIndex].lossList.push(i.channel.LOSS)
      newList[theIndex].timeList.push(i.channel.TIME)
    } else {
      const item = deepClone(i)
      item.lossList = [i.channel.LOSS]
      item.timeList = [i.channel.TIME]
      newList.push(item)
    }
  })
  // 同链路通道拼接完成，设置表单显示信息
  newList.forEach(z => {
    let channelList = [...deepClone(z.lossList), ...deepClone(z.timeList)]
    channelList.forEach(i => {
      i.segmentListIds = z.linkId
      i.checked = false
      i.exclusive = 'SHARE'
      i.segmentList.forEach((j, index) => {
        i['segmentList' + index] = j
      })
    })
    // 去重
    if (noRepeat) {
      const noRepeatArr = []
      channelList.forEach(i => {
        i.linkId = i.segmentList.map(j => j.id).join()
        const theIndex = noRepeatArr.findIndex(j => j.linkId === i.linkId)
        if (theIndex === -1) {
          noRepeatArr.push(i)
        }
      })
      channelList = noRepeatArr
    }
    z.channelList = channelList
  })

  return newList
}

/**
 * 检查所选通道AFS设备是否可用，不可用给出提示
 * @param {Object} data 选择的路由、通道信息{routeData：{segmentList:[]},channelData:[]}
 * @returns
 */
/* 筛选afs状态
正常状态：
IDLE("空闲"),
LOWER_POWER("低功耗"),
LOW_POWER("低功耗"),
READY("准备进入低功耗"),
CANCEL("设备不处于低功耗状态"),
STANDBY("待机状态 "), AFSNEW-2642

可继续开通：
TRANSFER("移纤"),
OTDR_TRANSFER("OTDR移纤"),
OTDR_TEST("OTDR测试"),
OTDR_RESTORE("OTDR恢复"),
MOTION("运动"),
UNPLUG("光纤拔出"),

不可用状态：
PAUSE("暂停"),
REGULATE("调校"),
CHECK("巡检"),
FOTA("FOTA升级"),
HEATING("预热状态 "),
SELF_CHECK("自检状态 "),
INIT("初始化"),
FAULT("故障"),
PROTECT("保护");
OFF_LINE("离线"),
DISABLE("设备低功耗不可用"),
*/

// 校验割接信息是否可以继续

const confirmBox = (busyMsg, type) => {
  return new Promise(resolve => {
    const errMsg = busyMsg.join() + ',' + i18n.t('CONTINUE_OPERATION', { msg: i18n.t(type) })
    ElementUI.MessageBox.confirm(errMsg, {
      confirmButtonText: i18n.t('CONTINUE'),
      cancelButtonText: i18n.t('CANCEL'),
      type: 'warning'
    })
      .then(() => {
        resolve(true)
      })
      .catch(() => {
        resolve(false)
      })
  })
}

const splitCheck = async data => {
  const result = {}
  // console.log('splitCheck', result)
  return result
    .map(i => {
      const name = i.data ? i.data.deviceName || i.data.deviceId : ''
      return name + i18n.t(i.message)
    })
    .join()
}
const checkCluster = async(clusterId, status) => {
  const result = {}
  return result.map(i => i.deviceName + i18n.t('AFS_STATUS_' + status)).join()
}

const afsStatusMsg = async(afsStatus, cutAfs, afsData, errStatus, busyStatus, cutoverList) => {
  const offlineMsg = []
  const errorMsg = []
  const busyMsg = []
  for (const i of afsStatus) {
    const msg = i18n.t('DEVICE') + cutAfs[i.deviceId]
    if (i.protect) {
      errorMsg.push(msg + i18n.t('AFS_STATUS_PROTECT'))
      continue
    }
    if (i.onlineStatus === 'OFFLINE' && i.lowPowerType !== 'LOW_POWER') {
      offlineMsg.push(msg + i18n.t('OFFLINE'))
      continue
    }
    if (afsData[i.deviceId].nodeType === 'CLUSTER') {
      console.log('cutoverList', cutoverList)
      const clusterMsg = await splitCheck({
        cutoverList: cutoverList.filter(j => j.deviceId === i.deviceId),
        deviceId: i.deviceId
      })
      if (clusterMsg.length) {
        errorMsg.push(i18n.t('SUBDEVICE_IN_CLUSTER', { device: msg, children: clusterMsg }))
        continue
      }
      if (i.onlineStatus === 'MOTION') {
        const clusterMsg = await checkCluster(i.deviceId, 'MOTION')
        errorMsg.push(i18n.t('SUBDEVICE_IN_CLUSTER', { device: msg, children: clusterMsg }))
        continue
      }
    }
    if (errStatus.includes(i.afsStatus)) {
      errorMsg.push(msg + i18n.t('AFS_STATUS_' + i.afsStatus))
      continue
    }
    if (busyStatus.includes(i.afsStatus)) {
      busyMsg.push(msg + i18n.t('AFS_STATUS_' + i.afsStatus))
    }
  }
  return { offlineMsg, errorMsg, busyMsg }
}

const checkAfs = async(data, type, isOtdr = false) => {
  console.log('otdr', data)
  const errStatus = [
    'PAUSE',
    'REGULATE',
    'CHECK',
    'FOTA',
    'HEATING',
    'SELF_CHECK',
    'INIT',
    'FAULT',
    'DISABLE'
  ]
  const busyStatus = ['TRANSFER', 'OTDR_TRANSFER', 'OTDR_TEST', 'OTDR_RESTORE', 'MOTION', 'UNPLUG']
  const afsData = {}
  data.routeData.segmentList.forEach(i => {
    if (i.endNodeCategory === 'AFS') {
      afsData[i.endNodeId] = i.endNode
    }
  })
  console.log('afsData', afsData)
  // 需要移纤的设备
  const cutAfs = {}
  let cutoverList = []
  if (!isOtdr) {
    const cutIds = {}
    data.channelData.forEach(i => {
      cutoverList = [...cutoverList, ...i.cutoverList]
      i.cutoverList.forEach(j => {
        const node = afsData[j.port.nodeId]
        const deviceId = node && node.nodeType === 'CLUSTER' ? j.port.nodeId : j.port.deviceId
        cutIds[j.portId] = j
        cutIds[j.connPortId] = {
          deviceName: j.deviceName,
          portId: j.connPortId,
          port: j.connPort
        }
        if (!cutAfs[deviceId] && j.cutoverTime) {
          cutAfs[deviceId] = j.deviceName
        }
      })
    })
    const eidStatus = {}
    const eidErr = []
    Object.keys(eidStatus).forEach(i => {
      if (eidStatus[i]) {
        const portData = cutIds[i] || {}
        const errMsg = i18n.t('EID_PORT_ERR', {
          deviceName: portData.deviceName,
          portName: portData.port.bizName,
          errType: i18n.t('EID_STATUS_' + eidStatus[i])
        })
        eidErr.push(errMsg)
      }
    })
    if (eidErr.length) {
      ElementUI.Message({
        showClose: true,
        type: 'error',
        message: eidErr.join('，') + '，' + i18n.t('UNABLE_OPERATION', { msg: i18n.t(type) })
      })
      return false
    }
    // 不需要移纤
    if (!Object.keys(cutAfs).length || !cutoverList.length) {
      return true
    }

    // 校验割接信息是否可以继续
    const cutResult =
      type === 'INTELLIGENCE_RESTORE'
    console.log('afsStatus', cutResult)

    if (!cutResult) {
      ElementUI.Message({
        showClose: true,
        type: 'error',
        message: i18n.t('CUTOVER_NOT_SUPPORTED', { msg: i18n.t(type) })
      })
      return false
    }
  } else {
    console.log('otdr', data)
    data.routeData.segmentList.forEach(i => {
      if (i.endNodeCategory === 'AFS') {
        cutAfs[i.endNodeId] = i.endNode.nodeName
      }
    })
    if (Object.keys(cutAfs).length < 2) {
      ElementUI.Message({
        showClose: true,
        type: 'error',
        message: i18n.t('NO_OTDR_TEST_PORT')
      })
      return false
    }
  }
  // 需要割接的afs设备状态
  const afsStatus = {}
  let offlineMsg = []
  let errorMsg = []
  let busyMsg = []
  // 遍历获取设备状态
  const msgObj = await afsStatusMsg(afsStatus, cutAfs, afsData, errStatus, busyStatus, cutoverList)
  offlineMsg = offlineMsg.concat(msgObj.offlineMsg)
  errorMsg = errorMsg.concat(msgObj.errorMsg)
  busyMsg = busyMsg.concat(msgObj.busyMsg)

  // 离线或者不可用状态弹出提示，不能下一步
  if (offlineMsg.length || errorMsg.length) {
    ElementUI.Message({
      showClose: true,
      type: 'error',
      message:
        (offlineMsg.length ? offlineMsg.join() : errorMsg.join()) +
        ';' +
        i18n.t('UNABLE_OPERATION', { msg: i18n.t(type) })
    })
    return false
  }
  // 繁忙状态弹出选择框，用户选择继续下一步
  if (busyMsg.length) {
    return await confirmBox(busyMsg, type)
  }
  return true
}

// 小数点限制
const changeDecimal = (num, size = 3, fixed = false) => {
  if (isNaN(num)) {
    return ''
  }
  num = Math.round(num * Math.pow(10, size)) / Math.pow(10, size)
  return fixed && num ? num.toFixed(size) : num
}

/**
 * 处理空数据
 * @param {Number/String} val 值（数字或字符型数字）
 * @param {String} unit 单位
 * @returns 带单位的值
 */
const handleEmpty = (val, unit) => {
  if (
    typeof val === 'undefined' ||
    val === null ||
    (val === '' && val !== 0) ||
    val === 'null' ||
    val === '--'
  ) {
    return '--'
  }
  if (unit) {
    return val + unit
  } else {
    return val
  }
}

const throttle = (func, limit = 2000) => {
  // 上次执行时间
  let previous = 0
  return function() {
    // 当前时间
    const now = Date.now()
    const context = this
    const args = arguments
    // 若上次时间-上次执行时间大于时间限制
    if (now - previous > limit) {
      func.apply(context, args)
      previous = now
    }
  }
}

const correctChannel = (data, needReverse) => {
  let start = 'start'
  let end = 'end'
  if (needReverse) {
    start = 'end'
    end = 'start'
  }
  const item = {
    ...data,
    startNode: data[start + 'Node'],
    startNodeCategory: data[start + 'NodeCategory'],
    startNodeId: data[start + 'NodeId'],
    startStationId: data[start + 'StationId'],
    startPort: data[start + 'Port'],
    startPortId: data[start + 'PortId'],
    startPortCategory: data[start + 'PortCategory'],
    endNode: data[end + 'Node'],
    endNodeCategory: data[end + 'NodeCategory'],
    endNodeId: data[end + 'NodeId'],
    endStationId: data[end + 'StationId'],
    endPort: data[end + 'Port'],
    endPortId: data[end + 'PortId'],
    endPortCategory: data[end + 'PortCategory']
  }
  return item
}

// 表头反向纠正
const correctOrder = (data, startNodeId) => {
  // console.log('correctOrder', startNodeId)
  // console.log('correctOrder', data)
  return data.reduce((prev, curr, index) => {
    let needReverse = false
    if (index === 0 && startNodeId && startNodeId !== curr.startNodeId) {
      needReverse = true
    }
    if (index !== 0 && prev[index - 1].endNodeId !== curr.startNodeId) {
      needReverse = true
    }
    const item = correctChannel(curr, needReverse)
    prev.push(item)
    return prev
  }, [])
}

const getTextWidth = str => {
  let width = 0
  const html = document.createElement('span')
  html.innerText = str
  html.className = 'getTextWidth'
  document.querySelector('body').appendChild(html)
  width = document.querySelector('.getTextWidth').offsetWidth
  document.querySelector('.getTextWidth').remove()
  return width
}

const tableRenderHeader = (h, data) => {
  let contentHtml = h('span', data.column.label)
  if (getTextWidth(data.column.label) > (data.column.width || data.column.minWidth)) {
    contentHtml = h('div', [
      h(
        'el-tooltip',
        {
          attrs: {
            class: 'text-ellipsis',
            effect: 'dark',
            content: data.column.label,
            placement: 'top'
          }
        },
        [h('div', data.column.label)]
      )
    ])
  }
  return contentHtml
}

/**
 * 十六进制color颜色/RGBA/RGB，改变透明度
 * @param {*} thisColor #555 rgba(85,85,85,0.6) rgb(85,85,85)
 * @param {*} thisOpacity 0.7
 * @returns rgba(85,85,85,0.7)
 */
const getOpacityColor = (thisColor, thisOpacity) => {
  let theColor = thisColor.toLowerCase()
  // 十六进制颜色值的正则表达式
  const r = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  // 如果是16进制颜色
  if (theColor && r.test(theColor)) {
    if (theColor.length === 4) {
      let sColorNew = '#'
      for (let i = 1; i < 4; i += 1) {
        sColorNew += theColor.slice(i, i + 1).concat(theColor.slice(i, i + 1))
      }
      theColor = sColorNew
    }
    // 处理六位的颜色值
    const sColorChange = []
    for (let j = 1; j < 7; j += 2) {
      sColorChange.push(parseInt('0x' + theColor.slice(j, j + 2)))
    }
    return 'rgba(' + sColorChange.join(',') + ',' + thisOpacity + ')'
  }
  // 如果是rgba或者rgb
  if (theColor.startsWith('rgb')) {
    let numbers = theColor.match(/(\d(\.\d+)?)+/g)
    numbers = numbers.slice(0, 3).concat(thisOpacity)
    return 'rgba(' + numbers.join(',') + ')'
  }

  return theColor
}

// 节点管理接头盒端口配置 生成uuid
function generateUuid() {
  // 生成16字节的随机数
  const bytes = cryptoJs.lib.WordArray.random(16)
  // 将字节转换为十六进制字符串，并格式化为UUID
  const uuid = bytes
    .toString(cryptoJs.enc.Hex)
    .replace(
      /([0-9a-fA-F]{8})([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]{12})/,
      '$1-$2-$3-$4-$5'
    )
  return uuid
}

// AFSNEW-4045 文档提供的颜色
const defaultAlarmColor = {
  1: 'rgba(230, 0, 0, 1)',
  2: 'rgba(254, 105, 0, 1)',
  3: 'rgba(247, 218, 0, 1)',
  4: 'rgba(34, 34, 218, 1)'
}

// 处理设备检修告警描述
const handleAfsMaintText = desc => {
  try {
    if (desc.includes('TRIG_MAINT_ALARM') || desc.includes('CLEAR_MAINT_ALARM')) {
      // 检修上报上来的格式：{M4_TAIL}[65522]{TRIG_MAINT_ALARM},{CURRENT_VALUE}[4691],{THRESHOLD}[50]{UNIT_C}
      const descList = desc.split(',') || desc.split('，')
      if (descList[1]) {
        if (desc.includes('{UNIT_D}')) {
          descList[1] = descList[1] + '{UNIT_D}'
        } else if (desc.includes('{UNIT_M}')) {
          descList[1] = descList[1] + '{UNIT_M}'
        } else if (desc.includes('{UNIT_C}')) {
          descList[1] = descList[1] + '{UNIT_C}'
        }
      }
      desc = descList.join(',')
    }
    return desc
  } catch (error) {
    return desc
  }
}

export {
  buildTree,
  deepSearch,
  downloadFile,
  getParentsById,
  deepClone,
  timeToSec,
  pickerOptionsClassMonth,
  pickerOptionsClassOneWeek,
  formatRecommend,
  formatDate,
  checkAfs,
  changeDecimal,
  handleEmpty,
  throttle,
  correctOrder,
  tableRenderHeader,
  defaultAlarmColor,
  correctChannel,
  getDateTime,
  getOpacityColor,
  generateUuid,
  handleAfsMaintText
}
