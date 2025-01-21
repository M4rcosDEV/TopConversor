// import fs from 'fs';
// import pg from 'pg';
// import logger from '../Logger/logger.js';
// import ipcRenderer from 'electron';

// const { Pool } = pg

// let database;

// let senha;

// const alterarSenha = (novaSenha)  => {
//     console.log(`SENHA: ${novaSenha}`)
//      senha = novaSenha;
// }

// const conectarBanco = async (nomeBanco, senha) => {
//     if (database) {
//         await database.end(); 
//     }
//     database = new Pool({
//         user: 'postgres',
//         password: senha || 'amstopams',
//         host: 'localhost',
//         port: '5432',
//         database: nomeBanco,
//     });

//     console.log(`SENHA: ${senha}`)
//     try {
//         await database.query('SELECT NOW()');
//         console.log('Conectado ao banco de dados:', nomeBanco);
//         return { success: true };
//     } catch (error) {
//         console.error('Erro ao conectar:', error);
//         return { success: false, error: error.message, coderror: error.code };
//     }

// }

// const executarQuery = async (query) => {
//     try {
//         const result = await database.query(query);
//         return { success: true, result };
//     } catch (error) {
//         console.error(`Erro ao executar query: ${error.message}`);
//         return { success: false, error };
//     }
// };

// const obterMaximoValor = async (tabela, coluna) => {
//     const query = `SELECT MAX(${coluna}) AS maxValor FROM ${tabela}`;
//     const { success, result, error } = await executarQuery(query);

//     if (success && result.rows.length > 0) {
//         const maxValor = result.rows[0]?.maxvalor || 0;
//         return { success: true, maxValor };
//     } else {
//         return { success: false, error: error || "Nenhum resultado encontrado." };
//     }
// };


// const distribuirDadosPorTabela = (dados, tabelaMap) => {
//     const dadosPorTabela = {};
//     Object.keys(tabelaMap).forEach(tabela => dadosPorTabela[tabela] = []);

//     dados.forEach(item => {
//         Object.entries(tabelaMap).forEach(([tabela, colunas]) => {
//             const valores = {};
//             colunas.forEach(coluna => {
//                 if (item[coluna] !== undefined) {
//                     valores[coluna] = item[coluna];
//                 }
//             });
//             if (Object.keys(valores).length > 0) {
//                 dadosPorTabela[tabela].push(valores);
//             }
//         });
//     });

//     return dadosPorTabela;
// };


// const inserirRegistros = async (tabela, registros) => {
//     if (registros.length === 0) return { success: true };

//     const colunas = Object.keys(registros[0]);
//     const valores = registros.map(registro =>
//         `(${colunas.map(coluna => `'${registro[coluna]}'`).join(", ")})`
//     );

//     const query = `
//         INSERT INTO ${tabela} (${colunas.join(", ")})
//         VALUES ${valores.join(", ")};
//     `;

//     return await executarQuery(query);
// };

// const inserirDados = async (dados, columnMapping) => {
//     const logs = [];

//     if (!database) {
//         const error = "Banco de dados não conectado.";
//         logs.push({ type: "error", message: error });
//         return { success: false, logs };
//     }

//     const tabelaMap = {

//         tab_prod: [
//             'codprod', 'nomprod', 'espprod', 'graprod', 'codfabr', 'codfili', 'cl1prod', 'cl2prod', 
//             'cl3prod', 'cl4prod', 'depprod', 'tipprod', 'obsprod', 'desresu', 'fgedeci', 'xyzprod', 
//             'atuprod', 'cod_ipi', 'cod_irr', 'subfede', 'ncmprod', 'imgprod', 'refgrad', 'codgrad', 
//             'codregr', 'filfabr', 'marprod', 'negprod', 'indprod', 'tipipro', 'genepro', 'lisipro', 
//             'ex_prod', 'indprop', 'codprop', 'filprop', 'endprop', 'ctnprod', 'cbccpro', 'recprod', 
//             'prociap', 'prodepr', 'regr_sa', 'regr_en', 'parfide', 'escombo', 'agrgrad', 'lismate', 
//             'ctnfatu', 'syngrad', 'prouuid', 'negunid', 'divisa1', 'divisa2', 'divisa3', 'divisa4', 
//             'divisa5'
//         ],

