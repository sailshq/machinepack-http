module.exports = {


  friendlyName: 'Fetch webpage HTML',


  description: 'Fetch the HTML from a web page.',


  sideEffects: 'cacheable',


  inputs: {

    url: {
      friendlyName: 'URL',
      description: 'The URL of the web page to fetch.',
      extendedDescription: 'This should include the hostname and a protocol like "http://".',
      example: 'http://www.example.com/games/search?q=minecraft&page=14',
      required: true,
    }

  },

  exits: {

    success: {
      outputExample: '<html><body><h1>Hello world</h1></body></html>',
      outputFriendlyName: 'Webpage HTML',
      outputDescription: 'The HTML contents of the fetched web page.',
      extendedDescription: 'If the server does not send a response body, this will be set to "" (empty string).'
    },

    non200Response: require('../constants/non-200-response.exit'),

    requestFailed: require('../constants/request-failed.exit')

  },


  fn: function(inputs, exits) {

    // Require this pack
    var Http = require('../');

    // Send the HTTP request.
    Http.sendHttpRequest({
      method: 'GET',
      url: inputs.url
    }).exec({
      error: function (err) { return exits.error(err); },
      requestFailed: function (err) { return exits.requestFailed(err); },
      non200Response: function (serverRes) { return exits.non200Response(serverRes); },
      success: function (serverRes) {

        // Declare a var to hold the response HTML
        var html;

        // As a nicety, attempt to parse the response body as JSON, in case
        // the response body came back encoded as JSON.
        try {
          html = JSON.parse(serverRes.body);
        }
        // If it cannot be parsed as JSON (i.e. the usual case), then use
        // the raw response body as our result HTML.
        catch (e) {
          html = serverRes.body;
        }

        // Send the HTML through the `success` exit.
        return exits.success(html);
      }
    });

  }


};
