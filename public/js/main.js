var util = require('./util');
var api = require('./api');

if(window.location.hostname === "localhost") {
  api.setURL("http://localhost:5500");
} else {
  api.setURL("http://storiesof-49778.onmodulus.net");
}

document.querySelector("#vote-button").addEventListener("click", () => {
  api.post('/vote', {
    scenario_id: '55be756d248cacaee30bf3e5', 
    data: 20
  }, (data) => {

  });
});

document.querySelector("#create-button").addEventListener("click", () => {
  api.post('/create', {
    identifier: "lifeboat",
    text: "sacrifice lifeboaters for greater good?"
  }, (data) => {

  });
});