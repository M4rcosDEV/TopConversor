import fs from 'fs';
import path from 'path';
import pkg from 'pg';  // Importação correta para módulos CommonJS
const { Client } = pkg;
import { dirname } from 'path';

// Função para conectar ao banco de dados (origem ou destino)
const conectarBanco = async (database, senha) => {
    const client = new Client({
        host: 'localhost',
        database,
        user: 'postgres',
        password: senha || 'amstopams',
        port: 5432
    });
    await client.connect();
    return client;
};

// Função para obter o valor máximo de uma coluna (por exemplo, codprod ou codgrad) em uma tabela
const obterMaximoValor = async (client, tabela, coluna) => {
    try {
        const query = `SELECT MAX(${coluna}) AS "maxValor" FROM ${tabela}`;
        const result = await client.query(query);
        if (result.rows.length > 0) {
            const maxValor = result.rows[0].maxValor || 0;
            return { success: true, maxValor };
        } else {
            return { success: false, error: "Nenhum resultado encontrado." };
        }
    } catch (error) {
        console.error("Erro ao obter o valor máximo:", error);
        return { success: false, error: error.message };
    }
};

// Função que retorna a query para obter as colunas de uma tabela no esquema 'public'
function obterColunas(tabela) {
    return `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = '${tabela}'
        ORDER BY ordinal_position;
    `;
}

/**
 * Transfere os dados das três tabelas de forma sincronizada:
 * - Em tab_prod, gera novo codprod (sequencial conforme destino).
 * - Em tab_grad, substitui o codprod pelo novo valor (mapeado de tab_prod) e gera novo codgrad.
 * - Em tab_esto, substitui o codigra pelo novo codgrad mapeado de tab_grad.
 */
