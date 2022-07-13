import { bus } from './EventBus';

/**
 * Router. Allows executing callbacks depending on current pathname
 */
class Router {
  constructor() {
    this.routes = [];
    this.defaultPath = '';

    window.addEventListener('DOMContentLoaded', () => {
      this.loaded();
      this.updateListeners();
    });
  }

  /**
   * Executes when the DOMContentLoaded event fires
   */
  loaded() {
    const currentPath = this.getCurrentPath();
    this.check(currentPath);
  }

  /**
   * Attaches event listeners to elements with routerLink attribute.
   * Event handled brings the value store in routerLink argument and
   * navigates ti this path when the element is clicked
   */
  updateListeners() {
    document.querySelectorAll('[routerLink]').forEach((el) =>
      el.addEventListener('click', (e) => {
        const link = e.target
          .closest('[routerLink]')
          .getAttribute('routerLink');
        this.navigate(link);
      })
    );
  }

  /**
   * Highlights all elements which routerLink attribute value
   * is contained in current pathname
   */
  setActiveLink() {
    document.querySelectorAll('[routerLink]').forEach((el) => {
      const routerLink = el.getAttribute('routerLink');

      if (location.pathname.includes(routerLink)) {
        el.classList.add('active');
      }
    });
  }

  /**
   * Adds path - callback pair. Passed callback will be called when
   * current pathname is equal to passed path value
   * @param {string} path
   * @param {Function} callback
   */
  add(path, callback) {
    path = this.clearSlashes(path);
    this.routes.push({ path, callback });
  }

  /**
   * Navigates to passed path
   * @param {string} path
   */
  navigate(path) {
    path = this.getAbsolutePath(path);
    history.pushState(null, null, path);
  }

  /**
   * Navigates to passed path. Replaces last history record
   * @param {string} path
   */
  redirect(path) {
    path = this.getAbsolutePath(path);
    history.replaceState(null, null, path);
  }

  /**
   * Returns absolute path of the passed relative path
   * @param {string} path
   * @returns {string}
   */
  getAbsolutePath(path) {
    const { protocol, host } = location;
    return `${protocol}//${host}/${path}`;
  }

  /**
   * Returns current pathname
   * @returns {string}
   */
  getCurrentPath() {
    return this.clearSlashes(location.pathname);
  }

  /**
   * Starts watching location.pathname value and checks when it changes
   */
  listen() {
    const self = this;
    let currentPath = self.getCurrentPath();

    const fn = () => {
      if (currentPath !== self.getCurrentPath()) {
        currentPath = self.getCurrentPath();
        self.check(currentPath);
      }
    };

    clearInterval(this.interval);
    this.interval = setInterval(fn, 50);
  }

  /**
   * If callback for passed path is found, executes it.
   * Else redirects to default path
   * @param {string} path
   */
  check(path) {
    const route = this.routes.find((r) => r.path === path);

    if (route) {
      route.callback();
      bus.post('page-changed');
      this.updateListeners();
      this.setActiveLink();
    } else {
      this.redirect(this.defaultPath);
    }
  }

  /**
   * Sets default path to which page will be redirected
   * if no callback was found
   * @param {string} path
   * @param {Function} callback
   */
  setDefault(path, callback) {
    this.add(path, callback);
    this.defaultPath = path;
  }

  /**
   * Returns path without side slashes
   * @param {string} path
   * @returns {string}
   */
  clearSlashes(path) {
    return path.replace(/\/$/, '').replace(/^\//, '');
  }
}

export const router = new Router();
