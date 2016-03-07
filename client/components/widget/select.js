import React from 'react';

var Select = (props) => {
  var _optionClick = (e) => {
    console.log('optionClick', e.target.value, e.currentTarget.value);
    props.update(props.items.indexOf(e.target.value));
  }
  return (
    <select className='widget-select' value={props.items[props.selected]} onChange={_optionClick}>
      {props.items.map((item, index) => <option id={index} key={index}>{item}</option>)}
    </select>
  );
}

export default Select;
