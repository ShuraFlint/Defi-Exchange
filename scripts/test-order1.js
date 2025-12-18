const KerwinToken = artifacts.require("KerwinToken.sol");
const Exchange = artifacts.require("Exchange.sol");
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

const fromWei = (bn) => {
    return web3.utils.fromWei(bn, 'ether');
}

const toWei = (number) => {
    return web3.utils.toWei(number.toString(), 'ether');
}

const wait = (seconds) => {
    const milliseconds = seconds * 500;
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}


module.exports = async function (callback) {
    try {
        const kerwintoken = await KerwinToken.deployed();
        const exchange = await Exchange.deployed();
        const accounts = await web3.eth.getAccounts();

        //创建订单
        for (let i = 1; i <= 3; i++) {
            await exchange.makeOrder(kerwintoken.address, toWei(100 + i), ETHER_ADDRESS, toWei(i / 1000), { from: accounts[0] });
            console.log(`account[0] 创建第${i}个订单`);
            await wait(3);
        }

        for (let i = 1; i <= 3; i++) {
            await exchange.makeOrder(kerwintoken.address, toWei(200 + i), ETHER_ADDRESS, toWei(i / 100), { from: accounts[1] });
            console.log(`account[1] 创建第${i}个订单`);
            await wait(3);
        }


    } catch (error) {
        console.log(error);
    }
    // console.log("account[2]-在交易所的以太币：", fromWei(await exchange.tokens(kerwintoken.address, accounts[2])));

    callback();
}