import { Routes, Route } from 'react-router-dom'
import './App.css'
import IndexPages from './pages/IndexPages'
import Layout from './Layout'
import LoginPage from './pages/LoginPage'

function App() {

  return (
    <Routes>
       <Route path="/" element={<Layout />}>
          <Route index element={<IndexPages />} />
          <Route path="login" element={<LoginPage />} />
        </Route>
    </Routes>
  )
}

export default App
