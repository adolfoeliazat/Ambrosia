import React from 'react';
import cloneWithProps from 'react-addons-clone-with-props';
import Relay from 'react-relay';
import classnames from 'classnames';
import request from 'superagent';
import L from 'leaflet';
import Loading from '../icons/loading';
import Input from '../widget/input';

var osmAttr = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';

var hereYouAre = L.icon({
    iconUrl: '/stylesheets/icons/here-you-are.svg',
    iconRetinaUrl: '/stylesheets/icons/here-you-are.svg',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

var address;

export default class Map extends React.Component {

  constructor(props, context) {
    super(props, context);
    address = {
      latlng: localStorage.restaurantLocation ? JSON.parse(localStorage.restaurantLocation) : localStorage.geolocation ? JSON.parse(localStorage.geolocation) : '',
      street: 'restaurant street',
      city: 'restaurant city',
      zipCode: 'ZIP code',
      country: 'restaurant country'
    };
  }

  componentWillReceiveProps () {
    if(address.latlng) {
      this._getAddress(address.latlng);
    }
  }

  componentWillUnmount () {
    localStorage.restaurantLocation = JSON.stringify([address.latlng[0], address.latlng[1]]);
  }

  componentDidMount () {
    this.map = L.map('map', {zoomControl: false, maxZoom: 20, minZoom: 15});
    this.map.on('click', e => {
      var latlng = [e.latlng.lng, e.latlng.lat];
      this._getAddress(latlng);
    });
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: osmAttr,
      maxZoom: 25
    }).addTo(this.map);
    this.marker = L.marker([50.5, 30.5], {icon: hereYouAre}).addTo(this.map);
    if(address.latlng) {
      this._getAddress(address.latlng);
    }
  }

  _getAddress = (coord) => {
    request.get(`http://nominatim.openstreetmap.org/reverse?format=json&lat=${coord[1]}&lon=${coord[0]}&zoom=18&addressdetails=1`)
    .end((err, res)=>{
      if(err) {
        throw(err);
      } else {
        var ad = res.body.address;
        address = {
          latlng: [coord[0], coord[1]],
          street: `${ad.house_number || ''} ${ad.road}`,
          city: ad.village || ad.town,
          zipCode: ad.postcode,
          country: ad.country
        }
        this.map.setView([address.latlng[1], address.latlng[0]], 18);
        this.marker.setLatLng([address.latlng[1], address.latlng[0]]);
        //this.props.submit('address', address);
        this.forceUpdate();
      }
    });
  };

  _getLatlng = () => {
    request.get(`http://nominatim.openstreetmap.org/search?q=${address.street},+${address.city},+${address.country || ''},+${address.zipCode || ''}&format=json&addressdetails=1`)
    .end((err, res)=>{
      if(err) {
        throw(err);
      } else {
        var res = res.body[0];
        address = {
          latlng: [res.lon, res.lat],
          street: `${res.address.house_number} ${res.address.road}`,
          city: res.address.village || res.address.town,
          zipCode: res.address.postcode,
          country: res.address.country
        };
        this.map.setView([address.latlng[1], address.latlng[0]], 18);
        this.marker.setLatLng([address.latlng[1], address.latlng[0]]);
        //this.props.submit('address', address);
        this.forceUpdate();
      }
    })
  };

  _update = (e) => {
    address[e.target.id] = e.target.value;
    this.forceUpdate();
  };

  renderChildren = () => {
    return React.Children.map(this.props.children, (child) => {
        return cloneWithProps(child, {
          submit: this.props.submit,
        });
    });
  };

  render() {
    return (
      <div className='restaurants-map'>
        {this.renderChildren()}
        <div id='form'>
          <span>Street : </span><Input id='street' type='text' value={address.street} update={this._update} onValid={this._getLatlng} /><br/>
          <span>ZIP-code : </span><Input id='zipCode' type='text' value={address.zipCode} update={this._update} onValid={this._getLatlng} /><br/>
          <span>City : </span><Input id='city' type='text' value={address.city} update={this._update} onValid={this._getLatlng} /><br/>
          <span>Country : </span><Input id='country' type='text' value={address.country} update={this._update} onValid={this._getLatlng} /><br/>
        </div>
        <span className={classnames('center-wrapper', {hidden: localStorage.geolocation})}><Loading size={'7em'}/></span>
        <div id='map' onClick={this._mapClicked}>
        </div>
      </div>
    );
  }
}
