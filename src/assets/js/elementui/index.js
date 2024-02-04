/**
 * ElementUI引入配置
 */
import 'element-ui/lib/theme-chalk/index.css'

import Vue from 'vue'
import ElementUI from 'element-ui'
// import ElementLocale from 'element-ui/lib/locale'
// import ElementZh from 'element-ui/lib/locale/lang/zh-CN'
// import ElementEn from 'element-ui/lib/locale/lang/en'
// import i18n from '@/i18n'
import vm from '@/main.js'

// 设置message弹窗关闭按钮
const messages = ['success', 'warning', 'info', 'error']
messages.forEach(type => {
  ElementUI.Message[type] = options => {
    if (typeof options === 'string') {
      options = {
        message: options
      }
      options.showClose = true
    }
    options.type = type
    return ElementUI.Message(options)
  }
})

// 设置confirm弹窗按钮为小弹窗
ElementUI.MessageBox.setDefaults({
  cancelButtonClass: 'el-button--mini',
  confirmButtonClass: 'el-button--mini'
})

// Vue使用ElementUI组件
Vue.use(ElementUI, {
  size: 'mini' // 定义组件size默认为mini
})

// i18n融合ElementUI国际化
// i18n.mergeLocaleMessage('zh-CN', ElementZh)
// i18n.mergeLocaleMessage('en-US', ElementEn)
// ElementLocale.i18n((key, value) => i18n.t(key, value))

