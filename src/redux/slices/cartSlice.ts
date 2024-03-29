import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from 'js-cookie';

interface CartItem {
    
    cart_item_id: number;
    userid: string;
    id: string;
    name: string;
    image: string;
    price: number;
    qty: number;
}

interface CartState {
    loading: boolean;
    cartItems: CartItem[];
    user_id: string
    itemsPrice: string; 
    shippingPrice: string;
    taxPrice: string;
    totalPrice: string;
    payment_id: string;
    payment_intent: string;
    showSideBar: boolean;
    shippingAddress: object;
}

const storedCart = null

const initialState: CartState = storedCart
    ? {...JSON.parse(storedCart), 
    loading: true,
    showSidebar: false }
    : {
    loading: true,
    cartItems: [],
    user_id: '',
    itemsPrice: '0.00',
    shippingPrice: '0.00',
    taxPrice: '0.00',
    totalPrice: '0.00',
    payment_id: '',
    payment_intent:'',
    shippingAddress: {},
};

const addDecimals = (num: number): string => {
    return (Math.round(num * 100) / 100).toFixed(2);
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addPaymentIntent: (state, action: PayloadAction<string>)=>{
            state.payment_intent = action.payload
        },
        addClientSecret: (state, action: PayloadAction<string>)=>{
            state.payment_id = action.payload;
        },
        addUserID: (state, action: PayloadAction<string>)=>{
            state.user_id = action.payload
        }
        ,
        saveShippingAddress: (state, action: PayloadAction<object>)=>{
            state.shippingAddress = action.payload
        },
        hideLoading: (state) => {
            state.loading = false;
        },
        savePaymentId: (state, action: PayloadAction<string>)=>{
            state.payment_id = action.payload
        },
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x.id === item.id);
            if (existItem) {
                state.cartItems = state.cartItems.map((x) =>
                    x.id === existItem.id ? item : x
                );
            } else {
                state.cartItems = [...state.cartItems, item];
            }
            state.itemsPrice = addDecimals(
                state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
            );
            state.shippingPrice = addDecimals(Number(state.itemsPrice) > 100 ? 0 : 100);
            state.taxPrice = addDecimals(
                Number((0.15 * parseFloat(state.itemsPrice)))
            );
            state.totalPrice = (
                Number(state.itemsPrice) +
                Number(state.shippingPrice) +
                Number(state.taxPrice)
            ).toString();
            // Cookies.set('cart', JSON.stringify(state));
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.cartItems = state.cartItems.filter((x) => x.id !== action.payload);
            state.itemsPrice = addDecimals(
                state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
            );
            state.shippingPrice = addDecimals(Number(state.itemsPrice) > 100 ? 0 : 100);
            state.taxPrice = addDecimals(
                Number((0.15 * parseFloat(state.itemsPrice)))
            );
            state.totalPrice = (
                Number(state.itemsPrice) +
                Number(state.shippingPrice) +
                Number(state.taxPrice)
            ).toString();
            // Cookies.set('cart', JSON.stringify(state));
        },
        
    },
});

export const { addToCart, removeFromCart, saveShippingAddress, hideLoading, savePaymentId, addUserID, addClientSecret, addPaymentIntent } = cartSlice.actions;

export const cartReducer = cartSlice.reducer;