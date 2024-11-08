import React, { useRef } from "react";
import './DialogoInformacao.css'

export default function DialogoInformacao({isOpen}){
  
    const container_dialogo = useRef(null);

    const handleClose = () =>{
        if(isOpen === true){
            container_dialogo.current.style.backgroundColor = 'Red'
        }else{
            container_dialogo.current.style.backgroundColor = 'Green'
        }
    }

    return(
        <>
            {isOpen ?
            <div className="container-dialogo" ref={container_dialogo} onClick={handleClose}>
                
            </div>
            : <></> 
        }
        </>
        
    );

}