import { useContext } from "react"  
import { UserContext } from "../context/UserContext"
const Account = () => {
  const {user} = useContext(UserContext)
  return (
    <div>Account page for {user?.name}</div>
  )
}

export default Account