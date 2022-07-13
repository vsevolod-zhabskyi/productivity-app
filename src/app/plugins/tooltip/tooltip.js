import { bus } from '../../EventBus';

function removeTooltips() {
  $('.ui-tooltip').remove();
}

$(document).tooltip({
  position: {
    using(position) {
      const tooltipCollection = $('.ui-tooltip');
      if (tooltipCollection.length > 1) {
        tooltipCollection[0].remove();
      }
      $(this).css(position);
    },
  },
  open(event, ui) {
    const tooltip = ui.tooltip[0];
    if (document.body.scrollHeight > document.body.clientHeight) {
      tooltip.style.left = `${parseInt(tooltip.style.left) - 6}px`;
    } else {
      tooltip.style.left = `${parseInt(tooltip.style.left) + 2}px`;
    }
  },
  show: {
    duration: 0,
  },
});

bus.subscribe('page-changed', () => {
  removeTooltips();
});

bus.subscribe('tasks-updated', () => {
  removeTooltips();
});

$(document).delegate('.task__buttons', 'click', () => {
  removeTooltips();
});
