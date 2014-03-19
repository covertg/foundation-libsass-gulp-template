# Foundation libsass template

This is a template to start your own project that uses Gulp and libsass!

## Requirements

You'll need to have the following items installed before continuing.

  * [Node.js](http://nodejs.org): Use the installer provided on the NodeJS website.
  * [Gulp](http://gulpjs.com): Run `[sudo] npm install -g gulp`
  * [Bower](http://bower.io): Run `[sudo] npm install -g bower`

## Quickstart

```bash
git clone https://github.com/covertg/libsass-template.git
npm install
bower install
```

While you're working on your project, run:

```bash
gulp
```

And you're set! Gulp will run and watch for changes.

To build once for production, run:

```bash
gulp --type dist
```

And gulp will rebuild and optimize/minify your files.

## Directory Structure

  * `src/`: All application sources go here
  * `build/`: All built files go here
  * `bower_components/foundation/scss/foundation/_settings.scss`: Foundation configuration settings go in here

## Notes

  * Replace the ">=" operators with "^" in package.json in the case of future API updates or other package breakages.