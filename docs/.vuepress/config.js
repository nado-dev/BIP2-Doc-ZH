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
    // ['/index', 'BIP2中文文档'],
    ['/introduction', '开始'],
    ['/bip2_language', '[重要] BIP2语言'],
    ['/compiler_engine_pre', '编译器和引擎概述'],
    ['/more_about_cpp_code_gen', '关于C++代码生成器的更多信息'],
    ['/installing_using_bip_compiler','BIP编译器的安装与使用'],
    ['/tutorial', '[重要] 使用教程'],
    ['/full_grammar',"BIP2完整语法"],
    ['/installing_using_the_reference_engine', '安装和使用引用引擎'],
    ['/developer_ref_compiler', '编译器开发参考'],
    ['/developer_ref_other_part', '其他部分(构建、包装)开发参考']
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
  plugins: plugins,
  markdown: {
    lineNumbers: true
  }
}