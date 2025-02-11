import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import axios from "axios";

const RegisterPage = () => {

  const [name, setName] = useState("") ;
  const [email, setEmail] = useState("") ;
  const [password, setPassword] = useState("") ;
  
  const handleSubmit = (e) =>{
    e.preventDefault();
    console.log(name, email, password)
    axios.get('/test')
  }
  return (
    <motion.div 
      className="mt-4 grow flex items-center justify-around"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div className="mb-64" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl text-center mb-4">Register</h1>
        <motion.form 
          className="max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={handleSubmit}
        >
          <input type="text" placeholder="John Doe" value={name} onChange={e=>setName(e.target.value)}/>

          <input type="email" placeholder="your@email.com"  value={email} onChange={e=>setEmail(e.target.value)}/>

          <input type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />

          <motion.button 
            className="primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Register
          </motion.button>
          <div className="text-center py-2 text-gray-500">
            Already a member? <Link className="underline text-black" to={'/login'}>Login</Link>
          </div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default RegisterPage;