const transferirDadosProduto = async (origem, destino) => {
    const logs = [];
    const clientOrig = await conectarBanco(origem);
    const clientDest = await conectarBanco(destino);

    try {
        // 1. Preparar queries para obter colunas de cada tabela
        const colunasQueryProd = obterColunas('tab_prod');
        const colunasQueryGrad = obterColunas('tab_grad');
        const colunasQueryEsto = obterColunas('tab_esto');

        // 2. Obter os valores máximos (para sequências) do banco de destino
        const { success: maxProdSuccess, maxValor: maxCodProd } = await obterMaximoValor(clientDest, "tab_prod", "codprod");
        const { success: maxGradSuccess, maxValor: maxCodGrad } = await obterMaximoValor(clientDest, "tab_grad", "codgrad");

        if (!maxProdSuccess || !maxGradSuccess) {
            logs.push({ type: "error", message: "Erro ao obter valores máximos." });
            return { success: false, logs };
        }

        // 3. Inicializar os contadores para os novos códigos
        let contadorProd = maxCodProd;
        let contadorGrad = maxCodGrad;

        // Mapas para relacionar os códigos antigos aos novos
        const mapaCodProd = new Map(); // Mapear: codprod antigo => novo codprod
        const mapaCodGrad = new Map(); // Mapear: codgrad antigo => novo codgrad

        // 4. Obter as colunas de cada tabela
        const { rows: colunasProd } = await clientOrig.query(colunasQueryProd);
        const { rows: colunasGrad } = await clientOrig.query(colunasQueryGrad);
        const { rows: colunasEsto } = await clientOrig.query(colunasQueryEsto);

        const nomesColunasProd = colunasProd.map(col => col.column_name);
        const nomesColunasGrad = colunasGrad.map(col => col.column_name);
        const nomesColunasEsto = colunasEsto.map(col => col.column_name);

        if (nomesColunasProd.length === 0 || nomesColunasGrad.length === 0 || nomesColunasEsto.length === 0) {
            throw new Error('Nenhuma coluna encontrada em uma das tabelas.');
        }

        // 5. Buscar os dados do banco de origem para cada tabela
        const { rows: dadosProd } = await clientOrig.query(`SELECT * FROM tab_prod`);
        const { rows: dadosGrad } = await clientOrig.query(`SELECT * FROM tab_grad`);
        const { rows: dadosEsto } = await clientOrig.query(`SELECT * FROM tab_esto`);

        // 6. Construir as queries de inserção dinamicamente para cada tabela
        const colunasTextoProd = nomesColunasProd.join(', ');
        const valoresTextoProd = nomesColunasProd.map((_, idx) => `$${idx + 1}`).join(', ');
        const insertQueryProd = `
            INSERT INTO tab_prod (${colunasTextoProd})
            VALUES (${valoresTextoProd})
            ON CONFLICT (codprod) DO NOTHING;
        `;

        const colunasTextoGrad = nomesColunasGrad.join(', ');
        const valoresTextoGrad = nomesColunasGrad.map((_, idx) => `$${idx + 1}`).join(', ');
        const insertQueryGrad = `
            INSERT INTO tab_grad (${colunasTextoGrad})
            VALUES (${valoresTextoGrad})
            ON CONFLICT (codgrad) DO NOTHING;
        `;

        const colunasTextoEsto = nomesColunasEsto.join(', ');
        const valoresTextoEsto = nomesColunasEsto.map((_, idx) => `$${idx + 1}`).join(', ');
        const insertQueryEsto = `
            INSERT INTO tab_esto (${colunasTextoEsto})
            VALUES (${valoresTextoEsto})
            ON CONFLICT (codesto) DO NOTHING;
        `;

        // 7. Transferir os dados da tab_prod
        for (const row of dadosProd) {
            const novoCodProd = ++contadorProd; // Gera novo codprod sequencialmente
            mapaCodProd.set(row.codprod, novoCodProd); // Mapeia o codprod antigo para o novo
            const valores = nomesColunasProd.map(coluna => {
                if (coluna === 'codprod') {
                    return novoCodProd;
                } else {
                    return row[coluna];
                }
            });
            await clientDest.query(insertQueryProd, valores);
        }

        // 8. Transferir os dados da tab_grad
        for (const row of dadosGrad) {
            // Verifica se o codprod (referência) existe no mapeamento feito em tab_prod
            if (!mapaCodProd.has(row.codprod)) {
                throw new Error(`codprod ${row.codprod} não encontrado no mapeamento.`);
            }
            const novoCodProd = mapaCodProd.get(row.codprod);
            const novoCodGrad = ++contadorGrad; // Gera novo codgrad sequencialmente
            mapaCodGrad.set(row.codgrad, novoCodGrad); // Mapeia o codgrad antigo para o novo
            const valores = nomesColunasGrad.map(coluna => {
                if (coluna === 'codgrad') {
                    return novoCodGrad;
                } else if (coluna === 'codprod') {
                    return novoCodProd;
                } else {
                    return row[coluna];
                }
            });
            await clientDest.query(insertQueryGrad, valores);
        }

        // 9. Transferir os dados da tab_esto
        // Aqui, a coluna 'codigra' deverá ficar com o mesmo novo codgrad gerado em tab_grad.
        for (const row of dadosEsto) {
            const valores = nomesColunasEsto.map(coluna => {
                if (coluna === 'codigra') {
                    if (!mapaCodGrad.has(row.codigra)) {
                        throw new Error(`codigra ${row.codigra} não encontrado no mapeamento de codgrad.`);
                    }
                    return mapaCodGrad.get(row.codigra);
                } else {
                    return row[coluna];
                }
            });
            await clientDest.query(insertQueryEsto, valores);
        }

        logs.push({ type: "info", message: "Transferência concluída com sucesso!" });
        console.log('Transferência concluída com sucesso!');
    } catch (error) {
        logs.push({ type: "error", message: `Erro durante a transferência: ${error.message}` });
        console.error('Erro durante a transferência:', error);
    } finally {
        await clientOrig.end();
        await clientDest.end();
    }
    return { success: true, logs };
};

export default { transferirDadosProduto };
