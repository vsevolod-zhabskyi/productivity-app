import './CycleGraph.less';

const BREAK_POINT_VALUE = 768;

/**
 * CycleGraph class that is responsible for rendering
 * the visual representation of user's workflow when
 * he is setting up his pomodoro timer
 */
class CycleGraph {
  constructor(state) {
    this.state = state;
    this.barElem = document.querySelector('.cycle__bar');
    this.breakPoint = BREAK_POINT_VALUE;
    this.intervalStep = window.innerWidth >= this.breakPoint ? 30 : 60;

    this.render();
    window.addEventListener('resize', () => this.handleResize());
  }

  /**
   * Renders full cycle graph
   */
  render() {
    this.renderOneCycle();
    this.barElem.append(
      this.createBarPiece(
        'long-break',
        this.computeLengthPercentage(this.state.longBreak)
      )
    );
    this.renderOneCycle();
    this.renderLabels();
  }

  /**
   * Renders all labels
   */
  renderLabels() {
    this.renderStartLabel();
    this.renderEndLabel();
    this.renderFullCycleLabel();
    this.renderTimeIntervalLabels();
  }

  /**
   * Renders start label
   */
  renderStartLabel() {
    const label = this.createLabel('0m');
    label.classList.add('label_top');
    label.classList.add('label_top-left');
    this.barElem.append(label);
  }

  /**
   * Renders end label with the info about two cycles duration
   */
  renderEndLabel() {
    const totalMinutes = this.getTotalMinutes();
    const label = this.createLabel(this.getTimeString(totalMinutes));
    label.classList.add('label_top');
    label.classList.add('label_top-right');
    this.barElem.append(label);
  }

  /**
   * Renders one cycle with long break label with the duration info
   */
  renderFullCycleLabel() {
    const minutes = this.getFirstCycleTotalMinutes();
    const label = this.createLabel(
      `First cycle: ${this.getTimeString(minutes)}`
    );

    label.classList.add('label_top');
    label.style.left = `calc(${this.computeLengthPercentage(
      minutes
    )}% - 0.1rem)`;

    this.barElem.append(label);
    this.centerLabelText(label);
  }

  /**
   * Renders 30m/1h marks depending on this.intervalStep
   */
  renderTimeIntervalLabels() {
    this.clearCollection(document.querySelectorAll('.label_interval'));

    const totalMinutes = this.getTotalMinutes();

    for (let i = this.intervalStep; i < totalMinutes; i += this.intervalStep) {
      const label = this.createLabel(this.getTimeString(i));
      label.classList.add('label_bottom');
      label.classList.add('label_interval');
      label.style.left = `${this.computeLengthPercentage(i)}%`;
      label.style.left = `calc(${this.computeLengthPercentage(i)}% - 0.1rem)`;
      this.barElem.append(label);
      this.centerLabelText(label);
    }
  }

  /**
   * Handles window resize
   */
  handleResize() {
    const step = window.innerWidth >= this.breakPoint ? 30 : 60;
    if (this.intervalStep !== step) {
      this.intervalStep = step;
      this.renderTimeIntervalLabels();
    }
  }

  /**
   * Centers text inside of passed label element
   * @param {HTMLElement} label
   */
  centerLabelText(label) {
    const textElem = label.querySelector('.label_text');
    const width = this.getWidth(textElem);
    textElem.style.left = `-${width / 2}px`;
  }

  /**
   * Returns label element with the passed text
   * @param {string} text
   * @returns {HTMLDivElement}
   */
  createLabel(text) {
    const label = document.createElement('div');
    label.classList.add('label');
    label.innerHTML = `<span class="label_text">${text}</span>`;

    return label;
  }

  /**
   * Formats passed minutes value to the format like '1h 20m'
   * @param {number} totalMinutes
   * @returns {string}
   */
  getTimeString(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m` : ''}`;
  }

  /**
   * Renders one cycle
   */
  renderOneCycle() {
    for (let i = 0; i < this.state.workIteration; i++) {
      const workTimePiece = this.createBarPiece(
        'work-time',
        this.computeLengthPercentage(this.state.workTime)
      );
      this.barElem.append(workTimePiece);

      if (i + 1 < this.state.workIteration) {
        const shortBreakPiece = this.createBarPiece(
          'short-break',
          this.computeLengthPercentage(this.state.shortBreak)
        );
        this.barElem.append(shortBreakPiece);
      }
    }
  }

  /**
   * Кeturns the percentage of the passed minutes of the total minutes
   * @param {number} value
   * @returns {number}
   */
  computeLengthPercentage(value) {
    const totalMinutes = this.getTotalMinutes();

    return (value / totalMinutes) * 100;
  }

  /**
   * Returns bar item
   * @param {string} name
   * @param {string} flexBasis
   * @returns {HTMLDivElement}
   */
  createBarPiece(name, flexBasis) {
    const piece = document.createElement('div');
    piece.classList.add('cycle__piece');
    piece.classList.add(name);
    piece.style.display = 'flex';
    piece.style.flexBasis = `${flexBasis}%`;

    return piece;
  }

  /**
   * Returns width of the passed HTMLElement
   * @param {HTMLElement} elem
   * @returns {number}
   */
  getWidth(elem) {
    return parseFloat(window.getComputedStyle(elem).width);
  }

  /**
   * Returns duration of one full cycle
   * @returns {number}
   */
  getFirstCycleTotalMinutes() {
    let totalMinutes = 0;
    for (let i = 0; i < this.state.workIteration; i++) {
      totalMinutes += this.state.workTime;
      if (i + 1 < this.state.workIteration) {
        totalMinutes += this.state.shortBreak;
      }
    }
    totalMinutes += this.state.longBreak;

    return totalMinutes;
  }

  /**
   * Returns total duration of two cycles plus long break
   * @returns {number}
   */
  getTotalMinutes() {
    let totalMinutes = 0;
    for (let i = 0; i < this.state.workIteration; i++) {
      totalMinutes += this.state.workTime * 2;
      if (i + 1 < this.state.workIteration) {
        totalMinutes += this.state.shortBreak * 2;
      }
    }
    totalMinutes += this.state.longBreak;

    return totalMinutes;
  }

  /**
   * Clears collection of passed HTMLElements
   * @param {HTMLElement[]} collection
   */
  clearCollection(collection) {
    if (collection) {
      collection.forEach((el) => el.remove());
    }
  }
}

export { CycleGraph };
