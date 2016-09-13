module.exports = {


  friendlyName: 'Negotiate HTTP status code',


  description: 'Trigger a specific exit based on the provided HTTP status code.',


  sync: true,


  sideEffects: 'cacheable',


  inputs: {

    statusCode: {
      description: 'The status code to negotiate.',
      example: 403,
      required: true
    }

  },


  exits: {

    success: {
      description: 'A 2xx status code was returned.',
    },

    redirect: {
      description: 'A 3xx status code was returned.',
    },

    badRequest: {
      description: '400 status code was returned.',
    },

    unauthorized: {
      description: '401 status code was returned.',
    },

    forbidden: {
      description: '403 status code was returned.',
    },

    notFound: {
      description: '404 status code was returned.',
    },

    otherClientError: {
      description: 'A 4xx status code other than 400, 401, 403 or 404 was returned.'
    },

    serverError: {
      description: '5xx status code was returned.',
    },

    other: {
      description: 'An unusual / unsupported status code was returned.'
    }

  },


  fn: function(inputs, exits) {

    if (inputs.statusCode < 200 || inputs.statusCode > 599) {
      return exits.other();
    }

    if (inputs.statusCode >= 200 && inputs.statusCode < 300) {
      return exits.success();
    }

    if (inputs.statusCode >= 300 && inputs.statusCode < 400) {
      return exits.redirect();
    }

    if (inputs.statusCode >= 400 && inputs.statusCode < 500) {
      if (inputs.statusCode === 400) {
        return exits.badRequest();
      }
      if (inputs.statusCode === 401) {
        return exits.unauthorized();
      }
      if (inputs.statusCode === 403) {
        return exits.forbidden();
      }
      if (inputs.statusCode === 404) {
        return exits.notFound();
      }
      return exits.otherClientError();
    }

    if (inputs.statusCode >= 500 && inputs.statusCode < 600) {
      return exits.serverError();
    }

    return exits.other();

  }


};
