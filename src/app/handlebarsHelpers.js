import { Handlebars } from 'handlebars-template-loader';

import { TaskStatus } from './utils/TaskStatus';

Handlebars.registerHelper('day', (dateStr) => new Date(dateStr).getDate());

Handlebars.registerHelper('month', (dateStr) => {
  return new Date(dateStr).toLocaleString('en-US', { month: 'long' });
});

Handlebars.registerHelper('ifOutdated', function (task, options) {
  if (task.status === TaskStatus.COMPLETED) {
    return false;
  }
  const date = Number(new Date(task.deadlineDate));
  const today = Number(new Date());
  if (date < today) {
    return options.fn(this);
  }
});

Handlebars.registerHelper('formatDate', (dateStr) => {
  return $.datepicker.formatDate('MM d, yy', new Date(dateStr));
});
