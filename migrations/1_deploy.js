const Contracts = artifacts.require("StudentStorage.sol");

module.exports = function (deployer) {
    deployer.deploy(Contracts);
}