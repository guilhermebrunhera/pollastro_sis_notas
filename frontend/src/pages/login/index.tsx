import React, { useEffect, useRef, useState } from 'react';
import './styles.css';
import imgLogo from '../../assets/pollastro_logo.png'
import { loginSistem } from '../../services/APIService';
import Toast from '../../components/Toasts/toasts';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'Sucesso' | 'Erro' | 'Alerta' | '' } | null>(null);
  const userRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      let isLoggedIn = localStorage.getItem('isLoggedIn') === `true`;

      if(isLoggedIn) window.location.href = '/Home'

      userRef.current?.focus();

    }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    loginSistem(usuario, senha).then(data => {
        console.log(data);
        if(data.autenticado){
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', data.userName);
            window.location.href = '/Home';
        } else {
            setToast({message: "Usuario ou senha incorreta!", type: "Erro"})
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
        }
    })
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <img src={imgLogo} alt="Logo" className="login-logo" />
        <h1>Pollastro Metalurgia</h1>
      </div>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          ref={userRef}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
      {toast && (
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
              />
            )}
    </div>
  );
};

export default Login;