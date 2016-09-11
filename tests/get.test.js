var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Http = require('../');

describe('machinepack-http: get', function() {

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

  it('should trigger `success` and get the correct status code, body and headers when requesting a valid path', function(done) {

    Http.get({
      url: 'http://localhost:1492/ok?owl=hoot',
    }).exec({
      success: function(response) {
        assert.equal(response.status, 200);
        var body = JSON.parse(response.body);
        var headers = JSON.parse(response.headers);
        assert.equal(body.method, 'GET');
        assert.equal(body.params.owl, 'hoot');
        assert.equal(headers['x-some-header'], 'foobar!');
        assert.equal(headers['x-powered-by'], 'Sails <sailsjs.org>');
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 404 status code is received', function(done) {

    Http.get({
      url: 'http://localhost:1492/notFound',
    }).exec({
      success: function() {
        return done('Expected the `non200Response` exit to be triggered, not `success`!');
      },
      non200Response: function(response) {
        assert.equal(response.status, 404);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 400 status code is received', function(done) {

    Http.get({
      url: 'http://localhost:1492/badRequest',
    }).exec({
      success: function() {
        return done('Expected the `non200Response` exit to be triggered, not `success`!');
      },
      non200Response: function(response) {
        assert.equal(response.status, 400);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 403 status code is received', function(done) {

    Http.get({
      url: 'http://localhost:1492/forbidden',
    }).exec({
      success: function() {
        return done('Expected the `non200Response` exit to be triggered, not `success`!');
      },
      non200Response: function(response) {
        assert.equal(response.status, 403);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 401 status code is received', function(done) {

    Http.get({
      url: 'http://localhost:1492/unauthorized',
    }).exec({
      success: function() {
        return done('Expected the `non200Response` exit to be triggered, not `success`!');
      },
      non200Response: function(response) {
        assert.equal(response.status, 401);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 5xx status code is received', function(done) {

    Http.get({
      url: 'http://localhost:1492/error',
    }).exec({
      success: function() {
        return done('Expected the `non200Response` exit to be triggered, not `success`!');
      },
      non200Response: function(response) {
        assert.equal(response.status, 500);
        return done();
      },
      error: done
    });

  });

  it('should trigger `requestFailed` when attempting to reach a server that doesn\'t exist', function(done) {

    Http.get({
      url: 'error',
      baseUrl: 'http://localhosty.cakes:9999'
    }).exec({
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


