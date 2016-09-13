module.exports = {


  friendlyName: 'GET',


  description: 'Send a GET request and receive the response.',


  extendedDescription: require('../constants/http-shortcuts.extended-description'),


  sideEffects: 'cacheable',


  inputs: {

    url: require('../constants/url.input'),

    baseUrl: require('../constants/base-url.input'),

    data: {
      description: 'Optional data to send with this request.',
      extendedDescription:
      'If provided, this data will be automatically encoded in the URL\'s query string '+
      'and sent along with the request.  This is because, for caching and semantic reasons, '+
      'GET requests [should not be sent with a body](http://stackoverflow.com/questions/978061/http-get-with-request-body).  '+
      'For additional encoding options, use the lower-level machine: `sendHttpRequest()`.',
      moreInfoUrl: 'https://en.wikipedia.org/wiki/Query_string',
      example: {}
    }

  },

  exits: {

    success: require('../constants/http-shortcuts-success.exit'),

    non200Response: require('../constants/non-200-response.exit'),

    requestFailed: require('../constants/request-failed.exit')

  },

  fn: function (inputs,exits) {

    // Require this pack
    var Http = require('../');

    // Send the HTTP request.
    Http.sendHttpRequest({
      method: 'GET',
      url: inputs.url,
      baseUrl: inputs.baseUrl,
      qs: inputs.data
    }).exec({
      error: function (err) { return exits.error(err); },
      requestFailed: function (err) { return exits.requestFailed(err); },
      non200Response: function (serverRes) { return exits.non200Response(serverRes); },
      success: function (serverRes) {

        // Now that the server responded successfully, we need to check out
        // the response body and, if relevant, attempt to parse data from it.

        // If there is no response body (i.e. `body` is `""`),
        // then we'll interpret that as `null` and return that as
        // our response data.
        if (serverRes.body === '') {
          return exits.success(null);
        }

        // --•
        // Otherwise, attempt to parse the response body as JSON.
        var resData;
        try {
          resData = JSON.parse(serverRes.body);
        } catch (e) {
          // If the raw response body string cannot be parsed as JSON,
          // then interpret it as a string and just use the raw body.
          resData = serverRes.body;
        }

        // And finally, return the response data through the `success` exit.
        return exits.success(resData);

      }//</on success :: Http.sendHttpRequest()>
    });//</Http.sendHttpRequest()>
  }


};
