var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Http = require('../');

describe('machinepack-http: send-http-request', function() {

  var Sails = new SailsApp();
  var app;
  before(function(done) {
    process.chdir(path.resolve(__dirname, 'fixtures', 'app'));
    Sails.lift({
      hooks: {grunt: false, views: false},
      port: 1492
    }, function(err, _sails) {
      if (err) {return done(err);}
      app = _sails;
      return done();
    });
  });

  after(function(done) {
    app.lower(function(err) {
      if (err) {return done(err);}
      setTimeout(done, 500);
    });
  });


  it('should properly encode and send body+qs params AND properly receive response data', function(done) {

    Http.sendHttpRequest({
      method: 'patch',
      baseUrl: 'http://localhost:1492',
      url: 'ok?owl=hoot',
      qs: {
        bird: 'big'
      },
      body: {
        age: 99
      },
      headers: {
        'x-beans-beans': 'the musical fruit'
      }
    }).switch({
      error: function (err) {
        return done(err);
      },
      success: function(serverRes) {

        // Check status code.
        assert.equal(serverRes.statusCode, 200);

        // Check response headers.
        assert.equal(serverRes.headers['x-some-header'], 'foobar!');
        assert.equal(serverRes.headers['x-powered-by'], 'Sails <sailsjs.org>');

        // Decode and check response body.
        var decodedBody = JSON.parse(serverRes.body);
        assert.equal(decodedBody.method, 'PATCH');
        assert.equal(decodedBody.params.owl, 'hoot');
        assert.equal(decodedBody.params.bird, 'big');
        assert.equal(decodedBody.params.age, 99);
        assert.equal(decodedBody.headers['x-beans-beans'], 'the musical fruit');

        return done();
      }
    });

  });


  it('should work as expected when hit w/ a POST too', function(done) {

    Http.sendHttpRequest({
      method: 'POST',
      baseUrl: 'http://localhost:1492',
      url: '/ok?hungry=hippo',
      qs: {
        bird: 'big'
      },
      body: {
        owl: 'hoot',
        age: 99
      },
      headers: {
        'x-beans-beans': 'the musical fruit'
      }
    }).switch({
      error: function (err) {
        return done(err);
      },
      success: function(serverRes) {

        // Check status code.
        assert.equal(serverRes.statusCode, 200);

        // Check response headers.
        assert.equal(serverRes.headers['x-some-header'], 'foobar!');
        assert.equal(serverRes.headers['x-powered-by'], 'Sails <sailsjs.org>');

        // Decode and check response body.
        var decodedBody = JSON.parse(serverRes.body);
        assert.equal(decodedBody.method, 'POST');
        assert.equal(decodedBody.params.owl, 'hoot');
        assert.equal(decodedBody.params.bird, 'big');
        assert.equal(decodedBody.params.hungry, 'hippo');
        assert.equal(decodedBody.params.age, 99);
        assert.equal(decodedBody.headers['x-beans-beans'], 'the musical fruit');
        return done();
      }
    });

  });



  it('should still work exactly as expected when using "application/x-www-form-urlencoded"', function(done) {

    Http.sendHttpRequest({
      method: 'post',
      baseUrl: 'http://localhost:1492',
      url: 'ok?hungry=hippo',
      qs: {
        bird: 'big'
      },
      enctype: 'application/x-www-form-urlencoded',
      body: {
        owl: 'hoot',
        age: 99
      },
      headers: {
        'x-beans-beans': 'the musical fruit'
      }
    }).switch({
      error: function (err) {
        return done(err);
      },
      success: function(serverRes) {

        // Check status code.
        assert.equal(serverRes.statusCode, 200);

        // Check response headers.
        assert.equal(serverRes.headers['x-some-header'], 'foobar!');
        assert.equal(serverRes.headers['x-powered-by'], 'Sails <sailsjs.org>');

        // Decode and check response body.
        var decodedBody = JSON.parse(serverRes.body);
        assert.equal(decodedBody.method, 'POST');
        assert.equal(decodedBody.params.owl, 'hoot');
        assert.equal(decodedBody.params.bird, 'big');
        assert.equal(decodedBody.params.hungry, 'hippo');
        assert.equal(decodedBody.params.age, 99);
        assert.equal(decodedBody.headers['x-beans-beans'], 'the musical fruit');
        return done();
      }
    });

  });




  it('should still work exactly as expected when using "multipart/form-data"', function(done) {

    Http.sendHttpRequest({
      method: 'post',
      baseUrl: 'http://localhost:1492',
      url: 'ok?hungry=hippo',
      qs: {
        bird: 'big'
      },
      enctype: 'multipart/form-data',
      body: {
        owl: 'hoot',
        age: 99
      },
      headers: {
        'x-beans-beans': 'the musical fruit'
      }
    }).switch({
      error: function (err) {
        return done(err);
      },
      success: function(serverRes) {

        // Check status code.
        assert.equal(serverRes.statusCode, 200);

        // Check response headers.
        assert.equal(serverRes.headers['x-some-header'], 'foobar!');
        assert.equal(serverRes.headers['x-powered-by'], 'Sails <sailsjs.org>');

        // Decode and check response body.
        var decodedBody = JSON.parse(serverRes.body);
        assert.equal(decodedBody.method, 'POST');
        assert.equal(decodedBody.params.owl, 'hoot');
        assert.equal(decodedBody.params.bird, 'big');
        assert.equal(decodedBody.params.hungry, 'hippo');
        assert.equal(decodedBody.params.age, 99);
        assert.equal(decodedBody.headers['x-beans-beans'], 'the musical fruit');
        return done();
      }
    });

  });




  it('should still prioritize dynamically-encoded data provided as `qs` over existing stuff in the query string', function(done) {

    Http.sendHttpRequest({
      method: 'post',
      baseUrl: 'http://localhost:1492',
      url: 'ok?hungry=hippo',
      qs: {
        bird: 'big',
        hungry: 'daemon'
      },
      enctype: 'multipart/form-data',
      body: {
        owl: 'hoot',
        age: 99
      },
      headers: {
        'x-beans-beans': 'the musical fruit'
      }
    }).switch({
      error: function (err) {
        return done(err);
      },
      success: function(serverRes) {

        // Check status code.
        assert.equal(serverRes.statusCode, 200);

        // Check response headers.
        assert.equal(serverRes.headers['x-some-header'], 'foobar!');
        assert.equal(serverRes.headers['x-powered-by'], 'Sails <sailsjs.org>');

        // Decode and check response body.
        var decodedBody = JSON.parse(serverRes.body);
        assert.equal(decodedBody.method, 'POST');
        assert.equal(decodedBody.params.owl, 'hoot');
        assert.equal(decodedBody.params.bird, 'big');
        assert.equal(decodedBody.params.hungry, 'daemon');
        assert.equal(decodedBody.params.age, 99);
        assert.equal(decodedBody.headers['x-beans-beans'], 'the musical fruit');
        return done();
      }
    });

  });



  it('should trigger `non200Response` when a 404 status code is received', function(done) {

    Http.sendHttpRequest({
      method: 'GET',
      url: 'notFound',
      baseUrl: 'http://localhost:1492'
    }).switch({
      success: function() {
        return done('Expected the `notFound` exit to be triggered, not `success`!');
      },
      non200Response: function(response) {
        assert.equal(response.statusCode, 404);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 400 status code is received', function(done) {

    Http.sendHttpRequest({
      method: 'GET',
      url: 'badRequest',
      baseUrl: 'http://localhost:1492'
    }).switch({
      success: function() {
        return done('Expected the `badRequest` exit to be triggered, not `success`!');
      },
      non200Response: function(response) {
        assert.equal(response.statusCode, 400);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 403 status code is received', function(done) {

    Http.sendHttpRequest({
      method: 'GET',
      url: 'forbidden',
      baseUrl: 'http://localhost:1492'
    }).switch({
      success: function() {
        return done('Expected the `forbidden` exit to be triggered, not `success`!');
      },
      non200Response: function(response) {
        assert.equal(response.statusCode, 403);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 401 status code is received', function(done) {

    Http.sendHttpRequest({
      method: 'GET',
      url: 'unauthorized',
      baseUrl: 'http://localhost:1492'
    }).switch({
      success: function() {
        return done('Expected the `unauthorized` exit to be triggered, not `success`!');
      },
      non200Response: function(response) {
        assert.equal(response.statusCode, 401);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 5xx status code is received', function(done) {

    Http.sendHttpRequest({
      method: 'GET',
      url: 'error',
      baseUrl: 'http://localhost:1492'
    }).switch({
      success: function() {
        return done('Expected the `serverError` exit to be triggered, not `success`!');
      },
      non200Response: function(response) {
        assert.equal(response.statusCode, 500);
        return done();
      },
      error: done
    });

  });

  it('should trigger `requestFailed` when attempting to reach a server that doesn\'t exist', function(done) {

    Http.sendHttpRequest({
      method: 'GET',
      url: 'error',
      baseUrl: 'http://localhosty.cakes.sailsjs.com:9999'
    }).switch({
      success: function() {
        return done('Expected the `requestFailed` exit to be triggered, not `success`!');
      },
      requestFailed: function(response) {
        return done();
      },
      error: done
    });

  });

});


