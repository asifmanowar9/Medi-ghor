import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import RootLayout from './components/RootLayout';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatScreen from './screens/ChatScreen';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index element={<HomeScreen />} />
      <Route path='/order/:id' element={<OrderScreen />} />
      <Route path='/placeorder' element={<PlaceOrderScreen />} />
      <Route path='/payment' element={<PaymentScreen />} />
      <Route path='/shipping' element={<ShippingScreen />} />
      <Route path='/profile' element={<ProfileScreen />} />
      <Route path='/register' element={<RegisterScreen />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route path='/product/:id' element={<ProductScreen />} />
      <Route path='/cart' element={<CartScreen />} />
      <Route path='/cart/:id' element={<CartScreen />} />
      <Route path='/admin/userlist' element={<UserListScreen />} />
      <Route path='/admin/user/:userId/edit' element={<UserEditScreen />} />
      <Route path='/admin/productlist' element={<ProductListScreen />} />
      <Route
        path='/admin/productlist/:pageNumber'
        element={<ProductListScreen />}
      />
      <Route
        path='/admin/productlist/:keyword/page/:pageNumber'
        element={<ProductListScreen />}
      />
      <Route
        path='/admin/product/:productId/edit'
        element={<ProductEditScreen />}
      />
      <Route path='/admin/orderlist' element={<OrderListScreen />} />
      <Route path='/search/:keyword' element={<HomeScreen />} />
      <Route path='/page/:pageNumber' element={<HomeScreen />} />
      <Route
        path='/search/:keyword/page/:pageNumber'
        element={<HomeScreen />}
      />
      <Route path='/chats' element={<ChatListScreen />} />
      <Route path='/chat/:id' element={<ChatScreen />} />
    </Route>
  )
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
