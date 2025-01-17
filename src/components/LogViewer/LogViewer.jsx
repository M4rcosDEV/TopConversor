import React, {useContext, useEffect, useState } from 'react';
import { DataContext } from "../../context/DataContext";
import logIcon from '../../assets/icons/log.png';
import './LogViewer.css'

const LogViewer = () => {
    const {logs} = useContext(DataContext);

    for (let i = 0; i < logs.length; i++) {
        console.log(`Logs retornados:${logs[i].message}`);
    }

    return (
        <>
            <div className='logs'>
                <div className="log-icon-container">
                    <p className="count-log">{logs.length}</p>
                    <img src={logIcon} alt="Log Icon" className="log-icon" />
                </div>
            </div>

            {/* <div className="log-container-descricao">
                <h3>Logs</h3>
                <ul className="log-list">
                    {logs.map((log, index) => (
                        <li key={index} className={`log-item ${log.type}`}>
                            {log.message}
                        </li>
                    ))}
                </ul>
            </div> */}

        </>
        
    );
};

export default LogViewer;
