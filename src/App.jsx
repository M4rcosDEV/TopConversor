
import logo from './assets/Logo_Conversor.png'
import './App.css'
import Formulario from './components/Formulario/Formulario'
import Dropdown from './components/Dropdown/Dropdown'

function App() {
  
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
 
    </div>
  )

}

export default App