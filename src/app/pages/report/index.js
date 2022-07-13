import './report.less';

import ReportModel from './ReportModel';
import ReportView from './ReportView';
import ReportController from './ReportController';

const model = new ReportModel();
const view = new ReportView(model);
new ReportController(model, view);

/**
 * Renders Report component
 * @param {string=} tab
 */
function renderReport(tab) {
  view.initialRender(tab);
  model.getTasks();
}

export { renderReport };
