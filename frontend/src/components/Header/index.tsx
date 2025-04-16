import { Link } from 'react-router-dom'
import './styles.css'

function Header() {
    return(
        <header>
            <h2>Pollastro Notas de Serviço</h2>
            <div>
                <Link to='/'>Home</Link>
                <Link to='/Clientes'>Clientes</Link>
                <Link to='/Produtos'>Produtos</Link>
                <Link to='/Notas'>Notas de Serviço</Link>
            </div>
        </header>
    )
}

export default Header