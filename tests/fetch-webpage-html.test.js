var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Http = require('../');

describe('machinepack-http: fetch-webpage-html', function() {

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

  it('should trigger `success` and get the correct HTML when requesting a valid path', function(done) {

    Http.fetchWebpageHtml({
      url: 'http://localhost:1492/html',
    }).exec({
      success: function(html) {
        assert.equal(html, '<html><body>hi!</body></html>');
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 404 status code is received', function(done) {

    Http.fetchWebpageHtml({
      url: 'http://localhost:1492/notFound',
    }).exec({
      success: function() {
        return done('Expected the `non200Response` exit to be triggered, not `success`!');
      },
      non200Response: function(serverRes) {
        assert.equal(serverRes.statusCode, 404);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 400 status code is received', function(done) {

    Http.fetchWebpageHtml({
      url: 'http://localhost:1492/badRequest',
    }).exec({
      success: function() {
        return done('Expected the `non200Response` exit to be triggered, not `success`!');
      },
      non200Response: function(serverRes) {
        assert.equal(serverRes.statusCode, 400);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 403 status code is received', function(done) {

    Http.fetchWebpageHtml({
      url: 'http://localhost:1492/forbidden',
    }).exec({
      success: function() {
        return done('Expected the `non200Response` exit to be triggered, not `success`!');
      },
      non200Response: function(serverRes) {
        assert.equal(serverRes.statusCode, 403);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 401 status code is received', function(done) {

    Http.fetchWebpageHtml({
      url: 'http://localhost:1492/unauthorized',
    }).exec({
      success: function() {
        return done('Expected the `non200Response` exit to be triggered, not `success`!');
      },
      non200Response: function(serverRes) {
        assert.equal(serverRes.statusCode, 401);
        return done();
      },
      error: done
    });

  });

  it('should trigger `non200Response` when a 5xx status code is received', function(done) {

    Http.fetchWebpageHtml({
      url: 'http://localhost:1492/error',
    }).exec({
      success: function() {
        return done('Expected the `non200Response` exit to be triggered, not `success`!');
      },
      non200Response: function(serverRes) {
        assert.equal(serverRes.statusCode, 500);
        return done();
      },
      error: done
    });

  });

  it('should trigger `requestFailed` when attempting to reach a server that doesn\'t exist', function(done) {

    Http.fetchWebpageHtml({
      url: 'error',
      baseUrl: 'http://localhosty.cakes:9999'
    }).exec({
      success: function() {
        return done('Expected the `requestFailed` exit to be triggered, not `success`!');
      },
      requestFailed: function(err) {
        return done();
      },
      error: done
    });

  });

});


