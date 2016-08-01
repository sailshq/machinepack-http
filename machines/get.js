module.exports = {


  friendlyName: 'Send GET request',


  description: 'Send a GET request and receive the response.',


  inputs: {
    url: {
      description: 'The URL where the GET request should be sent.',
      extendedDescription: 'This should include the hostname and a protocol like "http://".',
      example: 'http://www.example.com',
      required: true
    }
  },

  exits: {

    success: {
      description: '2xx status code returned from server.',
      outputFriendlyName: 'Server response',
      outputDescription: 'The response from the server, including status, headers and body.',
      outputExample: {
        status: 201,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    },

    requestFailed: {
      description: 'Unexpected connection error: could not send or receive HTTP request.',
      extendedDescription: 'Could not send HTTP request; perhaps network connection was lost?'
    },

    non200Response: {
      description: 'A non-2xx status code was returned from the server.',
      outputFriendlyName: 'Server response',
      outputDescription: 'The response from the server, including status, headers and body.',
      outputExample: {
        status: 404,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    }
  },

  fn: function (inputs,exits) {

    // Require machinepack-urls
    var Urls = require('machinepack-urls');

    // Require this pack
    var Http = require('../');

    // Make sure this is a fully-qualified URL, and coerce it if necessary.
    var url = Urls.resolve({url: inputs.url}).execSync();

    // Send the HTTP request
    Http.sendHttpRequest({
      method: 'get',
      url: url
    }).exec({
      error: exits.error,
      requestFailed: exits.requestFailed,
      badRequest: exits.non200Response,
      unauthorized: exits.non200Response,
      forbidden: exits.non200Response,
      notFound: exits.non200Response,
      serverError: exits.non200Response,
      success: exits.success
    });

  },

};
