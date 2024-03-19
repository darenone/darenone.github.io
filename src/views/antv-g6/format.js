import { get } from 'lodash'
import { defaultAlarmColor } from '@/utils/common'
import store from '@/store'

const iconListData = {
  OTN: '\ue66c',
  ASON: '\ue66d',
  PDH: '\ue66e',
  CLUSTER: '\ue66f',
  LIGHT_SPLIT: '\ue671',
  PTN: '\ue672',
  LIGHT_DELIVERY: '\ue673',
  AFS: '\ue68b',
  ROUTER: '\ue675',
  OLT: '\ue676',
  EXCHANGE: '\ue677',
  ODF: '\ue678',
  SDN: '\ue679',
  SDH: '\ue689',
  WDM: '\ue67a',
  AOCC: '\ue68a',
  SPLICE_CLOSURE_DIVERGENCE: '\ue697',
  SPLICE_CLOSURE_DIRECT_CONNECTION: '\ue698'
}
// 多主题颜色获取
const colorData = {
  normal: '#00A084', // 光缆默认颜色
  damage: '#e70d0d',
  level3Color: '#BE8407', // 站点显示的三级告警字体颜色
  topoColor: '#409eff',
  highLight: 'rgba(172, 91, 236, 1)',
  alwaysHighLight: '#4dc86f',
  'color-fault': '#E13C26',
  'color-doing': '#FF9153',
  'color-normal': '#AF27D2'
}
// 站点图标
const staionImage = {
  // 带AFS站点
  AFS: {
    'color-fault': require('@/assets/img/topo/afs_damage.png'),
    'color-doing': require('@/assets/img/topo/afs_alarm_2.png'),
    'color-normal': require('@/assets/img/topo/afs_selected.png'),
    normal: require('@/assets/img/topo/afs_normal.png'),
    damage: require('@/assets/img/topo/afs_damage.png'),
    selected: require('@/assets/img/topo/afs_selected.png'),
    highLight: require('@/assets/img/topo/afs_selected.png'),
    alarm1: require('@/assets/img/topo/afs_alarm_1.png'),
    alarm2: require('@/assets/img/topo/afs_alarm_2.png'),
    alarm3: require('@/assets/img/topo/afs_alarm_3.png'),
    alarm4: require('@/assets/img/topo/afs_alarm_4.png')
  },
  // 带智能光交箱AOCC的站点
  AOCC: {
    'color-fault': require('@/assets/img/topo/aocc_damage.png'),
    'color-doing': require('@/assets/img/topo/aocc_alarm_2.png'),
    'color-normal': require('@/assets/img/topo/aocc_selected.png'),
    normal: require('@/assets/img/topo/aocc_normal.png'),
    damage: require('@/assets/img/topo/aocc_damage.png'),
    selected: require('@/assets/img/topo/aocc_selected.png'),
    highLight: require('@/assets/img/topo/aocc_selected.png'),
    alarm1: require('@/assets/img/topo/aocc_alarm_1.png'),
    alarm2: require('@/assets/img/topo/aocc_alarm_2.png'),
    alarm3: require('@/assets/img/topo/aocc_alarm_3.png'),
    alarm4: require('@/assets/img/topo/aocc_alarm_4.png')
  },
  // 带光交箱的站点
  LIGHT_DELIVERY: {
    'color-fault': require('@/assets/img/topo/light_delivery_damage.png'),
    'color-doing': require('@/assets/img/topo/light_delivery_alarm_2.png'),
    'color-normal': require('@/assets/img/topo/light_delivery_selected.png'),
    normal: require('@/assets/img/topo/light_delivery_normal.png'),
    damage: require('@/assets/img/topo/light_delivery_damage.png'),
    selected: require('@/assets/img/topo/light_delivery_selected.png'),
    highLight: require('@/assets/img/topo/light_delivery_selected.png'),
    alarm1: require('@/assets/img/topo/light_delivery_alarm_1.png'),
    alarm2: require('@/assets/img/topo/light_delivery_alarm_2.png'),
    alarm3: require('@/assets/img/topo/light_delivery_alarm_3.png'),
    alarm4: require('@/assets/img/topo/light_delivery_alarm_4.png')
  },
  // 带集群的站点
  CLUSTER: {
    'color-fault': require('@/assets/img/topo/cluster_damage.png'),
    'color-doing': require('@/assets/img/topo/cluster_alarm_2.png'),
    'color-normal': require('@/assets/img/topo/cluster_selected.png'),
    normal: require('@/assets/img/topo/cluster_normal.png'),
    damage: require('@/assets/img/topo/cluster_damage.png'),
    selected: require('@/assets/img/topo/cluster_selected.png'),
    highLight: require('@/assets/img/topo/cluster_selected.png'),
    alarm1: require('@/assets/img/topo/cluster_alarm_1.png'),
    alarm2: require('@/assets/img/topo/cluster_alarm_2.png'),
    alarm3: require('@/assets/img/topo/cluster_alarm_3.png'),
    alarm4: require('@/assets/img/topo/cluster_alarm_4.png')
  },
  // 不带AFS的站点
  OTHER: {
    'color-fault': require('@/assets/img/topo/damage.png'),
    'color-doing': require('@/assets/img/topo/alarm_2.png'),
    'color-normal': require('@/assets/img/topo/selected.png'),
    normal: require('@/assets/img/topo/normal.png'),
    damage: require('@/assets/img/topo/damage.png'),
    selected: require('@/assets/img/topo/selected.png'),
    highLight: require('@/assets/img/topo/selected.png'),
    alarm1: require('@/assets/img/topo/alarm_1.png'),
    alarm2: require('@/assets/img/topo/alarm_2.png'),
    alarm3: require('@/assets/img/topo/alarm_3.png'),
    alarm4: require('@/assets/img/topo/alarm_4.png')
  },
  VIRTUAL: {
    'color-fault': require('@/assets/img/topo/virtual_damage.png'),
    'color-doing': require('@/assets/img/topo/virtual_alarm_2.png'),
    'color-normal': require('@/assets/img/topo/virtual_selected.png'),
    normal: require('@/assets/img/topo/virtual_normal.png'),
    damage: require('@/assets/img/topo/virtual_damage.png'),
    selected: require('@/assets/img/topo/virtual_selected.png'),
    highLight: require('@/assets/img/topo/virtual_selected.png'),
    alarm1: require('@/assets/img/topo/virtual_alarm_1.png'),
    alarm2: require('@/assets/img/topo/virtual_alarm_2.png'),
    alarm3: require('@/assets/img/topo/virtual_alarm_3.png'),
    alarm4: require('@/assets/img/topo/virtual_alarm_4.png')
  }
}