//         tab_grad: [
//             'codgrad', 'codprod', 'codidiv', 'codisub', 'unvgrad', 'uncgrad', 'estmini', 'pesliqu', 
//             'pesbrut', 'desmaxi', 'percomi', 'margrad', 'fatconv', 'obsgrad', 'lo1grad', 'lo2grad', 
//             'ptopedi', 'fgecomi', 'refgrad', 'gragrad', 'filprod', 'lucgrad', 'pzorese', 'fgenser', 
//             'fgelote', 'fgelotv', 'cfdgrad', 'cffgrad', 'ncmgrad', 'dtagrad', 'ctngrad', 'md5grad', 
//             'codante', 'metgrad', 'tipcomi', 'sercomp', 'diaprox', 'mkpgrad', 'exc_ncm', 'codcest', 
//             'bcpicms', 'bcpicst', 'usesite', 'gtingra', 'proanpc', 'proanpd', 'tmpgrad', 'paigrad', 
//             'itempai', 'embgrad', 'maxacre', 'pglpgra', 'pgnngra', 'estaten', 'vpartgr', 'ml_grad', 
//             'diasgra', 'tribuid', 'iterele', 'itecnpj', 'datvenc', 'diavenc', 'livreid', 'cobenef', 
//             'usegrad', 'purgrad', 'gergrad', 'metrage', 'estomax', 'tzgrad', 'grauuid', 'ml_cate', 
//             'ml_idpd', 'lo3grad', 'vitrine', 'cfgbala', 'codanvi', 'motanvi', 'preanvi', 'multemp', 
//             'biograd', 'impcomb', 'ufocomb', 'pufcomb', 'deslivr', 'idivi_1', 'idivi_2', 'idivi_3', 
//             'idivi_4', 'idivi_5'
//         ],  
        
//         tab_esto: [
//             'codigra', 'estiest', 'resiest', 'filesto', 'precomp', 'ultcust', 'cusmedi', 'cuspond', 
//             'prevend', 'preprom', 'preatac', 'proplan', 'prodtin', 'prodtfi', 'curvabc', 'estnega', 
//             'forlinh', 'codesto', 'ajuprec', 'qtdatac', 'custefe', 'pr1esto', 'pr2esto', 'qtdpend', 
//             'estuuid', 'intrasi', 'chegaem', 'vlrcomp', 'qtdprom', 'vqtprom', 'lo1esto', 'lo2esto', 
//             'lo3esto', 'obsprom', 'qtdata2', 'preata2', 'giroest'
//         ],     
        
//     };

//     const dadosPorTabela = distribuirDadosPorTabela(dados, tabelaMap);

//     // Obter o valor máximo de `codprod`
//     const { success: maxProdSuccess, maxValor: maxCodProd, error: maxProdError } = await obterMaximoValor("tab_prod", "codprod");

//     if (!maxProdSuccess) {
//         logs.push({ type: "error", message: `Erro ao obter MAX(codprod): ${maxProdError}` });
//         return { success: false, logs };
//     }
//     logs.push({ type: "info", message: `Maior código de produto: ${maxCodProd}` });

//     // Obter o valor máximo de `codgrad`
//     const { success: maxGradSuccess, maxValor: maxCodGrad, error: maxGradError } = await obterMaximoValor("tab_grad", "codgrad");

//     if (!maxGradSuccess) {
//         logs.push({ type: "error", message: `Erro ao obter MAX(codgrad): ${maxGradError}` });
//         return { success: false, logs };
//     }
//     logs.push({ type: "info", message: `Maior código de grade: ${maxCodGrad}` });


//     // Inserir dados por tabela
//     for (const [tabela, registros] of Object.entries(dadosPorTabela)) {
//         const { success, error } = await inserirRegistros(tabela, registros);
//         if (success) {
//             logs.push({ type: "success", message: `Inserção na tabela ${tabela} concluída!` });
//         } else {
//             logs.push({ type: "error", message: `Erro ao inserir na tabela ${tabela}: ${error.message}` });
//         }
//     }

//     return { success: true, logs };
// };

// // // Função para inserir dados no banco
// // const inserirDados = async (dados, columnMapping) => {
// //     //console.log("Dados recebidos:");
// //     //console.log(JSON.stringify(dados, null, 2));
// //     //console.log("Mapeamento de colunas:");
// //     //console.log(JSON.stringify(columnMapping, null, 2));

