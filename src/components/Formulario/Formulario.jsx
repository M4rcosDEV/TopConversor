import * as React from "react";
import { useState, useRef } from "react";
import "./Formulario.css";
import Dropdown from "../Dropdown/Dropdown";


export default function Formulario() {
  const [selectedConversion, setSelectedConversion] = useState('');
  const orientadorDisplayExcelRef = useRef(null);

  const testeConexao  = () => {
    alert('Conexão realizada com sucesso!');

  }




  const listConversao = ['Excel', 'Business', 'Control xhb', 'Control Postgres'];
  const tipoConversao  = ['Clientes', 'Produtos'];

  

  const handleSelect = (option) => {
    setSelectedConversion(option);

    switch(option) {
      case 'Excel':
        orientadorDisplayExcelRef.current.style.display = 'block';
        break;
      case 'Business':
        orientadorDisplayExcelRef.current.style.display = 'none';
        break;
      case 'Control xhb':
        orientadorDisplayExcelRef.current.style.display = 'none';
        break;
      case 'Control Postgres':
        orientadorDisplayExcelRef.current.style.display = 'none';
        break;
      default:
        orientadorDisplayExcelRef.current.style.display = 'none';
        break;
    }
  };

 
  

  return (
    <>
      <div className="container">
        <Dropdown itensList={listConversao} nomeLabel={'Selecione o tipo de conversão'} onSelect={handleSelect}/>

        {/* <p>Conversão selecionada: {selectedConversion}</p> */}
        {/* Aqui vai aparecer dependendo da opcao selecionada */}
        <div id="orientador-display" ref={orientadorDisplayExcelRef}>

          <form className="form-group">
            <input type="text" name="nomeBanco" id="nomeBanco" placeholder="Nome do Banco"/>
            <button type="button" id="testeConexao" onClick={testeConexao}>Testar conexão</button>
          </form>

          <div className="form-group-footer">
            <Dropdown  itensList={tipoConversao} nomeLabel={'Selecione o tipo de conversão'}/> 
            <input type="file" name="caminhoExcel" id="caminhoExcel"/>
            <button type="button">Carregar dados</button>
          </div>
        </div>
      </div>
    </>
  );
}
