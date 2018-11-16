'use strict';

require('greenlock-express').create({

  server: 'https://acme-v02.api.letsencrypt.org/directory'

, email: 'jcabatuan@gmail.com'
, version: 'v02'
, agreeTos: true

, approveDomains: [ 'jayancabatuan.com' ]

, app: require('express')().use('/', function (req, res) {
    res.end('Hello, World!');
  })

}).listen(80, 443);
