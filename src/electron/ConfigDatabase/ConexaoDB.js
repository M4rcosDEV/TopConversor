import fs from 'fs';
import pg from 'pg';

const { Pool } = pg

let database;

let senha;

const alterarSenha = (novaSenha)  => {
    console.log(`SENHA: ${novaSenha}`)
     senha = novaSenha;
}

const conectarBanco = async (nomeBanco, senha) => {
    if (database) {
        await database.end(); 
    }
    database = new Pool({
        user: 'postgres',
        password: senha || 'amstopams',
        host: 'localhost',
        port: '5432',
        database: nomeBanco,
    });

    console.log(`SENHA: ${senha}`)
    try {
        await database.query('SELECT NOW()');
        console.log('Conectado ao banco de dados:', nomeBanco);
        return { success: true };
    } catch (error) {
        console.error('Erro ao conectar:', error);
        return { success: false, error: error.message, coderror: error.code };
    }

}

// Função para inserir dados no banco
const inserirDados = async (dados, columnMapping) => {
    console.log("Dados recebidos:");
    console.log(JSON.stringify(dados, null, 2));
    console.log("Mapeamento de colunas:");
    console.log(JSON.stringify(columnMapping, null, 2));

    if (!database) {
        console.error("Banco de dados não conectado.");
        return { success: false, error: "Banco de dados não conectado." };
    }

    const tabelaMap = {
        tab_prod: ["numprod", "descprod", "preco"], // Exemplo de colunas da tab_prod
        tab_grad: ["numgrad", "descgrad", "tam"],  // Exemplo de colunas da tab_grad
        tab_esto: ["numesto", "qtd", "local"],     // Exemplo de colunas da tab_esto
    };

    const dadosPorTabela = {
        tab_prod: [],
        tab_grad: [],
        tab_esto: [],
    };

    try {
        // Distribuir os dados por tabela
        dados.forEach((item) => {
            Object.entries(tabelaMap).forEach(([tabela, colunas]) => {
                const valores = {};
                colunas.forEach((coluna) => {
                    if (item[coluna] !== undefined) {
                        valores[coluna] = item[coluna];
                    }
                });
                if (Object.keys(valores).length > 0) {
                    dadosPorTabela[tabela].push(valores);
                }
            });
        });
    
        // Inserir os dados no banco de dados (apenas uma vez por tabela)
        for (const [tabela, registros] of Object.entries(dadosPorTabela)) {
            if (registros.length > 0) {
                console.log(`Inserindo ${registros.length} registros na tabela ${tabela}`);
    
                // Construir o comando SQL dinamicamente
                const colunas = Object.keys(registros[0]); // Pega as colunas dos dados
                const valores = registros.map(registro => 
                    `(${colunas.map(coluna => `'${registro[coluna]}'`).join(", ")})`
                );
    
                const query = `
                    INSERT INTO ${tabela} (${colunas.join(", ")})
                    VALUES ${valores.join(", ")};
                `;
    
                console.log(`Executando query na tabela ${tabela}:`);
                console.log(query);
    
                // Executar o comando SQL aqui    
                try {
                    await database.query(query); // Substitua `database.query` pela função correta do driver/biblioteca que você está usando
                    console.log(`Inserção na tabela ${tabela} concluída!`);
                } catch (error) {
                    console.error(`Erro ao inserir na tabela ${tabela}:`, error.message);
                }
            }
        }
    
        return { success: true };
    } catch (error) {
        console.error("Erro ao inserir dados:", error);
        return { success: false, error: error.message };
    }
    
}

export default { conectarBanco, inserirDados };



const conesctarBanco = async (nomeBanco, senha) => {
    if (database) {
        await database.end();
    }
    database = new Pool({
        user: 'postgres',
        password: senha || 'amstopams',
        host: 'localhost',
        port: '5432',
        database: nomeBanco,
    });

    console.log(`SENHA: ${senha}`);
    try {
        await database.query('SELECT NOW()');
        console.log('Conectado ao banco de dados:', nomeBanco);
        return { success: true };
    } catch (error) {
        console.error('Erro ao conectar:', error);
        return { success: false, error: error.message, coderror: error.code };
    }
};

const inseerirDados = async (dados, columnMapping) => {
    const dadosLog = `DADOS : ${JSON.stringify(dados)}`;
    const colunasLog = `COLUNAS : ${JSON.stringify(columnMapping)}`;
    
    // Exibir os logs no console
    console.log(dadosLog);
    console.log(colunasLog);

    // Gravar os logs em um arquivo .txt
    const logContent = `${dadosLog}\n${colunasLog}\n`;
    const logFilePath = './log.txt'; // Caminho do arquivo onde será salvo

    try {
        fs.appendFileSync(logFilePath, logContent, 'utf8');
        console.log(`Logs salvos em: ${logFilePath}`);
    } catch (error) {
        console.error('Erro ao salvar os logs:', error);
    }
};


