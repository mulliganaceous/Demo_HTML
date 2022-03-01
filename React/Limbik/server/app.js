// Hostname and port
const hostname = '127.0.0.1';
const port = 8000;

// npm install --save neo4j-driver
// node example.js
const neo4j = require('neo4j-driver');
const driver = neo4j.driver('bolt://54.167.63.201:7687',
                neo4j.auth.basic('neo4j', 'radians-crack-injection'), 
                {/* encrypted: 'ENCRYPTION_OFF' */});

// Imported apps
// npm install --save express cors
const http = require('http');
var express = require('express')
var cors = require('cors');
const { URLSearchParams } = require('url');
var app = express()
app.use(cors())

/**Create an Express server with request handlers
 */
app.get('/', function (req, res) {
    const { headers, method, url, query } = req;
    console.log(req);
    console.log();

    // Set the header via writeHead
    res.writeHead(256, {
        'Content-Type': 'application/json',
        'X-Powered-By': 'mulligan'
    });

    // Perform relevant neo4jQuery operation. This operation contains the res.end() call.
    if (query.mode == "moviedates") {
        startstr = "m.released >= $start"
        if (!query.startyear) {
            startstr = "TRUE"
        }
        endstr = "m.released < $end"
        if (!query.startyear) {
            startstr = "TRUE"
        }
        records = neo4jQuery(
            `
            MATCH (m:Movie) WHERE ` + startstr + ` AND ` + endstr + ` RETURN m AS rec
            `,
            {start: parseInt(query.startyear), end: parseInt(query.endyear)},
            headers, method, url, res, ["rec"]
        )
    }
    if (query.mode == "moviestaff") {
        console.log(query.title);
        records = neo4jQuery(
            `
            MATCH (m:Movie {title:$title})-[r]-(p:Person) RETURN p, r
            `,
            {title: query.title},
            headers, method, url, res, ["p", "r"]
        )
    }
    if (query.mode == "staffinvolvement") {
        console.log(query.title);
        records = neo4jQuery(
            `
            MATCH (m:Movie)-[r]-(p:Person {name:$name}) RETURN m, r
            `,
            {name: query.name},
            headers, method, url, res, ["m", "r"]
        )
    }
});

app.listen(8000, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});

/**
 * Function for performing a basic query with parameters.
 * On the server side, prints out the results and send it to the client.
 * @param {*} query 
 * @param {*} params 
 */
function neo4jQuery(query, params, headers, method, url, res, attrs) {
    const session = driver.session({database:"neo4j"});

    session.run(query, params)
    .then((result) => {
        let records = [];
        result.records.forEach((record) => {
            for (attr in attrs) {
                records.push(record.get(attrs[attr]));
                console.log(record);
            }
        });
        body = {records: records};
        console.log(body);
        const responseBody = { headers, method, url, body };
        res.write(JSON.stringify(responseBody));
        res.end();
        session.close();
    })
    .catch((error) => {
        console.error(error);
        session.close();
    });
}