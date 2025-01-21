import React, { useContext, useRef, useState, useEffect } from 'react';
import { DataContext } from "../../context/DataContext";
import './ColunasInformacao.css';
import DropdownSearch from '../DropdownSearch/DropdownSearch';
import iconOpenBox from "../../assets/icons/open-box.png";
import Swal from 'sweetalert2';

export default function ColunasInformacao() {
    const [selectedItem, setSelectedItem] = useState(null);
    const [colunasSearch, setColunasSearch] = useState([]);
    const [colunasDesativadas, setColunasDesativadas] = useState([]); 
    const [opcoesDesativadas, setOpcoesDesativadas] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [columnMapping, setColumnMapping] = useState({});
    const {data} = useContext(DataContext);
    const {selectedTypeOption} = useContext(DataContext);
    const [colunaSelected, setColunaSelected] = useState([]);
    const {setLogs} = useContext(DataContext);
    const [showInsertRequiredLog, setShowInsertRequiredLog] = useState([]);
    const [execInsert, setExecInsert] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    
      // const produto = [
      //    //tab_prod
      //   'codprod', 'nomprod', 'espprod', 'graprod', 'codfabr', 'codfili', 'cl1prod', 'cl2prod', 
      //   'cl3prod', 'cl4prod', 'depprod', 'tipprod', 'obsprod', 'desresu', 'fgedeci', 'xyzprod', 
      //   'atuprod', 'cod_ipi', 'cod_irr', 'subfede', 'ncmprod', 'imgprod', 'refgrad', 'codgrad', 
      //   'codregr', 'filfabr', 'marprod', 'negprod', 'indprod', 'tipipro', 'genepro', 'lisipro', 
      //   'ex_prod', 'indprop', 'codprop', 'filprop', 'endprop', 'ctnprod', 'cbccpro', 'recprod', 
      //   'prociap', 'prodepr', 'regr_sa', 'regr_en', 'parfide', 'escombo', 'agrgrad', 'lismate', 
      //   'ctnfatu', 'syngrad', 'prouuid', 'negunid', 'divisa1', 'divisa2', 'divisa3', 'divisa4', 
      //   'divisa5',

      //    //tab_grad
      //   'codgrad', 'codprod', 'codidiv', 'codisub', 'unvgrad', 'uncgrad', 'estmini', 'pesliqu', 
      //   'pesbrut', 'desmaxi', 'percomi', 'margrad', 'fatconv', 'obsgrad', 'lo1grad', 'lo2grad', 
      //   'ptopedi', 'fgecomi', 'refgrad', 'gragrad', 'filprod', 'lucgrad', 'pzorese', 'fgenser', 
      //   'fgelote', 'fgelotv', 'cfdgrad', 'cffgrad', 'ncmgrad', 'dtagrad', 'ctngrad', 'md5grad', 
      //   'codante', 'metgrad', 'tipcomi', 'sercomp', 'diaprox', 'mkpgrad', 'exc_ncm', 'codcest', 
      //   'bcpicms', 'bcpicst', 'usesite', 'gtingra', 'proanpc', 'proanpd', 'tmpgrad', 'paigrad', 
      //   'itempai', 'embgrad', 'maxacre', 'pglpgra', 'pgnngra', 'estaten', 'vpartgr', 'ml_grad', 
      //   'diasgra', 'tribuid', 'iterele', 'itecnpj', 'datvenc', 'diavenc', 'livreid', 'cobenef', 
      //   'usegrad', 'purgrad', 'gergrad', 'metrage', 'estomax', 'tzgrad', 'grauuid', 'ml_cate', 
      //   'ml_idpd', 'lo3grad', 'vitrine', 'cfgbala', 'codanvi', 'motanvi', 'preanvi', 'multemp', 
      //   'biograd', 'impcomb', 'ufocomb', 'pufcomb', 'deslivr', 'idivi_1', 'idivi_2', 'idivi_3', 
      //   'idivi_4', 'idivi_5',

      //    //tab_esto
      //   'codigra', 'estiest', 'resiest', 'filesto', 'precomp', 'ultcust', 'cusmedi', 'cuspond', 
      //   'prevend', 'preprom', 'preatac', 'proplan', 'prodtin', 'prodtfi', 'curvabc', 'estnega', 
      //   'forlinh', 'codesto', 'ajuprec', 'qtdatac', 'custefe', 'pr1esto', 'pr2esto', 'qtdpend', 
      //   'estuuid', 'intrasi', 'chegaem', 'vlrcomp', 'qtdprom', 'vqtprom', 'lo1esto', 'lo2esto', 
      //   'lo3esto', 'obsprom', 'qtdata2', 'preata2', 'giroest'

      // ];
      
      const produto = [
        //tab_prod
        'nomprod', 'obsprod', 'desresu',

        //tab_grad
        'codgrad', 'refgrad','codidiv',
        
        //tab_esto
        'codesto', 'estiest','prevend' 
      ]

      
      const cliente =[
        //tab_parc
        'codparc', 'nomparc', 'codfili', 'sobparc', 'cnpparc', 'regparc', 'nasparc', 'cadparc', 
        'altparc', 'obsparc', 'homparc', 'emaparc', 'venpref', 'plapref', 'cobpref', 'spccons', 
        'negparc', 'ultcont', 'ultvend', 'filaval', 'codaval', 'limcred', 'doctipo', 'estcivi', 
        'sexparc', 'pesparc', 'codocup', 'nacparc', 'natparc', 'ctpparc', 'cnhparc', 'cat_cnh', 
        'supparc', 'admparc', 'demparc', 'nomempr', 'endempr', 'comempr', 'dddempr', 'fonempr', 
        'antempr', 'ctpseri', 'fgeparc', 'filconj', 'codconj', 'nomconj', 'cnpconj', 'nasconj', 
        'emaconj', 'ddfconj', 'fonconj', 'ddcconj', 'celconj', 'porempr', 'tipempr', 'iprparc', 
        'ultende', 'renparc', 'imgparc', 'dis_iss', 'motbloq', 'rntparc', 'tacparc', 'tpaparc', 
        'ucbparc', 'datconj','atvagend', 'codrfid', 'cnhvali', 'obsconj', 'undparc', 'co_fina', 
        'obsfina', 'agenseg', 'agenter', 'agenqua', 'agenqui', 'agensex', 'agensab', 'agendom', 
        'usuparc', 'regprec', 'codante', 'datbloq', 'indbloq', 'senparc', 'pisparc', 'codhora', 
        'filante', 'paiparc', 'maeparc', 'rotparc', 'falparc', 'comfale', 'oriparc', 'coddeli', 
      'update_at', 'ctaclie', 'ctaforn', 'custpad', 'logcadw', 'fgelgpd', 'percomi', 'dia_lib',

        //tab_ende
        'codparc', 'fonende', 'cgcende', 'ieende', 'endende', 'baiende', 'codcida', 'cepende', 
        'numende', 'nomende', 'filparc', 'faxende', 'celende', 'ddd_fon', 'complem', 'referen', 
        'tiplogr', 'nommuni', 'uf_ende', 'paiende', 'ordende', 'iesende', 'sufende', 'optsimp', 
        'im_ende', 'ctbicms', 'ramtelf', 'nomgest', 'cpfgest', 'emagest', 'crggest', 'ftaparc', 
        'prlparc', 'cpsparc', 'dafparc', 'temresi', 'numfunc', 'vlraluq', 'cnaeend', 'tpeende', 
        'ip_ende', 'pe_ende', 'ireende', 'gpslong', 'gpslati', 'asfende', 'estende', 'entende', 
        'seqende', 'nom_end', 'iiedest', 'regimet', 'coddeli', 'codtaen', 'update_at', 'fgeende', 
        'idendpw', 'azulzon'
      ];
      
      const showSuccess = () => {
        Swal.fire({
            title: 'Sucesso!',
            text: 'Conversao realizada com sucesso.',
            icon: 'success',
            confirmButtonText: 'OK'
        });
      };

      const showError = () => {
        Swal.fire({
          title: 'Error!',
          text: 'Verifique o log',
          icon: 'error',
          confirmButtonText: 'OK'
        })
      };
    

      useEffect(() => {
        if (selectedTypeOption === 'Produtos') {
          setColunaSelected(produto);
        } else if (selectedTypeOption === 'Clientes') {
          setColunaSelected(cliente);
        } else {
          setColunaSelected([]);
        }
      }, [selectedTypeOption]); // Roda quando selectedTypeOption muda

    //Aqui serve pra pegar a quantidade de dados para criar uma coluna para cada
    const columnNames = data && data.length > 0 ? Object.keys(data[0]) : [];

      const verificarSelect = (option) => {
        setColunasSearch((prevColunasSearch) => {

          // Verifica se a opção já foi adicionada
          if (!prevColunasSearch.includes(option)) {
            const updatedColunasSearch = [...prevColunasSearch, option];
            console.log('Colunas atualizadas:', updatedColunasSearch); // Valor atualizado
            return updatedColunasSearch;
          }else{
            alert('Já selecionado');
            const updatedColunasSearch = [...prevColunasSearch];
            console.log('Colunas atualizadas:', updatedColunasSearch); // Valor atualizado
            return updatedColunasSearch;
          }
          // Retorna o estado anterior se a opção já estiver presente
        });
        
        setSelectedItem(option);
        //console.log('Opção selecionada:', option); 
      };

    

      

      // Função para atualizar o mapeamento quando uma coluna é selecionada
      // const handleColumnSelect = (selectedColumn, dbColumn) => {
      //   const listSelect =  Object.keys(columnMapping);

      //   listSelect.forEach(item => {
      //     if(item === dbColumn){
      //       alert('Já tem esse item')
      //     }

      //     console.log(columnMapping)
      //   });

      //   setColumnMapping((prevMapping) => ({
      //     ...prevMapping,
      //     [dbColumn]: selectedColumn,
      //   }));
      // };

        const handleOptionChange = (colName, previousOption, newOption) => {
          setOpcoesDesativadas((prev) => {
            const updated = previousOption
              ? prev.filter((option) => option !== previousOption)
              : [...prev];
      
            if (newOption) {
              updated.push(newOption);
            }
      
            return updated;
          });
        }
      
      const handleColumnSelect = (selectedColumn, dbColumn) => {
        console.log(`COLUNAS: ${selectedColumn} - ${dbColumn}`);
    
        setColumnMapping((prevMapping) => {
            // Cria uma nova cópia do mapeamento
            const updatedMapping = { ...prevMapping };
    
            // Remove associações anteriores do mesmo valor (dbColumn)
            Object.keys(updatedMapping).forEach((key) => {
                if (updatedMapping[key] === selectedColumn) {
                    delete updatedMapping[key];
                }
            });
    
            // Adiciona ou atualiza a nova associação
            updatedMapping[dbColumn] = selectedColumn;
    
            return updatedMapping;
        });
    
        // Atualiza a lista de colunas desativadas
        setColunasDesativadas((prev) => {
            const updated = prev.filter((coluna) => coluna !== selectedColumn);
    
            if (dbColumn) {
                updated.push(dbColumn);
            }
    
            return updated;
        });
    };
    

    const handleInsertData = async () => {
      console.log(opcoesDesativadas);
  
      // Lista de itens obrigatórios
      const requiredProd = ['nomprod', 'refgrad', 'estiest'];
  
      // Verifica quais itens de requiredProd ainda não estão em opcoesDesativadas
      const missingItems = requiredProd.filter(item => !opcoesDesativadas.includes(item));
  
      // Se algum item estiver ausente, exibe o alerta
      if (missingItems.length > 0) {
          alert(`Precisa incluir: ${missingItems.join(', ')}`);
          return; // Sai da função se houver itens ausentes
      }
  
      // Verificações básicas
      if (!data || data.length === 0) {
          console.error("Nenhum dado disponível para inserir.");
          return;
      }
  
      if (Object.keys(columnMapping).length === 0) {
          console.error("Nenhuma coluna mapeada. Verifique o mapeamento.");
          return;
      }
  
      const dataToInsert = data.map((item) => {
          let mappedItem = {};
          Object.entries(columnMapping).forEach(([dbColumn, excelColumn]) => {
              if (excelColumn) {
                  mappedItem[dbColumn] = item[excelColumn];
              }
          });
          return mappedItem;
      });
  
      console.table(dataToInsert);
  
      try {
          const result = await window.api.insertData(dataToInsert, columnMapping);
  
          // Define os logs diretamente
          setLogs(result.logs);
  
          console.log(result);
          if (result.success) {
              console.log("Dados inseridos com sucesso!");
              // Remove os itens incluídos da lista de desativados após a inserção
              setOpcoesDesativadas(prevState => [
                  ...prevState.filter(item => !missingItems.includes(item))
              ]);
          } else {
              console.error("Erro ao inserir dados:", result.error);
          }
  
          // Verifica se há algum erro nos logs
          const hasError = result.logs.some(log => log.type && log.type.includes("error"));
          if (hasError) {
              showError();
          } else {
              showSuccess();
          }
      } catch (error) {
          console.error("Erro ao chamar a API:", error);
          showError(); // Mostra erro genérico em caso de falha na API
      }
  };
  
  
  
    
    console.log(opcoesDesativadas)
  

return (
    <div>
    <div className='colunas'>
    {data && data.length > 0 ? (
                    // Para cada coluna, exibi uma lista dos valores dessa coluna em todos os itens de data
                    columnNames.map((colName, colIndex) => (
                        <div className='coluna' key={colIndex}>
                        
                            <DropdownSearch 
                                      itensList={colunaSelected.filter((coluna) => !opcoesDesativadas.includes(coluna))} 
                                      nomeLabel={`Escolha a coluna ${colName}`} 
                                      onSelect={(newOption) => {
                                        handleOptionChange(colName, selectedOptions[colName], newOption);
                                        setSelectedOptions((prev) => ({ ...prev, [colName]: newOption }));
                                        handleColumnSelect(colName, newOption);
                                      }}
                            />
                        
                        <div className='conteudo-coluna'>
                                {data.slice(0, 100).map((item, index) => (
                                    <p key={index} className='item-linha'>
                                        {typeof item[colName] === 'string' ? item[colName].toUpperCase() : String(item[colName])}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
            <div className='container-vazio'>
                {/* <img ref={imglaughter} src={laughter} alt="Vazio" style={{display:'none'}}/> */}
                <img src={iconOpenBox} alt="Vazio" className='icon-open-box'/>
                <p >Nenhum dado disponível</p>
                <p>{selectedTypeOption}</p>
            </div>
            
        )}
    </div>
    <button onClick={handleInsertData}>Inserir Dados no Banco</button>
    </div>
  );
}
