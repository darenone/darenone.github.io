// 上下佈局
<template>
  <el-container class="w-100 h-100">
    <div class="wrapper">
      <el-header class="headerHeight">
        <div class="main-header flex align-center">
          <div class="logo flex align-center" style="min-width: 200px" @click="$router.push('/')">
            <div class="sysLogo flex-1 flex" />
            <span class="home_btn" :class="$route.name === 'HOME' ? 'homeActive':''">首页</span>
          </div>
          <div class="main-nav relative pl-20 pr-20">
            <span class="arrow-left absolute">
              <i
                v-if="!around"
                class="el-icon-arrow-left arrow"
                @click="scrollX('left')"
              />
            </span>
            <span class="arrow-right absolute">
              <i
                v-if="!around"
                class="el-icon-arrow-right arrow"
                @click="scrollX('right')"
              />
            </span>
            <div class="w-100 flex overflow-hidden">
              <div
                ref="headerMenu"
                class="main-nav-scroll flex flex-1 justify-center align-center w-100"
              >
                <e-menu ref="topNavMenu" :mode="'horizontal'" />
              </div>
            </div>
          </div>
        </div>
      </el-header>
      <el-main>
        <!-- <eNav /> -->
        <div class="pl-10 pr-10 pb-10 pt-10 flex-1" :class="curRoute ==='HOME'?'home-box':'content-box'">
          <!-- <keep-alive include="Home"> -->
          <router-view />
          <!-- </keep-alive> -->
          <div class="border-content" />
        </div>
      </el-main>
    </div>
  </el-container>
</template>
<script>
  import { mapGetters } from 'vuex'
  import BetterScroll from 'better-scroll'
  import eMenu from '_c/element-menu/a-menu.vue'
  // import eNav from '_c/element-nav/'
  export default {
    components: {
      eMenu
    },
    data() {
      return {
        bs: null,
        around: true,
        tmpOffsetWidth: 0,
        editableTabsValue: this.getCurrentTab,
        curRoute: 'HOME',
        showIot: true
      }
    },
    computed: {
    ...mapGetters(['getTabType', 'getActivedTabs', 'getMenu'])
    },
    watch: {
      getCurrentTab: {
        handler(newval, oldval) {
          this.editableTabsValue = newval
        },
        immediate: true
      },
      $route: {
        handler(newval, oldval) {
          this.curRoute = newval.name
        },
        immediate: true
      }
    },
    mounted() {
      this.$nextTick(() => {
        // this.initBs()
      })
      this.Timer = null
      this.getScale()
      window.addEventListener('resize', this.getScale)
    },
    beforeDestroy() {
      if (this.Timer) clearTimeout(this.Timer)
      window.removeEventListener('resize', this.getScale)
    },
    methods: {
      initBs() {
        this.$nextTick(() => {
          this.bs = new BetterScroll(this.$refs.headerMenu, {
            scrollX: true,
            scrollY: false,
            mouseWheel: true
          })
          const menuItems = Array.from(
            this.$refs.topNavMenu.$el.children
          )
          if (menuItems.length) {
            this.tmpOffsetWidth = menuItems.reduce((curr, next) => {
              return curr + next.offsetWidth
            }, 0)
            this.$refs.topNavMenu.$el.style.width = `${
              this.tmpOffsetWidth
            }px`
          }
          this.bs.refresh()
        })
      },
      scrollX(side) {
        const totalWidth = parseInt(this.$refs.topNavMenu.$el.style.width)
        const item = parseInt(totalWidth / this.getMenu.length)
        let xNum = 0
        if (side === 'right') {
          xNum = this.bs.x - item
          xNum = xNum < this.bs.maxScrollX ? this.bs.maxScrollX : xNum
        } else {
          xNum = this.bs.x + item
          xNum = xNum > 0 ? 0 : xNum
        }
        this.bs.scrollTo(xNum, 0, 300)
      },
      getScale() {
        clearTimeout(this.Timer)
        this.Timer = setTimeout(() => {
          const ww = document.querySelector('.main-nav-scroll').offsetWidth
          const menuLen = this.getMenu.length || 0
          if (ww < menuLen * 161) {
            this.around = false
          } else {
            this.around = true
          }
        }, 500)
      },
      iot() {
        localStorage.setItem('OEN_CUR_ROUTENAME', this.$route.path)
        location.href = '../iot'
      }
    }
  }
</script>

<style lang="scss" scoped>
.headerHeight {
  color: #ffffff;
  line-height: 60px;
  height:60px !important;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 2px 8px #f0f1f2;
}
.el-main {
  flex-basis: 0px;
  padding:0;
  overflow: hidden;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: 100%;
  background: linear-gradient(225deg,#ffffff,#f0f5ff);
}
.home-box {
  height: 1px;
  flex:1;
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: 100%;
}
.content-box {
  width: calc(100% - 20px);
  margin:10px auto 20px;
  box-shadow: transparent 0px 0px 40px inset;
  border: 1px solid transparent;
  padding:10px;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 1px;
  flex:1;
  > div:first-child{
    height: 100%;
    flex:1;
  }
}

.main-header {
  height: 100%;
  .logo {
    width: 20%;
    height: 100%;
    padding:0 2% 10px 15px;
    // background-image: url('../../../assets/img/scale/blue_header_left.png');
    background-size: 100% 100%;
    cursor: pointer;
    .sysLogo{
      background-size: 70%;
      height: 100%;
    }
  }
  .home_btn,
  .device_btn{
    width:133px;
    height:35px;
    line-height: 35px;
    font-size:14px;
    text-align: center;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
  }
  .home_btn {
    &.homeActive{
    }
  }
  .device_btn {
    margin-left: 9%;
    cursor: pointer;
  }
  .userinfo {
    width: 18%;
    height: 100%;
    float: right;
    // background-image: url('../../../assets/img/scale/blue_header_right.png');
    background-size: 100% 100%;
    .el-avatar{
    }
    .el-menu--horizontal>.el-menu-item{
      height: 100%;
      padding:0;
    }
    .user-menu {
      float: right;
      margin-right: 20px;
      width: auto;
      .user-menu-item1 {
        .el-submenu__title {
          padding: 0;
        }
      }
      .user-menu-item2 {
        &:hover {
          background: none;
        }
      }
      .user-menu-item2.is-active {
        border: none;
      }
    }
    .sys-notice {
      position: absolute;
      left: 20px;
      top: -8px;
    }
  }
  .main-nav {
    flex: 1;
    height: 100%;
    // background-image: url('../../../assets/img/scale/blue_header_center.png');
    background-size: 100% 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    .arrow-left,
    .arrow-right{
      height: 60px;
      line-height: 60px;
      top:0;
      .arrow{
        cursor: pointer;
      }
    }
    .arrow-left{
      left:0;
    }
    .arrow-right{
      right:0;
    }
    >.el-menu {
      height: 60px;
      text-align: center;
      .el-submenu__title i {
        color: #fff;
      }
    }
  }
  .user-name {
    margin-left: 5px;
    display: inline-block;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .license-expires {
    position: absolute;
    color: red;
    top: 25px;
    font-size: 10px;
  }
}

</style>
