/**
 * 国际化
 */
import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

// 初始化登录页翻译
const localLanguage = {
  'en-US': {
    IN_USERNAME: 'Please enter user name',
    IN_PASSWORD: 'Please enter the password',
    IN_CODE: 'Please enter the verification code',
    IN_CODE_VALIDATOR: 'ncorrect verification code input',
    LOGIN: 'Login',
    REMEMBER_USERNAME: 'Remember username',
    FORGOT_PASSWORD: 'Forgot password',
    LOGIN_SYSTEM: 'Login system',
    NOTLOGIN: 'not login'
  },
  'zh-CN': {
    IN_USERNAME: '请输入用户名',
    IN_PASSWORD: '请输入密码',
    IN_CODE: '请输入验证码',
    IN_CODE_VALIDATOR: '验证码输入不正确',
    LOGIN: '登录',
    REMEMBER_USERNAME: '记住用户名',
    FORGOT_PASSWORD: '忘记密码',
    LOGIN_SYSTEM: '登录系统',
    NOTLOGIN: '未登录'
  }
}

const getLanguage = () => {
  // 优先获取本地已设置的语言
  if (localStorage.getItem('lang')) {
    return localStorage.getItem('lang')
  } else {
    // 获取浏览器语言
    const language = navigator.language || navigator.browserLanguage
    const locales = Object.keys(localLanguage)
    // 本地翻译没有浏览器语言默认返回中文
    if (locales.includes(language)) {
      return language
    } else {
      return 'zh-CN'
    }
  }
}

const i18n = new VueI18n({
  locale: getLanguage(),
  messages: localLanguage,
  silentTranslationWarn: true
})

export default i18n
