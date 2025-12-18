// SPDX-License-Identifier: CPL-3.0
//源码遵循协议，MIT...
pragma solidity >=0.4.16 <0.9.0;

contract StudentListStorage {
    struct Student {
        uint id;
        string name;
        uint age;
        address account;
    }

    //动态数组，可以动态添加元素
    Student[] public studentList; //自动getter()

    //memory 可修改 calldata 不可修改 storage 长久存储，消耗gas最高
    function addList(string memory _name, uint _age) public returns (uint) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_age > 0 && _age <= 150, "Invalid age");

        uint index = studentList.length + 1;
        studentList.push(Student(index, _name, _age, msg.sender));
        return studentList.length;
    }

    //view 只访问不可修改数据，只读  pure 纯函数，不访问，不修改
    function getList() public view returns (Student[] memory) {
        Student[] memory list = studentList;
        return list;
    }
}
