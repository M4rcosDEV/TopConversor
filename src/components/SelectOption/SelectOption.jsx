import React, { useEffect, useState } from 'react';import "./SelectOption.css"

export default function SelectOption({options}) {

  // useEffect(() => {
  //   const alterNameOption = () =>{
  //     let optionAll = Object.keys(options);
  //     const select_box  = document.getElementById("select-box");
      
  //     optionAll.forEach((option) => {
  //       console.log(`${options[option]} e  ${option}`);
  //       let nameOption = document.createElement('option');
  //       nameOption.value = option;
  //       nameOption.textContent = options[option]; 
  //       select_box.appendChild(nameOption);
  //     });
  
  //   }
  //    alterNameOption();   
  // }, [options])
  
  

  return (
    <>
    <div className="select-container">
      <select id="select-box">
        <option value="">Selecione a conversão</option>
        {Object.keys(options).map((option) => (
          <option key={option} value={option}>
            {options[option]}
          </option>
        ))}
      </select>
    </div>
    </>
  );
}
