// SPDX-License-Identifier: CPL-3.0
//源码遵循协议，MIT...
pragma solidity >=0.4.16 <0.9.0;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./KerwinToken.sol";

contract Exchange {
    using SafeMath for uint256;

    //收费账号地址 部署者指定的账号
    address public feeAccount;
    uint256 public feePercent; //费率，单位：1/10000，即0.01%
    address constant ETHER = address(0);

    //代币名 -》代币钱包地址-》存的钱数量
    //这相当于交易所的数据库，一个币名对应多个地址的钱，每个地址的钱数量是不一样的
    //比特币地址-》A用户：10；B用户：20；C用户：30
    //以太币地址-》A用户：10；B用户：20；C用户：30
    //KWT地址-》A用户：10；B用户：20；C用户：30
    mapping(address => mapping(address => uint256)) public tokens;

    mapping(uint256 => bool) public orderCannel; //订单是否取消 0-未取消 1-已取消
    mapping(uint256 => bool) public orderFill;

    //订单结构体
    struct _Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    // _Order[] orderList;

    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event WithDraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    //创建订单事件
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    //取消订单事件
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    //填充订单事件
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    //存入以太币
    function depositEther() public payable {
        //msg.sender
        //msg.value
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    //存入其他货币
    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        //从你的账号相交易所账号转钱
        require(
            //把 msg.sender 账户中 _token 类型的代币，转出 _amount 数量，发送给当前合约地址 address(this)
            KerwinToken(_token).transferFrom(msg.sender, address(this), _amount)
        );
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    //取出以太币
    function withdrawEther(uint256 _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount, "Not enough balance");
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        //从当前合约转账给你msg.sender
        payable(msg.sender).transfer(_amount);
        emit WithDraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    //提取KWT
    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount, "Not enough balance");

        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);

        //transfer(to, value)
        require(KerwinToken(_token).transfer(msg.sender, _amount));

        emit WithDraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    //查询余额
    function balanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return tokens[_token][_user];
    }

    //创建订单
    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        require(
            balanceOf(_tokenGive, msg.sender) >= _amountGive,
            "Not enough balance"
        );

        orderCount = orderCount.add(1);

        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );

        //发出订单
        emit Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }

    //取消订单
    function cancelOrder(uint256 _id) public {
        _Order memory myorder = orders[_id];
        require(myorder.id == _id);
        //id->bool 数组
        //mapping(uint256 => bool) public orderCannel; //订单是否取消 0-未取消 1-已取消
        orderCannel[_id] = true;

        emit Cancel(
            myorder.id,
            msg.sender,
            myorder.tokenGet,
            myorder.amountGet,
            myorder.tokenGive,
            myorder.amountGive,
            block.timestamp
        );
    }
    //填充订单
    function fillOrder(uint256 _id) public {
        _Order memory myorder = orders[_id];
        require(myorder.id != 0, "order not exist");
        require(myorder.id == _id, "order ID does not match");
        require(!orderFill[_id], "order already filled");

        //账户余额 互换 小费收取
        uint256 feeAmount = myorder.amountGet.mul(feePercent).div(100);

        //卖家的以太币够不够
        require(
            balanceOf(myorder.tokenGive, myorder.user) >= myorder.amountGive,
            "create order Not enough balance"
        );

        //买家的KWT够不够
        require(
            balanceOf(myorder.tokenGet, msg.sender) >=
                myorder.amountGet.add(feeAmount),
            "pay order Not enough KWT balance"
        );

        require(feeAccount != address(0), "feeAccount not set");
        //向手续费地址中添加手续费
        tokens[myorder.tokenGet][feeAccount] = tokens[myorder.tokenGet][
            feeAccount
        ].add(feeAmount);

        //买家 减少KWT余额 + 手续费
        tokens[myorder.tokenGet][msg.sender] = tokens[myorder.tokenGet][
            msg.sender
        ].sub(myorder.amountGet.add(feeAmount));

        //买家 增加ETH余额
        tokens[myorder.tokenGive][msg.sender] = tokens[myorder.tokenGive][
            msg.sender
        ].add(myorder.amountGive);

        //卖家 增加KWT余额
        tokens[myorder.tokenGet][myorder.user] = tokens[myorder.tokenGet][
            myorder.user
        ].add(myorder.amountGet);

        //卖家 减少ETH余额
        tokens[myorder.tokenGive][myorder.user] = tokens[myorder.tokenGive][
            myorder.user
        ].sub(myorder.amountGive);

        //订单完成
        orderFill[_id] = true;

        emit Trade(
            myorder.id,
            //订单的创建人不是msg.sender,而是myorder.user
            myorder.user,
            myorder.tokenGet,
            myorder.amountGet,
            myorder.tokenGive,
            myorder.amountGive,
            block.timestamp
        );
    }
}
