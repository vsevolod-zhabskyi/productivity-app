import HeaderView from './HeaderView';
import HeaderController from './HeaderController';
import HeaderModel from './HeaderModel';

const model = new HeaderModel();
const view = new HeaderView();
new HeaderController(model, view);

/**
 * Renders Header component
 */
export function renderHeader() {
  view.render();
}
