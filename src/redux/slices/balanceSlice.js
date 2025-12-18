import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'

const balanceSlice = createSlice({
    name: "balance",
    initialState: {
        TokenWallet: "0", //wei转换需要字符串
        TokenExchange: "0",
        EtherWallet: "0",
        EtherExchange: "0",
    },
    reducers: {
        setTokenWallet: (state, action) => {
            state.TokenWallet = action.payload;
        },
        setTokenExchange: (state, action) => {
            state.TokenExchange = action.payload;
        },
        setEtherWallet: (state, action) => {
            state.EtherWallet = action.payload;
        },
        setEtherExchange: (state, action) => {
            state.EtherExchange = action.payload;
        },

    }
})

//导出 action 创建函数，供 dispatch() 使用
export const { setTokenWallet, setTokenExchange, setEtherWallet, setEtherExchange } = balanceSlice.actions;
//导出 reducer 逻辑，供 store 注册使用
export default balanceSlice.reducer;

//再次导出一个方法，这是一个异步函数
export const loadBalanceData = createAsyncThunk(
    "balance/fetchBalanceData",
    async (data, { dispatch }) => {
        // console.log(data);
        //解构data，为了后面编写代码更方便，不用data.web3，而是可以直接web3
        const { web3,
            account,
            token,
            exchange
        } = data
        // console.log(web3);
        // console.log(account);
        // console.log(token);
        // console.log(exchange);

        //获取钱包的token
        const TokenWallet = await token.methods.balanceOf(account).call()
        // console.log(TokenWallet);
        dispatch(setTokenWallet(TokenWallet))

        //获取交易所的token
        const TokenExchange = await exchange.methods.balanceOf(
            token.options.address, account).call()
        // console.log(TokenExchange);
        dispatch(setTokenExchange(TokenExchange))

        //获取钱包的ether
        const EtherWallet = await web3.eth.getBalance(account)
        // console.log(web3.eth.getBalance);
        // console.log(EtherWallet);
        dispatch(setEtherWallet(EtherWallet))

        // //获取交易所的ether
        const EtherExchange = await exchange.methods.balanceOf(
            ETHER_ADDRESS, account).call()
        // console.log(EtherExchange);
        dispatch(setEtherExchange(EtherExchange));
    }
)