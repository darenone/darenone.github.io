<template>
  <!-- 不加这个div导致递归的时候报错 Maximum call stack size exceeded-->
  <div class="flex">
    <el-submenu :index="index" popper-append-to-body:true class="h-100">
      <template slot="title">
        <i :class="[parent.icon, 'pr-10']" />
        <span slot="title">{{ $t(parent.title) }}</span>
      </template>
      <template v-for="(item) in parent.children">
        <el-menu-item
          v-if="!item.children"
          :key="item.path"
          :index="item.path"
          :route="{ name: item.name }"
        >
          <i :class="[item.icon, 'pr-10']" />
          <span slot="title">{{ $t(item.title) }}</span>
        </el-menu-item>
        <e-resubmenu
          v-else
          :key="item.path"
          :parent="item"
          :index="item.path"
        />
      </template>
    </el-submenu>
  </div>
</template>
<script>
  export default {
    name: 'EResubmenu',
    props: {
      parent: {
        type: Object,
        default: () => {}
      },
      index: [String, Number]
    },
    mounted() {
      console.log('hello')
    }
  }
</script>
<style lang="scss" scoped>
::v-deep .el-submenu > .el-submenu__title .el-submenu__icon-arrow {
  position: static;
  margin-top: 1px;
  margin-left: 5px;
}
// el-submenu标签外再套一层div，防止菜单折叠后hover报错Maximum call stack size exceeded，但是样式需要调整一下
// .el-menu--collapse > div > .el-submenu > .el-submenu__title span {
//   width: 0;
//   height: 0;
//   overflow: hidden;
//   visibility: hidden;
//   display: inline-block;
// }
// .el-menu--collapse > div > .el-submenu > .el-submenu__title .el-submenu__icon-arrow {
//   display: none;
// }
</style>
