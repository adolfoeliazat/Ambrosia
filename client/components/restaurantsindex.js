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
      search: localStorage.search,
      selected: localStorage.sort,
      display: [1,1,1,1], // numer of column
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
    window.onSort = () => {
      this._update();
    }
  }

  componentWillUnmount () {
    window.onContentScrollEnd = null;
  }

  _update = () => {
    this.props.relay.forceFetch({
      name: localStorage.search || null,
      open: localStorage.sort === 'open' ? true : false
    }, (readyState) => {
      if (readyState.done) console.log('readystate');
    });
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
    var restaurants = this.props.restaurant.restaurants.edges;
    if(localStorage.sort === 'rated') {
      restaurants.sort((a, b) => {
        return b.node.reviews.averageScore - a.node.reviews.averageScore;
      });
    }
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
    name: localStorage.search || null,
    open: localStorage.sort === 'open',
    count: 20
  },
  prepareVariables: (prev) => {
    console.log('prepareVariables');
    return {
      location: localStorage.geolocation
        ? JSON.parse(localStorage.geolocation)
        : null,
      name: localStorage.search || null,
      open: localStorage.sort === 'open',
      count: prev.count,
    };
  },
  fragments: {
    restaurant: () => Relay.QL `
    fragment on Root {
      restaurants(first: $count, location: $location, name: $name, open: $open) {
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
