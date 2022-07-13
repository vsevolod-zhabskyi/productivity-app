import './settings.less';

import SettingsModel from './SettingsModel';
import SettingsView from './SettingsView';
import SettingsController from './SettingsController';

const model = new SettingsModel();
const view = new SettingsView(model);
new SettingsController(model, view);

/**
 * Renders Settings component
 * @param {string=} tab
 */
function renderSettings(tab) {
  view.render(tab);
}

export { renderSettings };
