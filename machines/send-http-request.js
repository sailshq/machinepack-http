module.exports = {

  friendlyName: 'Send http request',

  description: 'Send an HTTP request and wait receive the response.',

  extendedDescription: '',

  inputs: {
    baseUrl: {
      example: 'http://google.com',
      required: true
    },
    url: {
      example: '/pets',
      required: true
    },
    method: {
      example: 'get'
    },
    params: {
      example: '{"email": "foo@fooberbash.foo"}'
    },
    headers: {
      example: '{"Accepts":"application/json"}'
    }
  },

  exits: {

    success: {
      description: '2xx status code returned from server',
      example: {
        status: 201,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be anything)'
      }
    },

    notOk: {
      description: 'Non-2xx status code returned from server',
      example: {
        status: 400,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be anything)'
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
          qs: parseObject(inputs.params),
          json: true,
          headers: parseObject(inputs.headers)
        };
      }


      return {
        method: inputs.method.toUpperCase(),
        url: inputs.baseUrl + inputs.url,
        json: parseObject(inputs.params),
        headers: parseObject(inputs.headers)
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

    function parseArray(arrayAsJsonStr) {
      try {
        return JSON.parse(arrayAsJsonStr);
      }
      catch (e) {
        return [];
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

