var express = require('express');
var router = express.Router();
var Gpio = require('onoff').Gpio;

// get all information about all devices
router.get('/', function (req, res) {
  require('fs').readFile(
    'config.json',
    {
      encoding: "UTF-8"
    },
    function (err, data) {
      if (err) {
        res.status(500).send("Fail to read data: " + err);
      } else {
        var path = "JSON.parse(data).devices";
        try {
          if (eval(path) === undefined) {
            res.status(404).send("Device list does not exist: " + path);
          } else {
            res.status(200).json(eval(path));
          }
        } catch (e) {
          res.status(500).send("Fail to read data: " + e);
        }
      }
  });
});

// get all information about all active devices
router.get('/active', function (req, res) {
  require('fs').readFile(
    'config.json',
    {
      encoding: "UTF-8"
    },
    function (err, data) {
      if (err) {
        res.status(500).send("Fail to read data: " + err);
      } else {
        var rawConfig = JSON.parse(data);
        var result = [];
        rawConfig.devices.forEach(function(element, index, array) {
          if (element.active) {
            result.push(element);
          }
        });
        res.status(200).json(result);
      }
  });
});

// get all information about a device based on its index number
router.get('/:id', function (req, res) {
  if (isValidDeviceId(req.params.id)) {
    require('fs').readFile(
      'config.json',
      {
        encoding: "UTF-8"
      },
      function (err, data) {
        if (err) {
          res.status(500).send("Fail to read data: " + err);
        } else {
          var path = "JSON.parse(data).devices[" + req.params.id + "]";
          try {
            if (eval(path) === undefined) {
              var response = {
                "error": "Device does not exist.",
                "device": "devices[" + req.params.id + "]"
              };
              res.status(404).json(response);
            } else {
              res.status(200).json(eval(path));
            }
          } catch (e) {
            res.status(500).send("Fail to read data: " + e);
          }
        }
    });
  } else {
    res.status(400).send("Invalid device ID.");
  }
});

// set a device's entire configuration
router.put('/:id', function (req, res) {
  var fs = require('fs');
  fs.readFile(
    'config.json',
    function (err, data) {
      if (err) {
        res.status(500).send("Fail to read data before updating: " + err);
      } else {
        var config = JSON.parse(data);
        try{
          if (isValidDeviceId(req.params.id)) {
            // get the device
            var device = config.devices[req.params.id];

            // attempt to get the pin status
            var pin = new Gpio(req.body.pin, 'out');
            var state = pin.readSync();

            // attempt to write the pin status if necessary
            // remember that the relay board is ACTIVE LOW
            var pinStatusToSet = 1;
            if (device.state != req.body.state) {
              if (req.body.state === 'on') {
                pinStatusToSet = 0;
              } else if (req.body.state === 'off') {
                pinStatusToSet = 1;
              }
              var tryAgain = false;
              pin.writeSync(pinStatusToSet, function (err) {
                if (err) {
                  console.log('Failed to set pin value, retrying...');
                  tryAgain = true;
                }
              });
              if (tryAgain) {
                pin.writeSync(pinStatusToSet, function (err) {
                if (err) {
                  res.status(500).send('Failed to set pin value: ' + err);
                  return;
                }
              });
              }
            }

            // copy properties to prevent any change in data structure
            device.gpio = req.body.gpio;
            device.name = req.body.name;
            device.active = req.body.active;
            device.auto = req.body.auto;
            device.state = req.body.state;
            device.type = req.body.light;

            // TODO: should have some kind of validation here

            // copy the device back into the array
            config.devices[req.param.id] = device;

            // save the file and return results
            fs.writeFile(
              'config.json',
              JSON.stringify(config),
              function (err) {
                if (err) {
                  res.status(500).send("Fail to write data file: " + err);
                } else {
                  res.status(200).send(device);
                }
            });
          } else {
            res.status(400).send('Invalid device ID.');
          }
        } catch (err) {
          res.status(500).send("Fail to update data: " + err);
        }
      }
    });
});

function isValidDeviceId(id) {
  return true;
}

module.exports = router;