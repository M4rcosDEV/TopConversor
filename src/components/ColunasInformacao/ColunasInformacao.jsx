import React, { useContext, useRef, useState, useEffect } from 'react';
import { DataContext } from "../../context/DataContext";
import './ColunasInformacao.css';
import DropdownSearch from '../DropdownSearch/DropdownSearch';
import iconOpenBox from "../../assets/icons/open-box.png";
import removeSelected from "../../assets/icons/remove_selection.png";
import laughter from "../../assets/icons/laughter.png";

export default function ColunasInformacao() {
    const [selectedItem, setSelectedItem] = useState(null);
    const [colunasSearch, setColunasSearch] = useState([]);
    const [colunasDesativadas, setColunasDesativadas] = useState([]); 
    const [opcoesDesativadas, setOpcoesDesativadas] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [columnMapping, setColumnMapping] = useState({});
    const [count, setCount] = useState(0);
    const imgMove = useRef(null);
    const imglaughter = useRef(null);
    const {data} = useContext(DataContext);
    const {selectedTypeOption} = useContext(DataContext);
      const [colunaSelected, setColunaSelected] = useState([]);
    
      const produto =[
        'numprod', 'descprod', 'preco','numgrad','descgrad','tam','numesto','qtd','local'
      ];
      
      const cliente =[
        'nomeCliente', 'IdadeCliente', 'MatriculaCliente','textrsfx'
      ];
      
      useEffect(() => {
        if (selectedTypeOption === 'Produtos') {
          setColunaSelected(produto);
        } else if (selectedTypeOption === 'Clientes') {
          setColunaSelected(cliente);
        } else {
          setColunaSelected([]);
        }
      }, [selectedTypeOption]); // Roda quando selectedTypeOption muda

    const translateImg = () =>{
      setCount(count + 1);
      const randomX = (Math.random() - 0.5) * 1000;
      const randomY = (Math.random() - 0.5) * 1000;
      
      imgMove.current.style.transform = `translate(${randomX}px, ${randomY}px)`;

      if(count >= 10){
          imglaughter.current.style.display = 'block'
      }else{
          imgMove.current.style.display = 'none'
      }
    };
  
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
          if (result.success) {
              console.log("Dados inseridos com sucesso!");
          } else {
              console.error("Erro ao inserir dados:", result.error);
          }
      } catch (error) {
          console.error("Erro ao chamar a API:", error);
      }
  };
  
    
    //console.log(`COLUNAS DESATIVADAS${colunasDesativadas.map}`)

    const testarColunas =()=>{
      console.table(columnMapping);
    }
  

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
                                      desativados={colunasDesativadas} 
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
                <img ref={imgMove} src={iconOpenBox} alt="Vazio" className='icon-open-box'/>
                <p >Nenhum dado disponível</p>
                <p>{selectedTypeOption}</p>
            </div>
            
        )}
    </div>
    <button onClick={handleInsertData}>Inserir Dados no Banco</button>
    <button onClick={testarColunas}>Teste</button>
    </div>
  );
}
