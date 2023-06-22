(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{288:function(v,e,_){"use strict";_.r(e);var t=_(10),a=Object(t.a)({},(function(){var v=this,e=v._self._c;return e("ContentSlotsDistributor",{attrs:{"slot-key":v.$parent.slotKey}},[e("blockquote",[e("p",[v._v("原文"),e("a",{attrs:{href:"https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/compiler-engines-presentation.html",target:"_blank",rel:"noopener noreferrer"}},[v._v("Compiler and Engines presentation"),e("OutboundLink")],1)])]),v._v(" "),e("h1",{attrs:{id:"编译器和引擎概述"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#编译器和引擎概述"}},[v._v("#")]),v._v(" 编译器和引擎概述")]),v._v(" "),e("h2",{attrs:{id:"编译器"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#编译器"}},[v._v("#")]),v._v(" 编译器")]),v._v(" "),e("p",[v._v("编译器由三部分组成，将在以下各节中更详细地介绍:")]),v._v(" "),e("ul",[e("li",[e("em",[v._v("前端")]),v._v("（"),e("em",[v._v("front-end")]),v._v("）: 它与编译器的用户交互。它读取用户输入并将其转换为适合以下过程的形式（即内部表示，internal representation，IR）。")]),v._v(" "),e("li",[e("em",[v._v("中间层")]),v._v("（"),e("em",[v._v("middle-end")]),v._v("）: 对使用了内部表示的应用进行操作（例如优化、体系结构转换等）。其中有一个这样的操作包含在编译器中的一个小"),e("em",[v._v("块")]),v._v("（"),e("em",[v._v("block")]),v._v("）中，稍后我们将称其为"),e("em",[v._v("过滤器")]),v._v("（"),e("em",[v._v("filter")]),v._v("）。")]),v._v(" "),e("li",[e("em",[v._v("后端")]),v._v("（"),e("em",[v._v("back-end")]),v._v("）：从内部表示产生最终结果。通常以编程语言中的源代码的形式（例如C++）呈现。可以同时使用多个后端。")])]),v._v(" "),e("div",{attrs:{align:"center"}},[e("img",{attrs:{alt:"compiler-presentation.png",src:"https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/_images/compiler-presentation.png"}})]),v._v(" 编译器设计概述\n"),e("p",[v._v("典型的编译包括以下步骤:")]),v._v(" "),e("ul",[e("li",[v._v("首先，前端运行并产出 "),e("em",[v._v("BIP-EMF")]),v._v(" 模型；")]),v._v(" "),e("li",[v._v("然后，中间层的过滤器依次执行，结果是一个可能经过了修改BIP-EMF模型；")]),v._v(" "),e("li",[v._v("最后，依次执行所有后端，它们的运行结果即编译结果。")])]),v._v(" "),e("h3",{attrs:{id:"前端"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#前端"}},[v._v("#")]),v._v(" 前端")]),v._v(" "),e("p",[v._v("此部分负责读取用户输入（即，BIP 源代码和命令行参数），并将其转换为中间表示形式，该表示形式将在编译器的其他部分中使用。当前的前端包括一个用于 BIP 语言的解析器和一个描述中间表示的 BIP 元模型（meta-model）。在 BIP 元模型中表示的 BIP 模型的实例称为 "),e("em",[v._v("BIP-EMF 模型")]),v._v("（因为这是一个使用 "),e("a",{attrs:{href:"http://www.eclipse.org/emf",target:"_blank",rel:"noopener noreferrer"}},[v._v("Eclipse Modeling Framework"),e("OutboundLink")],1),v._v(" (EMF)技术表达的 BIP 模型）。有关内部结构的详细信息，请参阅前端。")]),v._v(" "),e("h4",{attrs:{id:"类型模型与实例模型"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#类型模型与实例模型"}},[v._v("#")]),v._v(" 类型模型与实例模型")]),v._v(" "),e("p",[v._v("BIP 语言只处理"),e("em",[v._v("类型")]),v._v("（"),e("em",[v._v("type")]),v._v("）。BIP 不支持运行时实体，即使最终建模结果应该是一个正在运行的系统。这些"),e("em",[v._v("缺失")]),v._v("（"),e("em",[v._v("missing")]),v._v("）的信息通常通过在编译时指定"),e("em",[v._v("根")]),v._v("（"),e("em",[v._v("root")]),v._v("）组件来填充。编译器（即前端）能够建立两个类型模型，一个是类型模型（如作为输入的 BIP 源码的表示），另一个是要运行的系统的"),e("em",[v._v("实例")]),v._v("（"),e("em",[v._v("instance")]),v._v("）模型。两者之间的区别可能是微妙的，特别是当"),e("em",[v._v("声明")]),v._v("的概念混合在两者之间时：")]),v._v(" "),e("ul",[e("li",[v._v("组件类型描述该类型的实例的"),e("em",[v._v("形态")]),v._v("（"),e("em",[v._v("shape")]),v._v("）；")]),v._v(" "),e("li",[v._v("组件声明指导组件类型的实例的创建；")]),v._v(" "),e("li",[v._v("组件实例是一个运行中（"),e("em",[v._v("running")]),v._v("）实体。")])]),v._v(" "),e("p",[v._v("这些概念类似于面向对象语言中的类/实例/对象声明。例如在 Java 中：")]),v._v(" "),e("ul",[e("li",[e("p",[v._v("组件类型 = 类")]),v._v(" "),e("div",{staticClass:"language- line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[v._v("public class MyClass { ... }\n")])]),v._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[v._v("1")]),e("br")])])]),v._v(" "),e("li",[e("p",[v._v("组件（组件类型的实例） = 对象（类的实例）")]),v._v(" "),e("div",{staticClass:"language- line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[v._v("new MyClass();\n")])]),v._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[v._v("1")]),e("br")])])]),v._v(" "),e("li",[e("p",[v._v("组件声明 = 对象声明")]),v._v(" "),e("div",{staticClass:"language- line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[v._v("MyClass m;\n")])]),v._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[v._v("1")]),e("br")])])])]),v._v(" "),e("p",[v._v("请注意，一个组件声明可以触发多个实例的创建。组件声明通常不是整个系统中的判别组件的标识符。")]),v._v(" "),e("h3",{attrs:{id:"中间层"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#中间层"}},[v._v("#")]),v._v(" 中间层")]),v._v(" "),e("p",[v._v("中间层承载所有从 BIP 到 BIP 的转换（"),e("em",[v._v("transformation")]),v._v("）。中间层通过下列操作作用于 "),e("em",[v._v("BIP-EMF")]),v._v("：")]),v._v(" "),e("ul",[e("li",[v._v("架构修改（如展平，组件注入等）；")]),v._v(" "),e("li",[v._v("Petri 网简化；")]),v._v(" "),e("li",[v._v("死锁移除；")]),v._v(" "),e("li",[v._v("数据收集。")])]),v._v(" "),e("p",[v._v("当中间层为空时，当前的编译器不进行任何上述的操作:。参考 中间层 获取更多信息。")]),v._v(" "),e("h3",{attrs:{id:"后端"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#后端"}},[v._v("#")]),v._v(" 后端")]),v._v(" "),e("p",[v._v("后端获取 BIP-EMF 模型，并且读取它并生成某些内容，最有可能的内容是一些其他语言的源代码（例如，C, C++, Aseba等）甚至是 BIP 代码本身。目前主要使用的后端是 C++ 后端，它生成适合于标准引擎的 C++ 代码（标准引擎的定义参见 安装和使用可用的引擎 部分 ）。")]),v._v(" "),e("p",[v._v("可以同时使用多个后端；例如，为与您的输入对应的 C++  版本进行优化之后，您可能需要获得相应优化后的 BIP 版本。编译器的设计禁止了与后端之间的交互（当有多个后端要执行时，编译器没有指定它们将以何种顺序运行，或者执行是否并行）。")]),v._v(" "),e("h2",{attrs:{id:"引擎"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#引擎"}},[v._v("#")]),v._v(" 引擎")]),v._v(" "),e("p",[v._v("引擎接受 BIP 模型的某种表示，并根据 BIP 语义计算相应的执行序列。通常，所使用的表示是一个 C++ 软件，它与引擎的运行时链接以创建一个可执行软件。通常，引擎针对下列一个或多个主要目标:")]),v._v(" "),e("ul",[e("li",[v._v("模型的"),e("em",[v._v("执行")]),v._v("（"),e("em",[v._v("execution")]),v._v("）对应于意图要在目标平台上执行的单个执行序列的计算。在这种情况下，引擎实现模型和目标平台之间的连接，以确保执行在时间和输入/输出数据（通过传感器/执行器）方面的行为正确性。")]),v._v(" "),e("li",[v._v("模型的"),e("em",[v._v("仿真")]),v._v("（"),e("em",[v._v("simulation")]),v._v("）对应于一个单独的执行序列的计算，这个执行序列是出于仿真的目的而在主机上执行的，也就是说，时间以逻辑的方式被解释。")]),v._v(" "),e("li",[v._v("模型的"),e("em",[v._v("探索")]),v._v("（"),e("em",[v._v("exploration")]),v._v("）对应于若干个执行序列的计算，这些执行序列对应于模型中的多次仿真。模型的模型检查需要由语义应用定义的执行序列的完全覆盖，但是部分覆盖足以进行验证或统计模型检查。")])]),v._v(" "),e("h2",{attrs:{id:"引擎与编译器之间的交互"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#引擎与编译器之间的交互"}},[v._v("#")]),v._v(" 引擎与编译器之间的交互")]),v._v(" "),e("p",[v._v("通常来说，后端通过 BIP 模型生成源代码。然后，此源代码与称为"),e("em",[v._v("引擎")]),v._v("（"),e("em",[v._v("engine")]),v._v("）的运行时关联，该运行时负责根据 BIP 语义正确执行 BIP 模型。")]),v._v(" "),e("p",[v._v("生成的源代码可以被视为 BIP 模型的另一种表示形式（前提是 BIP 源代码中包含的信息没有被添加任何内容），这种另外的表现形式适应了一个给定的引擎（该引擎可以实现此语言的语义）的要求。")])])}),[],!1,null,null,null);e.default=a.exports}}]);