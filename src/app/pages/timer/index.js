import './timer.less';

import TimerModel from './TimerModel';
import TimerView from './TimerView';
import TimerController from './TimerController';

const model = new TimerModel();
const view = new TimerView();
new TimerController(model, view);

/**
 * Renders Timer component
 */
function renderTimer() {
  model.getData();
}

export { renderTimer };