const nodeColor = node => {
  const alarmLevel = node.alarmLevel || []
  const showLevelList = alarmLevel.filter(i => !store.getters.hideAlarmLevel.includes(i))
  const showLevel = Math.min(...showLevelList, 5)
  if (showLevel === 3) {
    return colorData.level3Color
  }
  return showLevel < 5 ? defaultAlarmColor[showLevel + ''] : colorData.normal
}

const edgeColor = edge => {
  // 光缆故障默认为是1级告警，所以当1级告警图例存在的情况下，故障光缆才显示为红色
  return edge.status === 'DAMAGE' && !store.getters.hideAlarmLevel.includes(1)
    ? colorData.damage
    : colorData.normal
}

const categoryNode = (node, status) => {
  let imgName = status
  if (!status) {
    const alarmLevel = node.alarmLevel || []
    const showLevelList = alarmLevel.filter(i => !store.getters.hideAlarmLevel.includes(i))
    const showLevel = Math.min(...showLevelList, 5)
    imgName = showLevel < 5 ? 'alarm' + showLevel : 'normal'
  }
  let image = ''
  if (node.nodeCategory === 'AFS' && node.nodeType === 'AFS') {
    image = staionImage.AFS[imgName]
  } else if (node.nodeCategory === 'AFS' && node.nodeType === 'AOCC') {
    image = staionImage.AOCC[imgName]
  } else if (node.nodeCategory === 'ODF' && node.nodeType === 'LIGHT_DELIVERY') {
    image = staionImage.LIGHT_DELIVERY[imgName]
  } else if (node.nodeCategory === 'AFS' && node.nodeType === 'CLUSTER') {
    image = staionImage.CLUSTER[imgName]
  } else {
    image = staionImage.OTHER[imgName]
  }
  if (node.virtualFlag) {
    image = staionImage.VIRTUAL[imgName]
  }
  return image
}

// 组装站点显示信息
const formatNodes = (data, type, isOpen = false) => {
  return data.map(i => {
    const labelLength = i.label.length
    if (labelLength > 8) {
      i.label =
        i.label.slice(0, labelLength / 2) +
        '\n' +
        i.label.slice(labelLength / 2)
    }
    // 设备通过设备类型和类别显示图标
    let iconCode = '\ue603'
    let shape = 'image' // 声明节点渲染成图片
    let image = ''
    i.alarmLevel = i.status === 'DAMAGE' ? [1] : []
    let color = nodeColor(i)
    if (type === 'device') {
      let key = i.nodeType
      if (i.nodeType === 'SPLICE_CLOSURE') {
        const connectionModeType = get(
          i,
          'properties.spliceClosure.connectionModeType',
          'DIVERGENCE'
        )
        key = 'SPLICE_CLOSURE_' + connectionModeType
      }
      iconCode = iconListData[key] || iconCode
      shape = 'icon' // 声明节点渲染成icon矢量图
      if (isOpen && i.nodeCategory === 'TRANSPORT') {
        color = colorData.highLight
      }
    } else {
      // if (i.nodeType === 'AOCC') {
      //   iconCode = '\ue651'
      // }
      image = categoryNode(i)
    }
    // color = nodeColor(i)
    return {
      ...i,
      itemType: i.type,
      icon: {
        face: 'iconfont',
        code: iconCode,
        weight: 700,
        size: 50, // 50,
        color: color
      },
      shape: shape,
      image: image,
      font: {
        color: color
      },
      physics: false, // false-节点可拖拽 true-节点不会移动
      x: i.x || 0,
      y: i.y || 0
    }
  })
}

// 组装连接线显示信息
const formatEdges = data => {
  return data
    .filter(i => i.fromNodeId !== i.toNodeId)
    .map(i => {
      const color = edgeColor(i)
      return {
        ...i,
        color: {
          color: color,
          opacity: 0.5
        },
        width: 2, // 线宽2px
        font: {
          color: color,
          size: 0
        }
      }
    })
}

export { formatNodes, formatEdges, colorData, categoryNode, nodeColor, edgeColor }
