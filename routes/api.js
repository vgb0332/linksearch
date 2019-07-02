var express = require('express');
var router = express.Router();
var Crawler = require("crawler");
var cheerio = require('cheerio');
var c = new Crawler({ maxConnections : 10, retries: 0 });

const List = require('../models/list.js');

function crawlerPromise(options) {
  return new Promise((resolve, reject) => {
    options.callback = (err, res, done) => {
      if (err) {
        console.log(err);
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
  res.send('API INDEX');
});


router.post('/addList', async function(req, res, next) {

  const { name, url } = req.body;

  c.queue([{
      uri: url,
      jQuery: false,

      // The global callback won't be called
      callback: async function (error, result, done) {
          if(error){
              console.log(error);
              res.send({success: false, error: error});
          }else{
              var newList = await new List({
                name: name,
                url: url,
                active: true
              }).save();
              res.send({success: true, dat: newList});
          }
          done();
      }
  }]);

});

router.post('/getList', async function(req, res, next) {

  const { _id } = req.body;

  List.findById(_id, async function(error, list) {
    if(error) {
      res.send({success: false, error: error});
    }
    else {
      var url = list.url;
      try {
        var links = await crawlerPromise({ uri: url });
        res.send({success: true, links: links});
      } catch(err) {
        res.send({success: false, error: err});
      }

    }
  });
  //
  // var data = await crawlerPromise(
  //   { uri: 'http://www.ikoreantv.com/board.php?board=ikoreantvmain&command=skin_insert&exe=insert_iboard1_home', target: '아이코리안TV'},
  //   { uri: 'https://baroboza.com/', target: '바로보자'},
  //   { uri: 'https://joovideo.tv/', target: '주비디오'},
  //   { uri: 'http://www.koreayh.com/', target: '홍무비'}
  // );

  // res.render('index', { title: '오늘의링크', links: []});

});

router.post('/activate', async function(req, res, next) {

  const { _id } = req.body;

  List.findById(_id, async function(error, list) {
    if(error) {
      res.send({success: false, error: error});
    }
    else {
      list.active = true;
      await list.save();
      res.send({success: true});
    }
  });

});

router.post('/deactivate', async function(req, res, next) {

  const { _id } = req.body;

  List.findById(_id, async function(error, list) {
    if(error) {
      res.send({success: false, error: error});
    }
    else {
      list.active = false;
      await list.save();
      res.send({success: true});
    }
  });

});

router.post('/delete', async function(req, res, next) {

  const { _id } = req.body;

  List.remove({_id: _id}, async function(error, output) {
    if(error) {
      res.send({success: false, error: error});
    }
    else {
      res.send({success: true});
    }
  });

});


module.exports = router;
