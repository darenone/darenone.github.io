// 模拟鹰眼效果
<template>
  <div class="vis-wrap h-100 flex-column relative">
    <div class="flex justify-end">
      <el-button type="primary" class="ml-10" @click="renderTopo">
        刷新
      </el-button>
      <el-button type="primary" class="ml-10" @click="setEditable(edit = !edit)">
        {{ edit ? '取消编辑' : '编辑' }}
      </el-button>
    </div>
    <div :id="id" class="vis-container flex1" :style="networkStyle" />
    <div
      :id="`${id}EagelEyeVis`"
      :ref="`${id}EagelEyeVis`"
      class="eagelEyeVis"
      :style="eagleEyeStyle"
    />
  </div>
</template>
<script>
  import vis from 'vis'
  import visCfg from '../visCfg.js'
  import { formatEdges, formatNodes } from '@/views/antv-g6/format.js'
  import topoPositionApi from '@/api/TopoPositionApi'
  export default {
    props: {
      id: {
        type: String,
        default: 'myNetwork'
      }
    },
    data() {
      return {
        nodes: [],
        edges: [],
        edit: false,
        myNetwork: null, // 拓扑图实例
        myNode: null, // 拓扑图节点实例
        myEdge: null, // 拓扑图边实例
        networkStyle: {},
        network_offset_left: 0, // 画布距离屏幕左侧的距离
        network_offset_top: 0, // 画布距离屏幕顶部的距离

        eagelEyeVis: null,
        myEagelNode: null,
        myEagelEdge: null,
        scale: 0.2, // 拓扑图和鹰眼初始比例
        dragCode: 0, // 记录当前鼠标拖拽的是哪个拓扑，0-无拖拽 1-拓扑图拖拽 2-鹰眼拖拽
        eagleEyeStyle: {}
      }
    },
    computed: {
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
    },
    beforeDestroy() {
      this.destroy()
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
        // console.log(myNetworkWrap)
        // 计算拓扑图的高度
        this.networkStyle = {
          width: myNetworkWrap.offsetWidth + 'px',
          height: myNetworkWrap.offsetHeight + 'px'
        }
        // 鹰眼宽高
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
        this.myNetwork = new vis.Network(
          document.getElementById(this.id),
          { nodes: this.myNode, edges: this.myEdge },
          {
            ...visCfg,
            nodes: {
              ...visCfg.nodes,
              shape: 'icon' // 将此参数设置为icon，并且nodes里配置每个节点的iconfont，即可显示图标
            }
          })
        this.addEagleEye()
      },
      addEagleEye() {
        if (this.$refs[`${this.id}EagelEyeVis`]) {
          this.myEagelNode = new vis.DataSet(this.nodes)
          this.myEagelEdge = new vis.DataSet(this.edges)
          this.eagelEyeVis = new vis.Network(
            this.$refs[`${this.id}EagelEyeVis`],
            { nodes: this.myEagelNode, edges: this.myEagelEdge },
            {
            ...visCfg,
            nodes: {
              ...visCfg.nodes,
              shape: 'icon' // 将此参数设置为icon，并且nodes里配置每个节点的iconfont，即可显示图标
            }
            })
          this.eagelEyeVis.setOptions({
            interaction: {
              dragNodes: false
            }
          })
          this.handleDrag() // 拓扑和鹰眼拖拽时互动
          this.handleZoom() // 拓扑和鹰眼缩放联动
        }
      },
      handleDrag() {
        // 鹰眼跟着拓扑联动
        this.myNetwork.on('dragStart', () => {
          this.dragCode = 1
          this.$emit('dragStart')
        })
        this.myNetwork.on('dragging', properties => {
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
        this.eagelEyeVis.on('dragging', properties => {
          if (this.dragCode === 2) {
            const { x, y } = this.eagelEyeVis.getViewPosition()
            this.myNetwork.moveTo({
              position: {
                x: x,
                y: y
              }
            })
            // 拖拽某个节点时，联动
            if (properties.nodes && properties.nodes.length) {
              const { x, y } = properties.pointer.canvas
              this.myNetwork.moveNode(properties.nodes[0], x, y)
            }
          }
        })
      },
      handleZoom() {
        // 拓扑缩放
        this.myNetwork.on('zoom', parms => {
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
        this.eagelEyeVis.on('zoom', parms => {
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
      setEditable(val) {
        this.myNetwork.setOptions({
          interaction: {
            dragNodes: val
          }
        })
      },
      destroy() {
        if (this.myNetwork) {
          this.myNetwork.destroy()
          this.myNetwork = null
          this.myNode = null
          this.myEdge = null
        }
      }
    }
  }
</script>
<style lang="scss" scoped>
  .vis-wrap {
    height: 100%;
    .eagelEyeVis {
      position: absolute;
      right: 5px;
      bottom: 5px;
      border: 1px solid #ccc;
      background: rgba(153, 153, 153, 0.3);
    }
    .icon-switch {
      position: absolute;
      right: 20px;
      top: 80px;
    }
  }
  .room-box {
    position: absolute;
    pointer-events: none;
    border: 2px dashed #ccc;
    color: #ccc;
  }
</style>
