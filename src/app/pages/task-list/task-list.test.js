import $ from 'jquery';

import TaskListModel from "./TaskListModel";
import TaskListView from "./TaskListView";
import TaskListController from "./TaskListController";

import TaskService from "../../taskService";
import {bus} from "../../EventBus";

import {mockTaskListState} from "../../../../__mocks__/taskListMocks";

jest.mock('../../taskService', () => ({
  set: jest.fn().mockResolvedValue(),
  delete: jest.fn().mockResolvedValue(),
  update: jest.fn().mockResolvedValue(),
  getAll: jest.fn().mockResolvedValue(),
}));
jest.mock('../../EventBus');
const querySelectorAllSpy = jest.spyOn(document, 'querySelectorAll');

describe('taskListModel', () => {
  const model = new TaskListModel();
  model.state = mockTaskListState;

  beforeEach(() => {
    jest.clearAllMocks();
    model.state = {...mockTaskListState};
  });

  test('constructor', () => {
    expect(model.state).toBeTruthy();
  });

  test('deleteTasks deletes one task', () => {
    model.deleteTasks(3);
    expect(TaskService.delete).toHaveBeenCalledWith(3);
  });

  test('deleteTasks deletes multiple tasks', () => {
    model.state.selected = [1, 2, 3];
    model.deleteTasks(3);
    expect(TaskService.update).toHaveBeenCalled();
  });

  test('toggleSelection adds item', () => {
    model.state.selected = [2, 3];
    model.toggleSelection(1);
    expect(model.state.selected).toEqual([2, 3, 1]);
  });

  test('toggleSelection deletes item', () => {
    model.state.selected = [1, 2, 3];
    model.toggleSelection(1);
    expect(model.state.selected).toEqual([2, 3]);
  });

  test('selectAllDaily', () => {
    model.selectAllDaily();
    expect(bus.post.mock.calls[0][0]).toBe('selection-all');
  });

  test('deselectAllDaily', () => {
    model.deselectAllDaily();
    expect(bus.post.mock.calls[0][0]).toBe('selection-all');
  });

  test('selectAllGlobal', () => {
    model.selectAllGlobal();
    expect(bus.post.mock.calls[0][0]).toBe('selection-all');
  });

  test('deselectAllGlobal', () => {
    model.deselectAllGlobal();
    expect(bus.post.mock.calls[0][0]).toBe('selection-all');
  });

  test('sortTasks', () => {
    model.state.sortedTasks = [];
    model.sortTasks();
    expect(model.state.sortedTasks).not.toEqual([]);
  });

  test('toggleDeleteMode', () => {
    model.state.isDeleteMode = true;
    model.toggleDeleteMode();
    expect(model.state.isDeleteMode).toBe(false);
  });

  test('isToday', () => {
    expect( model.isToday(new Date()) ).toBe(true);
  });

  test('setSortPriority', () => {
    model.setSortPriority('urgent');
    expect(model.state.priority).toBe('urgent');
  });

  test('setSortStatus', () => {
    model.setSortStatus(1);
    expect(model.state.status).toBe(1);
  });

  test('setTask', () => {
    model.setTask({...model.state.tempTask, title: 'title'});
    expect(model.state.tempTask.title).toBe('title');
  });

  test('getTask', () => {
    expect(model.getTask(0)).toEqual({
      "category": 2,
      "completeDate": "2022-04-20T17:59:22.992Z",
      "completedCount": 3,
      "createDate": "2022-04-20T17:58:59.472Z",
      "deadlineDate": "2022-05-04",
      "description": "q",
      "estimation": 4,
      "failedPomodoros": 1,
      "id": 0,
      "priority": 2,
      "status": 3,
      "title": "q"
    });
  });

  test('moveToDaily', () => {
    model.moveToDaily(25);
    expect(TaskService.set).toHaveBeenCalled();
  });

  test('setTaskToActive', () => {
    model.setTaskToActive(13);
    expect(TaskService.set).toHaveBeenCalled();
  });

  test('createTask fails if task not valid', async () => {
    model.state.tempTask.title = '';
    await expect(model.createTask()).rejects.toThrow();
  });

  test('createTask works correctly', () => {
    model.state.tempTask = model.state.tasks[0];
    model.createTask();
    expect(TaskService.set).toHaveBeenCalled();
  });

  test('editTask works correctly', () => {
    model.state.tempTask = model.state.tasks[0];
    model.editTask();
    expect(TaskService.set).toHaveBeenCalled();
  });

  test('setVisited', () => {
    model.setVisited();
    expect(model.state.isVisited).toBe(true);
  });

  test('getTasks', () => {
    model.getTasks();
    expect(TaskService.getAll).toHaveBeenCalled();
  });

  test('isTaskValid returns false on invalid title', () => {
    expect(model.isTaskValid()).toBe(false);
  });

  test('isTaskValid returns false on invalid description', () => {
    model.state.tempTask.title = 'a';
    expect(model.isTaskValid()).toBe(false);
  });

  test('isTaskValid returns false on invalid category', () => {
    model.state.tempTask.title = 'a';
    model.state.tempTask.description = 'a';
    expect(model.isTaskValid()).toBe(false);
  });

  test('isTaskValid returns false on invalid deadlineDate', () => {
    model.state.tempTask.title = 'a';
    model.state.tempTask.description = 'a';
    model.state.tempTask.category = 1;
    expect(model.isTaskValid()).toBe(false);
  });

  test('isTaskValid returns false on invalid estimation', () => {
    model.state.tempTask.title = 'a';
    model.state.tempTask.description = 'a';
    model.state.tempTask.category = 1;
    model.state.tempTask.deadlineDate = '2222-03-02';
    expect(model.isTaskValid()).toBe(false);
  });

  test('isTaskValid returns false on invalid priority', () => {
    model.state.tempTask.title = 'a';
    model.state.tempTask.description = 'a';
    model.state.tempTask.category = 1;
    model.state.tempTask.deadlineDate = '2222-03-02';
    model.state.tempTask.estimation = 3;
    expect(model.isTaskValid()).toBe(false);
  });

  test('isTaskValid returns true', () => {
    model.state.tempTask.title = 'a';
    model.state.tempTask.description = 'a';
    model.state.tempTask.category = 1;
    model.state.tempTask.deadlineDate = '2222-03-02';
    model.state.tempTask.estimation = 3;
    model.state.tempTask.priority = 2;
    expect(model.isTaskValid()).toBe(true);
  });

  test('refreshTask', () => {
    model.state.tempTask.title = 'a';
    model.refreshTask();
    expect(model.state.tempTask.title).toBe('');
  });

  test('setTitle', () => {
    model.setTitle('a');
    expect(model.state.tempTask.title).toBe('a');
  });

  test('setDescription', () => {
    model.setDescription('a');
    expect(model.state.tempTask.description).toBe('a');
  });

  test('setCategory', () => {
    model.setCategory('1');
    expect(model.state.tempTask.category).toBe(1);
  });

  test('setDeadline', () => {
    model.setDeadline('2222-03-02');
    expect(model.state.tempTask.deadlineDate).toBe('2222-03-02');
  });

  test('setEstimation', () => {
    model.setEstimation('3');
    expect(model.state.tempTask.estimation).toBe(3);
  });

  test('setPriority', () => {
    model.setPriority('2');
    expect(model.state.tempTask.priority).toBe(2);
  });

  test('getIsVisited', () => {
    expect(model.getIsVisited()).toBe(true);
  });
});

