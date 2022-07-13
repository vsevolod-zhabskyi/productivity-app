import './header.less';

import { bus } from '../../EventBus';
import headerTemplate from './header.handlebars';

/**
 * View part of Header that is responsible for interacting with DOM
 **/
class HeaderView {
  constructor() {
    this.headerTemplate = headerTemplate;
    this.isOnTop = null;
    window.addEventListener('scroll', () => this.setHeaderView());
  }

  /**
   * Renders header to the DOM and adds event listeners to the buttons
   */
  render() {
    const isTaskListPage = this.isTaskListPage();
    const html = this.headerTemplate({ notTaskListPage: !isTaskListPage });

    this.removeHeader();

    document.getElementById('root').insertAdjacentHTML('afterbegin', html);

    this.header = document.querySelector('.header');

    this.addTaskBtn = document.getElementById('btn-add-task-header');
    this.deleteModeBtn = document.getElementById('btn-delete-mode-header');

    this.addBtnListeners();
  }

  /**
   * Defines if current page is a task-list page
   * @returns {boolean}
   */
  isTaskListPage() {
    return location.pathname.includes('task-list');
  }

  /**
   * Adds event listeners to header buttons
   */
  addBtnListeners() {
    this.addTaskBtn?.addEventListener('click', () => {
      bus.post('add-task');
    });

    this.deleteModeBtn?.addEventListener('click', () => {
      bus.post('toggle-delete-mode');
    });
  }

  /**
   * Removes existing header from DOM
   */
  removeHeader() {
    this.header?.remove();
  }

  /**
   * Sets header view and applies appropriate class to header element
   */
  setHeaderView() {
    if (window.scrollY <= 0 === this.isOnTop) return;

    this.isOnTop = !this.isOnTop;

    if (this.isOnTop) {
      this.header.classList.remove('header-scroll');
      this.addTaskBtn?.classList.add('non-visible');
    } else {
      this.header.classList.add('header-scroll');
      this.addTaskBtn?.classList.remove('non-visible');
    }
  }
}

export default HeaderView;
