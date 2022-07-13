import HeaderView from "./HeaderView";
import HeaderController from "./HeaderController";
jest.mock('../../router');

describe('header view', () => {
  const view = new HeaderView();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('constructor', () => {
    expect(view).toBeTruthy();
  });

  test('render', () => {
    const spy = jest.spyOn(view, 'addBtnListeners');
    view.render();
    expect(spy).toHaveBeenCalled()
  });

  test('isTaskListPage works correctly', () => {
    expect(view.isTaskListPage()).toBeFalsy();
  });

  test('addBtnListeners adds event listeners', () => {
    const addEventListener = jest.fn();
    view.addTaskBtn = {
      addEventListener
    };
    view.deleteModeBtn = {
      addEventListener
    };
    view.addBtnListeners();
    expect(addEventListener.mock.calls.length).toBe(2)
  });

  test('removeHeader removes header', () => {
    view.header = {
      remove: jest.fn()
    }
    view.removeHeader();
    expect(view.header.remove).toHaveBeenCalled()
  });

  test('setHeaderView changes styles', () => {
    window.scrollY = 100;
    view.isOnTop = true;
    view.header = {
      classList: {
        add: jest.fn()
      }
    }
    view.addTaskBtn = {
      classList: {
        remove: jest.fn()
      }
    }
    view.setHeaderView();
    expect(view.header.classList.add).toBeCalledWith('header-scroll');
  });
});

describe('header controller', () => {
  test('constructor', () => {
    const controller = new HeaderController();
    expect(controller).toBeTruthy();
  })
});
