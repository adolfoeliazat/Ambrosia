import React from 'react';

export default class Map extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <svg className='map-icon' viewBox="0 0 612 612" height={this.props.size || "1em"} width={this.props.size || "1em"}>
      <g>
      	<path d="M516.316,337.52l94.233,193.581c3.832,7.873-0.196,14.314-8.952,14.314H10.402c-8.756,0-12.785-6.441-8.952-14.314
      		L95.684,337.52c1.499-3.079,5.528-5.599,8.952-5.599h80.801c2.49,0,5.853,1.559,7.483,3.442
      		c5.482,6.335,11.066,12.524,16.634,18.65c5.288,5.815,10.604,11.706,15.878,17.735h-95.891c-3.425,0-7.454,2.519-8.952,5.599
      		L58.163,505.589h495.67l-62.421-128.242c-1.498-3.08-5.527-5.599-8.953-5.599h-96.108c5.273-6.029,10.591-11.92,15.879-17.735
      		c5.585-6.144,11.2-12.321,16.695-18.658c1.628-1.878,4.984-3.434,7.47-3.434h80.971
      		C510.789,331.921,514.817,334.439,516.316,337.52z M444.541,205.228c0,105.776-88.058,125.614-129.472,227.265
      		c-3.365,8.26-14.994,8.218-18.36-0.04c-37.359-91.651-112.638-116.784-127.041-198.432
      		c-14.181-80.379,41.471-159.115,122.729-166.796C375.037,59.413,444.541,124.204,444.541,205.228z M379.114,205.228
      		c0-40.436-32.779-73.216-73.216-73.216s-73.216,32.78-73.216,73.216c0,40.437,32.779,73.216,73.216,73.216
      		S379.114,245.665,379.114,205.228z"/>
      </g>
      </svg>
    );
  }
}