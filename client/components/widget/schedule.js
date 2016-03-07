import React from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import classnames from 'classnames';
import Immutable from 'immutable';
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
        {week.map((day, index)=><Day index= {index}/>)}
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
    this.state = {};
  }

  _switch = () => {
    this.setState({expand: !this.state.expand});
  };

  _addHours = () => {
    week = week.updateIn([this.props.index, 'openHours'], list => list.push(
      Immutable.fromJS({from: 0, to: 60 * 60 * 1000})
    ));
    _update(week);
  };

  _removeHours = (e, index) => {
    console.log('removeHours', index);
    week = week.deleteIn([this.props.index, 'openHours', index]);
    _update(week);
  };

  _onLikeDay = (index) => {
    console.log(index);
    week = week.setIn([this.props.index, 'openHours'], week.getIn([index, 'openHours']));
    _update(week);
  };

  _onCursorMouseDown = (e, index) => {
    this.state.cursorX = e.clientX;
    this.state.id = e.target.id;
    this.state.cursorIndex = index;
  };

  _onCursorMouseUp = (e) => {
    //week[this.props.index].openHours[this.state.cursor]['to']
    var to = week.getIn([this.props.index, 'openHours', this.state.cursorIndex, 'to']);
    var from = week.getIn([this.props.index, 'openHours', this.state.cursorIndex, 'from']);
    week = week.setIn([this.props.index, 'openHours', this.state.cursorIndex, 'to'], Math.round(to/(5*60*1000)) * (5*60*1000));
    week = week.setIn([this.props.index, 'openHours', this.state.cursorIndex, 'from'], Math.round(from/(5*60*1000)) * (5*60*1000));
    this.state.cursorX = null;
    _update(week);
  };

  _onCursorMove = (e) => {
    if(!this.state.cursorX) return;
    var dx = e.clientX - this.state.cursorX;
    var factor = (864 * 100000) / this.refs.day.clientWidth;
    if (this.state.id === 'openHours') {
      week = week.updateIn([this.props.index, 'openHours', this.state.cursorIndex, 'to'], value => value += dx * factor);
      week = week.updateIn([this.props.index, 'openHours', this.state.cursorIndex, 'from'], value => value += dx * factor);
    } else {
      week = week.updateIn([this.props.index, 'openHours', this.state.cursorIndex, this.state.id], value => value += dx * factor);
    }
    this.state.cursorX = e.clientX;
    _update(week);
  };

  render() {
    var day = week.get(this.props.index);
    var createSVG = (time, index) => {
      var date = {
        from: new Date(midnightDate + time.get('from')),
        to: new Date(midnightDate + time.get('to'))
      };
      var from = time.get('from')/100000;
      var to = time.get('to')/100000;
      return (
        <g className='open-hours'>
          <path id='openHours' d={'M'+(from < to ? from : to)+',12.5 H'+to} stroke='green' strokeWidth='25' onMouseDown={e => this._onCursorMouseDown(e, index)}/>
          <Close x={from + 3} y={1} index={index} onClick={this._removeHours}/>
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
          <span className='button'>Like <Select update = {this._onLikeDay} selected={this.props.index} items={['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']} /></span>
          <span className='button' onClick={this._addHours}><i className='fa fa-plus-square-o'/> Add Hours</span>
        </div>
        <svg ref='day' className='day' viewBox='0 0 864 25'>
          {day.get('openHours').map(createSVG)}
          <text x={432} y={15} style={{textAnchor: 'middle'}}>{day.get('day')}</text>
        </svg>
      </div>
    );
  }
}
export default Week;
