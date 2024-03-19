import axios from 'axios'
import BaseApi from '@/api/BaseApi'
import config from '@/config'

/**
 * 拓扑位置接口
 */
export default class extends BaseApi {
  /**
   * 获取基础路径
   *
   * @return 基础路径
   */
  static basePath() {
    return (config.services.oen || '') + '/topoPosition'
  }

  // 获取拓扑信息
  static getTopos() {
    return axios.get(`${this.basePath()}/getTopos`)
  }
}