/** 弹窗拖拽配置 */
const elDragDialog = {
  bind(el, binding, vnode, oldVnode) {
    // 弹框可拉伸最小宽高
    const minWidth = 200
    const minHeight = 140
    // 初始非全屏
    let isFullScreen = false
    // 当前宽高
    let nowWidth = 0
    let nowHight = 0 // eslint-disable-line
    // 当前顶部高度
    let nowMarginTop = 0
    // 获取弹框头部（这部分可双击全屏）
    const dialogHeaderEl = el.querySelector('.el-dialog__header')
    // 获取底部元素
    const dialogFooterEl = el.querySelector('.el-dialog__footer')
    let hasSetBodyHight = false
    // 弹窗
    const dragDom = el.querySelector('.el-dialog')
    // 给弹窗加上overflow auto；不然缩小时框内的标签可能超出dialog；
    // dragDom.style.overflow = "auto";
    // 清除选择头部文字效果
    dialogHeaderEl.onselectstart = new Function('return false')
    // 头部加上可拖动cursor
    dialogHeaderEl.style.cursor = 'move'
    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null)
    // 头部插入最大化最小化元素
    const maxMin = document.createElement('button')
    maxMin.className += ' el-dialog__headerbtn el-dialog__minmax'
    maxMin.style.right = '50px'
    maxMin.style.color = '#909399'
    maxMin.title = '最大化'
    maxMin.innerHTML = '<i class="el-icon-full-screen" onMouseOver="this.style.color=\'#409EFF\'" onMouseOut="this.style.color=\'inherit\'"></i>'
    dialogHeaderEl.insertBefore(maxMin, dialogHeaderEl.childNodes[1])
    let heightFixed = false
    let heightAuto = false
    if (binding.value) {
      /* eslint-disable */
      heightFixed = binding.value.heightFixed == true
      heightAuto = binding.value.heightAuto == true
      /* eslint-enable */
    }
    const moveDown = e => {
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - dialogHeaderEl.offsetLeft
      const disY = e.clientY - dialogHeaderEl.offsetTop
      // 获取到的值带px 正则匹配替换
      let styL, styT
      // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
      if (sty.left.includes('%')) {
        styL = +document.body.clientWidth * (+sty.left.replace(/\%/g, '') / 100)
        styT = +document.body.clientHeight * (+sty.top.replace(/\%/g, '') / 100)
      } else {
        styL = +sty.left.replace(/\px/g, '')
        styT = +sty.top.replace(/\px/g, '')
      }
      document.onmousemove = e => {
        // 通过事件委托，计算移动的距离
        const l = e.clientX - disX
        const t = e.clientY - disY
        // 移动当前元素
        dragDom.style.left = `${l + styL}px`
        dragDom.style.top = `${t + styT}px`
        // 将此时的位置传出去
        // binding.value({x:e.pageX,y:e.pageY})
      }
      document.onmouseup = e => {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
    dialogHeaderEl.onmousedown = moveDown
    let bodyHeight = 'auto'
    const setMaxMin = () => {
      if (!isFullScreen) {
        const i = maxMin.querySelector('.el-icon-full-screen')
        i.classList.remove('el-icon-full-screen')
        i.classList.add('el-icon-crop')
        maxMin.title = '还原'
        bodyHeight = dragDom.querySelector('.el-dialog__body').offsetHeight
        nowHight = dragDom.clientHeight
        nowWidth = dragDom.clientWidth
        nowMarginTop = dragDom.style.marginTop
        dragDom.style.left = 0
        dragDom.style.top = 0
        dragDom.style.height = '100VH'
        dragDom.style.width = '100VW'
        dragDom.style.marginTop = 0
        isFullScreen = true
        dialogHeaderEl.style.cursor = 'initial'
        dialogHeaderEl.onmousedown = null
        if (!hasSetBodyHight) {
          // const dialogFooterEl = el.querySelector('.el-dialog__footer')
          const footerHeight = dialogFooterEl ? dialogFooterEl.offsetHeight : 0
          const maxHeight = `calc(100% - ${dialogHeaderEl.offsetHeight + footerHeight}px)`
          dragDom.querySelector('.el-dialog__body').style.maxHeight = maxHeight
          dragDom.querySelector('.el-dialog__body').style.height = maxHeight
          hasSetBodyHight = true
        }
      } else {
        const i = maxMin.querySelector('.el-icon-crop')
        i.classList.remove('el-icon-crop')
        i.classList.add('el-icon-full-screen')
        maxMin.innerHTML = '<i class="el-icon-full-screen"></i>'
        maxMin.title = '最大化'
        dragDom.style.height = 'auto'
        dragDom.style.width = `${nowWidth}px`
        dragDom.style.marginTop = nowMarginTop
        isFullScreen = false
        dialogHeaderEl.style.cursor = 'move'
        dialogHeaderEl.onmousedown = moveDown
        dragDom.querySelector('.el-dialog__body').style.maxHeight = '600px'
        let reduceHeight = 'auto'
        if (heightFixed) {
          reduceHeight = `${bodyHeight}px`
        }
        dragDom.querySelector('.el-dialog__body').style.height = reduceHeight
        hasSetBodyHight = false
      }
      vm.$bus.$emit('dragDialogChange')
    }
    // 点击放大缩小效果
    maxMin.onclick = setMaxMin
    // 双击头部效果
    dialogHeaderEl.ondblclick = setMaxMin

    // 拉伸
    const resizeEl = document.createElement('div')
    dragDom.appendChild(resizeEl)
    // 在弹窗右下角加上一个10-10px的控制块
    resizeEl.style.cursor = 'se-resize'
    resizeEl.style.position = 'absolute'
    resizeEl.style.height = '10px'
    resizeEl.style.width = '10px'
    resizeEl.style.right = '0px'
    resizeEl.style.bottom = '0px'
    // 鼠标拉伸弹窗
    resizeEl.onmousedown = e => {
      // 记录初始x位置
      const clientX = e.clientX
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - resizeEl.offsetLeft
      const disY = e.clientY - resizeEl.offsetTop
      console.log(hasSetBodyHight)
      document.onmousemove = e => {
        e.preventDefault() // 移动时禁用默认事件
        // 通过事件委托，计算移动的距离
        const x = e.clientX - disX + (e.clientX - clientX)// 这里由于elementUI的dialog控制居中的，所以水平拉伸效果是双倍
        const y = e.clientY - disY
        // 比较是否小于最小宽高
        dragDom.style.width = x > minWidth ? `${x}px` : `${minWidth}px`
        dragDom.style.height = y > minHeight ? `${y}px` : `${minHeight}px`
        if (!hasSetBodyHight) {
          // const dialogFooterEl = el.querySelector('.el-dialog__footer')
          const footerHeight = dialogFooterEl ? dialogFooterEl.offsetHeight : 0
          const stretchHeight = `calc(100% - ${dialogHeaderEl.offsetHeight + footerHeight}px)`
          dragDom.querySelector('.el-dialog__body').style.maxHeight = stretchHeight
          dragDom.querySelector('.el-dialog__body').style.height = stretchHeight
          hasSetBodyHight = true
        }
      }
      // 拉伸结束
      document.onmouseup = e => {
        document.onmousemove = null
        document.onmouseup = null
        if (heightAuto) {
          dragDom.style.height = 'auto'
          dragDom.querySelector('.el-dialog__body').style.height = 'auto'
        }
      }
    }
  }
}

// 注册标签Vue指令，指令为：v-el-drag-dialog
Vue.directive('el-drag-dialog', elDragDialog)

// 弹窗默认配置
ElementUI.Dialog.props.closeOnClickModal.default = false
ElementUI.Dialog.props.closeOnPressEscape.default = false
