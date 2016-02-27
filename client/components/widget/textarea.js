import React from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import classnames from 'classnames';

export default class Textarea extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  _update = (e) => {
    if(e.keyCode === 27) e.target.blur()
    this.props.update(e);
  };

  _onValid = (e) => {
    this.props.onValid() || this.props.update(e);
  };

  render() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    ctx.font = "11px BlinkMacSystemFont";
    var rows = (this.props.value.match(/\n/g)||[]).length;
    var longestString = () => {
      if(!this.props.value) return;
      var defaultString = '';
      var strings = this.props.value.split("\n");
      strings.forEach(string => {
        string.length > defaultString.length ? defaultString = string : defaultString = defaultString;
      });
      return defaultString;
    }
    var width = ctx.measureText(this.props.value || this.props.placeholder).width * 2.1 + 32;
    return (
      <span>
        <textarea className='widget-textarea' placeholder={this.props.placeholder} type='text' id={this.props.id} defaultValue={this.props.value} onBlur={this._onValid} onChange={this._update} rows={rows + 1} style={{width: width + 'px'}}/>
      </span>
    );
  }
}
