<template>
  <div class="h-100" id="g6-demo1"/>
</template>
<script>
  import { formatEdges, formatNodes } from '../format'
  import topoPositionApi from '@/api/TopoPositionApi'
  export default {
    data() {
      return {
        nodes: [],
        edges: []
      }
    },
    mounted() {
      this.getTopos()
    },
    methods: {
      getTopos() {
        topoPositionApi
          .getTopos()
          .then(res => {
            console.log(res)
            const { nodes, edges } = res
            this.nodes = formatNodes(nodes)
            this.edges = formatEdges(edges)
          })
          .catch(() => {})
      },
      init() {

      }
    }
  }
</script>
