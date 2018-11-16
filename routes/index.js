var gm = require('gm');
var ExifImage = require('exif').ExifImage;
var path = require('path');
var imgsize = require('image-size');
var Mdl = require('../model/User');
const request = require('request');
const fs = require('fs');
var express = require('express');
var router = express.Router();

function resize (imgPath, width, subfolder, file) {
  var newFile = (file) ? path.normalize(path.join(file.destination, 'images', subfolder, file.name)) : imgPath

  return new Promise((resolve, reject) => {
      gm(imgPath)
      .compress('JPEG')
      .quality(90)
      .resize(width || 1080)
      .autoOrient()
      .write(newFile, (err, r) => {
          if(err) reject(err);
          resolve({
              path: imgPath
          });
      });
  });
}
/* GET home page. */
router.get('/', function(req, res, next) {
  Mdl.Pic.find()
  .sort({insertdate: -1})
  .exec((err, docs) => {
    res.render('home', { title: 'jayancabatuan.com', pics: docs, loggedIn: (req.session && req.session.user), first: docs[0]});
  });
});

router.get('/resume', function(req, res, next) {
  res.render('resume', {layout: 'resume'});
});

router.get('/uptime', function(req, res, next) {
 let filename = path.normalize('/home/jayan/WEB/jayancabatuan.live/public/uptime'+new Date().getMonth()+'.json');
 let stats, obj;
 try {
   stats = fs.statSync( filename );
   obj = fs.readFileSync( filename );
   //console.log(stats.size);
   //console.log(obj);

 } catch (err) {
   console.log(err)
 }
 if(obj && stats.size > 0) {
  res.json(JSON.parse(obj.toString()));
 } else {
  //console.log('sending template')
  res.json( JSON.parse({"menlo":{"totalCheck":0,"totalUptime":0,"lastUpdate":"0","perc":0},"compton":{"totalCheck":0,"totalUptime":0,"lastUpdate":"","perc":0},"orange":{"totalCheck":0,"totalUptime":0,"lastUpdate":"","perc":0},"perks":{"totalCheck":0,"totalUptime":0,"lastUpdate":"0","perc":0}}) )
 }
});

router.get('/secure', (req, res, next) => {
  var view = 'login';
  if(req.session && req.session.user) {
    view = 'secure';
  }
  res.render(view, {title: 'jayancabatuan.com', loggedIn: (req.session && req.session.user)});
});

router.get('/logout', function(req, res, next) {
  req.session = null;
  res.redirect('/');
});

router.post('/login', (req, res, next) => {
  request.post(
        //'http://hub.pldthome.com/hub/authenticate',
	//'http://perfmon.pldthome.com/hub/auth',
	'http://112.206.227.218:3000/auth',
        { form: { username: req.body.username, password: req.body.password } },
        (error, response, body) => {
            if(error) {
                res.status(401).send('Unable to authenticate.');
            } else {
                var bodyObj = JSON.parse(body);
		console.log(bodyObj)
                if(bodyObj.status == 'ok') {
                    // We are sending the profile inside the token
                    // delete unecessary things first
                    delete bodyObj.sessionkey;
                    delete bodyObj.amiloggedin;
                    delete bodyObj.status;
                    delete bodyObj.message;
                    if(bodyObj.agentcode === 'jlcabatuan') {
                      req.session.user = bodyObj;
                      res.redirect('/');
                    } else {
                      res.redirect(401, '/secure');
                    }
                } else {
                    // res.status(401).json(bodyObj);
                    res.redirect(401, '/secure');
                }
            }
        }
    );
})

router.post('/upload', function(req, res, next) {

  if(req.hasOwnProperty('files') && Object.keys(req.files).length > 0) {
    req.files.forEach( img => {

      var _path = path.normalize(img.path);
      var dimensions = imgsize(_path);
	console.log('uploading to..', _path);
      img.height = dimensions.height;
      img.width = dimensions.width;
      img.description = req.body.desc;
      // lets resize for thumbnail
      Promise.all([
        resize(_path, 1400, 'xlarge', {destination: img.destination, name: img.filename }),
        resize(_path, 1100, 'large', {destination: img.destination, name: img.filename }),
        resize(_path, 800, 'medium', {destination: img.destination, name: img.filename }),
        resize(_path, 400, 'small', {destination: img.destination, name: img.filename })
      ])
      .then( result => {

        // resize main image
        gm(_path)
        .compress('JPEG')
        .quality(90)
        .write(_path, (err, r) => {
            if(err) console.log(err);
        });

      });

      try {
            new ExifImage({ image : _path }, function (error, exifData) {
                if (error)
                    console.log('Error: '+error.message);
                else {
                  exifData.tags = req.body.tags.split(',');
                  var newPic = new Mdl.Pic({file: img, meta: exifData});
                  newPic.save((err, pic) => {
                    if (err) { res.status(500).send(err); return; }
                    //res.send('ok');
                  });
                }

            });
        } catch (error) {
            console.log('Error: ' + error.message);
            res.status(500).send(error)
        }
    })

    res.redirect('/');
  } else {
    res.send('no file uploaded');
  }

});

module.exports = router;
