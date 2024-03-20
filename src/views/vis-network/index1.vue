<template>
  <div class="network-wrap">
    <div class="flex justify-end">
      <el-button type="primary" class="ml-10" @click="renderTopo">
        刷新
      </el-button>
      <el-button type="primary" class="ml-10">
        {{ edit ? '取消编辑' : '编辑' }}
      </el-button>
    </div>
    <div :id="id" class="network" :style="networkStyle" />
    <div
      :id="`${id}EagelEyeVis`"
      class="eagelEyeVis"
      :style="eagleEyeStyle"
    />
    <div
      v-for="room in roomData"
      :id="room.roomId"
      :key="room.roomId"
      :style="{
        top: room.y,
        left: room.x,
        width: room.width,
        height: room.height,
      }"
      class="room-box text-center"
    >
      <span class="font-small">{{ room.roomName }}</span>
    </div>
  </div>
</template>
<script>
  import vis from 'vis'
  import topoPositionApi from '@/api/TopoPositionApi'
  import { formatEdges, formatNodes } from '@/views/antv-g6/format.js'
  export default {
    props: {
      id: {
        type: String,
        default: 'myNetwork'
      }
    },
    data() {
      return {
        myNetwork: null, // 拓扑图实例
        myNode: null, // 拓扑图节点实例
        myEdge: null, // 拓扑图边实例
        eagelEyeVis: null, // 鹰眼拓扑图实例
        scale: 0.2, // 拓扑图和鹰眼初始比例
        dragCode: 0, // 记录当前鼠标拖拽的是哪个拓扑，0-无拖拽 1-拓扑图拖拽 2-鹰眼拖拽
        eagleEyeStyle: {},
        clientX: 0, // 鼠标距离屏幕左侧距离
        clientY: 0, // 鼠标距离屏幕顶部距离
        network_offset_left: 0, // 画布距离屏幕左侧的距离
        network_offset_top: 0, // 画布距离屏幕顶部的距离
        networkStyle: {},
        roomData: [],
        roomList: [],
        roomScale: 1,
        nodes: [],
        edges: [],
        edit: false
      }
    },
    computed: {
      visCfg() {
        return {
          edges: {
            width: 3,
            font: {
              color: '#409EFF',
              align: 'middle',
              background: 'none',
              strokeWidth: 0,
              size: 0
            },
            color: {
              color: '#409EFF'
            }
          },
          nodes: {
            font: {
              color: '#409EFF'
            },
            shape: 'icon', // icon/image icon-矢量图 image-图片 如果设置成矢量图，会识别icon对象里设置的code，如果设置成图片，每个node需要添加image属性
            icon: {
              face: 'iconfont',
              code: '\ue603',
              size: 50, // 50,
              color: '#409EFF'
            }
          },
          layout: {
            randomSeed: 1 // 配置每次生成的节点位置都一样，参数为数字1、2等
          },
          physics: {
            enabled: true, // 默认是true，设置为false后，节点将不会自动改变，拖动谁谁动。不影响其他的节点
            barnesHut: {
              // theta: 0.5,
              gravitationalConstant: -2000,
              centralGravity: 0.3,
              springLength: 95,
              springConstant: 0.04,
              damping: 0.09,
              avoidOverlap: 0
            },
            forceAtlas2Based: {
              // theta: 0.5,
              gravitationalConstant: -150,
              centralGravity: 0.01,
              springConstant: 0.08,
              springLength: 100,
              damping: 0.4,
              avoidOverlap: 0
            },
            maxVelocity: 50,
            minVelocity: 0.1,
            solver: 'forceAtlas2Based',
            timestep: 0.1,
            stabilization: { iterations: 150, enabled: true }
          },
          interaction: {
            navigationButtons: true,
            keyboard: false,
            dragNodes: true, // 是否能拖动节点
            dragView: true, // 是否能拖动画布
            hover: true, // 鼠标移过后加粗该节点和连接线
            multiselect: false, // 按 ctrl 多选
            selectable: true, // 是否可以点击选择
            selectConnectedEdges: false, // 选择节点后是否显示连接线
            hoverConnectedEdges: false, // 鼠标滑动节点后是否显示连接线
            zoomView: true, // 是否能缩放画布
            hideEdgesOnDrag: false
          }
        }
      },
      dictCableLevelList() {
        return [
          'BACKBONE',
          'TRUNK',
          'RELAY',
          'WIRING'
        ]
      }
    },
    mounted() {
      this.getTopos()
      this.$nextTick(() => {
        window.addEventListener('resize', this.init)
      })
    },
    beforeDestroy() {
      this.destroy()
      window.removeEventListener('resize', this.init)
    },
    methods: {
      getTopos() {
        topoPositionApi
          .getTopos()
          .then(res => {
            const { nodes, edges } = res
            this.nodes = formatNodes(nodes)
            this.edges = formatEdges(edges)
            this.nodes.forEach(i => {
              const cableLevelList = []
              const cableIdList = []
              this.edges.forEach(j => {
                if (j.fromNodeId === i.nodeId || j.toNodeId === i.nodeId) {
                  cableLevelList.push(j.cableLevel)
                  cableIdList.push(j.cableId)
                }
              })
              i.cableLevelList = Array.from(new Set(cableLevelList))
              i.cableIdList = Array.from(new Set(cableIdList))
              // 如果站点包含有多个光缆等级，则选择最上面的定为该站点的等级
              const statusIndex = i.cableLevelList.map(z =>
                this.dictCableLevelList.findIndex(j => j === z)
              )
              const cableLevelIndex = statusIndex.length ? Math.min(...statusIndex) : -1
              i.cableLevel = this.dictCableLevelList[cableLevelIndex]
              i.cableLevelIndex = cableLevelIndex
              if (!i.cableLevel) {
                i.cableLevel = ''
              }
            })
            this.init()
          })
          .catch(() => {})
      },
      init() {
        const myNetworkWrap = document.getElementById(this.id).parentNode // 画布容器DOM
        console.log(myNetworkWrap)
        // 计算拓扑图的高度
        this.networkStyle = {
          width: myNetworkWrap.offsetWidth + 'px',
          height: myNetworkWrap.offsetHeight + 'px'
        }
        this.eagleEyeStyle = {
          width: myNetworkWrap.offsetWidth * this.scale + 'px',
          height: myNetworkWrap.offsetHeight * this.scale + 'px'
        }
        this.network_offset_top = myNetworkWrap.offsetTop - 80 // Y偏移量（80是拓扑容器距离浏览器顶部的距离）
        // 必须要加延时函数，等待鹰眼的宽高设置完以后再去渲染拓扑图，不然两个拓扑图会存在位置偏差
        setTimeout(() => {
          this.renderTopo()
        })
      },
      renderTopo() {
        // 渲染拓扑图
        this.destroy()
        if (!document.getElementById(this.id)) return
        this.myNode = new vis.DataSet(this.nodes)
        this.myEdge = new vis.DataSet(this.edges)
        this.myNetwork = new vis.Network(document.getElementById(this.id), { nodes: this.myNode, edges: this.myEdge }, this.visCfg)
        // this.myNetwork = new vis.Network(document.getElementById(this.id), { nodes: this.myNode, edges: this.myEdge }, this.visCfg)
        // this.getRoomList() // 拓扑里根据设备所属站点归类
        // 渲染鹰眼
        // if (document.getElementById(`${this.id}EagelEyeVis`)) {
        //   const vis_instance2 = new RenderVis(
        //     document.getElementById(`${this.id}EagelEyeVis`),
        //     this.nodes,
        //     this.edges
        //   )
        //   vis_instance2.init()
        //   this.eagelEyeVis = vis_instance2.vis_network_instance
        //   this.eagelEyeVis && this.handleDrag() // 拓扑和鹰眼拖拽时互动
        //   this.eagelEyeVis && this.handleZoom() // 缩放联动
        // }
        // this.edgesHover() // 连接线hover
        // this.edgesClick() // 连接线click
        // this.nodesClick() // 节点click
      },
      handleDrag() {
        // 鹰眼跟着拓扑联动
        this.myNetwork.on('dragStart', () => {
          this.dragCode = 1
          this.$emit('dragStart')
        })
        this.myNetwork.on('dragEnd', () => {
          this.dragCode = 0
        })
        this.myNetwork.on('dragging', (properties) => {
          if (this.dragCode === 1) {
            // 拖拽整个拓扑图时，联动
            const { x, y } = this.myNetwork.getViewPosition()
            this.eagelEyeVis.moveTo({
              position: {
                x: x,
                y: y
              }
            })
            // 拖拽某个节点时，联动
            if (properties.nodes && properties.nodes.length) {
              const { x, y } = properties.pointer.canvas
              this.eagelEyeVis.moveNode(properties.nodes[0], x, y)
            }
          }
        })
        // 拓扑跟着鹰眼联动
        this.eagelEyeVis.on('dragStart', () => {
          this.dragCode = 2
        })
        this.eagelEyeVis.on('dragEnd', () => {
          this.dragCode = 0
        })
        this.eagelEyeVis.on('dragging', (properties) => {
          if (this.dragCode === 2) {
            const { x, y } = this.eagelEyeVis.getViewPosition()
            this.myNetwork.moveTo({
              position: {
                x: x,
                y: y
              }
            })
          // 拖拽某个节点时，联动
          // if (properties.nodes && properties.nodes.length) {
          //   const { x, y } = properties.pointer.canvas
          //   this.myNetwork.moveNode(properties.nodes[0], x, y)
          // }
          }
        })
      },
      handleZoom() {
        // 拓扑缩放
        this.myNetwork.on('zoom', (parms) => {
          const { x, y } = this.myNetwork.getViewPosition()
          this.eagelEyeVis.moveTo({
            position: {
              x: x,
              y: y
            },
            scale: parms.scale * this.scale
          })
        })
        // 鹰眼缩放
        this.eagelEyeVis.on('zoom', (parms) => {
          const { x, y } = this.eagelEyeVis.getViewPosition()
          this.myNetwork.moveTo({
            position: {
              x: x,
              y: y
            },
            scale: parms.scale / this.scale
          })
        })
      },
      edgesHover() {
        this.myNetwork.on('hoverEdge', (properties) => {
          this.clientX = properties.event.clientX
          this.clientY = properties.event.clientY
          this.edgesHoverFunc(properties.edge, 'HOVER')
        })
        this.myNetwork.on('blurEdge', (properties) => {
          this.edgesHoverFunc(properties.edge, 'LEAVE')
        })
      },
      edgesHoverFunc(curId, mouseStatus) {
        this.$emit('hoverEdge', {
          id: curId,
          mouseStatus: mouseStatus,
          left: this.clientX, // 当前鼠标在画布中的位置(校准后)
          top: this.clientY - this.network_offset_top
        })
        if (this.operateType === 'open') return
        // 鼠标悬浮在边上，显示边的label，鼠标离开再去掉label
        const hoverData = this.edges.find((i) => i.id === curId)
        const groupData = hoverData.groupId
          ? this.edges.filter((i) => i.groupId === hoverData.groupId)
          : [hoverData]
        const size = mouseStatus === 'LEAVE' ? 0 : 18
        groupData.forEach((i) => {
          let color = '#cccccc'
          if (mouseStatus === 'LEAVE') {
            color = i.color.color
          }
          this.myEdge.update([
            {
              id: i.id,
              font: { size: size },
              color: {
                color: color
              }
            }
          ])
        })
      },
      edgesClick() {
        // 选中连接线
        this.myNetwork.on('selectEdge', (properties) => {
          console.log(properties)
          this.clientX = properties.event.center.x
          this.clientY = properties.event.center.y
          this.edges.forEach((ele) => {
            if (ele.id === properties.edges[0]) {
              this.$emit('selectEdge', {
                id: properties.edges[0],
                mouseStatus: 'SELECT',
                label: ele.label,
                left: this.clientX,
                top: this.clientY - this.network_offset_top
              })
            }
          })
        })
        // 取消选中连接线
        this.myNetwork.on('deselectEdge', (properties) => {
          if (!properties.edges.length) {
            // 单纯取消当前选中的连线，而不是从一个选中连线切换到另一个选中连线
            this.$emit('selectEdge', {
              id: properties.previousSelection.edges[0],
              mouseStatus: 'CANCEL',
              left: 0,
              top: 0
            })
          }
        })
      },
      nodesClick() {
        // 选中节点
        this.myNetwork.on('selectNode', (properties) => {
          this.clientX = properties.event.center.x
          this.clientY = properties.event.center.y
          const currentNode =
            this.nodes.find((i) => i.id === properties.nodes[0]) || {}
          this.$emit('selectNode', {
          ...currentNode,
          ...{
            id: properties.nodes[0],
            mouseStatus: 'SELECT',
            left: this.clientX,
            top: this.clientY - this.network_offset_top
          }
          })
        })
        // 取消选中节点
        this.myNetwork.on('deselectNode', (properties) => {
          if (!properties.nodes.length) {
            // 单纯取消当前选中的节点，而不是从一个选中节点切换到另一个选中节点
            this.$emit('selectNode', {
              id: properties.previousSelection.nodes[0],
              mouseStatus: 'CANCEL',
              left: 0,
              top: 0
            })
          }
        })
      },
      getRoomList() {
        // 划分机房数据
        const roomList = []
        this.nodes.forEach((ele, index) => {
          if (ele.roomId) {
            const curRoom = roomList.find((j) => j.roomId === ele.roomId)
            if (curRoom) {
              curRoom.nodes.push(ele)
            } else {
              roomList.push({
                roomId: ele.roomId,
                roomName: '机房',
                nodes: [ele]
              })
            }
          }
        })
        this.roomList = roomList
        const _this = this
        setTimeout(() => {
          _this.setRoom()
        }, 300)
        this.myNetwork.on('dragEnd', (properties) => {
          this.myNetwork.unselectAll()
        })
        this.myNetwork.on('dragging', (properties) => {
          // 拖拽某个节点时，联动
          if (properties.nodes && properties.nodes.length) {
            // console.log('properties', properties)
            // 更新机房内节点位置
            const { x, y } = properties.pointer.canvas
            this.roomList.forEach((i) => {
              i.nodes.forEach((j) => {
                if (j.id === properties.nodes[0]) {
                  j.x = x
                  j.y = y
                }
              })
            })
          }
          this.setRoom()
        })
        this.myNetwork.on('zoom', (parms) => {
          // console.log('parms', parms)
          this.roomScale = parms.scale
          this.setRoom()
        })
      },
      // 添加机房div框
      setRoom() {
        const scale = this.roomScale < 0.8 ? 0.8 : this.roomScale
        this.roomData = this.roomList.map((i) => {
          const xArray = []
          const yArray = []
          i.nodes.forEach((j) => {
            const domLocation = this.myNetwork.canvasToDOM({ x: j.x, y: j.y }) // 将画布坐标转换为DOM上的坐标，DOM值是相对于Network容器而言
            xArray.push(domLocation.x)
            yArray.push(domLocation.y)
          })
          // 通过机房内最小x、y的值来计算机房盒子大小和定位
          const x1 = Math.min(...xArray)
          const x2 = Math.max(...xArray)
          const y1 = Math.min(...yArray)
          const y2 = Math.max(...yArray)
          return {
            roomId: i.roomId,
            roomName: i.roomName,
            width: (x2 - x1 + 120) * scale + 'px',
            height: (y2 - y1 + 100) * scale + 'px',
            x: x1 - 40 * scale + 'px',
            y: y1 - 50 * scale + 'px'
          }
        })
      // console.log('roomData', this.roomData)
      },
      destroy() {
        if (this.myNetwork) {
          this.myNetwork.destroy()
          this.myNetwork = null
          this.myNode = null
          this.myEdge = null
        }
        if (this.eagelEyeVis) {
          this.eagelEyeVis.destroy()
          this.eagelEyeVis = null
        }
      }
    }
  }
</script>
<style lang="scss" scoped>
.network-wrap {
  height: 100%;
  position: relative;
  .eagelEyeVis {
    position: absolute;
    right: 5px;
    bottom: 5px;
    border: 1px solid #ccc;
  }
  .room-box {
    position: absolute;
    border: 2px dashed #409eff;
    pointer-events: none;
  }
}
</style>
