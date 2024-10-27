import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path'; // Certifique-se de importar 'path' aqui
import { fileURLToPath } from 'url';
import { dirname } from 'path';

let mainWindow;

// Define __dirname manualmente (em módulos ES6)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Imprime o caminho do preload.js para depuração
console.log(`DINARME: ${__dirname}/preload.js`);

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Caminho correto
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false // (Opcional) Desabilitar o uso de remote
        }
    });

    mainWindow.loadURL('http://localhost:5173/'); // Pra desenvolvimento

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

//Aqui eu vou colocar o seletor de arquivo com o dialog pq o input da web é muito ruim

ipcMain.handle('abrir-arquivo-excel', async(event)=>{
    const result  = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Arquivos Excel', extensions: ['xlsx', 'xls', 'csv'] }
        ]
    });
    
    return  result.filePaths; // aqui é pra trazer o caminho do arquivo excel 
})

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
