import './task-list.less';

import templateTaskList from './components/taskList.handlebars';
import templateDailyList from './components/dailyList.handlebars';
import templateGlobalList from './components/globalList.handlebars';
import templateFirstTime from './components/firstTime.handlebars';
import addFirstTask from './components/addFirstTask.handlebars';
import templateAddEditTaskModal from './components/addEditTaskModal.handlebars';
import templateDeleteModal from './components/deleteTaskModal.handlebars';
import { StateStatus } from '../../utils/StateStatus';
import { router } from '../../router';
import { TaskCategory } from '../../utils/TaskCategory';
import { TaskPriority } from '../../utils/TaskPriority';

/**
 * View part of the TaskList component that is responsible
 * for rendering the component
 */
class TaskListView {
  constructor() {
    this.templateTaskList = templateTaskList;
    this.templateDailyList = templateDailyList;
    this.templateGlobalList = templateGlobalList;
    this.templateFirstTime = templateFirstTime;
    this.templateAddFirstTask = addFirstTask;
    this.templateAddTaskModal = templateAddEditTaskModal;
    this.templateDeleteModal = templateDeleteModal;

    this.selectedCounter = null;
  }

  /**
   * Renders component using passed state.
   * If no state's been passed - renders page with loader
   * @param {Object=} state
   */
  render(state) {
    if (!state) {
      document.getElementById('content').innerHTML = this.templateTaskList({
        tasksLoading: true,
      });
      return;
    }

    if (!state.isVisited) {
      document.getElementById('content').innerHTML = this.templateFirstTime();
      router.updateListeners();
      return;
    }

    document.getElementById('content').innerHTML = this.templateTaskList({
      showAddFirst: state.tasks.length === 0 || true,
      isToDoEmpty: !state.todoLength && state.status === StateStatus.TODO,
      isDoneEmpty: !state.doneLength && state.status === StateStatus.DONE,
      notShowSelectTabs: !state.isDeleteMode || !state.dailyLength,
      ...state,
    });

    if (state.tasks.length === 0) {
      document.getElementById('add-first-task').innerHTML =
        this.templateAddFirstTask();
      return;
    }

    this.selectedCounter = document.querySelector('.trash__container');
    this.selectedCounterValue = document.querySelector('.trash__value');

    this.updateSelectedCounter(state.selected.length);

    this.renderDailyList(state);
    this.renderGlobalList(state);

    this.setActiveStatusTab(state);
    this.setActivePriorityTab(state);

    this.applyTaskStyles(state);
    this.applyTaskSelectedStyles(state);

    this.setAddTaskButtonsAvailability(state);
  }

  /**
   * Updates the counter of selected tasks
   * or hides it if passed value is 0
   * @param {number} value
   */
  updateSelectedCounter(value) {
    if (!value) {
      this.selectedCounter.classList.add('hidden');
    } else {
      this.selectedCounter.classList.remove('hidden');
      this.selectedCounterValue.innerHTML = value;
    }
  }

  /**
   * Highlights active status tab
   * @param {Object} state
   */
  setActiveStatusTab(state) {
    document.querySelectorAll('[data-status]').forEach((el) => {
      if (JSON.parse(el.dataset.status) === state.status) {
        el.classList.add('active');
      }
    });
  }

  /**
   * Highlights active priority tab
   * @param {Object} state
   */
  setActivePriorityTab(state) {
    document.querySelectorAll('[data-priority]').forEach((el) => {
      if (JSON.parse(el.dataset.priority) === state.priority) {
        el.classList.add('active');
      }
    });
  }

  /**
   * Applies styles to the task elements if delete mode is on
   * @param {Object} state
   */
  applyTaskSelectedStyles(state) {
    if (!state.isDeleteMode || state.selected.length === 0) {
      return;
    }
    document.querySelectorAll('.task').forEach((el) => {
      const id = Number(el.dataset.id);
      if (state.selected.includes(id)) {
        el.classList.add('selected');
      }
    });
  }

