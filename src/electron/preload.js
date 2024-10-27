// preload.js

console.log("Preload script loaded"); 
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    abrirArquivoExcel: async () => {
        console.log('abrirArquivoExcel chamado'); 
        return await ipcRenderer.invoke('abrir-arquivo-excel');
    }
    
});

