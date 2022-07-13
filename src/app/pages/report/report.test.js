import Highcharts from 'highcharts';

import ReportModel from "./ReportModel";
import ReportController from "./ReportController";
import ReportView from "./ReportView";

import {ReportSortType} from "../../utils/ReportSortType";
import {ReportSortInterval} from "../../utils/ReportSortInterval";
import { router } from '../../router';
import TaskService from "../../taskService";

import {
  mockDates,
  mockDateToTasksPairs,
  mockSortByPomodoros,
  mockSortByTasks,
  mockTasks
} from "../../../../__mocks__/reportMocks";

jest.mock('highcharts');
jest.mock('../../router');
jest.mock('../../taskService', () => ({
  getAll: jest.fn().mockResolvedValue()
}));
jest.mock('../../EventBus');

describe('reportModel', () => {
  const model = new ReportModel();

  beforeEach(() => {
    model.tasks = [...mockTasks];
  })

  test('getTasks', () => {
    model.getTasks();
    return expect(TaskService.getAll).toHaveBeenCalled();
  });

  test('getData calls sortByTasks', () => {
    const spy = jest.spyOn(model, 'sortByTasks');
    model.getData('', ReportSortType.TASKS);
    expect(spy).toHaveBeenCalled();
  });


  test('getData calls sortByPomodoros', () => {
    const spy = jest.spyOn(model, 'sortByPomodoros');
    model.getData('', ReportSortType.POMODOROS);
    expect(spy).toHaveBeenCalled();
  });

  test("getDaysForInterval works correctly", () => {
    expect(model.getDaysForInterval(ReportSortInterval.MONTH)).toBe(30);
  });

  test("getDaysForInterval fails when wrong interval specified", () => {
    expect(model.getDaysForInterval('weekend')).toBeUndefined();
  });

  test('getFormattedDateString', () => {
    expect(model.getFormattedDateString('2022-04-20T17:59:22.992Z'))
      .toBe('2022-04-20');
  });

  test('getArrayOfPrevDates', () => {
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2022-05-06'));

    expect(model.getArrayOfPrevDates(7)).toEqual(mockDates);
  });

  test('getDateToTasksPairs', () => {
    expect(model.getDateToTasksPairs(mockDates))
      .toEqual(mockDateToTasksPairs);
  });

  test('sortByPomodoros', () => {
    expect(model.sortByPomodoros(mockDateToTasksPairs))
      .toEqual(mockSortByPomodoros);
  });

  test('sortByTasks', () => {
    expect(model.sortByTasks(mockDateToTasksPairs))
      .toEqual(mockSortByTasks);
  });
});

describe('reportView', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  jest
    .useFakeTimers()
    .setSystemTime(new Date('2022-05-06'));

  const model = new ReportModel();
  const view = new ReportView(model);

  test('constructor', () => {
    expect(view.model).toBeTruthy();
  });

  test('initialRender', () => {
    view.addLinkListeners = jest.fn();
    view.reportTemplate = jest.fn();
    view.initialRender('day/tasks');
    expect(view.addLinkListeners).toHaveBeenCalled();
  });

  test('updateRouterListeners', () => {
    view.updateRouterListeners();
    expect(router.updateListeners).toHaveBeenCalled();
  });

  test('firstLetterUppercase', () => {
    expect(view.firstLetterUppercase('hello')).toBe('Hello')
  });

  test('getDataOfPriority', () => {
    expect(view.getDataOfPriority(mockSortByTasks, 'urgent'))
      .toEqual([0, 1, 0, 0, 0, 0, 0]);
  });

  test('getWeekSeries', () => {
    expect(view.getWeekSeries(mockSortByTasks, 'high', 'success'))
      .toEqual({
        "stack": "success",
        "name": "High",
        "data": [ 0, 2, 0, 0, 0, 1, 0]
      });
  });

  test('getMonthSeries', () => {
    expect(view.getMonthSeries(mockSortByTasks, 'high'))
      .toEqual({
        "name": "High",
        "data": [ 0, 2, 0, 0, 0, 1, 0]
      });
  });

  test('renderChart for day', () => {
    view.sortInterval = ReportSortInterval.DAY;
    view.sortType = 'tasks';
    view.renderChart(mockSortByTasks);
    expect(Highcharts.chart).toHaveBeenCalled();
  });

  test('renderChart for week', () => {
    view.sortInterval = ReportSortInterval.WEEK;
    view.sortType = 'tasks';
    view.renderChart(mockSortByTasks);
    expect(Highcharts.chart).toHaveBeenCalled();
  });

  test('renderChart for month', () => {
    view.sortInterval = ReportSortInterval.MONTH;
    view.sortType = 'tasks';
    view.renderChart(mockSortByTasks);
    expect(Highcharts.chart).toHaveBeenCalled();
  });

  test('render', () => {
    view.tab = "month/pomodoros";
    view.model.getData = jest.fn();
    view.renderChart = jest.fn();
    view.render();
    expect(view.renderChart).toHaveBeenCalled();
  });
});

describe('reportController', () => {
  const model = new ReportModel();
  const view = new ReportView(model);
  const controller = new ReportController(model, view);

  test('constructor', () => {
    expect(controller.model).toBeTruthy();
  });
});
