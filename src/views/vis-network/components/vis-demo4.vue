// 添加交互事件
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
    <el-card v-show="eventData.mouseEvent" class="absolute" :style="{left: eventData.left - 120 + 'px', top: eventData.top + 'px'}">
      <div slot="header" class="clearfix">
        <span>名称：{{ eventData.label || '' }}</span>
      </div>
      <div class="text item">
        编码：{{ eventData.nodeId || eventData.cableId }}
      </div>
    </el-card>
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
        eventData: {}
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
        this.network_offset_top = myNetworkWrap.offsetTop + 80 // Y偏移量（80是拓扑容器距离浏览器顶部的距离）
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
          visCfg)
        this.addEvent() // 添加节点和连线的交互事件
      },
      setEditable(val) {
        this.myNetwork.setOptions({
          interaction: {
            dragNodes: val
          }
        })
      },
      addEvent() {
        this.edgesHover() // 连接线hover
        this.edgesClick() // 连接线click
        this.nodesClick() // 节点click
        this.nodesHover() // 节点hover
      },
      edgesHover() {
        this.myNetwork.on('hoverEdge', properties => {
          this.clientX = properties.event.clientX
          this.clientY = properties.event.clientY
          this.eventData = {
            mouseEvent: 'fiberHover',
            cableId: properties.edge,
            left: properties.event.clientX,
            top: properties.event.clientY - this.network_offset_top
          }
        })
        this.myNetwork.on('blurEdge', properties => {
          this.eventData = {
            mouseEvent: '',
            left: 0,
            top: 0
          }
        })
      },
      edgesClick() {
        // 选中连接线
        this.myNetwork.on('selectEdge', properties => {
          this.edges.forEach(ele => {
            if (ele.id === properties.edges[0]) {
              this.eventData = {
                cableId: properties.edges[0],
                mouseEvent: 'fiberClick',
                label: ele.label,
                left: properties.event.center.x - 10,
                top: properties.event.center.y - this.network_offset_top - 10,
                fromNodeId: ele.fromNodeId,
                toNodeId: ele.toNodeId
              }
            }
          })
        })
        // 取消选中连接线
        this.myNetwork.on('deselectEdge', properties => {
          if (!properties.edges.length) {
            // 单纯取消当前选中的连线，而不是从一个选中连线切换到另一个选中连线
            this.eventData = {
              id: properties.previousSelection.edges[0],
              mouseEvent: 'fiberClick',
              left: 0,
              top: 0
            }
          }
        })
      },
      nodesHover() {
        this.myNetwork.on('hoverNode', properties => {
          const currentNode = this.nodes.find(i => i.id === properties.node) || {}
          this.eventData = {
            ...currentNode,
            mouseEvent: 'stationHover',
            left: properties.event.clientX, // 当前鼠标在画布中的位置(校准后)
            top: properties.event.clientY - this.network_offset_top
          }
        })
        this.myNetwork.on('blurNode', properties => {
          this.eventData = {
            mouseEvent: '',
            left: 0,
            top: 0
          }
        })
      },
      nodesClick() {
        // 选中节点
        this.myNetwork.on('selectNode', properties => {
          const currentNode = this.nodes.find(i => i.id === properties.nodes[0]) || {}
          this.eventData = {
            ...currentNode,
            mouseEvent: 'stationClick',
            left: properties.event.clientX, // 当前鼠标在画布中的位置(校准后)
            top: properties.event.clientY - this.network_offset_top
          }
        })
        // 取消选中节点
        this.myNetwork.on('deselectNode', properties => {
          if (!properties.nodes.length) {
            // 单纯取消当前选中的节点，而不是从一个选中节点切换到另一个选中节点
            this.$emit('selectNode', {
              id: properties.previousSelection.nodes[0],
              mouseStatus: 'CANCEL',
              mouseEvent: 'stationClick',
              left: 0,
              top: 0
            })
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
