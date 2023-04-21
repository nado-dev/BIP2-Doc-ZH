// 默认主题配置
let themeConfig = {
  // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
  repo: 'nado-dev/BIP2-Doc-ZH',
  repoLabel: 'GitHub',
  lastUpdated: 'Last Updated',
  smoothScroll: true,
  sidebarDepth: 2,
  sidebar: [
    ['/', 'BIP2中文文档'],
    ['/introduction', '开始'],
    ['/bip2_language', 'BIP2语言']
  ],
  nav: [
    {text: 'BIP2 Document', link: 'https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/index.html'}
  ]
}

// 插件配置
let plugins = [
  ['@vuepress/back-to-top'],
  ['@vuepress/active-header-links', {
    sidebarLinkSelector: '.sidebar-link',
    headerAnchorSelector: '.header-anchor'
  }],
  ['vuepress-plugin-mathjax',{
      target: 'svg',
      macros: {
        '*': '\\times',
      },
    },
  ],
]

module.exports = {
  host: 'localhost',
  title: 'BIP2中文文档',
  description: 'Chinese (zh-cn) translation of BIP2',
  themeConfig: themeConfig,
  plugins: plugins
}