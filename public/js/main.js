var util = require('./util');
var api = require('./api');

document.querySelector("#vote-button").addEventListener("click", () => {
  api.post('http://oughtness-49671.onmodulus.net/vote', {question_id: 0, data: 20}, (data) => {
    console.log("SUCCESS");
    console.log(data);
  });
});