module.exports = {


  friendlyName: 'Get stream',


  description: 'Send a GET request and immediately return the stream, which can be pumped to obtain the bytes of the response.',


  extendedDescription:
  'This machine determines whether a URL can be reached via a GET request and whether it responds with a 2xx status code.  '+
  'If so, it waits until it\'s able to parse out response headers, then returns a Readable stream representing the response '+
  'body.  The responsibility for any other validations/error handling falls on the consumer of the stream. However, this machine '+
  '_DOES_ bind an `error` event handler on the stream to prevent emitted error events from crashing the process; ensuring that this '+
  'machine is agnostic of its userland environment. If you plan to write code which uses the readable stream returned by this machine '+
  'but you have never worked with Readable streams in Node.js, [check this out](https://docs.nodejitsu.com/articles/advanced/streams/how-to-use-fs-create-read-stream) '+
  'for tips. For more conceptual information about readable streams in Node.js in general, check out the section on '+
  '[`stream.Readable`](https://nodejs.org/api/stream.html#stream_class_stream_readable) in the Node.js docs.',


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
      outputDescription: 'The response stream',
      outputExample: '==='
    },

    non200Response: {
      description: 'A non-2xx status code was returned from the server.',
      outputFriendlyName: 'Partial server response',
      outputDescription: 'A dictionary representing part of the response from the server, including the status code and response headers.',
      outputExample: {
        statusCode: 404,
        headers: {},
      },
      extendedDescription: 'This server response DOES NOT CONTAIN a response body.'
    },

    requestFailed: require('../constants/request-failed.exit')

  },

  fn: function (inputs,exits) {

    // Import `request`.
    var request = require('request');

    // Import `lodash`.
    var _ = require('@sailshq/lodash');

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


    // Bind a no-op handler for the `error` event to prevent it from crashing the process if it fires.
    // (userland code can still bind and use its own error events).
    stream.on('error', function noop (err) { });
    // ^ Since event handlers are garbage collected when the event emitter is itself gc()'d, it is safe
    // for us to bind this event handler here.


    // Also bind a one-time error handler specifically to catch a few specific errors that can
    // occur up-front.
    stream.once('error', function (err) {
      // When receiving subsequent read errors on this Readable stream after
      // the first (or after we've exited successfully), the best we can do
      // is remain silent.
      if (alreadyExited) {
        // Note that in the future, we could expose an optional input
        // (e.g. `onUnexpectedError`) which accepts a notifier function that
        // could be called in this scenario.
        return;
      }

      // If we get an ENOTFOUND error, set the spinlock and return through the `requestFailed` exit.
      // (This means the request failed -- i.e. disconnected from internet?  server down?)
      if (err.code === 'ENOTFOUND') {
        alreadyExited = 'requestFailed';
        return exits.requestFailed(err);
      }

      // If any other sort of miscellaneous error occurs, set the spinlock and forward it through
      // the `error` exit.
      alreadyExited = 'error';
      return exits.error(err);
    });


    stream.on('response', function(httpResponse){

      // If the status code of the response is not in the 2xx range, then
      // return the server response dictionary through the `non2xxResponse` exit.
      if (httpResponse.statusCode >= 300 || httpResponse.statusCode <= 199) {
        alreadyExited = 'non200Response';
        return exits.non200Response({
          statusCode: httpResponse.statusCode,
          headers: httpResponse.headers,
        });
      }

      // Otherwise, send through the raw stream.
      alreadyExited = 'success';
      return exits.success(stream);

    });

  }


};
