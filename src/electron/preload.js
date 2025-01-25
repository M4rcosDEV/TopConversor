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

contextBridge.exposeInMainWorld("update", {
    connect: async (query) => {
        console.log("update chamado");
        return await ipcRenderer.invoke("update-default", query);
    },
});

contextBridge.exposeInMainWorld('api', {
    insertData: async (data, columnMapping, tipoConversao) => {
        console.log('insert chamado'); 
        console.log(`TESTE: ${data} - ${columnMapping}`);
        return await ipcRenderer.invoke('insert-data', data, columnMapping, tipoConversao)
    }   
});

contextBridge.exposeInMainWorld('alterarSenha', {
    alterPassword: async (alterPass) => {
        console.log('nova senha chamado'); 
        return await ipcRenderer.invoke('alter-password', alterPass)
    }   
});

contextBridge.exposeInMainWorld('electronAPI', {
    onLogMessage: (callback) => ipcRenderer.on('new-log', (event, logData) => callback(logData))
});

contextBridge.exposeInMainWorld('theme', {
    load: () => ipcRenderer.invoke('load-theme'),
    save: (theme) => ipcRenderer.invoke('save-theme', theme),
});