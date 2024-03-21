// 以图片作为节点
<template>
  <div class="vis-wrap h-100 flex-column relative">
    <div class="flex justify-end">
      <el-button type="primary" class="ml-10" @click="renderTopo">
        刷新
      </el-button>
      <el-button type="primary" class="ml-10" @click="setEditable(edit = !edit)">
        {{ edit ? '取消编辑' : '编辑' }}
      </el-button>
      <el-button type="primary" class="ml-10" @click="focus()">
        聚焦某个节点
      </el-button>
    </div>
    <div :id="id" class="vis-container flex1" :style="networkStyle" />
  </div>
</template>
<script>
  import vis from 'vis'
  import visCfg from '../visCfg.js'
  import { formatEdges, formatNodes, colorData, categoryNode } from '@/views/antv-g6/format.js'
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
        staticsItem: {
          width: 0,
          height: 200
        }
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
        this.myEdge = new vis.DataSet(this.edges.map(i => i))
        this.myNetwork = new vis.Network(
          document.getElementById(this.id),
          { nodes: this.myNode, edges: this.myEdge },
          visCfg)
        this.addEvent()
      },
      addEvent() {
        // 选中节点
        this.myNetwork.on('selectNode', properties => {
          const currentNode = this.nodes.find(i => i.id === properties.nodes[0]) || {}
          console.log(currentNode)
          this.myNode.update([
            {
              id: currentNode.id,
              font: { color: colorData.highLight },
              icon: { color: colorData.highLight },
              image: categoryNode(currentNode, 'highLight')
            }
          ])
        })
        // 取消选中节点
        this.myNetwork.on('deselectNode', properties => {
          if (properties.previousSelection.nodes[0]) {
            const currentNode = this.nodes.find(i => i.id === properties.previousSelection.nodes[0]) || {}
            this.myNode.update([
              currentNode
            ])
          }
        })
        // 选中连接线
        this.myNetwork.on('selectEdge', properties => {
          const currentEdge = this.edges.find(i => i.id === properties.edges[0]) || {}
          console.log('被选中的连接线', currentEdge.label)
          this.myEdge.update([
            {

              id: currentEdge.id,
              font: {
                size: 20,
                color: colorData.highLight
              },
              width: 4
            }
          ])
        })
        // 取消选中连接线
        this.myNetwork.on('deselectEdge', properties => {
          console.log(properties.previousSelection.edges)
          if (properties.previousSelection.edges[0]) {
            const currentEdge = this.edges.find(i => i.id === properties.previousSelection.edges[0]) || {}
            this.myEdge.update([
              currentEdge
            ])
          }
        })
      },
      focus() {
        const location = this.myNetwork.getPositions(10)['10'] // 找到节点的位置
        this.myNetwork.moveTo({
          position: { x: location.x, y: location.y },
          animation: {
            duration: 1500,
            easingFunction: 'linear'
          }
        })
      },
      setEditable(val) {
        this.myNetwork.setOptions({
          interaction: {
            dragNodes: val
          }
        })
      },
      fitView(data, times = 0) {
        if (this.nodes.length === 0 && times < 4) {
          setTimeout(() => {
            this.fitView(data, times++)
          }, 500)
          return
        }
        const fitNodes = this.nodes.filter(i => data.includes(i.nodeId)).map(i => i.id)
        setTimeout(() => {
          if (!this.myNetwork) return
          this.myNetwork.fit({ nodes: fitNodes })
          const scale = this.myNetwork.getScale()
          !this.fullScreen &&
            this.myNetwork.moveTo({
              offset: { x: 0, y: 0 - this.staticsItem.height / 2 - 20 },
              scale: scale * 0.8
            })
        }, 500)
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
