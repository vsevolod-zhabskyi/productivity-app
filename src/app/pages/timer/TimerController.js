import { bus } from '../../EventBus';
import { router } from '../../router';
import { TaskStatus } from '../../utils/TaskStatus';

/**
 * Controller part of Timer component that is responsible for
 * cooperation between Model and View and for interaction with event bus
 */
class TimerController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.onInit();
  }

  /**
   * Runs when еhe instance of the class is initiated,
   * subscribes to event bus' events
   */
  onInit() {
    bus.subscribe('timer-ready', () => {
      this.createTimer();
      this.view.setTimer({ content: "Let's do it!" });
    });

    bus.subscribe('timer-start-pomodoro', (time) => {
      this.createTimer();
      this.view.setTimer({
        time,
        onTimeout: () => setTimeout(() => this.model.finishPomodoro(), 0),
      });
    });

    bus.subscribe('timer-start-break', (time) => {
      this.createTimer();
      this.view.setTimer({
        content: 'break',
        time,
        onTimeout: () => bus.post('timer-finish-break'),
      });
    });

    bus.subscribe('timer-finish-break', () => {
      this.createTimer();
      this.view.setTimer({
        content: 'Break<br>is over!',
        showFull: true,
      });
    });

    bus.subscribe('timer-task-completed', () => {
      this.createTimer();
      this.view.setTimer({
        content: 'You<br>Completed<br>Task!',
        showFull: true,
      });
    });

    bus.subscribe('timer-increase-estimation', (task) => {
      this.view.renderPomodorosCounter(task);
      this.view.showStartBtn();
    });
  }

  /**
   * Renders Timer component and attaches event listeners to DOM elements
   */
  createTimer() {
    this.view.render({
      settings: this.model.settings,
      task: this.model.task,
      state: this.model.state,
    });

    this.addListeners();
  }

  /**
   * Attaches event listeners to DOM elements
   */
  addListeners() {
    const dom = this.view.getDOM();

    dom.goToTasks?.addEventListener('click', () => this.handleGoToTasks());
    dom.goToReports?.addEventListener('click', () =>
      router.navigate('reports')
    );

    dom.increaseEstimationBtn?.addEventListener('click', () =>
      this.model.increaseEstimation()
    );

    dom.startTimerBtn?.addEventListener('click', () => this.model.startTimer());
    dom.failPomodoroBtn?.addEventListener('click', () =>
      this.model.failPomodoro()
    );
    dom.finishPomodoroBtn?.addEventListener('click', () =>
      this.model.finishPomodoro()
    );
    dom.startPomodoroBtn?.addEventListener('click', () =>
      this.model.startPomodoro()
    );
    dom.finishTaskBtn?.addEventListener('click', () => this.model.finishTask());
  }

  /**
   * If task is not completed, sets task's status to 'daily'.
   * Navigates to 'task-list' page
   */
  handleGoToTasks() {
    if (this.model.task.status === TaskStatus.ACTIVE) {
      this.model.setTaskToDaily().then(() => router.navigate('task-list'));
    } else if (this.model.task.status === TaskStatus.COMPLETED) {
      router.navigate('task-list');
    }
  }
}

export default TimerController;
