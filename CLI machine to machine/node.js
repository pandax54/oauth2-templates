// =========================Getting an access token for your API====================================================
const request = require("request");

const options = { method: 'POST',
  url: 'https://dev-pip2r20aaaid2plx.us.auth0.com/oauth/token',
  headers: { 'content-type': 'application/json' },
  body: '{"client_id":"ahafG6lG5xjne7OEJnReR26RPmLqhjhk","client_secret":"X9WJAtSOMAlKK5K8eC65rrvP1hjH0-Nc44ZHVfLJoWcuqTUPZaZFaOORwE7TtyqH","audience":"https://my-api-endpoint/","grant_type":"client_credentials"}' };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});


// =========================Sending the token API====================================================

const axios = require("axios");

const opt = { 
  method: "GET",
  url: "http://path_to_your_api/",
  headers: { "authorization": "Bearer TOKEN" },
};

axios(opt)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.log(error);
  });