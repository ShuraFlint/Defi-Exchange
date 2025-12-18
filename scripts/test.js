const Contracts = artifacts.require("StudentStorage.sol");

module.exports = async function (callback) {
    // console.log(111);

    const studentStorage = await Contracts.deployed();

    await studentStorage.setData("kerwin", 100)

    let res = await studentStorage.getData()

    console.log(res);

    console.log(await studentStorage.name());
    console.log(await studentStorage.age());

    callback();

}

var list = []

list.push({
    name: "kerwin",
    age: 100
})