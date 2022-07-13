import { router } from './router';

import './components/notification';
import { renderHeader } from './components/header';
import { renderSettings } from './pages/settings';
import { renderTaskList } from './pages/task-list';
import { renderReport } from './pages/report';
import { renderTimer } from './pages/timer';

import 'webpack-jquery-ui';
import 'webpack-jquery-ui/css';
import 'webpack-jquery-ui/datepicker';

import 'assets/less/main.less';
import './jquery.css';
import './firebaseConfig';
import './handlebarsHelpers.js';
import './plugins';

renderHeader();

router.add('settings', () => renderSettings());
router.add('settings/categories', () => renderSettings('categories'));
router.add('settings/pomodoros', () => renderSettings('pomodoros'));

router.add('reports', () => renderReport());
router.add('reports/day/tasks', () => renderReport('day/tasks'));
router.add('reports/day/pomodoros', () => renderReport('day/pomodoros'));
router.add('reports/week/tasks', () => renderReport('week/tasks'));
router.add('reports/week/pomodoros', () => renderReport('week/pomodoros'));
router.add('reports/month/tasks', () => renderReport('month/tasks'));
router.add('reports/month/pomodoros', () => renderReport('month/pomodoros'));

router.add('timer', () => renderTimer());

router.setDefault('task-list', () => renderTaskList());

router.listen();
