import './PomodorosTab.less';
import pomodorosTabTemplate from './PomodorosTab.handlebars';

/**
 * Responsible for rendering the pomodoros tab
 */
class PomodorosTab {
  constructor() {
    this.template = pomodorosTabTemplate;
    this.render();
  }

  /**
   * Renders pomodoro tab
   */
  render() {
    document.getElementById('tab-content').innerHTML = this.template();
    Array.from(document.getElementsByClassName('tabs-item')).forEach((el) => {
      el.classList.remove('active');
    });
    document.getElementById('tab-pomodoros').classList.add('active');
  }
}

export default PomodorosTab;
