module.exports = {


  friendlyName: 'Get stream',


  description: 'Send a GET request and immediately return the stream, which can be pumped to obtain the bytes of the response.',


  extendedDescription:
  'The responsibility for any other validations/error handling falls on the consumer of the stream. However, this method '+
  '_DOES_ bind an `error` event handler on the stream to prevent emitted error events from crashing the process; ensuring that this '+
  'method is agnostic of its userland environment. If you plan to write code which uses the readable stream returned by this method '+
  'but you have never worked with Readable streams in Node.js, [check this out](https://docs.nodejitsu.com/articles/advanced/streams/how-to-use-fs-create-read-stream) '+
  'for tips. For more conceptual information about readable streams in Node.js in general, check out the section on '+
  '[`stream.Readable`](https://nodejs.org/api/stream.html#stream_class_stream_readable) in the Node.js docs.',


  sideEffects: 'cacheable',


  inputs: {

    url: require('../constants/url.input'),

    data: {
      description: 'Optional data to send with this request.',
      extendedDescription:
      'If provided, this data will be automatically encoded in the URL\'s query string '+
      'and sent along with the request.  This is because, for caching and semantic reasons, '+
      'GET requests [should not be sent with a body](http://stackoverflow.com/questions/978061/http-get-with-request-body).',
      moreInfoUrl: 'https://en.wikipedia.org/wiki/Query_string',
      example: {}
    },

    headers: require('../constants/headers.input'),

    baseUrl: require('../constants/base-url.input')

  },

  exits: {

    success: {
      description: 'The request may or may not have been successful.',
      outputFriendlyName: 'Stream',
      outputDescription: 'The response stream',
      outputExample: '==='
    }

  },

  fn: function (inputs,exits) {

    // Import PassThrough stream constructor from Node core.
    var PassThrough = require('stream').PassThrough;

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
    _.extend(requestOpts.headers, inputs.headers||{});


    // And send the request using the options dictionary constructed above.
    var alreadyExited;
    var mikealStream = request(requestOpts);


    // Bind a no-op handler for the `error` event to prevent it from crashing the process if it fires.
    // (userland code can still bind and use its own error events).
    mikealStream.on('error', function noop (unusedErr) { /*… no-op …*/ });
    // ^ Since event handlers are garbage collected when the event emitter is itself gc()'d, it is safe
    // for us to bind this event handler here.

    // Also bind a one-time error handler specifically to catch a few specific errors that can
    // occur up-front.
    mikealStream.once('error', function (err) {
      // When receiving subsequent read errors on this Readable stream after
      // the first (or after we've exited successfully), the best we can do
      // is remain silent.
      if (alreadyExited) {
        console.error('already exited, but original stream from mikeal/request got its first error:', err);
        // Note that in the future, we could expose an optional input
        // (e.g. `onUnexpectedError`) which accepts a notifier function that
        // could be called in this scenario.
        //
        // > There are certain streams that are "misbehaved" for varying reasons
        // > (older Node version compatibility, by accident, etc.), and so it is
        // > sometimes necessary to handle the case where they do not behave properly.
        // > For example, even in the 'request' package, this is a thing.  This thread
        // > from 2011 has more information, but the same issues occur even in the latest
        // > release on NPM as of 2017: https://groups.google.com/forum/#!topic/nodejs/YajTWrqLfvk
        return;
      }

      // If any other sort of miscellaneous error occurs, set the spinlock and forward it through
      // the `error` exit.
      alreadyExited = 'error';
      return exits.error(err);
    });


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // TODO: try this instead of the code below:
    // ```
    var passThrough = new PassThrough();
    passThrough.on('error', function noop (unusedErr) { /*… no-op …*/ });//œ
    passThrough.once('error', function (err) {
      if (alreadyExited) {
        console.error('already exited, but PassThrough stream got its first error:', err);
        return;
      }//•
      alreadyExited = 'error';
      return exits.error(err);
    });//œ
    mikealStream.pipe(passThrough);

    // Finish up.
    alreadyExited = 'success';

    return exits.success(passThrough);
    // ```
    // For more background on this, see:
    // • https://github.com/aws/aws-sdk-js/issues/1761#issuecomment-455723620
    // • https://github.com/aws/aws-sdk-js/issues/2100#issuecomment-415608037
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // return exits.success(stream);
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: Find a solution for this.  (What is "this"?  I think I was referring to the
    // problem of not knowing whether this was a non 2xx status code response, and also not
    // knowing about requestFailed.)
    //
    // (See also commit 33cc1605615e720119f90609b1738d10f32bdb86 in `machinepack-fs` for
    // more information on why this isn't really feasible right now-- at least not as long as
    // we're using the `request` package.)
    // ^^https://github.com/mikermcneil/machinepack-fs/commit/33cc1605615e720119f90609b1738d10f32bdb86
    //
    // For the old way, and many more notes, see commit e4d9f3de890aa94df3acb06acc2769764e0bc0e8
    // in THIS repo.  ^^^ Actually that commit doesn't seem to be in this repo so I don't know
    // what I was talking about.  Maybe I meant in mp-fs?  Or in sails-hook-uploads?  Or skipper?
    // Or skipper-s3?  Or skipper-disk?  Or sails?  Or machine-as-action?
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  }


};
