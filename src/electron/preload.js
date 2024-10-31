// preload.js

console.log("Preload script loaded"); 
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    abrirArquivoExcel: async () => {
        console.log('abrirArquivoExcel chamado'); 
        return await ipcRenderer.invoke('abrir-arquivo-excel');
    }
    
});

contextBridge.exposeInMainWorld('database', {
    connect: async (dbName) => {
            console.log('connect chamado'); 
            return await ipcRenderer.invoke('db-connect', dbName);
        }
});

contextBridge.exposeInMainWorld('api', {
    insertData: async (data) => {
        console.log('insert chamado'); 
        return await ipcRenderer.invoke('insert-data', data)
    }
        
});