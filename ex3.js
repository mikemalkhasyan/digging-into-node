#!/usr/bin/env node

// node ex3.js --file=files/lorem.txt --out

"use strict";

const path = require("path");
const fs = require("fs");
const Transform = require('stream').Transform;
const zlib = require('zlib');
// Cancelable Async Flows (CAF)
const CAF = require('caf')

const args = require("minimist")(process.argv.slice(2),{
    boolean: ["help","in", "out", "compress", "uncompress"],
    string: ["file",],
});

processFile = CAF(processFile);

function streamComplete (stream) {
    return new Promise(function c(res) {
        stream.on("end", res);
    });
}

const BASE_PATH =
    path.resolve(process.env.BASEPATH || __dirname);

let OUTFILE = path.join(BASE_PATH, "out.txt");
let tooLong = CAF.timeout(5, "Took too long!");


if (args.help || process.argv.length <= 2) {
    error(null,true);
}
else if (args._.includes("-") || args.in) {
    processFile(tooLong, process.stdin)
        .catch(error);
}
else if (args.file) {
    let filePath = path.join(BASE_PATH,args.file);
    let stream = fs.createReadStream(filePath);

    processFile(tooLong, stream)
        .then(function () {
            console.log("Complete!");
        }).catch(error);
}
else {
    error("Usage incorrect.",true);
}




// ************************************

function *processFile(signal, inStream) {
    let outStream = inStream;

    if (args.uncompress) {
        let gunzipStream = zlib.createGunzip();

        outStream = outStream.pipe(gunzipStream);
    }

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

    outStream.pipe(targetStream);

    signal.pr.catch(function f() {
        outStream.unpipe(targetStream);
        outStream.destroy();
    });

    yield streamComplete(outStream);
}

function printHelp() {
    console.log("ex3 usage:");
    console.log("  ex3 usage:");
    console.log("  ex3.js --file={FILENAME}");
    console.log("--help             print this help");
    console.log("--file={FILENAME}  process the file");
    console.log("--in, -            process stdin");
    console.log("--out              print to stdout");
    console.log("--compress         gzip the output");
    console.log("--uncompress       ungzip the input");
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
