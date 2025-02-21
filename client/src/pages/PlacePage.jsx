import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PlacePage = () => {
    const {id} = useParams()
    console.log(id)
    const [place, setPlace] = useState([])

    useEffect(()=>{
        if(!id){
            return 
        }
        else{
            axios.get(`/places/${id}`).then((response)=>{
                setPlace(response.data)
            })
        }
    },[id])

    if(!place){
        return "No place found"
    }

  return (
    <div className="mt-4 bg-gray-100 -mx-8 px-8 pt-8">
        <h1 className="text-3xl">{place.title}</h1>
    </div>
  )
}

export default PlacePage