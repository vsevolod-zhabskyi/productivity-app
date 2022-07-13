import Highcharts from 'highcharts';
import reportTemplate from './components/report.handlebars';
import { ReportSortInterval } from '../../utils/ReportSortInterval';
import { ReportSortType } from '../../utils/ReportSortType';
import { router } from '../../router';
import COLOR from '../../utils/colors';

/**
 * View part of Report component that is
 * responsible for rendering and attaching
 * listeners to DOM
 */
class ReportView {
  constructor(model) {
    this.model = model;

    this.reportTemplate = reportTemplate;

    this.tab = null;

    this.sortInterval = null;
    this.sortType = null;
  }

  /**
   * Renders page with loader and saves passed tab to this.tab.
   * If no tab specified - redirects to default path for reports
   * @param {string=} tab
   */
  initialRender(tab) {
    if (!tab) {
      router.redirect('reports/day/tasks');
      return;
    }

    this.tab = tab;

    this.sortInterval = tab.split('/')[0];
    this.sortType = tab.split('/')[1];

    document.getElementById('content').innerHTML = this.reportTemplate({
      dataLoading: true,
    });

    this.updateRouterListeners();

    this.addLinkListeners();
  }

  /**
   * Attaches event listeners to links
   */
  addLinkListeners() {
    document.getElementById('go-to-tasks').addEventListener('click', () => {
      router.navigate('task-list');
    });
  }

  /**
   * Attaches event listeners to tabs
   */
  updateRouterListeners() {
    document.querySelectorAll('[data-interval]').forEach((el) => {
      const { interval } = el.dataset;

      el.setAttribute('routerLink', `reports/${interval}/${this.sortType}`);
    });

    document.querySelectorAll('[data-type]').forEach((el) => {
      const { type } = el.dataset;

      el.setAttribute('routerLink', `reports/${this.sortInterval}/${type}`);
    });

    router.updateListeners();

    router.setActiveLink();
  }

  /**
   * Renders page for opened tab
   */
  render() {
    let data;

    switch (this.tab) {
      case 'day/tasks':
        data = this.model.getData(ReportSortInterval.DAY, ReportSortType.TASKS);
        break;
      case 'day/pomodoros':
        data = this.model.getData(
          ReportSortInterval.DAY,
          ReportSortType.POMODOROS
        );
        break;
      case 'week/tasks':
        data = this.model.getData(
          ReportSortInterval.WEEK,
          ReportSortType.TASKS
        );
        break;
      case 'week/pomodoros':
        data = this.model.getData(
          ReportSortInterval.WEEK,
          ReportSortType.POMODOROS
        );
        break;
      case 'month/tasks':
        data = this.model.getData(
          ReportSortInterval.MONTH,
          ReportSortType.TASKS
        );
        break;
      case 'month/pomodoros':
        data = this.model.getData(
          ReportSortInterval.MONTH,
          ReportSortType.POMODOROS
        );
        break;
      default:
        router.redirect('reports/day/tasks');
        return;
    }

    document.getElementById('content').innerHTML = this.reportTemplate({
      data,
    });

    this.renderChart(data);

    this.updateRouterListeners();

    this.addLinkListeners();
  }

  /**
   * Returns string with first letter uppercase
   * @param {string} str
   * @returns {string}
   */
  firstLetterUppercase(str) {
    return str[0].toUpperCase() + str.slice(1);
  }

  /**
   * Returns array of items counts of specified priority grouped by dates
   * @param {DateToItemsCounts[]} data - Array of all items counts
   * grouped by dates
   * @param {string} priority - Priority by which items are grouped
   * @returns {number[]}
   */
  getDataOfPriority(data, priority) {
    return data.map((day) => day.data[priority]);
  }

  /**
   * Returns series item needed for grouped column chart
   * @param {DateToItemsCounts[]} data - Data about amount of items
   * of priorities grouped by dates
   * @param {string} priority - Priority by which items are grouped
   * @param {string} stack - Stack name of series
   * @returns {{stack: string, data: number[], name: string}}
   */
  getWeekSeries(data, priority, stack) {
    return {
      stack,
      name: this.firstLetterUppercase(priority),
      data: this.getDataOfPriority(data, priority),
    };
  }

