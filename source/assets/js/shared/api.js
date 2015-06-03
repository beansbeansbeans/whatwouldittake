module.exports = {
  post: function(url, data, callback) {
    console.log("API MODULE RECEIVED POST REQUEST");
    var request = new XMLHttpRequest();
    request.open('POST', url, true);

    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Accept", "application/json");

    request.onload = function() {
      console.log("REQUEST LOAD");
      var data = {};

      if(request.responseText) {
        try {
          data = JSON.parse(request.responseText);
        } catch(e) {
          data = {};
        }
      }
      data.responseCode = request.status;

      if(request.status >= 200 && request.status < 400){
        data.success = true;
      } else {
        data.success = false;
      }

      if(callback) {
        callback(data);
      }
    };

    request.send(JSON.stringify(data));
  }
}