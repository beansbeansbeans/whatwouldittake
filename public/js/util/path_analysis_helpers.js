var util = require('../util');

module.exports = {
  analyze(arr) {
    var percentChange, 
      inflectionPoints = [],
      lastDirection;

    arr.forEach((point, i) => {
      if(i > 0) {
        var diff = point[1] - arr[i - 1][1];
        if(i === 1) {
          lastDirection = util.getSign(diff);
        } else {
          if(util.getSign(diff) !== lastDirection && util.getSign(diff) !== 0) {
            inflectionPoints.push(point);
          }

          lastDirection = util.getSign(diff);
        }
      }
    });

    percentChange = arr[arr.length - 1][1] - arr[0][1];

    return {
      percentChange: percentChange,
      inflectionPoints: inflectionPoints
    };
  }
}