> 原文 [Tutorial](https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/tutorial.html)

# 教程

下面将通过简单的示例展示如何使用 BIP。第一部分介绍了 BIP 的常用模式。第二部分通过示例更精确地展示了如何通过引用引擎将 BIP 代码与外部的 C++ 代码连接起来。

::: tip 重要

本章中的所有例子都可以在 [http://www-verimag.imag.fr/TOOLS/DCS/bip/examples.tar.gz](http://www-verimag.imag.fr/TOOLS/DCS/bip/examples.tar.gz). 中找到。每个示例都包含一个 `build.sh` 脚本可用于编译该示例。 `build_all.sh`  脚本用于编译所有示例。

:::

## Hello world

此示例将作为后续所有示例的起点。在名为 `HelloPackage.bip` 的文件中，BIP 代码如下：

```
package HelloPackage
  port type HelloPort_t()

  atom type HelloAtom()
    port HelloPort_t p()
    place START,END
    initial to START
    on p from START to END
  end

  compound type HelloCompound()
    component HelloAtom c1()
  end
end
```

包 $HelloPackage$ 内包含了 3 种类型：

* 1个端口类型 $HelloPort\_t$ ，该端口类型没有参数；
* 1个原子组件类型 $HelloAtom$，内含： 
  * 1个类型为 $HelloPort\_t$ 的内部端口声明 $p$ ；
  * 2个库所：$START$  和  $END$ ，其中 $START$ 是起始库所；
  * 1个由端口  $p$ 标记的变迁，从 $START$ 迁移到 $END$；
* 1个复合组件类型 $HelloCompound$ ，内含:
  * 1个类型为 $HelloAtom$ 的组件声明 $c1$ 。

上述代码的预期行为是：一个以类型为 $HelloCompound$ 组件作为*根*（*root*）的系统，它在原子组件 $c1$ 唯一的变迁（该变迁被端口 $p$ 标记）触发后陷入死锁状态。

对于这个示例，我们使用了 C++ 后端和对应的引用引擎进行编译以展示这个模型的执行流程。但是这非强制性的（但是在撰写本文时，C++ 工具链是当前 BIP 的唯一选项）。

使用以下命令编译以上 BIP 代码，生成的 C++ 代码将被编译并链接到引用引擎:

```shell
$ mkdir output
$ bipc.sh -I . -p HelloPackage -d "HelloCompound()"\
  --gencpp-output output
$ mkdir output/build
$ cd output/build
$ cmake ..
[...]
$ make
[...]
```

最后，运行编译产生的可执行文件 $system$：

```
$ ./system
...
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 1 internal port:
[BIP ENGINE]:   [0] ROOT.c1._iport_decl__p
[BIP ENGINE]:  -> choose [0] ROOT.c1._iport_decl__p
[BIP ENGINE]: state #1: deadlock!
```

在触发唯一的变迁之后，系统将如预期的那样进入死锁状态。

## 使用 BIP2 中的交互实现组件之间的同步

### 多个组件之间的交汇

接下来通过修改 *[Hello world](#hello-world)* 的示例，得到三个原子类型 $HelloAtom$ 的实例。我们强制使它们的变迁同步（即*交汇*，*rendez-vous*）:

``` {20}
@cpp(include="stdio.h")
package HelloPackage
  extern function printf(string, int)

  port type HelloPort_t()

  atom type HelloAtom(int id)
    export port HelloPort_t p()
    place START,END
    initial to START
    on p from START to END do {printf("Hello World from %d\n", id);}
  end

  connector type ThreeRendezVous(HelloPort_t p1, HelloPort_t p2, HelloPort_t p3)
    define p1 p2 p3
  end

  compound type HelloCompound()
    component HelloAtom c1(1), c2(2), c3(3)
    connector ThreeRendezVous connect(c1.p, c2.p, c3.p)
  end
end
```

稍后将解释注解（annotation） `@cpp` ，这里使用这个注解的目的是允许我们使用 C 标准库中的 `printf()` 函数。在这个例子中，我们新加入了一个连接器类型 $ThreeRendezVous$，它包含了三个类型为 $HelloPort\_t$ 端口参数，准确地定义了一个使三个端口的同步的交互。

使用以下命令编译并链接到引用引擎，生成 C++ 代码:

```shell
$ bipc.sh -I . -p HelloPackage -d "HelloCompound()"\
  --gencpp-output output
$ mkdir output/build
$ cd output/build
$ cmake ..
[...]
$ make
[...]
```

在运行产出的可执行文件时，**可以看到这三个原子组件的变迁同时被触发**。三个原子组件的执行顺序任意排列，例如:

```
...
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 1 interaction:
[BIP ENGINE]:   [0] ROOT.connect: ROOT.c1.p() ROOT.c2.p() ROOT.c3.p()
[BIP ENGINE]: -> choose [0] ROOT.connect: ROOT.c1.p() ROOT.c2.p() ROOT.c3.p()
Hello World from 1
Hello World from 2
Hello World from 3
[BIP ENGINE]: state #1: deadlock!
```

### 将数据广播到多个组件

考虑一个示例，它包括一个作为*发送器*的组件（the *sender*）和另外三个作为*接收器*的组件（the *receivers*）。发送器组件将一个作为其标识符的整数变量广播到另外三个接收器组件。相应的 BIP2 代码如下:

```{29,33,34}
@cpp(include="stdio.h")
package HelloPackage
  extern function printf(string, int)
  extern function printf(string, int, int)

  port type HelloPort_t(int d)

  atom type HelloSender(int id)
    data int myd
    export port HelloPort_t p(myd)

    place START, END

    initial to START do { myd = id; }

    on p from START to END
      do { printf("I'm %d, sending Hello World....\n", myd); }
  end

  atom type HelloReceiver(int id)
    data int myd
    export port HelloPort_t p(myd)

    place START,END

    initial to START

    on p from START to END
      provided (id == 1 || id == 3)
      do { printf("I'm %d, Hello World received from %d\n", id, myd); }
  end

  connector type OneToThree(HelloPort_t s, HelloPort_t r1, HelloPort_t r2, HelloPort_t r3)
    define s' r1 r2 r3

    on s r1 r2 r3 down { r1.d = s.d; r2.d = s.d; r3.d = s.d; }
    on s r1 r2    down { r1.d = s.d; r2.d = s.d;             }
    on s r1    r3 down { r1.d = s.d;             r3.d = s.d; }
    on s    r2 r3 down {             r2.d = s.d; r3.d = s.d; }
    on s r1       down { r1.d = s.d;                         }
    on s    r2    down {             r2.d = s.d;             }
    on s       r3 down {                         r3.d = s.d; }
  end

  compound type HelloCompound()
    component HelloSender s(0)
    component HelloReceiver r1(1), r2(2), r3(3)
    connector OneToThree brd(s.p, r1.p, r2.p, r3.p)
  end
end
```

在连接器类型 $OneToThree$ 中，与发送器对应的端口 $s$ 是一个触发器（添加了 $'$ 标记），也就是说，它可以单独执行，而无需与其他组件同步。因为其他端口是同步的，所以 $OneToThree$ 定义了以下交互：$s$、 $s,r1$、 $s,r2$、 $s,r3$、 $s,r1,r2$、 $s,r1,r3$、 $s,r2,r3$ 和 $s,r1,r2,r3$.

为了实现从端口 $s$ 广播数据，我们使用 $on$ 语句列表，它为所有至少涉及一个接收器的交互提供 $down$ 代码块。注意，即使交互 $s$（只有一个 $s$ 端口，没有接收器） 没有包含在这个列表中，它仍然被认为是一个可能的交互，但是当 $s$ 单独执行时不会发生数据传输。

由于接收器中由 $p$ 标记的变迁存在守卫条件的约束，初始变迁执行之后，使能的交互如下：$s$、$s,r1$、 $s,r3$ 和 $s,r1,r3$ （$r2$ 传入的值为2，不满足约束）。又因为在 [优先级](/bip2_language.html#优先级) 中解释的最大进度（BIP2 中默认的优先级规则）的应用，导致了选取了最大交互 $s,r1,r3$  执行。

```
...
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 1 interaction:
[BIP ENGINE]:   [0] ROOT.brd: ROOT.s.p({d}=0;) ROOT.r1.p({d}=0;) ROOT.r3.p({d}=0;)
[BIP ENGINE]: -> choose [0] ROOT.brd: ROOT.s.p({d}=0;) ROOT.r1.p({d}=0;) ROOT.r3.p({d}=0;)
I'm 0, sending Hello World....
I'm 1, Hello World received from 0
I'm 3, Hello World received from 0
[BIP ENGINE]: state #1: deadlock!
```

<div align=center> <img alt="tutorial-hierarchical-connector.png"
                        src="https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/_images/tutorial-hierarchical-connector.png"/> </div>使用单个连接器(左)或分层连接器(右)从 s 广播。

我们可以使用分层连接器获得与上面等效的行为。在这个例子中，所有接收器被类型为 $SyncReceivers$ 的连接器 $sync$ 进行同步。 $sync$ 允许接收器的任意子集来参与到广播中。分层连接器在 $sync$ 之上构建，为此，我们在发送器和导出的 $sync$ 端口之间添加广播。在下面提供的代码块中，我们省略了 $HelloPort\_t$、 $HelloSender$ 和 $HelloReceiver$ 类型的定义，因为它们与前面的示例相同。

```{7,27}
@cpp(include="stdio.h")
package HelloPackage
  // [...] definitions of HelloPort_t, HelloSender and HelloReceiver

  connector type SyncRecvs(HelloPort_t r1, HelloPort_t r2, HelloPort_t r3)
    data int d
    export port HelloPort_t ep(d)
    define r1' r2' r3'

    on r1 r2 r3 down { r1.d = d; r2.d = d; r3.d = d; }
    on r1 r2    down { r1.d = d; r2.d = d;           }
    on r1    r3 down { r1.d = d;           r3.d = d; }
    on    r2 r3 down {           r2.d = d; r3.d = d; }
    on r1       down { r1.d = d;                     }
    on    r2    down {           r2.d = d;           }
    on       r3 down {                     r3.d = d; }
  end

  connector type OneToOne(HelloPort_t s, HelloPort_t c)
    define s' c
    on s c down { c.d = s.d; }
  end

  compound type HelloCompound()
    component HelloSender s(0)
    component HelloReceiver r1(1), r2(2), r3(3)
    connector SyncRecvs sync(r1.p, r2.p, r3.p)
    connector OneToOne brd(s.p, sync.ep)
  end
end
```

由 $brd$ 和 $sync$ 组成的分层连接器中的涉及的交互的计算如下。首先，计算出所有因 $sync$ 使能的交互，即 $r1$、$r3$, 和 $r1,r3$。然后，根据前述结果计算因 $brd$ 使能的交互，包括：$s$、 $s,r1$、 $s,r3$ 和 $s,r1,r3$。最后将优先级策略（即最大进度）应用于因 $brd$ 使能的交互，将导致以下执行轨迹：

```
...
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 1 interaction:
[BIP ENGINE]:   [0] ROOT.brd: ROOT.s.p({d}=0;) ROOT.sync.ep({d}=135026452;)
[BIP ENGINE]: -> choose [0] ROOT.brd: ROOT.s.p({d}=0;) ROOT.sync.ep({d}=135026452;)
I'm 0, sending Hello World....
I'm 1, Hello World received from 0
I'm 3, Hello World received from 0
[BIP ENGINE]: state #1: deadlock!
```

### 使用复合组件包装组件

假设我们希望将前面示例中的 3 个接收器包装成一个单独的复合组件，同时保持相同的全局行为。我们只需构建一个复合组件，其中包括三个接收器和同步它们的连接器，并在接口处导出连接器端口:

```{6,15}
@cpp(include="stdio.h")
package HelloPackage
  // [...] definitions of HelloPort_t, HelloSender, HelloReceiver,
  // SyncReceivers and OneToOne

  compound type RecvsCompound()
    component HelloReceiver c1(1), c2(2), c3(3)
    connector SyncRecvs sync(c1.p, c2.p, c3.p)

    export port sync.ep as p
  end

  compound type HelloCompound()
    component HelloSender s(0)
    component RecvsCompound rcvrs()

    connector OneToOne brd(s.p, rcvrs.p)
  end
end
```

在这种情况下，我们得到一个等价的执行序列，即:

```{5}
...
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 1 interaction:
[BIP ENGINE]:   [0] ROOT.brd: ROOT.s.p({d}=0;) ROOT.rcvrs.p({d}=135034644;)
[BIP ENGINE]: -> choose [0] ROOT.brd: ROOT.s.p({d}=0;) ROOT.rcvrs.p({d}=135034644;)
I'm 0, sending Hello World....
I'm 1, Hello World received from 0
I'm 3, Hello World received from 0
[BIP ENGINE]: state #1: deadlock!
```

<div align=center> <img alt="tutorial-compound.png"
                        src="https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/_images/tutorial-compound.png"/> </div>HelloCompound 实例的结构。

请注意，在上面的示例中，因为优先级会应用于导出的复合组件端口，故只有 $sync$ 的最大交互可以从 $brd$ 中访问到。这样获得的行为与使用分层连接器而不将接收器封装在复合组件中时所获得的行为一致，但一般情况下并非如此，原因如下所述：

::: tip 重要

如果在连接器中定义了守卫条件，那么在把组件和连接器的子集封装到复合组件中时获得的行为可能不同于原始模型中的行为。这是因为当连接器的端口在复合组件的接口处导出时，优先级会应用于连接器的一组交互，也就是说，从复合组件的端口只能对最大交互可见。

:::

这个执行序列还显示了一个关于数据处理的有趣之处。一开始（上个代码片段第5行）我们可以看到:

```
ROOT.rcvrs.p({d}=135038644;)
```

值 $135038644$ 表示相应的数据从未初始化。事实上，编译器应该给出几个类似这样的警告:

```
[WARNING] In path/to/HelloPackage.bip:
'up' maybe missing: data associated with exported port won't be "fresh" :
    34:
    35:     on r1 r2 r3 down { r1.d = d; r2.d = d; r3.d = d; }
------------^
    36:     on r1 r2    down { r1.d = d; r2.d = d;           }
    37:     on r1    r3 down { r1.d = d;           r3.d = d; }
```

请注意，这只是一个警告而不一定是一个错误。在本例中，即使是导出了带有数据的端口，也可以完全有效地省略 `up{}` 代码块。只要绑定到导出端口的实体在 `up{}`期间没有读取端口的数据就没有问题。引擎仍然显示数据的值，该值没有有意义的内容。

::: tip 提示

与几乎所有编程语言一样，您应该避免使用未初始化的值：这种做法非常容易出错，并且经常导致很难检测到错误。

:::

## BIP2的层次体系

### 分层连接器

下面的示例展示了分层连接器的一些有趣之处。此例子由原子组件 $A1$, $A2$, ..., $A8$ 组成，它们只在处于*活跃*（*active*）状态时才会执行，在这里活跃状态指的是它们的内部的整型变量 $active$ 等于 $1$ 时 。这些原子组件初始时都是活跃的。

<div align=center> <img alt="tutorial-advanced-interactions.png"
                        src="https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/_images/tutorial-advanced-interactions.png"/> </div> 模型的结构：8个原子组件，4个连接器层级（连接器类型的名称 Plus 没有在图中展示）

我们考虑四层连接器。第一层用 $Plus$ 型的连接器实例 $plus_{12}$，$plus_{34}$，$plus_{56}$，$plus_{78}$ 将原子组件两两连接起来。连接器 $plus_{ij}$ 连接了原子组件 $A_{i}$ 和 $A_{j}$ 的端口 $p$，同时定义了交互 $A_{i}.p$、$A_{j}.p$ 和 $A_{i}.p,A_{j}.p$ ，并通过端口 $ep$  导出输出参与交互的原子组件的数目。

第二层连接器将第一层的连接器两两连接起来，也就是说，$plus_{1234}$连接了连接器 $plus_{12}$ 和 $plus_{34}$，$plus_{5678}$连接了连接器 $plus_{56}$ 和 $plus_{78}$。又因为 $plus_{1234}$（同样地对于$plus_{5678}$）的连接器类型也是 $Plus$，所以其端口 $ep$  也可以导出输出参与交互的原子组件的数目。

第三层连接器包含了一个类型为 $Plus$ 的连接器 $plus_{12345678}$，它连接起了之前层级的连接器（即 $plus_{1234}$ 和 $plus_{5678}$），同时导出输出参与交互的原子组件的数目。

最后一层是类型为 $Filter$ 的连接器 $filter$ ，连接了之前层级连接器（即$plus_{12345678}$）的导出端口。该连接器使用了守卫条件，只有当通过 $plus_{12345678}$ 的端口 $ep$ 得到的值小于或等于 $4$ 时才会执行，同时当 $plus_{12345678}.ep$ 执行时把该值设置为 0。

```
@cpp(include="stdio.h")
package HelloPackage
  extern function printf(string, int, int)

  port type HelloPort_t(int d)

  atom type HelloAtom(int id)
    data int active
    export port HelloPort_t p(active)

    place LOOP

    initial to LOOP
      do { active = 1; }

    on p from LOOP to LOOP
      provided (active == 1)
      do { printf("I'm %d, active=%d\n", id, active); }
  end

  connector type Plus(HelloPort_t r1, HelloPort_t r2)
    data int number_of_active
    export port HelloPort_t ep(number_of_active)
    define r1' r2'

    on r1 r2
      up { number_of_active = r1.d + r2.d; }
      down {
        r1.d = number_of_active;
        r2.d = number_of_active;
      }

    on r1
      up { number_of_active = r1.d; }
      down { r1.d = number_of_active; }

    on r2
      up { number_of_active = r2.d; }
      down { r2.d = number_of_active; }
  end

  connector type Filter(HelloPort_t r)
    define r

    on r provided (r.d <= 4) down { r.d = 0; }
  end

  compound type HelloCompound()
    component HelloAtom A1(1), A2(2), A3(3), A4(4), A5(5), A6(6), A7(7), A8(8)

    connector Plus plus12(A1.p, A2.p)
    connector Plus plus34(A3.p, A4.p)
    connector Plus plus56(A5.p, A6.p)
    connector Plus plus78(A7.p, A8.p)

    connector Plus plus1234(plus12.ep, plus34.ep)
    connector Plus plus5678(plus56.ep, plus78.ep)

    connector Plus plus12345678(plus1234.ep, plus5678.ep)

    connector Filter filter(plus12345678.ep)
  end
end
```

 $HelloCompound$ 实例的行为如下。连接器的第一层支持的交互包括 $A_{1}.p$ 、$A_{2}.p$ 、...、$A_{8}.p$ 、$A_{1}.p,A_{2}.p$ 、$A_{3}.p,A_{4}.p$ 、$A_{5}.p,A_{6}.p$ 和 $A_{7}.p,A_{8}.p$ 。这些交互都对相应连接器的导出端口可见。

第二层允许:

* 由连接器 $plus_{1234}$ 导致的交互 $A_1.p$，$A_2.p$，$A_1.p,A_2.p$ 的任意组合，以及交互 $A_3.p$，$A_4.p$，$A_3.p,A_4.p$ 的任意组合。以及：
* 由连接器 $plus_{5678}$ 导致的交互 $A_5.p$，$A_6.p$，$A_5.p,A_6.p$ 的任意组合，以及交互 $A_7.p$，$A_8.p$，$A_7.p,A_8.p$ 的任意组合。

也就是说，第二层允许原子组件  $A_1.p$ ，...， $A_4.p$ 的某个子集的任意交互，同样也允许原子组件  $A_5.p$ ，...， $A_8.p$ 的某个子集的任意交互。类似地，第三层连接器（例如 $plus_{12345678}$）允许高度原子子集（所有底层的原子组件的子集）之间的任何交互，这对应了从 $plus_{12345678}$ 端口可见的共计 255 个交互。在图中，我们为连接器的每个导出端口提供了相应数量的已使能交互。注意，通过此端口向外提供给交互的值对应了此交互中涉及的原子组件数目。

由于在 $filter$ 定义了守卫条件，最后一层连接器交互的使能条件为，涉及的原子组件的交互的数目少于或等于4个。通过 $filter$  可实现的交互数是162 = 70 + 56 + 28 + 8，其中70是涉及4个原子组件的交互数，56是涉及3个原子组件的交互数，28是涉及两个原子组件的交互数，8是仅涉及一个原子组件的交互数。

将最大进度优先级规则应用于 $filter$ 的所有可能交互，这导致了最大交互的数目只会是 70 个，对应于四个原子组件的交互情况。一旦选择了其中一个交互，连接器 $filter$ 的 $down$ 函数就会将与 $plus_{12345678}$ 端口 $ep$ 相关联的整数值设置为 $0$。该值通过 $Plus$ 类型的连接器的 $down$ 函数递归地传播到所有涉及到的原子组件的 $active$ 变量中，从而使这些原子组件在之后的执行过程中禁用它们相应的变迁。因此，在模型的下一个状态中只有**一个**最大的交互，这个交互涉及到前一个交互的执行中没有参与的四个原子组件。这个状态下执行该模型将导致死锁，因为此时所有原子组件都是*非活跃的*（*inactive*，即 $active = = 1$对于所有原子组件都是 false）。

下面提供了一个执行示例。例子中先执行 $A_1.p,A_5.p,A_7.p,A_8.p$，然后是 $A_2.p,A_3.p,A_4.p,A_6.p$。请注意，当原子组件执行其变迁时，即使在执行之前它的值为$1$，$active$ 的值也是 $0$。这种情况的原因是在 BIP2 中，原子组件的守卫条件在它们的稳定状态下进行测试，也就是说，守卫条件的测试发生在同步之前。交互的执行可能导致由于 $down$ 函数触发而引发的原子组件中的变量修改。

```
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 70 interactions:
[BIP ENGINE]:   [0] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [1] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [2] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [3] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [4] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [5] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [6] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [7] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [8] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [9] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [10] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [11] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [12] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [13] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [14] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [15] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [16] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [17] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [18] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [19] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [20] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [21] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [22] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [23] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [24] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [25] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [26] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [27] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [28] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [29] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [30] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [31] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [32] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [33] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [34] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [35] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [36] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [37] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [38] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [39] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [40] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [41] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [42] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [43] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [44] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [45] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [46] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [47] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [48] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [49] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [50] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [51] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [52] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [53] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [54] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [55] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [56] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [57] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [58] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [59] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [60] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [61] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [62] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [63] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [64] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [65] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [66] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [67] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [68] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]:   [69] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]: -> choose [21] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
I'm 1, active=0
I'm 5, active=0
I'm 7, active=0
I'm 8, active=0
[BIP ENGINE]: state #1: 1 interaction:
[BIP ENGINE]:   [0] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
[BIP ENGINE]: -> choose [0] ROOT.filter: ROOT.plus12345678.ep({d}=4;)
I'm 2, active=0
I'm 3, active=0
I'm 4, active=0
I'm 6, active=0
[BIP ENGINE]: state #2: deadlock!
```

请注意，优先级（这里只有默认的最大进度优先级策略）在全局范围内应用于由四层连接器定义的层次连接器。第一层、第二层和第三层的连接器的使能交互都被考虑在内，但各个层级自身（即局部地）没有应用最大进度。如果最大进度优先级被局部应用在各个层次上，那么最终的行为会完全不同：在这种情况下，第三层只允许包含所有原子组件的相互作用发生，并且由于 `filter` 的守卫条件而最终导致死锁。

如果通过使用复合组件来构建系统来重新实现上述示例，就会发生这种情况，如下所示。

### 分层组件

下面的示例是上一节示例的变体。我们使用复合组件的层次结构替代连接器的层次结构，但是原理是一样的。

<div align=center> <img alt="tutorial-advanced-interactions-compounds.png"
                        src="https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/_images/tutorial-advanced-interactions-compounds.png"/> </div> 模型的结构：8个原子组件，4个连接器层级（连接器类型的名称 Plus 没有在图中展示）

用复合组件构建如下（代码中没有显示 $Plus$ 类型的连接器的名称）

```
@cpp(include="stdio.h")
package HelloPackage
  extern function printf(string, int, int)

  port type HelloPort_t(int d)

  atom type HelloAtom(int id)
    data int active
    export port HelloPort_t p(active)

    place LOOP

    initial to LOOP
      do { active = 1; }

    on p from LOOP to LOOP
      provided (active == 1)
      do { printf("I'm %d, active=%d\n", id, active); }
  end

  connector type Plus(HelloPort_t r1, HelloPort_t r2)
    data int number_of_active
    export port HelloPort_t ep(number_of_active)
    define r1' r2'

    on r1 r2
      up { number_of_active = r1.d + r2.d; }
      down { r1.d = number_of_active; r2.d = number_of_active; }

    on r1
      up { number_of_active = r1.d; }
      down { r1.d = number_of_active; }

    on r2
      up { number_of_active = r2.d; }
      down { r2.d = number_of_active; }
  end

  connector type Filter(HelloPort_t r)
    define r
    on r provided (r.d <= 4) down { r.d = 0; }
  end

  compound type Layer1(int first)
    component HelloAtom A(first), B(first + 1)

    connector Plus plus12(A.p, B.p)
    export port plus12.ep as ep
  end

  compound type Layer2(int first)
    component Layer1 L11(first), L12(first + 2)

    connector Plus plus12(L11.ep, L12.ep)
    export port plus12.ep as ep
  end

  compound type Layer3()
    component Layer2 L21(1), L22(5)

    connector Plus plus12(L21.ep, L22.ep)
    export port plus12.ep as ep
  end

  compound type HelloCompound()
    component Layer3 A12345678()

    connector Filter filter(A12345678.ep)
  end
end
```

我们在图中为每个复合组件的导出端口提供了相应数量的使能交互。当执行 $HelloCompound$ 类型的一个实例时，将获得以下执行序列:

```
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: deadlock!
```

## Petri网

BIP2 语言的大多数用例都考虑使用原子组件中的自动机进行表示。在 BIP2中，也可以使用 *1-safe* Petri 网（参见 [Petri网 ](/bip2_language.html#Petri网)）。

下面的 BIP2 代码是一个示例，其中原子组件的行为是一个*1-safe* Petri 网，表示两个进程对一个共享资源的并发访问。

第一个（第二个）进程的状态由库所 $GET1$、 $USE1$、 $SYNC1$（对应于第二个的 $GET2$、 $USE2$、 $SYNC2$）表示。资源的状态由库所 $RESOURCE$ 表示——每当资源是空闲的时候就标记为此状态。

变迁代表了这个三个参与方组成的系统中的动作。$get1\_res$ (对应于第二个的 $get2\_res$) 使第一个进程请求该共享资源并使用（进入库所 $USE1$ 和 $USE2$），$free1\_res$ (对应于第二个的 $free2\_res$) 使第一个进程释放其拥有的资源。$sync$ 同步两个进程，并使它们重置到其初始状态（$GET1$ 和 $GET2$）。

```
@cpp(include="stdio.h")
package HelloPetriNet
  extern function printf(string)

  port type Port()

  atom type HelloAtom()
    port Port get1_res(), get2_res(), free1_res(), free2_res(), sync()

    place GET1, GET2, RESOURCE, USE1, USE2, SYNC1, SYNC2

    initial to GET1, GET2, RESOURCE

    on get1_res from GET1, RESOURCE to USE1
      do { printf("1: get resource\n"); }

    on get2_res from GET2, RESOURCE to USE2
      do { printf("2: get resource\n"); }

    on free1_res from USE1 to SYNC1, RESOURCE
      do { printf("1: free resource\n"); }

    on free2_res from USE2 to SYNC2, RESOURCE
      do { printf("2: free resource\n"); }

    on sync from SYNC1, SYNC2 to GET1, GET2
      do { printf("1 & 2: synchronize\n"); }
  end

  compound type HelloCompound()
    component HelloAtom A()
  end
end
```

最初，两个进程都可能获得资源，因为初始时状态标记为 $GET1$、 $GET2$、 $RESOURCE$ 。两个进程中的将一个获取资源，会导致原子组件的 $RESOURCE$ 库所会被取消标记。这样可确保两个进程使用资源的互斥：在这种状态下，另一个进程无法获取资源。一旦资源被某个进程释放，它将在 $SYNC1$ 或 $SYNC2$ 处被阻塞，而允许另一个进程获取、使用和释放资源。当两个进程都在 $SYNC1$ 和 $SYNC2$ 的状态上时，此时支持 $sync$ 端口标记的变迁，回到初始状态。下面提供了一个执行示例。注意，我们使用了引擎的静默执行模式（`--slient` 选项）来删除调试信息。

```
$ ./system --silent
1: get resource
1: free resource
2: get resource
2: free resource
1 & 2: synchronize
1: get resource
1: free resource
2: get resource
2: free resource
1 & 2: synchronize
2: get resource
2: free resource
1: get resource
1: free resource
1 & 2: synchronize
...
```

## 优先级

### 原子组件中的优先级

下面这个的示例由单个原子组件组成，它在每个状态都可以执行（此处只设置一个状态作为示例）由内部端口 $p$ 或者 $q$ 标记的变迁中的一个。

```
package priorities_in_atom
  port type Port()

  atom type MyAtom()
    port Port p(), q()

    place LOOP

    initial to LOOP

    on p from LOOP to LOOP
    on q from LOOP to LOOP
  end

  compound type Model()
    component MyAtom a()
  end
end
```

通过编译 `Model` 组件类型的实例获得的（C++代码编译得到的）可执行文件的执行轨迹表明，它在每个状态下都可以在内部端口 $p$ 和 $q$ 之间选择执行。因此，该模型定义了无限数量的执行序列。在引擎的标准执行模式中，端口的选择是随机的。此示例的一个典型执行如下:

```
...
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 2 internal ports:
[BIP ENGINE]:   [0] ROOT.a._iport_decl__p
[BIP ENGINE]:   [1] ROOT.a._iport_decl__q
[BIP ENGINE]:  -> choose [0] ROOT.a._iport_decl__p
[BIP ENGINE]: state #1: 2 internal ports:
[BIP ENGINE]:   [0] ROOT.a._iport_decl__p
[BIP ENGINE]:   [1] ROOT.a._iport_decl__q
[BIP ENGINE]:  -> choose [1] ROOT.a._iport_decl__q
[BIP ENGINE]: state #2: 2 internal ports:
[BIP ENGINE]:   [0] ROOT.a._iport_decl__p
[BIP ENGINE]:   [1] ROOT.a._iport_decl__q
[BIP ENGINE]:  -> choose [0] ROOT.a._iport_decl__p
[BIP ENGINE]: state #3: 2 internal ports:
[BIP ENGINE]:   [0] ROOT.a._iport_decl__p
[BIP ENGINE]:   [1] ROOT.a._iport_decl__q
[BIP ENGINE]:  -> choose [0] ROOT.a._iport_decl__p
...
```

#### 使用优先级来抑制端口q的执行

可以通过在 $MyAtom$ 中增加优先级规则 $q < p$ 来修改上面示例，以阻止由 $q$ 标记的变迁的执行。也可以使用 $q < *$ 定义一个优先级规则，它指定了 $q$ 比任何其他端口的优先级都要低。

```{14}
package priorities_in_atom
  port type Port()

  atom type MyAtom()
    port Port p(), q()

    place LOOP

    initial to LOOP

    on p from LOOP to LOOP
    on q from LOOP to LOOP

    priority myPrio q < p
  end

  compound type Model()
    component MyAtom a()
  end
end
```

在这种情况下，模型只能执行与内部端口 p 对应的变迁。注意，在这种情况下，模型定义了一个执行序列，如下所示:

```
...
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 1 internal port:
[BIP ENGINE]:   [0] ROOT.a._iport_decl__p
[BIP ENGINE]:  -> choose [0] ROOT.a._iport_decl__p
[BIP ENGINE]: state #1: 1 internal port:
[BIP ENGINE]:   [0] ROOT.a._iport_decl__p
[BIP ENGINE]:  -> choose [0] ROOT.a._iport_decl__p
[BIP ENGINE]: state #2: 1 internal port:
[BIP ENGINE]:   [0] ROOT.a._iport_decl__p
[BIP ENGINE]:  -> choose [0] ROOT.a._iport_decl__p
[BIP ENGINE]: state #3: 1 internal port:
[BIP ENGINE]:   [0] ROOT.a._iport_decl__p
[BIP ENGINE]:  -> choose [0] ROOT.a._iport_decl__p
...
```

原子组件中的优先级关系定义了其内部端口的偏序关系。这种偏序关系是根据 $priority$ 声明所提供的规则计算出来的，是传递闭包适用于定义的优先级规则的结果。我们按如下方式修改前面的示例。我们添加一个内部端口 $r$，在执行期间不把标记为 $r$ 的变迁置为使能状态。这里不使用优先级规则 $q < p$，改用 $q < r$ 和 $r < p$。由于在应用优先级之前计算传递闭包，因此只能执行标记为 $p$ 的变迁，导致执行序列变迁与前面的示例相同(见上文)。注意即使 $r$ 标记的变迁没有使能，也可以从 $q < r$ 和 $r < p$ 规则自动推导出优先级规则 $q < p$。

```{21,22}
package priorities_in_atom
  port type Port()

  atom type MyAtom()
    data int i
    port Port p(), q(), r()

    place LOOP, NON_REACHABLE

    initial to LOOP
      do { i=0; }

    on p from LOOP to LOOP
      do { i=i+1; }

    on q from LOOP to LOOP
      do { i=i+1; }

    on r from NON_REACHABLE to NON_REACHABLE

    priority myPrio1 q < r
    priority myPrio2 r < p
  end

  compound type Model()
    component MyAtom a()
  end
end
```

注意，一组规则可能定义出一个循环关系。在前面的示例中，如果在 $MyAtom$ 增加一条优先级规则 `myPrio3 p < q`   ，会导致 BIP2 编译器引发以下错误:

```
[SEVERE] In /home/to/example/priorities_in_atom.bip:
Cycle found in priorities in Atom type :
    20:
    21:     priority myPrio1 q < r
------------^
    22:     priority myPrio2 r < p
    23:     priority myPrio3 p < q
```

BIP2 还允许使用包含变量的守卫条件来动态地定义优先级。在这种情况下，将在运行时检查是否出现循环。在下面的部分将介绍动态优先级的示例。

#### 使用优先级来强制以特定序列执行

我们还可以修改前面的示例来允许由端口 $p$ 和 $q$ 标记的变迁都可以执行，并且通过使用优先级来强制它们以特定的顺序执行。假设我们想要强制从 $p$ 开始 $p$ 和 $q$ 交替执行，为此，我们首先给原子组件添加一个表示其状态数的整数变量 $i$，它初始化为0，并在每次变迁执行时递增。状态变量为偶数时，我们给予 $p$ 更高的优先级；为奇数时，我们给予 $q $ 更高的优先级。

```{19,20}
package priorities_in_atom
  port type Port()

  atom type MyAtom()
    data int i
    port Port p(), q()

    place LOOP

    initial to LOOP
      do { i=0; }

    on p from LOOP to LOOP
      do { i=i+1; }

    on q from LOOP to LOOP
      do { i=i+1; }

    priority myPrioEven q < p provided ((i%2) == 0)
    priority myPrioOdd  p < q provided ((i%2) == 1)
  end

  compound type Model()
    component MyAtom a()
  end
end
```

注意，由于 $myPrioEven$ 和 $myPrioOdd$ 规则引入，编译器编译时检查会认为出现循环，可能会导致以下警告:

```
[WARNING] In /home/to/example/priorities_in_atom.bip:
Cycle found in priorities in Atom type :
    18:
    19:     priority myPrioEven q < p provided ((i%2) == 0)
------------^
    20:     priority myPrioOdd  p < q provided ((i%2) == 1)
    21:   end
```

这种循环只有当处于相同的原子组件状态时，即两个守卫条件 `((i% 2) = = 0)` 和 `((i% 2) = = 1)` 的计算结果都为 $true$ 时，才会发生，然而这种情况永远不会发生（否则将在运行时报告错误）。模型的执行符合预期，即 $p$ 和 $q$ 的交替执行。注意，在这种情况下，模型还定义了一个单一的执行序列，如下所示:

```
...
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 1 internal port:
[BIP ENGINE]:   [0] ROOT.a._iport_decl__p
[BIP ENGINE]:  -> choose [0] ROOT.a._iport_decl__p
[BIP ENGINE]: state #1: 1 internal port:
[BIP ENGINE]:   [0] ROOT.a._iport_decl__q
[BIP ENGINE]:  -> choose [0] ROOT.a._iport_decl__q
[BIP ENGINE]: state #2: 1 internal port:
[BIP ENGINE]:   [0] ROOT.a._iport_decl__p
[BIP ENGINE]:  -> choose [0] ROOT.a._iport_decl__p
[BIP ENGINE]: state #3: 1 internal port:
[BIP ENGINE]:   [0] ROOT.a._iport_decl__q
[BIP ENGINE]:  -> choose [0] ROOT.a._iport_decl__q
[BIP ENGINE]: state #4: 1 internal port:
[BIP ENGINE]:   [0] ROOT.a._iport_decl__p
[BIP ENGINE]:  -> choose [0] ROOT.a._iport_decl__p
[BIP ENGINE]: state #5: 1 internal port:
[BIP ENGINE]:   [0] ROOT.a._iport_decl__q
[BIP ENGINE]:  -> choose [0] ROOT.a._iport_decl__q
[BIP ENGINE]: state #6: 1 internal port:
[BIP ENGINE]:   [0] ROOT.a._iport_decl__p
[BIP ENGINE]:  -> choose [0] ROOT.a._iport_decl__p
...
```

如果优先级 $myPrioEven$ 和 $myPrioOdd$ 的守卫条件都为真时（即模型处于相同的状态），当执行模型时会报告一个错误。例如，如果两个守卫条件都是 `((i% 2) = = 0)` ，则执行如下:

```
...
[BIP ENGINE]: initialize components...
[BIP ENGINE]: ERROR: cycle in priorities! (p < q < p)
```

### 复合组件中的优先级

与在原子组件中使用优先级类似，当在给定的复合组件状态下有多个使能的交互时，可以使用优先级来阻止其中一些交互执行。

```{24,25}
package priorities_in_compound
  port type Port()

  atom type MyAtom(int enabled)
    export port Port p()

    place SYNC, END

    initial to SYNC

    on p from SYNC to END
      provided (enabled == 1)
  end

  connector type Broadcast(Port p, Port q, Port r)
    define p' q r
    on p provided (false)
  end

  compound type Model()
    component MyAtom A(1), B(1), C(0)
    component MyAtom D(1), E(1), F(1)

    connector Broadcast brdABC(A.p, B.p, C.p)
    connector Broadcast brdDEF(D.p, E.p, F.p)
  end
end
```

在上面的例子中，我们使用两个类型为 $Broadcast$ 的连接器实例 $brdABC$ 和 $brdDEF$ 同步了组件 $A,B,C,D,E$。因为组件 $A$ 的端口 $p$ 被作为连接器 $brdABC$ 的触发端口，$brdABC$（静态地）定义了交互 $A.p$、$A.p,B.p$、$A.p,C.p$ 和 $A.p,B,p,C.p$。同样地，$brdDEF$（静态地）定义了交互 $D.p$、$D.p,E.p$、$D.p,F.p$ 和 $D.p,E,p,F.p$。由于 $Broadcast$ 中的守卫条件为测试为假，交互 $A.p$ 和 $D.p$ 被禁用。此外由于 $MyAtom$ 中的守卫条件 `(enabled == 1)`而 $C$ 中的参数为 $0$，交互 $A.p,C.p$ 和 $A.p,B.p,C.p$ 同样被禁用。因此，初始化后使能的交互有：$brdABC$ 中的定义的交互 $A.p,B.p$ 和 $brdDEF$ 中的 $D.p,E.p$、$D.p,F.p$ 和 $D.p,E,p,F.p$。

在 BIP2 中，默认的优先级是最大进度规则——给定一个连接器，给予有更大范围的交互更高的优先级。上面的例子中连接器 $brdDEF$ 中交互 $D.p,E.p$ 和 $D.p,F.p$  不是最大交互，这是因为有更大范围的交互 $D.p,E,p,F.p$ 处于使能状态。因此，复合组件 $Model$ 的实例的执行序列是 $A.p,B.p$ 与 $D.p,E,p,F.p$ 的任意执行序列。也就是说，可能是下面两种执行序列情况之一：

如果先执行$A.p,B.p$ ：

```
...
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 2 interactions:
[BIP ENGINE]:   [0] ROOT.brdABC: ROOT.A.p() ROOT.B.p()
[BIP ENGINE]:   [1] ROOT.brdDEF: ROOT.D.p() ROOT.E.p() ROOT.F.p()
[BIP ENGINE]: -> choose [0] ROOT.brdABC: ROOT.A.p() ROOT.B.p()
[BIP ENGINE]: state #1: 1 interaction:
[BIP ENGINE]:   [0] ROOT.brdDEF: ROOT.D.p() ROOT.E.p() ROOT.F.p()
[BIP ENGINE]: -> choose [0] ROOT.brdDEF: ROOT.D.p() ROOT.E.p() ROOT.F.p()
[BIP ENGINE]: state #2: deadlock!
```

或如果先执行$D.p,E,p,F.p$  ：

```
...
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 2 interactions:
[BIP ENGINE]:   [0] ROOT.brdABC: ROOT.A.p() ROOT.B.p()
[BIP ENGINE]:   [1] ROOT.brdDEF: ROOT.D.p() ROOT.E.p() ROOT.F.p()
[BIP ENGINE]: -> choose [1] ROOT.brdDEF: ROOT.D.p() ROOT.E.p() ROOT.F.p()
[BIP ENGINE]: state #1: 1 interaction:
[BIP ENGINE]:   [0] ROOT.brdABC: ROOT.A.p() ROOT.B.p()
[BIP ENGINE]: -> choose [0] ROOT.brdABC: ROOT.A.p() ROOT.B.p()
[BIP ENGINE]: state #2: deadlock!
```

#### 使用优先级来强制以特定序列执行

我们可以修改上面的例子来强制以特定序列执行，使 $brdDEF$ 的交互  $D.p,E,p,F.p$ 的执行总是在 $brdABC$ 中的定义的交互 $A.p,B.p$ 。添加下面的优先级规则来实现这个要求：

```
priority scheduler brdABC:A.p,B.p < brdDEF:D.p,E.p,F.p
```

这就确保了模型有单一的执行序列，如下所示:

```
...
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 1 interaction:
[BIP ENGINE]:   [0] ROOT.brdDEF: ROOT.D.p() ROOT.E.p() ROOT.F.p()
[BIP ENGINE]: -> choose [0] ROOT.brdDEF: ROOT.D.p() ROOT.E.p() ROOT.F.p()
[BIP ENGINE]: state #1: 1 interaction:
[BIP ENGINE]:   [0] ROOT.brdABC: ROOT.A.p() ROOT.B.p()
[BIP ENGINE]: -> choose [0] ROOT.brdABC: ROOT.A.p() ROOT.B.p()
[BIP ENGINE]: state #2: deadlock!
```

请注意在初始化之后，只有交互 $D.p,E,p,F.p$ 被引擎列出，因为前述最大交互原则。用 $brdABC:A.p,B.p,C.p < brdDEF: D.p$ 替代上面定义的 `scheduler` 优先级规则，也会导致相同的执行序列，这是因为优先权的计算依据为：最大进度原则和 $priority$ 声明所规定的优先级规则的并集。即使交互 $A.p,B,p,C.p$ 并没有被 $brdABC$ 使能，同时交互  $D.p$ 没有被 $brdDEF$ 使能，优先级规则 $brdABC:A.p,B.p < brdDEF: D.p,E.p,F.p$ 仍然可以通过最大进度原则被推断出来，这里最大进度原则强制指定了以下规则：$brdABC:A.p,B.p < brdABC:A.p,B.p,C.p$ ，$brdDEF: D.p < brdDEF:D.p,E.p,F.p$ 和  $brdABC:A.p,B.p,C.p < brdDEF: D.p$ 。

还要注意，优先级规则必须只由连接器定义的交互（即由 $define$ 定义提供的表达式定义的交互）定义。因此，如果优先级规则  `scheduler` 被 $brdABC: A.p,B.p,C.p< brdDEF: E.p$ 所替代，则在编译模型时会报告错误:（连接器 $brdDEF$ 不允许只涉及单个 $E.p$ 标记的变迁的发生，它不是触发器也没有包含触发器）。

```
[SEVERE] In /home/to/example/priorities_in_compound.bip:
Interaction not allowed as not defined by connector type :
    26:
    27:     priority scheduler brdABC:A.p,B.p,C.p < brdDEF:E.p
----------------------------------------------------^
    28:   end
    29: end
```

#### 动态优先级和不可见状态

在下面的示例中，组件 $A$ 和 $B$ 表示某个资源的潜在使用者，该资源的由组件$R$表示。当用户$A$ 或 $B$到达库所 $FREE$ 时，组件 $A$ 或 $B$ 将会把其导出变量 $free$ 置为1，表示该组件没有使用资源 $R$。当使用者组件中的变量 $free$ 被设置为 $0$，或离开 $FREE$ 库所时，表示它从使用资源的状态可以到达不占用资源的状态，即库所$WAIT$。为了防止资源的并发使用，实现了一个优先级规则  `scheduler` 。如果$B$ 是 $FREE$ 时将给予 $B$ 更多的优先级（以降低 $A$ 的优先级形式实现），此时$B$ 的变量 $free$ 等于 $0$。

在优先级规则中使用“ $*$” 需要注意：对于它给予的 $A\_utilize\_R$ 中定义的交互的优先级，它们比除 $A\_utilize\_R$ 之外的任何连接器中定义的交互的优先级都低。

```{41}
package priorities_invisible
  port type Port()

  atom type Resource()
    export port Port utilize()

    place WAIT

    initial to WAIT

    on utilize from WAIT to WAIT
  end

  atom type UserOfRessource()
    export data int free
    export port Port utilize()

    place WAIT, FREE

    initial to WAIT
      do { free = 0; }

    on utilize from WAIT to FREE
      do { free = 1; }

    internal from FREE to WAIT
      do { free = 0; }
  end

  connector type RDV(Port p, Port q)
    define p q
  end

  compound type Model()
    component Resource R()
    component UserOfRessource A(), B()

    connector RDV A_utilize_R(A.utilize, R.utilize)
    connector RDV B_utilize_R(B.utilize, R.utilize)

    priority scheduler A_utilize_R:* < *:* provided (B.free == 0)
  end
end
```

在编译和执行 $Model$ 的实例时，会获得一个只有组件 $B$ 参与的执行轨迹。这是因为，组件 $B$ 内从 $FREE$ 库所到 $WAIT$ 库所的变迁是内部变迁，也就是说，在 $B$ 执行之前其状态是不可见的。因此，由于 $B.free$ 的可见值总是 $0$，$A\_utilize\_R$ 的交互永远不能执行。

> 译注：*内部*（*internal*）变迁对其他组件不可见，并优先于其他可被（其他组件）观察到的变迁。其执行与否取决于当前（组件的）状态和所关联的守卫条件。see： [Petri网 ](/bip2_language.html#Petri网)

```{7}
...
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 1 interaction:
[BIP ENGINE]:   [0] ROOT.B_utilize_R: ROOT.B.utilize() ROOT.R.utilize()
[BIP ENGINE]: -> choose [0] ROOT.B_utilize_R: ROOT.B.utilize() ROOT.R.utilize()
[BIP ENGINE]: state #1: 1 interaction:
[BIP ENGINE]:   [0] ROOT.B_utilize_R: ROOT.B.utilize() ROOT.R.utilize()
[BIP ENGINE]: -> choose [0] ROOT.B_utilize_R: ROOT.B.utilize() ROOT.R.utilize()
[BIP ENGINE]: state #2: 1 interaction:
[BIP ENGINE]:   [0] ROOT.B_utilize_R: ROOT.B.utilize() ROOT.R.utilize()
[BIP ENGINE]: -> choose [0] ROOT.B_utilize_R: ROOT.B.utilize() ROOT.R.utilize()
[BIP ENGINE]: state #3: 1 interaction:
[BIP ENGINE]:   [0] ROOT.B_utilize_R: ROOT.B.utilize() ROOT.R.utilize()
[BIP ENGINE]: -> choose [0] ROOT.B_utilize_R: ROOT.B.utilize() ROOT.R.utilize()
...
```

这个问题可以通过使用由内部端口标记的转换而不是使用内部转换来解决。下面提供了 $UserOfResource$ 的正确版本。

```{14}
atom type UserOfRessource()
   export data int free
   port Port notfree()
   export port Port utilize()

   place WAIT, FREE

   initial to WAIT
     do { free = 0; }

   on utilize from WAIT to FREE
     do { free = 1; }

   on notfree from FREE to WAIT
     do { free = 0; }
 end
```

相应的执行涉及组件 $A$ 和 $B$。只有当组件 $B$ 空闲时组件 $A$才能执行。

```
...
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 1 interaction:
[BIP ENGINE]:   [0] ROOT.B_utilize_R: ROOT.B.utilize() ROOT.R.utilize()
[BIP ENGINE]: -> choose [0] ROOT.B_utilize_R: ROOT.B.utilize() ROOT.R.utilize()
[BIP ENGINE]: state #1: 1 interaction and 1 internal port:
[BIP ENGINE]:   [0] ROOT.A_utilize_R: ROOT.A.utilize() ROOT.R.utilize()
[BIP ENGINE]:   [1] ROOT.B._iport_decl__notfree
[BIP ENGINE]:  -> choose [0] ROOT.B._iport_decl__notfree
[BIP ENGINE]: state #2: 1 interaction:
[BIP ENGINE]:   [0] ROOT.B_utilize_R: ROOT.B.utilize() ROOT.R.utilize()
[BIP ENGINE]: -> choose [0] ROOT.B_utilize_R: ROOT.B.utilize() ROOT.R.utilize()
[BIP ENGINE]: state #3: 1 interaction and 1 internal port:
[BIP ENGINE]:   [0] ROOT.A_utilize_R: ROOT.A.utilize() ROOT.R.utilize()
[BIP ENGINE]:   [1] ROOT.B._iport_decl__notfree
[BIP ENGINE]:  -> choose [0] ROOT.B._iport_decl__notfree
[BIP ENGINE]: state #4: 1 interaction:
[BIP ENGINE]:   [0] ROOT.B_utilize_R: ROOT.B.utilize() ROOT.R.utilize()
[BIP ENGINE]: -> choose [0] ROOT.B_utilize_R: ROOT.B.utilize() ROOT.R.utilize()
[BIP ENGINE]: state #5: 1 interaction and 1 internal port:
[BIP ENGINE]:   [0] ROOT.A_utilize_R: ROOT.A.utilize() ROOT.R.utilize()
[BIP ENGINE]:   [1] ROOT.B._iport_decl__notfree
[BIP ENGINE]: -> choose [0] ROOT.A_utilize_R: ROOT.A.utilize() ROOT.R.utilize()
...
```

## 使用C++后端

### 使用预安装库的Hello World例子

前面的 $HelloWorld$ 示例本身不打印任何内容。在这个示例中，我们使用标准 C 库中的通用 `printf()` 添加信息显示。

将初始示例改变为下面的模式：

```{11}
@cpp(include="stdio.h")
package HelloPackage
  extern function printf(string)

  port type HelloPort_t()

  atom type HelloAtom()
    port HelloPort_t p()
    place START,END
    initial to START
    on p from START to END do { printf("Hello World!\n"); }
  end

  compound type HelloCompound()
    component HelloAtom c1()
  end
end
```

注解 `@cpp(include="stdio.h")` 指示代码生成器包含头文件 `stdio.h`。C标准库为这个包提供对应的代码，并允许使用`printf()` 函数：

```
$ bipc.sh -I . -p HelloPackage -d "HelloCompound()" \
  --gencpp-output output
$ mkdir output/build
$ cd output/build
$ cmake ..
[...]
$ make
[...]
```

运行该例子，当变迁被触发时，`printf()` 函数被调用：

```
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 1 internal port:
[BIP ENGINE]:   [0] ROOT.c1._iport_decl__p
[BIP ENGINE]:  -> choose [0] ROOT.c1._iport_decl__p
Hello World
[BIP ENGINE]: state #1: deadlock!
```

### 使用外部代码的Hello World例子

再次修改我们的例子。这一次，还将提供将消息打印到控制台所需的代码，但不是直接依赖于标准库。

```{1,3,11}
@cpp(src="ext-cpp/HelloPackage.cpp",include="HelloPackage.hpp")
package HelloPackage
  extern function my_print(string)

  port type HelloPort_t()

  atom type HelloAtom()
    port HelloPort_t p()
    place START,END
    initial to START
    on p from START to END do { my_print("Hello World!\n"); }
  end

  compound type HelloCompound()
    component HelloAtom c1()
  end
end
```

除了 BIP 文件，还需要创建提供 `my_print (“ ... .”)`函数的外部代码:

* 对于接口(即 `HelloPackage.hpp`) ，需要将其放入一个目录，该目录将被包含在 C++ 编译器的搜索路径中；
* 对于接口的实现(即 `HelloPackage.cpp`)，它需要与前面的接口对应。

可以使用任意目录结构，建议使用这样的目录结构：

```
.
÷── ext-cpp
│   ÷── HelloPackage.cpp
│   `── HelloPackage.hpp
`── HelloPackage.bip
```

`HelloPackage.hpp` 的内容如下：

```cpp
void my_print(const char *message);
```

`HelloPackage.cpp` 的内容如下：

```cpp
#include <iostream>

void my_print(const char *message){
  std::cout << "Someone says: " << message;
}
```

然后使用下面的命令编译：

```
$ bipc.sh -I . -p HelloPackage -d "HelloCompound()"\
  --gencpp-output output \
  --gencpp-cc-I $PWD/ext-cpp
$ mkdir output/build
$ cd output/build
$ cmake ..
[...]
$ make
[...]
```

`--gencpp-cc-I` 选项被用于将用户定义的 `.hpp` 文件包含在编译器包含路径列表中。

最后，运行产出的可执行文件 `system`：

```
$ ./system
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 1 internal port:
[BIP ENGINE]:   [0] ROOT.c1._iport_decl__p
[BIP ENGINE]:  -> choose [0] ROOT.c1._iport_decl__p
Someone says: Hello World
[BIP ENGINE]: state #1: deadlock!
```

### 使用数据和外部代码的Hello World例子

在本例中，我们再次修改 Hello World 例子，这次将一些数据传递给外部代码。

新的 BIP 代码如下：

```
@cpp(src="ext-cpp/HelloPackage.cpp",include="HelloPackage.hpp")
package HelloPackage
  extern function my_print(string, int)

  port type HelloPort_t()

  atom type HelloAtom()
    data int somedata
    port HelloPort_t p()
    place START,END
    initial to START do { somedata = 0; }
    on p from START to END do {my_print("Hello World", somedata);}
  end

  compound type HelloCompound()
    component HelloAtom c1()
  end
end
```

`my_print()` 被更改为可以接受一个额外的 int 参数的版本。注意，这个参数是一个 C++ *引用*: 函数可以访问实际数据，而不是副本。

`HelloPackage.hpp`：

```cpp
void my_print(const char *message, int &adata);
```

`HelloPackage.cpp`：

```cpp
#include <iostream>

void my_print(const char *message, int &adata){
  std::cout << "Someone says: " << message << " with data=" << adata << std::endl;
}
```

编译过程没有改变：

```
$ bipc.sh -I . -p HelloPackage -d "HelloCompound()"\
  --gencpp-output output \
  --gencpp-cc-I $PWD/ext-cpp
$ mkdir output/build
$ cd output/build
$ cmake ..
[...]
$ make
[...]
```

在运行可执行文件时，我们可以看到数据的值被正确显示:

```
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 1 internal port:
[BIP ENGINE]:   [0] ROOT.c1._iport_decl__p
[BIP ENGINE]:  -> choose [0] ROOT.c1._iport_decl__p
Someone says: Hello World with data=0
[BIP ENGINE]: state #1: deadlock!
```

### 使用外部代码修改数据的Hello World例子

前面的示例只是演示外部代码如何从 BIP 中读取数据。外部代码还可以修改此 BIP 内部数据(前提是如果在允许修改数据的上下文调用此代码)。我们在外部代码中添加了一个新的只修改其整数参数 `my_modify()` 函数。

新的 BIP 代码如下：

```
@cpp(src="ext-cpp/HelloPackage.cpp",include="HelloPackage.hpp")
package HelloPackage
  extern function my_modify(int)
  extern function my_print(string, int)

  port type HelloPort_t()

  atom type HelloAtom()
    data int somedata
    port HelloPort_t p()
    place START, S, END
    initial to START do { somedata = 0; }
    on p from START to S do { my_modify(somedata); }
    on p from S to END do { my_print("Hello World", somedata);}
  end

  compound type HelloCompound()
    component HelloAtom c1()
  end
end
```

新的 `HelloPackage.hpp`:

```cpp
void my_print(const char *message, int &adata);
void my_modify(int &adata);
```

以及对应的 `HelloPackage.cpp`:

```cpp
#include <iostream>

void my_print(const char *message, int &adata){
  std::cout << "Someone says: " << message << " with data=" << adata << std::endl;
}

void my_modify(int &adata){
  adata = 999;
}
```

编译过程没有改变：

```
$ bipc.sh -I . -p HelloPackage -d "HelloCompound()"\
  --gencpp-output output \
  --gencpp-cc-I $PWD/ext-cpp
$ mkdir output/build
$ cd output/build
$ cmake ..
[...]
$ make
[...]
```

在运行该示例时，我们可以看到整数值被正确修改:

```
$ ./system
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 1 internal port:
[BIP ENGINE]:   [0] ROOT.c1._iport_decl__p
[BIP ENGINE]:  -> choose [0] ROOT.c1._iport_decl__p
[BIP ENGINE]: state #1: 1 internal port:
[BIP ENGINE]:   [0] ROOT.c1._iport_decl__p
[BIP ENGINE]:  -> choose [0] ROOT.c1._iport_decl__p
Someone says: Hello World with data=999
[BIP ENGINE]: state #2: deadlock!
```

### 从常量上下文调用外部代码的Hello World例子

当从常量(const)上下文调用函数时(例如，连接器的 up 阶段和所有的守卫条件) ，在使用数据接口外部代码时必须格外小心。同样，我们通过添加一个调用外部函数 `my_guard()` 的守卫条件来扩展 `HelloPackage`，该函数可以访问组件的数据。

修改后的 BIP 代码：

```
@cpp(src="ext-cpp/HelloPackage.cpp",include="HelloPackage.hpp")
package HelloPackage
  extern function bool my_guard(int)
  extern function my_modify(int)
  extern function my_print(string, int)

  port type HelloPort_t()

  atom type HelloAtom()
    data int somedata
    port HelloPort_t p(), positive(), negative()
    place START, S, END
    initial to START do { somedata = 0; }
    on p from START to S do { my_modify(somedata); }
    on negative from S to END
      provided (my_guard(somedata))
      do {my_print("Positive data", somedata);}
    on positive from S to END
      provided (!my_guard(somedata))
      do {my_print("Negative data", somedata);}
  end

  compound type HelloCompound()
    component HelloAtom c1()
  end
end
```

注意，新的 `HelloPackage.hpp` 包含 了`const_my_guard()` 的声明，而不是 ` my_guard ()`，这是因为此时 BIP 是从一个*常量*上下文中调用的 `my_guard ()` :

```cpp
void my_print(const char *message, int &adata);
void my_modify(int &adata);
bool const_my_guard(int &adata);
```

对应的 `HelloPackage.cpp`:

```cpp
#include <iostream>

void my_print(const char *message, int &adata){
  std::cout << "Someone says: " << message << " with data=" << adata << std::endl;
}

void my_modify(int &adata){
  adata = 999;
}

bool const_my_guard(int &adata){
  return adata > 0;
}
```

编译过程如下：

```
$ bipc.sh -I . -p HelloPackage -d "HelloCompound()"\
  --gencpp-output output \
  --gencpp-cc-I $PWD/ext-cpp
$ mkdir output/build
$ cd output/build
$ cmake ..
[...]
$ make
[...]
```

执行过程中注意到一个可能的变迁发生了：

```
[BIP ENGINE]: initialize components...
[BIP ENGINE]: state #0: 1 internal port:
[BIP ENGINE]:   [0] ROOT.c1._iport_decl__p
[BIP ENGINE]:  -> choose [0] ROOT.c1._iport_decl__p
[BIP ENGINE]: state #1: 1 internal port:
[BIP ENGINE]:   [0] ROOT.c1._iport_decl__negative
[BIP ENGINE]:  -> choose [0] ROOT.c1._iport_decl__negative
Someone says: Positive data with data=999
[BIP ENGINE]: state #2: deadlock!
```

###  使用自定义类型

现在，我们将在一个涉及3个原子组件的简单交汇（rendez-vous）示例中使用自定义类型。

* 每个原子组件调用 `init_data()` 函数来初始化其内部数据。所有的原子组件初始化的值不一样。
* 所有原子组件都是同步的，连接器从第3个原子组件获取值，并将其写入另外2个原子。

所有原子组件将在同步之前和之后都打印它们的值。

为了使用自定义类型，我们需要：

* 在 BIP 源码中声明所用到的自定义类型；
* 在 C++ 外部代码中定义这些类型。

在这个示例中，我们不提供序列化支持(这将在下一个示例中演示)。

源代码如下：

`HelloPackage.bip`:

```
@cpp(src="ext-cpp/HelloPackage.cpp",include="HelloPackage.hpp")
package HelloPackage
  extern data type my_custom_type
  extern function init_data(int, my_custom_type)
  extern function print_data(int, my_custom_type)

  port type HelloPort_t(my_custom_type d)

  atom type HelloAtom(int id)
    data my_custom_type d
    export port HelloPort_t p(d)
    place START,END
    initial to START do {init_data(id, d); print_data(id, d);}
    on p from START to END do {print_data(id, d);}
  end

  connector type ThreeRendezVous(HelloPort_t p1, HelloPort_t p2, HelloPort_t p3)
  define p1 p2 p3
  on p1 p2 p3 down { p1.d = p3.d; p2.d = p3.d; }
  end

  compound type HelloCompound()
    component HelloAtom c1(1), c2(2), c3(3)
    connector ThreeRendezVous connect(c1.p, c2.p, c3.p)
  end
end
```

`HelloPackage.hpp`:

```cpp
#ifndef HP_HPP
#define HP_HPP

typedef struct {
  int x,y;
} my_custom_type;

void print_data(int id, my_custom_type &adata);
void init_data(int id, my_custom_type &adata);

#endif
```

`HelloPackage.cpp`:

```cpp
#include <iostream>
#include "HelloPackage.hpp"

void print_data( int id, my_custom_type &adata){
  std::cout << "Data for: " << id << " = " << adata.x
          << "," << adata.y << std::endl;
}

void init_data(int id, my_custom_type &adata){
  adata.x = id * 2;
  adata.y = id * 8;
}
```

由于 BIP2 不提供对 `my_custom_type` 数据类型序列化的支持，因此需要关闭在原子组件中生成序列化代码的功能:

```
$ bipc.sh -I . -p HelloPackage -d "HelloCompound()"\
  --gencpp-output output \
  --gencpp-cc-I $PWD/ext-cpp \
  --gencpp-no-serial
$ mkdir output/build
$ cd output/build
$ cmake ..
[...]
$ make
[...]
```

执行得到如下执行轨迹

```
[BIP ENGINE]: initialize components...
Data for: 1 = 2,8
Data for: 2 = 4,16
Data for: 3 = 6,24
[BIP ENGINE]: state #0: 1 interaction:
[BIP ENGINE]:   [0] ROOT.connect: ROOT.c1.p(-) ROOT.c2.p(-) ROOT.c3.p(-)
[BIP ENGINE]: -> choose [0] ROOT.connect: ROOT.c1.p(-) ROOT.c2.p(-) ROOT.c3.p(-)
Data for: 1 = 6,24
Data for: 2 = 6,24
Data for: 3 = 6,24
[BIP ENGINE]: state #1: deadlock!
```

### 为自定义类型增加序列化支持

序列化支持可被用于显示在执行轨迹中的数据值。为了支持自定义类型的序列化，需要为 `<<` 运算符提供一个函数:

```cpp
ostream& operator<<(ostream &o, const CustomType &value);
```

所有添加序列化支持的工作都在 C++ 代码中完成，BIP源文件与前面示例相同。

修改后的 C++ 代码如下：

`HelloPackage.hpp`:

```cpp
#ifndef HP_HPP
#define HP_HPP

#include <iostream>

struct __my_custom_type;

struct __my_custom_type {
  int x,y;
  friend std::ostream& operator<<(std::ostream &o, const struct __my_custom_type &value);
};

typedef struct __my_custom_type my_custom_type;

void print_data(int id, my_custom_type &adata);
void init_data(int id, my_custom_type &adata);

#endif
```

`HelloPackage.cpp`:

```cpp
#include "HelloPackage.hpp"

void print_data( int id, my_custom_type &adata){
  std::cout << "Data for: " << id << " = " << adata.x
          << "," << adata.y << std::endl;
}

void init_data(int id, my_custom_type &adata){
  adata.x = id * 2;
  adata.y = id * 8;
}

std::ostream& operator<<(std::ostream &o, const struct __my_custom_type &value){
  o << "[" << value.x << ", "  << value.y << "]";
  return o;
}
```

注意不要使用 `--gencpp-no-serial` 编译选项：

```
$ bipc.sh -I . -p HelloPackage -d "HelloCompound()"\
  --gencpp-output output \
  --gencpp-cc-I $PWD/ext-cpp
$ mkdir output/build
$ cd output/build
$ cmake ..
[...]
$ make
[...]
```

可以通过读取执行轨迹来检查序列化代码是否正确使用:

```
[BIP ENGINE]: initialize components...
Data for: 1 = 2,8
Data for: 2 = 4,16
Data for: 3 = 6,24
[BIP ENGINE]: state #0: 1 interaction:
[BIP ENGINE]:   [0] ROOT.connect: ROOT.c1.p({d}=[2, 8];) ROOT.c2.p({d}=[4, 16];) ROOT.c3.p({d}=[6, 24];)
[BIP ENGINE]: -> choose [0] ROOT.connect: ROOT.c1.p({d}=[2, 8];) ROOT.c2.p({d}=[4, 16];) ROOT.c3.p({d}=[6, 24];)
Data for: 1 = 6,24
Data for: 2 = 6,24
Data for: 3 = 6,24
[BIP ENGINE]: state #1: deadlock!
```

::: tip 重要

在本例中，我们使的是常规的 C 结构类型，但是当然可以使用 C++ 类(它们基本上与 struct 相同)。

:::

### 在BIP层次上调试程序

通过使用 `gencpp-able-BIP-debug` 选项，不仅可以在生成的 C++ 代码上使用 GDB调试，也可以调试 BIP 源代码。

重用前面使用外部代码和修改原子数据的示例:

```
@cpp(src="ext-cpp/HelloPackage.cpp",include="HelloPackage.hpp")
package HelloPackage
  extern function my_modify(int)
  extern function my_print(string, int)

  port type HelloPort_t()

  atom type HelloAtom()
    data int somedata
    port HelloPort_t p()
    place START, S, END
    initial to START do {
       somedata = 0;
    }
    on p from START to S do {
       my_modify(somedata);
    }
    on p from S to END do {
       my_print("Hello World", somedata);
    }
  end

  compound type HelloCompound()
    component HelloAtom c1()
  end
end
```

`HelloPackage.hpp`:

```cpp
void my_print(const char *message, int &adata);
void my_modify(int &adata);
```

`HelloPackage.cpp`:

```cpp
#include <iostream>

void my_print(const char *message, int &adata){
  std::cout << "Someone says: " << message << " with data=" << adata << std::endl;
}

void my_modify(int &adata){
  adata = 999;
}
```

可以通过给出'文件+行号'来命令 GDB 在任何变迁守卫条件/操作上添加一个断点，就像常规的 C/C + + 调试一样(可以使用文件完成) :

```
(gdb) b HelloPackage.bip:16
Breakpoint 1 at 0x805f649:
          qfile /path/to/debug_bip_level/HelloPackage.bip, line 16. (4 locations)
(gdb) r
Starting program: /path/to/debug_bip_level/build/system

Breakpoint 1, AT_HelloAtom::initialize (this=0x8082de0) at
                   /path/to/debug_bip_level/HelloPackage.bip:16
Current language:  auto
The current source language is "auto; currently c++".
```

GDB 正确显示 BIP 源代码中的位置:

```
   │12          on p from START to S do {
   │13            my_modify(somedata);
   │14          }
   │15          on p from S to END do {
B+>│16            my_print("Hello World", somedata);
   │17          }
   │18        end
   │19
   │20          compound type HelloCompound()
   │21          component HelloAtom c1()
```

也可以在外部代码中设置断点:

```
(gdb) b HelloPackage.cpp:8
Breakpoint 2 at 0x80665a8: file /path/to/debug_bip_level/ext-cpp/HelloPackage.cpp, line 8.
```

