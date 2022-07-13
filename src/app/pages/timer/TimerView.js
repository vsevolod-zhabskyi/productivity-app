import timerTemplate from './components/timer.handlebars';
import failedPomodoroTemplate from './components/itemFailed.handlebars';
import completedPomodoroTemplate from './components/itemCompleted.handlebars';
import emptyPomodoroTemplate from './components/itemEmpty.handlebars';
import { TaskStatus } from '../../utils/TaskStatus';
import { TaskCategory } from '../../utils/TaskCategory';

/**
 * View part of the Timer component that is responsible
 * for rendering the component
 */
class TimerView {
  constructor() {
    this.template = timerTemplate;

    this.failedPomodoroTemplate = failedPomodoroTemplate;
    this.completedPomodoroTemplate = completedPomodoroTemplate;
    this.emptyPomodoroTemplate = emptyPomodoroTemplate;

    this.pomodorosContainer = null;
  }

  /**
   * Renders Timer with passed options
   * @param {Object} options
   */
  render(options) {
    const html = this.template({
      ...options,
      isNotStarted:
        !options.state.isRunning &&
        options.task.status !== TaskStatus.COMPLETED,
      isNotRunning: !options.state.isRunning,
      showIncreaseEstimationBtn:
        options.state.isBreak && options.task.estimation < 10,
      hideStartPomodoroBtn:
        options.task.completedCount + options.task.failedPomodoros.length >=
        options.task.estimation,
    });
    document.getElementById('content').innerHTML = html;

    this.pomodorosContainer = document.querySelector(
      '.timer__pomodoros-container'
    );

    this.renderPomodorosCounter(options.task);

    this.applyCategoryStyle(options.task);
  }

  /**
   * Applies styles that are dependent on task's category to the timer
   * @param task
   */
  applyCategoryStyle(task) {
    const circleBody = document.querySelector('.circle__body');
    switch (task.category) {
      case TaskCategory.WORK:
        circleBody.classList.add('circle__category_work');
        break;
      case TaskCategory.EDUCATION:
        circleBody.classList.add('circle__category_education');
        break;
      case TaskCategory.HOBBY:
        circleBody.classList.add('circle__category_hobby');
        break;
      case TaskCategory.SPORT:
        circleBody.classList.add('circle__category_sport');
        break;
      case TaskCategory.OTHER:
        circleBody.classList.add('circle__category_other');
        break;
    }
  }

  /**
   * Sets up timer jQuery plugin
   * @param {Object} options
   */
  setTimer(options) {
    $('.circle').radialTimer(options);
  }

  /**
   * Renders pomodoros counter with info about
   * completed/failed/remaining pomodoros
   * @param {Task} task
   */
  renderPomodorosCounter(task) {
    this.pomodorosContainer
      .querySelectorAll('.timer__pomodoros-item')
      .forEach((el) => {
        el.remove();
      });

    let renderedCompletedCount = 0;

    for (let i = 0; i < task.estimation; i++) {
      if (task.failedPomodoros.includes(i)) {
        this.renderFailedPomodoro();
        continue;
      }
      if (renderedCompletedCount < task.completedCount) {
        this.renderCompletedPomodoro();
        renderedCompletedCount++;
        continue;
      }
      this.renderEmptyPomodoro();
    }
  }

  /**
   * Shows 'Start' button
   */
  showStartBtn() {
    document.getElementById('start-pomodoro-btn')?.classList.remove('hidden');
  }

  /**
   * Renders empty pomodoro in pomodoros counter
   */
  renderEmptyPomodoro() {
    this.pomodorosContainer.insertAdjacentHTML(
      'beforeend',
      this.emptyPomodoroTemplate()
    );
  }

  /**
   * Renders completed pomodoro in pomodoros counter
   */
  renderCompletedPomodoro() {
    this.pomodorosContainer.insertAdjacentHTML(
      'beforeend',
      this.completedPomodoroTemplate()
    );
  }

  /**
   * Renders failed pomodoro in pomodoros counter
   */
  renderFailedPomodoro() {
    this.pomodorosContainer.insertAdjacentHTML(
      'beforeend',
      this.failedPomodoroTemplate()
    );
  }

  /**
   * Returns Timer' DOM elements
   * @returns {{
   * increaseEstimationBtn: HTMLElement,
   * finishPomodoroBtn: HTMLElement,
   * finishTaskBtn: HTMLElement,
   * goToTasks: HTMLElement,
   * goToReports: HTMLElement,
   * startTimerBtn: HTMLElement,
   * failPomodoroBtn: HTMLElement,
   * startPomodoroBtn: HTMLElement
   * }}
   */
  getDOM() {
    return {
      goToTasks: document.getElementById('go-to-tasks'),
      goToReports: document.getElementById('go-to-reports'),

      increaseEstimationBtn: document.getElementById('increase-estimation-btn'),
      startTimerBtn: document.getElementById('start-timer-btn'),
      failPomodoroBtn: document.getElementById('fail-pomodoro-btn'),
      finishPomodoroBtn: document.getElementById('finish-pomodoro-btn'),
      startPomodoroBtn: document.getElementById('start-pomodoro-btn'),
      finishTaskBtn: document.getElementById('finish-task-btn'),
    };
  }
}

export default TimerView;
