import React from 'react';

var Select = (props) => {
  var _optionClick = (e) => {
    console.log('optionClick', e, e.currentTarget);
    props.update(e.target.id);
  }
  return (
    <select className='widget-select' defaultValue={props.items[props.selected]} onClick={_optionClick}>
      {props.items.map((item, index) => <option id={index} key={index} onClick={_optionClick}>{item}</option>)}
    </select>
  );
}

export default Select;
