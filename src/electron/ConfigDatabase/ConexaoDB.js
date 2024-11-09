import pg from 'pg'
const { Pool } = pg

let database;

// let senha;

// const alterarSenha = (novaSenha)  => {
//     console.log(`SENHA: ${novaSenha}`)
//      senha = novaSenha;
// }

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
const inserirDados = async (dados) => {
    if (!database) {
        console.error("Banco de dados não conectado.");
        return { success: false, error: "Banco de dados não conectado." };
    }

    try {
        const insertQueries = dados.map(item => {
            const columns = Object.keys(item);
            const values = Object.values(item);
            const query = `INSERT INTO tab_prod (${columns.join(", ")}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(", ")})`;
            return { query, values };
        });

        for (const { query, values } of insertQueries) {
            await database.query(query, values);
        }

        console.log("Dados inseridos com sucesso!");
        return { success: true };
    } catch (error) {
        console.error("Erro ao inserir dados:", error);
        return { success: false, error: error.message };
    }
}

export default { conectarBanco, inserirDados };