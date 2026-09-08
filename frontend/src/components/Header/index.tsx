import { useLocation, NavLink } from 'react-router-dom'
import './styles.css'
import imgLogo from '../../assets/pollastro_logo.png'
import UserMenu from './UserMenu';
import { FaBell } from 'react-icons/fa';
import { getBoletosParaVencer } from '../../services/APIService';
import { useState } from 'react';

function Header() {
    const localAtivo = useLocation();
    const [quantidadeBoletos, setQuantidadeBoletos] = useState(0);

    getBoletosParaVencer().then((boletos) => {
        setQuantidadeBoletos(boletos.length);
    });

    return(
        <header>
            <div>
                <img src={imgLogo}></img>
                <h2>Pollastro Metalurgia</h2>
            </div>
            <div>
                

                <NavLink style={() => ({
                    color: localAtivo.pathname === "/Home" ? "gray" : "white",
                    cursor: localAtivo.pathname === "/Home" ? "default" : "pointer",
                    textDecoration: localAtivo.pathname === "/Home" ? "none" : ""
                })} to='/Home'>Home</NavLink>
                
                <NavLink style={() => ({
                    color: localAtivo.pathname === "/Notas" ? "gray" : "white",
                    cursor: localAtivo.pathname === "/Notas" ? "default" : "pointer",
                    textDecoration: localAtivo.pathname === "/Notas" ? "none" : ""
                })} to='/Notas'>Pedidos</NavLink>

                <NavLink style={() => ({
                    color: localAtivo.pathname === "/Clientes" ? "gray" : "white",
                    cursor: localAtivo.pathname === "/Clientes" ? "default" : "pointer",
                    textDecoration: localAtivo.pathname === "/Clientes" ? "none" : ""
                })} to='/Clientes'>Clientes</NavLink>

                <NavLink style={() => ({
                    color: localAtivo.pathname === "/Produtos" ? "gray" : "white",
                    cursor: localAtivo.pathname === "/Produtos" ? "default" : "pointer",
                    textDecoration: localAtivo.pathname === "/Produtos" ? "none" : ""
                })} to='/Produtos'>Produtos</NavLink>
{/*                 
                <NavLink style={() => ({
                    color: localAtivo.pathname === "/Acompanhamentos" ? "gray" : "white",
                    cursor: localAtivo.pathname === "/Acompanhamentos" ? "default" : "pointer",
                    textDecoration: localAtivo.pathname === "/Acompanhamentos" ? "none" : ""
                })} to='/Acompanhamentos'>Acompanhamentos</NavLink> */}

                <NavLink
                    className="notificacao-link"
                    to={{
                        pathname: '/Home',
                        search: '?aba=boletos'
                    }}
                    title={`${quantidadeBoletos} boleto(s) próximo(s) do vencimento`}
                    >
                    <FaBell size={22} />

                    {quantidadeBoletos > 0 && (
                        <span className="notificacao-quantidade">
                        {quantidadeBoletos > 99 ? '99+' : quantidadeBoletos}
                        </span>
                    )}
                </NavLink>

                <UserMenu />
            </div>
        </header>
    )
}

export default Header