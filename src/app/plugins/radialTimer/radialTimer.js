let timer;
let interval;

$.fn.radialTimer = ({
  content = '',
  time = 0,
  onTimeout = null,
  showFull = false,
}) => {
  const msInMin = 60000;
  const secInMin = 60;

  let timeLeft = time;

  const valueEl = $('.circle__time_value');
  const messageEl = $('.circle__message');
  const topTextEl = $('.circle__time_top');
  const bottomTextEl = $('.circle__time_bottom');
  const circleEl = $('circle');

  clearTimeout(timer);
  clearInterval(interval);

  if (time) {
    valueEl.html(timeLeft);
    topTextEl.html(content);
    bottomTextEl.html('min');

    setTimeout(() => {
      circleEl
        .css('transition-duration', `${time * secInMin}s`)
        .css('stroke-dashoffset', '0');
    }, 0);

    timer = setTimeout(() => {
      onTimeout();
      clearInterval(interval);
    }, time * msInMin);

    interval = setInterval(() => {
      valueEl.html(--timeLeft);
    }, msInMin);
  } else {
    messageEl.html(content);

    if (showFull) {
      circleEl.css('transition-duration', '0s').css('stroke-dashoffset', '0');
    }
  }

  return this;
};
