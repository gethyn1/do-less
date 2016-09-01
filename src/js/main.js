'use strict';

import {doNothing} from './modules/module';
import * as $ from './modules/utils';

let App = App || {};

App.init = (() => {
	console.log('Do less');

	doNothing();
})();