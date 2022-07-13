import { TaskStatus } from '../../utils/TaskStatus';
import TaskService from '../../taskService';
import { StateStatus } from '../../utils/StateStatus';
import { TaskCategory } from '../../utils/TaskCategory';
import { bus } from '../../EventBus';

/**
 * Model part of the TaskList component that is responsible
 * for interacting with and storing of component's data and
 * for saving it to and getting from the server
 */
class TaskListModel {
  constructor() {
    this.state = {
      isVisited: !!sessionStorage.getItem('isVisited'),
      isDailyListUsed: !!sessionStorage.getItem('isDailyListUsed'),

      tempTask: {
        title: '',
        description: '',
        category: null,
        deadlineDate: null,
        estimation: 0,
        priority: null,
      },

      tasks: [],

      sortedTasks: {
        daily: [],
        global: {
          all: [],
          work: [],
          education: [],
          hobby: [],
          sport: [],
          other: [],
          length: null,
        },
        length: null,
      },

      todoLength: null,
      doneLength: null,
      dailyLength: null,
      globalLength: null,

      status: StateStatus.TODO,
      priority: null,

      isDeleteMode: false,
      selected: [],
    };

    sessionStorage.setItem('isVisited', 'true');
  }

  /**
   * Toggles selection of task with passed id
   * @param {number} id
   */
  toggleSelection(id) {
    if (this.state.selected.includes(id)) {
      this.state.selected = this.state.selected.filter((value) => value !== id);
    } else {
      this.state.selected.push(id);
    }
  }

  /**
   * Marks all daily tasks as selected
   */
  selectAllDaily() {
    const ids = this.state.sortedTasks.daily.map((t) => t.id);

    ids.forEach((id) => {
      if (!this.state.selected.includes(id)) {
        this.state.selected.push(id);
      }
    });

    bus.post('selection-all', this.state);
  }

  /**
   * Clears the selection of all daily tasks
   */
  deselectAllDaily() {
    const ids = this.state.sortedTasks.daily.map((t) => t.id);

    ids.forEach((id) => {
      if (this.state.selected.includes(id)) {
        this.state.selected = this.state.selected.filter((val) => val !== id);
      }
    });

    bus.post('selection-all', this.state);
  }

  /**
   * Marks all global tasks as selected
   */
  selectAllGlobal() {
    const ids = this.state.sortedTasks.global.all.map((t) => t.id);

    ids.forEach((id) => {
      if (!this.state.selected.includes(id)) {
        this.state.selected.push(id);
      }
    });

    bus.post('selection-all', this.state);
  }

  /**
   * Clears the selection of all global tasks
   */
  deselectAllGlobal() {
    const ids = this.state.sortedTasks.global.all.map((t) => t.id);

    ids.forEach((id) => {
      if (this.state.selected.includes(id)) {
        this.state.selected = this.state.selected.filter((val) => val !== id);
      }
    });

    bus.post('selection-all', this.state);
  }

  /**
   * Sorts task from this.state.tasks
   * and saves them to this.state.sortedTasks
   */
  sortTasks() {
    const allTasks = [...this.state.tasks].sort(
      (a, b) => a.createDate - b.createDate
    );

    let dailyTasks;
    let globalTasks;

    if (this.state.status === StateStatus.TODO) {
      const todoTasks = allTasks.filter(
        (task) =>
          task.status === TaskStatus.DAILY_LIST ||
          task.status === TaskStatus.GLOBAL_LIST
      );
      this.state.todoLength = todoTasks.length;

      dailyTasks = allTasks.filter(
        (task) => task.status === TaskStatus.DAILY_LIST
      );
      this.state.dailyLength = dailyTasks.length;

      if (this.state.priority === null) {
        globalTasks = allTasks.filter(
          (task) => task.status === TaskStatus.GLOBAL_LIST
        );
      } else {
        globalTasks = allTasks.filter(
          (task) =>
            task.status === TaskStatus.GLOBAL_LIST &&
            task.priority === this.state.priority
        );
      }
      this.state.globalLength = allTasks.filter(
        (task) => task.status === TaskStatus.GLOBAL_LIST
      ).length;
    } else if (this.state.status === StateStatus.DONE) {
      const doneTasks = allTasks.filter(
        (task) => task.status === TaskStatus.COMPLETED
      );
      this.state.doneLength = doneTasks.length;

      dailyTasks = allTasks.filter(
        (task) =>
          task.status === TaskStatus.COMPLETED &&
          this.isToday(new Date(task.completeDate))
      );
      this.state.dailyLength = dailyTasks.length;

      if (this.state.priority === null) {
        globalTasks = allTasks.filter(
          (task) =>
            task.status === TaskStatus.COMPLETED &&
            !this.isToday(new Date(task.completeDate))
        );
      } else {
        globalTasks = allTasks.filter(
          (task) =>
            task.status === TaskStatus.COMPLETED &&
            !this.isToday(new Date(task.completeDate)) &&
            task.priority === this.state.priority
        );
      }
      this.state.globalLength = allTasks.filter(
        (task) =>
          task.status === TaskStatus.COMPLETED &&
          !this.isToday(new Date(task.completeDate))
      ).length;
    }

    const workTasks = globalTasks.filter(
      (task) => Number(task.category) === TaskCategory.WORK
    );
    const educationTasks = globalTasks.filter(
      (task) => Number(task.category) === TaskCategory.EDUCATION
    );
    const hobbyTasks = globalTasks.filter(
      (task) => Number(task.category) === TaskCategory.HOBBY
    );
    const sportTasks = globalTasks.filter(
      (task) => Number(task.category) === TaskCategory.SPORT
    );
    const otherTasks = globalTasks.filter(
      (task) => Number(task.category) === TaskCategory.OTHER
    );

    this.state.sortedTasks = {
      daily: dailyTasks,
      global: {
        all: globalTasks,
        work: workTasks,
        education: educationTasks,
        hobby: hobbyTasks,
        sport: sportTasks,
        other: otherTasks,
        length: globalTasks.length,
      },
      length: dailyTasks.length + globalTasks.length,
    };
  }

