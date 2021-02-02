#!/usr/bin/env node

// node ex2.js --file=files/lorem.txt --compress

"use strict";

const path = require("path");
const fs = require("fs");
const Transform = require('stream').Transform;
const zlib = require('zlib');

// var getStdin = require("get-stdin");

const args = require("minimist")(process.argv.slice(2),{
    boolean: ["help","in", "out", "compress"],
    string: ["file",],
});

const BASE_PATH =
    path.resolve(process.env.BASEPATH || __dirname);

let OUTFILE = path.join(BASE_PATH, "out.txt");

if (args.help || process.argv.length <= 2) {
    error(null,/*showHelp=*/true);
}
else if (args._.includes("-") || args.in) {
    processFile(process.stdin);
}
else if (args.file) {
    let filePath = path.join(BASE_PATH,args.file);
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

    if (args.compress) {
        let gzipStream = zlib.createGzip();
        outStream = outStream.pipe( gzipStream );
        OUTFILE = `${OUTFILE}.gz`;
    }

    let targetStream;

    if (args.out) {
        targetStream = process.stdout
    } else {
        targetStream = fs.createWriteStream(OUTFILE);
    }

    process.stdout;
    outStream.pipe(targetStream);
}

function printHelp() {
    console.log("ex1 usage:");
    console.log("");
    console.log("--help             print this help");
    console.log("--file={FILENAME}  process the file");
    console.log("--in, -            process stdin");
    console.log("--out              print to stdout");
    console.log("--compress         gzip the output");
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