describe('taskListView', () => {
  const view = new TaskListView();

  view.templateTaskList = jest.fn();
  view.templateDailyList = jest.fn();
  view.templateGlobalList = jest.fn();
  view.templateFirstTime = jest.fn();
  view.templateAddFirstTask = jest.fn();
  view.templateAddTaskModal = jest.fn();
  view.templateDeleteModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });


  test('constructor', () => {
    expect(view.selectedCounter).toBeDefined();
  });

  test('render renders loader when no state specified', () => {
    view.render();
    expect(view.templateTaskList).toHaveBeenCalledWith({
      tasksLoading: true,
    });
  });

  test('render renders first time window', () => {
    view.render({
      isVisited: false
    });
    expect(view.templateFirstTime).toHaveBeenCalled();
  });

  test('render renders add first task window', () => {
    view.render({
      ...mockTaskListState,
      tasks: []
    });
    expect(view.templateAddFirstTask).toHaveBeenCalled();
  });

  test('updateSelectedCounter shows counter when value > 0', () => {
    view.selectedCounter = {
      classList: {
        remove: jest.fn(),
      }
    }
    view.selectedCounterValue = { innerHTML: 0 }
    view.updateSelectedCounter(3);
    expect(view.selectedCounterValue.innerHTML).toBe(3)
  });

  test('updateSelectedCounter hides counter when value === 0', () => {
    view.selectedCounter = {
      classList: {
        add: jest.fn(),
      }
    }
    view.updateSelectedCounter(0);
    expect(view.selectedCounter.classList.add).toHaveBeenCalled();
  });

  test('setActiveStatusTab', () => {
    view.setActiveStatusTab(mockTaskListState);
    expect(querySelectorAllSpy).toHaveBeenCalledWith('[data-status]');
  });

  test('setActivePriorityTab', () => {
    view.setActivePriorityTab(mockTaskListState);
    expect(querySelectorAllSpy).toHaveBeenCalledWith('[data-priority]');
  });

  test('applyTaskSelectedStyles fails', () => {
    view.applyTaskSelectedStyles({
      isDeleteMode: false,
      selected: []
    });
    expect(querySelectorAllSpy).not.toHaveBeenCalled();
  });

  test('applyTaskSelectedStyles works correctly', () => {
    view.applyTaskSelectedStyles({
      ...mockTaskListState,
      isDeleteMode: true,
      selected: [1]
    });
    expect(document.querySelector('.task').className).toMatch(/selected/)
  });

  test('applyTaskStyles', () => {
    view.applyTaskStyles();
    expect(document.querySelector('.task').className)
      .toMatch(/task-category_work/)
  });

  test('renderDailyList', () => {
    view.renderDailyList(mockTaskListState);
    expect(view.templateDailyList).toHaveBeenCalled();
  });

  test('renderGlobalList', () => {
    view.renderGlobalList(mockTaskListState);
    expect(view.templateGlobalList).toHaveBeenCalled();
  });

  test('toggleGlobalList', () => {
    view.toggleGlobalList();
    expect(document.querySelector('.global-list__link').className)
      .toMatch(/active/);
  });

  test('getDOM', () => {
    expect(view.getDOM()).toBeTruthy();
  });

  test('renderDeleteModal', () => {
    view.renderDeleteModal()
    expect(view.templateDeleteModal).toHaveBeenCalled();
  });

  test('getDeleteModalDOM', () => {
    expect(view.getDeleteModalDOM()).toBeTruthy();
  });

  test('setActiveCategory', () => {
    view.setActiveCategory(1);
    expect(document.getElementById('category')
      .querySelector('[value="1"]').checked).toBeTruthy();
  });

  test('setActivePriority', () => {
    view.setActivePriority(1);
    expect(document.getElementById('priority')
      .querySelector('[value="1"]').checked).toBeTruthy();
  });

  test('setActiveEstimationItem', () => {
    view.setActiveEstimationItem(1);
    expect(document.getElementById('estimation')
      .querySelector('[data-value="1"]').className).toMatch(/active/);
  });

  test('renderAddEditTaskModal renders add task modal ' +
    'when no task passed', () => {
      view.configureDatepicker = jest.fn();
      view.renderAddEditTaskModal();
      expect(view.configureDatepicker).toHaveBeenCalled();
    });

  test('renderAddEditTaskModal renders edit task modal ' +
    'when task is passed', () => {
    view.configureDatepicker = jest.fn();
    view.setActivePriority = jest.fn();
    view.renderAddEditTaskModal({
      id: 0,
      title: 'title',
      category: 1,
      priority: 1,
      estimation: 1
    });
    expect(view.setActivePriority).toHaveBeenCalled();
  });

  test('getAddEditTaskModalDOM', () => {
    expect(view.getAddEditTaskModalDOM()).toBeTruthy();
  });

  test('closeModal', () => {
    view.closeModal();
    expect(document.querySelector('.modal')).toBeFalsy();
  });
});

