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
    </div>
    <div :id="id" class="vis-container flex1" :style="networkStyle" />
    <div
      v-for="combo in comboData"
      :id="combo.comboId"
      :key="combo.comboId"
      :style="{
        top: combo.y,
        left: combo.x,
        width: combo.width,
        height: combo.height
      }"
      class="combo-box text-center"
    >
      <span class="font-small">{{ combo.comboName }}</span>
    </div>
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
        staticsItem: {
          width: 0,
          height: 200
        },
        comboData: [],
        comboList: [],
        comboScale: 1
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
        this.myEdge = new vis.DataSet(this.edges)
        this.myNetwork = new vis.Network(
          document.getElementById(this.id),
          { nodes: this.myNode, edges: this.myEdge },
          visCfg)
        this.getcomboList()
      },
      getcomboList() {
        // 划分机房数据
        const comboList = []
        console.log(this.nodes)
        this.nodes.forEach((ele, index) => {
          if (ele.cableLevel) {
            const curcombo = comboList.find(j => j.comboId === ele.cableLevel)
            if (curcombo) {
              curcombo.nodes.push(ele)
            } else {
              comboList.push({
                comboId: ele.cableLevel,
                comboName: ele.cableLevel,
                nodes: [ele]
              })
            }
          }
        })
        this.comboList = comboList
        const _this = this
        setTimeout(() => {
          _this.setcombo()
        }, 300)
        this.myNetwork.on('dragEnd', properties => {
          this.myNetwork.unselectAll()
        })
        this.myNetwork.on('dragging', properties => {
          // 拖拽某个节点时，联动
          if (properties.nodes && properties.nodes.length) {
            // console.log('properties', properties)
            // 更新机房内节点位置
            const { x, y } = properties.pointer.canvas
            this.comboList.forEach(i => {
              i.nodes.forEach(j => {
                if (j.id === properties.nodes[0]) {
                  j.x = x
                  j.y = y
                }
              })
            })
          }
          this.setcombo()
        })
        this.myNetwork.on('zoom', parms => {
          // console.log('parms', parms)
          this.comboScale = parms.scale
          this.setcombo()
          if (this.$parent.clickProp) {
            this.$emit('dragStart')
          }
        })
      },
      // 添加机房框
      setcombo() {
        const scale = this.comboScale < 0.8 ? 0.8 : this.comboScale
        this.comboData = this.comboList.map(i => {
          const xArray = []
          const yArray = []
          i.nodes.forEach(j => {
            if (!j.x || !j.y) {
              const positions = this.myNetwork.getPositions(j.id)
              j.x = positions[j.id].x
              j.y = positions[j.id].y
            }
            const domLocation = this.myNetwork.canvasToDOM({ x: j.x, y: j.y })
            xArray.push(domLocation.x)
            yArray.push(domLocation.y)
          })
          // 通过机房内最小x、y的值来计算机房盒子大小和定位
          const x1 = Math.min(...xArray)
          const x2 = Math.max(...xArray)
          const y1 = Math.min(...yArray)
          const y2 = Math.max(...yArray)
          return {
            comboId: i.comboId,
            comboName: i.comboName,
            width: (x2 - x1 + 120) * scale + 'px',
            height: (y2 - y1 + 100) * scale + 'px',
            x: x1 - 40 * scale + 'px',
            y: y1 - 50 * scale + 'px'
          }
        })
        // console.log('comboData', this.comboData)
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
.combo-box {
    position: absolute;
    pointer-events: none;
    border: 2px dashed #ccc;
    color: #ccc;
    background: rgba(153, 153, 153, 0.3);
  }
</style>
