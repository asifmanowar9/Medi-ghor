import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from '@redux-devtools/extension';
import {
  productListReducer,
  productDetailsReducer,
  productDeleteReducer,
  productCreateReducer,
  productUpdateReducer,
  productReviewCreateReducer,
  productTopRatedReducer,
} from './reducers/productReducers';
import { cartReducer } from './reducers/cartReducers';
import {
  userLoginReducer,
  userRegisterReducer,
  userDetailsReducer,
  userUpdateProfileReducer,
  userListReducer,
  userDeleteReducer,
  userUpdateReducer,
} from './reducers/userReducers';
import {
  orderCreateReducer,
  orderDetailsReducer,
  orderPayReducer,
  orderListMyReducer,
  orderListReducer,
  orderDeliverReducer,
} from './reducers/orderReducer';
import {
  chatCreateReducer,
  chatListReducer,
  chatDetailsReducer,
  chatMessageAddReducer,
  chatImageAnalyzeReducer,
  aiResponseWaitingReducer,
} from './reducers/chatReducers';

const reducer = combineReducers({
  productList: productListReducer,
  productDetails: productDetailsReducer,
  productDelete: productDeleteReducer,
  productCreate: productCreateReducer,
  productUpdate: productUpdateReducer,
  productReviewCreate: productReviewCreateReducer,
  productTopRated: productTopRatedReducer,
  cart: cartReducer,
  userLogin: userLoginReducer,
  userRegister: userRegisterReducer,
  userDetails: userDetailsReducer,
  userUpdateProfile: userUpdateProfileReducer,
  userDelete: userDeleteReducer,
  userUpdate: userUpdateReducer,
  userList: userListReducer,
  orderCreate: orderCreateReducer,
  orderDetails: orderDetailsReducer,
  orderPay: orderPayReducer,
  orderListMy: orderListMyReducer,
  orderList: orderListReducer,
  orderDeliver: orderDeliverReducer,
  chatCreate: chatCreateReducer,
  chatList: chatListReducer,
  chatDetails: chatDetailsReducer,
  chatMessageAdd: chatMessageAddReducer,
  chatImageAnalyze: chatImageAnalyzeReducer,
  aiResponseWaiting: aiResponseWaitingReducer,
});

// const cartItemsFromStorage = localStorage.getItem('cartItems')
//   ? JSON.parse(localStorage.getItem('cartItems'))
//   : [];

const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

// const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
//   ? JSON.parse(localStorage.getItem('shippingAddress'))
//   : {};

// const paymentMethodFromStorage = localStorage.getItem('paymentMethod')
//   ? JSON.parse(localStorage.getItem('paymentMethod'))
//   : '';

// Get user-specific cart data
const getUserSpecificCartData = (userInfo) => {
  const userId = userInfo ? userInfo._id : 'guest';

  const cartItems = localStorage.getItem(`cartItems_${userId}`)
    ? JSON.parse(localStorage.getItem(`cartItems_${userId}`))
    : [];

  const shippingAddress = localStorage.getItem(`shippingAddress_${userId}`)
    ? JSON.parse(localStorage.getItem(`shippingAddress_${userId}`))
    : {};

  const paymentMethod = localStorage.getItem(`paymentMethod_${userId}`)
    ? JSON.parse(localStorage.getItem(`paymentMethod_${userId}`))
    : '';

  return { cartItems, shippingAddress, paymentMethod };
};

const { cartItems, shippingAddress, paymentMethod } =
  getUserSpecificCartData(userInfoFromStorage);

const initialState = {
  cart: {
    cartItems: cartItems,
    shippingAddress: shippingAddress,
    paymentMethod: paymentMethod,
  },
  userLogin: { userInfo: userInfoFromStorage },
};

const middleware = [thunk];

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
