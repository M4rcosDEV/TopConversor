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
};

const obterProxSequeciaCodgrad = async (client, nome_sequencia) => {

    try{
        const query = `SELECT last_value, is_called FROM ${nome_sequencia}`;
        const result = await client.query(query);

        if (result.rows.length > 0) {
            const { last_value, is_called } = result.rows[0];
    
            // Se a sequência nunca foi usada, pode ser necessário chamar NEXTVAL()
            if (!is_called) {
                const fixQuery = `SELECT NEXTVAL('${nome_sequencia}') AS proxSequecia`;
                console.log(`Forçando chamada de sequência: ${fixQuery}`);
                const fixResult = await client.query(fixQuery);
                
                if (fixResult.rows.length > 0) {
                    return { success: true, proxSequecia: fixResult.rows[0].proxSequecia };
                } else {
                    return { success: false, error: "Falha ao obter sequência com NEXTVAL." };
                }
            }
    
            return { success: true, proxSequecia: last_value };
        } else {
            return { success: false, error: error || "Nenhum resultado encontrado." };
        }
    }catch(error){
        console.error("Erro ao obter próxima sequência:", error);
    }
 
};

const transferirTabProd = async (origem, destino, mapaCodDiv) => {  
    const logs = [];
    const clientOrig = await conectarBanco(origem);
    const clientDest = await conectarBanco(destino);
    // Mapas para relacionar os códigos antigos aos novos
    const mapaCodProd = new Map(); // Mapear: codprod antigo => novo codprod

    try {
        // 1. Preparar queries para obter colunas de cada tabela
        const colunasQueryProd = obterColunas('tab_prod');

        // 2. Obter os valores máximos (para sequências) do banco de destino
        const { success: maxProdSuccess, maxValor: maxCodProd } = await obterMaximoValor(clientDest, "tab_prod", "codprod");

        if (!maxProdSuccess) {
            logs.push({ type: "error", message: "Erro ao obter valores máximos." });
            return { success: false, logs };
        }

        // 3. Inicializar os contadores para os novos códigos
        let contadorProd = maxCodProd;

        
       
        // 4. Obter as colunas de cada tabela
        const { rows: colunasProd } = await clientOrig.query(colunasQueryProd);
       

        const nomesColunasProd = colunasProd.map(col => col.column_name);
        

        if (nomesColunasProd.length === 0) {
            throw new Error('Nenhuma coluna encontrada em uma das tabelas.');
        }

        // 5. Buscar os dados do banco de origem para cada tabela
        const { rows: dadosProd } = await clientOrig.query(`SELECT * FROM tab_prod`);
        

        // 6. Construir as queries de inserção dinamicamente para cada tabela
        const colunasTextoProd = nomesColunasProd.join(', ');
        const valoresTextoProd = nomesColunasProd.map((_, idx) => `$${idx + 1}`).join(', ');

        const insertQueryProd = `
            INSERT INTO tab_prod (${colunasTextoProd})
            VALUES (${valoresTextoProd})
            ON CONFLICT (codprod) DO NOTHING;
        `;

        // 7. Transferir os dados da tab_prod
        for (const row of dadosProd) {
            contadorProd++;
            const novoCodProd = contadorProd;
            mapaCodProd.set(row.codprod, novoCodProd);

            const valores = nomesColunasProd.map(coluna => {
                if (coluna === 'codprod') {
                    return novoCodProd;
                }
                
                if (['divisa1', 'divisa2', 'divisa3', 'divisa4', 'divisa5'].includes(coluna)) {
                    const novoCodDomi = mapaCodDiv.get(row[coluna]) || null; // Atualizar divisa1-4 conforme dom_div
                    return novoCodDomi;
                }

                return row[coluna];
            });
            await clientDest.query(insertQueryProd, valores);
        }

        logs.push({ type: "info", message: "Transferencia da tab_prod concluida com sucesso!" });
        console.log('Transferencia da tab_prod concluida com sucesso!');
    } catch (error) {
        logs.push({ type: "error", message: `Erro durante a transferencia da tab_prod: ${error.message}` });
        console.error('Erro durante a transferencia da tab_prod:', error);
    } finally {
        await clientOrig.end();
        await clientDest.end();
    }
    return { success: true, logs, mapaCodProd};
};

