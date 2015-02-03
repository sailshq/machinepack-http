module.exports = {

  friendlyName: 'Send http request',

  description: 'Send an HTTP request and receive the response.',

  extendedDescription: '',

  inputs: {
    baseUrl: {
      description: 'The base URL, including the hostname and a protocol like "http://"',
      example: 'http://google.com',
      required: true
    },
    url: {
      description: 'The "path" part of the URL, including the leading slash ("/")',
      example: '/pets',
      required: true
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


    inputs.method = (inputs.method||'get').toLowerCase();

    // Strip trailing slash(es) from the base url for API requests
    inputs.baseUrl = inputs.baseUrl.replace(/\/*$/, '');

    // url should start w/ a leading slash
    // Help our future selves out by ensuring there is a leading slash:
    inputs.url = inputs.url.replace(/^([^\/])/,'/$1');

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

