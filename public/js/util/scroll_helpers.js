var scrollTop = 0;
var easeOut = (t) => {
  return yPos + (dest - yPos) * Math.exp(timeConstant * t);
}
var scrollRafID = null;
var yPos = 0;
var ticksToComplete = Math.round(200/16);
var ticks = ticksToComplete;
var timeConstant = -3 / ticksToComplete;
var dest = 0;

var move = () => {
  scrollTop = easeOut(ticks);
  ticks--;
  body.scrollTop = scrollTop;
  if(ticks > -1) {
    scrollRafID = requestAnimationFrame(move);
  } else {
    ticks = ticksToComplete;
    window.cancelAnimationFrame(scrollRafID);
  }
}

module.exports = {
  scrollTo(distance) {
    scrollTop = body.scrollTop;
    yPos = scrollTop;
    dest = distance;
    scrollRafID = requestAnimationFrame(move);
  }
}