import './CounterField.less';
import counterTemplate from './CounterField.handlebars';

class CounterField {
  constructor(options) {
    this.template = counterTemplate;
    this.html = this.template(options);
    document
      .querySelector('.pomodoros__form')
      .insertAdjacentHTML('beforeend', this.html);

    this.id = options.id;
    this.value = options.value;
    this.maxValue = options.maxValue;
    this.minValue = options.minValue;

    this.element = document.getElementById(this.id);
    this.display = this.element.querySelector('.input-item__value');
    this.buttonAdd = this.element.querySelector('.btn-add');
    this.buttonMinus = this.element.querySelector('.btn-minus');

    this.onInit();
  }

  /**
   * Runs when the instance of the class is initiated
   */
  onInit() {
    this.updateClickability();
  }

  /**
   * Returns counter field buttons
   * @returns {{buttonMinus: HTMLElement, buttonAdd: HTMLElement}}
   */
  getButtons() {
    return {
      buttonAdd: this.buttonAdd,
      buttonMinus: this.buttonMinus,
    };
  }

  /**
   * Renders counter field
   */
  render() {
    document
      .querySelector('.pomodoros__form')
      .insertAdjacentHTML('beforeend', this.html);
  }

  /**
   * Updates the ability of the counter field buttons to be clicked
   */
  updateClickability() {
    this.buttonAdd.disabled = false;
    this.buttonMinus.disabled = false;

    if (this.value === this.maxValue) {
      this.buttonAdd.disabled = true;
    } else if (this.value === this.minValue) {
      this.buttonMinus.disabled = true;
    }
  }
}

export default CounterField;