  /**
   * Toggles delete mode by switching this.state.isDeleteMode field
   */
  toggleDeleteMode() {
    this.state.isDeleteMode = !this.state.isDeleteMode;
    bus.post('tasks-updated', this.state);
  }

  /**
   * Returns whether the passed date is today
   * @param {Date} date
   * @returns {boolean}
   */
  isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Sets priority by which global tasks are sorted
   * @param priority
   */
  setSortPriority(priority) {
    this.state.priority = priority;
    this.sortTasks();
    bus.post('tasks-updated', this.state);
  }

  /**
   * Sets status of which tasks are shown (to-do / completed)
   * @param status
   */
  setSortStatus(status) {
    this.state.status = status;
    this.state.priority = null;
    this.sortTasks();
    bus.post('tasks-updated', this.state);
  }

  /**
   * Sets this.state.tempTask to passed task
   * @param {Task} task
   */
  setTask(task) {
    this.state.tempTask = task;
  }

  /**
   * Returns task by id
   * @param {number} id
   * @returns {Task}
   */
  getTask(id) {
    return this.state.tasks.find((t) => t.id === id);
  }

  /**
   * Sets task's status with passed id to 'daily'
   * @param {number} id
   * @returns {Promise<Task|void>}
   */
  moveToDaily(id) {
    const task = this.getTask(id);

    task.status = TaskStatus.DAILY_LIST;

    this.state.isDailyListUsed = true;
    sessionStorage.setItem('isDailyListUsed', 'true');

    return TaskService.set(task)
      .then((task) => {
        this.sortTasks();
        bus.post('tasks-updated', this.state);
        bus.post('notify-info', 'Your task was moved to the daily task list');
        return task;
      })
      .catch(() =>
        bus.post(
          'notify-error',
          'Unable to move task to the daily list. Try again later'
        )
      );
  }

  /**
   * Sets task's status with passed id to 'active'
   * @param {number} id
   * @returns {Promise<void>}
   */
  setTaskToActive(id) {
    const task = this.getTask(id);

    task.status = TaskStatus.ACTIVE;

    return TaskService.set(task).catch(() =>
      bus.post('notify-error', 'Unable to go to timer. Try again later')
    );
  }

  /**
   * Creates task from this.state.tempTask if the last one is valid
   * and saves it to the server
   * @returns {Promise<Task|void>}
   */
  createTask() {
    if (!this.isTaskValid()) {
      return Promise.reject(new Error('Task is not valid'));
    }

    const task = this.state.tempTask;
    task.id =
      this.state.tasks.length === 0
        ? 0
        : Math.max(...this.state.tasks.map((t) => Number(t.id))) + 1;
    task.status = TaskStatus.GLOBAL_LIST;
    task.createDate = new Date().toJSON();
    task.completeDate = '';
    task.completedCount = 0;
    task.failedPomodoros = 0;

    return TaskService.set(task)
      .then((task) => {
        this.state.tasks.push(task);
        this.sortTasks();
        bus.post('tasks-updated', this.state);
        bus.post('notify-success', 'Your task was successfully saved!');
        return task;
      })
      .catch(() =>
        bus.post('notify-error', 'Unable to save your task. Try again later')
      );
  }

