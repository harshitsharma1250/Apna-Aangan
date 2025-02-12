import { useEffect, useState } from "react";
import PropTypes from "prop-types"; 
import { UserContext } from "./UserContext";
import axios from "axios";

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    useEffect(()=>{
        if(!user){
            axios.get('/profile').then(({data})=>{
                setUser(data);
            })
        }
    }, [])

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

UserContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
