<template>
  <section class="flex justify-end w-100 h-100">
    <slot />
    <el-menu
      router
      :mode="mode"
      :collapse="collapsed"
      :collapse-transition="false"
      :default-active="$route.path"
    >
      <template v-for="(item) in navList">
        <el-menu-item
          v-if="!item.children"
          :key="item.funcId"
          :index="item.path"
          :route="{ name: item.name }"
        >
          <i :class="item.icon" class="pr-10" />
          <span slot="title">{{ item.title }}</span>
        </el-menu-item>
        <e-resubmenu
          v-else
          :key="item.funcId"
          :parent="item"
          :index="item.funcId"
        />
      </template>
    </el-menu>
  </section>
</template>
<script>
  import eResubmenu from '_c/element-menu/re-submenu.vue'
  export default {
    components: { eResubmenu },
    props: {
      collapsed: Boolean,
      mode: {
        type: String,
        default: 'horizontal'
      }
    },
    data() {
      return {
        navList: [],
        isCollapse: true
      }
    },
    computed: {
    },
    mounted() {
      console.log(this.$router.options.routes)
      this.navList = this.loopFun(this.$router.options.routes[0].children, 0, '')
    },
    methods: {
      loopFun(list, index, path) {
        const arr = []
        index++
        list.forEach((e) => {
          const pathUrl = path && e.path ? path + '/' + e.path : e.path
          if (e.name) {
            if (e.children) {
              const children = this.loopFun(e.children, index, pathUrl)
              arr.push({
                path: pathUrl,
                name: e.name,
                title: e.meta && e.meta.title,
                icon: e.meta && e.meta.icon,
                children: children,
                level: index
              })
            } else {
              arr.push({
                path: pathUrl,
                name: e.name,
                title: e.meta && e.meta.title,
                icon: e.meta && e.meta.icon,
                level: index
              })
            }
          }
        })
        return arr
      }
    }
  }
</script>
<style lang="scss" scoped>

</style>
