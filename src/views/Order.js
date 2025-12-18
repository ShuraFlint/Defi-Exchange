import React, { useRef, useState } from 'react'
import { Card, Col, Row, Table, Button, Input, Space } from 'antd';
import { useSelector } from 'react-redux';
import moment from 'moment'

import { useDispatch } from 'react-redux'
import { loadBalanceData } from '../redux/slices/balanceSlice'
import { loadCancelOrderData, loadAllOrderData, loadFillOrderData } from '../redux/slices/orderSlice'

let number = 0;

function converTime(t) {
    // const timestamp = typeof t === 'bigint' ? Number(t) : t;
    return moment(Number(t) * 1000).format("YYYY/MM/DD");
}

function convert(n) {
    if (!window.web || !n) return
    return window.web.web3.utils.fromWei(n, 'ether')
}

function getRenderOrder(order, type) {
    if (!window.web) return []

    const account = window.web.account
    // console.log(account);

    //1 排除 已完成 已取消 订单
    let fillterIds = [...order.CancelOrders, ...order.FillOrders].map(item => item.id)
    // console.log(fillterIds);

    //正在售卖的订单
    let pendingOrders = order.AllOrders.filter(item => !fillterIds.includes(item.id))
    // console.log(pendingOrders);

    if (type === 1) {
        return pendingOrders.filter(item => item.user.toLowerCase() === account)
    } else {
        return pendingOrders.filter(item => item.user.toLowerCase() !== account)
    }

    //2 去除别人账户创建的订单
}

export default function Order() {
    const [KWTValue, setKWTValue] = useState();
    const [ETHValue, setETHValue] = useState();
    const toWei = (number) => {
        return number * 10 ** 18;
    }

    const order = useSelector(state => state.order)
    const dispatch = useDispatch()
    if (order.AllOrders.length > number) {
        number = order.AllOrders.length;
        // console.log(order.AllOrders.length);
        dispatch(loadAllOrderData(window.web));
    }

    // console.log(order);

    const columns = [
        {
            title: '时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp) => <div>{converTime(timestamp)}</div>
        },
        {
            title: 'KWT',
            dataIndex: 'amountGet',
            key: 'amountGet',
            render: (amountGet) => <b>{convert(amountGet)}</b>
        },
        {
            title: 'ETH',
            dataIndex: 'amountGive',
            key: 'amountGive',
            render: (amountGive) => <b>{convert(amountGive)}</b>
        },
    ];

    const columns1 = [
        ...columns,
        {
            title: '操作',
            render: (item) => <Button type="primary" onClick={() => {
                // console.log(item.id);
                const { exchange, account } = window.web
                exchange.methods.cancelOrder(item.id).send({ from: account }).then(() => {
                    dispatch(loadCancelOrderData(window.web))
                }).catch(console.error)

            }}>取消</Button>
        },
    ]

    const columns2 = [
        ...columns,
        {
            title: '操作',
            render: (item) => <Button danger onClick={async () => {
                try {
                    const { exchange, account } = window.web;

                    // 先估算 gas
                    const estimatedGas = await exchange.methods.fillOrder(item.id).estimateGas({ from: account });

                    // 执行交易
                    await exchange.methods.fillOrder(item.id).send({
                        from: account,
                        gas: Number(estimatedGas) + 100000
                    });

                    // 成功后再更新状态
                    dispatch(loadFillOrderData(window.web));
                    dispatch(loadBalanceData(window.web));
                } catch (err) {
                    console.error("交易失败", err);
                    alert("交易失败：" + (err?.message || "未知错误"));
                }
            }}>买入</Button>
        },
    ];


    return (
        <div style={{ marginTop: "10px" }} >
            <div style={{ margin: "10px" }} >创建一个订单</div>
            <Space.Compact style={{ width: '48%' }}>
                <Input placeholder="KWT金额" value={KWTValue}
                    onChange={(e) => setKWTValue(e.target.value)} />
                <Input placeholder="ETH金额" value={ETHValue}
                    onChange={(e) => setETHValue(e.target.value)} />
                <Button type="primary" onClick={async () => {
                    const { token, exchange, account } = window.web;

                    const estimatedGas = await exchange.methods.makeOrder(token._address, toWei(Number(KWTValue)), "0x0000000000000000000000000000000000000000", toWei(Number(ETHValue))).estimateGas({ from: account });
                    await exchange.methods.makeOrder(token._address, toWei(Number(KWTValue)), "0x0000000000000000000000000000000000000000", toWei(Number(ETHValue))).send({
                        from: account,
                        gas: Number(estimatedGas) + 1000000
                    });
                    dispatch(loadBalanceData(window.web));
                    dispatch(loadAllOrderData(window.web));
                    setKWTValue('');
                    setETHValue('');
                }}>Submit</Button>
            </Space.Compact>

            <Row>
                <Col span={8}>
                    <Card title="已完成交易" style={({
                        margin: 10
                    })}>
                        <Table dataSource={order.FillOrders} columns={columns} rowKey={item => item.id} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="我创建的订单" style={({
                        margin: 10
                    })}>
                        <Table dataSource={getRenderOrder(order, 1)} columns={columns1} rowKey={item => item.id} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="其他人的订单" style={({
                        margin: 10
                    })}>
                        <Table dataSource={getRenderOrder(order, 2)} columns={columns2} rowKey={item => item.id} />
                    </Card>
                </Col>
            </Row>

        </ div>
    )
}