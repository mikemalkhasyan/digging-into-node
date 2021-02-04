"use strict";

// var fetch = require("node-fetch");


// ************************************

const HTTP_PORT = 8039;


main().catch(() => 1);


// ************************************

async function main() {
    let x = 0;
    for (let i = 0; i<100000000; i++) {
        x = i + 1;
    }
}
