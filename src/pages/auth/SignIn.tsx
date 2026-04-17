import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '../../context/AuthModalContext';
import { useAuth } from '../../context/AuthContext';

/**
 * SignIn page — redirects to home and opens the Auth Modal.
 * All actual form logic lives inside AuthModal > SignInForm.
 * Keeps the /signin route working (e.g. external links, bookmarks).
 */
const SignIn = () => {
  const { openModal } = useAuthModal();
  const { user, isAuthReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthReady) {
      if (user) {
        // Already logged in — redirect directly
        if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
        else if (user.role === 'seller') navigate('/seller/dashboard', { replace: true });
        else navigate('/', { replace: true });
      } else {
        // Not logged in — go home and open modal
        navigate('/', { replace: true });
        openModal('signin');
      }
    }
  }, [isAuthReady, user, navigate, openModal]);

  return null;
};

export default SignIn;
