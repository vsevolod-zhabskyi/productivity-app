import { router } from '../../router';
import { bus } from '../../EventBus';

/**
 * Controller part of Settings component that is
 * responsible for cooperation between the Model
 * and the View by interacting with event bus
 */
class SettingsController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.onInit();
  }

  /**
   * Runs when instance of the class is initiated
   */
  onInit() {
    this.addListeners();
  }

  /**
   * Subscribes to event bus' events
   */
  addListeners() {
    bus.subscribe('settings-changed', () => this.view.renderPomodorosTab());
    bus.subscribe('settings-save', () => this.handleSave());
    bus.subscribe('settings-saved', () =>
      bus.post('notify-success', 'Settings were successfully saved!')
    );

    bus.subscribe('work-time-increase', () => {
      this.model.increaseValue('workTime');
    });
    bus.subscribe('work-time-decrease', () => {
      this.model.decreaseValue('workTime');
    });
    bus.subscribe('work-iteration-increase', () => {
      this.model.increaseValue('workIteration');
    });
    bus.subscribe('work-iteration-decrease', () => {
      this.model.decreaseValue('workIteration');
    });
    bus.subscribe('short-break-increase', () => {
      this.model.increaseValue('shortBreak');
    });
    bus.subscribe('short-break-decrease', () => {
      this.model.decreaseValue('shortBreak');
    });
    bus.subscribe('long-break-increase', () => {
      this.model.increaseValue('longBreak');
    });
    bus.subscribe('long-break-decrease', () => {
      this.model.decreaseValue('longBreak');
    });
  }

  /**
   * Navigates to task-list page after successful settings saving
   */
  handleSave() {
    this.model.saveSettings().then(() => router.navigate('tasks'));
  }
}

export default SettingsController;
