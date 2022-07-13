import { bus } from '../../EventBus';

/**
 * Controller part of Header that is subscribing View's
 * render method to the event bus
 **/
class HeaderController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    bus.subscribe('page-changed', () => this.view.render());
  }
}

export default HeaderController;
