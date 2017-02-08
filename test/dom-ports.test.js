/**
 * Mocks to be used in tests, initialized in beforeEach
 */

let mockDomUtils = {};
let mockAddClassCurried;
let mockRemoveClassCurried;
let mockPorts;
let mockNode;
let mockNodeList;
let domPorts;

jest.setMock('../src/dom-utils', mockDomUtils);

/**
 * Test setup functions
 */

function portResponse(portFn, responseNumber) {
  const call = portFn.send.mock.calls[0];

  if (!call) {
    throw `call number ${responseNumber || 0} doesn't exist`;
  }

  return call[responseNumber || 0];
}

function mockCall(mockFn, callNumber) {
  return mockFn.mock.calls[callNumber || 0];
}

function port(portFn) {
  return portFn.subscribe.mock.calls[0][0];
}

function subscribePort() {
  return {subscribe: jest.fn()};
}

function sendPort() {
  return {send: jest.fn()};
}

function mockDomNode() {
  return {
    click: jest.fn(),
    focus: jest.fn(),
    parentNode: {
      removeChild: jest.fn()
    },
    style: {
      setProperty: jest.fn(),
      removeProperty: jest.fn()
    },
    dataset: {},
    offsetTop: 10,
    offsetLeft: 20,
    offsetWidth: 30,
    offsetHeight: 40
  };
}

/**
 * Saving globals that will be overwritten
 */

let originalWindow = {
  scrollTo: window.scrollTo
};

let originalDocument = {
  addEventListener: document.addEventListener
};

/**
 * Begin tests
 */

