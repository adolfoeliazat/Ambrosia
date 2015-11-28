import React from 'react';
import Relay from 'react-relay';
import classnames from 'classnames';
import {Link} from 'react-router';
import UserMutation from '../mutations/usermutation';

//Picture Profile
//name
//Restaurant owned
//an history of orders made as a user
class Profile extends React.Component {

  constructor(props, context) {
    super(props, context);
    var user = this.props.user.user;
    this.state = {
      update: {
        name: user.name ? user.name : 'Your name here',
        mail: user.mail ? user.mail : 'Your mail here',
        profilePicture: user.profilePicture || '/stylesheets/icons/profile.jpeg',
      },
      save: false
    };
  }

  componentDidMount () {
    if(!this.props.user.user.userID) {
      console.log('Start:ComponentDidMount', this.props.user.user.userID);
      this.props.history.pushState({previousPath: '/start'}, '/register');
    }
  }

  componentWillReceiveProps(newProps) {
    var user = newProps.user.user;
    console.log('Start:componentWillReceiveProps', newProps.user.user.userID);
    if(!newProps.user.user.userID) {
      this.props.history.pushState({previousPath: '/start'}, '/register');
    }
    this.setState({
      update: {
        name: user.name ? user.name : 'Your name here',
        mail: user.mail ? user.mail : 'Your mail here',
        profilePicture: user.profilePicture || '/stylesheets/icons/profile.jpeg',
      },
      save: false
    });
  }

  _onChange = (e) => {
    console.log('onchange');
    this.state.update[e.target.id] = e.target.value;
    this.setState({
      update: this.state.update,
      save: true
    });
  }

  _onKeyUp = (e) => {
    console.log('onkeyUp', e.keyCode);
    if(e.keyCode === 13) {
      new Relay.Store.update(new UserMutation({user: this.props.user.user, update: this.state.update}));
      e.target.blur();
    }
    if(e.keyCode === 27) {
      e.target.blur();
    }
  }
  render() {
    var user = this.props.user.user;
    var createRestaurant = (resto, index) => {
      var bool = user.restaurants.edges.length === index+1;
      return <Link to ={'/timeline/'+resto.node.id} className={classnames({'last-restaurant': bool, restaurant: !bool})} key={resto.node.id}>{resto.node.name}</Link>;
    };
    var createOrder = (order, index) => {
      var date = new Date(order.node.date);
      var bool = !(user.orders.edges.length === index+1);
      return (
        <div className={classnames({'order': bool, 'last-order': !bool})} key={order.node.id}>
          <div>{date.toLocaleDateString()}</div>
          <div>{date.getHours()} Hours {date.getMinutes()} Minutes</div>
          <span className='price'>{order.node.price} mɃ</span>
        </div>
      );
    };
    return (
      <div className='profile'>
        <div className='flex'>
          <img src={user.profilePicture ? user.profilePicture : '/stylesheets/icons/profile.jpeg'} alt="Profile-Picture"/>
          <div className='credentials marged'>
            <h1><input id='name' type='text' onChange={this._onChange} onKeyUp={this._onKeyUp} value = {this.state.update.name} /></h1>
            <h2><input id='mail' type='text' onChange={this._onChange} onKeyUp={this._onKeyUp} value = {this.state.update.mail} /></h2>
            <Link className='openarestaurant-link button' to = {'/start/card'}>Open a restaurant.</Link>
          </div>
        </div>
        <div className='flex'>
          <div className={classnames('width-2', {hidden: !user.restaurants.edges.length})}>
            <h3>Your Restaurants</h3>
            <div className='restaurants-list'>{user.restaurants.edges.map(createRestaurant)}</div>
          </div>
          <div className='width-2'>
            <h3>Your Orders</h3>
            <div className='orders-list'>{user.orders.edges.map(createOrder)}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(Profile, {
  //can't query for orders cause they do not have an id in the database...
  fragments: {
    user: () => Relay.QL`
    fragment on Root {
      user {
        ${UserMutation.getFragment('user')}
        id,
        userID,
        name,
        mail,
        profilePicture,
        restaurants(first: 10) {
          edges {
            node {
              id,
              name
            }
          }
        }
        orders(first: 30) {
          edges {
            node {
              id,
              price,
              date
            }
          }
        }
      }
    }
    `
  }
});
