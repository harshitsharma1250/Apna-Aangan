import { Routes, Route } from 'react-router-dom'
import './App.css'
import IndexPages from './pages/IndexPages'
import Layout from './Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:3000'
function App() {

  return (
    <Routes>
       <Route path="/" element={<Layout />}>
          <Route index element={<IndexPages />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage/>} />
        </Route>
    </Routes>
  )
}

export default App
