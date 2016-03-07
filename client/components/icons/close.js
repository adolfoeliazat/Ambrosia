import React from 'react';

export default class Close extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <svg className='icon-close' viewBox='0 0 80 80' x={this.props.x || ''} y={this.props.y || ''} onClick={e => this.props.onClick(e, this.props.index)} height={this.props.size || '1em'} width={this.props.size || '1em'}>
        <rect className='icon-close' width='80' height='80' rx='20' ry='20' stroke={this.props.stroke || 'black'} fill='white' strokeWidth={this.props.strokeWidth || 3}/>
        <path d='M10 10 L70 70' stroke={this.props.stroke || 'black'} strokeWidth={this.props.strokeWidth || 3} />
        <path d='M70 10 L10 70' stroke={this.props.stroke || 'black'} strokeWidth={this.props.strokeWidth || 3} />
      </svg>
    );
  }
}