describe('dom-ports', () => {
  afterAll(() => {
    window.scrollTo = originalWindow.scrollTo
    document.addEventListener = originalDocument.addEventListener;
  });

  beforeEach(() => {
    // domUtils mocking
    mockNodeList = [
      mockDomNode(),
      mockDomNode(),
      mockDomNode()
    ];

    mockNode = mockDomNode();

    mockAddClassCurried = jest.fn();
    mockRemoveClassCurried = jest.fn();

    mockDomUtils.getNodeList = jest.fn(() => mockNodeList);
    mockDomUtils.getNode = jest.fn(() => mockNode);
    mockDomUtils.addClass = jest.fn(() => mockAddClassCurried);
    mockDomUtils.removeClass = jest.fn(() => mockRemoveClassCurried);

    domPorts = require('../src/dom-ports');

    // Elm app ports object mocking
    mockPorts = {
      addEventListener: subscribePort(),
      addClickListener: subscribePort(),
      addSubmitListener: subscribePort(),
      addClass: subscribePort(),
      removeClass: subscribePort(),
      innerHtml: subscribePort(),
      appendChild: subscribePort(),
      removeNodes: subscribePort(),
      click: subscribePort(),
      focus: subscribePort(),
      windowScrollTo: subscribePort(),
      windowScrollToSelector: subscribePort(),
      preventTouchScroll: subscribePort(),
      allowTouchScroll: subscribePort(),
      setProperty: subscribePort(),
      setCssProperty: subscribePort(),
      removeCssProperty: subscribePort(),
      setDataAttribute: subscribePort(),
      getNodePosition: subscribePort(),
      querySelector: subscribePort(),
      preloadImage: subscribePort(),

      onSubmit: sendPort(),
      onClick: sendPort(),
      onChange: sendPort(),
      onInput: sendPort(),
      onKeyup: sendPort(),
      onFocus: sendPort(),
      onBlur: sendPort(),
      onPaste: sendPort(),
      onMousedown: sendPort(),
      onTouchstart: sendPort(),
      onTouchmove: sendPort(),
      onTouchend: sendPort(),
      onResize: sendPort(),
      innerHtmlReplaced: sendPort(),
      nodePosition: sendPort(),
      querySelectorResponse: sendPort(),
      appendChildSuccess: sendPort()
    };

    domPorts.register(mockPorts);
  });

  describe('addEventListener', () => {
  });

  describe('addClickListener', () => {
  });

  describe('addSubmitListener', () => {
  });

  describe('addClass', () => {
    beforeEach(() => {
      port(mockPorts.addClass)(['.foo', 'foo--active-class']);
    });

    test('the given class is added', () => {
      expect(mockCall(mockDomUtils.addClass)).toEqual(['foo--active-class']);
    });

    test('adds the class to matching DOM nodes', () => {
      expect(mockCall(mockAddClassCurried, 0)[0]).toEqual(mockNodeList[0]);
      expect(mockCall(mockAddClassCurried, 1)[0]).toEqual(mockNodeList[1]);
      expect(mockCall(mockAddClassCurried, 2)[0]).toEqual(mockNodeList[2]);
    });
  });

  describe('removeClass', () => {
    beforeEach(() => {
      port(mockPorts.removeClass)(['.bar', 'bar--active-class']);
    });

    test('the given class is added', () => {
      expect(mockCall(mockDomUtils.removeClass)).toEqual(['bar--active-class']);
    });

    test('adds the class to matching DOM nodes', () => {
      expect(mockCall(mockRemoveClassCurried, 0)[0]).toEqual(mockNodeList[0]);
      expect(mockCall(mockRemoveClassCurried, 1)[0]).toEqual(mockNodeList[1]);
      expect(mockCall(mockRemoveClassCurried, 2)[0]).toEqual(mockNodeList[2]);
    });
  });

  describe('innerHtml', () => {
    test('node.innerHTML is set to the given HTML string for matching DOM nodes', () => {
      port(mockPorts.innerHtml)(['#some_id', '<span>Hello test world</span>']);

      expect(mockNodeList[0].innerHTML).toEqual('<span>Hello test world</span>');
      expect(mockNodeList[1].innerHTML).toEqual('<span>Hello test world</span>');
      expect(mockNodeList[2].innerHTML).toEqual('<span>Hello test world</span>');
    });
  });

  describe('appendChild', () => {
  });

  describe('removeNodes', () => {
    test('calls node.parentNode.removeChild(node) for matching DOM nodes', () => {
      port(mockPorts.removeNodes)('.no-longer-needed');

      expect(mockCall(mockNodeList[0].parentNode.removeChild)).toEqual([mockNodeList[0]]);
      expect(mockCall(mockNodeList[1].parentNode.removeChild)).toEqual([mockNodeList[1]]);
      expect(mockCall(mockNodeList[2].parentNode.removeChild)).toEqual([mockNodeList[2]]);
    });
  });

  describe('click', () => {
    test('simulates a click on matching DOM nodes', () => {
      port(mockPorts.click)('button.auto-click-for-some-reason');

      expect(mockCall(mockNodeList[0].click)).toEqual([]); // Empty array denotes a call with 0 args
      expect(mockCall(mockNodeList[1].click)).toEqual([]);
      expect(mockCall(mockNodeList[2].click)).toEqual([]);
    });
  });

  describe('focus', () => {
    test('focused on the first matching DOM node', () => {
      port(mockPorts.focus)('input.of-interest');

      expect(mockCall(mockNode.focus)).toEqual([]); // Empty array denotes a call with 0 args
    });
  });

  describe('windowScrollTo', () => {
    test('calls window.scrollTo(x,y) with the given coordinates', () => {
      window.scrollTo = jest.fn();
      port(mockPorts.windowScrollTo)([350, 100.05]);
      expect(mockCall(window.scrollTo)).toEqual([350, 100.05]);
    });
  });

  describe('windowScrollToSelector', () => {
    test('scrolls to the offsetTop of the found DOM node', () => {
      window.scrollTo = jest.fn();
      mockNode.offsetTop = 1024;
      port(mockPorts.windowScrollToSelector)('#some_selector');
      expect(mockCall(window.scrollTo)).toEqual([0, 1024]);
    });
  });

  describe('preventTouchScroll', () => {
    beforeEach(() => {
      document.addEventListener = jest.fn();
      port(mockPorts.preventTouchScroll)();
    });

    test('adds a touchmove event listener on document', () => {
      expect(mockCall(document.addEventListener)[0]).toEqual('touchmove');
    });

    test('the event listener prevents default', () => {
      const listener = mockCall(document.addEventListener)[1];
      const mockEvent = {preventDefault: jest.fn()};

      listener(mockEvent);

      expect(mockEvent.preventDefault.mock.calls).toHaveLength(1);
    });
  });

  describe('allowTouchScroll', () => {
    beforeEach(() => {
      document.removeEventListener = jest.fn();
      port(mockPorts.allowTouchScroll)();
    });

    test('removes the touchmove event listener on document', () => {
      expect(mockCall(document.removeEventListener)[0]).toEqual('touchmove');
    });

    test('the event listener it removes prevents default', () => {
      const listener = mockCall(document.removeEventListener)[1];
      const mockEvent = {preventDefault: jest.fn()};

      listener(mockEvent);

      expect(mockEvent.preventDefault.mock.calls).toHaveLength(1);
    });
  });

  describe('setProperty', () => {
    test('sets the given property on all matching DOM nodes', () => {
      port(mockPorts.setProperty)(['.some-selector', 'fooBarBaz', 'testing 123']);

      expect(mockNodeList[0].fooBarBaz).toEqual('testing 123');
      expect(mockNodeList[1].fooBarBaz).toEqual('testing 123');
      expect(mockNodeList[2].fooBarBaz).toEqual('testing 123');
    });
  });

  describe('setCssProperty', () => {
    test('sets the given CSS property on all matching DOM nodes', () => {
      port(mockPorts.setCssProperty)(['.button', 'visibility', 'hidden']);

      expect(mockCall(mockNodeList[0].style.setProperty)).toEqual(['visibility', 'hidden']);
      expect(mockCall(mockNodeList[1].style.setProperty)).toEqual(['visibility', 'hidden']);
      expect(mockCall(mockNodeList[2].style.setProperty)).toEqual(['visibility', 'hidden']);
    });
  });

  describe('removeCssProperty', () => {
    test('removes the given CSS property on all matching DOM nodes', () => {
      port(mockPorts.removeCssProperty)(['.button', 'visibility']);

      expect(mockCall(mockNodeList[0].style.removeProperty)).toEqual(['visibility']);
      expect(mockCall(mockNodeList[1].style.removeProperty)).toEqual(['visibility']);
      expect(mockCall(mockNodeList[2].style.removeProperty)).toEqual(['visibility']);
    });
  });

  describe('setDataAttribute', () => {
    test('sets the given data attribute on all matching DOM nodes', () => {
      port(mockPorts.setDataAttribute)(['.menu-item', 'is-menu-item', 'true']);

      expect(mockNodeList[0].dataset['is-menu-item']).toEqual('true');
      expect(mockNodeList[1].dataset['is-menu-item']).toEqual('true');
      expect(mockNodeList[2].dataset['is-menu-item']).toEqual('true');
    });
  });

  describe('getNodePosition', () => {
    test('sends the selector and a Position record to ports.nodePosition', () => {
      port(mockPorts.getNodePosition)('.foo');

      expect(portResponse(mockPorts.nodePosition)[0]).toEqual('.foo');

      // Position record has top, right, bottom, and left properties that are Numbers
      expect(portResponse(mockPorts.nodePosition)[1]).toEqual(
        expect.objectContaining({
          top: expect.any(Number),
          right: expect.any(Number),
          bottom: expect.any(Number),
          left: expect.any(Number)
        })
      );
    });

    test('the top is a sum of the offsetTop of the node and its parents', () => {
      mockNode.offsetTop = 10;
      mockNode.offsetParent = {
        offsetParent: {
          offsetTop: 20
        },
        offsetTop: 30
      };

      port(mockPorts.getNodePosition)('.foo');
      expect(portResponse(mockPorts.nodePosition)[1].top).toEqual(60);
    });

    test('the left is a sum of the offsetLeft of the node and its parents', () => {
      mockNode.offsetLeft = 1;
      mockNode.offsetParent = {
        offsetParent: {
          offsetLeft: 100
        },
        offsetLeft: 10
      };

      port(mockPorts.getNodePosition)('.foo');
      expect(portResponse(mockPorts.nodePosition)[1].left).toEqual(111);
    });

    test('the right is a sum of the computed left plus the offsetWidth of the node', () => {
      mockNode.offsetLeft = 1;
      mockNode.offsetWidth = 100;
      mockNode.offsetParent = {
        offsetParent: {
          offsetLeft: 100
        },
        offsetLeft: 10
      };

      port(mockPorts.getNodePosition)('.foo');
      expect(portResponse(mockPorts.nodePosition)[1].right).toEqual(211);
    });

    test('the bottom is a sum of the computed left plus the offsetWidth of the node', () => {
      mockNode.offsetTop = 10;
      mockNode.offsetHeight = 100;
      mockNode.offsetParent = {
        offsetParent: {
          offsetTop: 5
        },
        offsetTop: 20
      };

      port(mockPorts.getNodePosition)('.foo');
      expect(portResponse(mockPorts.nodePosition)[1].bottom).toEqual(135);
    });
  });

  describe('querySelector', () => {
    test('calls ports.querySelectorResponse with the selector and an HtmlElement record of the first matching node', () => {
      mockNode.checked = true;
      mockNode.clientHeight = 123;
      mockNode.clientWidth = 456;
      mockNode.dataset = {foo: 'bar'};
      mockNode.htmlFor = 'search_button';
      mockNode.href = 'https://github.com/foo/bar/baz';
      mockNode.id = 'test_id';
      mockNode.innerHTML = '<span>hey</span>';
      mockNode.pathname = '/foo/bar/baz';
      mockNode.value = 'Phoenix, AZ';

      port(mockPorts.querySelector)('.magical-button');

      expect(portResponse(mockPorts.querySelectorResponse)).toEqual([
        '.magical-button',
        {
          checked: true,
          clientHeight: 123,
          clientWidth: 456,
          content: null,
          data: [['foo', 'bar']],
          for: 'search_button',
          href: 'https://github.com/foo/bar/baz',
          id: 'test_id',
          innerHtml: '<span>hey</span>',
          pathname: '/foo/bar/baz',
          value: 'Phoenix, AZ'
        }
      ]);
    });
  });
});
