import { createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
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
  chatDeleteReducer,
  chatUpdateReducer,
  aiResponseWaitingReducer,
} from './reducers/chatReducers';
import {
  bannerListReducer,
  bannerAdminListReducer,
  bannerDetailsReducer,
  bannerCreateReducer,
  bannerUpdateReducer,
  bannerDeleteReducer,
} from './reducers/bannerReducers';
import {
  categoryListReducer,
  categoryCreateReducer,
} from './reducers/categoryReducers';
import { brandListReducer } from './reducers/brandReducers';
import { healthConditionListReducer } from './reducers/healthConditionReducers';
import { wishlistReducer } from './reducers/wishlistReducers';
import {
  prescriptionListReducer,
  prescriptionDetailsReducer,
  prescriptionCreateReducer,
  prescriptionUpdateReducer,
  prescriptionDeleteReducer,
  prescriptionUploadReducer,
} from './reducers/prescriptionReducers';

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
  chatDelete: chatDeleteReducer,
  chatUpdate: chatUpdateReducer,
  aiResponseWaiting: aiResponseWaitingReducer,
  bannerList: bannerListReducer,
  bannerAdminList: bannerAdminListReducer,
  bannerDetails: bannerDetailsReducer,
  bannerCreate: bannerCreateReducer,
  bannerUpdate: bannerUpdateReducer,
  bannerDelete: bannerDeleteReducer,
  categoryList: categoryListReducer,
  categoryCreate: categoryCreateReducer,
  brandList: brandListReducer,
  healthConditionList: healthConditionListReducer,
  wishlist: wishlistReducer,
  prescriptionList: prescriptionListReducer,
  prescriptionDetails: prescriptionDetailsReducer,
  prescriptionCreate: prescriptionCreateReducer,
  prescriptionUpdate: prescriptionUpdateReducer,
  prescriptionDelete: prescriptionDeleteReducer,
  prescriptionUpload: prescriptionUploadReducer,
});

// const cartItemsFromStorage = localStorage.getItem('cartItems')
//   ? JSON.parse(localStorage.getItem('cartItems'))
//   : [];

let userInfoFromStorage = null;
try {
  const userInfoData = localStorage.getItem('userInfo');
  userInfoFromStorage =
    userInfoData && userInfoData !== 'undefined'
      ? JSON.parse(userInfoData)
      : null;
} catch (error) {
  console.error('Error parsing userInfo:', error);
  userInfoFromStorage = null;
}

// const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
//   ? JSON.parse(localStorage.getItem('shippingAddress'))
//   : {};

// const paymentMethodFromStorage = localStorage.getItem('paymentMethod')
//   ? JSON.parse(localStorage.getItem('paymentMethod'))
//   : '';

// Get user-specific cart data
const getUserSpecificCartData = (userInfo) => {
  const userId = userInfo ? userInfo._id : 'guest';

  let cartItems = [];
  let shippingAddress = {};
  let paymentMethod = '';
  let wishlistItems = [];

  try {
    const cartItemsData = localStorage.getItem(`cartItems_${userId}`);
    cartItems =
      cartItemsData && cartItemsData !== 'undefined'
        ? JSON.parse(cartItemsData)
        : [];
  } catch (error) {
    console.error('Error parsing cartItems:', error);
    cartItems = [];
  }

  try {
    const shippingAddressData = localStorage.getItem(
      `shippingAddress_${userId}`
    );
    shippingAddress =
      shippingAddressData && shippingAddressData !== 'undefined'
        ? JSON.parse(shippingAddressData)
        : {};
  } catch (error) {
    console.error('Error parsing shippingAddress:', error);
    shippingAddress = {};
  }

  try {
    const paymentMethodData = localStorage.getItem(`paymentMethod_${userId}`);
    paymentMethod =
      paymentMethodData && paymentMethodData !== 'undefined'
        ? JSON.parse(paymentMethodData)
        : '';
  } catch (error) {
    console.error('Error parsing paymentMethod:', error);
    paymentMethod = '';
  }

  try {
    const wishlistItemsData = localStorage.getItem(`wishlistItems_${userId}`);
    wishlistItems =
      wishlistItemsData && wishlistItemsData !== 'undefined'
        ? JSON.parse(wishlistItemsData)
        : [];
  } catch (error) {
    console.error('Error parsing wishlistItems:', error);
    wishlistItems = [];
  }

  return { cartItems, shippingAddress, paymentMethod, wishlistItems };
};

const { cartItems, shippingAddress, paymentMethod, wishlistItems } =
  getUserSpecificCartData(userInfoFromStorage);

const initialState = {
  cart: {
    cartItems: cartItems,
    shippingAddress: shippingAddress,
    paymentMethod: paymentMethod,
  },
  wishlist: {
    wishlistItems: wishlistItems,
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
