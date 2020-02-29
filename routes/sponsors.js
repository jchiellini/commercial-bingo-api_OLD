var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send(JSON.stringify([
    {
      "id": 1,
      "sponsor": "Bud Light",
      "icon": ""
    }
  ]));
});

module.exports = router;
