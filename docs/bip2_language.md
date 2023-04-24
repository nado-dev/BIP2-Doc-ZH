> 原文 [The BIP2 Language](https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/language.html)

# BIP2语言

## 简介



<div align=center> <img alt="图片2.1"
                        src="https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/_images/BIP.png"/> </div> BIP2的三层表示

BIP2（*Behavior, Interaction, Priority* version 2，行为-交互-优先级版本2）是一种用于复杂系统建模和编程的、基于组件的语言。在 BIP2 中，一个系统被表示为：

* 一组*组件*（*Component*），用于规定系统的的**行为**（*Behavior*）；
* 一组**交互**（*Interaction*），定义了组件之间可能的同步和通信； 交互通过*连接器*（Connector）构建，这些连接器对应着一组交互的子集（参见 [连接器](#连接器) 章节）。
* 一组**优先级**（*Priority*），用于解决交互之间可能产生的冲突，或定义交互之间的调度策略，参见 [优先级](#优先级) 章节）。

通过行为、交互和优先级，我们可以构建出复杂组件的层级结构，简称为**复合组件**（*Compound* component，或者简写为 *Compound*）。一系列组件、连接器和优先级组成了复合组件（参见 [复合组件](#复合组件) 章节）。**原子组件**（*Atomic* component，或者简写为 *Atom* ）是最简单的组件类型，它是无层级结构的，它的行为表现为自动机（*automata*）或 Petri 网（参见 [原子组件](#原子组件) 章节）

在下文中，我们使用术语**组件**来指代原子组件或复合组件。可供其他组件和连接器访问的**端口**（Port）和**变量**（Variable）共同定义了特定组件的接口（Interface）。端口以同步的方式用于组件之间的通信，变量则存储了组件内部的状态信息。端口和变量可以通过优先级或守卫条件来访问控制，以解决冲突或解除不确定性。

BIP2 编译器接受具有*包*（Package）声明的文件作为输入进行处理。处理得到的文件中，一个被称为模型（Model）的复合组件描述了我们想要模拟、分析、验证或只是执行的系统。

## 语言概览

### 符号规则约定

在下面的部分中，我们将描述 BIP2 语言的主要特性。该语言的语法由遵循以下约定的一组派生规则表示:

* 规则以其名称开头，后接符号 `:=`，再是一个或多个结束规则和非结束规则，如 `non_term := 'term' sub_non_term`
* 结束元素被包裹在 `' '` 中，如 `'terminal'`

在许多上下文中，标识符用于表示包名(`package_name`)、变量(`variable_name`)等。实际上，这些结构都可以由语法中的一个规则表示，但是为了可读性，我们使用描述性规则同义词来引用它们。您可以在 BIP2语法中找到完整的语法（参见 BIP语法 章节）。

#### 一个规则的例子

```
sample_rule :=
  'some text' another_rule 'some ending text'

another_rule :=
  'foo bar terminal'
```

### 注解

注解（Annotation）是一种为除编译器以外的工具定义所需信息的机制。编译器检查只注解的语法，但忽略其内容。接受注解的 BIP2 语句用以下表示法表示:

* **可使用注解**

注解的语法在下面给出：

#### 语法

```
annotation :=
  '@' annotation_name ['(' annotation_parameter (',' annotation_parameter)* ')']

annotation_parameter :=
    annotation_key
  | annotation_key '=' annotation_value
  | annotation_key '=' '"' annotation_string_value '"'
```

#### 例子

```
@cpp(foo=bar, obj="foo.o,bar.o")
atom type MyAtom(int x)
 ...
end
```

### 包

包是包含在单个文件中的编译单元。它可能包含带有`use` 指令的其他包。在 BIP2中，一个包可能包含:

* 常量数据（constant data），见[变量和数据类型](#变量和数据类型)
* 外部数据类型（external data type），见[变量和数据类型](#变量和数据类型)
* 外部函数（external function），见[变量和数据类型](#变量和数据类型)
* 外部操作符（external operator），见[行为](#行为)
* 端口类型（port type），见[端口类型](#端口类型)
* 原子类型（atom type ），见[原子组件](#原子组件)
* 连接器类型（connector type），见[连接器](#连接器)
* 复合组件类型（compound type），见[复合组件](#复合组件)

常量在类型定义或者其他常量数据的初始化中被引用。常量数据仅仅在定义它们的包中可见。

::: tip 重要

BIP2 仅允许声明可以进行简单类型检查的类型名称，但不支持类型定义（类、结构等）。后端负责真正解释这些类型（例如，C++ 后端将这些类型直接映射到 C++ 类型）。

:::

::: tip 重要

要引用在其他包中声明的类型，请在类型名前加上声明它的包的名称(例如  `some. pack.name.SomeAtomType`)

:::

#### 语法

* **可接受注解**

  ```
  package_definition :=
    'package' package_name
       ('use' package_name)*
  
       data_type*
       (extern_function | extern_operator)*
       bip_type+
    'end'
  
  data_type :=
   'extern data type' type_name
       [ 'refine' type_name (',' type_name)* ]
       [ 'as' '"' backend_name '"' ]
  
  extern_function :=
   'extern function' [type_name] function_name '(' [ type_name (',' type_name)* ] ')'
  
  extern_operator :=
   'extern oprator' [type_name] operator '(' [ type_name (',' type_name)* ] ')'
  ```

#### 例子

```
  package SomePackage
    const data int my_const_int = 42
  
    extern data type my_list
  
    extern function int min(int, int)
    extern function printf(string)
    extern function display(my_list)
    extern function int get(int i, my_list)
  
    port type Port_t()
    port type Port_t2(int i, my_list l)
end
```

### 变量和数据类型

在 BIP2 中变量被用于存储数据的值。它们的定义包括了一个（数据）类型和它的名称。比如：

```
data int x
```

声明了一个类型为 `int`，名字是 `x` 的变量。关键字   `data` 在 BIP2 类型的参数声明中常常被省略（例如在端口类型、原子类型、连接器类型和复合类型中）。在包中，常量可以使用关键字 `const data` 和初始化操作符 `=` 进行声明，例如：

```
const data float Pi = 3.1415926
```

这条语句在包的开头声明了一个名为 `Pi` 的常量，其类型为 `float`，值为 `3.1415926`。

::: tip 重要

包内的常量是唯一可以（也必须）在声明时初始化的变量。其他类型的变量应该在声明之后初始化。

:::

变量的类型既可以是*原生的*（*native*），也可以是*外部的*（*external*）。原生类型作为 BIP2 语言的一部分，BIP2 编译器可以识别。当前受到支持的原生类型包括：

* `bool`，布尔值，值为 `true` 或 `false`
* `int`，整型（例如 `-100`、`0`、`32`）
* `float`，浮点型（例如 `2.7182818`）
* `string`，字符串类型（例如 `"My name is BIP2\n"`）

请注意整型 `int` 在编译器中被当做是浮点型 `float` 的子类型（浮点型可以兼容整型），这意味着每当可以接受浮点型数值时，整型也是可以被接受的。

::: tip 重要

BIP2 的语义没有指定原生数据类型的确切编码形式（如位数、范围等）。目前原生类型的具体实现是在后端实现的，通常是将原生数据类型映射到目标语言的一般类型。例如，当使用 C++ 后端时，原生类型 `bool` 、 `int` 、`float ` 和  `string ` 分别映射到 C++ 类型  `bool` 、 `int` 、 `double ` 和  `std::string`。

注意，包中的常量和组件内的参数，只能是原生类型。

:::

除了预定义的原生类型之外，也可以使用关键字 `extern` 来声明其他类型。这些类型应该在编译生成代码时由外部定义并提供。举例来说，当使用 C++ 后端时，所有外部类型应该被定义在外部的 C++ 文件中，这些文件会在编译生成代码的过程中过程中被引入。下面是一个名为 `IntList` 的外部类型的声明：

```
extern data type IntList refine List as "std::list<int>"
```

这个定义表明了 `IntList` 是一个合法的类型名，同时它指明了 `IntList` 是一个（外部）类型 `List` 的子类型，同时 `IntList` 应该被代码生成器（在此例中指定为 C++ 代码生成器）转化为 `std::list<int>` 。如果没有指令`as`的话，代码生成器将直接使用类型的名字（即 `IntList` ），例如，当使用以下声明时，代码生成器时将不会翻译 `IntList `，并在生成的代码中直接使用其名称。

```
extern data type IntList refine List
```

::: tip 重要

如果没有任何额外的声明，编译器会假定除了赋值（使用 `=` 操作符）之外，不能对外部类型执行任何操作。这意味着外部类型的赋值应该在生成的代码中实现，例如通过编译过程中包含的其他文件来实现。

:::

至于外部类型，BIP2 允许声明外部函数原型，这些原型在编译生成代码时被假定为在外部定义并存在。外部函数的声明由可选的返回类型名称、函数名称和函数参数的类型名称列表组成。例如:

```
extern function int rand()
extern function printf(string)
extern function int getElement(int, IntList)
```

* 外部函数 `rand` 没有参数，返回值是一个整型；
* 外部函数 `printf` 接受一个字符串类型作为参数，没有返回值；
* 外部函数 `getElement` 接受一个整型和一个 `IntList` 类型作为参数，返回值是一个整型。

::: tip 重要

外部函数原型可能涉及外部数据类型（显然这些类型必须正确声明）。在原型声明中没有关于重载的特定限制：不同的原型可能具有相同的函数名，即使它们具有相同数量的参数和/或不同的返回类型。这可能会在编译涉及外部函数调用的表达式时触发错误，在 [操作](#操作) 中会加以说明。

:::

### 操作

操作（Action）在 BIP2 中指的是计算和数据变换。在*常量*的上下文（constant context）中，表达式应该不能有任何副作用。注意编译器不能检测到涉及到的常量上下文中的外部函数是否具有副作用，用户需要自行确保外部函数调用是无副作用的。在非常量的上下文（non-constant context）中，允许进行任何计算。除上面两种以外还存在一种混合上下文（mix context），其中有一些数据可以被更改，另一些则不能（请见 [连接器](#连接器) 章节）。只要有可能，编译器就会限制可能的操作来确保“常量性（const-ness）”。

操作中的计算和数据转换由类C语言风格的语法语句（statement）和表达式（expression）表示。语句指的是赋值、函数调用和 `if-then-else` 式的条件选择结构。需要注意，BIP2 语言不支持循环。语句中涉及的表达式可以使用比较运算符、算术运算符、布尔运算符和函数调用（带返回值）来组合。通常，括号`(`和`)`可用于对表达式进行分组并执行特定的求值顺序。一个操作中的多个语句放在括号中，而单个语句由 `;` 分隔。下列运算符可用于原生类型：

* `==` 判等
* `!=` 不等
* `<` 小于
* `>` 大于
* `<=` 小于等于
* `>=` 大于等于

下面列举的算术运算符只能应用于数字，如 `int` 和 `float` 数据类型。如果所有的参数的类型都是 `int` 类型，它们的返回值也是 `int` 型；否则它们返回浮点数类型的值。

* `/` 除法运算
* `%` 取余运算
* `+` 加法运算或正号
* `-` 减法运算或负号
* `*` 乘法运算

逻辑布尔运算符智能应用于布尔值（具有 `bool` 数据类型），返回的是布尔值。

* `&&` 逻辑与
* `||` 逻辑或

布尔按位运算符只能应用于 `int` 数据类型，返回值是 `int`。

* `&` 按位与
* `|` 按位或
* `^` 按位异或
* `~` 按位求反
* `!` 逻辑非

赋值运算符可以将值赋给变量，前提是该值的类型与变量的类型兼容，也就是说它必须是同一类型或者是其子类型。注意，与以前的运算符不同，默认情况下赋值运算符也适用于外部类型。

* `=` 赋值

::: tip 重要

BIP2 的语义并没有确切指定实际行为数据类型和相应的操作（例如，整数或浮点数类型的最小/最大范围、溢出行为等）。目前是在后端完成数据类型的专门化，通常是通过直接将 BIP2 类型和操作映射到目标语言的一般类型和操作。

:::

除了预定义的操作符之外 ，如果声明了外部函数的原型，我们还可以调用外部函数，正如在[变量和数据类型](#变量和数据类型)中所提及的一样。一个函数调用满足以下条件时将匹配到对应的函数原型：

1. 函数调用与函数原型具有相同的函数名和相同数量的参数；
2. 函数调用里的参数与原型的参数兼容。

如果一个函数原型具有另一个函数原型相兼容的参数，至少是一个严格的子类型，那么可以说是一个圆形比另一个原型更加精确。例如在以下情况下，第一个原型严格地比第三个更精确，而他与第二个原型不具有可比性。

```
extern function float min(float, int)
extern function float min(int,   float)
extern function int   min(int,   int)
```

如果下列断言之一成立，函数调用将不会编译:

* 它不匹配任何已声明的外部函数原型，“no match prototype” 错误。
* 它至少匹配了两个原型，而没有一个比另一个更精确，“ambiguous function call” 错误。
* 最精确匹配函数原型的返回类型与调用函数的表达式的其余部分不兼容，“incorrect type” 错误。
* 最精确的匹配原型没有返回类型，而函数调用返回值包含在表达式中，“no return value” 错误。

假定函数原型 `min` 有以下两种：

```
extern function float min(float, int)
extern function float min(int,   float)
```

语句 `x = min(0, 0)` 会引起编译错误，如：

```
[SEVERE] In /path/to/file/my_bip_file.bip:
Ambiguous function call 'min' with parameter(s) of type(s) 'int, int': cannot decide
between 'float min(float, int), float min(int, float)' :
    38:
    39:         x = min(0, 0);
--------------------^
    40:
    41:
```

与外部函数类似，外部操作符使用 `extern operator` 进行声明，紧跟着返回数据类型、目标操作符（注意与函数声明中的函数名不同）与其参数，例如：

```
extern operator string +(string, string)
```

外部操作符的声明应该始终包括返回类型，并且外部操作符的声明的参数数量受限于给定操作符在原生类型语言中的参数数量。例如在以下列举的代码中前两个声明不被允许，而后两个是正确的。

```
extern operator Complex *(Complex)           // not valid: missing argument    - ERROR!
extern operator         *(Complex, Complex)  // not valid: missing return type - ERROR!
extern operator Complex *(Complex, Complex)  // OK
extern operator Complex *(float,   Complex)  // OK
```

请注意外部比较操作符（`==`  、`!=` 、`<`  、`>`  、`<=`  、`>=`）不强制要求返回布尔值，但是为了代码可读性的考虑，我们建议避免采取这样的实践。类似地，逻辑操作符（`!` 、 `||` 、 `&&` ）可以被重定义为非布尔值，但是我们强烈建议不要这样做。

```
extern operator int     ==(IntList, IntList)  // allowed but not recommended!
extern operator IntList ||(IntList, IntList)  // allowed but not recommended!
```

#### 例子

```
{
  a = a * (2 + b);
  g(d);
  b = f(a);
}
```

在常量上下文中，操作包含了在括号中的单个表达式，其计算结果必须是布尔值 。

::: tip 重要

根据操作所在的位置，数据引用可以采取不同的形式。例如，在[原子组件](#原子组件)中，数据可以通过声明名称直接引用；而对于需要引用端口中的数据的连接器而言，必须使用点（.）操作符（例如，`port_name.data_name`）

:::

目前只存在单控制流操作：`if-then-else`，语法如例子所示

```
if ( boolean_condition ) then
  statement1;
else
  statement2;
fi
```

`else` 部分是可选的，也是可以省略的。表达式 `boolean_condition` 必须计算得到布尔值。

### 端口类型

端口（Port）用于同步组件，并在一个模型的组件之间以同步的方式传递信息。可以通过与端口相关联的变量访问所传递的信息。声明端口类型时，端口类型以关键字 `port type` 声明，后面跟着端口类型名称和一个可能为空的可访问变量列表。下面的例子声明了一个类型为 `port_t` 类型的端口，该端口关联了变量 `x` ，从端口可以访问变量 `x` 的值。

```
port type port_t(int x)
```

#### 语法

- **可接受注解**

  ```
  port_type_definition :=
    'port type' (package_name '.')? port_type_name
      '(' data_param_declaration (',' data_param_declaration)* ')'
  ```

### 原子组件

*原子组件*是最简单的组件，代表自动机或用数据扩展的 Petri 网描述的行为，*原子类型*由 `atom type` 指令声明，包括：

* 一个可能为空的、用于存储数据的变量列表。原子组件可以导出（export）数据，以便可以被优先级访问并使用；
* 一个可选的、可以引用变量的端口声明的列表。连接器可以访问导出的端口；
* 一个定义了原子组件行为的自动机或者 Petri 网。原子组件的行为通过一组变迁（transition）描述，这些变迁会根据使能端口的行为改变原子组件的状态（译注：即当触发使能的端口时，可以引起原子组件内部自动机或者 Petri 网状态的转换）。

#### 数据类型和变量

在 BIP2 中，（数据）变量被用于存储数据。变量的声明使用 `data` 关键字，如：

```
data int x
```

声明了一个名为 `x` 的整型变量。

使用 `export` 指令导出的变量可以用来保护复合组件的优先级（参见 [复合组件](#复合组件)）

#### 原子组件中的端口

原子组件使用 `port` 指令声明端口。端口由类型、名称和一个可选的之前已经声明过的变量组成的列表组成。如果之前声明过的变量的类型与相应端口的参数类型不匹配，这种情况是错误的。注意传参不允许隐式类型强制转换。例如，如果之前声明过的的某参数的类型为 `float` ，这不允许在端口变量中将其作为 `int` 类型。下面的代码片段中展示了端口类型 `Port_t` 中的三个参数，分别关联了 3 个名为 `a` 、`b`、 `c` 的变量。

``` {8}
port type Port_t(int x, float y, some_type z)

atom type SomeType()
  data int a
  data float b
  data some_type c

  port Port_t p(a, b, c)
  ...
end
```

端口可以通过 `export` 指令导出，组件中导出的端口可以被模型中的其他组件访问到。在组件接口中，导出的端口可以被单独访问（如图片2.2），或者合并成一个端口（如图片2.3）。在后一种情况中，这些被合并的导出端口必须具有相同数量和类型的参数。合并后的端口提供对所有的原先独立端口所关联的变量的访问途径。

<div align=center> <img alt="atom-export-ports.png"
                        src="https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/_images/atom-export-ports.png"/> </div>图片2-2：独立端口。端口 p  、q 和 r 可被单独访问

在 BIP2 中，使用以下语句分别导出端口 `p`  、`q` 和 `r` ：

```
export port port_t p(x), q(y), r(z)
```

<div align=center> <img alt="atom-merged-export-ports.png"
                        src="https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/_images/atom-merged-export-ports.png"/> </div>图片2-3：合并端口。端口 p  、q 和 r 被合并，通过 exp 端口导出

使用 `as` 关键字合并和导出端口 `p`  、`q` 和 `r` 为一个单独的端口 `exp` 。

```
export port port_t p(x), q(y), r(z) as exp
```

#### Petri网

*Petri 网*实现了原子组件的行为。它们包含了*库所*（place）和*变迁*（transition）。通过标记对库所的标记，库所被用于存储当前原子组件的控制位置，也就是说，一个为真的布尔函数会关联到被标记的库所（译注：即，库所表示的是当前原子组件的控制状态，当前的控制状态对应的库所就是“被标记的（marked）”）。在原子组件中使用 `place` 关键字来声明库所，`place` 关键字后接要声明的库所的名字列表，例如，下面的代码声明了名为 `START` 、`SYNC` 、`END` 的库所。

```
places START, SYNC, END
```

变迁会改变原子组件当前*状态*（*state*），并调用可能改变原子组件内部变量的有关操作。变迁规定了：

* 一组*触发库所*（*triggering* place），当特定变迁发生时当前原子组件的状态需要由这些库所标记，（译注：即当触发状态变迁时对应的原子组件中的状态，理解为"变迁的起点"）。使用关键字 `from` 声明。
* 一组目标库所（*target* places），在（变迁相关联的操作）执行完成后这些库所被标记（译注：即"变迁的终点"）。使用关键字 `to` 声明。
* 一个关于（局部）变量值的布尔条件。转换只有在当前状态下满足这一条件时才会进行。这样的条件被称为*守卫*条件（*guard*），通过关键字 `provided` 声明。若无守卫条件，不对变迁的发生进行限制。
* 一个在 `do` 关键字后可选的代码块，在变迁发生时被执行。

原子组件中的变迁满足以下条件时是*使能*的（*enabled*）：

* 变迁的要求的所有触发库所与当前原子组件中的状态匹配，并且
* 所有的守卫条件为真，或者没有设置守卫条件

::: tip 重要

请注意在 BIP2 中，我们的目标是 *1-safe* Petri 网（译注：1-safe Petri 网指的是库所只能有至多一个 token 的 Petri 网，[reference](http://web.cs.ucla.edu/~palsberg/paper/tcs95.pdf)），这样的 Petri 网的中使能的变迁的目标库所是永不被标记的。在编译时和运行时都会检查原子组件的 Petri 网的这个属性，如果违反了这个属性，就会导致错误。注意，由于*自动机*（*automata*）是 1-safe Petri 网的子情况，它们可以用来定义原子组件的行为。在自动机中，每个转换最多只有一个触发点和一个目标点。

:::

我们区分了三种不同类型的变迁：

* *初始*（*initial*）变迁负责初始化标记库所和原子组件的变量。它是在模型初始化过程中强制的、只执行一次的变迁。它没有触发库所也没有关联的守卫条件。初始变迁也不能被其他组件观察到，也不能与其他组件的变迁同步。下面的代码片段指明了一个原子组件的初始变迁，它标记了一个库所 `START` 并且初始化了变量 `x` 和 `y` 。

  ```
  initial to START do { x=0; y=0; }
  ```

* *内部*（*internal*）变迁对其他组件不可见，并优先于其他可被（其他组件）观察到的变迁。其执行与否取决于当前（组件的）状态和所关联的守卫条件。内部组件使用关键字  `internal` ，下面的代码片段声明了一个内部变迁，它将在当前原子组件状态匹配库所 `START` 时使能，将当前状态迁移到库所 `SYNC` ，并且受到守卫条件的限制。

  ```
  internal from START to SYNC provided (x!=0) do { x=f(); }
  ```

* 被*内部端口*名称（internal port name）标记的变迁对其他组件可见。由导出的内部端口标记的变迁可以通过连接器与其他组件的变迁同步 。这样的变迁可以使用关键字 `on` 声明。下面的例子指明了一个被内部端口 `s` 标记的变迁，这个变迁可以将当前的状态从 `SYNC` 改变为 `END` 。

  ```
  on s from SYNC to END
  ```

下图给出了一个原子组件 `A` 中变迁的执行顺序的例子。在这个例子中，初始变迁之后执行一个内部变迁，然后执行一个被端口 `p` 标记的变迁，再然后执行两个内部变迁之后，接着执行一个由端口 `q` 标记的变迁，最后进入了一个没有使能变迁的状态。请注意，原子组件`A` 的可见状态仅有执行 `p` 、 `q` 之前的状态，以及最终状态，而其他的状态是不可见的。

<div align=center> <img alt="transition-execution-sequence"
                        src="https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/_images/non-visible.png"/> </div>原子内部和可见变迁的执行序列。


::: tip 重要

在任何时候只允许一个变迁发生，因为原子组件内部变迁不允许出现非确定性（non-determinism）。类似地，不能同时使由相同内部端口名称标记的两个变迁使能。

:::

#### 优先级

*优先级*（*priority*）用于解决冲突，或定义由端口标记的变迁之间的顺序，（从待选变迁中）选择出的变迁对应着具有最高优先级的端口。优先级可能会包含一个名为守卫条件的布尔表达式，该表达式指明了优先级的适用条件。初始变迁和内部变迁不可设置优先级。下面的例子中，端口 `q` 比 `p` 有更高的优先级，前提是变量 `x` 等于 0：

```
priority myPrio p < q  provided (x == 0)
```

原子组件中定义的这种优先级的传递闭包，指的是端口和相关变迁之间的偏序（partial order）关系。如果存在优先级关系 `p < q`并且守卫条件为真，那么端口 `q` 比 `p` 有更高的优先级；或者对于端口  `p1` 、`p2`、······，如果存在优先级关系 `p < p1 < p2 < ... < pN < q ` 并且守卫条件为真，那么同样地，端口 `q` 比 `p` 有更高的优先级。请注意对于上述的优先级序列而言，端口 `p1` 到 `pN` 并不一定要求是使能的。如果某个使能的变迁具有最高优先级，则该变迁为*最大的*（*maximal*）。

::: tip 重要

优先级（例如 `a < b < c < a` ）中出现的不一致（inconsistency）会被检测出并被报告。如果优先级没有包含守卫条件，检测会在编译时进行。存在守卫条件时，守卫表达式在模型编译期间不能被计算，因此在这种情况下，优先级的验证将会被推迟到运行时。

:::

#### 原子组件中使能的端口

如果内部端口可以触发原子组件状态的使能，则称该内部端口是*使能的*（*enabled*）。这样的端口对应的使能变迁是最大的（“最大”的概念见上节，有最高优先级的），则该端口也是最大的。在接口级别，导出的最大端口也是使能的。当多个内部端口通过同一个端口导出（如合并导出）时，它们对于其他组件都是可见的，这些组件可以通过接口与其中任意的内部端口交互。因此，如果内部端口引用了变量，则（外部组件）从接口访问到的值是使能的的*最大*内部端口（所关联的变量的）的值。

> 可供其他组件和连接器访问的**端口**（Port）和**变量**（Variable）共同定义了特定组件的接口

下图阐述了一个名为 `exp` 的合并端口的例子。`exp` 包含了三个内部端口 `p` 、`q` 和 `r` ，每个内部端口各自引用了一个变量（如内部端口 `p` 、`q` 和 `r` 分别引用了变量 `x` 、 `y`  和 `z` ）。合并端口 `exp` 至少有一个所属的端口使能时，它自身才是使能的。但是，只有当内部端口使能时，该端口对应的的变量才可以从接口访问。例如，如果端口 `x` 和 `z` 是使能的，它们各自关联的变量的值 `u` 和 `w` 可通过 `exp` 访问。另一方面，如果只有端口 `y` 是使能的，端口 `exp` 关联的值是 `v` 。这意味着当其他组件通过端口 `exp` 与 组件 `A` 交互时，外部组件是通过端口 `p` 使用值 `u` ，或是通过端口 `q` 使用值 `v` ，还是使用值 `w` 与端口 `r` 交互，这取决于哪些内部端口是使能的。

<div align=center> <img alt="atom-enabled-ports.png"
                        src="https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/_images/atom-enabled-ports.png"/> </div>原子组件中使能的端口及其变量的对应值的示例。


#### 例子

```
atom type MyAtom(int P)
         data int x
  export data int y

         port Port_t r(x), s(y)

  places START, SYNC, END

  initial             to START                do { x=P; y=0; }
  internal from START to SYNC provided (x!=0) do { y=f(x); }
  on r     from START to SYNC                 do { y=x; }
  on s     from SYNC  to END
end
```

上面的 BIP2 代码片段展示了一个名为 `MyAtom` 的原子组件类型。`MyAtom`接受一个整型变量 `P` 作为参数，内部有两个整型变量 `x` 和 `y` ，其中 `y`是导出的整型变量。另外 `MyAtom` 有两个导出的端口 `r` 和 `s` 。三个库所—— `START` 、`SYNC` 和 `END` ，这些库所对应着自动机中定义了原子组件行为的状态。初始迁移使原子组件的状态迁移到 `START` ，内部迁移将状态从 `START` 迁移到 `SYNC`，另外被端口 `r` 触发的迁移的行为与上述内部迁移一样，最后由端口 `r` 触发的迁移将状态从 `SYNC` 修改为 `END`。`MyAtom` 的图示如下：

<div align=center> <img alt="atom-syntax"
                        src="https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/_images/atom-syntax.png"/> </div>
由于内部变迁比端口变迁有更高的优先级，只有当内部变迁的守卫条件不起作用时，才会执行端口 `r` 的变迁，比如当变量 `x` 的值为0时。

#### 语法

* **可接受注解**

  ```
  atom_type_definition :=
    'atom type' atom_type_name '(' [ data_parameter (',' data_parameter)* ] ')'
       (['export'] 'data' data_type
          data_declaration_name ( ',' data_declaration_name )* )*
       (['export'] 'port' port_type
          port_name '(' data_declaration_name (',' data_declaration_name )*) ')'
          ( ',' port_name '(' data_declaration_name (',' data_declaration_name )*) ')' )*
          ['as' port_name] )*
       'place' place_name (',' place_name)*
       'initial to' place_name (',' place_name)* ['do' actions]
       ( ('on' port_name | 'internal')
          'from' place_name (',' place_name)*
          'to' place_name (',' place_name)*
          ['provided' '(' transition_guard ')'] )*
          ['do' actions]
       atom_priority_declaration*
     'end'
  ```

### 连接器

连接器（connector）是*无状态*（*stateless*）实体，支持通过其接口端口在一组组件之间进行交互（interaction）。通过连接器定义的交互是对所连接的组件的一个子集的强同步（strong synchronization）（例如交汇，rendez-vous）。交互允许在组件之间传递数据。如果连接器连接了其他连接器暴露的端口，那么连接器是*分层的*（*hierarchical* ）。

#### 连接器连接的端口

连接器类型接受一个有类型的端口的列表作为参数，这些端口对应了与这个连接器类型相连接的实体（组件或者是其他连接器）的端口。连接器（连接器类型的实例）将这些参数绑定到相同类型的实际端口上。

> 连接器类型的声明如
>
> ```
> connector type ConnectT(Port_t1 p, Port_t2 q, Port_t3 r)
> ```

::: tip 重要

组件或者是连接器必须要在连接器中最多连接一次，也就是说，不能从不同连接端口访问同一个组件或连接器。

::: 

#### 数据变量

连接器类型可以定义变量，用于存储与交互相关的转换函数中执行的计算的中间结果。暂存的值只能在交互执行期间访问。我们可以声明一个名为 `tmp` 的整型变量，语法如下所示：

```
data int tmp
```

#### 导出端口

连接器可以*导出*单个端口，该端口可以连接到其他连接器实例并形成*分层*连接器，或者可以在复合组件的接口中导出（请参见 [复合组件](复合组件)）。只有当：

1.  如果导出端口没有直接连接到另一个连接器（即，只有当其上层被包含的复合组件导出后，它才可以连接到其他连接器），或

2. 没有导出端口时

连接器被称为为*顶级*（*top-level*）连接器。下面的连接器类型声明中声明了一个名为 `exp` ，类型为 `port_t` ，引用了变量 `temp` 的导出端口：

```
export port port_t exp(tmp) 
```

#### 连接器中定义的交互

在形式上，连接器类型中定义的交互是其端口（即连接器类型的端口参数列表，见[连接器连接的端口](#连接器连接的端口)）的子集。不论这些连接的端口的状态如何，连接器类型需要显式定义一组被允许的交互。根据下面的语法，根据所涉及的端口名称，交互的表达式定义如下:

```
connector_port_expression :=
  ( sub_expression )+

sub_expression :=
  ( port_name | '(' connector_port_expression ')' ) [''']
```

也就是说，交互表达式是可以是端口名称的列表，或者是嵌套表达式（括号内的表达式）的列表。根据实际情况交互表达式可以被*引用*（译注：指的是在表达式最后被符号 `'` 标注，如 `p'`  或 `(p q)' `）。被引用的端口名称或者嵌套的表达式被称为*触发器*（*trigger），未被引用的被称为*同步（*synchron*）。

> 译注：同步与触发器
>
> 简单给出一个连接器的例子以便理解。假设一个复合组件`Comp`拥有一个连接器 `Conn(Port_t p1, Port_t p2)` 的实例 `conn`，并传入两个原子组件 `AtomC` 的导出端口 `p1` 和 `p2`，此时 `AtomC` 的两个暴露出的端口被连接器*同步*了。
>
> ```
> compound type Comp
> 	...
> 	component AtomC atomc;
> 	connector Conn conn(atomc.p1, atomc.p2)	
> end		
> ```
>
> 当 `p1` 被指定为触发器时，`Conn` 的定义如下：
>
> ```
> connector type Conn(Port_t p1, Port_t p2)
> 		define p1' p2
> 		... // 转换函数
> end
> ```
>
> 这意味着交互要求`p1`必须被触发、`p2`是可选的。也就是说这种允许的交互有 `p1` 和 `p1 p2`两种。被交互包含的端口反映了外部实体端口的同步关系。
>
> 当 `p1` 和 `p2` 都定义为同步时，`Conn` 的定义如下：
>
> ```
> connector type Conn(Port_t p1, Port_t p2)
> 		define p1 p2
> 		... // 转换函数
> end
> ```
>
> 这种情况下只有 `p1 p2` 同时触发时对应的交互才会被允许。
>
> 详细请继续阅读下文

一个形如 `p` 的表达式，其中 `p` 是一个端口的名字，定义了一个单独的交互 "`p`"。形式如 `e'` 表达式定义的是由 `e` 端口定义的交互。表达式 $e_1 \; e_2 \;... \;e_n$ 定义的交互是根据子表达式  $e_1$ , $e_2$ , $···$, $e_n$ 定义的交互递归计算得到的，下面阐释了这一规则：

对于某个交互 $I$，如果以下两个规则都适用，则称 $I$ 是由 $e_1 \; e_2 \;... \;e_n$ 定义的：

*  $I$ 可以被改写为由子表达式定义的交互的并集 $e_1$ , $e_2$ , $...$  , $e_n$ 
*  $I$（至少）包含一个由触发器子表达式定义的交互；或者对于每个子表达式 $e_i, \; i=0,···,n$， $I$ 都包含一个由 $e_i$ 定义的交互

下面在这个例子中，我们定义了一个触发器子表达式 `(p q)` 和两个同步端口 `r` 和 `s` 。

```
define (p q)' r s
```

这个表达式允许的交互必须至少包含 `p` 和 `q` 两者，如 `p,q`、 `p,q,r` 、`p,q,s` 和 `p,q,r,s`

#### 守卫条件和转换函数

连接器类型中定义的交互集可以进一步受到的*守卫条件*（*guard*）的限制。守卫条件会计算一个引用了交互所涉及端口的变量的布尔表达式的值，只有当这个布尔值为真时关联的交互才会进行。

*转换函数*（*transfer function*）用于在交互进行过程中在组件之间交换数据。转换函数分为两个指令组—— `up` 组和 `down` 组。

`up` 指令组计算导出端口引用的变量的值，另外， `down` 部分中可以把计算所使用的中间值临时存储在连接器内定义的变量中。下面的例子中，我们定义了两个端口之间的汇合交互，其中临时变量被存在变量 `tmp` 中。为了防止除零的情况，当 `y` 的值为0时该交互被禁用。

```
on p q provided (q.y != 0) up { tmp = p.x / q.y; }
```

`down` 指令会更新与交互所涉及端口关联的变量的值。端口关联的变量使用从连接器变量和导出端口的变量计算得到的值进行赋值（即更新端口关联的变量的值）。下面的例子中的指令交换了端口 `p` 和 `q` 中的变量 `x` 和 `y` 的值：

```
on p q down { tmp = p.x; p.x = q.y; q.y = tmp; }
```

请注意转换函数 `up` 和 `down` 可以同时在连接器交互中定义。`up` 函数对应与连接器和组件层级结构中*上行*的数据，即从连接的端口的变量值（从外部接受的作为其参数的端口）上行到连接器导出的端口的变量值（该连接器向外提供的接口）。一旦一个交互被选中并执行，`down` 函数对应着数据流的*下行*，即从连接器导出的端口中的变量，回到连接的端口的变量。

> `up` 反映了变量的值在层级结构中逐层向上传递的过程，`down` 反映了层级结构中向下传递的过程。

::: tip 重要

对于给定的交互，执行 `down` 指令时用到的连接器变量应该由相应的 `up` 指令计算提供。但是，这些值不能在相同交互的不同执行之间，或是不同转换函数的执行过程之间访问。这些变量只存储在同一交互的上行和下行执行过程之间。

::: 

#### 一个连接器类型的例子

```
connector type ConnectT(Port_t1 p, Port_t2 q, Port_t3 r)
  data int tmp // 数据变量
  export port Port_t exp(tmp) // 导出端口，可供外部实体访问

  define p' q r // 定义交互涉及的端口，p 作为触发器

  // 以下为不同端口组合对应的交互，均定义了上行和下行操作
  on p     up { tmp = p.x; }                down { p.x = tmp; }
  on p q   up { tmp = max(p.x, q.y); }      down { p.x = tmp; q.y = tmp; }
  on p r   up { tmp = max(p.x, r.z); }      down { p.x = tmp; r.z = tmp; }
  on p q r up { tmp = max(p.x, p.x, r.z); } down { p.x = tmp; q.y = tmp; r.z = tmp; }
end
```

上面的 BIP2 片段给出了一个名为 `ConnectT ` 的连接器类型定义。该连接器连接了3个端口 `p` , `q` 和`r`。在前文中我们已经看到了使能的交互和转换函数执行的计算过程。这个例子的一个明显的区别是，与端口 `exp`交互的其他连接器可以访问变量 `tmp`。因此，`tmp` 的值可能不同于执行 `up` 的计算所用到的值，因为它可能被连接到 `exp` 的连接器的转换函数所改变。下面提供了 `ConnectT` 的简化图形表示。

<div align=center> <img alt="connector-syntax"
                        src="https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/_images/connector-syntax.png"/> </div>连接器类型例子

#### 由连接器导出的使能的交互和端口

在交互中被定义的端口集合在运行时会受到所涉及的端口和守卫条件的状态的限制。考虑下面涉及到端口 `p` 、`q` 和 `r` 的交互的例子：

```
define p' q r
```

根据上面的定义，被允许的交互有 `p` ,  `p,q` ,  `p,r` 和 `p, q, r`。为了确定哪些组合在模型执行中有效，首先删除包含非使能端口的组合，然后根据有关守卫条件的值进一步限制可能的组合。

如果至少有一个使能的的交互，则连接器中定义的导出端口是*使能的*。注意，通过导出端口暴露给接口的值，其派生的的依据是参与交互的端口的值集。使能的交互中的可访问的值，依次由 `up` 转换函数中的指令计算得到。

下面的示例说明了使能交互和连接器导出端口的变量的值的概念。考虑上面提到的连接器类型 `ConnectT` （见[连接器-一个连接器类型的例子](#一个连接器类型的例子)）的一个实例 `C`。假设端口 `p`、`q`、`r` 都是使能的，并且端口 `p` 关联的变量 `x` 有三个可能的值 $u_1,u_2,u_3$，端口 `q` 的变量 `y` 有三个可能的值 $u_1,u_2,u_3$，而端口 `r` 的变量 `z` 只有一个值  $w$。然后，假定交互 `p`，`p，q`，`p，r` 和 `p，q，r` 四种都是使能的。此外，导出端口 `exp` 的变量 `tmp `有 24 个可能的值，对应了上述四种使能的交互中 `up` 的行为可能出现的值的集合，具体如下：

* 对于交互 `p` ，`tmp` 对应的是 `x` 的值，即 $u_1,u_2,u_3$ 3种；
* 对于交互 `p，q` ，`tmp` 对应的值是 $O_{ij-}=max(u_i, v_j)$ ，其中 $i=1,2,3$ 和 $j=1,2,3$，共9种；
* 对于交互`p, r`，`tmp` 对应的值是 $O_{i-\ast}=max(u_i,w)$，其中 $i=1,2,3$，共3种；
* 对于交互`p, q, r`，`tmp` 对应的值是 $O_{ij\ast}=max(u_i,v_j,w)$，其中 $i=1,2,3$ 和 $j=1,2,3$，共9种。

<div align=center> <img alt="connector-enabled-interactions-port.png"
                        src="https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/_images/connector-enabled-interactions-port.png"/> </div>一个连接器中使能的交互以及变量 tmp 对应的值


#### 语法

* **可接受注解**

```
connector_type_definition :=
  'connector type' connector_type_name '(' port_parameter (',' port_parameter )* ')'
    ('data' data_type data_declaration_name ( ',' data_declaration_name )* )*
    ['export port' port_type
       port_name '(' data_param_declaration (',' data_param_declaration)* ')' ]
    'define' connector_port_expression
    connector_interaction*
  'end'

connector_interaction :=
  'on' (port_name)+
  ['provided' '(' connector_guard ')']
  ['up' '{' (statement ';')+ '}']
  ['down' '{' (statement ';')+ '}']

connector_port_expression :=
  ( port_name ['''] | '(' connector_port_expression ')' ['''] )+

(a connector interaction must have at least one of 'up', 'down' or 'provided')
```

> 一个连接器的交互必须至少有一个“up”、“down” 或 “provided”。

### 复合组件

复合组件（compound）由原子组件和其他复合组件构成。就像原子组件一样，复合组件在其接口处提供了一组端口。从这个意义上说，任何组件的使用方式与它们的具体结构（复合或原子）无关。复合组件类型定义了以下内容：

* 用关键字 `component` 声明的一组组件，可以是原子组件的或是复合组件；
* 用关键字 `connector` 声明的一组连接器，连接了该复合组件中所包含的组件；
* 用关键字 `priority` 声明的一组*优先级*规则；
* 用关键字 `export` 声明的一组导出端口，定义了该组件的接口。

注意，复合组件可以导出其包含组件和连接器的端口。

#### 优先级

*优先级*（*priority*）用于支持特定的一组使能优先级的执行，这样的一组优先级被称为*最大*交互（*maximal* interaction，其定义见下文）。优先级可用于解决交互之间的冲突或表示特定的调度策略。

一个复合组件中的优先级形成了一种偏序关系，对应着定义的优先级规则的传递闭包（transitive closure）。基于*最大进度*原理（*maximal progress* principle），会自动生成一组优先级规则，也就是说，涉及更多连接器的交互将具有更高的优先级。

用户定义的优先级规则的格式为 `I < J`，其中 `I` 和 `J` 是连接器中的交互，符合以下列格式之一：

* `C: A1.p1，A2.p2，... ，AN.pN`，其中 `C` 是连接器，而 `A1.p1，A2.p2，... ，AN.pN`是对应于定义于 C 中的交互的连接端口的一个子集；
* `C: *` ，其中 `C` 是一个连接器，表示 `C` 的所有已定义的交互；
* `*: *` 代表所有连接器的所有已定义的交互

::: tip 重要

用户定义的优先级规则只能作用于顶级连接器中的交互（顶级连接器见 [导出端口](#导出端口)）。

::: 

在优先级规则中使用 `*` 是一种表示规则集合的快捷方式。注意: `* : *` 不能同时用于优先级规则的两端(例如：不允许出现 `* : * < * : *` )。在优先级规则的一端使用 `* : *` 是表示所有连接器中定义的所有交互的快捷方式，但规则的另一端对于所涉及的交互则不能再使用这种表达方式。

用户定义的优先级规则可以使用由 `provided` 关键字提供的守卫条件来保护，只有在其守卫条件为真时才是使能的。在下面的代码片段中，我们展示了一个名为 `myPrio` 的优先级规则，守卫条件规定了该规则只有当原子组件 `A` 和 `B` 的 `x` 和 `y` 变量的值不相同时才使能:

```
compound type Compound_T()
  component Atom_T A()
  component Atom_T B()

  connector RDV C(A.p,B.p)
  connector RDV D(A.q,B.q)

  priority myPrio provided (A.x != B.x) C:A.p,B.p < D:A.q,B.q
end
```

::: tip 重要

由于优先级定义了交互之间的偏序关系，因此在复合组件的任何状态下，使能的优先级规则都不能形成循环。

::: 

如果在已定义的优先级规则的格（译注：lattice，具体参考偏序中格的概念）中， `D` 可以从 `I` 到达，那么可以说连接器 `C` 的使能交互 `I` 的优先级低于连接器 `D` 的使能交互 `J`，也就是说，如果 `C: I < D: I ` 是一个使能的规则，或者如果存在交互 `C1: I1，... ，CN: IN`，使得规则 `C: I < C1: I1，C1: I1 < C2: I2，... ，CN-1: IN-1 < CN: IN，CN: IN < D: J` 是使能的。如果交互在使能的交互中具有最高优先级，则交互是*最大的*。

#### 导出的端口和变量

复合组件类型可以以与原子组件类型类似的方式导出端口和变量。下面的语句使 `x` 变量可以从 `A` 组件的接口访问，并将其重命名为 `y`:

```
export A.x as y
```

组件和连接器的端口可以单独导出，也可以合并成单个端口导出，方法与原子组件中的相同。复合组件的端口是否已使能，取决于底层端口（组件或连接器端口）是否已使能。如果使能并导出了组件的端口，则将使能接口处的相应端口。如果在连接器中使能了（最大）交互，并将其端口导出到复合组件的接口，那么接口处的端口是使能的。此外，接口上可见的值是对应于它所有的最大交互作用的值。对于原子组件，其合并的导出端口，值的并集在接口上是可见的。

```
compound type Compound_t()
  component Atom_t      A(), B()
  connector Connector_t C1(A.p, B.p)
  connector Connector_t C2(A.q, B.q)

  export C1.exp, A.r, B.r as s

  priority myPrio C1:A.p,B.p < C2:*
end
```

在上面的例子中，如果连接器 `C1` 具有最大的交互（例如，当如果 `C2` 没有使能的交互时） ，或者如果 `A` 的端口 `r` 是使能的，再或者是 `B` 的端口 `r` 使能，那么复合类型的实例的端口 `s` 将被使能。此外，如果这些端口有变量，则从 `s` 可见的值是对应于 `C1` 的交互的值与从 `A` 和 `B` 的端口 `r` 可见的值的并的结果。

#### 例子

```
compound type Compound_t()
  component CompT1 K1()
  component CompT2 K2()
  component CompT3 K3()

  connector BRDXP C(K1.p, K2.q)
  connector RDVXP D(C.xp, K3.t)
  connector RDV   E(K2.q, K3.s)

  export port C.xp as u
  export port D.xp as v // 原文档疑似错误
  export port K3.t as w

  export data K3.x as x
end
```

上面的示例展示了定义复合组件类型 `Compound_t` 的语法，该类型包括:

* 组件 `K1`，`K2` 和 `K3`；
* 连接器 `C`、 `D` 和 `E`，使 `C` 和 `D` 连接起来，形成一个分层的连接器；
* 连接器 `C` 和 `F` 的导出端口 `xp` ，和组件 `K3` 的导出端口 `t；`
* 组件 `K3` 的导出变量 `x`。

复合组件类型的图形表示如下图所示。请注意，对于连接器 `D`，连接器 `C` 中的所有使能交互，连接器 `D` 可以通过 `C` 的端口 `xp` 访问到。例如，如果连接器 `D` 中有使能的交互 `p` 和 `p，q`，则从 `D` 可以看到这两者。由于在将端口导出到复合组件的接口时应用了（默认）优先级，只有 `C` 的最大交互才能通过 其 `xp` 从端口 `u` 得到。例如使能的交互 `p` 和 `p，q` 都存在时，由于最大化过程的默认优先级 `p < p,q`，故只有 `p, q`可从 `u` 中得到。请注意一个端口可以连接到若干个连接器上（例如 `K2` 的 `q` 端口同时连接到了 `C` 和 `E` 上），或可以被导出（例如 `C` 的 `xp` 端口），或同时被连接和导出（如 `K3`的 `t` 端口）。

<div align=center> <img alt="compound-syntax.png"
                        src="https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/_images/compound-syntax.png"/> </div>复合类型的示例

#### 语法

* 可接受注解

  ```
  compound_type :=
    'compound type' compound_type_name '(' [data_parameter (',' data_parameter)*] ')'
      component_declaration+
      connector_declaration*
      compound_priority_declaration*
      inner_port_export*
      inner_data_export*
    'end'
  
  inner_port_export :=
    'export port' port_reference (',' port_reference)* 'as' exported_name
  
  inner_data_export :=
    'export data' data_reference 'as' exported_name
  
  compound_priority_declaration :=
    'priority' priority_name
        ('*:*' | compound_interaction) '<' ('*:*' | compound_interaction)
        [ 'provided' compound_priority_guard ]
  
  compound_interaction :=
    connector_name ':' ('*' | (port_reference (',' port_reference)*))
  ```

## 执行序列

BIP2 模型等价于定义了所有被允许的*执行序列*（*execution sequences*）的*标记迁移系统*（*abeled transition system, LTS*）。模型*状态*（state）存储在由变量值和 Petri 网标记表示的原子组件的状态中。执行序列指的是修改全局状态的变迁或交互的序列。在某种状态下使能的变迁和交互定义如下：

* 如果原子组件 A 的某个*变迁*是 (1) 使能的，并且 (2) 是最大的，并且 (3) 没有被导出的内部端口标记，则执行其对应的状态迁移。
* 如果连接器 `C` 中的某个*交互*是 (1) 使能的，并且 (2) 是最大的，并且 (3) 连接器 `C` 没有导出任何借口，则该交互被执行。

在给定的状态下，只允许非导出的最大变迁和交互。在执行过程中，非最大导出变迁或交互是根据模型中连接器的层次结构执行的。

使能变迁的执行会修改当前状态，如下面列举的情况:

* Petri 网的标记会根据变迁的触发库所和目标库所进行修改，即移除触发库所的标记，并在目标库所设置标记；
* 变量会在与变迁关联的代码中修改。

::: tip 重要

如果一个库所既是变迁的触发库所又是变迁的目标库所，则其标记保持不变。

::: 

在连接器 `C` 中的交互 `p1,p2,...,pN` 中，考虑一个特定端口的值组合，它修改模型状态如下：

首先，对所涉及的端口 `p1,... pN` 对应的值，被用来与执行与 `down` 转换函数相关的指令；然后根据端口`p1,... pN` 执行的不同情况修改模型的状态：

* 原子组件中端口的执行等效于相应的迁移；
* 复合组件中端口的执行对应于相应端口的执行；
* 连接器端口的执行对应于相应交互的执行。

::: tip 重要

交互的执行至多对应于模型中每个原子组件的一个迁移的执行。由于原子组件具有不相交的变量和库所集合，因此由相互作用的执行而产生的模型的状态与所涉及的原子组件的执行顺序无关。

::: 