  /**
   * Applies styles to the task elements
   */
  applyTaskStyles() {
    document.querySelectorAll('.task').forEach((el) => {
      switch (Number(el.dataset.category)) {
        case TaskCategory.WORK:
          el.classList.add('task-category_work');
          break;
        case TaskCategory.EDUCATION:
          el.classList.add('task-category_education');
          break;
        case TaskCategory.HOBBY:
          el.classList.add('task-category_hobby');
          break;
        case TaskCategory.SPORT:
          el.classList.add('task-category_sport');
          break;
        case TaskCategory.OTHER:
          el.classList.add('task-category_other');
          break;
        default:
          console.error('Unexpected category value');
      }
      switch (Number(el.dataset.priority)) {
        case TaskPriority.LOW:
          el.classList.add('task-priority_low');
          break;
        case TaskPriority.MIDDLE:
          el.classList.add('task-priority_middle');
          break;
        case TaskPriority.HIGH:
          el.classList.add('task-priority_high');
          break;
        case TaskPriority.URGENT:
          el.classList.add('task-priority_urgent');
          break;
        default:
          console.error('Unexpected priority value');
      }
    });
  }

  /**
   * Renders daily list
   * @param {Object} state
   */
  renderDailyList(state) {
    const dailyListEl = document.getElementById('daily-list');

    dailyListEl.innerHTML = this.templateDailyList({
      tasks: state.sortedTasks.daily,
      isDailyListUsed: state.isDailyListUsed,
      isToDo: state.status === StateStatus.TODO,
      isDone: state.status === StateStatus.DONE,
      toRender:
        state.status === StateStatus.TODO ? state.todoLength : state.doneLength,
      dailyLength: state.dailyLength,
      isDeleteMode: state.isDeleteMode,
    });

    dailyListEl.querySelectorAll('.task__date-value').forEach((el) => {
      el.innerHTML = 'Today';
    });
  }

  /**
   * Renders global list
   * @param {Object} state
   */
  renderGlobalList(state) {
    document.getElementById('global-list').innerHTML = this.templateGlobalList({
      tasks: state.sortedTasks.global,
      renderGlobal: state.globalLength,
      isDone: state.status === StateStatus.DONE,
      isDeleteMode: state.isDeleteMode,
      notDeleteMode: !state.isDeleteMode,
      notShowSelectTabs: !state.isDeleteMode || !state.globalLength,
    });
  }

  /**
   *
   *
   * @returns {{
   * selectAllDaily: HTMLElement,
   * addTaskBtn: HTMLElement,
   * selectAllGlobal: HTMLElement,
   * deselectAllGlobal: HTMLElement,
   * deselectAllDaily: HTMLElement
   * }}
   */
  getDOM() {
    return {
      addTaskBtn: document.getElementById('btn-add-task'),
      selectAllDaily: document.getElementById('select-all-daily'),
      deselectAllDaily: document.getElementById('deselect-all-daily'),
      selectAllGlobal: document.getElementById('select-all-global'),
      deselectAllGlobal: document.getElementById('deselect-all-global'),
    };
  }

  /**
   * Renders 'Delete' modal window
   */
  renderDeleteModal() {
    const html = this.templateDeleteModal();
    document.getElementById('root').insertAdjacentHTML('afterbegin', html);

    document.body.classList.add('restrict-scroll');
  }

  /**
   * Returns DOM elements of 'Delete' modal window
   * @returns {{
   * btnCancel: HTMLElement,
   * btnClose: HTMLElement,
   * btnConfirm: HTMLElement
   * }}
   */
  getDeleteModalDOM() {
    return {
      btnClose: document.getElementById('btn-close'),
      btnCancel: document.getElementById('btn-cancel'),
      btnConfirm: document.getElementById('btn-confirm'),
    };
  }