  /**
   * Saves edited task to the server if it is valid
   * @returns {Promise<Task|void>}
   */
  editTask() {
    if (!this.isTaskValid()) {
      return Promise.reject(new Error('Task is not valid'));
    }

    return TaskService.set(this.state.tempTask)
      .then((task) => {
        this.sortTasks();
        bus.post('tasks-updated', this.state);
        bus.post('notify-success', 'Your task was successfully saved!');
        return task;
      })
      .catch(() =>
        bus.post('notify-error', 'Unable to save your task. Try again later')
      );
  }

  /**
   * If no selected tasks was found - deletes task with this id.
   * Else if this.state.selected array is not empty - pushes passed
   * id to this array and deletes all selected tasks
   * @param {number=} id - Id of task, optional
   * @returns {Promise<void>}
   */
  deleteTasks(id) {
    if (id !== undefined && this.state.selected.length === 0) {
      return TaskService.delete(id)
        .then((id) => {
          this.state.tasks = this.state.tasks.filter((t) => t.id !== id);
          this.sortTasks();
          bus.post('notify-success', 'Your task was successfully removed!');
          bus.post('tasks-updated', this.state);
        })
        .catch(() =>
          bus.post('notify-error', 'Unable to remove task. Try again later')
        );
    }

    this.state.selected.push(id);

    return TaskService.update(
      this.state.tasks.filter((t) => {
        return !this.state.selected.includes(t.id);
      })
    )
      .then((tasks) => {
        this.state.isDeleteMode = false;
        this.state.selected = [];
        this.state.tasks = tasks;
        this.sortTasks();
        bus.post('notify-success', 'Your tasks were successfully removed!');
        bus.post('tasks-updated', this.state);
      })
      .catch(() =>
        bus.post('notify-error', 'Unable to remove tasks. Try again later')
      );
  }

  /**
   * Sets this.state.isVisited field to true if the page was visited before
   */
  setVisited() {
    this.state.isVisited = !!sessionStorage.getItem('isVisited');
  }

  /**
   * Gets tasks from the server and saves them to this.state.tasks field
   */
  getTasks() {
    TaskService.getAll()
      .then((tasks) => {
        if (!tasks?.length) {
          bus.post('tasks-loaded', this.state);
          return;
        }
        this.state.tasks = tasks;
        this.sortTasks();
        bus.post('tasks-loaded', this.state);
      })
      .catch(() => {
        bus.post('notify-error', 'Unable to load your tasks. Try again later');
      });
  }

  /**
   * Returns true if this.state.tempTask is valid
   * @returns {boolean}
   */
  isTaskValid() {
    if (
      this.state.tempTask.title === '' ||
      this.state.tempTask.description === '' ||
      this.state.tempTask.category === null ||
      this.state.tempTask.deadlineDate === null ||
      this.state.tempTask.estimation === 0 ||
      this.state.tempTask.priority === null
    ) {
      return false;
    }
    return true;
  }

  /**
   * Refreshes this.state.tempTask field
   */
  refreshTask() {
    this.state.tempTask = {
      title: '',
      description: '',
      category: null,
      deadlineDate: null,
      estimation: 0,
      priority: null,
    };
  }

  /**
   * Sets this.state.tempTask's title
   * @param {string} title
   */
  setTitle(title) {
    this.state.tempTask.title = title;
  }

  /**
   * Sets this.state.tempTask's description
   * @param {string} description
   */
  setDescription(description) {
    this.state.tempTask.description = description;
  }

  /**
   * Sets this.state.tempTask's category
   * @param {number} category
   */
  setCategory(category) {
    this.state.tempTask.category = Number(category);
  }

  /**
   * Sets this.state.tempTask's deadlineDate
   * @param {string} deadlineDate - Date in JSON format
   */
  setDeadline(deadlineDate) {
    this.state.tempTask.deadlineDate = deadlineDate;
  }

  /**
   * Sets this.state.tempTask's estimation
   * @param {number} estimation
   */
  setEstimation(estimation) {
    this.state.tempTask.estimation = Number(estimation);
  }

  /**
   * Sets this.state.tempTask's priority
   * @param {number} priority
   */
  setPriority(priority) {
    this.state.tempTask.priority = Number(priority);
  }

  /**
   * Returns true if the page was visited before
   * @returns {boolean}
   */
  getIsVisited() {
    return this.state.isVisited;
  }
}

export default TaskListModel;
