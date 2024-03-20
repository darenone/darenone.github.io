<template>
  <div class="flex-column relative">
    <div class="flex justify-end">
      <el-button type="primary" class="ml-10" @click="renderTopo">
        刷新
      </el-button>
      <el-button type="primary" class="ml-10" @click="setEditable(edit = !edit)">
        {{ edit ? '取消编辑' : '编辑' }}
      </el-button>
    </div>
    <div id="g6-demo1" class="h-100 flex-1" />
    <el-card v-show="eventData.mouseEvent" class="absolute" :style="{left: eventData.left + 'px', top: eventData.top + 'px'}">
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
  import G6 from '@antv/g6'
  import insertCss from 'insert-css'
  import { formatEdges, formatNodes } from '../format'
  import topoPositionApi from '@/api/TopoPositionApi'
  insertCss(`
    .g6-minimap-viewport {
      border: 1px solid rgb(25, 128, 255);
    }
  `)
  export default {
    data() {
      return {
        nodes: [],
        edges: [],
        graphOffsetTop: 0,
        graph: null,
        edit: false,
        eventData: {}
      }
    },
    computed: {
      graphCfg() {
        return {
          fitView: true,
          // fitViewPadding: [20, 40, 50, 20],
          // layout: {
          //   type: 'force2',
          //   preventOverlap: true,
          //   linkDistance: 200
          // },
          minZoom: 0.001,
          groupByTypes: false,
          modes: {
            default: [
              {
                type: 'drag-canvas',
                enableOptimize: true,
                allowDragOnItem: true
              },
              {
                type: 'zoom-canvas',
                enableOptimize: true
              },
              {
                type: 'click-select',
                selectCombo: false
              }
            ],
            edit: [
              'drag-canvas',
              'zoom-canvas',
              'drag-combo',
              'brush-select',
              {
                type: 'drag-node',
                onlyChangeComboSize: true
              }
            ]
          },
          defaultNode: {
            size: 45,
            style: {
              cursor: 'pointer'
            },
            labelCfg: {
              position: 'bottom',
              style: {
                fontSize: 16
                // stroke: '#fff',
                // lineWidth: 1
              }
            }
          },
          defaultEdge: {
            // type: 'quadratic', // 设置边为贝塞尔曲线
            style: {
              cursor: 'pointer',
              lineWidth: 2,
              lineAppendWidth: 4
            },
            labelCfg: {
              autoRotate: true, // 设置标签文字跟随边旋转
              style: {
                opacity: 0
              }
            }
          },
          defaultCombo: {
            type: 'rect',
            padding: [30, 30, 30, 30],
            labelCfg: {
              style: {
                fill: '#333',
                fontSize: 18
              }
            }
          },
          nodeStateStyles: {
            hover: {
              size: 80
            }
          },
          edgeStateStyles: {
            click: {
              stroke: 'steelblue'
            }
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
        const g6Container = document.getElementById('g6-demo1')
        const g6Wrap = document.getElementsByClassName('antv-g6-wrap')[0]
        if (!g6Container) return
        console.log(g6Wrap.scrollHeight) // 离屏幕最上面高度
        this.graphOffsetTop = g6Wrap.offsetTop + 80
        this.graph = new G6.Graph({
          container: g6Container,
          width: g6Wrap.scrollWidth,
          height: g6Wrap.scrollHeight,
          ...this.graphCfg,
          plugins: [this.addMiniMap(g6Wrap.scrollWidth, g6Wrap.scrollHeight)]
        })
        this.addEvent()
        this.renderTopo()
      },
      renderTopo() {
        this.edit = false
        // 节点
        let nodes = []
        let levels = [] // 光缆等级
        nodes = this.nodes.map(i => {
          i.cableLevel && levels.push(i.cableLevel)
          return {
            type: 'image',
            id: i.id.toString(),
            x: i.x || 0,
            y: i.y || 0,
            img: i.image,
            label: i.label,
            labelCfg: {
              style: {
                fill: i.font.color
              }
            },
            comboId: i.cableLevel && i.cableLevel,
            info: i
          }
        })
        // 边
        let edges = []
        edges = this.edges.map(i => {
          return {
            label: i.label,
            source: i.from.toString(),
            target: i.to.toString(),
            style: {
              stroke: i.color.color,
              strokeOpacity: i.color.opacity || 0.5,
              lineWidth: i.width || 2
            },
            labelCfg: {
              style: {
                fill: i.font.color
              }
            },
            info: i
          }
        })
        G6.Util.processParallelEdges(edges, 15, 'quadratic', 'line') // 2个节点间存在多条边时，设置边不重叠
        // 组
        let combos = []
        levels = Array.from(new Set(levels))
        combos = levels.map(i => {
          return {
            id: i,
            label: i,
            padding: 20,
            style: {
              fill: '#5388C6',
              stroke: '#fff', // 有残影，描边需要设置成和背景色一致
              opacity: 0.2
            }
          }
        })
        this.graph.changeData({
          nodes,
          edges,
          combos
        })
        this.graph.fitView() // 重新调整下画布
      },
      addEvent() {
        this.graph.on('node:click', evt => {
          // console.log('选中节点', evt)
          const nodeItem = evt.item
          this.graph.setItemState(nodeItem, 'selected', false)
          const model = nodeItem.getModel()
          if (this.edit) return
          this.eventData = {
            ...model.info,
            mouseEvent: 'stationClick',
            ...{
              id: model.id,
              mouseStatus: 'SELECT',
              left: evt.clientX - 100,
              top: evt.clientY - this.graphOffsetTop
            }
          }
        })
        this.graph.on('node:mouseenter', evt => {
          // console.log('节点移入', evt)
          if (this.edit) return
          const nodeItem = evt.item
          const model = nodeItem.getModel()
          this.eventData = {
              ...model.info,
              mouseStatus: 'HOVER',
              mouseEvent: 'stationHover',
              left: evt.clientX - 100, // 当前鼠标在画布中的位置(校准后)
              top: evt.clientY - this.graphOffsetTop
          }
        })
        this.graph.on('node:mouseleave', evt => {
          // console.log('节点移出', evt)
          if (this.edit) return
          const nodeItem = evt.item
          const model = nodeItem.getModel()
          this.eventData = {
              ...model.info,
              mouseStatus: 'LEAVE',
              mouseEvent: '',
              left: 0,
              top: 0
          }
        })
        this.graph.on('edge:click', evt => {
          if (this.edit) return
          const model = evt.item.getModel()
          this.eventData = {
            ...model.info,
            mouseEvent: 'edgeClick',
            left: evt.clientX - 100, // 当前鼠标在画布中的位置(校准后)
            top: evt.clientY - this.graphOffsetTop
          }
        })
        this.graph.on('edge:mouseenter', evt => {
          if (this.edit) return
          const edgeItem = evt.item
          edgeItem.update({ labelCfg: {
            autoRotate: true,
            style: { opacity: 1 }
          }})
          this.eventData = {
            ...edgeItem.getModel().info,
            mouseEvent: 'edgeHover',
            left: evt.clientX - 100, // 当前鼠标在画布中的位置(校准后)
            top: evt.clientY - this.graphOffsetTop
          }
        })
        this.graph.on('edge:mouseleave', evt => {
          if (this.edit) return
          const edgeItem = evt.item
          edgeItem.update({ labelCfg: {
            style: { opacity: 0 }
          }})
          this.eventData = {
            mouseEvent: ''
          }
        })
        this.graph.on('canvas:click', evt => {
          this.eventData = {}
        })
        this.graph.on('canvas:dragstart', evt => {
          this.eventData = {}
        })
      },
      addMiniMap(width, height) {
        const scale = 0.2 // 拓扑图和鹰眼初始比例
        // 添加鹰眼
        return new G6.Minimap({
          size: [width * scale, height * scale],
          className: 'minimap',
          hideEdge: true,
          type: 'delegate'
        })
      },
      setEditable(val) {
        this.graph && this.graph.setMode(val ? 'edit' : 'default')
      },
      destroy() {
        this.graph.clear() // 清空画布内容
        this.graph.destroy() // 销毁画布
        this.graph.off() // 解除所有元素的监听事件
        this.graph = null
        this.nodes = []
        this.edges = []
      }
    }
  }
</script>
<style lang="scss">
.minimap {
  position: fixed;
  bottom: 15px;
  right: 10px;
  border: 1px solid #ccc;
}
</style>