  /**
   * Renders 'Edit' modal window if task is passed
   * Else renders 'Add' modal window
   * @param {Task=} task - Optional parameter
   */
  renderAddEditTaskModal(task) {
    const html = this.templateAddTaskModal({ task });
    document.getElementById('root').insertAdjacentHTML('afterbegin', html);

    document.body.classList.add('restrict-scroll');

    this.configureDatepicker();

    if (task) {
      this.setActiveEstimationItem(task.estimation);
      this.setActiveCategory(task.category);
      this.setActivePriority(task.priority);
    }
  }

  /**
   * Returns DOM elements of 'Add/Edit' modal window
   * @returns {{
   * form: {
   *   title: string,
   *   description: string,
   *   estimation: HTMLElement,
   *   category: HTMLElement,
   *   deadline: string,
   *   priority: HTMLElement
   * },
   * btnClose: HTMLElement,
   * btnSubmit: HTMLElement
   * }}
   */
  getAddEditTaskModalDOM() {
    const form = document.getElementById('add-task-form');

    return {
      form: {
        title: form.title,
        description: form.description,
        category: document.getElementById('category'),
        deadline: form.deadline,
        estimation: document.getElementById('estimation'),
        priority: document.getElementById('priority'),
      },
      btnClose: document.getElementById('btn-close'),
      btnSubmit: document.getElementById('btn-submit'),
    };
  }

  /**
   * Configures jQuery's datepicker
   */
  configureDatepicker() {
    $('#deadline').datepicker({
      dateFormat: 'MM d, yy',
      firstDay: 1,
      gotoCurrent: true,
      minDate: 0,
      onSelect: (value) => {
        const formattedDate = $.datepicker.formatDate(
          'yy-mm-dd',
          new Date(value)
        );

        $('#deadline')
          .val(value)
          .attr('data-value', formattedDate)
          .get(0)
          .dispatchEvent(new Event('change', { bubbles: true }));
      },
    });
  }

  /**
   * Shows/hides global list
   */
  toggleGlobalList() {
    const link = document.querySelector('.global-list__link');
    link.classList.toggle('active');

    document.querySelectorAll('.collapse').forEach((el) => {
      el.classList.toggle('hidden');
    });
  }

  /**
   * Removes modal window
   */
  closeModal() {
    document.querySelector('.modal').remove();
    document.body.classList.remove('restrict-scroll');
  }

  /**
   * Sets task's category in 'Edit' modal window
   * @param {number} value
   */
  setActiveCategory(value) {
    const container = document.getElementById('category');
    container.querySelector(`[value="${value}"]`).checked = 'true';
  }

  /**
   * Sets task's priority in 'Edit' modal window
   * @param {number} value
   */
  setActivePriority(value) {
    const container = document.getElementById('priority');
    container.querySelector(`[value="${value}"]`).checked = 'true';
  }

  /**
   * Sets task's estimation value in 'Edit' modal window
   * @param {number} value
   */
  setActiveEstimationItem(value) {
    const container = document.getElementById('estimation');
    container.querySelector('.active')?.classList.remove('active');
    container.querySelector(`[data-value="${value}"]`).classList.add('active');
  }

  /**
   * Sets 'Add task' buttons (both in header and in heading)
   * availability depending on is delete-mode turned on
   * @param {Object} state
   */
  setAddTaskButtonsAvailability(state) {
    document.querySelectorAll('.btn-add-task').forEach((el) => {
      if (state.isDeleteMode) {
        el.classList.add('hidden');
      } else {
        el.classList.remove('hidden');
      }
    });
  }

  /**
   * Toggles delete mode button's 'active' state
   */
  toggleDeleteModeButton() {
    document.querySelector('.btn-delete-mode').classList.toggle('active');
  }

  /**
   * Removes delete mode button's 'active' state
   */
  deactivateDeleteModeButton() {
    document.querySelector('.btn-delete-mode').classList.remove('active');
  }

  /**
   * Toggles task element's class 'selected'
   * @param {HTMLElement} taskEl
   */
  toggleTaskSelection(taskEl) {
    taskEl.classList.toggle('selected');
  }
}

export default TaskListView;
