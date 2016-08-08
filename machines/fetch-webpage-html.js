module.exports = {


  friendlyName: 'Fetch webpage HTML',


  description: 'Fetch the HTML from a web page.',


  sideEffects: 'cacheable',


  inputs: {

    url: {
      friendlyName: 'URL',
      example: 'http://www.example.com',
      description: 'The URL of the web page to fetched.',
      extendedDescription: 'This should include the hostname and a protocol like "http://".',
      required: true,
    }

  },

  exits: {

    success: {
      outputExample: '<html><body><h1>Hello world</h1></body></html>',
      outputFriendlyName: 'Webpage HTML',
      outputDescription: 'The HTML contents of the fetched web page.'
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
  fn: function(inputs, exits) {

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
      success: function (response){

        // Declare a var to hold the response HTML
        var html;

        // Attempt to parse the response in case it came back as a JSON string
        try {
          html = JSON.parse(response.body);
        }
        // Otherwise use the raw response
        catch (e) {
          html = response.body;
        }

        // Send the HTML through the `success` exit.
        return exits.success(html);
      }
    });

  }

};
