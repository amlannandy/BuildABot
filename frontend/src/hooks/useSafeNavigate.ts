import { useNavigate as useReactRouterNavigate } from 'react-router-dom';

interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

const useSafeNavigate = () => {
  const navigate = useReactRouterNavigate();

  const safeNavigate = (to: string, options: NavigateOptions = {}) => {
    void navigate(to, { replace: options.replace ?? false, state: options.state });
  };

  const openInNewTab = (to: string) => {
    window.open(to, '_blank', 'noopener,noreferrer');
  };

  const goBack = () => {
    void navigate(-1);
  };

  const goForward = () => {
    void navigate(1);
  };

  return { safeNavigate, openInNewTab, goBack, goForward };
};

export default useSafeNavigate;
