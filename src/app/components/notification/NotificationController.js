import { bus } from '../../EventBus';

/**
 * Controller part of Notification component that is responsible
 * for handling event bus' events
 */
class NotificationController {
  constructor(view) {
    this.view = view;

    this.addListeners();
  }

  /**
   * Subscribes to event bus' events
   */
  addListeners() {
    bus.subscribe('notify-error', (message) => {
      this.view.render(message, 'error');
    });
    bus.subscribe('notify-info', (message) => {
      this.view.render(message, 'info');
    });
    bus.subscribe('notify-success', (message) => {
      this.view.render(message, 'success');
    });
    bus.subscribe('notify-warning', (message) => {
      this.view.render(message, 'warning');
    });
  }
}

export default NotificationController;
