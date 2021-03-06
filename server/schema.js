import {
  GraphQLNonNull,
  GraphQLList,
  GraphQLFloat,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLBoolean
}
from 'graphql';

import {
  fromGlobalId,
  toGlobalId,
  nodeDefinitions,
  connectionArgs,
  connectionFromArray
}
from 'graphql-relay';

import {
  getNearestRestaurants,
  getRestaurants,
  getRestaurant,
  getUser
}
from './database';

import {
  GraphQLUser
}
from './type/user';

import {
  GraphQLRestaurant,
  restaurantsConnection
}
from './type/restaurant';

import {
  SignupMutation,
  LoginMutation,
  UserMutation,
  RestaurantMutation,
  OrderMutation,
  UpdateRestaurantMutation,
  UpdateOrderMutation
}
from './mutation';

import co from 'co';

var {
  nodeInterface, nodeField
} = nodeDefinitions(
  (globalId) => {
    var {
      type, id
    } = fromGlobalId(globalId);
    if (type === 'User') {
      return getUser(id);
    }
    return null;
  }, (obj) => {
    return GraphQLUser;
  }
);



var GraphQLRoot = new GraphQLObjectType({
  name: 'Root',
  fields: {
    restaurant: {
      type: GraphQLRestaurant,
      resolve: (id, args, {rootValue}) => co(function*() {
        console.log('schema:Root:getRestaurant', fromGlobalId(id), toGlobalId(id));
        //Hack for getting both cases where restaruantID is generated from toglobalID or globalIDField
        var restaurant = yield getRestaurant(fromGlobalId(id).id ? fromGlobalId(id).id : fromGlobalId(id).type, rootValue);
        return restaurant;
      })
    },
    restaurants: {
      type: restaurantsConnection,
      args: {
        location: {
          type: new GraphQLList(GraphQLFloat),
          description: 'array with longitude and latitude'
        },
        name: {
          type: GraphQLString,
          description: 'the name you are looking for'
        },
        rated: {
          type: GraphQLBoolean,
          description: 'sort response depending on score'
        },
        open: {
          type: GraphQLBoolean,
          description: 'return only open restaurant'
        },
        ...connectionArgs
      },
      description: 'The nearest restaurants',
      resolve: (root, args, {rootValue}) => co(function*() {
        console.log('schema:restaurants:name', args);
        var restaurants = yield getRestaurants(args, rootValue);
        return connectionFromArray(restaurants, args);
      })
    },
    user: {
      type: new GraphQLNonNull(GraphQLUser),
      description: 'the user',
      resolve: (root, {
        id
      }, {
        rootValue
      }) => co(function*() {
        var user = yield getUser(rootValue);
        return user;
      })
    }
  },
});

var queryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    user: {
      type: new GraphQLNonNull(GraphQLUser),
      args: {
        id: {
          type: GraphQLString,
          description: 'the session\'s userId'
        }
      },
      resolve: (rootValue, {
        id
      }) => co(function*() {
        var user = yield getUser(rootValue, id);
        return user;
      })
    },
    root: {
      name:'name',
      type: GraphQLRoot,
      args: {
        id: {
          type: GraphQLString,
          description: 'most of the time, the restaurant id'
        }
      },
      resolve: (rootValue, {id}) => {
        console.log('schema:root', id);
        return id || {};
      }
    },
    node: nodeField
  })
});

var mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    Signup: SignupMutation,
    Login: LoginMutation,
    User: UserMutation,
    Restaurant: RestaurantMutation,
    UpdateRestaurant: UpdateRestaurantMutation,
    Order: OrderMutation,
    UpdateOrder: UpdateOrderMutation
  })
});

export var Schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
});
