> 原文[Introduction](https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/introduction.html)

# 文档介绍

本文首先介绍 BIP2 语言的主要概念: 类型、语义、语法（请参阅[BIP2语言](/bip2_language)）。然后，介绍了用于编译和执行 BIP2程序的工具——编译器和引擎，及其安装和基本用法。由于主要的用例涉及到 C++ 代码的生成，因此设置了一个专门的部分更深入地解释了如何使用 BIP2 的 C++ 代码生成器（参见更多关于 C++ 代码生成器的内容）。本教程将逐步展示如何使用 BIP2语言的主要特性（请参阅教程）。最后，展示了完整的语言语法作为参考（参见 BIP2 语法）。

## 本文档中约定的规则

### Shell命令

Shell命令应该以`$`符号开始

```shell
$ cd /etc
```

当一个命令需要在指定的目录内执行，该目录需要在`$`符号之前指出

```shell
/home/bla/ $ mkdir toto
```

如果命令行太长，则通过转义行结束字符来切断该行

```shell
$ ./bla --this --is="a very long" --command \
  --line \
  --that --is --cut=twice
```

