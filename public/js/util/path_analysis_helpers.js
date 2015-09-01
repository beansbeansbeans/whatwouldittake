var util = require('../util');

module.exports = {
  analyze(arr) {
    var percentChange, 
      inflectionPoints = [],
      lastDirection,
      minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;

    arr.forEach((point, i) => {
      if(point[0] < minX) { minX = point[0]; }
      if(point[0] > maxX) { maxX = point[0]; }
      if(point[1] < minY) { minY = point[1]; }
      if(point[1] > maxY) { maxY = point[1]; }

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

    percentChange = (maxY - minY) / (maxX - minX);

    return {
      percentChange: percentChange,
      inflectionPoints: inflectionPoints
    };
  }
}