import { useEffect } from 'react';
import './style.css'

type ToastProps = {
  message: string;
  type?: 'Sucesso' | 'Erro' | 'Alerta' | '';
  onClose: () => void;
};

function Toast({ message, type = 'Sucesso', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Toast some após 4 segundos
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      <h5>{type}: </h5>
      <h4>{message}</h4>
    </div>
  );
}

export default Toast;