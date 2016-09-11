module.exports = {


  friendlyName: 'POST',


  description: 'Send a POST request and receive the response.',


  extendedDescription: require('../constants/http-shortcuts.extended-description'),


  inputs: {

    url: require('../constants/url.input'),

    baseUrl: require('../constants/base-url.input'),

    data: require('../constants/data.input')

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
      method: 'POST',
      url: inputs.url,
      baseUrl: inputs.baseUrl,
      body: inputs.data
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
