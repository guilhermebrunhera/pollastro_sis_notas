import { FaUserCircle } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import './styles.css';

const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !(menuRef.current as any).contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-menu" ref={menuRef}>
      <FaUserCircle size={25} className="user-icon" onClick={() => setOpen(!open)} />
      {open && (
        <div className="dropdown">
            <div className='userNameDiv'><span className='first'>Bem vindo, {localStorage.getItem(`userName`)}</span></div>
            <div className='line'></div>
            {/* <Link to="/perfil">Perfil</Link> */}
            <button onClick={handleLogout}>Sair</button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;