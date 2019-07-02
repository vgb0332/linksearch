var express = require('express');
var router = express.Router();
var Crawler = require("crawler");
var cheerio = require('cheerio');
var c = new Crawler({ maxConnections : 10 });

const List = require('../models/list.js');

function crawlerPromise(options) {
  return new Promise((resolve, reject) => {
    options.callback = (err, res, done) => {
      if (err) {
        console.log(error);
        reject(err);
      } else {
        var $ = cheerio.load(res.body);
        var target = res.options.target;
        var links = $("a[href]");
        var data = [];
        for(var i = 0; i < links.length; ++i) {
          var title = $(links[i]).text();
          var link = $(links[i]).attr('href');
          data.push({
            title,
            link
          });
        }
        resolve(data);
      }
      done();
    }
    c.queue(options);
  });
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  var list = await List.find({});

  res.render('index', { title: 'HREF만', list: list });
});


module.exports = router;
