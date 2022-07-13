import notificationTemplate from './notification.handlebars';

$.fn.notification = function ({ type = 'info', text = '', showTime = 4000 }) {
  const template = notificationTemplate;

  $(template({ type, text }))
    .appendTo('#root')
    .hide()
    .fadeIn(200)
    .delay(showTime)
    .fadeOut(500)
    .hide(1, function () {
      $(this).remove();
    });

  $('.icon-close').click(() => $('.notification').hide());

  return this;
};
