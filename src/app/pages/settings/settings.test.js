import SettingsModel from "./SettingsModel";
import SettingsView from "./SettingsView";
import SettingsController from "./SettingsController";

import {bus} from "../../EventBus";
import { router } from '../../router';
import SettingsService from "../../settingsService";
import CounterField from "./components/CounterField/CounterField";

import {mockSettingsState} from "../../../../__mocks__/settingsMocks";

jest.mock('../../settingsService', () => ({
  getSettings: jest.fn().mockResolvedValue(mockSettingsState),
  writeSettings: jest.fn().mockResolvedValue([]),
}));
jest.mock('../../EventBus');
jest.mock('../../router');
jest.mock('./components/CategoriesTab');
jest.mock('./components/PomodorosTab');
jest.mock('./components/CycleGraph', () => jest.fn());
jest.mock("./components/CounterField/CounterField", () => jest.fn());

describe('settingsModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const model = new SettingsModel();
  model.state = mockSettingsState;

  test('getSettings', () => {
    model.getSettings();
    expect(SettingsService.getSettings).toHaveBeenCalled();
  });

  test('saveSettings', () => {
    model.saveSettings();
    expect(SettingsService.writeSettings).toHaveBeenCalled();
  });

  test('increaseValue success', () => {
    model.increaseValue('shortBreak');
    expect(bus.post.mock.calls[0][0]).toBe('settings-changed')
  });

  test('increaseValue fails', () => {
    model.state.value.workTime = model.state.config.workTime.maxValue;
    model.increaseValue('workTime');
    expect(model.state.value.workTime).toBe(model.state.config.workTime.maxValue);
  });

  test('decreaseValue success', () => {
    model.decreaseValue('workIteration');
    expect(bus.post.mock.calls[0][0]).toBe('settings-changed');
  });

  test('decreaseValue fails', () => {
    model.state.value.longBreak = model.state.config.longBreak.minValue;
    model.decreaseValue('longBreak');
    expect(model.state.value.longBreak).toBe(model.state.config.longBreak.minValue);
  });
});

describe('settingsView', () => {
  const model = new SettingsModel();
  const view = new SettingsView(model);

  test('constructor', () => {
    expect(view.model).toBeTruthy();
  });

  test('checkTabs opens categories tab', () => {
    view.tab = 'categories';
    const spy = jest.spyOn(view, 'openCategoriesTab');
    view.checkTabs();
    expect(spy).toHaveBeenCalled();
  });

  test('addCounterFieldsListeners', () => {
    view.workTimeField.getButtons =
    view.workIterationField.getButtons =
    view.shortBreakField.getButtons =
    view.longBreakField.getButtons =
      jest.fn().mockReturnValue({
      buttonAdd: {
        addEventListener: jest.fn()
      },
      buttonMinus: {
        addEventListener: jest.fn()
      }
    });

    view.addCounterFieldsListeners();
    expect(view.longBreakField.getButtons).toHaveBeenCalled();
  });

  test('renderCounterFields', () => {
    view.renderCounterFields(mockSettingsState);
    expect(CounterField.mock.calls.length).toBe(4);
  });

  test('checkTabs opens pomodoros tab', () => {
    view.tab = 'pomodoros';
    view.renderPomodorosTab = jest.fn();
    jest.spyOn(view.model, 'getSettings');
    view.checkTabs();
    expect(view.model.getSettings).toHaveBeenCalled();
  });

  test('checkTabs redirects if not tab specified', () => {
    view.tab = null;
    view.checkTabs();
    expect(router.redirect).toHaveBeenCalled();
  })

  test('render', () => {
    view.checkTabs = jest.fn();
    view.render();
    expect(view.checkTabs).toHaveBeenCalled()
  })

});

describe('settingsController', () => {
  const model = new SettingsModel();
  const view = new SettingsView(model);
  const controller = new SettingsController(model, view);

  controller.model = {
    saveSettings: jest.fn().mockResolvedValue([])
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('addListeners', () => {
    controller.addListeners();
    expect(bus.subscribe.mock.calls.length).toBe(11);
  });

  test('handleSave', () => {
    controller.handleSave();
    expect(controller.model.saveSettings).toHaveBeenCalled();
  });
});
