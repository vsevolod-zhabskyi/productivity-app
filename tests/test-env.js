const fs = require('fs');
window.document.body.innerHTML = fs.readFileSync('./__mocks__/testingPage.html');

import $ from 'jquery';
global.$ = $;
