import r from 'rethinkdb';
import {getRandomInt} from '../utils';
import pictures from '../stylesheets/images/images-url';
import config from '../config';

r.connect(config.rethinkdb, (err, conn) => {
  if(err) throw err;
  r.table('restaurant')('id').run(conn, (err, res) => {
    if(err) throw err;
    res.each((err, value) => {
      if(err) throw err;
      r.table('restaurant').get(value).run(conn, (err, res) => {
        if(err) throw err;
        console.log(res.picture);
        res.picture = pictures["background-restaurant"][getRandomInt(0, pictures["background-restaurant"].length)]
        res.foods.map(food => food.picture = pictures['background-food'][getRandomInt(0, pictures['background-food'].length)])
        r.table('restaurant').get(value).update(res).run(conn, (err, res) => {
          if(err) throw err;
        });
      });
    });
  })
})