// //     const logs = []; // Armazena mensagens de log para enviar ao front-end

// //     if (!database) {
// //         const error = "Banco de dados não conectado.";
// //         logs.push({ type: "error", message: error });
// //         return { success: false, logs };
// //     }

// //     const queryTab_prod = `SELECT MAX(codprod) AS maxCodProd FROM tab_prod`;

    

// //     const tabelaMap = {

// //         tab_prod: [
// //             'codprod', 'nomprod', 'espprod', 'graprod', 'codfabr', 'codfili', 'cl1prod', 'cl2prod', 
// //             'cl3prod', 'cl4prod', 'depprod', 'tipprod', 'obsprod', 'desresu', 'fgedeci', 'xyzprod', 
// //             'atuprod', 'cod_ipi', 'cod_irr', 'subfede', 'ncmprod', 'imgprod', 'refgrad', 'codgrad', 
// //             'codregr', 'filfabr', 'marprod', 'negprod', 'indprod', 'tipipro', 'genepro', 'lisipro', 
// //             'ex_prod', 'indprop', 'codprop', 'filprop', 'endprop', 'ctnprod', 'cbccpro', 'recprod', 
// //             'prociap', 'prodepr', 'regr_sa', 'regr_en', 'parfide', 'escombo', 'agrgrad', 'lismate', 
// //             'ctnfatu', 'syngrad', 'prouuid', 'negunid', 'divisa1', 'divisa2', 'divisa3', 'divisa4', 
// //             'divisa5'
// //         ],

// //         tab_grad: [
// //             'codgrad', 'codprod', 'codidiv', 'codisub', 'unvgrad', 'uncgrad', 'estmini', 'pesliqu', 
// //             'pesbrut', 'desmaxi', 'percomi', 'margrad', 'fatconv', 'obsgrad', 'lo1grad', 'lo2grad', 
// //             'ptopedi', 'fgecomi', 'refgrad', 'gragrad', 'filprod', 'lucgrad', 'pzorese', 'fgenser', 
// //             'fgelote', 'fgelotv', 'cfdgrad', 'cffgrad', 'ncmgrad', 'dtagrad', 'ctngrad', 'md5grad', 
// //             'codante', 'metgrad', 'tipcomi', 'sercomp', 'diaprox', 'mkpgrad', 'exc_ncm', 'codcest', 
// //             'bcpicms', 'bcpicst', 'usesite', 'gtingra', 'proanpc', 'proanpd', 'tmpgrad', 'paigrad', 
// //             'itempai', 'embgrad', 'maxacre', 'pglpgra', 'pgnngra', 'estaten', 'vpartgr', 'ml_grad', 
// //             'diasgra', 'tribuid', 'iterele', 'itecnpj', 'datvenc', 'diavenc', 'livreid', 'cobenef', 
// //             'usegrad', 'purgrad', 'gergrad', 'metrage', 'estomax', 'tzgrad', 'grauuid', 'ml_cate', 
// //             'ml_idpd', 'lo3grad', 'vitrine', 'cfgbala', 'codanvi', 'motanvi', 'preanvi', 'multemp', 
// //             'biograd', 'impcomb', 'ufocomb', 'pufcomb', 'deslivr', 'idivi_1', 'idivi_2', 'idivi_3', 
// //             'idivi_4', 'idivi_5'
// //         ],  
        
// //         tab_esto: [
// //             'codigra', 'estiest', 'resiest', 'filesto', 'precomp', 'ultcust', 'cusmedi', 'cuspond', 
// //             'prevend', 'preprom', 'preatac', 'proplan', 'prodtin', 'prodtfi', 'curvabc', 'estnega', 
// //             'forlinh', 'codesto', 'ajuprec', 'qtdatac', 'custefe', 'pr1esto', 'pr2esto', 'qtdpend', 
// //             'estuuid', 'intrasi', 'chegaem', 'vlrcomp', 'qtdprom', 'vqtprom', 'lo1esto', 'lo2esto', 
// //             'lo3esto', 'obsprom', 'qtdata2', 'preata2', 'giroest'
// //         ],     
        
// //     };

// //     const dadosPorTabela = {
// //         tab_prod: [],
// //         tab_grad: [],
// //         tab_esto: [],
// //     };

