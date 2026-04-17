import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '../../context/AuthModalContext';
import { useAuth } from '../../context/AuthContext';

/**
 * SellerRegister page — redirects to home and opens the Auth Modal on the Seller tab.
 * All actual form logic lives inside AuthModal > SellerForm.
 * Keeps the /seller/register route working (e.g. external links, bookmarks).
 */
const SellerRegister = () => {
  const { openModal } = useAuthModal();
  const { user, isAuthReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthReady) {
      if (user) {
        // Already logged in — redirect to seller dashboard
        navigate('/seller/dashboard', { replace: true });
      } else {
        // Not logged in — go home and open modal on Seller tab
        navigate('/', { replace: true });
        openModal('seller');
      }
    }
  }, [isAuthReady, user, navigate, openModal]);

  return null;
};

export default SellerRegister;