  /**
   * Returns series item needed for stacked column chart
   * @param {DateToItemsCounts[]} data - Array of items of specified
   * priority grouped by date
   * @param {string} priority - Priority by which items are grouped
   * @returns {{data: number[], name: string}}
   */
  getMonthSeries(data, priority) {
    return {
      name: this.firstLetterUppercase(priority),
      data: this.getDataOfPriority(data, priority),
    };
  }

  /**
   * Renders chart
   * @param {DateToItemsCounts[]} data - Data about amount of items
   * of priorities grouped by dates
   */
  renderChart(data) {
    const sortType = this.firstLetterUppercase(this.sortType);

    let categories = [];
    let series = [];
    let plotOptions = {};
    let tickPositioner;

    switch (this.sortInterval) {
      case ReportSortInterval.DAY: {
        categories = ['Urgent', 'High', 'Middle', 'Low', 'Failed'];

        const dayData = data[0].data;
        series = [
          {
            name: 'Urgent',
            data: [dayData.urgent, null, null, null, null],
          },
          {
            name: 'High',
            data: [null, dayData.high, null, null, null],
          },
          {
            name: 'Middle',
            data: [null, null, dayData.middle, null, null],
          },
          {
            name: 'Low',
            data: [null, null, null, dayData.low, null],
          },
          {
            name: 'Failed',
            data: [null, null, null, null, dayData.failed],
          },
        ];

        plotOptions = {
          column: {
            grouping: false,
          },
          series: {
            centerInCategory: true,
            cursor: 'pointer',
          },
        };
        break;
      }
      case ReportSortInterval.WEEK: {
        categories = data.map((data) =>
          new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })
        );

        series = [
          this.getWeekSeries(data, 'urgent', 'success'),
          this.getWeekSeries(data, 'high', 'success'),
          this.getWeekSeries(data, 'middle', 'success'),
          this.getWeekSeries(data, 'low', 'success'),
          this.getWeekSeries(data, 'failed', 'failed'),
        ];

        plotOptions = {
          column: {
            stacking: 'normal',
          },
          series: {
            cursor: 'pointer',
          },
        };
        break;
      }
      case ReportSortInterval.MONTH: {
        categories = [];
        for (let i = 1; i <= 30; i++) {
          categories.push(i);
        }

        series = [
          this.getMonthSeries(data, 'urgent'),
          this.getMonthSeries(data, 'high'),
          this.getMonthSeries(data, 'middle'),
          this.getMonthSeries(data, 'low'),
          this.getMonthSeries(data, 'failed'),
        ];

        plotOptions = {
          column: {
            stacking: 'normal',
          },
          series: {
            cursor: 'pointer',
          },
        };

        tickPositioner = function () {
          const positions = [];
          let tick = Math.floor(this.dataMin);

          for (tick; tick - 1 <= this.dataMax; tick++) {
            positions.push(tick);
          }

          return positions;
        };
      }
    }

    Highcharts.chart('report__chart', {
      chart: {
        type: 'column',
        backgroundColor: COLOR.BACKGROUND,
        style: {
          fontFamily: 'PT Sans',
          fontSize: '0.55rem',
          fontWeight: 400,
        },
      },
      title: {
        text: '',
      },
      colors: [COLOR.URGENT, COLOR.HIGH, COLOR.MIDDLE, COLOR.LOW, COLOR.FAILED],
      xAxis: {
        categories,
        lineWidth: 1,
        lineColor: COLOR.AXIS,

        tickPositioner,
      },
      yAxis: {
        title: {
          text: '',
        },
        lineWidth: 1,
        lineColor: COLOR.AXIS,
        allowDecimals: false,
        endOnTick: false,
        tickInterval: 1,
      },

      tooltip: {
        formatter() {
          return `
            <div class="chart-tooltip__body">
              ${this.series.name.toUpperCase()}<br/>
              ${sortType}: ${this.y}
            </div>`;
        },
        style: {
          opacity: 0.9,
        },
        borderWidth: 0,
        backgroundColor: COLOR.TOOLTIP_BG,
        shadow: false,
        outside: true,
        useHTML: true,
      },

      plotOptions,

      series,
    });
  }
}

export default ReportView;