const transferirDomMar = async (origem, destino) => {
    const logs = [];
    const clientOrig = await conectarBanco(origem);
    const clientDest = await conectarBanco(destino);
    const mapaCodDomi = new Map(); // Mapa de códigos antigos -> novos

    try {
        // 1. Preparar queries para obter colunas de cada tabela
        const colunasQueryMar = obterColunas('dom_mar');

        // 2. Obter os valores máximos (para sequências) do banco de destino
        const { success: maxDomiSuccess, maxValor: maxCodDomi } = await obterMaximoValor(clientDest, "dom_mar", "coddomi");

        if (!maxDomiSuccess) {
            logs.push({ type: "error", message: "Erro ao obter valores máximos." });
            return { success: false, logs };
        }

        // 3. Inicializar os contadores para os novos códigos
        let contadorMar = maxCodDomi;
       
        // 4. Obter as colunas de cada tabela
        const { rows: colunasMar } = await clientOrig.query(colunasQueryMar);
       

        const nomesColunasMar = colunasMar.map(col => col.column_name);
        

        if (nomesColunasMar.length === 0) {
            throw new Error('Nenhuma coluna encontrada em uma das tabelas.');
        }

        // 5. Buscar os dados do banco de origem para cada tabela
        const { rows: dadosMar } = await clientOrig.query(`SELECT * FROM dom_mar WHERE coddomi > -1`);
        
        // 6. Construir as queries de inserção dinamicamente para cada tabela
        const colunasTextoMar = nomesColunasMar.join(', ');
        const valoresTextoMar = nomesColunasMar.map((_, idx) => `$${idx + 1}`).join(', ');
        
        const insertQueryMar = `
            INSERT INTO dom_mar (${colunasTextoMar})
            VALUES (${valoresTextoMar})
            ON CONFLICT (coddomi) DO NOTHING;
        `;

        if(maxCodDomi <= 0){
            contadorMar = 0;
        }

        // 7. Transferir os dados da dom_mar
        for (const row of dadosMar) {
            contadorMar++;
            const novoCodDomi = contadorMar;    

            // Salvar a correspondência de códigos (antigo -> novo)
            mapaCodDomi.set(row.coddomi, novoCodDomi);
            
            const valores = nomesColunasMar.map(coluna => {
                if (coluna === 'coddomi') {
                    return novoCodDomi;
                } else {
                    return row[coluna];
                }
            });
            await clientDest.query(insertQueryMar, valores);
        }

        logs.push({ type: "info", message: "Transferencia da dom_mar concluida com sucesso!" });
        console.log('Transferencia da dom_mar concluida com sucesso!');
    } catch (error) {
        logs.push({ type: "error", message: `Erro durante a transferencia da dom_mar: ${error.message}` });
        console.error('Erro durante a transferencia da dom_mar:', error);
    } finally {
        await clientOrig.end();
        await clientDest.end();
    }
    return { success: true, logs, mapaCodDomi};
};

const transferirDomDiv = async (origem, destino) => {
    const logs = [];
    const clientOrig = await conectarBanco(origem);
    const clientDest = await conectarBanco(destino);
    const mapaCodDiv = new Map(); // Mapa de códigos antigos -> novos

    try {
        // 1. Preparar queries para obter colunas de cada tabela
        const colunasQueryDiv = obterColunas('dom_div');

        // 2. Obter os valores máximos (para sequências) do banco de destino
        const { success: maxDivSuccess, maxValor: maxCodDiv } = await obterMaximoValor(clientDest, "dom_div", "coddomi");

        if (!maxDivSuccess) {
            logs.push({ type: "error", message: "Erro ao obter valores máximos." });
            return { success: false, logs };
        }

        // 3. Inicializar os contadores para os novos códigos
        let contadorDiv = maxCodDiv;
       
        // 4. Obter as colunas de cada tabela
        const { rows: colunasDiv } = await clientOrig.query(colunasQueryDiv);
       

        const nomesColunasDiv = colunasDiv.map(col => col.column_name);
        

        if (nomesColunasDiv.length === 0) {
            throw new Error('Nenhuma coluna encontrada em uma das tabelas.');
        }

        // 5. Buscar os dados do banco de origem para cada tabela
        const { rows: dadosDiv } = await clientOrig.query(`SELECT * FROM dom_div WHERE coddomi > 0`);
        
        // 6. Construir as queries de inserção dinamicamente para cada tabela
        const colunasTextoDiv = nomesColunasDiv.join(', ');
        const valoresTextoDiv = nomesColunasDiv.map((_, idx) => `$${idx + 1}`).join(', ');
        
        const insertQueryDiv = `
            INSERT INTO dom_div (${colunasTextoDiv})
            VALUES (${valoresTextoDiv})
            ON CONFLICT (coddomi) DO NOTHING;
        `;

        // 7. Transferir os dados da dom_mar
        for (const row of dadosDiv) {
            contadorDiv++;
            const novoCodDomi = contadorDiv;    

            // Salvar a correspondência de códigos (antigo -> novo)
            mapaCodDiv.set(row.coddomi, novoCodDomi);
            
            const valores = nomesColunasDiv.map(coluna => {
                if (coluna === 'coddomi') {
                    return novoCodDomi;
                } else {
                    return row[coluna];
                }
            });
            await clientDest.query(insertQueryDiv, valores);
        }

        logs.push({ type: "info", message: "Transferencia da dom_div concluida com sucesso!" });
        console.log('Transferencia da dom_div concluida com sucesso!');
    } catch (error) {
        logs.push({ type: "error", message: `Erro durante a transferencia da dom_div: ${error.message}` });
        console.error('Erro durante a transferencia da dom_div:', error);
    } finally {
        await clientOrig.end();
        await clientDest.end();
    }
    return { success: true, logs, mapaCodDiv};
};


