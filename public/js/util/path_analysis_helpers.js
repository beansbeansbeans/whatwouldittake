var util = require('../util');

module.exports = {
  analyze(arr) {
    var percentChange, 
      min = [0, Infinity],
      max = [0, 0],
      direction = 1,
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
        var diff = point[1] - arr[i - 1][1],
          sign = util.getSign(diff);
        if(i === 1) {
          lastDirection = sign;
        } else {
          if(sign !== lastDirection && sign !== 0) {
            inflectionPoints.push(point);
            inflectionPointIndices.push(i);
            if(typeof direction === 'undefined') {
              direction = sign;
            }
          }

          if(sign !== 0) { lastDirection = sign; }
        }
      }
    });

    percentChange = arr[arr.length - 1][1] - arr[0][1];

    if(!inflectionPoints.length) {
      if(arr[0][1] > arr[arr.length - 1][1]) {
        direction = -1;
      }
    }

    return {
      range: {
        value: max[1] - min[1],
        points: [min, max]
      },
      percentChange: percentChange,
      inflectionPoints: {
        direction: direction,
        points: inflectionPoints
      },
      inflectionPointIndices: inflectionPointIndices
    };
  }
}