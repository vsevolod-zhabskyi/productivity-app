import { getDatabase, ref, set, child, get, remove } from 'firebase/database';
import { TaskStatus } from './utils/TaskStatus';

/**
 * @typedef {Object} Task
 * @property {number} id - ID
 * @property {string} title - Title
 * @property {string} description - Description
 * @property {number} category - Category id
 * @property {number} priority - Priority id
 * @property {number} status - Status id
 * @property {number} estimation - Estimation in pomodoros
 * @property {number} completedCount - Amount of completed pomodoros
 * @property {number} failedPomodoros - Amount of failed pomodoros
 * @property {string} createDate - Date in JSON format
 * @property {string} deadlineDate - Date in JSON format
 * @property {string} completeDate - Date in JSON format
 */

/**
 * Settings service that is responsible for interaction
 * with the Firebase Realtime Database
 */
class TaskService {
  /**
   * Resolves all tasks
   * @returns {Promise<Task[]>}
   */
  static getAll() {
    const dbRef = ref(getDatabase());

    return get(child(dbRef, 'tasks')).then((snapshot) => {
      if (snapshot.exists()) {
        const tasks =
          snapshot.val() instanceof Array
            ? snapshot.val().filter(Boolean)
            : Object.values(snapshot.val());

        return Promise.resolve(tasks);
      }
    });
  }

  /**
   * Resolves active task
   * @returns {Promise<Task>}
   */
  static getActive() {
    return TaskService.getAll().then((tasks) =>
      tasks.find((t) => t.status === TaskStatus.ACTIVE)
    );
  }

  /**
   * Edits task with id equals to passed task's id
   * @param {Task} task
   * @returns {Promise<Task>}
   */
  static set(task) {
    const db = getDatabase();

    return set(ref(db, `tasks/${task.id}`), task).then(() =>
      Promise.resolve(task)
    );
  }

  /**
   * Deletes task with passed id
   * @param {number} id - Id of task which is being deleted
   * @returns {Promise<number>}
   */
  static delete(id) {
    const db = getDatabase();

    return remove(ref(db, `tasks/${id}`)).then(() => Promise.resolve(id));
  }

  /**
   * Edits tasks collection. Used as multiple deletion alternative
   * @param {Task[]} tasks
   * @returns {Promise<Task[]>}
   */
  static update(tasks) {
    const db = getDatabase();

    return set(ref(db, 'tasks/'), tasks).then(() => Promise.resolve(tasks));
  }
}

export default TaskService;
