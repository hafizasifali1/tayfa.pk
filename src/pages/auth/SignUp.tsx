import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '../../context/AuthModalContext';
import { useAuth } from '../../context/AuthContext';

/**
 * SignUp page — redirects to home and opens the Auth Modal on the Sign Up tab.
 * All actual form logic lives inside AuthModal > SignUpForm.
 * Keeps the /signup route working (e.g. external links, bookmarks).
 */
const SignUp = () => {
  const { openModal } = useAuthModal();
  const { user, isAuthReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthReady) {
      if (user) {
        // Already logged in — redirect directly
        navigate('/', { replace: true });
      } else {
        // Not logged in — go home and open modal on Sign Up tab
        navigate('/', { replace: true });
        openModal('signup');
      }
    }
  }, [isAuthReady, user, navigate, openModal]);

  return null;
};

export default SignUp;
