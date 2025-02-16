import { Routes, Route } from 'react-router-dom'
import './App.css'
import IndexPages from './pages/IndexPages'
import Layout from './Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import axios from 'axios'
import { UserContextProvider } from './context/UserContextProvider'
import AccountPage from './pages/AccountPage'

axios.defaults.baseURL = 'http://localhost:3000'
axios.defaults.withCredentials = true;
function App() {

  return (
    <UserContextProvider>
    <Routes>
       <Route path="/" element={<Layout />}>
          <Route index element={<IndexPages />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage/>} />
          <Route path="/account" element={<AccountPage/>} />
          <Route path="/account/:subpage" element={<AccountPage />} />
          <Route path="/account/:subpage/:action" element={<AccountPage />} />
        </Route>
    </Routes>
    </UserContextProvider>
  )
}

export default App
