import { bus } from '../../EventBus';
import { router } from '../../router';

import { CycleGraph } from './components/CycleGraph';
import { renderPomodorosTab } from './components/PomodorosTab';
import { renderCategoriesTab } from './components/CategoriesTab';
import settingsTemplate from './settings.handlebars';
import mockPomodorosTab from './components/mockPomodorosTemplate.handlebars';
import CounterField from './components/CounterField/CounterField';

/**
 * View part of the Settings component that is responsible
 * for rendering of the component and its tabs and
 * for attaching event listeners to the DOM elements
 */
class SettingsView {
  constructor(model) {
    this.template = settingsTemplate;
    this.mockPomodorosTab = mockPomodorosTab;

    this.tab = null;

    this.model = model;

    this.workTimeField = {};
    this.workIterationField = {};
    this.shortBreakField = {};
    this.longBreakField = {};

    this.btnSave = {};
  }

  /**
   * Opens corresponding tab or redirects to the default path
   * if no tab stored in this.tab field
   */
  checkTabs() {
    switch (this.tab) {
      case 'pomodoros':
        this.openPomodorosTab();
        break;
      case 'categories':
        this.openCategoriesTab();
        break;
      case null:
        router.redirect('settings/pomodoros');
        break;
    }
  }

  /**
   * Renders component and saves passed tab in this.tab field
   * @param {('pomodoros'|'categories')=} tab
   */
  render(tab) {
    this.tab = tab || null;

    document.getElementById('content').innerHTML = this.template();

    this.checkTabs();
  }

  /**
   * Renders categories tab and updates router listeners
   */
  openCategoriesTab() {
    renderCategoriesTab();
    router.updateListeners();
  }

  /**
   * Renders initial view of the pomodoros tab,
   * gets the settings from the Model and then
   * renders pomodoros tab
   */
  openPomodorosTab() {
    document.getElementById('tab-content').innerHTML = this.mockPomodorosTab();

    return this.model.getSettings().then(() => {
      this.renderPomodorosTab();
    });
  }

  /**
   * Renders pomodoros tab and updates router listeners
   */
  renderPomodorosTab() {
    const { state } = this.model;

    renderPomodorosTab();

    this.renderCounterFields(state);

    this.addCounterFieldsListeners();

    new CycleGraph(state.value);

    this.btnSave = document.getElementById('btn-save');
    this.btnSave.addEventListener('click', () => bus.post('settings-save'));

    router.updateListeners();
  }

  /**
   * Renders counter fields
   * @param {Object} state
   */
  renderCounterFields(state) {
    this.workTimeField = new CounterField({
      id: 'input-work-time',
      heading: 'Work time',
      units: 'minutes',
      maxValue: state.config.workTime.maxValue,
      minValue: state.config.workTime.minValue,
      step: state.config.workTime.step,
      value: state.value.workTime,
    });

    this.workIterationField = new CounterField({
      id: 'input-work-iteration',
      heading: 'Work iteration',
      units: 'iterations',
      maxValue: state.config.workIteration.maxValue,
      minValue: state.config.workIteration.minValue,
      step: state.config.workIteration.step,
      value: state.value.workIteration,
    });

    this.shortBreakField = new CounterField({
      id: 'input-short-break',
      heading: 'Short break',
      units: 'minutes',
      maxValue: state.config.shortBreak.maxValue,
      minValue: state.config.shortBreak.minValue,
      step: state.config.shortBreak.step,
      value: state.value.shortBreak,
    });

    this.longBreakField = new CounterField({
      id: 'input-long-break',
      heading: 'Long break',
      units: 'minutes',
      maxValue: state.config.longBreak.maxValue,
      minValue: state.config.longBreak.minValue,
      step: state.config.longBreak.step,
      value: state.value.longBreak,
    });
  }

  /**
   * Attaches event listeners to the counter fields buttons
   */
  addCounterFieldsListeners() {
    const workTimeButtons = this.workTimeField.getButtons();
    workTimeButtons.buttonAdd.addEventListener('click', () => {
      bus.post('work-time-increase');
    });
    workTimeButtons.buttonMinus.addEventListener('click', () => {
      bus.post('work-time-decrease');
    });

    const workIterationButtons = this.workIterationField.getButtons();
    workIterationButtons.buttonAdd.addEventListener('click', () => {
      bus.post('work-iteration-increase');
    });
    workIterationButtons.buttonMinus.addEventListener('click', () => {
      bus.post('work-iteration-decrease');
    });

    const shortBreakButtons = this.shortBreakField.getButtons();
    shortBreakButtons.buttonAdd.addEventListener('click', () => {
      bus.post('short-break-increase');
    });
    shortBreakButtons.buttonMinus.addEventListener('click', () => {
      bus.post('short-break-decrease');
    });

    const longBreakButtons = this.longBreakField.getButtons();
    longBreakButtons.buttonAdd.addEventListener('click', () => {
      bus.post('long-break-increase');
    });
    longBreakButtons.buttonMinus.addEventListener('click', () => {
      bus.post('long-break-decrease');
    });
  }
}

export default SettingsView;
