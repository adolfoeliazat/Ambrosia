import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';
import Immutable from 'immutable';
import classnames from 'classnames';

import Close from '../icons/close';
import Cursor from '../widget/cursor';
import Schedule from '../widget/schedule';

var Settings = {
  scorable : false,
  schedule: [{day: 'monday', openHours:[{from: 0, to:0}]}, {day: 'tuesday', openHours:[{from: 0, to:0}]}, {day: 'wednesday', openHours:[{from: 0, to:0}]}, {day: 'thursday', openHours:[{from: 0, to:0}]}, {day: 'friday', openHours:[{from: 0, to:0}]}, {day: 'saturday', openHours:[{from: 0, to:0}]}, {day: 'sunday', openHours:[{from: 0, to:0}]}]
};
var _update;
var midnightDate;

export default class StartSettings extends React.Component {

  constructor(props, context) {
    super(props, context);
    if(localStorage.settings) {
      Settings = JSON.parse(localStorage.settings);
    }
    Settings = Immutable.fromJS(Settings);
    _update = () => {
      this.forceUpdate();
    }
  }

  _switch = (e) => {
    Settings = Settings.set(e.currentTarget.id, !Settings.get(e.currentTarget.id));
    _update();
  };

  _updateSchedule = (schedule) => {
    Settings = Settings.set('schedule', schedule);
    _update();
  };

  componentWillUnmount () {
    localStorage.settings = JSON.stringify(Settings);
  }

  render() {
    midnightDate = new Date().setHours(0,0,0,0);
    var createWeek = (day, index) => {
      return (
        <Day index={index}/>
      );
    }
    return (
      <div className='settings'>
        <h1 className='intro'>
          Check your restaurant settings.
        </h1>
        <div className='center-text'>
          <div className='setting'><span className='text'> Let customers rate your restaurant</span><Cursor id={'scorable'} size={'1.2em'} on={Settings.get('scorable')} update={this._switch}/></div>
        </div>
        <h2>Check out your opening hours</h2>
        <Schedule week={Settings.get('schedule')} update={this._updateSchedule}/>
      </div>
    );
  }
}
