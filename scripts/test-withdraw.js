const KerwinToken = artifacts.require("KerwinToken.sol");
const Exchange = artifacts.require("Exchange.sol");
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

//将wei转换为以太币为单位的数值
const fromWei = (bn) => {
    return web3.utils.fromWei(bn, 'ether');
}

//将以太币为单位的数值转换为wei
const toWei = (number) => {
    return web3.utils.toWei(number.toString(), 'ether');
}

module.exports = async function (callback) {
    const kerwintoken = await KerwinToken.deployed();
    const exchange = await Exchange.deployed();
    const accounts = await web3.eth.getAccounts();

    // await exchange.withdrawEther(toWei(5), {
    //     from: accounts[0]
    // })
    // let res = await exchange.tokens(ETHER_ADDRESS, accounts[0]);
    // console.log(fromWei(res));

    //授权
    // await kerwintoken.approve(exchange.address, toWei(100000), {
    //     from: accounts[0]
    // })

    await exchange.withdrawToken(kerwintoken.address, toWei(50000), {
        from: accounts[0]
    })
    //0x62Fd52Dd8EF907f12F9f86aBca83111e3266C6a3
    let res = await exchange.tokens(kerwintoken.address, accounts[0]);
    console.log(fromWei(res));

    callback();
}