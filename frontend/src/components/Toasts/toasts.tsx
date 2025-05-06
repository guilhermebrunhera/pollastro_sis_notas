import { useEffect } from 'react';
import './style.css'

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'warning' | '';
  onClose: () => void;
};

function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Toast some após 3 segundos
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      {message}
    </div>
  );
}

export default Toast;