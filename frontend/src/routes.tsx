import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Clientes from './pages/Clientes'
import Produtos from './pages/Produtos'
import Notas from './pages/Notas'
import Acompanhamentos from './pages/Acompanhamentos'
import Login from './pages/login'
import PrivateRoute from './PrivateRoute'

function MainRoutes() {
    return(
        <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/Home' element={
                <PrivateRoute>
                <Home />
                </PrivateRoute>
            } />

            <Route path='/Notas' element={
                <PrivateRoute>
                <Notas />
                </PrivateRoute>
            } />

            <Route path='/Clientes' element={
                <PrivateRoute>
                <Clientes />
                </PrivateRoute>
            } />

            <Route path='/Produtos' element={
                <PrivateRoute>
                <Produtos />
                </PrivateRoute>
            } />

            <Route path='/Acompanhamentos' element={
                <PrivateRoute>
                <Acompanhamentos />
                </PrivateRoute>
            } />
        </Routes>
    )
}

export default MainRoutes