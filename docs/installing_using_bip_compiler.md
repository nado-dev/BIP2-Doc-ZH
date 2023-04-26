> 原文 [Installing & using the BIP compiler](https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/installing-using-compiler.html)

# BIP编译器的安装与使用

## 要求

BIP 编译器目前只在 GNU/Linux 系统上进行了测试。目前已知它可以在 Mac OSX 上正确工作，也许还可以在其他的类 UNIX 系统上正确工作，但是目前还未支持它们。

安装编译器之前，您必须安装:

* JavaVM，版本6(或以上)。我们主要使用的是 [OpenJDK](http://openjdk.java.net/)

::: tip 提示

在 GNU/Debian Linux 及其衍生版本(例如 Ubuntu)上，您可以通过以下方式安装这个依赖项:

```shell
$ apt-get install openjdk-6-jre
```

:::

::: danger 警告
以下的说明包括了安装编译器。常见的用法涉及到生成 C++ 代码，这需要引擎的支持。快速安装过程包括了引擎的安装。如果您不使用快速安装程序，请参阅 安装和使用可用的引擎 引擎安装说明。
:::

## 下载和安装

### 获取最新版本

访问 [下载页](http://www-verimag.imag.fr/New-BIP-tools.html) 获取 BIP 工具。我们为您提供两种安装 BIP 编译器和引擎的解决方案:

* 第一种方法更简单、更快捷，但可能不适用于所有系统。编译器和引擎打包在相同的归档文件中，并提供了安装脚本。
* 提供编译器和引擎的独立存档。使用这些归档文件来安装编译器将在第二步中进行说明。

#### 使用自包含的归档文件快速安装

为了使用*快速安装*，您需要下载 `bip-full_<ARCH>.tar.gz` 归档文件，并将 `<ARCH>` 替换为您自己的架构(例如 i686)。然后只需按照下面的步骤:

* 创建一个目录作为安装位置:

  ```shell
  $ mkdir bip2
  ```

* 提取归档文件：

  ```shell
  $ cd bip2 ; tar zxvf /path/to/bip-full_i686.tar.gz
  bip-full/
  bip-full/BIP-reference-engine-2012.04_Linux-i686/
  bip-full/BIP-reference-engine-2012.04_Linux-i686/include/
  ...
  ```

* 设置环境(仅在 bash shell 中生效) :

  ```shell
  $ cd bip-full
  $ source ./setup.sh
  Environment configured for engine:  reference-engine
  ```

* 默认情况下，`setup.sh  ` 配置的是 reference 引擎。您也可以通过分别传入 `optimized-engine` 或 `multithread-engine` 到 `setup.sh` 来选择优化的引擎或多线程引擎，例如，选择优化的引擎:

  ```shell
  $ cd bip-full
  $ source ./setup.sh optimized-engine
  Environment configured for engine:  optimized-engine
  ```

####  为编译器使用单独的归档

存档名称应该类似于 `bipc _ 2012.01.tar.gz`，其版本号取决于您下载时当前提供的最新版本。编译器是一个自包含的归档文件，您需要将其解压缩到一个专用目录中，例如 `/home/a_user/local/bip2`:

```shell
$ mkdir /home/a_user/local/bip2
$ cd /home/a_user/local/bip2
$ tar zxvf /path/to/the/bipc_2012.01.tar.gz
bipc-2012.01/
bipc-2012.01/lib/
bipc-2012.01/lib/org.eclipse.acceleo.common_3.2.0.v20111027-0537.jar
bipc-2012.01/lib/lpg.runtime.java_2.0.17.v201004271640.jar
...
bipc-2012.01/bin/
bipc-2012.01/bin/bipc.sh
...
```

然后，需要将 `/home/a_user/local/bip2/bipc-2012.01/bin` 添加到 `PATH ` 环境变量。

在 bash 中：

```bash
$ export PATH=$PATH:/home/a_user/local/bip2/bipc-2012.01/bin
```

在 tcsh 中：

```bash
$ setenv PATH ${PATH}:/home/a_user/local/bip2/bipc-2012.01/bin
```

###  安装结果速览

安装之后，您应该得到类似于下面的初始目录结构:

```
.
÷── bin
│   `── bipc.sh
`── lib
    ÷── acceleo.standalone.compiler_1.0-20120102155443.jar
    ÷── apache.tool.ant_1.8.0.jar
    ÷── backends
    │   ÷── ujf.verimag.bip.backend.aseba_1.0-20120102155513.jar
    │   ÷── ujf.verimag.bip.backend.bip_1.0-20120102155537.jar
    │   `── ujf.verimag.bip.backend.cpp_1.0-20120102155558.jar
    ÷── com.google.collect_1.0.0.v201105210816.jar
    ÷── filters
    ÷── joptsimple_3.2.jar
    ÷── lpg.runtime.java_2.0.17.v201004271640.jar
    ...
```

* `bin` 目录包含编译器的可执行文件。该目录下通常只有一个用于运行编译器的 `bipc.sh` 脚本。
* `lib` 目录包含编译器的所有 Java 依赖项。子目录 `backends` 包含编译器安装的后端，`filters` 包含了安装构成中间层的过滤器。这个子目录之外的所有文件都是编译器使用的库(EMF、 Eclipse 运行时、命令行解析等)。

## BIP模型正确性的前端检查

编译器总是检查给定的输入对于BIP语言是否有效（例如语法是否正确、优先级中是否出现循环、连接器中的 up/down 数据流是否正确）。这些检查适用于类型模型和实例模型。编译器可能发出两种消息：

* *WARNING*，警告：已经检测到一个潜在的错误，但是由于运行时依赖性，它可能是一个假阳性（ false positive，误报）。此类警告的一个例子是优先级中出现循环，并且其中至少有一个优先级是具有守卫条件的；如果运行时守卫条件为假，则没有循环出现。编译器在这些消息前面加上 `[WARNING]`。
* *ERROR*，错误：发现错误，编译器将尽快停止，原因是非法输入。错误的一个例子是出现了循环的优先级规则，或在 up 阶段对连接器的绑定端口的变量进行写入操作。编译器在这些消息前面加上 `[ERROR]`。

::: tip 提示

当使用 `--Werr` 选项时，编译器可以将*警告*视为*错误*并停止编译（非常类似于常规 C/C + + 编译器关于 `-Werr `的行为）。

```shell
$ apt-get install openjdk-6-jre
```

:::

具有致命（fatal）错误的示例输出。*根*声明引用了一个编译器找不到的类型:

```shell
$ bipc.sh -p ASamplePackage -d "ThisTypeDoesNotExists()" -I .
[SEVERE] Type not found : ThisTypeDoesNotExists
```

带有警告的示例输出。根据守卫条件的不同，从同一个状态可能有多个内部变迁：

```shell
$ bipc.sh -p ASamplePackage -d "SomeCompoundType()" -I .
[WARNING] In ASamplePackage.bip:
Transition from this state triggered by the same port (or internal) already exists :
    19:   on tic from S1 to S3 do { c = c + 1; tosend = tosend + 1; start = 1;}
    20:   internal from S3 to S2 provided (c <= 10)
----------^
    21:   internal from S3 to S1 provided ( c > 10)
    22:   on toc from S2 to S1 provided (c < 10)
```

运行编译器时，至少需要提供以下参数:

* 要编译的包名。`-p` 选项后接包名。包名称必须与包含它的文件名匹配（如，包 *Sample* 必须存储在一个名为 `Sample.bip` 的文件中）
* 一个或多个包搜索目录列表。编译器使用此目录列表查找要编译的包（以及由于依赖关系而需要的其他潜在包）。`-l` 选项后接一个目录路径，多次使用该参数可以使用多个目录，编译器在搜索时将使用第一个正确匹配（所以其顺序很重要）。

仅通过使用这两个参数，编译器将加载包中包含的类型(及其依赖项)并检查它们的有效性。默认情况下不会产生任何东西。

您还可以通过使用加载包中的类型为编译器提供组件声明来创建实例模型和类型模型:

* `-d` 后面跟一个声明(例如 `-d ACompound(1,2)`)。请注意，可能需要用`“ ”`来包裹声明，以防止声明被 shell 解释。

编译器执行示例：

```shell
$ bipc.sh -p SamplePackage -I /home/a_user/my_bip_lib/ -d "MyType()"
```

### 消除警告

某些警告可以被静默。当您 100% 确定在您的特定情况下警告不是问题时，这是非常有用的。绝不能因为不了解警告出现的原因而忽视它！

要禁止显示警告，您需要在触发警告的元素上附加一个“@SuppressPolice‘’注释以及注明要禁止显示的警告类型。例如，在一个Petri 网中可能存在非确定性的情况下:

```
on work from a to a provided (x == 1) do { Max = 0; }
on work from a to a provided (x > 1)  do { Max = 0; }
```

编译器将输出

```
[WARNING] In bla.bip:
 Transition from this state triggered by the same port (or internal) already exists :
    108:
    109:  on work from a to a provided (x == 1) do { Max = 0; }
 ---------^
    110:  on work from a to a provided (x > 1)  do { Max = 0; }
    111:
```

您可以通过添加注释来消除此警告:

```
@SuppressWarning(nondeterminism)
on work from a to a provided (x == 1) do { Max = 0; }
@SuppressWarning(nondeterminism)
on work from a to a provided (x > 1)  do { Max = 0; }
```

可被消除的警告如下：

- nondeterminism
- unboundcomponentport
- unboundconnectorport
- missingup
- atomprioritycycle
- compoundprioritycycle
- uselessdown
- nointeraction
- missinginteraction
- modifiedvariabletransition
- modifiedvariableinteraction

### 使用包的提示

名为 `a.b.c.D` 的包必须存储在目录层次结构 `a/b/c/D.bip` 中，其他任何情况都不适用。如果希望使用位于当前工作目录之外的包，则必须使用“’`-I`”参数来添加包含它们的目录，如：

* 您正在路径 `/somewhere/myApp` 下开发一个名为 `Foo` 的包
* 您希望使用位于 `/a/bip/itory` 目录中的包 `my.other.package.Bar`

下面是要使用的目录树结构和相应的编译器命令:

```
.
|-- a
|   `-- bip
|       `-- repository
|           `-- my
|               `-- other
|                   `-- package
|                       `-- Bar.bip
`-- somewhere
    `-- myApp
        `-- Foo.bip

somewhere/myApp $ bipc.sh -p Foo -I /a/bip/repository
```

## 使用中间层（也称为过滤器）

过滤器负责模型到模型的转换。过滤器具有相同的输入和输出类型: 即BIP 模型(类型或实例模型)。过滤器的常见用例有:

* 展平：通过展开复合组件和连接器来消除层次；
* 死代码优化：通过移除不会被使用的代码修改 Petri 网；
* 注解：将注解中被其他过滤器或后端使用的额外信息附加到模型元素上。

过滤器可以单独使用，也可以构建过滤器链。链使用简单的语法指定：

```
filter1_name foo=bar foo2=bar2 ! filter2_name bla=bar
```

这将链接 `filter1_name` 和 `filter2_name`。每个过滤器将使用其对应的 ` key = value` 键值对列表进行配置。

链的定义可以使用 `-f` (或 `--filter` )从命令行直接给出:

```
bipc.sh -f "filter1_name foo=bar foo2=bar2 ! filter2_name bla=bar"
```

::: tip 重要

不要忘记使用 `'` 或者 `''` 包裹链的定义，因为 shell 大概率会解释 `!` 字符，导致不合预期的行为发生。

:::

链的定义可以使用 `--filter-file` 从一个文件中读出。这在当链非常复杂时十分有用，因为处理非常长的命令行是十分乏味的——您只需要在文本文件中编写链。为了提高可读性，您可以每行只写一个过滤器，因为换行符可被忽略:

```
filter1_name foo=bar foo2=bar2 !
filter2_name bla=bar !
filter3_name some_very_complex_arg=something_very_very_long
```

然后把这个文件交给编译器:

```
bipc.sh --filter-file filters.txt ...
```

## 使用后端（代码生成器）

### 一般原则

后端(也称为代码生成器)定义了一组特定的参数，通常，使用其中之一将启用相应的后端。例如，对于 C++ 后端，您可以看到以下命令行参数（see [*More about C++ code generator*](https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/cpp-backend.html#cpp-backend-label)）

```
--gencpp-cc-I                           Add a path to the include search path
                                          (used when calling the C++ compiler)
--gencpp-cc-extra-src                   Add an extra source file to the
                                          compilation list
--gencpp-follow-used-packages           Also generate code for used packages.
--gencpp-ld-L                           Add a path to the libraries search
                                          path (used when calling the linker)
--gencpp-ld-extra-obj                   Add an extra object file to be linked
                                          with the other parts
--gencpp-ld-l                           Link with this library (use several
                                          times to add many libraries)
--gencpp-no-serial                      Disable the generation of
                                          serialization code
--gencpp-output-dir                     Output directory for CPP backend
--gencpp-optim                          Set the optimization level (defaults
                                        to none = 0). Each level includes a
                                        set of optimization.
--gencpp-set-optim-param                Set an optimisation parameter:
                                        optimname:key:value
--gencpp-disable-optim                  Disable a specific optimization (can
                                        be used several times)
--gencpp-enable-optim                   Enable a specific optimization (can be
                                        used several times)
--gencpp-enable-bip-debug               Generates extra code to enable GDB to
                                        debug at the BIP level
```

在这些参数上使用任意参数调用编译器将启用 C++ 后端。

您可以同时使用多个后端，这没有任何问题，因为后端之间是独立的。例如，为了在单个编译器运行中同时生成 C + + 和 Aseba 源代码，可以使用以下命令:

```
$ bipc.sh -p SamplePackage -I /home/a_user/my_bip_lib/ -d "MyType()" \
  --gencpp-output-dir cpp-output --genaesl-output-dir aseba-output
```

### BIP后端

BIP 后端也可以用来生成 BIP 源代码，它的使用非常简单，只需要使用下列两个参数:

* `--genbip-output-dir` ：指定输出目录
* `--genbip-follow-used-packages` ：启用分层生成。默认情况下，只有正在被编译的包才会生成回 BIP 源代码。当这个参数存在时，包的依赖项也产生 BIP 源代码。

如果中间层没有执行任何转换，那么这个后端应该生成与参加编译的源代码等价的源代码(很可能发生一些代码的重新编译和重新排序) :

::: tip 重要

此后端仅支持类型模型编译。它不会使用编译器可能产生的实例模型(前提是如果使用了 `-d` 参数)。

:::

### C++后端

一个简单的例子如下：编译包 `SomePackage` 并使用 `RootDefinition` 组件的一个实例创建可执行文件。

```
$ bipc --gencpp-output build -p SomePackage -d 'RootDefinition()'
```

这个命令将生成几个文件，主要是 C++ 源代码。得到的代码不能够被编译，因为它需要一些来自标准引擎的胶水代码（glue code）的支持。参阅 [*More about C++ code generator*](https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/cpp-backend.html#cpp-backend-label) 获取更多后端的细节。
