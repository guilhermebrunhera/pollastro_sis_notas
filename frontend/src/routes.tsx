import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Clientes from './pages/Clientes'
import Produtos from './pages/Produtos'
import Notas from './pages/Notas'

function MainRoutes() {
    return(
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/Clientes' element={<Clientes />} />
            <Route path='/Produtos' element={<Produtos />} />
            <Route path='/Notas' element={<Notas />} />
        </Routes>
    )
}

export default MainRoutes