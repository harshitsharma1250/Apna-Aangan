import { useContext, useState } from "react"  
import { UserContext } from "../context/UserContext"
import { Navigate} from 'react-router-dom'
import { useParams } from "react-router-dom"
import axios from "axios"
import PlacesPage from "./PlacesPage"
import AccountNav from "./AccountNav"
const Account = () => {
  const {user, setUser, ready} = useContext(UserContext)
  const [redirect, setRedirect] = useState(null)
  
  let {subpage} = useParams() ;
  
  const logout = async () =>{
    await axios.post('/logout')
    setUser(null)
    setRedirect('/')
  }
  
  if(ready && !user && !redirect){
    return <Navigate to= {"/login"} />  
  }
  if(!ready){
    return 'Loading...'
  }
  
  if(subpage === undefined){
    subpage = "profile"
  }

  if(redirect){
    return <Navigate to={'/'}/>
  }

  console.log(subpage)

  return (
    <div>
     <AccountNav />
      {subpage === 'profile' && (
        <div className="text-center max-w-lg mx-auto mb-8">
          Logged in as {user.name} {user.email}
          <button  onClick={logout} className="primary max-w-sm mt-2">
            Logout
          </button>
        </div>
      )}
      {
        subpage== 'places'&&(
          <PlacesPage/>
        )
      }
    </div>
  )
}

export default Account