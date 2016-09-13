var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Http = require('../');

describe('machinepack-http: patch', function() {

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


  it('should properly encode and send body params AND properly receive and decode response data', function(done) {

    Http.patch({
      url: 'http://localhost:1492/ok?owl=hoot',
      data: {
        age: 99
      }
    }).exec({
      success: function(data) {
        assert.equal(data.method, 'PATCH');
        assert.equal(data.params.owl, 'hoot');
        assert.equal(data.params.age, 99);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 404 status code is received', function(done) {

    Http.patch({
      url: 'http://localhost:1492/notFound',
    }).exec({
      success: function() {
        return done('Expected the `non200Response` exit to be triggered, not `success`!');
      },
      non200Response: function(response) {
        assert.equal(response.statusCode, 404);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 400 status code is received', function(done) {

    Http.patch({
      url: 'http://localhost:1492/badRequest',
    }).exec({
      success: function() {
        return done('Expected the `non200Response` exit to be triggered, not `success`!');
      },
      non200Response: function(response) {
        assert.equal(response.statusCode, 400);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 403 status code is received', function(done) {

    Http.patch({
      url: 'http://localhost:1492/forbidden',
    }).exec({
      success: function() {
        return done('Expected the `non200Response` exit to be triggered, not `success`!');
      },
      non200Response: function(response) {
        assert.equal(response.statusCode, 403);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 401 status code is received', function(done) {

    Http.patch({
      url: 'http://localhost:1492/unauthorized',
    }).exec({
      success: function() {
        return done('Expected the `non200Response` exit to be triggered, not `success`!');
      },
      non200Response: function(response) {
        assert.equal(response.statusCode, 401);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 5xx status code is received', function(done) {

    Http.patch({
      url: 'http://localhost:1492/error',
    }).exec({
      success: function() {
        return done('Expected the `non200Response` exit to be triggered, not `success`!');
      },
      non200Response: function(response) {
        assert.equal(response.statusCode, 500);
        return done();
      },
      error: done
    });

  });

  it('should trigger `requestFailed` when attempting to reach a server that doesn\'t exist', function(done) {

    Http.patch({
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


