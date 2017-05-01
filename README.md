[![HTTP with Node.js/Sails.js](https://camo.githubusercontent.com/9e49073459ed4e0e2687b80eaf515d87b0da4a6b/687474703a2f2f62616c64657264617368792e6769746875622e696f2f7361696c732f696d616765732f6c6f676f2e706e67)](https://sailsjs.com)

# machinepack-http

Send HTTP requests, scrape webpages, and stream data in your JavaScript/Node.js/Sails.js app with a simple, `jQuery.get()`-like interface for sending HTTP requests and processing server responses.


> mp-http is focused on immediate productivity with everyday cloud API interactions you're likely to encounter in web, mobile, and IoT apps.  Think of it as a simple, practical utility for simple, everyday cloud API interactions and integration tasks: scenarios where you don't need the flexibility of custom multipart POSTs or support for the HAR spec.
> 
> This package is maintained by the Sails.js core team.  Its primary goal is to provide robust, easy-to-use access to the HTTP protocol from Sails.js and Node.js.  Out of the box, it allows for negotiating errors from request failure (i.e. if the user is offline or the server is down) vs. errors from non-2xx status codes (e.g. deliberate server errors), as well as low-level streaming access to the HTTP response.  However this package _is not designed to be a replacement for [`request`](https://npmjs.com/package/request)_.  (In fact, it's just a higher-level wrapper _around_ the `request` module!)


## Installation &nbsp; [![NPM version](https://badge.fury.io/js/machinepack-http.svg)](http://badge.fury.io/js/machinepack-http)

To install this package, run:

```bash
$ npm install machinepack-http --save
```

Then [require it from the actions or helpers in your Sails app, a command-line script, or any other Node.js module](http://node-machine.org/machinepack-http).

## Usage

For the latest usage, version information, and test status of this module, see <a href="http://node-machine.org/machinepack-http" title="Send an HTTP request. (for node.js/sails.js)">http://node-machine.org/machinepack-http</a>.  The generated manpages for each machine contain a complete reference of all expected inputs, possible exit states, and example return values.  If you need more help, or find a bug, jump into [our chat room](https://gitter.im/balderdashy/sails) or leave a message in the project [newsgroup](https://groups.google.com/forum/?hl=en#!forum/sailsjs).


## Questions?

As a [machinepack](http://node-machine.org/machinepacks), this package implements a set of declarative interfaces, conventions, and best-practices for integrating with other software.  This loyal adherence to the [specification](http://node-machine.org/spec) enables the (re)use of built-in generic test suites, standardized documentation, reasonable expectations around the API for your users, and overall, a more pleasant development experience for everyone.

Documentation pages for the machines contained in this module (as well as all other NPM-hosted machines for Node.js) are automatically generated and kept up-to-date on the <a href="http://node-machine.org" title="Public machine registry for Node.js">public registry</a>.
Learn more at <a href="http://node-machine.org/implementing/FAQ" title="Machine Project FAQ (for implementors)">http://node-machine.org/implementing/FAQ</a>.

See the [documentation for actions2](http://sailsjs.com/documentation/concepts/actions-and-controllers) for Node.js/Sails.js, or check out [other recommended support options](http://sailsjs.com/support).


## Contributing &nbsp; [![Build Status](https://travis-ci.org/mikermcneil/machinepack-http.svg?branch=master)](https://travis-ci.org/mikermcneil/machinepack-http) &nbsp; [![Build status on Windows](https://ci.appveyor.com/api/projects/status/u0i1o62tsw6ymbjd/branch/master?svg=true)](https://ci.appveyor.com/project/mikermcneil/machinepack-http/branch/master)

Please observe the guidelines and conventions laid out in the [Sails project contribution guide](http://sailsjs.com/documentation/contributing) when opening issues or submitting pull requests.

[![NPM](https://nodei.co/npm/machinepack-http.png?downloads=true)](http://npmjs.com/package/machinepack-http)


## Bugs &nbsp; [![NPM version](https://badge.fury.io/js/machinepack-http.svg)](http://npmjs.com/package/machinepack-http)

To report a bug, [click here](http://sailsjs.com/bugs).


## License

This core package is available under the **MIT license**.

As for the [Sails.js framework](http://sailsjs.com) and [Node Machine Project](http://node-machine.org)?  They're free and open-source under the [MIT License](http://sailsjs.com/license) too.


MIT &copy; 2015-2017 [Mike McNeil](http://twitter.com/mikermcneil), [Scott Gress](https://twitter.com/sgress454), [The Sails Co.](https://sailsjs.com/about)


[![image_squidhome@2x.png](http://i.imgur.com/RIvu9.png)](https://sailsjs.com)

