import React, { useRef, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Card, Col, Row, Statistic, Button, Input, Space } from 'antd';

import { useDispatch } from 'react-redux'
import { loadBalanceData } from '../redux/slices/balanceSlice'

function convert(n) {
    if (!window.web) return
    return window.web.web3.utils.fromWei(n, 'ether')
}

export default function Balance() {
    const dispatch = useDispatch()
    const {
        TokenWallet,
        TokenExchange,
        EtherWallet,
        EtherExchange
    } = useSelector(state => state.balance)
    const [addressValue, setAddressValue] = useState();
    const [amountValue, setAmountValue] = useState();

    const [KWTValue, setKWTValue] = useState();
    const [withdrawKWTValue, setwithdrawKWTValue] = useState();

    const [ETHValue, setETHValue] = useState();
    const [withdrawETHValue, setwithdrawETHValue] = useState();

    const toWei = (number) => {
        return number * 10 ** 18;
    }

    const [account1, setAccount1] = useState('');
    const [account2, setAccount2] = useState('');

    useEffect(() => {
        async function getAccounts() {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount1(accounts[0]);
            setAccount2(accounts[1]);
        }
        getAccounts();
    }, []);

    return (
        <div>
            <h3>本人账户：{account1}</h3>
            <h3>其他账户：{account2}</h3>
            <Row>
                <Col span={6}>
                    <Card variant="borderless" hoverable={true}>
                        <Statistic
                            title="钱包中ETH"
                            value={convert(EtherWallet)}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                        // prefix={<ArrowUpOutlined />}
                        // suffix="ETH"
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" hoverable={true}>
                        <Statistic
                            title="钱包中KWT"
                            value={convert(TokenWallet)}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                        // prefix={<ArrowDownOutlined />}
                        // suffix="%"
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" hoverable={true}>
                        <Statistic
                            title="交易所中ETH"
                            value={convert(EtherExchange)}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                        // prefix={<ArrowUpOutlined />}
                        // suffix="%"
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" hoverable={true}>
                        <Statistic
                            title="交易所中KWT"
                            value={convert(TokenExchange)}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                        // prefix={<ArrowDownOutlined />}
                        // suffix="%"
                        />
                    </Card>
                </Col>
            </Row>

            <div style={{ margin: "10px" }} >给其他账户转账</div>
            <Space.Compact style={{ width: '48%' }}>
                <Input placeholder="对方账户地址" value={addressValue}
                    onChange={(e) => setAddressValue(e.target.value)} />
                <Input placeholder="所转金额" value={amountValue}
                    onChange={(e) => setAmountValue(e.target.value)} />
                <Button type="primary" onClick={async () => {
                    const { token, account } = window.web;
                    await token.methods.transfer(addressValue, toWei(Number(amountValue))).send({
                        from: account
                    });
                    dispatch(loadBalanceData(window.web));
                    setAddressValue('');
                    setAmountValue('');
                }}>Submit</Button>
            </Space.Compact>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '48%' }}>
                    <div style={{ margin: "10px" }} >向KWT交易所转账</div>
                    <Space.Compact style={{ width: '100%' }}>
                        <Input placeholder="转账金额" value={KWTValue}
                            onChange={(e) => setKWTValue(e.target.value)} />
                        <Button type="primary" onClick={async () => {
                            const { token, exchange, account } = window.web;
                            // console.log(exchange._address);

                            const estimatedGas1 = await token.methods.approve(exchange._address, toWei(Number(KWTValue))).estimateGas({ from: account });
                            await token.methods.approve(exchange._address, toWei(Number(KWTValue))).send({
                                from: account,
                                gas: Number(estimatedGas1) + 1000000
                            });

                            const estimatedGas = await exchange.methods.depositToken(token._address, toWei(Number(KWTValue))).estimateGas({ from: account });
                            // console.log(token._address);

                            await exchange.methods.depositToken(token._address, toWei(Number(KWTValue))).send({
                                from: account,
                                gas: Number(estimatedGas) + 1000000
                            });
                            dispatch(loadBalanceData(window.web));
                            setKWTValue('');
                        }}>Submit</Button>
                    </Space.Compact>
                </div>

                <div style={{ width: '48%' }}>
                    <div style={{ margin: "10px" }} >向KWT交易所提取钱</div>
                    <Space.Compact style={{ width: '100%' }}>
                        <Input placeholder="提取金额" value={withdrawKWTValue}
                            onChange={(e) => setwithdrawKWTValue(e.target.value)} />
                        <Button type="primary" onClick={async () => {
                            const { token, exchange, account } = window.web;

                            const estimatedGas = await exchange.methods.withdrawToken(token._address, toWei(Number(withdrawKWTValue))).estimateGas({ from: account });
                            // console.log(token._address);

                            await exchange.methods.withdrawToken(token._address, toWei(Number(withdrawKWTValue))).send({
                                from: account,
                                gas: Number(estimatedGas) + 1000000
                            });
                            dispatch(loadBalanceData(window.web));
                            setwithdrawKWTValue('');
                        }}>Submit</Button>
                    </Space.Compact>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '48%' }}>
                    <div style={{ margin: "10px" }} >向ETH交易所转账</div>
                    <Space.Compact style={{ width: '100%' }}>
                        <Input placeholder="转账金额" value={ETHValue}
                            onChange={(e) => setETHValue(e.target.value)} />
                        <Button type="primary" onClick={async () => {
                            const { token, exchange, account } = window.web;
                            // console.log(exchange._address);

                            // const estimatedGas1 = await token.methods.approve(exchange._address, toWei(Number(KWTValue))).estimateGas({ from: account });
                            // await token.methods.approve(exchange._address, toWei(Number(KWTValue))).send({
                            //     from: account,
                            //     gas: Number(estimatedGas1) + 1000000
                            // });

                            const estimatedGas = await exchange.methods.depositEther().estimateGas({
                                from: account,
                                value: toWei(Number(ETHValue))
                            });
                            // console.log(token._address);

                            await exchange.methods.depositEther().send({
                                from: account,
                                value: toWei(Number(ETHValue)),
                                gas: Number(estimatedGas) + 1000000
                            });
                            dispatch(loadBalanceData(window.web));
                            setETHValue('');
                        }}>Submit</Button>
                    </Space.Compact>
                </div>

                <div style={{ width: '48%' }}>
                    <div style={{ margin: "10px" }} >向ETH交易所提取钱</div>
                    <Space.Compact style={{ width: '100%' }}>
                        <Input placeholder="提取金额" value={withdrawETHValue}
                            onChange={(e) => setwithdrawETHValue(e.target.value)} />
                        <Button type="primary" onClick={async () => {
                            const { token, exchange, account } = window.web;

                            const estimatedGas = await exchange.methods.withdrawEther(toWei(Number(withdrawETHValue))).estimateGas({ from: account });
                            // console.log(token._address);

                            await exchange.methods.withdrawEther(toWei(Number(withdrawETHValue))).send({
                                from: account,
                                gas: Number(estimatedGas) + 1000000
                            });
                            dispatch(loadBalanceData(window.web));
                            setwithdrawETHValue('');
                        }}>Submit</Button>
                    </Space.Compact>
                </div>
            </div>
            {/* <Button type="primary">aaa</Button>
            <h3>钱包中ETH：{convert(EtherWallet)}</h3>
            <h3>钱包中KWT：{convert(TokenWallet)}</h3>
            <h3>交易所中ETH：{convert(EtherExchange)}</h3>
            <h3>交易所中KWT：{convert(TokenExchange)}</h3> */}
        </div>
    )
}