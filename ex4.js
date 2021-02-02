#!/usr/bin/env node

"use strict";

const util = require("util");
const path = require("path");
const fs = require("fs");

const sqlite3 = require("sqlite3");
// require("console.table");


// ************************************

const DB_PATH = path.join(__dirname,"my.db");
const DB_SQL_PATH = path.join(__dirname,"mydb.sql");

let args = require("minimist")(process.argv.slice(2),{
	string: ["other",],
});

main().catch(console.error);


// ************************************

let SQL3;

async function main() {
	if (!args.other) {
		error("Missing '--other=..'");
		return;
	}

	// define some SQLite3 database helpers
	const myDB = new sqlite3.Database(DB_PATH);
	SQL3 = {
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

	let initSQL = fs.readFileSync(DB_SQL_PATH,"utf-8");
	await SQL3.exec(initSQL);


	let other = args.other;
	let something = Math.trunc(Math.random() * 1E9);

	// *********

	const otherID = await insertOrLookupOther(other);
	if (otherID) {
		let result = await insertSomething(otherID, something);
		if (result) {
			return;
		}

		return;
	}

	error("Oops!");
}

async function insertOrLookupOther(other) {
	let result = await SQL3.get(
		`
			SELECT
				id
			FROM 
			     Other 
			WHERE
				data = ?
		`,
		other
	);

	if (result && result.id) {
		return result.id
	} else {
		result = await SQL3.run(
			`
				INSERT INTO
					Other (data)
				VALUES
					(?)
			`
		);
		if (result && result.lastID) {
			return result.lastID;
		}
	}
}

async function insertSomething(otherID, something) {

}

function error(err) {
	if (err) {
		console.error(err.toString());
		console.log("");
	}
}
