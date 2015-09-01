module.exports = {
  extend(props) {
    var prop, obj;
    obj = Object.create(this);
    for(prop in props) {
      if(props.hasOwnProperty(prop)) {
        obj[prop] = props[prop];
      }
    }

    return obj;
  },
  pluralize(count, singular, plural) {
    plural = plural || singular + 's';
    if(count === 1) {
      return count + ' ' + singular;
    }
    return count + ' ' + plural;
  },
  async(tasks, callback) {
    var count = 0, n = tasks.length;

    function complete() {
      count += 1;
      if (count === n) {
        callback();
      }
    }

    tasks.forEach(x => x(complete));
  },
  getDocumentHeight() {
    return Math.max(
      document.documentElement.clientHeight,
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
  },
  getSign(x) {
    if(x > 0) {
      return 1;
    } else if(x < 0) {
      return -1;
    }
    return 0;
  },
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
          lastDirection = this.getSign(diff);
        } else {
          if(this.getSign(diff) !== lastDirection && this.getSign(diff) !== 0) {
            inflectionPoints.push(point);
          }

          lastDirection = this.getSign(diff);
        }
      }
    });

    percentChange = (maxY - minY) / (maxX - minX);

    return {
      percentChange: percentChange,
      inflectionPoints: inflectionPoints
    };
  }
};
