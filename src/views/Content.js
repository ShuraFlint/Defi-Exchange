//这是一个组件，供App.js使用

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
//下载的web3安装包
import Web3 from 'web3'
//solidity代码编写的智能合约编译之后的json文件
import tokenjson from '../build/KerwinToken.json'
//solidity代码编写的智能合约编译之后的json文件
import exchangejson from '../build/Exchange.json'
import Balance from './Balance'
import Order from './Order'
import { loadBalanceData } from '../redux/slices/balanceSlice'
import { loadCancelOrderData, loadAllOrderData, loadFillOrderData } from '../redux/slices/orderSlice'
// console.log(tokenjson);

export default function Content() {
    const dispatch = useDispatch()
    // useEffect(() => { })	每次渲染后都执行
    // useEffect(() => { }, [])	只在组件首次挂载时执行一次
    // useEffect(() => { }, [x])	只有当 x 发生变化时才执行
    useEffect(() => {
        async function start() {
            //1获取链接后的合约
            const web = await initWeb()
            // console.log(web);
            window.web = web;

            //userContext, useReducer,
            //订阅发布
            //设置成全局，供其他组件使用

            //2 获取资产信息

            dispatch(loadBalanceData(web))

            //3 获取订单信息
            dispatch(loadCancelOrderData(web))
            dispatch(loadAllOrderData(web))
            dispatch(loadFillOrderData(web))

            //4 监听事件
            window.web.exchange.events.Order({}, (error, event) => {
                console.log("Order");
                dispatch(loadAllOrderData(web))
            })
            window.web.exchange.events.Cancel({}, (error, event) => {
                console.log("Cancel");
                dispatch(loadCancelOrderData(web))
            })
            window.web.exchange.events.Trade({}, (error, event) => {
                console.log("Trade");
                dispatch(loadFillOrderData(web))
                dispatch(loadBalanceData(web))
            })
        }
        start()
    }, [dispatch])

    async function initWeb() {
        var web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        // let accounts = await web3.eth.requestAccounts()
        // console.log(accounts[0]);
        let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        // console.log('Connected account:', accounts[0]);

        //获取networkId 网络ID
        const networkId = await web3.eth.net.getId();

        //智能合约KerwinToken编译后json文件的abi
        const tokenabi = tokenjson.abi;
        //智能合约KerwinToken编译后的合约地址
        const tokenaddress = tokenjson.networks[networkId].address;
        //连接KerwinToken智能合约，获取该合约的众多方法
        const token = await new web3.eth.Contract(tokenabi, tokenaddress);
        // console.log(token);

        //智能合约Exchange编译后json文件的abi
        const exchangeabi = exchangejson.abi;
        //智能合约Exchange编译后的合约地址
        const exchangeaddress = exchangejson.networks[networkId].address;
        //连接Exchange智能合约，获取该合约的众多方法
        const exchange = await new web3.eth.Contract(exchangeabi, exchangeaddress);
        // console.log(exchange);

        return {
            web3,
            account: accounts[0],
            token,
            exchange
        }
    }
    return (
        <div style={{
            padding: "10px"
        }}>
            <Balance></Balance>
            <Order></Order>
        </div >
    )
}