// //     try {
// //         // Distribuir os dados por tabela
// //         dados.forEach((item) => {
// //             Object.entries(tabelaMap).forEach(([tabela, colunas]) => {
// //                 const valores = {};
// //                 colunas.forEach((coluna) => {
// //                     if (item[coluna] !== undefined) {
// //                         valores[coluna] = item[coluna];
// //                     }
// //                 });
// //                 if (Object.keys(valores).length > 0) {
// //                     dadosPorTabela[tabela].push(valores);
// //                 }
// //             });
// //         });
// //         try {
// //             await database.query(queryTab_prod);
// //             // Extrai o valor do resultado
// //             const maxCodProd = result.rows[0]?.maxcodprod;
// //             console.log('Select MAX(codprod):', maxCodProd);
// //             // Opcional: Adicione o valor nos logs ou use-o em outra lógica
// //             logs.push({ type: "info", message: `Maior código de produto: ${maxCodProd}` });
    
// //             return maxCodProd; // Retorna o valor, se necessário
    
// //         } catch (error) {
// //             const logMessage = `Erro ao executar SELECT MAX(codprod): ${error.message}`;
// //             logs.push({ type: "error", message: logMessage });
// //             console.error(logMessage);
// //             return null; // Retorna nulo em caso de erro
// //         }
// //         // Inserir os dados no banco de dados (apenas uma vez por tabela)
// //         for (const [tabela, registros] of Object.entries(dadosPorTabela)) {
// //             if (registros.length > 0) {
// //                 console.log(`Inserindo ${registros.length} registros na tabela ${tabela}`);
    
// //                 // Construir o comando SQL dinamicamente
// //                 const colunas = Object.keys(registros[0]); // Pega as colunas dos dados
// //                 const valores = registros.map(registro => 
// //                     `(${colunas.map(coluna => `'${registro[coluna]}'`).join(", ")})`
// //                 );
    
// //                 const query = `
// //                     INSERT INTO ${tabela} (${colunas.join(", ")})
// //                     VALUES ${valores.join(", ")};
// //                 `;
    
// //                 console.log(`Executando query na tabela ${tabela}:`);
// //                 console.log(query);
                
// //                 //Registra o log e inseri o SQL
// //                 try {
// //                     await database.query(query);
// //                     const logMessage = `Inserção na tabela ${tabela} concluída!`;
// //                     logs.push({ type: "success", message: logMessage });

// //                 } catch (error) {
// //                     const logMessage = `Erro ao inserir na tabela ${tabela}: ${error.message}`;
// //                     logs.push({ type: "error", message: logMessage });
// //                 }
// //             }
// //         }
    
// //         return { success: true, logs };
// //     } catch (error) {
// //         console.error("Erro ao inserir dados:", error);
// //         return { success: false, logs };
// //         // return { success: false, error: error.message };
// //     }
    
// // }

// export default { conectarBanco, inserirDados };



// const conesctarBanco = async (nomeBanco, senha) => {
//     if (database) {
//         await database.end();
//     }
//     database = new Pool({
//         user: 'postgres',
//         password: senha || 'amstopams',
//         host: 'localhost',
//         port: '5432',
//         database: nomeBanco,
//     });

//     console.log(`SENHA: ${senha}`);
//     try {
//         await database.query('SELECT NOW()');
//         console.log('Conectado ao banco de dados:', nomeBanco);
//         return { success: true };
//     } catch (error) {
//         console.error('Erro ao conectar:', error);
//         return { success: false, error: error.message, coderror: error.code };
//     }
// };

// const inseerirDados = async (dados, columnMapping) => {
//     const dadosLog = `DADOS : ${JSON.stringify(dados)}`;
//     const colunasLog = `COLUNAS : ${JSON.stringify(columnMapping)}`;
    
//     // Exibir os logs no console
//     console.log(dadosLog);
//     console.log(colunasLog);

//     // Gravar os logs em um arquivo .txt
//     const logContent = `${dadosLog}\n${colunasLog}\n`;
//     const logFilePath = './log.txt'; // Caminho do arquivo onde será salvo

//     try {
//         fs.appendFileSync(logFilePath, logContent, 'utf8');
//         console.log(`Logs salvos em: ${logFilePath}`);
//     } catch (error) {
//         console.error('Erro ao salvar os logs:', error);
//     }
// };


//aqui

import fs from 'fs';
import pg from 'pg';
import 'dotenv/config'

const { Pool } = pg

let database;

let senha;

