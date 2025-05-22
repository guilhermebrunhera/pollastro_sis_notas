import { useLocation, NavLink } from 'react-router-dom'
import './styles.css'
import imgLogo from '../../assets/pollastro_logo.png'
import UserMenu from './UserMenu';

function Header() {
    const localAtivo = useLocation();

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
                <UserMenu />
            </div>
        </header>
    )
}

export default Header