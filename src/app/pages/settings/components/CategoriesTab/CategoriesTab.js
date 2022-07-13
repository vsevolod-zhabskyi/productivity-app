import './CategoriesTab.less';
import categoriesTabTemplate from './CategoriesTab.handlebars';

/**
 * Responsible for rendering the categories tab
 */
class CategoriesTab {
  constructor() {
    this.template = categoriesTabTemplate;
    this.render();
  }

  /**
   * Renders categories tab
   */
  render() {
    document.getElementById('tab-content').innerHTML = this.template();
    document.querySelectorAll('.tabs-item').forEach((el) => {
      el.classList.remove('active');
    });
    document.getElementById('tab-categories').classList.add('active');
  }
}

export default CategoriesTab;
