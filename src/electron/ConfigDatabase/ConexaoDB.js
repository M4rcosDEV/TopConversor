import pg from 'pg'
const { Pool } = pg

let database;

export default async function conectarBanco(nomeBanco) {
    if (database) {
        await database.end(); 
    }
    database = new Pool({
        user: 'postgres',
        password: 'amstopams',
        host: 'localhost',
        port: '5432',
        database: nomeBanco,
    });

    try {
        await database.query('SELECT NOW()');
        console.log('Conectado ao banco de dados:', nomeBanco);
        return { success: true };
    } catch (error) {
        console.error('Erro ao conectar:', error);
        return { success: false, error: error.message };
    }

}

