
import logo from './assets/Logo_Conversor.png'

import './App.css'
import Formulario from './components/Formulario/Formulario'
import { alertClasses } from '@mui/material';

function App() {
  const dropdown = document.querySelectorAll('.dropdown');
  dropdown.forEach(dropdown=>{
    const select = dropdown.querySelector('.select'),
    caret = dropdown.querySelector('.caret'),
    menu = dropdown.querySelector('.menu'),
    options = dropdown.querySelectorAll('.menu li'),
    selected = dropdown.querySelector('.selected');

  select.addEventListener('click', () => {
    select.classList.toggle('select-clicked');
    caret.classList.toggle('caret-rotate');
    menu.classList.toggle('menu-open');
  });

 options.forEach(option => {
  option.addEventListener('click',()=>{
    selected.innerText =option.innerText;
    select.classList.remove('select-clicked');
    caret.classList.remove('caret-rotate');
    menu.classList.remove('menu-open');

    options.forEach(option=>{
      option.classList.remove('active');
    });
    option.classList.add('active');
  });
 
 });
  });


  return (
    <div>
      <header></header>
      <section className="container-header">
        <div className='imagem-logo'>
          <img id='logo-conversor' src={logo} className="logo" alt="Logo conversor" />
        </div>
        <div  className='container'>
          <Formulario/>
        </div>
      </section> 


    <div className='dropdown'> 
      <div className='select'>
          <span className='selected'>Selecione o tipo de conversão</span>
          <div className='caret'></div>
      </div>
      <ul className='menu'>
      <li>Excel</li>
      <li>Busines</li>
      <li>Control xhb</li>
      <li>Control Postgres</li>
      </ul>
  </div>
      
      <hr />
      <section className='container-main'>
        {/* exemplo de coluna */}
        <div className='coluna'>
          <span className='buscarColuna'>
              <p>Qual coluna se refere</p>
          </span>
          <div className='conteudo-coluna'>
          <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
          </div>
          
        </div>

        <div className='coluna'>
          <div className='buscarColuna'>
              <p>Qual coluna se refere</p>
          </div>
          <div className='conteudo-coluna'>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
          </div>
        </div>
        <div className='coluna'>
          <div className='buscarColuna'>
              <p>Qual coluna se refere</p>
          </div>
          <div className='conteudo-coluna'>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
              <p>Informações excel</p>
          </div>
        </div>
        
      </section>
      
      {/* <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div> */}
 
    </div>
  )

}

export default App