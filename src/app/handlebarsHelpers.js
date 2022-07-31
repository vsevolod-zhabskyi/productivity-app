import * as Handlebars from 'handlebars';

import { TaskStatus } from './utils/TaskStatus';

Handlebars.registerHelper('day', (dateStr) => new Date(dateStr).getDate());

Handlebars.registerHelper('month', (dateStr) => {
  return new Date(dateStr).toLocaleString('en-US', { month: 'long' });
});

Handlebars.registerHelper('ifOutdated', function (task, options) {
  if (task.status === TaskStatus.COMPLETED) {
    return false;
  }

  const deadlineDate = new Date(task.deadlineDate);
  const deadlineTimestamp = Number(deadlineDate);

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const todayTimestamp = Number(todayDate);

  if (deadlineTimestamp < todayTimestamp) {
    return options.fn(this);
  }
});

Handlebars.registerHelper('formatDate', (dateStr) => {
  return $.datepicker.formatDate('MM d, yy', new Date(dateStr));
});
