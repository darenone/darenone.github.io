<template>
  <section class="g6-page w-100 h-100">
    <el-tabs class="h-100" :stretch="true" tab-position="left">
      <el-tab-pane label="用户管理用户管理用户管理用户管理用户管理">
        <i-split v-model="split1">
          <div slot="left" class="demo-split-pane">
            Left Pane
          </div>
          <div slot="right" class="demo-split-pane">
            Right Pane
          </div>
        </i-split>
      </el-tab-pane>
      <el-tab-pane label="配置管理">配置管理</el-tab-pane>
      <el-tab-pane label="角色管理">角色管理</el-tab-pane>
      <el-tab-pane label="定时任务补偿">定时任务补偿</el-tab-pane>
    </el-tabs>
  </section>
</template>
<script>
  export default {
    data() {
      return {
        split1: 0.5
      }
    },
    methods: {
      // https://blog.csdn.net/PrintLnGoodLuck/article/details/125366001

    }
  }
</script>
