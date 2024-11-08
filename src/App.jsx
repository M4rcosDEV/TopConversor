
import logo from './assets/Logo_Conversor.png'
import './App.css'
import Formulario from './components/Formulario/Formulario'
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import React from "react";
import ColunasInformacao from './components/ColunasInformacao/ColunasInformacao';
import { DataProvider } from './context/DataContext';
import DialogoInformacao from './components/DialogoInformacao/DialogoInformacao';

function App() {
  return (
    <DataProvider>
     
      <div>
      <header></header>
      <section className='container-father'>
          <div className="triangulo"></div>
          <section className="container-header">
            <div className='imagem-logo'>
              <img id='logo-conversor' src={logo} className="logo" alt="Logo conversor" />
            </div>
            <div  className='container'>
              <Formulario/>
            </div>
        </section> 
      </section>
    
      <section className='container-main'>
        <ColunasInformacao/>
      </section>
      </div>
    </DataProvider>
  )
}

export default App