/**
 * Mocks to be used in tests, initialized in beforeEach
 */

let mockDomUtils = {};
let mockAddClassCurried;
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

/**
 * Begin tests
 */

describe('dom-ports', () => {
  beforeEach(() => {
    // domUtils mocking
    mockNodeList = [
      {},
      {},
      {}
    ];

    mockNode = {};

    mockAddClassCurried = jest.fn();

    mockDomUtils.getNodeList = jest.fn(() => mockNodeList);
    mockDomUtils.getNode = jest.fn(() => mockNode);
    mockDomUtils.addClass = jest.fn(() => mockAddClassCurried);

    domPorts = require('../src/dom-ports');

    // Elm app ports object mocking
    mockPorts = {
      addEventListener: subscribePort(),
      addClickListener: subscribePort(),
      addSubmitListener: subscribePort(),
      addClass: subscribePort(),
      removeClass: subscribePort(),
      toggleClass: subscribePort(),
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

    test('requests nodes with the given selector', () => {
      expect(mockCall(mockDomUtils.getNodeList)).toEqual(['.foo']);
    });

    test('adds the class to every DOM node', () => {
      expect(mockCall(mockAddClassCurried, 0)[0]).toEqual(mockNodeList[0]);
      expect(mockCall(mockAddClassCurried, 1)[0]).toEqual(mockNodeList[1]);
      expect(mockCall(mockAddClassCurried, 2)[0]).toEqual(mockNodeList[2]);
    });
  });

  describe('removeClass', () => {
  });

  describe('toggleClass', () => {
  });

  describe('innerHtml', () => {
  });

  describe('appendChild', () => {
  });

  describe('removeNodes', () => {
  });

  describe('click', () => {
  });

  describe('focus', () => {
  });

  describe('windowScrollTo', () => {
  });

  describe('windowScrollToSelector', () => {
  });

  describe('preventTouchScroll', () => {
  });

  describe('allowTouchScroll', () => {
  });

  describe('setProperty', () => {
  });

  describe('setCssProperty', () => {
  });

  describe('removeCssProperty', () => {
  });

  describe('setDataAttribute', () => {
  });

  describe('getNodePosition', () => {
  });

  describe('querySelector', () => {
  });

  describe('preloadImage', () => {
  });
});
