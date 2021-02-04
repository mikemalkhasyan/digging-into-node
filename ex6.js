#!/usr/bin/env node

"use strict";

const util = require("util");
const path = require("path");
const http = require("http");

const express = require("express");
const sqlite3 = require("sqlite3");

const app = express();

// ************************************

const DB_PATH = path.join(__dirname,"my.db");
const WEB_PATH = path.join(__dirname,"web");
const HTTP_PORT = 8039;

const delay = util.promisify(setTimeout);

// define some SQLite3 database helpers
//   (comment out if sqlite3 not working for you)
const myDB = new sqlite3.Database(DB_PATH);
let SQL3 = {
	run(...args) {
		return new Promise(function c(resolve,reject){
			myDB.run(...args,function onResult(err){
				if (err) reject(err);
				else resolve(this);
			});
		});
	},
	get: util.promisify(myDB.get.bind(myDB)),
	all: util.promisify(myDB.all.bind(myDB)),
	exec: util.promisify(myDB.exec.bind(myDB)),
};

const httpserv = http.createServer(app);


main();


// ************************************

function main() {
	defineRoutes();
	httpserv.listen(HTTP_PORT);
	console.log(`Listening on http://localhost:${HTTP_PORT}...`);
}

function defineRoutes() {
	app.get("/get-records", async function (req, res) {
		const records = await getAllRecords();
		res.writeHead(200, {
			"Content-Type": "application/json",
			"Cache-Control": "no-cache"
		});
		res.end(JSON.stringify(records));
	});

	app.use(express.static(WEB_PATH, {
		maxAge: 100,
		setHeaders: function setHeaders(res) {
			res.setHeader("Server", "Node Workshop: ex6");
		}
	}));


	// TODO: define routes
	//
	// Hints:
	//
	// {
	// 	match: /^\/(?:index\/?)?(?:[?#].*$)?$/,
	// 	serve: "index.html",
	// 	force: true,
	// },
	// {
	// 	match: /^\/js\/.+$/,
	// 	serve: "<% absPath %>",
	// 	force: true,
	// },
	// {
	// 	match: /^\/(?:[\w\d]+)(?:[\/?#].*$)?$/,
	// 	serve: function onMatch(params) {
	// 		return `${params.basename}.html`;
	// 	},
	// },
	// {
	// 	match: /[^]/,
	// 	serve: "404.html",
	// },

}

// *************************
// NOTE: if sqlite3 is not working for you,
//   comment this version out
// *************************
// async function getAllRecords() {
// 	let result = await SQL3.all(
// 		`
// 		SELECT
// 			Something.data AS "something",
// 			Other.data AS "other"
// 		FROM
// 			Something
// 			JOIN Other ON (Something.otherID = Other.id)
// 		ORDER BY
// 			Other.id DESC, Something.data
// 		`
// 	);
//
// 	return result;
// }

// *************************
// NOTE: uncomment and use this version if
//   sqlite3 is not working for you
// *************************
async function getAllRecords() {
// 	// fake DB results returned
	return [
		{ something: 53988400, other: "hello" },
		{ something: 342383991, other: "hello" },
		{ something: 7367746, other: "world" },
	];
}
