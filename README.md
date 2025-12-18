# Defi-Exchange

#### 介绍
{**以下是 Gitee 平台说明，您可以替换此简介**
Gitee 是 OSCHINA 推出的基于 Git 的代码托管平台（同时支持 SVN）。专为开发者提供稳定、高效、安全的云端软件开发协作平台
无论是个人、团队、或是企业，都能够用 Gitee 实现代码托管、项目管理、协作开发。企业项目请看 [https://gitee.com/enterprises](https://gitee.com/enterprises)}

#### 软件架构

1.  在本地使用ganache命令构建了一跳私链，自动创建10个账号，每个账号默认1000ETH
1.  后端使用solidity进行编写，实现了一个交易所的基本逻辑功能
2.  前端使用react框架构建

#### 安装教程

1.  开启本地私链：ganache -d
1.  创建react项目：create-react-app myweb3
2.  创建web3项目：truffle init
3.  下载web3所用包：npm i openzeppelin-solidity

#### 使用说明

1.  在本地部署私链：ganache -d
2.  编译命令，查看代码是否出错：truffle compile
3.  部署智能合约：truffle migrate --reset
4.  进入truffle控制台测试方法：truffle console
5.  truffle(development)> const obj = await StudentStorage.deployed()
6.  部署智能合约：truffle migrate
7.  进入truffle控制台测试方法：truffle console
8.  const obj = await StudentStorage.deployed()
9.  脚本代码测试：truffle exec .\scripts\test-order.js
10.  react启动服务：npm start
11. 克隆代码后终端需要安装所需依赖包：npm install

#### 页面展示
<img width="1872" height="954" alt="image" src="https://github.com/user-attachments/assets/57c1dfd7-0192-436a-a5dd-03f51bd2ac5d" />

