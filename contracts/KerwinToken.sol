// SPDX-License-Identifier: CPL-3.0
//源码遵循协议，MIT...
pragma solidity >=0.4.16 <0.9.0;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract KerwinToken {
    using SafeMath for uint256;
    //代币名称
    string public name = "KerwinToken";
    //代币符号 ETHasda
    string public symbol = "KWT";
    //1KerwinToken = 10^18 decimals
    uint256 public decimals = 18;
    //总发行量
    uint256 public totalSupply;
    //自动生成getter方法  通过一个地址就能直到该地址的余额，代币所有账号的总管理
    mapping(address => uint256) public balanceOf;

    //wo ->a 100, b 200, c 300 交易所所有账户的总管理
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() {
        totalSupply = 1000000 * (10 ** decimals); //一百万个KWT
        balanceOf[msg.sender] = totalSupply; //所有者账户地址，初始分配1000000个KWT
    }

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    //转账
    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_to != address(0), "Invalid address");
        _tranfer(msg.sender, _to, _value);
        return true;
    }

    function _tranfer(address _from, address _to, uint256 _value) internal {
        require(balanceOf[_from] >= _value, "Insufficient balance");
        //从哪个账号发起的调用者 msg.sender
        //早期的版本吧0.8.0以前，如果直接使用“-”，如果比from大会报错
        //如果使用_value会自动检查错误并抛出
        balanceOf[_from] = balanceOf[_from].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);

        //触发事件
        emit Transfer(_from, _to, _value);
    }

    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        //msg.sender 代表调用者地址，我要授权给别人
        //_spender 第三方交易所地址，授权的接受方
        //_value 授权金额
        require(_spender != address(0), "Invalid address");
        //这里只是在交易所中记录一下，并没有真正转账
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    //授权给交易所调用
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        //_from 放款账号 购买人的账号
        //_to 收款账号 收款人的账号
        //_value 转账金额
        //msg.sender 代表交易所地址 购买人让在我这个交易所的账户里的钱
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Insufficient balance");

        allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
        _tranfer(_from, _to, _value);
        return true;
    }
}
