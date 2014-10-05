var express = require('express');
var router = express.Router();

router.get('/get/', function(req, res) {
  require('fs').readFile(
    'config.json',
    {
      encoding: "UTF-8"
    },
    function (err, data) {
      if (err) {
        res.status(500).send("Fail to read data: " + err);
      } else {
        res.status(200).json(JSON.parse(data));
      }
  });
});

router.get('/get/:nodepath', function(req, res) {
  require('fs').readFile(
    'config.json',
    {
      encoding: "UTF-8"
    },
    function (err, data) {
      if (err) {
        res.status(500).send("Fail to read data: " + err);
      } else {
        var path = "JSON.parse(data)." + req.params.nodepath;
        try {
          res.status(200).json(eval(path));
        } catch (e) {
          res.status(500).send("Fail to read data: " + e);
        }
      }
  });
});

module.exports = router;
