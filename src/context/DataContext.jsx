  import React, { createContext, useState } from 'react';

  export const DataContext = createContext();

  export const DataProvider = ({ children }) => {
    const [data, setData] = useState(null);
    const [fileName, setFileName] = useState('');
    const [filePath, setFilePath] = useState('');
    const [selectedTypeOption, setSelectedTypeOption] = useState(''); 
    const [logs, setLogs] = useState([]);
    const [showInsertData, setShowInsertData] = useState( );

    return (
      <DataContext.Provider value={
        {
         data, 
         setData, 
         fileName, 
         setFileName, 
         filePath, 
         setFilePath, 
         selectedTypeOption, 
         setSelectedTypeOption,
         logs,
         setLogs,
         showInsertData,
         setShowInsertData,
        }
      }>
      {children}
      </DataContext.Provider>
    );
  };