const Contracts = artifacts.require("StudentListStorage.sol");

module.exports = async function (callback) {
    // console.log(111);

    const studentStorage = await Contracts.deployed();

    await studentStorage.addList("kerwin", 100)

    let res = await studentStorage.getList()

    console.log(res);
    console.log(await studentStorage.studentList(1));

    callback();

}