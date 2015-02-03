module.exports = {
  friendlyName: 'Fetch webpage HTML',
  description: 'Fetch the HTML from a web page.',
  inputs: {

    url: {
      friendlyName: 'URL',
      example: 'http://www.example.com',
      description: 'The URL of the web page to fetched',
      extendedDescription: 'This should include the hostname and a protocol like "http://"',
      required: true,
    }

  },
  defaultExit: 'success',
  exits: {
    success: {
      example: '<html><body><h1>Hello world</h1></body></html>',
      friendlyName: 'then',
      description: 'HTML contents of the web page fetched successfully.'
    },
    notOk: {
      description: 'Non-2xx status code returned from server',
      example: {
        status: 400,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    },
    error: {
      description: 'Unexpected request error',
      extendedDescription: 'Could not send HTTP request; perhaps network connection was lost?'
    }
  },
  fn: function(inputs, exits) {

    var Machine = require('machine');

    // If a protocol is already included in URL, leave it alone
    if (inputs.url.match(/^(http:\/\/|https:\/\/)/)) {}
    // If protocol is invalid, but sort of makes sense ("//"), change it to `http`
    else if (inputs.url.match(/^(\/\/)/)){
      inputs.url = 'http:'+inputs.url;
    }
    // Otherwise default to "http://" and prefix the provided URL w/ that
    else {
      inputs.url = 'http://'+inputs.url;
    }

    Machine.build(require('./send-http-request')).configure({
      method: 'get',
      url: inputs.url
    }).exec({
      error: exits.error,
      notOk: exits.notOk,
      success: function (response){
        var html = response.body;
        return exits.success(html);
      }
    });

  }

};
