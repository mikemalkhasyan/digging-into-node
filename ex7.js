#!/usr/bin/env node

"use strict";

const util = require("util");
const childProc = require("child_process");


// ************************************

const HTTP_PORT = 8039;
// const MAX_CHILDREN = 5;

const delay = util.promisify(setTimeout);


main().catch(console.error);


// ************************************

async function main() {
	// console.log(`Load testing http://localhost:${HTTP_PORT}...`);

    const child = childProc.spawn("node", [ "ex7-child.js" ]);
    child.on('exit', function (code) {
        console.log("Code Finished", code);

    });
}
