
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

const obterDataAtual = () => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0'); // Garante dois dígitos
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Mês começa em 0, então adicionamos 1
    const ano = hoje.getFullYear();

    return `${dia}-${mes}-${ano}`;
};

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

    try {
        // Inicia a transação
        await database.query('BEGIN');
        logs.push({ type: "info", message: "Transação iniciada." });

        for (const [tabela, registros] of Object.entries(dadosPorTabela)) {
            let registrosAtualizados = [...registros];

            if (tabela === "tab_prod") {
                registrosAtualizados = criarSequencia(registrosAtualizados, "codprod", incrementoCodProd);
                registrosAtualizados = preencherColunasComValores(registrosAtualizados, {
                    codfili: '001',
                    depprod: 0,
                    tipprod: 'MA',
                    negprod: 0,
                    indprod:'F',
                    tipipro:'00',
                    endprop: 1
                });
            }
    
            if (tabela === "tab_grad") {
                registrosAtualizados = registrosAtualizados.map((registro, index) => {
                    registro.codgrad = incrementoCodGrad + index; // Incrementa codgrad sequencialmente
                    registro.codprod = incrementoCodProd + index; // Incrementa codprod sequencialmente
                    
                    return registro;
                    
                });
    
                registrosAtualizados = preencherColunasComValores(registrosAtualizados, {
                    codidiv: 0,
                    codisub: 0,
                    margrad: -1,
                    fgecomi: 0,
                    filprod: '001',
                    dtagrad: obterDataAtual(),
                    ml_grad: ' ',
                    usegrad: 1
                });
            }
    
            if (tabela === "tab_esto") {
                registrosAtualizados = criarSequencia(registrosAtualizados, "codigra", incrementoCodGrad);
                registrosAtualizados = preencherColunasComValores(registrosAtualizados, {
                    resiest: 0,
                    filesto: '001',
                    curvabc: 'N'
                });
            }

            const { success, error } = await inserirRegistros(tabela, registrosAtualizados);
            if (success) {
                logs.push({ type: "success", message: `Inserção na tabela ${tabela} concluída.` });
            } else {
                throw new Error(`Erro ao inserir na tabela ${tabela}: ${error.message}`);
            }
        }

        // Confirma a transação
        await database.query('COMMIT');
        logs.push({ type: "info", message: "Transação concluída com sucesso." });

        return { success: true, logs };

    } catch (error) {
        // Reverte a transação em caso de erro
        await database.query('ROLLBACK');
        logs.push({ type: "error", message: `Erro na transação: ${error.message}. Todas as alterações foram desfeitas.` });
        return { success: false, logs };
    }
};

export default { conectarBanco, inserirDados, executarQueryDefault };
