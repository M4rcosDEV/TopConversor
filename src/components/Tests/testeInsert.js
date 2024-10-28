const { ipcMain } = require('electron');

// Supondo que você tenha uma função para conectar ao banco de dados
async function conectarBanco(dbName) {
    // Lógica de conexão ao banco de dados (exemplo: usando Sequelize, Mongoose, etc.)
    // Retorne a conexão ou a instância do banco de dados
}

// Função para inserir dados
async function inserirDados(conexao, dados) {
    
    const resultado = await conexao.query('INSERT INTO tabela (coluna1, coluna2) VALUES (?, ?)', {
        replacements: [dados.coluna1, dados.coluna2],
    });
    return resultado;
}

// Manipulador de IPC para conectar ao banco
ipcMain.handle('db-connect', async (event, dbName) => {
    try {
        const conexao = await conectarBanco(dbName);
        console.log('Conexão estabelecida com sucesso.');
        return conexao; // Retorna a conexão para uso posterior
    } catch (error) {
        console.error('Erro ao conectar ao banco:', error);
        throw error; // Lança o erro para que o renderizador saiba que houve um erro
    }
});

// Manipulador de IPC para inserir dados
ipcMain.handle('db-insert', async (event, dbName, dados) => {
    try {
        const conexao = await conectarBanco(dbName);
        const resultado = await inserirDados(conexao, dados);
        console.log('Dados inseridos com sucesso:', resultado);
        return resultado; // Retorna o resultado da inserção
    } catch (error) {
        console.error('Erro ao inserir dados:', error);
        throw error; // Lança o erro para que o renderizador saiba que houve um erro
    }
});


//rederer.js

async function inserirNoBanco() {
    const dbName = 'seuBancoDeDados';
    const dadosParaInserir = {
        coluna1: 'valor1',
        coluna2: 'valor2'
    };

    try {
        const resultado = await window.api.send('db-insert', dbName, dadosParaInserir);
        console.log('Resultado da inserção:', resultado);
    } catch (error) {
        console.error('Erro ao inserir dados:', error);
    }
}

// Chame a função, por exemplo, ao clicar em um botão
<button onClick={inserirNoBanco}>Inserir Dados</button>





// aqui

