import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const orderSlice = createSlice({
    name: "order",
    initialState: {
        //取消订单列表
        CancelOrders: [],
        //成交订单列表
        FillOrders: [],
        //所有订单列表
        AllOrders: []
    },
    reducers: {
        setCancelOrders: (state, action) => {
            state.CancelOrders = action.payload;
        },
        setFillOrders(state, action) {
            state.FillOrders = action.payload;
        },
        setAllOrders(state, action) {
            state.AllOrders = action.payload;
        }

    }
})

//导出，供其他文件使用
export const { setCancelOrders, setFillOrders, setAllOrders } = orderSlice.actions;
//让store直接引用
export default orderSlice.reducer;

//balanceSlice.actions.

export const loadCancelOrderData = createAsyncThunk(
    "order/fetchCancelOrderData",
    async (data, { dispatch }) => {
        const { exchange } = data;
        // console.log(await exchange.methods.orders(1).call());

        // console.log(exchange.getPastEvents);

        //获取所有取消订单的区块 
        const result = await exchange.getPastEvents("Cancel", {
            fromBlock: 0,
            toBlock: "latest",
        })
        const cancelOrders = result.map(item => item.returnValues)
        // console.log(result.map(item => item.returnValues));

        dispatch(setCancelOrders(cancelOrders));
        // console.log(cancelOrders);

    }
)

export const loadAllOrderData = createAsyncThunk(
    "order/fetchAllOrderData",
    async (data, { dispatch }) => {
        const { exchange } = data;
        // console.log(await exchange.methods.orders(1).call());

        const result = await exchange.getPastEvents("Order", {
            fromBlock: 0,
            toBlock: "latest",
        })
        const allOrders = result.map(item => item.returnValues)
        // console.log(allOrders);

        dispatch(setAllOrders(allOrders));
    }
)

export const loadFillOrderData = createAsyncThunk(
    "order/fetchAllOrderData",
    async (data, { dispatch }) => {
        const { exchange } = data;
        // console.log(await exchange.methods.orders(1).call());

        const result = await exchange.getPastEvents("Trade", {
            fromBlock: 0,
            toBlock: "latest",
        })
        const fillOrders = result.map(item => item.returnValues)
        // console.log(fillOrders);

        dispatch(setFillOrders(fillOrders));
    }
)