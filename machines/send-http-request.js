module.exports = {

  friendlyName: 'Send HTTP request',

  description: 'Send an HTTP request and receive the response.',

  extendedDescription: '',

  inputs: {
    url: {
      description: 'The URL where the request should be sent.',
      extendedDescription: 'If `baseUrl` is specified, then `url` should be the "path" part of the URL-- e.g. everything after and including the leading slash ("/users/7/friends/search")',
      example: '/pets/18',
      required: true
    },
    baseUrl: {
      description: 'The base URL, including the hostname and a protocol like "http://"',
      example: 'http://google.com'
    },
    method: {
      description: 'The HTTP method or "verb"',
      example: 'get'
    },
    params: {
      description: 'Parameters to include in the request (e.g. {"email": "fooberbash.foo"})',
      extendedDescription: 'These values will be either encoded in the querystring or included as JSON in the body of the request based on the request method (GET/POST/etc.)',
      typeclass: 'dictionary'
      // e.g. {"email": "foo@fooberbash.foo"}
    },
    headers: {
      description: 'Headers to include in the request (e.g. {"Content-Type": "application/json"})',
      typeclass: 'dictionary'
      // e.g. {"Accepts":"application/json"}
    }
  },

  exits: {

    success: {
      description: '2xx status code returned from server',
      example: {
        status: 201,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    },

    notOk: {
      description: 'Non-2xx status code returned from server',
      example: {
        status: 400,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    },

    error: {
      description: 'Unexpected request error',
      extendedDescription: 'Could not send HTTP request; perhaps network connection was lost?'
    }
  },

  defaultExit: 'success',

  fn: function (inputs,exits) {

    // Module dependencies
    var util = require('util');
    var request = require('request');
    var _ = require('lodash');
    var Urls = require('machinepack-urls');


    // Default to a GET request
    inputs.method = (inputs.method||'get').toLowerCase();

    if (inputs.baseUrl) {
      // Strip trailing slash(es)
      inputs.baseUrl = inputs.baseUrl.replace(/\/*$/, '');

      // and ensure this is a fully qualified URL w/ the "http://" part
      // (if not, attempt to coerce)
      inputs.baseUrl = Urls.sanitize({url:inputs.baseUrl}).execSync();

      // If a `baseUrl` was provided then `url` should just be the path part
      // of the URL, so it should start w/ a leading slash
      // (if not, attempt to coerce)
      inputs.url = inputs.url.replace(/^([^\/])/,'/$1');
    }
    // If no baseUrl was specified:
    else {
      // Coerce it to an empty string
      inputs.baseUrl = '';

      // Then ensure `url` is fully qualified (w/ the "http://" and hostname part)
      inputs.url = Urls.sanitize({url:inputs.url}).execSync();
    }


    // Send request
    request((function build_options_for_mikeal_request(){

      if (inputs.method === 'get') {
        return {
          method: 'GET',
          url: inputs.baseUrl + inputs.url,
          qs: inputs.params,
          json: true,
          headers: inputs.headers
        };
      }


      return {
        method: inputs.method.toUpperCase(),
        url: inputs.baseUrl + inputs.url,
        json: inputs.params||{},
        headers: inputs.headers||{}
      };
    })(), function gotResponse(err, response, httpBody) {

      // Wat (disconnected from internet maybe?)
      if (err) {
        return exits.error('Could not send HTTP request; perhaps network connection was lost?\nError details:\n' + util.inspect(err, false, null));
      }


      // Non 2xx status code
      if (response.statusCode >= 300 || response.statusCode < 200) {
        return exits.notOk({
          status: response.statusCode,
          headers: stringifySafe(response.headers),
          body: stringifySafe(httpBody)
        });
      }

      // Success, send back the body
      return exits.success({
        status: response.statusCode,
        headers: stringifySafe(response.headers),
        body: stringifySafe(httpBody)
      });
    });


    // Helper functions
    function parseObject(objAsJsonStr) {
      try {
        return JSON.parse(objAsJsonStr);
      }
      catch (e) {
        return {};
      }
    }

    function stringifySafe(serializableThing) {
      try {
        return JSON.stringify(serializableThing);
      }
      catch (e) {
        return '';
      }
    }
  },

};

