import React, { useContext, useRef, useState } from 'react';
import { DataContext } from "../../context/DataContext";
import './ColunasInformacao.css';
import DropdownSearch from '../DropdownSearch/DropdownSearch';
import iconOpenBox from "../../assets/icons/open-box.png";
import laughter from "../../assets/icons/laughter.png";

export default function ColunasInformacao() {
    const [selectedItem, setSelectedItem] = useState(null);
    const [colunasSearch, setColunasSearch] = useState([]);
    const [count, setCount] = useState(0);
    const imgMove = useRef(null);
    const imglaughter = useRef(null);
  const {data} = useContext(DataContext);
  
  const colunas =[
        'codprod', 'nomprod', 'espprod', 'graprod', 'codfabr',
        'codfili', 'cl1prod', 'cl2prod', 'cl3prod', 'cl4prod',
        'depprod', 'tipprod', 'obsprod', 'desresu', 'fgedeci',
        'xyzprod', 'atuprod', 'cod_ipi', 'cod_irr', 'subfede',
        'ncmprod', 'imgprod', 'refgrad', 'codgrad', 'codregr',
        'filfabr', 'marprod', 'negprod', 'indprod', 'tipipro',
        'genepro', 'lisipro', 'ex_prod', 'indprop', 'codprop',
        'filprop', 'endprop', 'ctnprod', 'cbccpro', 'recprod',
        'prociap', 'prodepr', 'regr_sa', 'regr_en', 'parfide',
        'escombo', 'agrgrad', 'lismate', 'ctnfatu', 'syngrad',
        'prouuid', 'negunid', 'divisa1', 'divisa2', 'divisa3',
        'divisa4', 'divisa5', 'vndiven', 'duraiven', 
        'iteiven', 'qtdiven', 'qtddevol', 'vlriven', 'tipiven', 
        'codnatu', 'tipnatu', 'veniven', 'vlrdesc', 'filprod', 
        'datvend', 'filiven', 'usonatu', 'sesprod', 'sefprod', 
        'iniaten', 'finaten', 'seqprod', 'ivenvnd', 'ivenite', 
        'ivenfil', 'codsequ', 'keyiven', 'id_prod'
    ];

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
    console.log(columnNames)
    
    //console.log(data?.map((item)  => item["coluna2"] || ""));
    // const verificarSelect = (option) => {
    //     setColunasSearch((prevColunasSearch) => {
    //       const updatedColunasSearch = [...prevColunasSearch, option];
    //       console.log('Colunas atualizadas:', updatedColunasSearch); // Valor atualizado
    //       return updatedColunasSearch;
    //     });
    //     setSelectedItem(option);
    //     console.log('Opção selecionada:', option); 
    //   };

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
        console.log('Opção selecionada:', option); 
      };
<<<<<<< HEAD
      
      const handleDropdownChange = (key, valor) => {
        setVinculacoes((prev) => ({
          ...prev,
          [key]: valor, // Vincula a coluna com o valor
        }));
      };

      const handleSubmit = () => {
        // Aqui você pode processar os dados vinculados para enviar ao banco de dados
        console.log(vinculacoes); // Exibe as vinculações no console
        // Implemente a lógica de inserção no banco de dados aqui
      };

  return (
=======
      return (
>>>>>>> a5aa245 (corrigido a pocicao do icone da pasta no botao de selecionar excel para ficar responsivo)
    <div>
    <div className='colunas'>
    {data && data.length > 0 ? (
                    // Para cada coluna, exibi uma lista dos valores dessa coluna em todos os itens de data
                    columnNames.map((colName, colIndex) => (
                        <div className='coluna' key={colIndex}>
                            <DropdownSearch itensList={colunas} nomeLabel={'Escolha a coluna'} onSelect={verificarSelect} />
                            <div className='conteudo-coluna'>
                                {data.map((item, index) => (
                                    <p key={index} className='item-linha'>
                                        {typeof item[colName] === 'string' ? item[colName].toUpperCase() : String(item[colName])}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
            <div className='container-vazio'>
                <img ref={imglaughter} src={laughter} alt="Vazio" style={{display:'none'}}/>
                <img ref={imgMove} src={iconOpenBox} alt="Vazio" className='icon-open-box' onMouseMove={translateImg}/>
                <p >Nenhum dado disponível</p>
            </div>
            
        )}
    </div>

    </div>
  );
}
