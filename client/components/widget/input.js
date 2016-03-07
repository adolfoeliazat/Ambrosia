import React from 'react';
import classnames from 'classnames';

var Input = (props) => {
  var _update = (e) => {
    if(e.keyCode === 13 || e.keyCode === 27) e.target.blur()
    props.update(e);
  };

  var _onValid = (e) => {
    props.onValid(e) || props.update(e);
  };
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext("2d");
  ctx.font = "11px BlinkMacSystemFont";
  var width = ctx.measureText(props.value || props.placeholder).width * 2.1 + (props.type === 'number' ? 20 : 32);
  return (
    <span>
      <input className={'widget-input'} placeholder={props.placeholder} type={props.type ? props.type : 'text'} id={props.id} value={props.value || null} onBlur={_onValid} onChange={_update} style={{width: width + 'px'}}/>
    </span>
  );
};

export var InputNumber = (props) => {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext("2d");
  ctx.font = "11px BlinkMacSystemFont";
  var width = ctx.measureText(props.value).width * 2.1 + (props.type === 'number' ? 20 : 0);
  return (
    <span>
      <input className={'widget-input ' + props.className || ''} type={props.type ? props.type : 'text'} id={props.id} value={props.value} onChange={props.update} style={{width: width + 'px'}}/>
    </span>
  );
};

export default Input;
