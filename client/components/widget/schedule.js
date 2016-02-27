import React from 'react';
import classnames from 'classnames';

import Close from '../icons/close';
import {InputNumber} from './input';
import Select from './select';

var midnightDate;
var week;
var _update;
/**
 * [Week description]
 * @param {[object]} props {week: Array<{day: String, openHours: {from: Number to: Number}}>, update: function(Week) }
 */
class Week extends React.Component {
  constructor(props, context) {
    super(props, context);
    midnightDate = new Date().setHours(0,0,0,0);
    week = this.props.week;
    _update = this.props.update;
  }

  render () {
    return (
      <div className = 'widget-opening-hours'>
        {this.props.week.map((day, index)=><Day index= {index}/>)}
      </div>
    );
  }
}
/**
 * A day schedule interface
 * @param  {[object]} props {day: {openHours : Array<object>[{from: Number, to: Number}], day: <string>}, midnightDate: Number, index: Number}
 * @return {[type]}       [description]
 */
class Day extends React.Component {
  constructor(props, context) {
    super(props,context);
    this.state = {time: {from:0, to:0}, expand: false};
  }
  _switch = () => {
    this.setState({expand: !this.state.expand});
  };

  _addHours = () => {
    week[this.props.index].openHours.push({
      from: 0,
      to: 60 * 60 * 1000
    });
    _update(week);
  };

  _removeHours = (index) => {
    week[this.props.index].openHours.splice(index, 1);
    _update(week);
  };

  _onLikeDay = (index) => {
    week[this.props.index].openHours = week[index].openHours;
    _update(week);
  };

  _onCursorMouseDown = (e, index) => {
    console.log('onkeydown');
    this.state.cursorX = e.clientX;
    this.state.id = e.target.id;
    this.state.cursorIndex = index;
  };

  _onCursorMouseUp = (e) => {
    console.log('onMouseUp');
    //week[this.props.index].openHours[this.state.cursor]['to']
    this.state.cursorX = null;
  };

  _onCursorMove = (e) => {
    console.log('cursormove', this.state.cursorX);
    if(!this.state.cursorX) return;
    console.log('cursormove', this.state.id, this.state.cursorX, this.state.cursorIndex);
    var dx = e.clientX - this.state.cursorX;
    var factor = (864 * 100000) / this.refs.day.clientWidth;
    if (this.state.id === 'openHours') {
      week[this.props.index].openHours[this.state.cursorIndex]['to'] += dx * factor;
      week[this.props.index].openHours[this.state.cursorIndex]['from'] += dx * factor;
    } else {
      week[this.props.index].openHours[this.state.cursorIndex][this.state.id] += dx * factor;
    }
    this.state.cursorX = e.clientX;
    _update(week);
  };

  render() {
    var day = week[this.props.index];
    var createSVG = (time, index) => {
      var date = {
        from: new Date(midnightDate + time.from),
        to: new Date(midnightDate + time.to)
      };
      var from = time.from/100000;
      var to = time.to/100000;
      return (
        <g>
          <path id='openHours' d={'M'+(from < to ? from : to)+',12.5 H'+to} stroke='green' strokeWidth='25' onMouseDown={e => this._onCursorMouseDown(e, index)}/>
          <path id='from' className='from' d={'M'+(from < to ? from : to)+',25 V0'} stroke='black' strokeWidth='2' onMouseDown={e => this._onCursorMouseDown(e, index)} onMouseUp={this._onCursorMouseUp} onMouseMove={this._onCursorMove}/>
          <path id='to' className='to' d={'M'+(to < from ? from : to)+',25 V0'} stroke='black' strokeWidth='2' onMouseDown={e => this._onCursorMouseDown(e, index)} onMouseUp={this._onCursorMouseUp} onMouseMove={this._onCursorMove}/>
          <text x={from < to ? from : to} y='-2.5' fill='black' style={{textAnchor: 'middle'}}>{(date.from.getHours()+ 'h' + (date.from.getMinutes() < 10 ? ('0' + date.from.getMinutes()) : date.from.getMinutes()))}</text>
          <text x={to} y='-2.5' fill='black' style={{textAnchor: 'middle'}}>{(date.to.getHours()+ 'h' + (date.to.getMinutes() < 10 ? ('0' + date.to.getMinutes()) : date.to.getMinutes()))}</text>
        </g>
      );
    }

    return (
      <div className='day-container' onMouseUp={this._onCursorMouseUp} onMouseMove={this._onCursorMove}>
        <div className = 'day-header'>
          <span className='button'>Like <Select update = {this._onLikeDay} items={['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']} /></span>
          <span className='button' onClick={this._addHours}><i className='fa fa-plus-square-o'/>Add Hours</span>
        </div>
        <svg ref='day' className='day' viewBox='0 0 864 25'>
          {day.openHours.map(createSVG)}
          <text x={432} y={15} style={{textAnchor: 'middle'}}>{day.day}</text>
        </svg>
      </div>
    );
  }
}
/**
 * THe timepicker
 * @param  {object} props [object {index: Number, [from] || [to]: String}]
 * @return {[type]}       [description]
 */
var TimePicker = function (props) {
  var time = week[props.index].openHours[props.from !== undefined ? props.from : props.to][props.from !== undefined ? 'from' : 'to'];
  var date = new Date(midnightDate + time);

  var _changeHours = (e) => {
    console.log('changeHours', e.target.value);
    if(e.target.value >= 24 || e.target.value <= 0) return;
    date.setHours(e.target.value);
    week[props.index].openHours[props.from !== undefined ? props.from : props.to][props.from !== undefined ? 'from' : 'to'] = date.getTime() - midnightDate;
    _update(week);
  };

  var _changeMinutes = (e) => {
    console.log('changeMinutes', e.target.value);
    if (e.target.value >= 60 || e.target.value <= 0) return;
    date.setMinutes(e.target.value);
    week[props.index].openHours[props.from !== undefined ? props.from : props.to][props.from !== undefined ? 'from' : 'to'] = date.getTime() - midnightDate;
    _update(week);
  };
  return (
    <div className = 'timepicker'>
      <div className='picker'>
        <InputNumber type='number' id='hours' className='hours' value={date.getHours()} update={_changeHours}/> H
      </div>
      <div className='picker'>
        <InputNumber type='number' id='minutes' className='minutes' value={date.getMinutes()} update={_changeMinutes}/> Min
      </div>
    </div>
  );
};
export default Week;