const transferirTabDivi = async (origem, destino, mapaCodDiv) => {
    const logs = [];
    const clientOrig = await conectarBanco(origem);
    const clientDest = await conectarBanco(destino);
    const mapaCodDivAtt = new Map();
    try {
        // 1. Preparar queries para obter colunas de cada tabela
        const colunasQueryDivi = obterColunas('tab_divi');

        // 2. Obter os valores máximos (para sequências) do banco de destino
        const { success: maxDiviSuccess, maxValor: maxCodDivi } = await obterMaximoValor(clientDest, "tab_divi", "coddivi");

        if (!maxDiviSuccess) {
            logs.push({ type: "error", message: "Erro ao obter valores máximos." });
            return { success: false, logs };
        }

        // 3. Inicializar os contadores para os novos códigos
        let contadorDivi = maxCodDivi;
       
        // 4. Obter as colunas de cada tabela
        const { rows: colunasDivi } = await clientOrig.query(colunasQueryDivi);
       

        const nomesColunasDivi = colunasDivi.map(col => col.column_name);
        

        if (nomesColunasDivi.length === 0) {
            throw new Error('Nenhuma coluna encontrada em uma das tabelas.');
        }

        // 5. Buscar os dados do banco de origem para cada tabela
        const { rows: dadosDivi } = await clientOrig.query(`SELECT * FROM tab_divi WHERE coddivi > 0`);
        
        // 6. Construir as queries de inserção dinamicamente para cada tabela
        const colunasTextoDivi = nomesColunasDivi.join(', ');
        const valoresTextoDivi = nomesColunasDivi.map((_, idx) => `$${idx + 1}`).join(', ');
        
        const insertQueryDivi = `
            INSERT INTO tab_divi (${colunasTextoDivi})
            VALUES (${valoresTextoDivi})
            ON CONFLICT (coddivi) DO NOTHING;
        `;

        // 7. Transferir os dados da tab_divi
        for (const row of dadosDivi) {
            contadorDivi++;
            const novoCodDivi= contadorDivi;    

            // Atualizar divdivi usando o mapa da dom_div
            let novoDivDivi = null;
            if (mapaCodDiv.has(row.divdivi)) {
                novoDivDivi = mapaCodDiv.get(row.divdivi);
            }
            mapaCodDivAtt.set(row.coddivi, novoCodDivi);

            const valores = nomesColunasDivi.map(coluna => {
                if (coluna === 'coddivi') {
                    return novoCodDivi;
                } 

                if (coluna === 'divdivi') {
                    return novoDivDivi;
                }

                return row[coluna];
            });
            await clientDest.query(insertQueryDivi, valores);
        }

        logs.push({ type: "info", message: "Transferencia da tab_divi concluida com sucesso!" });
        console.log('Transferencia da tab_divi concluida com sucesso!');
    } catch (error) {
        logs.push({ type: "error", message: `Erro durante a transferencia da tab_divi: ${error.message}` });
        console.error('Erro durante a transferencia da tab_divi:', error);
    } finally {
        await clientOrig.end();
        await clientDest.end();
    }
    return { success: true, logs, mapaCodDivAtt};
};

