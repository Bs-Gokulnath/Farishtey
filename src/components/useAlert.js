import { useState, useCallback } from 'react';

const useAlert = () => {
  const [alert, setAlert] = useState({
    isVisible: false,
    message: '',
    type: 'info',
    duration: 4000,
    position: 'center'
  });

  const showAlert = useCallback((message, type = 'info', duration = 4000, position = 'center') => {
    setAlert({
      isVisible: true,
      message,
      type,
      duration,
      position
    });
  }, []);

  const showSuccess = useCallback((message, duration = 4000, position = 'center') => {
    showAlert(message, 'success', duration, position);
  }, [showAlert]);

  const showError = useCallback((message, duration = 4000, position = 'center') => {
    showAlert(message, 'error', duration, position);
  }, [showAlert]);

  const showWarning = useCallback((message, duration = 4000, position = 'center') => {
    showAlert(message, 'warning', duration, position);
  }, [showAlert]);

  const showInfo = useCallback((message, duration = 4000, position = 'center') => {
    showAlert(message, 'info', duration, position);
  }, [showAlert]);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, isVisible: false }));
  }, []);

  return {
    alert,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert
  };
};

export default useAlert;
