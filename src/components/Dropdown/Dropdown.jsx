import { useState, useRef, useEffect } from 'react';
import './Dropdown.css';

function Dropdown({ itensList, nomeLabel, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(nomeLabel);
  const menuRef = useRef(null);
  const selectRef = useRef(null); // Referência para o elemento do select

  // Inverte o dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectOption = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  // Função para lidar com cliques fora do dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verifica se o clique foi fora do menu e do select
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        selectRef.current && !selectRef.current.contains(event.target)
      ) {
        setIsOpen(false); // Fecha o dropdown
      }
    };

    // Adiciona o ouvinte de eventos
    document.addEventListener('mousedown', handleClickOutside);

    // Limpa o ouvinte de eventos ao desmontar o componente
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div className="dropdown">
        <div
          className={`select ${isOpen ? 'select-clicked' : ''}`}
          onClick={toggleDropdown}
          ref={selectRef} // Referência para o elemento do select
        >
          <span className="selected">{selectedOption}</span>
          <div className={`caret ${isOpen ? 'caret-rotate' : ''}`}></div>
        </div>
        <ul ref={menuRef} className={`menu ${isOpen ? 'menu-open' : ''}`}>
          {itensList.map((option, index) => (
            <li
              key={index}
              className={selectedOption === option ? 'active' : ''}
              onClick={() => selectOption(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dropdown;