const transferirTabGrad = async (origem, destino) => {
    const logs = [];
    const clientOrig = await conectarBanco(origem);
    const clientDest = await conectarBanco(destino);

    try {
        // 1. Preparar queries para obter colunas de cada tabela
        const colunasQueryGrad = obterColunas('tab_grad');

        // 2. Obter os valores máximos (para sequências) do banco de destino
        const { success: maxGradSuccess, maxValor: maxCodGrad } = await obterMaximoValor(clientDest, "tab_grad", "codgrad");
        const { success: maxProdSuccess, maxValor: maxCodProd } = await obterMaximoValor(clientDest, "tab_prod", "codprod");
        
         // Primeiro, transferimos dom_mar para garantir os códigos atualizados
         const resultadoDomMar = await transferirDomMar(origem, destino);
         const resultadoDomDiv = await transferirDomDiv(origem, destino);
         const resultadoTabDivi = await transferirTabDivi(origem, destino, resultadoDomDiv.mapaCodDiv);

         // Pegamos o mapa da função anterior para manter a relação correta entre os códigos
         const resultadoTransferencia = await transferirTabProd(origem, destino, resultadoDomDiv.mapaCodDiv);

        

         if (!resultadoTabDivi.success || !resultadoTransferencia.success || !maxProdSuccess || !maxGradSuccess || !resultadoDomMar.success || !resultadoDomDiv.success) {
             logs.push({ type: "error", message: "Erro ao obter valores máximos." });
             return { success: false, logs };
         }
         
         logs.push(...resultadoDomMar.logs);
         logs.push(...resultadoTransferencia.logs); // Adiciona os logs da transferência de tab_prod
         logs.push(...resultadoTabDivi.logs);

         const mapaCodProd = resultadoTransferencia.mapaCodProd; // Obtém o mapa com os códigos corretos
         const mapaCodDomi = resultadoDomMar.mapaCodDomi;
         const mapaCodDivi   = resultadoTabDivi.mapaCodDivAtt;
        // 3. Inicializar os contadores para os novos códigos
        let contadorGrad = maxCodGrad;

       
        // 4. Obter as colunas de cada tabela
        const { rows: colunasGrad } = await clientOrig.query(colunasQueryGrad);
       

        const nomesColunasGrad = colunasGrad.map(col => col.column_name);
         

        if (nomesColunasGrad.length === 0) {
            throw new Error('Nenhuma coluna encontrada em uma das tabelas.');
        }

        // 5. Buscar os dados do banco de origem para cada tabela
        const { rows: dadosGrad } = await clientOrig.query(`SELECT * FROM tab_grad`);

        // 6. Construir as queries de inserção dinamicamente para cada tabela
        const colunasTextoGrad = nomesColunasGrad.join(', ');
        const valoresTextoGrad = nomesColunasGrad.map((_, idx) => `$${idx + 1}`).join(', ');    


        const insertQueryGrad = `
            INSERT INTO tab_grad (${colunasTextoGrad})
            VALUES (${valoresTextoGrad})
            ON CONFLICT (codgrad) DO NOTHING;
        `;

        // 7. Transferir os dados da tab_grad
        for (const row of dadosGrad) {
            contadorGrad++; // Incrementa o contador para gerar um novo código de graduação
            const novoCodGrad = contadorGrad;

            // Obtém o novo codprod do mapa gerado pela tab_prod
            const novoCodProd = mapaCodProd.get(row.codprod) || parseInt(maxCodProd) + 1; // Usa o próximo disponível se não encontrado
            const novoMarGrad = mapaCodDomi.get(row.margrad) || null; // Atualizar margrad conforme dom_mar

            const novasDivisoes = [
                mapaCodDivi.has(row.idivi_1) ? mapaCodDivi.get(row.idivi_1) : row.idivi_1, // Usa o original se não encontrar
                mapaCodDivi.has(row.idivi_2) ? mapaCodDivi.get(row.idivi_2) : row.idivi_2,
                mapaCodDivi.has(row.idivi_3) ? mapaCodDivi.get(row.idivi_3) : row.idivi_3,
                mapaCodDivi.has(row.idivi_4) ? mapaCodDivi.get(row.idivi_4) : row.idivi_4,
                mapaCodDivi.has(row.idivi_5) ? mapaCodDivi.get(row.idivi_5) : row.idivi_5
            ];
            
            console.log("Novos valores de idivi mapeados:", novasDivisoes);

            const valores = nomesColunasGrad.map(coluna => {
                if (coluna === 'codgrad') {
                    return novoCodGrad;
                } else if (coluna === 'codprod') {
                    return novoCodProd; 
                } else if (coluna === 'margrad') {
                    return novoMarGrad;
                } else if (['idivi_1', 'idivi_2', 'idivi_3', 'idivi_4', 'idivi_5'].includes(coluna)) {
                    return novasDivisoes.shift(); // Substitui os valores de idivi_1 a idivi_5
                }

                return row[coluna];
            });

            await clientDest.query(insertQueryGrad, valores);
        }

        logs.push({ type: "info", message: "Transferencia da tab_grad concluida com sucesso!" });
        console.log('Transferencia da tab_grad concluida com sucesso!');
    } catch (error) {
        logs.push({ type: "error", message: `Erro durante a transferencia da tab_grad: ${error.message}` });
        console.error('Erro durante a transferencia da tab_grad:', error);
    } finally {
        await clientOrig.end();
        await clientDest.end();
    }
    return { success: true, logs};
};

