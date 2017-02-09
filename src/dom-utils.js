/**
 * Get a DOM node list.
 *
 * @param  {String} selector DOM selector
 * @return {Array}           An Array of DOM nodes rather than a NodeList. (Improves browser compatibility.)
 */
function getNodeList(selector) {
  return selector === 'window'   ? [window] :
         selector === 'document' ? [document] :
         nodeListToArray(document.querySelectorAll(selector));
}

/**
 * Get a single DOM node.
 *
 * @param  {String} selector DOM selector
 * @return {HTMLElement|null}
 */
function getNode(selector) {
  return getNodeList(selector).pop();
}

/**
 * Convert a NodeList object into a vanilla Array of Nodes that can be iterated over.
 *
 * @param  {NodeList} nodeList
 * @return {Array[Node]}
 */
function nodeListToArray(nodeList) {
  const nodeArray = [];

  for (let index in nodeList) {
    if (nodeList.hasOwnProperty(index) && index !== 'length') {
      nodeArray.push(nodeList[index]);
    }
  }

  return nodeArray;
}

const addClass = (className) => (node) => {
  const alreadyAdded = node.className.split(/\s+/).indexOf(className) > -1;

  if (!alreadyAdded) {
    node.className += ' ' + className;
  }
};

const removeClass = (className) => (node) => {
  let regExp = new RegExp(
    `(^|\\s)${escapeRegExp(className)}\\s*`,
    'g'
  );

  node.className = node.className.replace(regExp, ' ');
};

/**
 * Credit: http://stackoverflow.com/a/6969486/1772152
 */
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

module.exports = {
  addClass: addClass,
  removeClass: removeClass,
  getNodeList: getNodeList,
  getNode: getNode
};
