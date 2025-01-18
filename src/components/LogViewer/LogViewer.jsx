import React, {useContext, useEffect, useState } from 'react';
import { DataContext } from "../../context/DataContext";
import logIcon from '../../assets/icons/log.png';
import './LogViewer.css'

const LogViewer = () => {
    const {logs} = useContext(DataContext);
    const [isOpen, setIsOpen] = useState(false);


    for (let i = 0; i < logs.length; i++) {
        console.log(`Logs retornados:${logs[i].message}`);
    }

    const handleclick = () => {
        setIsOpen(!isOpen);
    }

    return (
        <>
            <div className='logs' onClick={handleclick}>
                <div className="log-icon-container">
                    <p className="count-log">{logs.length}</p>
                    <img src={logIcon} alt="Log Icon" className="log-icon" />
                </div>
            </div>

            {isOpen && (
                <div
                    className="log-backdrop"
                    onClick={() => setIsOpen(false)} // Fecha ao clicar fora do contêiner
                >
                    <div
                        className="log-container-descricao"
                        onClick={(e) => e.stopPropagation()} // Evita que o clique no contêiner feche
                    >
                        <button
                            className="close-button"
                            onClick={() => setIsOpen(false)} // Fecha ao clicar no botão "X"
                        >
                            &times;
                        </button>
                        <h3>Logs</h3>
                        <ul className="log-list">
                            {logs.map((log, index) => (
                                <li key={index} className={`log-item ${log.type}`}>
                                    {log.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

        </>
        
    );
};

export default LogViewer;
