import React,{useEffect} from 'react'
import { useHistory } from 'react-router'

const Protected = (props) => {
let Cmp=props.cmp
const history=useHistory();
      useEffect(()=>{
    if(!sessionStorage.getItem("accesToken")){
      history.push("/")
    }
  },[])
    return (
        <div>
            <Cmp/>
        </div>
    )
}

export default Protected
