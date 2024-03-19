<template>
  <section class="g6-page w-100 h-100">
    <el-tabs class="h-100 antv-g6-wrap" :stretch="true" tab-position="left">
      <el-tab-pane label="简介" name="introduction" class="h-100">
        <!-- <i-split v-model="split1">
          <div slot="left" class="demo-split-pane">
            Left Pane
          </div>
          <div slot="right" class="demo-split-pane">
            Right Pane
          </div>
        </i-split> -->
        <Introduction />
      </el-tab-pane>
      <el-tab-pane label="基本用法">
        <G6Demo1Vue />
      </el-tab-pane>
      <el-tab-pane label="角色管理">角色管理</el-tab-pane>
      <el-tab-pane label="定时任务补偿">定时任务补偿</el-tab-pane>
    </el-tabs>
  </section>
</template>
<script>
  import G6Demo1Vue from './components/G6-demo1.vue'
  import Introduction from './components/Introduction.vue'
  export default {
    components: {
      Introduction,
      G6Demo1Vue
    },
    data() {
      return {
        split1: 0.5,
        commonTemp: ''
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
