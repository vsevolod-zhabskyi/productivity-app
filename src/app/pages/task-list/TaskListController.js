import { router } from '../../router';
import { bus } from '../../EventBus';

/**
 * Controller part of the TaskList component that is responsible
 * for cooperation between Model and View and for interaction with event bus
 */
class TaskListController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.onInit();
  }

  /**
   * Runs when the instance of the class is initiated,
   * subscribes to event bus' events
   */
  onInit() {
    bus.subscribe('tasks-loaded', (state) => {
      this.createPage(state);
      this.model.setVisited();
    });
    bus.subscribe('tasks-updated', (state) => {
      this.createPage(state);
    });
    bus.subscribe('selection-all', (state) => {
      this.createPage(state);
    });
    bus.subscribe('add-task', () => this.createAddTaskModal());
    bus.subscribe('toggle-delete-mode', () => this.toggleDeleteMode());
    bus.subscribe(
      'page-changed',
      () => (this.model.state.isDeleteMode = false)
    );
  }

  /**
   * Renders page and attaches event listeners
   * @param {Object} state
   */
  createPage(state) {
    this.view.render(state);

    if (!this.model.getIsVisited()) {
      return;
    }

    const dom = this.view.getDOM();
    dom.addTaskBtn.addEventListener('click', () => this.createAddTaskModal());

    this.addSelectionTabsListeners(dom);
    this.addStatusTabsListeners();
    this.addPriorityTabsListeners();
    this.addTaskListeners();
    this.addGlobalListLinkListener();
  }

  /**
   * Adds event listeners to the status tabs
   */
  addStatusTabsListeners() {
    document.querySelectorAll('.tabs-item[data-status]').forEach((tab) => {
      tab.addEventListener('click', () => {
        this.model.setSortStatus(JSON.parse(tab.dataset.status));
      });
    });
  }

  /**
   * Adds event listeners to the priority tabs
   */
  addPriorityTabsListeners() {
    document.querySelectorAll('.tabs-item[data-priority]').forEach((tab) => {
      tab.addEventListener('click', () => {
        this.model.setSortPriority(JSON.parse(tab.dataset.priority));
      });
    });
  }

  /**
   * Adds event listener to the global list heading
   */
  addGlobalListLinkListener() {
    const link = document.querySelector('.global-list__link');

    link?.addEventListener('click', () => {
      this.view.toggleGlobalList();
    });
  }

  /**
   * Adds event listeners to the selection tabs
   * @param {Object} dom
   */
  addSelectionTabsListeners(dom) {
    dom.selectAllDaily?.addEventListener('click', () => {
      this.model.selectAllDaily();
    });
    dom.deselectAllDaily?.addEventListener('click', () => {
      this.model.deselectAllDaily();
    });
    dom.selectAllGlobal?.addEventListener('click', () => {
      this.model.selectAllGlobal();
    });
    dom.deselectAllGlobal?.addEventListener('click', () => {
      this.model.deselectAllGlobal();
    });
  }

  /**
   * Adds event listeners to the task DOM-elements
   */
  addTaskListeners() {
    document.getElementById('task-list').addEventListener('click', (e) => {
      if (!e.target.closest('.task')) {
        return;
      }

      const taskElement = e.target.closest('.task');
      const id = Number(taskElement.dataset.id);

      if (e.target.closest('.btn-up')) {
        this.model.moveToDaily(id);
      }
      if (e.target.closest('.btn-edit')) {
        this.createEditTaskModal(id);
      }
      if (e.target.closest('.btn-select')) {
        this.handleSelect(taskElement);
      }
      if (e.target.closest('.btn-delete')) {
        this.createDeleteModal(id);
      }
      if (e.target.closest('.btn-timer')) {
        this.handleTimerClick(id);
      }
    });
  }

  /**
   * Handles toggling of the delete-mode.
   *  * Does nothing if no tasks found.
   *  * If the delete mode is turned on and there are selected tasks
   *    opens 'Delete' modal window.
   *  * Toggles delete mode
   */
  toggleDeleteMode() {
    if (this.model.state.tasks.length === 0) {
      return;
    }

    if (this.model.state.selected.length) {
      this.createDeleteModal();
      return;
    }

    this.view.toggleDeleteModeButton();

    this.model.toggleDeleteMode();
  }

  /**
   * Handles the selection of the task
   * @param {HTMLElement} taskEl
   */
  handleSelect(taskEl) {
    const id = Number(taskEl.dataset.id);

    this.model.toggleSelection(id);

    this.view.toggleTaskSelection(taskEl);

    this.view.updateSelectedCounter(this.model.state.selected.length);
  }

  /**
   * Sets task's status to 'active' and then navigates to Timer page
   * @param {number} id - Id of task
   */
  handleTimerClick(id) {
    this.model.setTaskToActive(id).then(() => router.navigate('timer'));
  }

  /**
   * Renders 'Add task' modal window and attaches
   * corresponding event listeners
   */
  createAddTaskModal() {
    this.view.renderAddEditTaskModal();

    const dom = this.view.getAddEditTaskModalDOM();
    dom.btnSubmit.addEventListener('click', () => this.createTask());
    this.addTaskModalListeners(dom);
  }

  /**
   * Closes modal window on successful task creation
   */
  createTask() {
    this.model
      .createTask()
      .then(() => this.handleCloseModal())
      .catch((e) => alert(e));
  }

  /**
   * Renders 'Edit task' modal window and attaches
   * corresponding event listeners
   * @param {number} id - Id of task
   */
  createEditTaskModal(id) {
    const task = this.model.getTask(id);

    this.model.setTask(task);

    this.view.renderAddEditTaskModal(task);

    const dom = this.view.getAddEditTaskModalDOM();
    dom.btnSubmit.addEventListener('click', () => this.editTask());
    this.addTaskModalListeners(dom);
  }

  /**
   * Closes modal window on successful task editing
   */
  editTask() {
    this.model
      .editTask()
      .then(() => this.handleCloseModal())
      .catch((e) => alert(e));
  }

  /**
   * Renders 'Delete task(s)' modal window and attaches
   * corresponding event listeners
   * @param {number=} id - Id of task, optional parameter
   */
  createDeleteModal(id) {
    this.view.renderDeleteModal();

    const dom = this.view.getDeleteModalDOM();

    dom.btnCancel.addEventListener('click', () => {
      this.handleCloseModal();
    });
    dom.btnClose.addEventListener('click', () => {
      this.handleCloseModal();
    });
    dom.btnConfirm.addEventListener('click', () => {
      this.handleDeletion(id);
    });
  }

  /**
   * Handles successful deletion of task(s)
   * @param {number=} id - Id of task, optional parameter
   */
  handleDeletion(id) {
    this.model.deleteTasks(id).then(() => {
      this.handleCloseModal();
      this.view.deactivateDeleteModeButton();
      this.view.updateSelectedCounter(0);
    });
  }

  /**
   * Attaches event listeners to 'Add/Edit' modal window
   * @param dom
   */
  addTaskModalListeners(dom) {
    dom.form.title.addEventListener('input', (e) => {
      this.handleTitleInput(e);
    });
    dom.form.description.addEventListener('input', (e) => {
      this.handleDescriptionInput(e);
    });
    dom.form.category.addEventListener('input', (e) => {
      this.handleCategoryInput(e);
    });
    dom.form.deadline.addEventListener('change', (e) => {
      this.handleDeadlineInput(e);
    });
    dom.form.estimation.addEventListener('click', (e) => {
      this.handleEstimationInput(e);
    });
    dom.form.priority.addEventListener('input', (e) => {
      this.handlePriorityInput(e);
    });

    dom.btnClose.addEventListener('click', () => this.handleCloseModal());
  }

  /**
   * Handles closing of modal window
   */
  handleCloseModal() {
    this.view.closeModal();
    this.model.refreshTask();
  }

  /**
   * Handles input of task's title
   * @param {Event} e
   */
  handleTitleInput(e) {
    this.model.setTitle(e.target.value);
  }

  /**
   * Handles input of task's description
   * @param {Event} e
   */
  handleDescriptionInput(e) {
    this.model.setDescription(e.target.value);
  }

  /**
   * Handles input of task's category
   * @param {Event} e
   */
  handleCategoryInput(e) {
    this.model.setCategory(e.target.value);
  }

  /**
   * Handles input of task's deadline date
   * @param {Event} e
   */
  handleDeadlineInput(e) {
    this.model.setDeadline(e.target.dataset.value);
  }

  /**
   * Handles input of task's estimation
   * @param {Event} e
   */
  handleEstimationInput(e) {
    const { value } = e.target.dataset;
    this.view.setActiveEstimationItem(value);
    this.model.setEstimation(value);
  }

  /**
   * Handles input of task's priority
   * @param {Event} e
   */
  handlePriorityInput(e) {
    this.model.setPriority(e.target.value);
  }
}

export default TaskListController;
