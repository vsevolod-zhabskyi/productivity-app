import { TaskStatus } from '../../utils/TaskStatus';
import TaskService from '../../taskService';
import SettingsService from '../../settingsService';
import { bus } from '../../EventBus';
import { router } from '../../router';

/**
 * Model part of the Timer component that is responsible
 * for interacting with and storing of component's data and
 * for saving it to and getting from the server
 */
class TimerModel {
  constructor() {
    this.originalTask = null;
    this.task = null;
    this.settings = null;
    this.state = {
      isBreak: false,
      isWorking: false,
      isRunning: false,
      isLastSuccessful: false,
      isTaskCompleted: false,
    };
  }

  /**
   * Increases task's estimation by 1 pomodoro if current
   * estimation is less than 10. Else does nothing
   */
  increaseEstimation() {
    if (this.task.estimation >= 10) {
      return;
    }
    this.task.estimation++;

    bus.post('timer-increase-estimation', this.task);
  }

  /**
   * Starts timer
   */
  startTimer() {
    this.state.isRunning = true;
    this.state.isWorking = true;

    bus.post('timer-start-pomodoro', this.settings.workTime);
  }

  /**
   * Marks current pomodoro as failed and starts short break
   */
  failPomodoro() {
    this.state.isWorking = false;
    this.state.isBreak = true;

    const failedIndex =
      this.task.completedCount + this.task.failedPomodoros.length;
    this.task.failedPomodoros.push(failedIndex);

    this.state.isLastSuccessful = false;

    bus.post('timer-start-break', this.settings.shortBreak);
  }

  /**
   * Marks current pomodoro as completed and starts short break or long break
   */
  finishPomodoro() {
    this.task.completedCount++;
    this.state.isLastSuccessful = true;
    this.state.isWorking = false;
    this.state.isBreak = true;

    if (this.task.completedCount % this.settings.workIteration === 0) {
      bus.post('timer-start-break', this.settings.longBreak);
      bus.post('notify-warning', 'Long break started, please have a rest!');
    } else {
      bus.post('timer-start-break', this.settings.shortBreak);
      bus.post('notify-info', 'You finished pomodoro!');
    }
  }

  /**
   * Starts new pomodoro completion
   */
  startPomodoro() {
    this.state.isWorking = true;
    this.state.isBreak = false;

    bus.post('timer-start-pomodoro', this.settings.workTime);
  }

  /**
   * Resets components state
   */
  resetState() {
    this.state = {
      isBreak: false,
      isWorking: false,
      isRunning: false,
      isLastSuccessful: false,
      isTaskCompleted: false,
    };
  }

  /**
   * Stops the completion of task and saves it to the server
   */
  finishTask() {
    this.task.status = TaskStatus.COMPLETED;

    this.originalTask.status = TaskStatus.COMPLETED;
    this.originalTask.failedPomodoros = this.task.failedPomodoros.length;
    this.originalTask.estimation = this.task.estimation;
    this.originalTask.completedCount = this.task.completedCount;
    this.originalTask.completeDate = new Date().toJSON();

    TaskService.set(this.originalTask)
      .then(() => {
        this.resetState();
        this.state.isTaskCompleted = true;

        bus.post('notify-success', 'You completed task!');
        bus.post('timer-task-completed');

        this.resetState();
      })
      .catch(() =>
        bus.post(
          'notify-error',
          'Unable to mark task as completed. Try again later'
        )
      );
  }

  /**
   * Gets settings and active task data from the server
   */
  getData() {
    Promise.all([SettingsService.getSettingsValue(), TaskService.getActive()])
      .then(([settings, task]) => {
        if (!task) {
          history.back();
          return;
        }
        this.settings = settings;

        this.originalTask = task;
        this.task = { ...task };
        this.task.failedPomodoros = [];

        bus.post('timer-ready');
      })
      .catch(() =>
        bus.post('notify-error', 'Unable to load timer. Try again later')
      );
  }

  /**
   * Sets task's status back to 'daily'
   * @returns {Promise<void>}
   */
  setTaskToDaily() {
    this.originalTask.status = TaskStatus.DAILY_LIST;

    return TaskService.set(this.originalTask)
      .then(() => router.navigate('task-list'))
      .catch((e) => console.error(e));
  }
}

export default TimerModel;
