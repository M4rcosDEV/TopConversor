import { app, BrowserWindow, ipcMain, dialog, Notification } from 'electron';
import path from 'path'; // Certifique-se de importar 'path' aqui
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ConexaoDB from './ConfigDatabase/ConexaoDB.js';
import LeitorExcel from './ConfigReadyExcel/LeitorExcel.js';
const { conectarBanco, inserirDados} = ConexaoDB;


let mainWindow;

// Define __dirname manualmente (em módulos ES6)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log(path.join(__dirname, '..', 'assets', 'Logo_Conversor.png'))
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

    notification(
        'Top Conversor',
        'Bem-vindo ao Top Conversor!',
        true,
        path.join(__dirname, '..', 'assets', 'Logo_Conversor.png'),
    );
}

//Aqui eu vou colocar o seletor de arquivo com o dialog pq o input da web é muito ruim

ipcMain.handle('abrir-arquivo-excel', async(event)=>{
    const result  = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Arquivos Excel', extensions: ['xlsx', 'xls', 'csv'] }
        ]
    });

    if (result.canceled) {
        return null; // O usuário cancelou a seleção
    }

    const filePath = result.filePaths[0];
    try {
        const dados = await LeitorExcel(filePath); // Chama a função para ler os dados
        console.log('Dados lidos:', dados); // Log dos dados lidos
        
        // Retorna um objeto com o caminho e os dados
        return {
            filePath: filePath,
            dados: dados
        };
    } catch (error) {
        console.error('Erro ao ler os dados do Excel:', error);
        return { error: 'Erro ao ler os dados do Excel.' }; // Retorna um erro, se houver
    }
});
let dbNameGlobal = null;

ipcMain.handle('db-connect', async (event, dbName) => {
    dbNameGlobal = dbName; 
    try {
        const result = await conectarBanco(dbName, null);
        console.log('Resultado da conexão:', result); // Adicione este log para verificar o resultado
        return result;
    } catch (error) {
        console.error('Erro ao conectar ao banco:', error);
        throw error; // Lança o erro para que o renderizador saiba que houve um erro
    }
});

ipcMain.handle('insert-data', async (event, dataToInsert) => {
    if (!dataToInsert || dataToInsert.length === 0) {
        console.error('Nenhum dado para inserir');
        return { success: false, error: 'Nenhum dado para inserir' };
    }

    try {
        const result = await inserirDados(dataToInsert);
        console.log('Resultado do insert:', result);
        return result;
    } catch (error) {
        console.error('Erro ao fazer o insert:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('alter-password',  async (event, password) => {
    // if (!dbNameGlobal) {
    //     throw new Error("Nome do banco de dados não foi definido. Conecte-se ao banco primeiro.");
    // }

    try {
        const result = await conectarBanco(dbNameGlobal, password); // Usa o nome armazenado do banco
        console.log('Resultado da conexão com senha alternativa:', result);
        return result;
    } catch (error) {
        console.error('Erro ao conectar ao banco com senha alternativa:', error);
        throw error;
    }
});

app.on('ready', createWindow);

function notification(title,  message, isSilent, icon) {
    if(!Notification.isSupported()) return;

    const notification = new Notification({
        title: title,
        body: message,
        silent: isSilent,
        icon: icon,
        timeoutType: 'default',
    });

    notification.show();
}

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
