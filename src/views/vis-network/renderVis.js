import vis from 'vis'
// 拓扑代码
export default function RenderVis(id, nodes, edges) {
  // 接收构造函数传进来的属性值
  this.id = id
  this.nodes = nodes
  this.edges = edges
  this.vis_network_instance = {} // network实例
  this.vis_node_instance = {} // 节点实例
  this.vis_edge_instance = {} // 边实例
}
RenderVis.prototype = {
  init(options = {}) {
    this.vis_node_instance = new vis.DataSet(this.nodes)
    this.vis_edge_instance = new vis.DataSet(this.edges)
    // 生成画布
    this.vis_network_instance = new vis.Network(
      this.id,
      {
        nodes: this.vis_node_instance, // 添加节点
        edges: this.vis_edge_instance // 添加连线
      },
      this.setOption(options)
    )
  },
  setOption(options) {
    // vis的配置对象
    const opiton = {
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
        },
        physics: false
      },
      nodes: {
        font: {
          color: '#409EFF'
        },
        shape: options.shape ? options.shape : 'icon', // icon/image icon-矢量图 image-图片 如果设置成矢量图，会识别icon对象里设置的code，如果设置成图片，每个node需要添加image属性
        icon: {
          face: 'iconfont',
          code: '\ue603',
          size: 50, // 50,
          color: '#409EFF'
        },
        physics: false
      },
      layout: {
        randomSeed: 1 // 配置每次生成的节点位置都一样，参数为数字1、2等
      },
      physics: {
        enabled: false, // 默认是true，设置为false后，节点将不会自动改变，拖动谁谁动。不影响其他的节点
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
    return opiton
  }
}
