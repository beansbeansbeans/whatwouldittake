var util = require('../util');

module.exports = {
  analyze(arr) {
    var percentChange, 
      min = [0, Infinity],
      max = [0, 0],
      inflectionPoints = [],
      inflectionPointIndices = [],
      lastDirection;

    arr.forEach((point, i) => {
      if(point[1] > max[1]) {
        max = point.concat(i);
      }

      if(point[1] < min[1]) {
        min = point.concat(i);
      }

      if(i > 0) {
        var diff = point[1] - arr[i - 1][1];
        if(i === 1) {
          lastDirection = util.getSign(diff);
        } else {
          if(util.getSign(diff) !== lastDirection && util.getSign(diff) !== 0) {
            inflectionPoints.push(point);
            inflectionPointIndices.push(i);
          }

          if(util.getSign(diff) !== 0) {
            lastDirection = util.getSign(diff);
          }
        }
      }
    });

    percentChange = arr[arr.length - 1][1] - arr[0][1];

    return {
      range: [min, max],
      percentChange: percentChange,
      inflectionPoints: inflectionPoints,
      inflectionPointIndices: inflectionPointIndices
    };
  }
}