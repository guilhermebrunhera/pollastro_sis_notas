import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { BrowserRouter } from 'react-router-dom'
import MainRoutes from './routes.tsx'
import Header from './components/Header/index.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Header />
    <MainRoutes />
  </BrowserRouter>
)
