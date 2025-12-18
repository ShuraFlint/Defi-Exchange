const KerwinToken = artifacts.require("KerwinToken.sol");

const fromWei = (bn) => {
    return web3.utils.fromWei(bn, 'ether');
}

const toWei = (number) => {
    return web3.utils.toWei(number.toString(), 'ether');
}

module.exports = async function (callback) {
    const kerwintoken = await KerwinToken.deployed();
    let res1 = await kerwintoken.balanceOf("0xe516ef9485bE34121c639108846aD61f35c27532");
    console.log("第一个账号值：", fromWei(res1));

    await kerwintoken.transfer("0xe5BFCA1DB21E8A22aF91dc4df2b0B81096124110", toWei(10000), {
        from: "0xe516ef9485bE34121c639108846aD61f35c27532"
    })

    let res2 = await kerwintoken.balanceOf("0xe516ef9485bE34121c639108846aD61f35c27532");
    console.log("第一个账号值：", fromWei(res2));

    let res3 = await kerwintoken.balanceOf("0xe5BFCA1DB21E8A22aF91dc4df2b0B81096124110");
    console.log("第二个账号值：", fromWei(res3));

    callback();
}