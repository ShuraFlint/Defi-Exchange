// SPDX-License-Identifier: CPL-3.0
//源码遵循协议，MIT...
pragma solidity >=0.4.16 <0.9.0;

contract StudentStorage {
    uint public age;
    string public name;

    //memory 可修改 calldata 不可修改 storage 长久存储，消耗gas最高
    function setData(string memory _name, uint _age) public {
        name = _name;
        age = _age;
    }

    // function test(uint x,uint y) public pure returns(uint){
    //     return x+y;
    // }

    //view 只访问不可修改数据，只读  pure 纯函数，不访问，不修改
    function getData() public view returns (string memory, uint) {
        return (name, age);
    }
}
