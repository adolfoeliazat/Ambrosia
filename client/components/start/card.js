import React from 'react';
import Relay from 'react-relay';
import shallowCompare from 'react-addons-shallow-compare';
import Immutable from 'immutable';
import request from 'superagent';
import Close from '../icons/close';
import Input from '../widget/input';
import {InputNumber} from '../widget/input';
import Modal from '../widget/modal';
import Textarea from '../widget/textarea';
import classnames from 'classnames';
import URL from '../../../stylesheets/images/images-url.js';

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var restaurant = {
  name: '',
  description: '',
  picture: URL["background-restaurant"][getRandomInt(0, URL["background-restaurant"].length)],
  foods: [
    {
      id: '_' + Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
      picture: URL["background-food"][getRandomInt(0, URL["background-food"].length)],
      meals: [
        {
          id: '_' + Math.random().toString(36).substr(2, 9),
          name: '',
          description: '',
          price: 0,
          time: 0
        }
      ]
    }
  ]
};

//list of var to be used on each component
var updateClass;
var setModal;

var Plus = () => {
  return (
    <svg className='plus-icon-svg' viewBox='0 0 80 80'>
      <path d='M0,40 L80,40 M40,0 L40,80'/>
    </svg>
  );
}
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
//
// class Close extends React.Component {
//   render() {
//     return (
//       <svg className='close-icon-svg' viewBox='0 0 80 80'>
//         <path d='M10,10 L70,70 M70,10 L10,70'/>
//       </svg>
//     );
//   }
// }

export default class Restaurant extends React.Component {

