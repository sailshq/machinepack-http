module.exports = {


  friendlyName: 'Send custom HTTP request',


  description: 'Send an HTTP request and receive the response.',


  extendedDescription:
  'The "Send custom HTTP request" machine underlies all HTTP requests sent by this pack.  '+
  'It is often unnecessary to call this machine directly, as several higher-level '+
  'alternatives like "GET" and "POST" are available, and are easier to use.  '+
  '"Send custom HTTP request" provides more flexibility, and so it is a bit more complex.  '+
  'But if your use case demands less commonly-used options, this machine is for you.',


  inputs: {

    method: {
      description: 'The HTTP method or "verb".',
      example: 'GET',
      required: true
    },

    url: {
      friendlyName: 'URL',
      description: 'The URL where the request should be sent.',
      extendedDescription: 'This is either (A) the fully-qualified URL, like "api.example.com/pets"; or (B) a URL path like "/posts/283119/comments" to use as a suffix for the provided `baseUrl`.',
      example: '/7/friends/search',
      required: true
    },

    baseUrl: {
      friendlyName: 'Base URL',
      description: 'Optional base URL to resolve the main URL against, with or without the protocol prefix (e.g. "http://").',
      extendedDescription: 'If specified, this _must_ include the hostname (e.g. `api.example.com`).  It may also include a path (e.g. `http://api.example.com/pets`).',
      example: 'api.example.com/pets'
    },

    params: {
      description: 'Parameters to include in the request (e.g. {"email": "fooberbash.foo"}).',
      extendedDescription: 'These values will be either encoded in the querystring or included as JSON in the body of the request based on the request method (GET/POST/etc.).  For non-GET requests, this input will be ignored if "body" is provided.',
      example: {},
      // e.g. {"email": "foo@fooberbash.foo"}
    },

    body: {
      description: 'Body of the request (for PUT and POST).',
      extendedDescription: 'This will override the value of the "params" input (if any) for non-GET requests unless "formData" is true.  Conversely, GET requests will ignore this input entirely.  To send an empty body with a non-GET request, do not provide a value for the "params" or "body" inputs.',
      example: '*'
    },

    formData: {
      description: 'A boolean value indicating if the params should be sent as url encoded form data. If false JSON will be used.',
      extendedDescription: 'If "formData" is true, the "body" input will be ignored in favor of the "params" input value (defaulting to an empty dictionary).',
      example: false
    },

    headers: {
      description: 'Headers to include in the request (e.g. {"Content-Type": "application/json"}).',
      extendedDescription: 'Request headers should be provided as a dictionary, where each key is the name of a request header to send, '+
      'and each right-hand-side value is the data to send for that header.  Header values are always strings.',
      // e.g. {"Accepts":"application/json"}
      example: {},
      defaultsTo: {}
    }

  },

  exits: {

    success: {
      description: 'A 2xx status code was returned from the server.',
      outputFriendlyName: 'Server response',
      outputDescription: 'The response from the server, including the status code, headers, and raw body.',
      outputExample: {
        statusCode: 201,
        headers: {},
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      },
      extendedDescription:
      'This server response contains a _raw response body_ (`body`), which is _always_ a string.  '+
      'If you need to work with this response body in more depth, you may need to parse it '+
      'into whichever format you are expecting (usually JSON--but occasionally XML, CSV, etc.)'
    },

    requestFailed: require('../constants/request-failed.exit'),

    non200Response: require('../constants/non-200-response.exit')

  },

  fn: function (inputs,exits) {

    // Import `util`.
    var util = require('util');

    // Import `lodash` and `request`.
    var _ = require('lodash');
    var request = require('request');

    // Import `machinepack-urls` and `machinepack-json`.
    var Urls = require('machinepack-urls');
    var Json = require('machinepack-json');


    // Ensure method is upper-cased.
    inputs.method = inputs.method.toUpperCase();


    // Resolve the fully-qualified destination URL.
    // (remember: this also ensures that this is a fully qualified URL, including the protocol)
    //
    // > Note that if this fails, the error will be forwarded through our
    // > `error` exit, which is proper since it'll be an input validation error.
    var targetUrl = Urls.resolve({
      baseUrl: inputs.baseUrl,
      url: inputs.url
    }).execSync();


    // Build the options to send to the `request` module.
    var options = (function build_options_for_mikeal_request(){

      // Declare a var to hold the options, and set some base values.
      var options = {
        method: inputs.method,
        url: targetUrl,
        headers: inputs.headers||{}
      };

      // For GET requests, set the query string to the specified params,
      // and default to expecting a JSON response.
      if (options.method === 'GET') {
        return _.extend(options, {
          qs: inputs.params,
          json: true,
        });
      }

      // Set the "form" or "json" options depending on whether `inputs.formData`
      // was set.
      if(inputs.formData) {
        options.form = inputs.params || {};
      } else {
        options.json = inputs.body || inputs.params;
      }

      // Return the options dictionary we constructed.
      return options;
    })();


    // Send the request using the options dictionary constructed above.
    request(options, function gotResponse(err, response, httpBody) {
      try {
        // The request failed (disconnected from internet?  server down?)
        // Return the unknown error through the `requestFailed` exit.
        if (err) {
          return exits.requestFailed(err);
        }

        // --•
        // Otherwise, we'll build a normalized server response.
        //
        // > Regardless of the status code sent in the response, we'll
        // > use this dictionary as our output when we exit below.
        var serverRes = {
          statusCode: response.statusCode,
          headers: response.headers || {},
          body: httpBody || ''
        };

        // If the status code of the response is not in the 2xx range, then
        // return the server response dictionary through the `non2xxResponse` exit.
        if (response.statusCode >= 300 || response.statusCode <= 199) {
          return exits.non2xxResponse(serverRes);
        }

        // --•
        // Otherwise, return the server response dictionary through
        // the `success` exit.
        return exits.success(serverRes);

      } catch (e) { return exits.error(e); }
    });//</request()>

  }


};
