// 默认主题配置
let themeConfig = {
  // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
  // repo: 'vuejs/vuepress',
  // repoLabel: '查看源码',
  // editLinks: true,
  // editLinkText: '帮助我们改善此页面！',
  // lastUpdated: 'Last Updated',
  smoothScroll: true,
  sidebarDepth: 2,
  sidebar: [
    ['/', 'BIP2中文文档'],
    ['/introduction', '开始'],
    ['/bip2_language', 'BIP2语言']
  ]
}

// 插件配置
let plugins = [
  ['@vuepress/back-to-top'],
  ['@vuepress/active-header-links', {
    sidebarLinkSelector: '.sidebar-link',
    headerAnchorSelector: '.header-anchor'
  }]
]

module.exports = {
  host: 'localhost',
  title: 'BIP2中文文档',
  description: 'Chinese (zh-cn) translation of BIP2',
  themeConfig: themeConfig,
  plugins: plugins
}