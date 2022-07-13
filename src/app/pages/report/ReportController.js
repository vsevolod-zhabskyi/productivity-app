import { bus } from '../../EventBus';

/**
 * Controller part of Report component
 */
class ReportController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.addListeners();
  }

  /**
   * Adds listeners to event bus
   */
  addListeners() {
    bus.subscribe('report-tasks-loaded', () => this.view.render());
  }
}

export default ReportController;