  constructor(props, context) {
    super(props, context);
    //convert restaurant object to Immutable structure
    if(localStorage.restaurant) {
      //restaurant's allready immutable when saved in localstorage
      restaurant = JSON.parse(localStorage.restaurant);
    }
    restaurant = Immutable.fromJS(restaurant);
    this.state = {modal: null};
    updateClass = () => {
      this.forceUpdate();
    }
    setModal = (data) => {
      if(data) {
        data = {
          index: data.index !== undefined ? data.index : this.state.modal ? this.state.modal.index : undefined,
          picture: data.picture || null
        }
      }
      this.setState({modal: data});
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentWillUnmount () {
    localStorage.restaurant = JSON.stringify(restaurant);
  }

  _add = () => {
    restaurant = restaurant.updateIn(['foods'], list => list.push(
      Immutable.fromJS(
        {
          id: '_' + Math.random().toString(36).substr(2, 9),
          name: '',
          description: '',
          picture: URL["background-food"][getRandomInt(0, URL["background-food"].length)],
          meals: [
            {
              id: '_' + Math.random().toString(36).substr(2, 9),
              name: '',
              description: '',
              price: 0,
              time: 0
            }
          ]
        })
      )
    )
    updateClass();
  };

  _update = (e) => {
    restaurant = restaurant.set(e.target.id, e.target.value);
    updateClass();
  };

  _updateModalPicture = (url, e) => {
    if(typeof url !== 'string') url = e.target.value;
    setModal({picture: url});
  };

  _updateElementPicture = () => {
    if(this.state.modal.index !== undefined) {
      restaurant = restaurant.updateIn(['foods', this.state.modal.index], food => food.set('picture', this.state.modal.picture));
    } else {
      restaurant = restaurant.set('picture', this.state.modal.picture);
    }
    this.setState({modal: null});
  };

  _onDrop = (e) => {
    e.preventDefault();
    var fileReader = new FileReader();
    // fileReader.readAsDataURL(e.dataTransfer.files[0]);
    // fileReader.onloadend = (e) => {
    //   this._updateModalPicture(e.target.result);
    // }
    fileReader.readAsBinaryString(e.dataTransfer.files[0]);
    fileReader.onloadend = (e) => {
      request.post('/upload')
        .send({file: e.target.result})
        .end((err, result) => {
        });
    }
  };

  render () {
    var createFood = (food, index) => {
      return(
        <Food food={food} index={index} key={food.get('id')}/>
      );
    }
    return (
      <div className='card-edit'>
        <Modal hidden={!this.state.modal}>
          <div>
            <Close onClick={e=>this.setState({modal: null})} size='2em'/>
            <h2>Upload a picture from your desktop</h2>
            <div className='drop-zone' onDrop={this._onDrop} onDragOver={e => e.preventDefault()}>
              <i className='fa fa-crosshairs fa-5x'/>
            </div>
            <h2>Or Add a picture from the web</h2>
            <Input placeholder='url-picture' type='text' update={e=>this._updateModalPicture(null, e)}/>
            <h2>Or Choose a picture from our list</h2>
            <div className='picture-list'>
              {URL[this.state.modal ? this.state.modal.index !== undefined ? "background-food" : "background-restaurant" : "background-food"].map(url=><img onClick={e=>this._updateModalPicture(url)} className='picture-list-item' src={url}/>)}
            </div>
            <div className='padded'>
              <img className='picture-loaded' src={this.state.modal ? this.state.modal.picture : null}/>
              <span className='button' onClick={this._updateElementPicture}>Load!</span>
            </div>
          </div>
        </Modal>
        <div className='brand' style={{backgroundImage: `url(${restaurant.get('picture')})`}}>
          <h1 className='name'>
            <Input id={'name'} value={restaurant.get('name')} placeholder={'restaurant-name'} update={this._update}/>
          </h1>
          <h2 className='description'>
            <Textarea id={'description'} value={restaurant.get('description')} placeholder={'restaurant-description'} update={this._update}/>
          </h2>
          <ImageLoader width='fa-2x'/>
        </div>
        <div className='marged'>
          <span className='button' onClick={this._add}><i className='fa fa-plus-square-o'/> Add Food-Type</span>
        </div>
        <div className='foods nav-wrap'>
          {restaurant.get('foods').map(createFood)}
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
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  _addMeal = (e) => {
    e.stopPropagation();
    var meal = Immutable.fromJS({
      id: '_' + Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
      price: 0,
      time: 0
    });
    restaurant = restaurant.updateIn(['foods', this.props.index, 'meals'], list => list.push(meal));
    updateClass();
  };

  _switchExpand = (e) => {
    this.setState({
      expand: !this.state.expand
    });
  };

  _close = () => {
    restaurant = restaurant.deleteIn(['foods', this.props.index]);
    updateClass();
  };

  _update = (e) => {
    restaurant = restaurant.updateIn(['foods', this.props.index], food => food.set(e.target.id, e.target.value));
    updateClass()
    //restaurant.foods[this.props.index][e.target.id] = e.target.value;
  };

  render () {
    var food = this.props.food;
    var createMeal = (meal, index) => <Meal meal={meal} parentIndex={this.props.index} index={index} key={meal.get('id')}/>;
    return (
      <div className='food flex-item-2' style={{backgroundImage: `url(${food.get('picture')})`}}>
        <ImageLoader hidden={!this.state.expand} index={this.props.index} width=''/>
        <span className={classnames({hidden: this.state.expand})}>
          <Close onClick={this._close}/>
        </span>
        <div className='food-wrapper'>
          <Input id={'name'} value={food.get('name')} placeholder={'food-name'} update={this._update}/><br/>
          <Textarea id={'description'} value={food.get('description')} placeholder={'food-description'} update={this._update}/>
        </div>
        <div className={classnames('button-wrapper', {hidden: !this.state.expand})}><span className='button' onClick={this._addMeal}><i className='fa fa-plus-square-o'/> Add a Meal</span></div>
        <div className={classnames('meals', {'nav-wrap': this.state.expand, 'hidden': !this.state.expand})}>
          {food.get('meals').map(createMeal)}
        </div>
        <div className='center-text' onClick={this._switchExpand}>
          <svg className='expand-icon-svg' viewBox='0 0 80 60'>
            <path className='expand-icon-path' d={this.state.expand
              ? 'M0,60 L40,0 L80,60'
              : 'M0,0 L40,60 L80,0'} fill='none' stroke='black' strokeWidth={10}></path>
          </svg>
        </div>
      </div>
    );
  }
}

class Meal extends React.Component {

  constructor(props, context) {
    super(props, context);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  _close = (e) => {
    e.stopPropagation();
    restaurant = restaurant.updateIn(['foods', this.props.parentIndex, 'meals'], list => list.delete(this.props.index));
    //restaurant.foods[this.props.parentIndex].meals.splice(this.props.index, 1);
    updateClass();
  };

  _update = (e) => {
    restaurant = restaurant.updateIn(['foods', this.props.parentIndex, 'meals', this.props.index], meal => meal.set(e.target.id, e.target.type === 'number' ? Math.abs(e.target.value) : e.target.value));
    //restaurant.foods[this.props.parentIndex].meals[this.props.index][e.target.id] = e.target.type === 'number'
    updateClass();
  };

  render () {
    var meal = this.props.meal;
    return (
      <div className='meal flex-item-2'>
        <Close onClick={this._close}/>
        <Input id={'name'} value={meal.get('name')} placeholder={'meal-name'} update={this._update}/><br/>
        <Textarea id={'description'} value={meal.get('description')} placeholder={'meal-description'} update={this._update}/><br/>
        <InputNumber type={'number'} id='price' default={0} value={meal.get('price')} update={this._update}/>mB<br/>
      </div>
    );
  }
}
