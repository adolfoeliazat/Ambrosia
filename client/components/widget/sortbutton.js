import React from 'react';
import classnames from 'classnames';

class SortButton extends React.Component {
  constructor (props, context) {
    super(props, context);
    this.state = {expand: false};
  }
  render () {
    return (
      <div className="sort" onClick={(e)=>this.setState({expand : !this.state.expand})}>
        <i>Sort: </i>
        <span className="sort-selected">{' ' + this.props.selected} </span>
        <div className={classnames('sort-list', {hidden: !this.state.expand})}>
          <div id= 'closer' onClick={this.props.update} className='sort-item'>{this.props.selected === 'closer' ? <span><i className='fa fa-check'/>Closer</span> : 'Closer'}</div>
          <div id= 'rated' onClick={this.props.update} className='sort-item'>{this.props.selected === 'rated' ? <span><i className='fa fa-check'/>Best Rated</span> : 'Best Rated'}</div>
          <div id= 'open' onClick={this.props.update} className='sort-item'>{this.props.selected === 'open' ? <span><i className='fa fa-check'/>Open</span> : 'Open'}</div>
        </div>
      </div>
    );
  }
};

export default SortButton;
