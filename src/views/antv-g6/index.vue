<template>
  <section class="g6-page w-100 h-100">
    <el-tabs v-model="activeName" class="h-100 antv-g6-wrap" :stretch="true" tab-position="left">
      <!-- <el-tab-pane label="简介" name="introduction" class="h-100">
        <i-split v-model="split1">
          <div slot="left" class="demo-split-pane">
            Left Pane
          </div>
          <div slot="right" class="demo-split-pane">
            Right Pane
          </div>
        </i-split>
      </el-tab-pane> -->
      <el-tab-pane label="图片作为节点" name="demo1" class="h-100">
        <G6Demo1Vue />
      </el-tab-pane>
      <el-tab-pane label="图标作为节点" name="demo2" class="h-100">
        <G6Demo2Vue />
      </el-tab-pane>
    </el-tabs>
  </section>
</template>
<script>
  import G6Demo1Vue from './components/G6-demo1.vue'
  import G6Demo2Vue from './components/G6-demo2.vue'
  // import Introduction from './components/Introduction.vue'
  export default {
    components: {
      G6Demo1Vue,
      G6Demo2Vue
    },
    data() {
      return {
        split1: 0.5,
        activeName: 'demo1'
      }
    },
    methods: {
      // https://blog.csdn.net/PrintLnGoodLuck/article/details/125366001

    }
  }
</script>
<style lang="scss">
.antv-g6-wrap {
  .el-tabs__content {
    height: 100%;
  }
}
</style>
