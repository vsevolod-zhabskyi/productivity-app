import SettingsService from '../../settingsService';
import { bus } from '../../EventBus';

/**
 * Model part of the Settings component that is responsible
 * for interacting with and storing of component's data and
 * for saving it to and getting from the server
 */
class SettingsModel {
  constructor() {
    this.state = {
      value: {},
      config: {},
    };
  }

  /**
   * Gets settings from the SettingsService and saves
   * received config and settings value to this.state
   * @returns {Promise<void>}
   */
  getSettings() {
    return SettingsService.getSettings()
      .then((settings) => {
        this.state.value = settings.value;
        this.state.config = settings.config;
      })
      .catch(() =>
        bus.post('notify-error', 'Unable to load settings. Try again later')
      );
  }

  /**
   * Saves settings to the server
   * @returns {Promise<void>}
   */
  saveSettings() {
    return SettingsService.writeSettings(this.state.value)
      .then(() => bus.post('notify-success', 'Settings were saved!'))
      .catch(() =>
        bus.post('notify-error', 'Unable to save settings. Try again later')
      );
  }

  /**
   * Increases value of the passed settings parameter
   * by one step if current value is not a maximum available value
   * @param {string} settingName
   */
  increaseValue(settingName) {
    if (
      this.state.value[settingName] + this.state.config[settingName].step >
      this.state.config[settingName].maxValue
    ) {
      return;
    }
    this.state.value[settingName] += this.state.config[settingName].step;
    bus.post('settings-changed', this.state);
  }

  /**
   * Decreases value of the passed settings parameter
   * by one step if current value is not a minimum available value
   * @param settingName
   */
  decreaseValue(settingName) {
    if (
      this.state.value[settingName] - this.state.config[settingName].step <
      this.state.config[settingName].minValue
    ) {
      return;
    }
    this.state.value[settingName] -= this.state.config[settingName].step;
    bus.post('settings-changed', this.state);
  }
}

export default SettingsModel;