const alterarSenha = (novaSenha)  => {
     senha = novaSenha;
}

const conectarBanco = async (nomeBanco, senha) => {
    if (database) {
        await database.end(); 
    }
    database = new Pool({
        user: 'postgres',
        password: senha || process.env.DB_PASSWORD,
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

const executarQuery = async (query) => {
    try {
        const result = await database.query(query);
        return { success: true, result };
    } catch (error) {
        console.error(`Erro ao executar query: ${error.message}`);
        return { success: false, error };
    }
};

const executarQueryDefault = async (query) => {
    // Exemplo de função para executar a query
    try {
        const result = await database.query(query); // Certifique-se de que `database.query` está funcionando corretamente
        return { success: true, result: result.rows }; // Supondo que o banco retorna um objeto com `rows`
    } catch (error) {
        console.error(`Erro ao executar query: ${error.message}`);
        return { success: false, error: error.message }; // Retorna apenas a mensagem de erro
    }
};

const obterMaximoValor = async (tabela, coluna) => {
    const query = `SELECT MAX(${coluna}) AS maxValor FROM ${tabela}`;
    const { success, result, error } = await executarQuery(query);

    if (success && result.rows.length > 0) {
        const maxValor = result.rows[0]?.maxvalor || 0;
        return { success: true, maxValor };
    } else {
        return { success: false, error: error || "Nenhum resultado encontrado." };
    }
};


const distribuirDadosPorTabela = (dados, tabelaMap) => {
    const dadosPorTabela = {};
    Object.keys(tabelaMap).forEach(tabela => dadosPorTabela[tabela] = []);

    dados.forEach(item => {
        Object.entries(tabelaMap).forEach(([tabela, colunas]) => {
            const valores = {};
            colunas.forEach(coluna => {
                if (item[coluna] !== undefined) {
                    valores[coluna] = item[coluna];
                }
            });
            if (Object.keys(valores).length > 0) {
                dadosPorTabela[tabela].push(valores);
            }
        });
    });

    return dadosPorTabela;
};


const inserirRegistros = async (tabela, registros) => {
    if (registros.length === 0) return { success: true };

    const colunas = Object.keys(registros[0]);
    const valores = registros.map(registro =>
        `(${colunas.map(coluna => `'${registro[coluna]}'`).join(", ")})`
    );

    const query = `
        INSERT INTO ${tabela} (${colunas.join(", ")})
        VALUES ${valores.join(", ")};
    `;

    // Adicionando o console.log para verificar a estrutura do INSERT
    console.log("Generated INSERT Query:", query);

    return await executarQuery(query);
};

const criarSequencia = (dados, coluna, valorInicial) => {
    let contador = valorInicial;
    return dados.map(registro => {
        registro[coluna] = contador++;
        return registro;
    });
};

const preencherColunasComValores = (registros, valoresPorColuna) => {
    return registros.map(registro => {
        Object.entries(valoresPorColuna).forEach(([coluna, valor]) => {
            registro[coluna] = valor; // Define o valor para a coluna específica
        });
        return registro;
    });
};


const substituirNullPorZero = (dados, colunasComZeroPadrao) => {
    return dados.map(registro => {
        colunasComZeroPadrao.forEach(coluna => {
            if (registro[coluna] === null || registro[coluna] === undefined) {
                registro[coluna] = 0;
            }
        });
        return registro;
    });
};

const inserirDados = async (dados, columnMapping) => {
    const logs = [];

    if (!database) {
        const error = "Banco de dados não conectado.";
        logs.push({ type: "error", message: error });
        return { success: false, logs };
    }

    const tabelaMap = {

        tab_prod: [
            'codprod', 'nomprod', 'espprod', 'graprod', 'codfabr', 'codfili', 'cl1prod', 'cl2prod', 
            'cl3prod', 'cl4prod', 'depprod', 'tipprod', 'obsprod', 'desresu', 'fgedeci', 'xyzprod', 
            'atuprod', 'cod_ipi', 'cod_irr', 'subfede', 'ncmprod', 'imgprod', 'refgrad', 'codgrad', 
            'codregr', 'filfabr', 'marprod', 'negprod', 'indprod', 'tipipro', 'genepro', 'lisipro', 
            'ex_prod', 'indprop', 'codprop', 'filprop', 'endprop', 'ctnprod', 'cbccpro', 'recprod', 
            'prociap', 'prodepr', 'regr_sa', 'regr_en', 'parfide', 'escombo', 'agrgrad', 'lismate', 
            'ctnfatu', 'syngrad', 'prouuid', 'negunid', 'divisa1', 'divisa2', 'divisa3', 'divisa4', 
            'divisa5'
        ],

        tab_grad: [
            'codgrad', 'codprod', 'codidiv', 'codisub', 'unvgrad', 'uncgrad', 'estmini', 'pesliqu', 
            'pesbrut', 'desmaxi', 'percomi', 'margrad', 'fatconv', 'obsgrad', 'lo1grad', 'lo2grad', 
            'ptopedi', 'fgecomi', 'refgrad', 'gragrad', 'filprod', 'lucgrad', 'pzorese', 'fgenser', 
            'fgelote', 'fgelotv', 'cfdgrad', 'cffgrad', 'ncmgrad', 'dtagrad', 'ctngrad', 'md5grad', 
            'codante', 'metgrad', 'tipcomi', 'sercomp', 'diaprox', 'mkpgrad', 'exc_ncm', 'codcest', 
            'bcpicms', 'bcpicst', 'usesite', 'gtingra', 'proanpc', 'proanpd', 'tmpgrad', 'paigrad', 
            'itempai', 'embgrad', 'maxacre', 'pglpgra', 'pgnngra', 'estaten', 'vpartgr', 'ml_grad', 
            'diasgra', 'tribuid', 'iterele', 'itecnpj', 'datvenc', 'diavenc', 'livreid', 'cobenef', 
            'usegrad', 'purgrad', 'gergrad', 'metrage', 'estomax', 'tzgrad', 'grauuid', 'ml_cate', 
            'ml_idpd', 'lo3grad', 'vitrine', 'cfgbala', 'codanvi', 'motanvi', 'preanvi', 'multemp', 
            'biograd', 'impcomb', 'ufocomb', 'pufcomb', 'deslivr', 'idivi_1', 'idivi_2', 'idivi_3', 
            'idivi_4', 'idivi_5'
        ],  
        
        tab_esto: [
            'codigra', 'estiest', 'resiest', 'filesto', 'precomp', 'ultcust', 'cusmedi', 'cuspond', 
            'prevend', 'preprom', 'preatac', 'proplan', 'prodtin', 'prodtfi', 'curvabc', 'estnega', 
            'forlinh', 'codesto', 'ajuprec', 'qtdatac', 'custefe', 'pr1esto', 'pr2esto', 'qtdpend', 
            'estuuid', 'intrasi', 'chegaem', 'vlrcomp', 'qtdprom', 'vqtprom', 'lo1esto', 'lo2esto', 
            'lo3esto', 'obsprom', 'qtdata2', 'preata2', 'giroest'
        ],     
        
    };

    const dadosPorTabela = distribuirDadosPorTabela(dados, tabelaMap);

    const { success: maxProdSuccess, maxValor: maxCodProd } = await obterMaximoValor("tab_prod", "codprod");
    const { success: maxGradSuccess, maxValor: maxCodGrad } = await obterMaximoValor("tab_grad", "codgrad");

    if (!maxProdSuccess || !maxGradSuccess) {
        logs.push({ type: "error", message: "Erro ao obter valores máximos." });
        return { success: false, logs };
    }

    logs.push({ type: "info", message: `Maior codprod: ${maxCodProd}, maior codgrad: ${maxCodGrad}` });

    const incrementoCodProd = parseInt(maxCodProd) + 1;
    const incrementoCodGrad = parseInt(maxCodGrad) + 1;

    for (const [tabela, registros] of Object.entries(dadosPorTabela)) {
        let registrosAtualizados = [...registros];

        if (tabela === "tab_prod") {
            registrosAtualizados = criarSequencia(registrosAtualizados, "codprod", incrementoCodProd);
            registrosAtualizados = preencherColunasComValores(registrosAtualizados, {
                codfili: '001',
                // cl1prod: 0,
                // cl2prod: 0,
                // cl3prod: 0,
                // cl4prod: 0,
                depprod: 0,
                tipprod: 'MA',
                cod_ipi: 0,
                cod_irr: 0,
                negprod: 0,
                indprod:'F',
                tipipro:'00',
                indprop: 0,
                endprop: 1,
                prociap: 0,
                prodepr: 0,
                regr_sa: -1,
                regr_en: -1,
                parfide: 0,
                escombo: 0,
                agrgrad: 0,
                lismate: 0,
                syngrad: 0,
                divisa1: 0,
                divisa2: 0,
                divisa3: 0,
                divisa4: 0,
                divisa5: 0,
            });
        }

        if (tabela === "tab_grad") {
            registrosAtualizados = registrosAtualizados.map((registro, index) => {
                registro.codgrad = incrementoCodGrad + index; // Incrementa codgrad sequencialmente
                registro.codprod = incrementoCodProd + index; // Incrementa codprod sequencialmente
                
                return registro;
                
            });

            registrosAtualizados = preencherColunasComValores(registrosAtualizados, {
                
            });
        }

        if (tabela === "tab_esto") {
            registrosAtualizados = criarSequencia(registrosAtualizados, "codigra", incrementoCodGrad);
            registrosAtualizados = preencherColunasComValores(registrosAtualizados, {
                resiest: "J",
            });
        }

        //registrosAtualizados = substituirNullPorZero(registrosAtualizados, ["codesto"]);

        const { success, error } = await inserirRegistros(tabela, registrosAtualizados);
        if (success) {
            logs.push({ type: "success", message: `Inserção na tabela ${tabela} concluída.` });
        } else {
            logs.push({ type: "error", message: `Erro ao inserir na tabela ${tabela}: ${error.message}` });
        }
    }

    return { success: true, logs };
};

export default { conectarBanco, inserirDados, executarQueryDefault };

// // Função para inserir dados no banco
// const inserirDados = async (dados, columnMapping) => {
//     //console.log("Dados recebidos:");
//     //console.log(JSON.stringify(dados, null, 2));
//     //console.log("Mapeamento de colunas:");
//     //console.log(JSON.stringify(columnMapping, null, 2));

//     const logs = []; // Armazena mensagens de log para enviar ao front-end

//     if (!database) {
//         const error = "Banco de dados não conectado.";
//         logs.push({ type: "error", message: error });
//         return { success: false, logs };
//     }

//     const queryTab_prod = `SELECT MAX(codprod) AS maxCodProd FROM tab_prod`;

    

//     const tabelaMap = {

//         tab_prod: [
//             'codprod', 'nomprod', 'espprod', 'graprod', 'codfabr', 'codfili', 'cl1prod', 'cl2prod', 
//             'cl3prod', 'cl4prod', 'depprod', 'tipprod', 'obsprod', 'desresu', 'fgedeci', 'xyzprod', 
//             'atuprod', 'cod_ipi', 'cod_irr', 'subfede', 'ncmprod', 'imgprod', 'refgrad', 'codgrad', 
//             'codregr', 'filfabr', 'marprod', 'negprod', 'indprod', 'tipipro', 'genepro', 'lisipro', 
//             'ex_prod', 'indprop', 'codprop', 'filprop', 'endprop', 'ctnprod', 'cbccpro', 'recprod', 
//             'prociap', 'prodepr', 'regr_sa', 'regr_en', 'parfide', 'escombo', 'agrgrad', 'lismate', 
//             'ctnfatu', 'syngrad', 'prouuid', 'negunid', 'divisa1', 'divisa2', 'divisa3', 'divisa4', 
//             'divisa5'
//         ],

//         tab_grad: [
//             'codgrad', 'codprod', 'codidiv', 'codisub', 'unvgrad', 'uncgrad', 'estmini', 'pesliqu', 
//             'pesbrut', 'desmaxi', 'percomi', 'margrad', 'fatconv', 'obsgrad', 'lo1grad', 'lo2grad', 
//             'ptopedi', 'fgecomi', 'refgrad', 'gragrad', 'filprod', 'lucgrad', 'pzorese', 'fgenser', 
//             'fgelote', 'fgelotv', 'cfdgrad', 'cffgrad', 'ncmgrad', 'dtagrad', 'ctngrad', 'md5grad', 
//             'codante', 'metgrad', 'tipcomi', 'sercomp', 'diaprox', 'mkpgrad', 'exc_ncm', 'codcest', 
//             'bcpicms', 'bcpicst', 'usesite', 'gtingra', 'proanpc', 'proanpd', 'tmpgrad', 'paigrad', 
//             'itempai', 'embgrad', 'maxacre', 'pglpgra', 'pgnngra', 'estaten', 'vpartgr', 'ml_grad', 
//             'diasgra', 'tribuid', 'iterele', 'itecnpj', 'datvenc', 'diavenc', 'livreid', 'cobenef', 
//             'usegrad', 'purgrad', 'gergrad', 'metrage', 'estomax', 'tzgrad', 'grauuid', 'ml_cate', 
//             'ml_idpd', 'lo3grad', 'vitrine', 'cfgbala', 'codanvi', 'motanvi', 'preanvi', 'multemp', 
//             'biograd', 'impcomb', 'ufocomb', 'pufcomb', 'deslivr', 'idivi_1', 'idivi_2', 'idivi_3', 
//             'idivi_4', 'idivi_5'
//         ],  
        
//         tab_esto: [
//             'codigra', 'estiest', 'resiest', 'filesto', 'precomp', 'ultcust', 'cusmedi', 'cuspond', 
//             'prevend', 'preprom', 'preatac', 'proplan', 'prodtin', 'prodtfi', 'curvabc', 'estnega', 
//             'forlinh', 'codesto', 'ajuprec', 'qtdatac', 'custefe', 'pr1esto', 'pr2esto', 'qtdpend', 
//             'estuuid', 'intrasi', 'chegaem', 'vlrcomp', 'qtdprom', 'vqtprom', 'lo1esto', 'lo2esto', 
//             'lo3esto', 'obsprom', 'qtdata2', 'preata2', 'giroest'
//         ],     
        
//     };

//     const dadosPorTabela = {
//         tab_prod: [],
//         tab_grad: [],
//         tab_esto: [],
//     };

//     try {
//         // Distribuir os dados por tabela
//         dados.forEach((item) => {
//             Object.entries(tabelaMap).forEach(([tabela, colunas]) => {
//                 const valores = {};
//                 colunas.forEach((coluna) => {
//                     if (item[coluna] !== undefined) {
//                         valores[coluna] = item[coluna];
//                     }
//                 });
//                 if (Object.keys(valores).length > 0) {
//                     dadosPorTabela[tabela].push(valores);
//                 }
//             });
//         });
//         try {
//             await database.query(queryTab_prod);
//             // Extrai o valor do resultado
//             const maxCodProd = result.rows[0]?.maxcodprod;
//             console.log('Select MAX(codprod):', maxCodProd);
//             // Opcional: Adicione o valor nos logs ou use-o em outra lógica
//             logs.push({ type: "info", message: `Maior código de produto: ${maxCodProd}` });
    
//             return maxCodProd; // Retorna o valor, se necessário
    
//         } catch (error) {
//             const logMessage = `Erro ao executar SELECT MAX(codprod): ${error.message}`;
//             logs.push({ type: "error", message: logMessage });
//             console.error(logMessage);
//             return null; // Retorna nulo em caso de erro
//         }
//         // Inserir os dados no banco de dados (apenas uma vez por tabela)
//         for (const [tabela, registros] of Object.entries(dadosPorTabela)) {
//             if (registros.length > 0) {
//                 console.log(`Inserindo ${registros.length} registros na tabela ${tabela}`);
    
//                 // Construir o comando SQL dinamicamente
//                 const colunas = Object.keys(registros[0]); // Pega as colunas dos dados
//                 const valores = registros.map(registro => 
//                     `(${colunas.map(coluna => `'${registro[coluna]}'`).join(", ")})`
//                 );
    
//                 const query = `
//                     INSERT INTO ${tabela} (${colunas.join(", ")})
//                     VALUES ${valores.join(", ")};
//                 `;
    
//                 console.log(`Executando query na tabela ${tabela}:`);
//                 console.log(query);
                
//                 //Registra o log e inseri o SQL
//                 try {
//                     await database.query(query);
//                     const logMessage = `Inserção na tabela ${tabela} concluída!`;
//                     logs.push({ type: "success", message: logMessage });

//                 } catch (error) {
//                     const logMessage = `Erro ao inserir na tabela ${tabela}: ${error.message}`;
//                     logs.push({ type: "error", message: logMessage });
//                 }
//             }
//         }
    
//         return { success: true, logs };
//     } catch (error) {
//         console.error("Erro ao inserir dados:", error);
//         return { success: false, logs };
//         // return { success: false, error: error.message };
//     }
    
// }





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


