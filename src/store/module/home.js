export default {
  state: {
    hideAlarmLevel: [] // 需要隐藏的告警等级
  },
  getters: {
    hideAlarmLevel: state => state.hideAlarmLevel
  },
  mutations: {
    setAlarmLevel(state, data = []) {
      state.hideAlarmLevel = data
    }
  },
  actions: {}
}
