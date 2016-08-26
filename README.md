# Do Less

This is a basic framework to quickly get started with a front-end project. The framework focuses on speed so there are no unnecessary styles set by default (e.g. color classes, grid columns etc.), instead you should build up classes as and when they are needed. This approach should make for a lightweight css file. 

## Development directory

There are a few steps required to get the development directory correctly building assets:

### 1. Modernizr build

To create the modernizr custom build, make sure you have the Modernizr CLI installed `npm install -g modernizr`. Then create the custom build by running `modernizr --config modernizr-config.json --dest ./src/js/vendor/modernizr.js`.

### 2. Install npm modules

Run `npm install` to install the required npm modules.

### 3. Bower dependencies

Run `bower install` to install the list of Bower dependencies.

### 4. Move Normalize css

Move `normalize.css` from `bower_components` to `sass` directory and rename to `_normalize.scss`. This is fairly tedious, but avoids css imports by including as a sass partial. You could write a shell script to do this but sometimes the simple ways are the best and the directory structure for normalize.css could change which would break any script.

### 5. Gulp config

The framework uses Gulp as a task runner. All of the Gulp specific settings can be found in `config.js`.

### 6. Gulp tasks

There are two gulp tasks (**development** and **production**) which are controlled with the node scripts `npm run development` and `npm run production`. The development command starts a proxy server with BrowserSync, so make sure `proxy` has been set correctly in `config.js`.

## sass architecture

The sass directory tries to adhere to the ITCSS methodology ([watch this presentation](https://www.youtube.com/watch?v=1OKZOV-iLj4) if you are unfamiliar with ITCSS).

There are also a few guidlines for working with the css to create a maintainable and consistent architecture:

1. Only apply margin to left and bottom of elements for consistent and behaviour when moving page elements.
 
2. Use BEM syntax for class naming conventions [http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/](http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/).

3. Add styles in alphabetical order (e.g. background, border, color, font).

4. Add media queries on a per style block basis (i.e. not in a separate file).

5. Use `/* Magic number */` when adding integer styles to modify element alignment. It makes for a quick reference when updating in the future.

6. Write as much documentation and comments as possible to make the purpose of your code obvious. 