# Foundation libsass template

This is a template to start your own [Foundation](http://foundation.zurb.com) project that uses:

  * [Autoprefixer](https://github.com/ai/autoprefixer) for automatic vendor prefixes
  * [BrowserSync](http://browsersync.io/) for livereload and synchronized testing
  * [CSSO](http://bem.info/tools/optimizers/csso/) and [UglifyJS2](http://lisperator.net/uglifyjs/) for minification
  * [Gulp](http://gulpjs.com) to do all the things
  * [InstantClick](http://instantclick.io/) to instantly load pages
  * [JSHint](http://www.jshint.com/) for JS linting

## Requirements

You'll need to have the following items installed before continuing.

  * [Node.js](http://nodejs.org): Use the installer provided on the NodeJS website.
  * [Gulp](http://gulpjs.com): Run `[sudo] npm install -g gulp`
  * [Bower](http://bower.io): Run `[sudo] npm install -g bower`

## Quickstart

```bash
git clone https://github.com/covertg/foundation-template.git
cd foundation-template
npm install && bower install
```

While you're working on your project, run:

```bash
gulp
```

And you're set! Gulp will build, watch for changes, and serve your files on localhost. Check the console output for more info.

## Directory Structure

  * `src/`: All your sources go here
  * `build/`: All built files go here
  * `bower_components/foundation/scss/foundation/_settings.scss`: Foundation-specific settings go here
  * `Gulpfile.js`: Check this out for a sense of what's going on

## Other Notes
  
  * To build once for production, run: `gulp build --type dist` and gulp will rebuild and optimize/minify your files.
  * Replace the ">=" operators with "^" in `package.json` in the case of API updates or other package breakages.
  * Currently, we are using a PR repo for autoprefixer because it's more up-to-date.
  * NPM may seem to hang when installing ws (dependency of BrowserSync). Just give it some time.