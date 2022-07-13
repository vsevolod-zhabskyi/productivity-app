import TimerModel from './TimerModel';
import TimerView from './TimerView';
import TimerController from './TimerController';

import {TaskCategory} from "../../utils/TaskCategory";
import {TaskStatus} from "../../utils/TaskStatus";
import SettingsService from "../../settingsService";
import TaskService from "../../taskService";
import {bus} from "../../EventBus";
import {router} from "../../router";

import {mockSettingsState} from "../../../../__mocks__/settingsMocks";
import {mockTask} from "../../../../__mocks__/timerMocks";

jest.mock('../../settingsService', () => ({
  getSettingsValue: jest.fn().mockResolvedValue(),
}));
jest.mock('../../taskService', () => ({
  getActive: jest.fn().mockResolvedValue(),
  set: jest.fn().mockResolvedValue(),
}));
jest.mock('../../EventBus');
jest.mock('../../router');

describe('timerModel', function () {
  const model = new TimerModel();
  model.task = mockTask;
  model.originalTask = model.task;
  model.task.failedPomodoros = [];
  model.settings = mockSettingsState.value;

  beforeEach(() => {
    jest.clearAllMocks();
  })

  test('constructor', () => {
    expect(model.state).toBeTruthy();
  });

  test('increaseEstimation increases value', () => {
    model.task.estimation = 3;
    model.increaseEstimation();
    expect(model.task.estimation).toBe(4);
  });

  test('increaseEstimation fails because estimation is 10', () => {
    model.task.estimation = 10;
    model.increaseEstimation();
    expect(model.task.estimation).toBe(10);
  });

  test('startTimer', () => {
    model.startTimer();
    expect(model.state.isRunning).toBe(true);
    expect(model.state.isWorking).toBe(true);
  });

  test('failPomodoro', () => {
    model.failPomodoro();
    expect(model.state.isWorking).toBe(false);
    expect(model.state.isBreak).toBe(true);
    expect(model.task.failedPomodoros).toEqual([0]);
  });

  test('finishPomodoro and then short break', () => {
    model.task.completedCount = 0;
    model.finishPomodoro();
    expect(model.task.completedCount).toBe(1);
    expect(bus.post.mock.calls[1][0]).toBe('notify-info');
  });

  test('finishPomodoro and then long break', () => {
    model.settings.workIteration = 3;
    model.task.completedCount = 2;
    model.finishPomodoro();
    expect(model.task.completedCount).toBe(3);
    expect(bus.post.mock.calls[1][0]).toBe('notify-warning');
  });

  test('startPomodoro', () => {
    model.state.isWorking = false;
    model.state.isBreak = true;
    model.startPomodoro();
    expect(model.state.isWorking).toBe(true);
    expect(model.state.isBreak).toBe(false);
  });

  test('resetState', () => {
    model.state.isWorking = false;
    model.state.isBreak = true;
    model.resetState();
    expect(model.state.isWorking).toBe(false);
    expect(model.state.isBreak).toBe(false);
  });

  test('finishTask', () => {
    model.finishTask();
    expect(TaskService.set).toHaveBeenCalled();
  });

  test('getData', () => {
    model.getData();
    expect(SettingsService.getSettingsValue).toHaveBeenCalled();
    expect(TaskService.getActive).toHaveBeenCalled();
  });

  test('setTaskToDaily', () => {
    model.setTaskToDaily();
    expect(TaskService.set).toHaveBeenCalled();
  });
});

