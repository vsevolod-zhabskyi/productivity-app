/**
 * Allows posting events with passed value and subscribing
 * to these events with callback that takes that value as an argument
 */
class EventBus {
  constructor() {
    this.eventCallbacksPairs = [];
  }

  /**
   * Subscribes to event with eventName name.
   * Passed callback will be called when the event posts
   * @param {string} eventName
   * @param {Function} callback
   */
  subscribe(eventName, callback) {
    const eventCallbacksPair = this.findEventCallbacksPair(eventName);

    if (eventCallbacksPair) {
      eventCallbacksPair.callbacks.push(callback);
    } else {
      this.eventCallbacksPairs.push(
        new EventCallbacksPair(eventName, callback)
      );
    }
  }

  /**
   * Posts event with the eventName name and calls all callbacks from
   * corresponding eventCallback pair with the passed argument
   * @param {string} eventName
   * @param {*=} arg
   */
  post(eventName, arg) {
    const eventCallbacksPair = this.findEventCallbacksPair(eventName);

    if (!eventCallbacksPair) {
      console.error(`no subscribers for event ${eventName}`);
      return;
    }

    eventCallbacksPair.callbacks.forEach((callback) => callback(arg));
  }

  /**
   * Returns eventCallback pair with event which name equals to eventName
   * @param eventName
   * @returns {*}
   */
  findEventCallbacksPair(eventName) {
    return this.eventCallbacksPairs.find(
      (pair) => pair.eventName === eventName
    );
  }
}

/**
 * Pair of event - callbacks
 */
class EventCallbacksPair {
  constructor(eventName, callback) {
    this.eventName = eventName;
    this.callbacks = [callback];
  }
}

export const bus = new EventBus();