const transferirTabEsto = async (origem, destino) => {  
    const logs = [];
    const clientOrig = await conectarBanco(origem);
    const clientDest = await conectarBanco(destino);

    try {
        // 1. Preparar queries para obter colunas de cada tabela
        const colunasQueryEsto = obterColunas('tab_esto');

        // 2. Obter os valores máximos (para sequências) do banco de destino
        const { success: maxGradSuccess, maxValor: maxCodGrad } = await obterMaximoValor(clientDest, "tab_grad", "codgrad");
        const { success: maxEstoSuccess, maxValor: maxCodEsto } = await obterMaximoValor(clientDest, "tab_esto", "codesto");
        
        // Pegamos o mapa da função anterior para manter a relação correta entre os códigos
        const resultadoTransferencia = await transferirTabGrad(origem, destino);

        if (!maxGradSuccess || !maxEstoSuccess || !resultadoTransferencia.success) {
            logs.push({ type: "error", message: "Erro ao obter valores máximos." });
            return { success: false, logs };
        }

        // 3. Inicializar os contadores para os novos códigos
        let contadorGrad = maxCodGrad;
        let contadorEsto = maxCodEsto;
       
        // 4. Obter as colunas de cada tabela
        const { rows: colunasEsto } = await clientOrig.query(colunasQueryEsto);
       

        const nomesColunasEsto = colunasEsto.map(col => col.column_name);
        

        if (nomesColunasEsto.length === 0) {
            throw new Error('Nenhuma coluna encontrada em uma das tabelas.');
        }

        // 5. Buscar os dados do banco de origem para cada tabela
        const { rows: dadosEsto } = await clientOrig.query(`SELECT * FROM tab_esto`);
        

        // 6. Construir as queries de inserção dinamicamente para cada tabela
        const colunasTextoEsto = nomesColunasEsto.join(', ');
        const valoresTextoEsto = nomesColunasEsto.map((_, idx) => `$${idx + 1}`).join(', ');

        const insertQueryEsto = `
            INSERT INTO tab_esto (${colunasTextoEsto})
            VALUES (${valoresTextoEsto})
            ON CONFLICT (codesto) DO NOTHING;
        `;

        // 7. Transferir os dados da tab_esto
        for (const row of dadosEsto) {
            contadorEsto++;
            contadorGrad++;
            const novoCodEsto = contadorEsto;
            const novoCodGrad = contadorGrad;

            const valores = nomesColunasEsto.map(coluna => {
                if (coluna === 'codesto') {
                    return novoCodEsto;
                } else if (coluna === 'codigra') {
                    return novoCodGrad;
                }else{
                    return row[coluna];
                }
            });
            await clientDest.query(insertQueryEsto, valores);
        }

        logs.push({ type: "info", message: "Transferencia da tab_esto concluida com sucesso!" });
        console.log('Transferencia da tab_esto concluida com sucesso!');
    } catch (error) {
        logs.push({ type: "error", message: `Erro durante a transferencia da tab_esto: ${error.message}` });
        console.error('Erro durante a transferencia da tab_esto:', error);
    } finally {
        await clientOrig.end();
        await clientDest.end();
    }
    return { success: true, logs};
};

export default { transferirTabEsto };