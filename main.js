/**
 * Main app module
 * 
 * @module main
 */

import { format } from "https://cdn.skypack.dev/d3-format@3";
import * as HelpR from './modules/webr-helpers.js'; // WebR-specific helpers
// import * as App from './modules/webr-app.js'; // our app's functions

console.time('Execution Time'); // keeps on tickin'
const timerStart = performance.now();

import { WebR } from '/webr/webr.mjs'; // service workers == full path starting with /

globalThis.webR = new WebR({
	WEBR_URL: "/webr/",
	SW_URL: "/webr/"
}); 
await globalThis.webR.init(); 

// WebR is ready to use. So, brag about it!

const timerEnd = performance.now();
console.timeEnd('Execution Time');

document.getElementById('loading').innerText = `WebR Loaded! (${format(",.2r")((timerEnd - timerStart) / 1000)} seconds)`;

const mtcars = await HelpR.getDataFrame(globalThis.webR, "mtcars");
console.table(mtcars);
HelpR.simpleDataFrameTable("#tbl", mtcars);
