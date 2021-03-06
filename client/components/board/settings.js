import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';
import Immutable from 'immutable';
import classnames from 'classnames';
import UpdateRestaurantMutation from '../../mutations/updaterestaurantmutation';

import Close from '../icons/close';
import Loading from '../icons/loading';

import Cursor from '../widget/cursor';
import Hearts from '../widget/hearts';
import Schedule from '../widget/schedule';

var restaurant;
var _update;
var midnightDate;
class BoardSettings extends React.Component {

  constructor(props, context) {
    super(props, context);
    restaurant = Immutable.fromJS(this.props.restaurant.restaurant);
    _update = () => {
      this.state.save = true;
      this.forceUpdate();
    }
    this.state = {save: false, orderLoading: false};
  }

  _settingsUpdateMutation = () => {
    var resto = restaurant.toJS();
    delete resto.__dataID__;
    delete resto.orders;
    resto.schedule.map(object => {
      delete object.__dataID__;
      object.openHours.map(op => delete op.__dataID__);
    });
    console.log('resto', resto);
    var onFailure = () => {
      console.log('onFailure');
    };
    var onSuccess = () => {
      console.log('onSuccess');
      this.setState({save: false});
    };
    Relay.Store.commitUpdate(new UpdateRestaurantMutation({restaurant: resto}), {onFailure, onSuccess});
  };
  //
  // _switch = (e) => {
  //   restaurant = restaurant.set(e.currentTarget.id, !restaurant.get(e.currentTarget.id));
  //   _update();
  // };

  _updateSchedule = (schedule) => {
    console.log('updateSchedule', schedule);
    restaurant = restaurant.set('schedule', schedule);
    _update();
  };

  _onReviewsScroll = (e) => {
    if (e.target.scrollHeight <= e.target.scrollTop + e.target.clientHeight) {
      this.setState({orderLoading: true});
      this.props.relay.setVariables({
        orderCount: this.props.relay.variables.orderCount + 20
      }, readyState => {
        this.state.orderLoading = false;
        //this.setState({orderLoading: false});
      })
    }
  };

  render() {
    midnightDate = new Date().setHours(0,0,0,0);
    var createWeek = (day, index) => {
      return (
        <Day index={index}/>
      );
    }
    return (
      <div className='details'>
        <span className={classnames('submit', {hidden: !this.state.save})} onClick={this._settingsUpdateMutation}>Save Changes</span>
        <h2>Checkout your Schedule</h2>
        <Schedule week={restaurant.get('schedule')} update={this._updateSchedule}/>
        <h2>Last Customer reviews</h2>
        <div className='details-reviews' onScroll = {this._onReviewsScroll}>
          <div className='details-reviews-customer'><span className='userName'><strong>Name</strong></span><span className='widget-hearts' style={{width: '5em', display:'inlineBlock'}}><strong>Rate</strong></span><strong>Comments</strong></div>
          {restaurant.getIn(['orders', 'edges']).map((order, i) => <div className='details-reviews-customer' key={i}><span className='userName'>{order.getIn(['node', 'userName'])}</span><Hearts rate={order.getIn(['node', 'rate'])} size='1em'/>"{order.getIn(['node', 'comments']) || 'no comments'}"</div>)}
          <Loading hidden={this.state.orderLoading} size='2em' />
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(BoardSettings, {
  initialVariables: {
    midnightTime: new Date().setHours(0, 0, 0, 0),
    orderCount: 40
  },
  fragments: {
    restaurant: () => Relay.QL`
    fragment on Root {
      restaurant {
        id,
        scorable,
        open,
        orders(first: $orderCount) {
          edges {
            node {
              id,
              userName,
              date,
              rate,
              comment
            }
          }
        }
        schedule {
          day,
          openHours {
            from,
            to
          }
        }
      }
    }
    `
  }
})
