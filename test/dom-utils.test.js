let domUtils = require('../src/dom-utils');

let originalDocument = {
  querySelectorAll: document.querySelectorAll
};

let mockNodeList;

function mockDomNode() {
  return {};
}

describe('dom-utils', () => {
  afterAll(() => {
    document.querySelectorAll = originalDocument.querySelectorAll;
  });

  beforeEach(() => {
    mockNodeList = [
      mockDomNode(),
      mockDomNode(),
      mockDomNode()
    ];

    document.querySelectorAll = jest.fn(() => mockNodeList);
  });

  describe('getNodeList', () => {
    test('returns window in an array if the selector is "window"', () => {
      expect(domUtils.getNodeList("window")).toEqual([window]);
    });

    test('returns document in an array if the selector is "document"', () => {
      expect(domUtils.getNodeList("document")).toEqual([document]);
    });

    test('returns an array of nodes from the NodeList returned by querySelectorAll', () => {
      expect(domUtils.getNodeList(".foo")).toEqual([
        mockNodeList[0],
        mockNodeList[1],
        mockNodeList[2]
      ]);
    });
  });

  describe('getNode', () => {
    test('returns window if the selector is "window"', () => {
      expect(domUtils.getNode("window")).toEqual(window);
    });

    test('returns document if the selector is "document"', () => {
      expect(domUtils.getNode("document")).toEqual(document);
    });

    test('returns the first node from the NodeList returned by querySelectorAll', () => {
      expect(domUtils.getNode(".bar")).toEqual(mockNodeList[0]);
    });
  });

  describe('addClass', () => {
    test('does nothing if the class is already added', () => {
      const node = {className: 'foo bar'};

      domUtils.addClass('foo')(node);
      expect(node.className).toEqual('foo bar');
    });

    test('appends the class to the end of node.className if it is not already part of className', () => {
      const node = {className: 'foo bar'};

      domUtils.addClass('baz')(node);
      expect(node.className).toEqual('foo bar baz');
    });
  });

  describe('removeClass', () => {
    test('does nothing if the class is not part of the className', () => {
      const node = {className: 'foo bar'};

      domUtils.removeClass('baz')(node);
      expect(node.className).toEqual('foo bar');
    });

    test('removes the class from node.className if it is part of className', () => {
      const node = {className: 'foo bar baz--zz qux'};

      domUtils.removeClass('baz--zz')(node);
      expect(node.className).toEqual('foo bar qux');
    });
  });
});
