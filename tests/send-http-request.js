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

  it('should trigger `success` and get the correct status code, body and headers when requesting a valid path via GET', function(done) {

    Http.sendHttpRequest({
      url: 'ok',
      baseUrl: 'http://localhost:1492',
      params: {
        owl: 'hoot',
        age: 99
      },
      headers: {
        'x-beans-beans': 'the musical fruit'
      }
    }).exec({
      success: function(response) {
        assert.equal(response.status, 200);
        var body = JSON.parse(response.body);
        var headers = JSON.parse(response.headers);
        assert.equal(body.method, 'GET');
        assert.equal(body.params.owl, 'hoot');
        assert.equal(body.params.age, 99);
        assert.equal(body.headers['x-beans-beans'], 'the musical fruit');
        assert.equal(headers['x-some-header'], 'foobar!');
        assert.equal(headers['x-powered-by'], 'Sails <sailsjs.org>');
        return done();
      },
      error: done
    });

  });

  it('should trigger `success` and get the correct status code, body and headers when requesting a valid path via POST', function(done) {

    Http.sendHttpRequest({
      url: 'ok?hungry=hippo',
      baseUrl: 'http://localhost:1492',
      method: 'POST',
      params: {
        owl: 'hoot',
        age: 99
      },
      headers: {
        'x-beans-beans': 'the musical fruit'
      }
    }).exec({
      success: function(response) {
        assert.equal(response.status, 200);
        var body = JSON.parse(response.body);
        var headers = JSON.parse(response.headers);
        assert.equal(body.method, 'POST');
        assert.equal(body.params.owl, 'hoot');
        assert.equal(body.params.age, 99);
        assert.equal(body.params.hungry, 'hippo');
        assert.equal(body.headers['x-beans-beans'], 'the musical fruit');
        assert.equal(headers['x-some-header'], 'foobar!');
        assert.equal(headers['x-powered-by'], 'Sails <sailsjs.org>');
        return done();
      },
      error: done
    });

  });

  it('should trigger `success` and get the correct status code, body and headers when requesting a valid path via POST and formData: true', function(done) {

    Http.sendHttpRequest({
      url: 'ok?hungry=hippo',
      baseUrl: 'http://localhost:1492',
      method: 'POST',
      params: {
        owl: 'hoot',
        age: 99
      },
      headers: {
        'x-beans-beans': 'the musical fruit'
      },
      formData: true
    }).exec({
      success: function(response) {
        assert.equal(response.status, 200);
        var body = JSON.parse(JSON.parse(response.body));
        var headers = JSON.parse(response.headers);
        assert.equal(body.method, 'POST');
        assert.equal(body.params.owl, 'hoot');
        assert.equal(body.params.age, 99);
        assert.equal(body.params.hungry, 'hippo');
        assert.equal(body.headers['x-beans-beans'], 'the musical fruit');
        assert.equal(headers['x-some-header'], 'foobar!');
        assert.equal(headers['x-powered-by'], 'Sails <sailsjs.org>');
        return done();
      },
      error: done
    });

  });


  it('should trigger `notFound` when a 404 status code is received', function(done) {

    Http.sendHttpRequest({
      url: 'notFound',
      baseUrl: 'http://localhost:1492'
    }).exec({
      success: function() {
        return done('Expected the `notFound` exit to be triggered, not `success`!');
      },
      notFound: function(response) {
        assert.equal(response.status, 404);
        return done();
      },
      error: done
    });

  });

  it('should trigger `badRequest` when a 400 status code is received', function(done) {

    Http.sendHttpRequest({
      url: 'badRequest',
      baseUrl: 'http://localhost:1492'
    }).exec({
      success: function() {
        return done('Expected the `badRequest` exit to be triggered, not `success`!');
      },
      badRequest: function(response) {
        assert.equal(response.status, 400);
        return done();
      },
      error: done
    });

  });

  it('should trigger `forbidden` when a 403 status code is received', function(done) {

    Http.sendHttpRequest({
      url: 'forbidden',
      baseUrl: 'http://localhost:1492'
    }).exec({
      success: function() {
        return done('Expected the `forbidden` exit to be triggered, not `success`!');
      },
      forbidden: function(response) {
        assert.equal(response.status, 403);
        return done();
      },
      error: done
    });

  });

  it('should trigger `unauthorized` when a 401 status code is received', function(done) {

    Http.sendHttpRequest({
      url: 'unauthorized',
      baseUrl: 'http://localhost:1492'
    }).exec({
      success: function() {
        return done('Expected the `unauthorized` exit to be triggered, not `success`!');
      },
      unauthorized: function(response) {
        assert.equal(response.status, 401);
        return done();
      },
      error: done
    });

  });

  it('should trigger `serverError` when a 5xx status code is received', function(done) {

    Http.sendHttpRequest({
      url: 'error',
      baseUrl: 'http://localhost:1492'
    }).exec({
      success: function() {
        return done('Expected the `serverError` exit to be triggered, not `success`!');
      },
      serverError: function(response) {
        assert.equal(response.status, 500);
        return done();
      },
      error: done
    });

  });

  it('should trigger `requestFailed` when attempting to reach a server that doesn\'t exist', function(done) {

    Http.sendHttpRequest({
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