describe('taskListcontroller', () => {
  const model = new TaskListModel();
  const view = new TaskListView();
  const controller = new TaskListController(model, view);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('constructor', () => {
    expect(controller.view).toBeTruthy();
  });

  test('addStatusTabsListeners', () => {
    controller.addStatusTabsListeners();
    expect(querySelectorAllSpy).toHaveBeenCalled();
  });

  test('addPriorityTabsListeners', () => {
    controller.addPriorityTabsListeners();
    expect(querySelectorAllSpy).toHaveBeenCalled();
  });

  test('addGlobalListLinkListener', () => {
    controller.view.toggleGlobalList = jest.fn();
    controller.addGlobalListLinkListener();
    $('.global-list__link').click();
    expect(controller.view.toggleGlobalList).toHaveBeenCalled();
  });

  test('addSelectionTabsListeners', () => {
    const dom = {
      deselectAllGlobal: {
        addEventListener: jest.fn()
      },
    }
    controller.addSelectionTabsListeners(dom);
    expect(dom.deselectAllGlobal.addEventListener).toHaveBeenCalled();
  });

  test('addTaskListeners adds listener for moving to daily', () => {
    controller.model.moveToDaily = jest.fn();
    controller.addTaskListeners();
    $('.btn-up').click();
    expect(controller.model.moveToDaily).toHaveBeenCalled();
  });

  test('addTaskListeners listeners not working ' +
    'when click is not on the button', () => {
    controller.model.moveToDaily = jest.fn();
    controller.addTaskListeners();
    $('.task').click();
    expect(controller.model.moveToDaily).not.toHaveBeenCalled();
  });

  test('toggleDeleteMode does not toggle mode', () => {
    controller.model.toggleDeleteMode = jest.fn();
    controller.toggleDeleteMode();
    expect(controller.model.toggleDeleteMode).not.toHaveBeenCalled();
  });

  test('toggleDeleteMode opens modal', () => {
    const spy = jest.spyOn(controller, "createDeleteModal");
    controller.model.state = mockTaskListState;
    controller.model.state.selected = [1, 2, 3];
    controller.toggleDeleteMode();
    expect(spy).toHaveBeenCalled();
  });

  test('toggleDeleteMode toggles mode', () => {
    controller.model.toggleDeleteMode = jest.fn();
    controller.model.state = mockTaskListState;
    controller.model.state.selected = [];
    controller.toggleDeleteMode();
    expect(controller.model.toggleDeleteMode).toHaveBeenCalled();
  });

  test('handleSelect', () => {
    controller.view.updateSelectedCounter = jest.fn();
    controller.handleSelect(document.querySelector('.task'));
    expect(controller.view.updateSelectedCounter).toHaveBeenCalled();
  });

  test('handleTimerClick', () => {
    controller.model.setTaskToActive = jest.fn().mockResolvedValue();
    controller.handleTimerClick(1);
    expect(controller.model.setTaskToActive).toHaveBeenCalled();
  });

  test('handleCloseModal', () => {
    controller.view.closeModal = jest.fn();
    controller.handleCloseModal();
    expect(controller.view.closeModal).toHaveBeenCalled();
  });

  test('createTask', () => {
    controller.model.createTask = jest.fn().mockResolvedValue();
    controller.createTask();
    expect(controller.model.createTask).toHaveBeenCalled();
  });

  test('editTask', () => {
    controller.model.editTask = jest.fn().mockResolvedValue();
    controller.editTask();
    expect(controller.model.editTask).toHaveBeenCalled();
  });

  test('addTaskModalListeners', () => {
    const dom = {
      form: {
        title: {addEventListener: jest.fn()},
        description: {addEventListener: jest.fn()},
        category: {addEventListener: jest.fn()},
        deadline: {addEventListener: jest.fn()},
        estimation: {addEventListener: jest.fn()},
        priority: {addEventListener: jest.fn()},
      },
      btnClose: {addEventListener: jest.fn()},
    }
    controller.addTaskModalListeners(dom);
    expect(dom.btnClose.addEventListener).toHaveBeenCalled();
  });

  test('createAddTaskModal', () => {
    controller.view.getAddEditTaskModalDOM = jest.fn().mockReturnValue({
      btnSubmit: {
        addEventListener: jest.fn()
      }
    });
    controller.addTaskModalListeners = jest.fn();
    controller.view.configureDatepicker = jest.fn();
    controller.createAddTaskModal();
    expect(controller.addTaskModalListeners).toHaveBeenCalled();
  });

  test('createEditTaskModal', () => {
    controller.view.getAddEditTaskModalDOM = jest.fn().mockReturnValue({
      btnSubmit: {
        addEventListener: jest.fn()
      }
    });
    controller.addTaskModalListeners = jest.fn();
    controller.view.configureDatepicker = jest.fn();
    controller.model.getTask = jest.fn();
    controller.createEditTaskModal();
    expect(controller.addTaskModalListeners).toHaveBeenCalled();
  });

  test('createDeleteModal', () => {
    const dom = {
      btnCancel: {addEventListener: jest.fn()},
      btnClose: {addEventListener: jest.fn()},
      btnConfirm: {addEventListener: jest.fn()},
    }
    controller.view.getDeleteModalDOM = jest.fn().mockReturnValue(dom);
    controller.createDeleteModal();
    expect(dom.btnConfirm.addEventListener).toHaveBeenCalled();
  });

  test('handleMultipleDeletion', () => {
    controller.model.deleteTasks = jest.fn().mockResolvedValue();
    controller.view.updateSelectedCounter = jest.fn();
    controller.handleDeletion(1);
    expect(controller.model.deleteTasks).toHaveBeenCalledWith(1);
  });

  test('handleTitleInput', () => {
    controller.model.setTitle = jest.fn();
    controller.handleTitleInput({
      target: {
        value: 'title'
      }
    });
    expect(controller.model.setTitle).toHaveBeenCalledWith('title');
  });

  test('handleDescriptionInput', () => {
    controller.model.setDescription = jest.fn();
    controller.handleDescriptionInput({
      target: {
        value: 'description'
      }
    });
    expect(controller.model.setDescription).toHaveBeenCalledWith('description');
  });

  test('handleCategoryInput', () => {
    controller.model.setCategory = jest.fn();
    controller.handleCategoryInput({
      target: {
        value: 2
      }
    });
    expect(controller.model.setCategory).toHaveBeenCalledWith(2);
  });

  test('handleDeadlineInput', () => {
    controller.model.setDeadline = jest.fn();
    controller.handleDeadlineInput({
      target: {
        dataset: {value: '2222-09-03'}
      }
    });
    expect(controller.model.setDeadline).toHaveBeenCalledWith('2222-09-03');
  });

  test('handleEstimationInput', () => {
    controller.model.setEstimation = jest.fn();
    controller.view.setActiveEstimationItem = jest.fn();
    controller.handleEstimationInput({
      target: {
        dataset: {value: 3}
      }
    });
    expect(controller.model.setEstimation).toHaveBeenCalledWith(3);
  });

  test('handlePriorityInput', () => {
    controller.model.setPriority = jest.fn();
    controller.handlePriorityInput({
      target: {
        value: 3
      }
    });
    expect(controller.model.setPriority).toHaveBeenCalledWith(3);
  });
});
