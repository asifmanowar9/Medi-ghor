import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import ModernHeader from './components/ModernHeader';
import Footer from './components/Footer';
import './styles/main.css';
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
import BannerListScreen from './screens/BannerListScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatScreen from './screens/ChatScreen';
import AllProducts from './screens/AllProducts';
import WishlistScreen from './screens/WishlistScreen';
import TrackOrderScreen from './screens/TrackOrderScreen';

const App = () => {
  return (
    <Router>
      <ModernHeader />
      <main>
        <div className='main-content'>
          <Routes>
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
            <Route
              path='/admin/user/:userId/edit'
              element={<UserEditScreen />}
            />
            <Route path='/admin/productlist' element={<ProductListScreen />} />
            <Route
              path='/admin/productlist/:pageNumber'
              element={<ProductListScreen />}
            />
            <Route
              path='/admin/productlist/:keyword/page/:pageNumber'
              element={<ProductListScreen />}
            />
            <Route path='/admin/product/new' element={<ProductEditScreen />} />
            <Route
              path='/admin/product/:productId/edit'
              element={<ProductEditScreen />}
            />
            <Route path='/admin/orderlist' element={<OrderListScreen />} />
            <Route path='/admin/bannerlist' element={<BannerListScreen />} />
            <Route path='/search/:keyword' element={<HomeScreen />} />
            <Route path='/page/:pageNumber' element={<HomeScreen />} />
            <Route
              path='/search/:keyword/page/:pageNumber'
              element={<HomeScreen />}
            />
            <Route path='/chats' element={<ChatListScreen />} />
            <Route path='/chat/:id' element={<ChatScreen />} />
            <Route path='/products' element={<AllProducts />} />
            <Route path='/wishlist' element={<WishlistScreen />} />
            <Route path='/track-order' element={<TrackOrderScreen />} />
            <Route path='/track-order/:id' element={<TrackOrderScreen />} />
            <Route path='/category/:categoryName' element={<HomeScreen />} />
            <Route
              path='/category/:categoryName/page/:pageNumber'
              element={<HomeScreen />}
            />
            <Route path='/condition/:conditionName' element={<HomeScreen />} />
            <Route
              path='/condition/:conditionName/page/:pageNumber'
              element={<HomeScreen />}
            />
            <Route path='/brand/:brandName' element={<HomeScreen />} />
            <Route
              path='/brand/:brandName/page/:pageNumber'
              element={<HomeScreen />}
            />
            <Route path='/' element={<HomeScreen />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
