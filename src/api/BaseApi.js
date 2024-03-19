import axios from 'axios'
import config from '@/config'

/**
 * 基础接口
 */
export default class {
  /**
   * 获取基础路径
   *
   * @return 基础路径
   */
  static basePath() {
    return ''
  }

  /**
   * 获取全路径
   *
   * @param path 相对路径
   * @return 路径
   */
  static fullPath(path) {
    return `${config.baseUrl}${this.basePath()}${path || ''}`
  }

  /**
   * 新增数据
   *
   * @param data 数据
   * @return 请求对象
   */
  static add(data) {
    return axios.post(`${this.basePath()}/add`, data)
    //        return axios.post(`${this.basePath()}/add`, data, {resultKeep: true});
  }

  /**
   * 删除数据
   *
   * @param id 编号
   * @param params 参数
   * @return 请求对象
   */
  static del(id, params = {}) {
    params.id = id
    return axios.delete(`${this.basePath()}/del`, { params })
  }

  /**
   * 批量删除数据
   *
   * @param ids 编号集（逗号分隔）
   * @param params 参数
   * @return 请求对象
   */
  static delByIds(ids, params = {}) {
    params.ids = ids
    return axios.delete(`${this.basePath()}/delByIds`, { params })
  }

  /**
   * 修改数据
   *
   * @param data 数据
   * @return 请求对象
   */
  static mod(data) {
    return axios.put(`${this.basePath()}/mod`, data)
    //        return axios.put(`${this.basePath()}/mod`, data, {resultKeep: true});
  }

  /**
   * 查询数据列表
   *
   * @param params 查询参数
   * @return 请求对象
   */
  static list(params) {
    return axios.get(`${this.basePath()}/list`, { params })
    //        return axios.get(`${this.basePath()}/list`, {params, resultKeep: true});
  }

  /**
   * 分页查询数据
   *
   * @param params 查询参数
   * @return 请求对象
   */
  static page(params) {
    return axios.get(`${this.basePath()}/page`, { params })
    //        return axios.get(`${this.basePath()}/page`, {params, resultKeep: true});
  }

  /**
   * 查询单条数据
   *
   * @param params 查询参数
   * @return 请求对象
   */
  static find(params) {
    return axios.get(`${this.basePath()}/find`, { params })
    //        return axios.get(`${this.basePath()}/find`, {params, resultKeep: true});
  }
}
