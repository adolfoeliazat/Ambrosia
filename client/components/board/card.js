import React from 'react';
import Relay from 'react-relay';
import UpdateRestaurantMutation from '../../mutations/updaterestaurantmutation';

import Close from '../icons/close'

import Input from '../widget/input';
import Textarea from '../widget/textarea';
import classnames from 'classnames';

var card;
//list of var to be used on each component
var updateClass;

/**
 * [description]
 * @param  {[object]} props [pass in the element index props.index]
 * @return {[type]}       [description]
 */
var ImageLoader = (props) => {
  return (
    <i className={classnames('file-image fa fa-file-image-o '+props.width, {hidden: props.hidden})} onClick={e=>setModal({index: props.index})}/>
  );
}

export class Card extends React.Component {

  constructor(props, context) {
    super(props, context);
    if(this.props.restaurant.restaurant) {
      var restaurant = this.props.restaurant.restaurant;
      card = {
        name: restaurant.name,
        description: restaurant.description,
        foods: restaurant.foods,
        picture: restaurant.picture
      };
    }
    this.state = card;
    this.state.save = false;
    updateClass = () => {
      this.state.save = true;
      this.setState(card);
    };
  }

  componentWillLeave () {
    this.props.update('card', card);
  }

  _add = () => {
    this.state.foods.push({
      id: '_' + Math.random().toString(36).substr(2, 9),
      name: 'the food\'s name',
      description: 'the food\'s description',
      meals: [
        {
          id: '_' + Math.random().toString(36).substr(2, 9),
          name: 'the meal\'s name',
          description: 'the meal\'s description',
          price: 0,
        }
      ]
    });
    this.setState({foods: this.state.foods});
  };

  _cardUpdateMutation = () => {
    this.state.foods.map((food) => {
      console.log(food);
      delete food.__dataID__;
      food.meals.map((meal) => delete meal.__dataID__);
    });
    var resto = {
      id: this.props.id,
      name: this.state.name,
      description: this.state.description,
      foods: this.state.foods
    };
    console.log(resto);
    var onFailure = () => console.log('failure');
    var onSuccess = () => this.setState({save: false});
    Relay.Store.update(new UpdateRestaurantMutation({restaurant: resto}), {onFailure, onSuccess});
  };

  _update = (e) => {
    card[e.target.id] = e.target.value;
    updateClass();
  };

  render () {
    console.log('render', this.state.save);
    var createFood = (food, index) => {
      return(
        <Food {...food} index={index} key={food.id}/>
      );
    }
    return (
      <div className='card-edit'>
        <span className={classnames('submit', {hidden: !this.state.save})} onClick={this._cardUpdateMutation}>
          Save changes
        </span>
        <div className='brand' style={{backgroundImage: `url(${this.state.picture})`}}>
          <h1 className='name'>
            <Input id={'name'} value={this.state.name} default={'restaurant-name'} update={this._update}/>
          </h1>
          <h2 className='description'>
            <Textarea id={'description'} value={this.state.description} default={'restaurant-description'} update={this._update}/>
          </h2>
          <ImageLoader width='fa-2x'/>
        </div>
        <div className='marged'>
          <span className='button' onClick={this._add}><i className='fa fa-plus-square-o'/> Add Food-Type</span>
        </div>
        <div className='foods nav-wrap'>
          {this.state.foods.map(createFood)}
        </div>
      </div>
    );
  }
}

class Food extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      expand: false,
      food: this.props,
      input: {
        name: false,
        description: false
      }
    };
  }

  _addMeal = (e) => {
    e.stopPropagation();
    card.foods[this.props.index].meals.push({
      id: '_' + Math.random().toString(36).substr(2, 9),
      name: 'the meal\'s name',
      description: 'the meal\'s description',
      price: 0,
    });
    updateClass();
  };

  _switchExpand = (e) => {
    this.setState({
      expand: !this.state.expand
    });
  };

  _close = () => {
    console.log('close');
    card.foods.splice(this.props.index, 1);
    updateClass();
  };

  _update = (e) => {
    card.foods[this.props.index][e.target.id] = e.target.value;
    updateClass();
  };

  render () {
    var food = this.props;
    console.log(food);
    var createMeal = (meal, index) => <Meal {...meal} parentIndex={this.props.index} index={index} key={meal.id}/>;
    return (
      <div className='food flex-item-2' style={{backgroundImage: `url(${food.picture})`}}>
        <ImageLoader hidden={!this.state.expand} index={this.props.index} width=''/>
        <span className={classnames({hidden: this.state.expand})}>
          <Close onClick={this._close}/>
        </span>
        <div className='food-wrapper'>
          <Input id={'name'} value={this.props.name} placeholder={'food-name'} update={this._update}/><br/>
          <Textarea id={'description'} value={this.props.description} placeholder={'food-description'} update={this._update}/>
        </div>
        <div className={classnames('button-wrapper', {hidden: !this.state.expand})}><span className='button' onClick={this._addMeal}><i className='fa fa-plus-square-o'/> Add a Meal</span></div>
        <div className={classnames('meals', {'nav-wrap': this.state.expand, 'hidden': !this.state.expand})}>
          {this.props.meals.map(createMeal)}
        </div>
        <div className='center-text' onClick={this._switchExpand}>
          <svg className='expand-icon-svg' viewBox='0 0 80 60'>
            <path className='expand-icon-path' d={this.state.expand
              ? 'M0,60 L40,0 L80,60'
              : 'M0,0 L40,60 L80,0'} fill='white' stroke='black' strokeWidth={10}></path>
          </svg>
        </div>
      </div>
    );
  }
}

class Meal extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      meal: this.props,
      input: {
        name: false,
        description: false,
        price: false,
        time: false
      }
    }
  }

  _close = (e) => {
    e.stopPropagation();
    card.foods[this.props.parentIndex].meals.splice(this.props.index, 1);
    updateClass();
  };

  _update = (e) => {
    card.foods[this.props.parentIndex].meals[this.props.index][e.target.id] = e.target.type === 'number'
      ? Math.abs(e.target.value)
      : e.target.value;
    updateClass();
  };

  render () {
    var food = this.props;
    return (
      <div className='meal flex-item-2'>
        <Close onClick={this._close}/>
        <Input id={'name'} value={this.props.name} default={'meal-name'} update={this._update}/><br/>
        <Input id={'description'} value={this.props.description} default={'meal-description'} update={this._update}/><br/>
        <span id='price'><Input type={'number'} id='price' default={0} value={this.props.price} update={this._update}/>mB</span><br/>
      </div>
    );
  }
}

export default Relay.createContainer(Card, {
  fragments: {
    //Question: Is fragment on mutation available on the component himself? no it's not
    //and you use a mutation you have to call mutation fragment if not you get a warning
    restaurant: () => Relay.QL `
    fragment on Root {
      restaurant {
        id,
        name,
        description,
        picture,
        foods {
          id,
          name,
          description,
          picture,
          meals {
            id,
            name,
            description,
            price,
            time
          }
        }
      }
    }
    `
  }
});
