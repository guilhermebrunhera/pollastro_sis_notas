import { useLocation, NavLink } from 'react-router-dom'
import './styles.css'

function Header() {
    const localAtivo = useLocation();

    return(
        <header>
            <h2>Pollastro Notas de Serviço</h2>
            <div>
                <NavLink style={() => ({
                    color: localAtivo.pathname === "/" ? "gray" : "white",
                    cursor: localAtivo.pathname === "/" ? "default" : "pointer",
                    textDecoration: localAtivo.pathname === "/" ? "none" : ""
                })} to='/'>Home</NavLink>
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
                <NavLink style={() => ({
                    color: localAtivo.pathname === "/Notas" ? "gray" : "white",
                    cursor: localAtivo.pathname === "/Notas" ? "default" : "pointer",
                    textDecoration: localAtivo.pathname === "/Notas" ? "none" : ""
                })} to='/Notas'>Notas de Serviço</NavLink>
            </div>
        </header>
    )
}

export default Header