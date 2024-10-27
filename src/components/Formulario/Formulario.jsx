
import React, { useState, useRef, useEffect } from "react";
import "./Formulario.css";
import Dropdown from "../Dropdown/Dropdown";
import iconFolder  from "../../assets/icons/pasta.svg";

export default function Formulario() {

  const [filePath, setFilePath] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedConversion, setSelectedConversion] = useState('');
  const orientadorDisplayExcelRef = useRef(null);
  const fileInputRef = useRef(null);

  const testeConexao  = () => {
    alert('Conexão realizada com sucesso!');

  }

  const lidarComArquivoSelecionado =  async() => {
    console.log(window.electron);
    
    const paths = await window.electron.abrirArquivoExcel(); // Chama a função do preload
    const nomeArquivo  = paths[0].split('\\').pop();

    if(paths && paths.length > 0){
      setFilePath(paths[0]);
      setFileName(nomeArquivo);
    }
  };

  // Usando useEffect para monitorar mudanças no fileName
  useEffect(() => {
    console.log(`Nome do arquivo atualizado: ${fileName}`);
  }, [fileName]); // O efeito será executado sempre que fileName mudar


  const listConversao = ['Excel', 'Business', 'Control xhb', 'Control Postgres'];
  const tipoConversao  = ['Clientes', 'Produtos'];

  

  const handleSelect = (option) => {
    setSelectedConversion(option);
    orientadorDisplayExcelRef.current.style.display = option === 'Excel' ? 'block' : 'none';
  };

 

  return (
    <>
      <div className="container">
        <Dropdown itensList={listConversao} nomeLabel={'Selecione o tipo de conversão'} onSelect={handleSelect}/>

        {/* <p>Conversão selecionada: {selectedConversion}</p> */}
        {/* Aqui vai aparecer dependendo da opcao selecionada */}
        <div id="orientador-display" ref={orientadorDisplayExcelRef}>

          <form className="form-group">
            <div className="input-nome-banco">
              <label htmlFor="nomeBanco">BD que ira receber os dados</label>
              <input type="text" name="nomeBanco" id="nomeBanco" placeholder="Nome do Banco"/>
              
            </div>
            
            <button type="button" id="testeConexao" onClick={testeConexao}>Testar conexão</button>
          </form>

          <div className="form-group-footer">
            <Dropdown  itensList={tipoConversao} nomeLabel={'Dados a serem importados'} /> 
           {/* add input file aqui */}
           <div onClick={lidarComArquivoSelecionado} id="buttonFilePath" style={{ backgroundColor: fileName ? '#7CFFAE' : '#F2F2F2' }}>
              <p>{fileName? fileName : 'Selecione o caminho do excel'}</p>
              <img src={iconFolder}/>
            </div>
            <button type="button" id="carregarDados">Carregar dados</button>
          </div>
        </div>
      </div>
    </>
  );
}
