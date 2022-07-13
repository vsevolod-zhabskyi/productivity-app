import TaskListModel from './TaskListModel';
import TaskListView from './TaskListView';
import TaskListController from './TaskListController';

const model = new TaskListModel();
const view = new TaskListView();
new TaskListController(model, view);

/**
 * Renders TaskList component
 */
function renderTaskList() {
  view.render();
  model.getTasks();
}

export { renderTaskList };
