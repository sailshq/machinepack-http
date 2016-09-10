module.exports = {


  friendlyName: 'POST',


  description: 'Send a POST request and receive the response.',


  extendedDescription: 'This machine is designed for making everyday requests to a JSON API.  '+
  'For more flexibility, use the lower-level machine, `sendHttpRequest()`.',


  inputs: {

    url: {
      description: 'The URL where the POST request should be sent.',
      extendedDescription: 'This should include the hostname and a protocol like "http://".',
      example: 'https://example.com/api/v1/farms',
      required: true
    },

    data: {
      description: 'Data to send in the body of this request.',
      extendedDescription: 'This request data will be transmitted as JSON.  Use the lower-level machine, '+
      '`sendHttpRequest()`, for additional options.',
      example: {}
    }

  },

  exits: {

    success: {
      description: 'The server responded with a 2xx status code.',
      outputFriendlyName: 'Response data',
      outputDescription: 'The response data from the server.',
      outputExample: '*',
      extendedDescription: 'Use the lower-level machine, `sendHttpRequest()`, if your response body is encoded in a format '+
      'other than JSON, or if you need to access the exact status code and response headers.',
    },

    requestFailed: {
      description: 'Unexpected connection error: could not send or receive HTTP request.',
      extendedDescription: 'Could not send HTTP request; perhaps network connection was lost?'
    },

    non200Response: {
      description: 'A non-2xx status code was returned from the server.',
      outputFriendlyName: 'Server response',
      outputDescription: 'The response from the server, including the status code, headers and raw body.',
      outputExample: {
        statusCode: 404,
        headers: {},
        body: '...[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    }
  },

  fn: function (inputs,exits) {

    // Require machinepack-urls
    var Urls = require('machinepack-urls');

    // Require this pack
    var Http = require('../');

    // Make sure this is a fully-qualified URL, and coerce it if necessary.
    var url;
    try {
      url = Urls.resolve({url: inputs.url}).execSync();
    } catch (e) {
      return exits.error(e);
    }

    // Send the HTTP request
    Http.sendHttpRequest({
      method: 'POST',
      url: url,
      body: inputs.data
    }).exec({
      error: exits.error,
      requestFailed: exits.requestFailed,
      non200Response: exits.non200Response,
      success: exits.success
    });

  },

};
