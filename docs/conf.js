/** 系统配置 */
window.__config__ = {
  // 基础配置
  sysId: 'AFS_OEN',
  sysName: {
    'zh-CN': '祺迹云光交组网系统',
    'en-US': 'Qiji Cloud Optical Network System'
  },
  // 系统版本
  systemVersion: 'V 2.4.27',
  // 接口服务配置
  services: {
    authen: '/authen',
    system: '/system',
    basebiz: '/basebiz',
    oen: '/oen',
    afs: '/afs'
  },
  // MQTT服务配置
  mqtt: {
    service: '/message',
    username: 'vrich',
    password: 'dnJpY2hAMDE2Ng=='
  },
  // 后端调试环境配置
  devConf: {
    // baseUrl: 'http://192.168.55.221/services',
    // baseUrl: 'http://8.142.0.149/services',
    baseUrl: 'http://192.168.55.117/services',
    // baseUrl: 'http://192.168.15.5/services',
    // baseUrl: 'http://192.168.15.101/services',
    resUrl: 'http://192.168.55.221/res',
    // 接口服务配置
    services: {
      authen: '/authen',
      system: '/system',
      basebiz: '/basebiz',
      // basebiz: 'http://192.168.0.29:10002',
      afs: '/afs',
      // afs: 'http://192.168.0.29:10011',
      oen: '/oen',
      // oen: 'http://192.168.0.117:10012',
      pem: '/pem'
    },
    mqtt: {
      service: 'mqtt://192.168.55.117/services/message'
      // service: 'mqtt://8.142.0.149/services/message'
    }
  },
  // 前端调试环境配置
  testConf: {
    baseUrl: 'http://192.168.15.4/services'
    // baseUrl: 'http://8.142.0.149/services'
  },
  // 构建环境配置
  prodConf: {
    baseUrl: '/services',
    resUrl: '/res',
    // 接口服务配置
    services: {
      authen: '/authen',
      system: '/system',
      basebiz: '/basebiz',
      oen: '/oen',
      afs: '/afs',
      pem: '/pem'
    }
  },
  // 系统版权--更改时需要同步更改英文和阿拉伯语【直接用百度翻译】
  copyright: {
    'zh-CN': 'Copyright © 北京瑞祺皓迪技术股份有限公司, All Rights Reserved.',
    'en-US': 'Copyright © Beijing Ruiqi Haodi Technology Co., Ltd, All Rights Reserved.'
  },
  defaultAccount: ['user_jf', 'user_gl', 'user_wh', 'user_sc'],
  roleLevel: [
    {
      id: 'admin',
      level: 1
    },
    {
      id: 'delivery',
      level: 2
    },
    {
      id: 'manager',
      level: 3
    },
    {
      id: 'maintainer',
      level: 3
    },
    {
      id: 'producer',
      level: 3
    }
  ]
}
