const Contracts = artifacts.require("KerwinToken.sol");
const Exchange = artifacts.require("Exchange.sol");

module.exports = async function (deployer) {
    //获得当前区块链上的所有用户
    const accounts = await web3.eth.getAccounts();

    await deployer.deploy(Contracts);
    // await deployer.deploy(Exchange, accounts[0], 10);
    await deployer.deploy(Exchange, accounts[0], 10);
}