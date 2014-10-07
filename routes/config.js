var express = require('express');
var router = express.Router();

router.get('/get/', function (req, res) {
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

router.get('/get/:nodepath', function (req, res) {
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

router.get('/update/:nodepath/:value', function (req, res) {
  var fs = require('fs');
  fs.readFile(
    'config.json',
    function (err, data) {
      if (err) {
        res.status(500).send("Fail to update data: " + err);
      } else {
        var config = JSON.parse(data);
        try{
          eval("config." + req.params.nodepath + " = \"" + req.params.value + "\"");
          fs.writeFile(
            'config.json',
            JSON.stringify(config),
            function (err) {
              if (err) {
                res.status(500).send("Fail to write data file: " + err);
              } else {
                res.status(200).send("OK");
              }
          });
        } catch (err) {
          res.status(500).send("Fail to update data: " + err);
        }
      }
    });
});

module.exports = router;