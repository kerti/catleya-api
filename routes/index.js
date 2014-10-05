var express = require('express');
var router = express.Router();

/* GET home page. */
//router.get('/', function(req, res) {
//  res.render('index', { title: 'Express' });
//});

router.get('/pins/set/:number/:value', function(req, res) {

  var Gpio = require('onoff').Gpio;
  var pin = new Gpio(req.params.number, 'out');

  pin.writeSync(req.params.value === '0' ? 0 : 1, function(err) {
    if (err) throw err;
  });

  //pin.unexport();

  res.status(200).send({
    pin: req.params.number,
    state: req.params.value
  });

})

router.get('/pins/get/:number', function(req, res) {

  var Gpio = require('onoff').Gpio;
  var pin = new Gpio(req.params.number, 'out');
  var state = pin.readSync();

  //pin.unexport();

  res.status(200).send({
    pin: req.params.number,
    state: state
  });
});

module.exports = router;
