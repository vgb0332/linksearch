var express = require('express');
var router = express.Router();
const List = require('../models/list.js');
/* GET users listing. */
router.get('/', async function(req, res, next) {

  var list = await List.find({});

  res.render('admin', { title: '어드민', list: list });
});

module.exports = router;
