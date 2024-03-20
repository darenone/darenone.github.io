<template>
  <section class="g6-page w-100 h-100">
    <el-tabs v-model="activeName" class="h-100 antv-g6-wrap" :stretch="true" tab-position="left">
      <el-tab-pane label="图片作为节点" name="VisDemo1Vue" class="h-100">
        <component :is="activeName === 'VisDemo1Vue' ? 'VisDemo1Vue' : ''" />
      </el-tab-pane>
      <el-tab-pane label="图标作为节点" name="VisDemo2Vue" class="h-100">
        <component :is="activeName === 'VisDemo2Vue' ? 'VisDemo2Vue' : ''" />
      </el-tab-pane>
      <el-tab-pane label="添加鹰眼" name="VisDemo3Vue" class="h-100">
        <component :is="activeName === 'VisDemo3Vue' ? 'VisDemo3Vue' : ''" />
      </el-tab-pane>
      <el-tab-pane label="添加交互事件" name="VisDemo4Vue" class="h-100">
        <component :is="activeName === 'VisDemo4Vue' ? 'VisDemo4Vue' : ''" />
      </el-tab-pane>
    </el-tabs>
  </section>
</template>
<script>
  import VisDemo1Vue from './components/vis-demo1.vue'
  import VisDemo2Vue from './components/vis-demo2.vue'
  import VisDemo3Vue from './components/vis-demo3.vue'
  import VisDemo4Vue from './components/vis-demo4.vue'
  export default {
    components: {
      VisDemo1Vue,
      VisDemo2Vue,
      VisDemo3Vue,
      VisDemo4Vue
    },
    data() {
      return {
        split1: 0.5,
        activeName: 'VisDemo1Vue'
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
