module.exports = {


  friendlyName: 'Get stream',


  description: 'Send a GET request and immediately return the stream, which can be pumped to obtain the bytes of the response.',


  sideEffects: 'cacheable',


  inputs: {

    url: require('../constants/url.input'),

    baseUrl: require('../constants/base-url.input'),

    data: {
      description: 'Optional data to send with this request.',
      extendedDescription:
      'If provided, this data will be automatically encoded in the URL\'s query string '+
      'and sent along with the request.  This is because, for caching and semantic reasons, '+
      'GET requests [should not be sent with a body](http://stackoverflow.com/questions/978061/http-get-with-request-body).',
      moreInfoUrl: 'https://en.wikipedia.org/wiki/Query_string',
      example: {}
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
      description: 'The server responded with a 2xx status code.',
      outputFriendlyName: 'Stream',
      outputDescription: 'The response stream (WITHOUT any error handlers bound to it!  That\'s up to you!)',
      outputExample: '==='
    },

    non200Response: require('../constants/non-200-response.exit'),

    requestFailed: require('../constants/request-failed.exit')

  },

  fn: function (inputs,exits) {

    // Import `request`.
    var request = require('request');

    // Import `lodash`.
    var _ = require('lodash');

    // Import `machinepack-urls`.
    var Urls = require('machinepack-urls');


    // Resolve the fully-qualified destination URL.
    // (remember: this also ensures that this is a fully qualified URL, including the protocol)
    //
    // > Note that if this fails, the error will be forwarded through our
    // > `error` exit, which is proper since it'll be an input validation error.
    var targetUrl = Urls.resolve({
      baseUrl: inputs.baseUrl,
      url: inputs.url
    }).execSync();


    // Now we'll build the options to send to the `request` module.

    // Start by declaring a var to hold the options and setting some base values.
    var requestOpts = {
      method: 'GET',
      url: targetUrl,
      headers: {}
    };


    // If query string data was provided, then...
    if (!_.isUndefined(inputs.data)) {

      // Set the request module's `qs` option so that the provided data
      // will be appropriately encoded and appended to the URL.
      requestOpts.qs = inputs.data;
    }


    // >-
    // Now fold in any custom headers that were provided.
    //
    // > We do this down here so that custom headers from userland
    // > override the defaults we assigned above.
    _.extend(requestOpts.headers, inputs.headers);


    // And send the request using the options dictionary constructed above.
    var alreadyExited;
    var stream = request(requestOpts);
    stream.on('response', function(httpResponse){
      // If the status code of the response is not in the 2xx range, then
      // return the server response dictionary through the `non2xxResponse` exit.
      if (httpResponse.statusCode >= 300 || httpResponse.statusCode <= 199) {
        alreadyExited = 'non200Response';
        return exits.non200Response(serverRes);
      }

      alreadyExited = 'success';
      return exits.success(stream);

    });
    stream.on('error', function (err){
      if (alreadyExited) {
        console.warn('Unexpected error handler triggered on HTTP request stream -- but AFTER the `get-stream` machine already called its `'+alreadyExited+'` exit!');
        return;
      }
      // The request failed (disconnected from internet?  server down?)
      // Return the unknown error through the `requestFailed` exit.
      alreadyExited = 'requestFailed';
      return exits.requestFailed(err);
    });

  }


};
