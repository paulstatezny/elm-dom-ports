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
    offsetHeight: 40,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  };
}

/**
 * Saving globals that will be overwritten
 */

let originalWindow = {
  scrollTo: window.scrollTo
};

let originalDocument = {
  addEventListener: document.addEventListener,
  createElement: document.createElement
};

/**
 * Begin tests
 */

describe('dom-ports', () => {
  afterAll(() => {
    window.scrollTo = originalWindow.scrollTo
    document.addEventListener = originalDocument.addEventListener;
    document.createElement = originalDocument.createElement;
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
    test('adds an event listener for the given event to all matching DOM nodes', () => {
      port(mockPorts.addEventListener)(['.button', 'click', null]);

      expect(mockNodeList[0].addEventListener).toHaveBeenCalledWith('click', expect.anything(), expect.anything());
      expect(mockNodeList[1].addEventListener).toHaveBeenCalledWith('click', expect.anything(), expect.anything());
      expect(mockNodeList[2].addEventListener).toHaveBeenCalledWith('click', expect.anything(), expect.anything());
    });

    test('calls preventDefault if no options are given', () => {
      port(mockPorts.addEventListener)(['.button', 'click', null]);

      const listener = mockNodeList[0].addEventListener.mock.calls[0][1];
      const event = {preventDefault: jest.fn()};

      listener(event);

      expect(event.preventDefault.mock.calls.length).toEqual(1);
    });

    test('does not call preventDefault if specified not to in options', () => {
      port(mockPorts.addEventListener)(['.button', 'click', {preventDefault: false}]);

      const listener = mockNodeList[0].addEventListener.mock.calls[0][1];
      const event = {preventDefault: jest.fn()};

      listener(event);

      expect(event.preventDefault.mock.calls.length).toEqual(0);
    });

    test('calls stopPropagation if that is specified in the options', () => {
      port(mockPorts.addEventListener)(['.button', 'click', {stopPropagation: true}]);

      const listener = mockNodeList[0].addEventListener.mock.calls[0][1];
      const event = {stopPropagation: jest.fn()};

      listener(event);

      expect(event.stopPropagation.mock.calls.length).toEqual(1);
    });

    test('calls a return port in the form onEvent where Event is the given event with an upper first letter', () => {
      port(mockPorts.addEventListener)(['.button', 'paste', null]);

      const listener = mockNodeList[0].addEventListener.mock.calls[0][1];
      listener({preventDefault: jest.fn()});

      expect(mockPorts.onPaste.send.mock.calls.length).toEqual(1);
    });

    test('passes Elm HtmlElement and Event shaped objects to the return port', () => {
      port(mockPorts.addEventListener)(['.button', 'paste', null]);

      mockNodeList[0].checked = true;
      mockNodeList[0].clientHeight = 1;
      mockNodeList[0].clientWidth = 2;
      mockNodeList[0].content = '';
      mockNodeList[0].dataset = {foo: 'bar'};
      mockNodeList[0].htmlFor = 'test';
      mockNodeList[0].href = 'foo://bar';
      mockNodeList[0].id = 'testing_123';
      mockNodeList[0].innerHTML = '<b>yo</b>';
      mockNodeList[0].pathname = '/foo/bar-baz';
      mockNodeList[0].value = 'exceeding';

      const listener = mockNodeList[0].addEventListener.mock.calls[0][1];
      listener({
        preventDefault: jest.fn(),
        clientX: 3,
        clientY: 4,
        keyCode: 5
      });

      expect(mockPorts.onPaste.send).toHaveBeenCalledWith([
        expect.anything(),
        {
          checked: true,
          clientHeight: 1,
          clientWidth: 2,
          content: null,
          data: [['foo', 'bar']],
          for: 'test',
          href: 'foo://bar',
          id: 'testing_123',
          innerHtml: '<b>yo</b>',
          pathname: '/foo/bar-baz',
          value: 'exceeding'
        },
        {
          clientX: 3,
          clientY: 4,
          keyCode: 5,
          touchClientX: null,
          touchClientY: null
        }
      ]);
    });
  });

  describe('addClickListener', () => {
    test('adds a click listener for the given event to all matching DOM nodes', () => {
      port(mockPorts.addClickListener)(['.button', 'click', null]);

      expect(mockNodeList[0].addEventListener).toHaveBeenCalledWith('click', expect.anything(), expect.anything());
      expect(mockNodeList[1].addEventListener).toHaveBeenCalledWith('click', expect.anything(), expect.anything());
      expect(mockNodeList[2].addEventListener).toHaveBeenCalledWith('click', expect.anything(), expect.anything());
    });
  });

  describe('addSubmitListener', () => {
    beforeEach(() => {
      port(mockPorts.addSubmitListener)(['.my-form', ['name', 'email']]);
    });

    test('adds a submit listener for the given event to all matching DOM nodes', () => {
      expect(mockNodeList[0].addEventListener).toHaveBeenCalledWith('submit', expect.anything());
      expect(mockNodeList[1].addEventListener).toHaveBeenCalledWith('submit', expect.anything());
      expect(mockNodeList[2].addEventListener).toHaveBeenCalledWith('submit', expect.anything());
    });

    test('passes the data from the requested fields in the event listener', () => {
      const listener = mockNodeList[0].addEventListener.mock.calls[0][1];

      listener({
        currentTarget: {
          name: {value: 'Elon Musk'},
          email: {value: 'elon@tesla.com'},
        },
        preventDefault: jest.fn()
      });

      expect(mockPorts.onSubmit.send).toHaveBeenCalledWith([
        '.my-form',
        {
          name: 'Elon Musk',
          email: 'elon@tesla.com',
        }
      ]);
    });
  });

  describe('addClass', () => {
    beforeEach(() => {
      port(mockPorts.addClass)(['.foo', 'foo--active-class']);
    });

    test('the given class is added', () => {
      expect(mockDomUtils.addClass).toHaveBeenCalledWith('foo--active-class');
    });

    test('adds the class to matching DOM nodes', () => {
      expect(mockAddClassCurried).toHaveBeenCalledWith(mockNodeList[0], expect.anything(), expect.anything());
      expect(mockAddClassCurried).toHaveBeenCalledWith(mockNodeList[1], expect.anything(), expect.anything());
      expect(mockAddClassCurried).toHaveBeenCalledWith(mockNodeList[2], expect.anything(), expect.anything());
    });
  });

  describe('removeClass', () => {
    beforeEach(() => {
      port(mockPorts.removeClass)(['.bar', 'bar--active-class']);
    });

    test('the given class is added', () => {
      expect(mockDomUtils.removeClass).toHaveBeenCalledWith('bar--active-class');
    });

    test('adds the class to matching DOM nodes', () => {
      expect(mockRemoveClassCurried).toHaveBeenCalledWith(mockNodeList[0], expect.anything(), expect.anything());
      expect(mockRemoveClassCurried).toHaveBeenCalledWith(mockNodeList[1], expect.anything(), expect.anything());
      expect(mockRemoveClassCurried).toHaveBeenCalledWith(mockNodeList[2], expect.anything(), expect.anything());
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
    let mockTemplate;

    beforeEach(() => {
      mockTemplate = {
        content: {
          firstChild: {}
        }
      };

      document.createElement = jest.fn(() => mockTemplate);

      mockNode.appendChild = jest.fn();

      port(mockPorts.appendChild)(['.foo', '<span>hi</span>']);
    });

    test('creates a DOM node from the rawHtml and appends the first child to the node', () => {
      expect(mockNode.appendChild).toHaveBeenCalledWith(mockTemplate.content.firstChild);
    });
  });

  describe('removeNodes', () => {
    test('calls node.parentNode.removeChild(node) for matching DOM nodes', () => {
      port(mockPorts.removeNodes)('.no-longer-needed');

      expect(mockNodeList[0].parentNode.removeChild).toHaveBeenCalledWith(mockNodeList[0]);
      expect(mockNodeList[1].parentNode.removeChild).toHaveBeenCalledWith(mockNodeList[1]);
      expect(mockNodeList[2].parentNode.removeChild).toHaveBeenCalledWith(mockNodeList[2]);
    });
  });

  describe('click', () => {
    test('simulates a click on matching DOM nodes', () => {
      port(mockPorts.click)('button.auto-click-for-some-reason');

      expect(mockNodeList[0].click).toHaveBeenCalled();
      expect(mockNodeList[1].click).toHaveBeenCalled();
      expect(mockNodeList[2].click).toHaveBeenCalled();
    });
  });

  describe('focus', () => {
    test('focused on the first matching DOM node', () => {
      port(mockPorts.focus)('input.of-interest');

      expect(mockNode.focus).toHaveBeenCalled();
    });
  });

  describe('windowScrollTo', () => {
    test('calls window.scrollTo(x,y) with the given coordinates', () => {
      window.scrollTo = jest.fn();
      port(mockPorts.windowScrollTo)([350, 100.05]);
      expect(window.scrollTo).toHaveBeenCalledWith(350, 100.05);
    });
  });

  describe('windowScrollToSelector', () => {
    test('scrolls to the offsetTop of the found DOM node', () => {
      window.scrollTo = jest.fn();
      mockNode.offsetTop = 1024;
      port(mockPorts.windowScrollToSelector)('#some_selector');
      expect(window.scrollTo).toHaveBeenCalledWith(0, 1024);
    });
  });

  describe('preventTouchScroll', () => {
    beforeEach(() => {
      document.addEventListener = jest.fn();
      port(mockPorts.preventTouchScroll)();
    });

    test('adds a touchmove event listener on document', () => {
      expect(document.addEventListener).toHaveBeenCalledWith('touchmove', expect.anything());
    });

    test('the event listener prevents default', () => {
      const listener = document.addEventListener.mock.calls[0][1];
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
      expect(document.removeEventListener).toHaveBeenCalledWith('touchmove', expect.anything());
    });

    test('the event listener it removes prevents default', () => {
      const listener = document.removeEventListener.mock.calls[0][1];
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

      expect(mockNodeList[0].style.setProperty).toHaveBeenCalledWith('visibility', 'hidden');
      expect(mockNodeList[1].style.setProperty).toHaveBeenCalledWith('visibility', 'hidden');
      expect(mockNodeList[2].style.setProperty).toHaveBeenCalledWith('visibility', 'hidden');
    });
  });

  describe('removeCssProperty', () => {
    test('removes the given CSS property on all matching DOM nodes', () => {
      port(mockPorts.removeCssProperty)(['.button', 'visibility']);

      expect(mockNodeList[0].style.removeProperty).toHaveBeenCalledWith('visibility');
      expect(mockNodeList[1].style.removeProperty).toHaveBeenCalledWith('visibility');
      expect(mockNodeList[2].style.removeProperty).toHaveBeenCalledWith('visibility');
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

      expect(mockPorts.nodePosition.send).toHaveBeenCalledWith([
        '.foo',
        expect.objectContaining({
          top: expect.any(Number),
          right: expect.any(Number),
          bottom: expect.any(Number),
          left: expect.any(Number)
        })
      ]);
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
      expect(mockPorts.nodePosition.send).toHaveBeenCalledWith([
        expect.anything(),
        expect.objectContaining({top: 60})
      ]);
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
      expect(mockPorts.nodePosition.send).toHaveBeenCalledWith([
        expect.anything(),
        expect.objectContaining({left: 111})
      ]);
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
      expect(mockPorts.nodePosition.send).toHaveBeenCalledWith([
        expect.anything(),
        expect.objectContaining({right: 211})
      ]);
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
      expect(mockPorts.nodePosition.send).toHaveBeenCalledWith([
        expect.anything(),
        expect.objectContaining({bottom: 135})
      ]);
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

      expect(mockPorts.querySelectorResponse.send).toHaveBeenCalledWith([
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