describe('timerView', function () {
  const view = new TimerView();

  view.template = jest.fn();
  view.failedPomodoroTemplate = jest.fn();
  view.completedPomodoroTemplate = jest.fn();
  view.emptyPomodoroTemplate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('applyCategoryStyle applies styles for work category', () => {
    const el = document.querySelector('.circle__body');
    el.className = 'circle__body';
    view.applyCategoryStyle({category: TaskCategory.WORK});
    expect(document.querySelector('.circle__body').className)
      .toMatch(/circle__category_work/);
  });

  test('applyCategoryStyle applies styles for education category', () => {
    const el = document.querySelector('.circle__body');
    el.className = 'circle__body';
    view.applyCategoryStyle({category: TaskCategory.EDUCATION});
    expect(document.querySelector('.circle__body').className)
      .toMatch(/circle__category_education/);
  });

  test('applyCategoryStyle applies styles for hobby category', () => {
    const el = document.querySelector('.circle__body');
    el.className = 'circle__body';
    view.applyCategoryStyle({category: TaskCategory.HOBBY});
    expect(document.querySelector('.circle__body').className)
      .toMatch(/circle__category_hobby/);
  });

  test('applyCategoryStyle applies styles for sport category', () => {
    const el = document.querySelector('.circle__body');
    el.className = 'circle__body';
    view.applyCategoryStyle({category: TaskCategory.SPORT});
    expect(document.querySelector('.circle__body').className)
      .toMatch(/circle__category_sport/);
  });

  test('applyCategoryStyle applies styles for other category', () => {
    const el = document.querySelector('.circle__body');
    el.className = 'circle__body';
    view.applyCategoryStyle({category: TaskCategory.OTHER});
    expect(document.querySelector('.circle__body').className)
      .toMatch(/circle__category_other/);
  });

  test('renderPomodorosCounter renders empty pomodoros', () => {
    view.pomodorosContainer = document
      .querySelector('.timer__pomodoros-container');
    view.renderPomodorosCounter({
      estimation: 3,
      failedPomodoros: [],
      completedCount: 0
    });
    expect(view.emptyPomodoroTemplate).toHaveBeenCalledTimes(3);
    expect(view.completedPomodoroTemplate).not.toHaveBeenCalled();
    expect(view.failedPomodoroTemplate).not.toHaveBeenCalled();
  });

  test('renderPomodorosCounter renders completed pomodoros', () => {
    view.pomodorosContainer = document
      .querySelector('.timer__pomodoros-container');
    view.renderPomodorosCounter({
      estimation: 3,
      failedPomodoros: [],
      completedCount: 3
    });
    expect(view.completedPomodoroTemplate).toHaveBeenCalledTimes(3);
    expect(view.emptyPomodoroTemplate).not.toHaveBeenCalled();
    expect(view.failedPomodoroTemplate).not.toHaveBeenCalled();
  });

  test('renderPomodorosCounter renders failed pomodoros', () => {
    view.pomodorosContainer = document
      .querySelector('.timer__pomodoros-container');
    view.renderPomodorosCounter({
      estimation: 3,
      failedPomodoros: [0, 1, 2],
      completedCount: 0
    });
    expect(view.failedPomodoroTemplate).toHaveBeenCalledTimes(3);
    expect(view.emptyPomodoroTemplate).not.toHaveBeenCalled();
    expect(view.completedPomodoroTemplate).not.toHaveBeenCalled();
  });

  test('updateStartBtn', () => {
    view.showStartBtn();
    expect(document.getElementById('start-pomodoro-btn').className)
      .not
      .toMatch(/hidden/)
  });

  test('renderEmptyPomodoro', () => {
    view.pomodorosContainer = document
      .querySelector('.timer__pomodoros-container');
    view.renderEmptyPomodoro();
    expect(view.emptyPomodoroTemplate).toHaveBeenCalled();
  });

  test('renderFailedPomodoro', () => {
    view.pomodorosContainer = document
      .querySelector('.timer__pomodoros-container');
    view.renderFailedPomodoro();
    expect(view.failedPomodoroTemplate).toHaveBeenCalled();
  });

  test('renderCompletedPomodoro', () => {
    view.pomodorosContainer = document
      .querySelector('.timer__pomodoros-container');
    view.renderCompletedPomodoro();
    expect(view.completedPomodoroTemplate).toHaveBeenCalled();
  });


});

describe('timerController', function () {
  const model = new TimerModel();
  model.task = mockTask;
  const view = new TimerView();
  const controller = new TimerController(model, view);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('constructor', () => {
    expect(controller.view).toBeTruthy();
  });

  test('onInit', () => {
    controller.onInit();
    expect(bus.subscribe).toHaveBeenCalledTimes(6);
  });

  test('addListeners', () => {
    controller.model.finishTask = jest.fn();
    controller.addListeners();
    $('#finish-task-btn').click();
    expect(controller.model.finishTask).toHaveBeenCalled();
  });

  test('createTimer', () => {
    controller.view.render = jest.fn();
    controller.addListeners = jest.fn();
    controller.createTimer();
    expect(controller.addListeners).toHaveBeenCalled();
  });

  test('handleGoToTasks sets task back to active ' +
    'if it is not completed', () => {
    controller.model.task.status = TaskStatus.ACTIVE;
    controller.model.setTaskToDaily = jest.fn().mockResolvedValue();
    controller.handleGoToTasks();
    expect(controller.model.setTaskToDaily).toHaveBeenCalled();
  });

  test('handleGoToTasks works correctly when task is completed', () => {
    controller.model.task.status = TaskStatus.COMPLETED;
    controller.handleGoToTasks();
    expect(router.navigate).toHaveBeenCalled();
  });
});
