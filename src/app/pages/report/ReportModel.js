import TaskService from '../../taskService';
import { bus } from '../../EventBus';
import { ReportSortInterval } from '../../utils/ReportSortInterval';
import { TaskStatus } from '../../utils/TaskStatus';
import { TaskPriority } from '../../utils/TaskPriority';
import { ReportSortType } from '../../utils/ReportSortType';
import { DAYS_IN_MONTH, DAYS_IN_WEEK } from '../../constants';

/**
 * @typedef {Object} DataByPriorityCount
 * @property {number} urgent - Amount of urgent priority items
 * @property {number} high - Amount of high priority items
 * @property {number} middle - Amount of middle priority items
 * @property {number} low - Amount of low priority items
 * @property {number} failed - Amount of failed items
 */

/**
 * Date to tasks object
 * @typedef {Object} DateToTasks
 * @property {string} date - Date
 * @property {Task[]} tasks - Tasks of date
 */

/**
 * Date to task counts pair
 * @typedef {Object} DateToItemsCounts
 * @property {string} date - Date
 * @property {DataByPriorityCount} data - Amount of items sorted by priority
 */

/**
 * Model part of the Report component that is responsible
 * for interacting with and storing of component's data and
 * for getting it from the server
 */
class ReportModel {
  constructor() {
    this.tasks = [];
  }

  /**
   * Gets tasks and saves them to this.tasks field
   */
  getTasks() {
    TaskService.getAll()
      .then((tasks) => {
        this.tasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED);
        this.tasks = this.tasks.map((t) => ({
          ...t,
          completeDate: this.getFormattedDateString(t.completeDate),
        }));
        bus.post('report-tasks-loaded');
      })
      .catch(() =>
        bus.post('notify-error', 'Please check your internet connection')
      );
  }

  /**
   * Returns array of objects like date to items count
   * for specified interval and sort type
   * @param {('day'|'week'|'month')} interval - Time interval
   * represented by value from enum
   * @param {number} type - Type of sort (tasks/pomodoros)
   * represented by value from enum
   * @returns {DateToItemsCounts[]} - DateToItemsCounts pairs
   */
  getData(interval, type) {
    const days = this.getDaysForInterval(interval);

    const dates = this.getArrayOfPrevDates(days);

    const dateToTasksPairs = this.getDateToTasksPairs(dates);

    switch (type) {
      case ReportSortType.POMODOROS:
        return this.sortByPomodoros(dateToTasksPairs);
      case ReportSortType.TASKS:
        return this.sortByTasks(dateToTasksPairs);
    }
  }

  /**
   * Returns array of objects like date to items counts
   * sorted by tasks
   * @param {DateToTasks[]} dateToTasksPairs
   * @returns {DateToItemsCounts[]}
   */
  sortByTasks(dateToTasksPairs) {
    const resultArray = [];

    dateToTasksPairs.forEach((pair) => {
      resultArray.push({
        date: pair.date,
        data: {
          urgent: this.getCompletedTasksCountByPriority(
            pair,
            TaskPriority.URGENT
          ),
          high: this.getCompletedTasksCountByPriority(pair, TaskPriority.HIGH),
          middle: this.getCompletedTasksCountByPriority(
            pair,
            TaskPriority.MIDDLE
          ),
          low: this.getCompletedTasksCountByPriority(pair, TaskPriority.LOW),
          failed: pair.tasks.filter((task) => this.isTaskFailed(task)).length,
        },
      });
    });

    return resultArray;
  }

  /**
   * Returns amount of tasks of specified priority in passed pair
   * @param {DateToTasks} pair
   * @param {number} priority
   * @returns {number}
   */
  getCompletedTasksCountByPriority(pair, priority) {
    return pair.tasks.filter(
      (task) => task.priority === priority && !this.isTaskFailed(task)
    ).length;
  }

  /**
   * Returns true if task is failed
   * @param {Task} task
   * @returns {boolean}
   */
  isTaskFailed(task) {
    return task.completedCount < task.failedPomodoros;
  }

  /**
   * Returns array of objects like date to items counts
   * sorted by pomodoros
   * @param {DateToTasks[]} dateToTasksPairs
   * @returns {DateToItemsCounts[]}
   */
  sortByPomodoros(dateToTasksPairs) {
    const resultArray = [];

    dateToTasksPairs.forEach((pair) => {
      resultArray.push({
        date: pair.date,
        data: {
          urgent: this.getCompletedPomodorosByPriority(
            pair,
            TaskPriority.URGENT
          ),
          high: this.getCompletedPomodorosByPriority(pair, TaskPriority.HIGH),
          middle: this.getCompletedPomodorosByPriority(
            pair,
            TaskPriority.MIDDLE
          ),
          low: this.getCompletedPomodorosByPriority(pair, TaskPriority.LOW),
          failed: pair.tasks
            .filter((task) => this.isTaskFailed(task))
            .reduce((acc, curTask) => acc + curTask.completedCount, 0),
        },
      });
    });

    return resultArray;
  }

  /**
   * Returns amount of pomodoros of specified priority in passed pair
   * @param {DateToTasks} pair
   * @param {number} priority
   * @returns {number}
   */
  getCompletedPomodorosByPriority(pair, priority) {
    return pair.tasks
      .filter((task) => task.priority === priority)
      .reduce((acc, curTask) => acc + curTask.completedCount, 0);
  }

  /**
   * Returns DateToTasks array for passed dates
   * @param {string[]} dates
   * @returns {DateToTasks[]}
   */
  getDateToTasksPairs(dates) {
    const resultArray = [];

    dates.forEach((date) => {
      resultArray.push({
        date,
        tasks: this.tasks.filter((t) => t.completeDate === date),
      });
    });

    return resultArray;
  }

  /**
   * Returns array of dates in JSON format
   * from today to passed amount of days back
   * @param {number} days
   * @returns {string[]}
   */
  getArrayOfPrevDates(days) {
    const datesArray = [];

    const today = new Date();
    const todayDay = today.getDate();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(todayDay - i);

      const dateStr = this.getFormattedDateString(date.toJSON());

      datesArray.push(dateStr);
    }

    return datesArray;
  }

  /**
   * Returns date part of date without time
   * @param {string} str
   * @returns {string}
   */
  getFormattedDateString(str) {
    return str.split('T')[0];
  }

  /**
   * Returns amount of days for specified time interval
   * @param {('day'|'week'|'month')} interval
   * @returns {number}
   */
  getDaysForInterval(interval) {
    switch (interval) {
      case ReportSortInterval.DAY:
        return 1;
      case ReportSortInterval.WEEK:
        return DAYS_IN_WEEK;
      case ReportSortInterval.MONTH:
        return DAYS_IN_MONTH;
    }
  }
}

export default ReportModel;
