import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUserCart } from '../actions/cartActions';

export const useCartAuth = () => {
  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // Load user-specific cart on initial component mount
  useEffect(() => {
    if (userInfo) {
      dispatch(loadUserCart());
    }
  }, [dispatch, userInfo]);

  return userInfo;
};
