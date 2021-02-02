#!/usr/bin/env node

"use strict";

const path = require("path");
const fs = require("fs");
const Transform = require('stream').Transform;

// var getStdin = require("get-stdin");

const args = require("minimist")(process.argv.slice(2),{
    boolean: ["help","in",],
    string: ["file",],
});

const BASEPATH =
    path.resolve(process.env.BASEPATH || __dirname);


if (args.help || process.argv.length <= 2) {
    error(null,/*showHelp=*/true);
}
else if (args._.includes("-") || args.in) {
    processFile(process.stdin);
}
else if (args.file) {
    let filePath = path.join(BASEPATH,args.file);
    let stream = fs.createReadStream(filePath);

    processFile(stream);
}
else {
    error("Usage incorrect.",true);
}




// ************************************

function processFile(inStream) {
    let outStream = inStream;

    const upperStream = new Transform({
        transform(chunk, enc, cb) {
            // chunk is a Buffer
            this.push(chunk.toString().toUpperCase());

            // add a 500 ms delay for each chunk
            // setTimeout(cb, 500);

            cb();
        }
    });

    outStream = outStream.pipe(upperStream);

    const targetStream = process.stdout;
    outStream.pipe(targetStream);
}

function printHelp() {
    console.log("ex1 usage:");
    console.log("");
    console.log("--help                      print this help");
    console.log("-, --in                     read file from stdin");
    console.log("--file={FILENAME}           read file from {FILENAME}");
    console.log("");
    console.log("");
}

function error(err,showHelp = false) {
    process.exitCode = 1;
    console.error(err);
    if (showHelp) {
        console.log("");
        printHelp();
    }
}
