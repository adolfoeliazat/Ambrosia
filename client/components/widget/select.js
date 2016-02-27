import React from 'react';

var Select = (props) => {
  var _optionClick = (e) => {
    props.update(e.target.id);
  }
  return (
    <select className='widget-select'>
      {props.items.map((item, index) => <option id={index} onClick={_optionClick}>{item}</option>)}
    </select>
  );
}

export default Select;
