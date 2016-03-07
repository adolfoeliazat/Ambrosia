import React from 'react';
import cloneWithProps from 'react-addons-clone-with-props';
import Relay from 'react-relay';
import classnames from 'classnames';
import {Link} from 'react-router';
import List from './icons/list';
import Valid from './icons/valid';
import Display from './icons/display';
import Map from './icons/map';

export class RestaurantsIndexComponent extends React.Component {

  constructor (props, context) {
    super(props, context);
    this.state = {
      search: '',
      selected: 'closer',
      display: [1,1,1,1],
      loading: false
    };
    if (!localStorage.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        localStorage.geolocation = JSON.stringify([position.coords.longitude, position.coords.latitude]);
        this.props.relay.setVariables({
          location: JSON.parse(localStorage.geolocation)
        });
      });
    }
    window.onContentScrollEnd = () => {
      if (this.props.restaurant.restaurants.pageInfo.hasNextPage) {
        this.props.relay.setVariables({
          count: this.props.relay.variables.count + 10
        }, (readyState) => {
          this.state.loading = !readyState.ready;
        });
      }
    }
  }

  _submit = () => {
    console.log('submit');
    window.restaurantName = this.refs.name.value;
    this.props.relay.forceFetch({
      name: this.refs.name.value
    }, (readyState) => {
      if (readyState.done)
        console.log('readyState', this.props.restaurant.restaurants.edges);
      }
    );
  };

  _onKeyDown = (e) => {
    console.log(e.keyCode);
    if(e.keyCode === 13) this._submit();
  };

  _onSelect = (e) => {
    var e = e.target;
    console.log(e.options[e.selectedIndex].value);
    this.setState({
      orderByScore: e.options[e.selectedIndex].value === '2' ? true : false
    });
  };

  _update = (e) => {
    console.log('update', e.currentTarget.id);
    this.state.selected = e.currentTarget.id;
    this.props.relay.forceFetch({
      name: this.refs.name.value || null,
      rated: e.currentTarget.id === 'rated' ? true : false,
      open: e.currentTarget.id === 'open' ? true : false
    }, (readyState) => {
      if (readyState.done) console.log('readystate');
    });
  };

  _onChangeDisplay = (e, array) => {
    console.log('_onChangeDisplay');
    this.setState({display: array});
  };

  renderChildren = () => {
    console.log('renderChildren', this.state.orderByScore);
    return React.Children.map(this.props.children, (child) => {
      return cloneWithProps(child, {
        restaurants: this.props.restaurant.restaurants.edges,
        display: this.state.display,
        loading: this.state.loading,
        geolocation: localStorage.geolocation
          ? JSON.parse(localStorage.geolocation)
          : null
      });
    });
  };

  render () {
    console.log('render', this.props.restaurant.restaurants.edges);
    return (
      <div className='restaurants-index'>
        {this.renderChildren()}
      </div>
    )
  }
}

class DisplayButton extends React.Component {
  constructor (props, context) {
    super(props, context);
    this.state = {expand: false};
  }

  render () {
    return (
      <div className="display" onClick={(e)=>this.setState({expand : !this.state.expand})}>
        <i>Display: </i>
        <span className="display-selected"><Display array={this.props.displayed}/></span>
        <div className={classnames('display-list', {hidden: !this.state.expand})}>
          <div className='display-item'><Display array={[1]} onClick={this.props.onClickItem} size={'2em'}/></div>
          <div className='display-item'><Display array={[1,1]} onClick={this.props.onClickItem} size={'2em'}/></div>
          <div className='display-item'><Display array={[1,1,1]} onClick={this.props.onClickItem} size={'2em'}/></div>
          <div className='display-item'><Display array={[1,1,1,1]} onClick={this.props.onClickItem} size={'2em'}/></div>
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(RestaurantsIndexComponent, {
  initialVariables: {
    location: localStorage.geolocation
      ? JSON.parse(localStorage.geolocation)
      : null,
    name: window.restaurantName || null,
    rated: false,
    open: false,
    count: 20
  },
  prepareVariables: (prev) => {
    console.log('prepareVariables');
    return {
      location: localStorage.geolocation
        ? JSON.parse(localStorage.geolocation)
        : null,
      name: window.restaurantName || null,
      rated: prev.rated,
      open: prev.open,
      count: prev.count,
    };
  },
  fragments: {
    restaurant: () => Relay.QL `
    fragment on Root {
      restaurants(first: $count, location: $location, name: $name, rated: $rated, open: $open) {
          edges {
            node {
              id,
              name,
              description,
              distance,
              picture,
              reviews {
                averageScore
              }
              scorable,
              open,
              location {
                coordinates,
                type
              }
              foods {
                name,
                description
                meals {
                  name,
                  description
                }
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }`
  }
})
