module.exports = {
  friendlyName: 'Fetch webpage HTML',
  description: 'Fetch the HTML from a web page.',
  inputs: {

    url: {
      friendlyName: 'URL',
      example: 'http://www.example.com',
      description: 'The URL of the web page to fetched',
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
    Machine.build(require('./send-http-request')).configure({
      method: 'get',
      url: iputs.url
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
