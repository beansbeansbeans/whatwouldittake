var util = require('./util');
var api = require('./api');

api.setURL("http://oughtness-49671.onmodulus.net");

document.querySelector("#vote-button").addEventListener("click", () => {
  api.post('/vote', {question_id: 0, data: 20}, (data) => {
    console.log("SUCCESS");
    console.log(data);
  });
});