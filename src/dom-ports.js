module.exports = {
  register: register,
  samplePortName: "addEventListener"
};

const domUtils = require("./dom-utils");

/**
 * Subscribe the given Elm app ports to all DOM ports from the Elm DomPorts module.
 *
 * @param {Object}   ports  Ports object from an Elm app
 * @param {Function} log    Function to log ports for the given Elm app
 */
function register(ports, log) {
  log = log || function() {};

  // event listeners
  const addListener = ([selector, event, options]) => addEventListener(selector, event, options);

  ports.addEventListener.subscribe(addListener);
  ports.addClickListener.subscribe(selector => addListener([selector, "click"]));
  ports.addSubmitListener.subscribe(([selector, fields]) => addSubmitListener(selector, fields));

  // class
  ports.addClass.subscribe(addClass);
  ports.removeClass.subscribe(removeClass);
  ports.toggleClass.subscribe(toggleClass);

  // DOM Node addition/removal
  ports.innerHtml.subscribe(innerHtml);
  ports.appendChild.subscribe(appendChild);
  ports.removeNodes.subscribe(removeNodes);

  // click (on something)
  ports.click.subscribe(click);

  // focus
  ports.focus.subscribe(focus);

  // scroll
  ports.windowScrollTo.subscribe(windowScrollTo);
  ports.windowScrollToSelector.subscribe(windowScrollToSelector);
  ports.preventTouchScroll.subscribe(preventTouchScroll);
  ports.allowTouchScroll.subscribe(allowTouchScroll);

  // arbitrary properties
  ports.setProperty.subscribe(setProperty);
  ports.setCssProperty.subscribe(setCssProperty);
  ports.removeCssProperty.subscribe(removeCssProperty);
  ports.setDataAttribute.subscribe(setDataAttribute);

  // DOM inspection
  ports.getNodePosition.subscribe(getNodePosition);
  ports.querySelector.subscribe(querySelector);

  // Preloading
  ports.preloadImage.subscribe(preloadImage);

  /**
   * Find DOM nodes and notify the Elm app whenever the given event is fired for any of them.
   *
   * @param {String} selector DOM selector
   * @param {String} event    The name of the DOM event, e.g. "click" or "submit"
   */
  function addEventListener(selector, event, options) {
    log("addEventListener", selector, event, options);
    const returnEvent = "on" + event.charAt(0).toUpperCase() + event.slice(1);
    const nodes = domUtils.getNodeList(selector);

    nodes.forEach(node => {
      if (! node.addEventListener) {
        throwMissingAddEventListenerError(
          "Cannot add event listener "
            + event
            + " to node with selector "
            + selector
            + "; node.addEventListener is not a function",
          node
        );
      }

      node.addEventListener(event, e => {
        if (!options || options.preventDefault) {
          e.preventDefault();
        }

        if (options && options.stopPropagation) {
          e.stopPropagation();
        }

        const nodeRecord = toNodeRecord(node);
        const eventRecord = toEventRecord(e);
        log(returnEvent, selector, nodeRecord, eventRecord);

        ports[returnEvent].send([selector, nodeRecord, eventRecord]);
      }, false)
    });
  }

  /**
  * Add a submit listener to a form(s)
  *
  * @param {String}        DOM selector
  * @param {Array[String]} List of inputs names
  */
  function addSubmitListener(selector, fields) {
    log("addSubmitListener", selector, fields);

    domUtils.getNodeList(selector).forEach(node => {
      if (! node.addEventListener) {
        throwMissingAddEventListenerError(
          "Cannot add submit listener to node with selector "
            + selector
            + "; node.addEventListener is not a function",
          node
        );
      }

      node.addEventListener("submit", e => {
        e.preventDefault();

        const payload = fields.reduce((acc, field) => {
          const node = e.currentTarget[field];

          acc[field.toLowerCase()] = node.type === "checkbox"
            ? node.checked
            : node.value;

          return acc;
        }, {});

        log("onSubmit", selector, payload);

        ports.onSubmit.send([selector, payload]);
      });
    });
  }

  /**
   * Add a class to all DOM nodes that match the given selector.
   *
   * @param {String} selector  DOM selector
   * @param {String} className The class to add
   */
  function addClass([selector, className]) {
    log("addClass", selector, className);

    domUtils.getNodeList(selector).forEach(domUtils.addClass(className));
  }

  /**
   * Remove a class from all DOM nodes that match the given selector.
   *
   * @param  {String} selector  DOM selector
   * @param  {String} className The class to remove
   */
  function removeClass([selector, className]) {
    log("removeClass", selector, className);

    domUtils.getNodeList(selector).forEach(domUtils.removeClass(className));
  }

  /**
   * Toggles a class from all DOM nodes that match the given selector.
   *
   * @param  {String} selector  DOM selector
   * @param  {String} className The class to toggle
   */
  function toggleClass([selector, className]) {
    log("toggleClass", selector, className);

    domUtils.getNodeList(selector).forEach(node => {
      const alreadyAdded = node.className.split(/\s+/).indexOf(className) > -1;

      if (alreadyAdded) {
        removeClass([selector, className]);
      } else {
        addClass([selector, className]);
      }
    });
  }

  /**
   * Replace the innerHtml of all DOM nodes that match the given selector with the given rawHtml.
   *
   * @param  {String} selector DOM selector
   * @param  {String} rawHtml  HTML represented as a string
   */
  function innerHtml([selector, rawHtml]) {
    log(
      "innerHtml",
      selector,
      rawHtml === ""
        ? ""
        : "\n"
          + rawHtml.substring(0, 200)
          + (rawHtml.length > 200
               ? "..."
               : "")
    );

    domUtils.getNodeList(selector).forEach(node => {
      node.innerHTML = rawHtml;
    });

    ports.innerHtmlReplaced.send(selector);
  }

  /**
   * Append the given HTML as a child of the `parentSelector` node.
   *
   * Does not work in Internet Explorer.
   *
   * @param  {String} parentSelector DOM selector for the container of the `rawHtml`
   * @param  {String} rawHtml        HTML represented as a string (should have a single root node, or else failure might occur)
   */
  function appendChild([parentSelector, rawHtml]) {
    log("appendChild", parentSelector, rawHtml);

    const node = domUtils.getNode(parentSelector);

    if (!node) {
      log("appendChild [parent not found]", parentSelector, rawHtml);
      return;
    }

    const template = document.createElement("template");
    template.innerHTML = rawHtml;

    node.appendChild(template.content.firstChild);

    log("appendChildSuccess", parentSelector, rawHtml);
    ports.appendChildSuccess.send([parentSelector, rawHtml]);
  }

  /**
   * Remove all DOM nodes that match the given selector from the document.
   *
   * @param  {String} selector DOM selector
   */
  function removeNodes(selector) {
    log("removeNodes", selector);

    domUtils.getNodeList(selector).forEach(node => {
      if (!node.parentNode) {
        return;
      }

      node.parentNode.removeChild(node);
    });
  }

  /**
   * Click on all elements matching the given selector.
   *
   * @param  {String} selector
   */
  function click(selector) {
    log("click", selector);

    domUtils.getNodeList(selector).forEach(node => node.click());
  }

  /**
   * Focus on the first DOM node matching the given selector.
   *
   * @param  {String} selector
   */
  function focus(selector) {
    log("focus", selector);

    const node = domUtils.getNode(selector);

    if (node) {
      node.focus();
    }
  }

  /**
   * Scroll the window to the given coordinates.
   *
   * @param {Number} x Horizontal Coordinate
   * @param {Number} y Vertical Coordinate
   */
  function windowScrollTo([x, y]) {
    log("windowScrollTo", x, y);

    window.scrollTo(x, y);
  }

  /**
   * Scroll the window to the element with the given selector.
   *
   * @param {String} selector
   */
  function windowScrollToSelector(selector) {
    log("windowScrollToSelector", selector);

    const node = domUtils.getNode(selector);

    if (!node) {
      log("windowScrollToSelector [node not found]", selector);
      return;
    }

    window.scrollTo(0, node.offsetTop);
  }

  /**
   * Prevent the screen from scrolling on touch events (swiping the page up/down).
   */
  function preventTouchScroll() {
    log("preventTouchScroll");

    if (! document.addEventListener) {
      throwMissingAddEventListenerError("Cannot preventTouchScroll; document.addEventListener is not a function");
    }

    document.addEventListener("touchmove", preventDefault);
  }

  /**
   * Stop preventing the screen to scrolling on touch events (swiping the page up/down).
   */
  function allowTouchScroll() {
    log("allowTouchScroll");

    document.removeEventListener("touchmove", preventDefault);
  }

  /**
   * Set an arbitrary property on all DOM nodes (HtmlElement objects) that match the given selector.
   *
   * @param {String} selector DOM selector
   * @param {String} property The property to set; see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
   * @param {String} value    The value to assign to that property
   */
  function setProperty([selector, property, value]) {
    log("setProperty", selector, property, value);

    domUtils.getNodeList(selector).forEach(node => {
      node[property] = value;
    });
  }

  /**
   * Set a CSS property on all DOM nodes (HtmlElement objects) that match the given selector.
   *
   * @param {String} selector DOM selector
   * @param {String} property The CSS property to set; see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
   * @param {String} value    The value to assign to that property
   */
  function setCssProperty([selector, property, value]) {
    log("setCssProperty", selector, property, value);

    domUtils.getNodeList(selector).forEach(node => {
      node.style.setProperty(property, value); // node.style is a CSSStyleDeclaration object
    });
  }

  /**
   * Remove a CSS property on all DOM nodes (HtmlElement objects) that match the given selector.
   *
   * @param {String} selector DOM selector
   * @param {String} property The CSS property to remove; see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
   */
  function removeCssProperty([selector, property]) {
    log("removeCssProperty", selector, property);

    domUtils.getNodeList(selector).forEach(node => {
      node.style.removeProperty(property); // node.style is a CSSStyleDeclaration object
    });
  }

  /**
   * Set a data attribute on all HTML elements matching the given selector.
   *
   *
   * @param {String} selector DOM selector
   * @param {String} key      The key of the data attribute (a camel-cased version of what would appear in HTML; e.g. "fooBar" for `data-foo-bar`)
   * @param {String} value    The value to assign to that data attribute
   */
  function setDataAttribute([selector, key, value]) {
    log("setDataAttribute", selector, key, value);

    domUtils.getNodeList(selector).forEach(node => {
      node.dataset[key] = value;
    });
  }

  /**
   * Send the Elm app the offset position of the first DOM node matching the given selector.
   *
   * @param  {String} selector DOM selector
   */
  function getNodePosition(selector) {
    log("getNodePosition", selector);

    const node = domUtils.getNode(selector);

    if (!node) {
      log("getNodePosition [not found]", selector);
      return;
    }

    const positionRecord = toPositionRecord(node);

    log("nodePosition", selector, positionRecord);
    ports.nodePosition.send([selector, positionRecord]);
  }

  /**
   * Send the Elm app an HtmlElement record of the first DOM node matching the given selector.
   *
   * @param  {String} selector DOM selector
   */
  function querySelector(selector) {
    log("querySelector", selector);

    const node = domUtils.getNode(selector);

    if (!node) {
      log("querySelector [not found]", selector);
      return;
    }

    const nodeRecord = toNodeRecord(node);
    log("querySelectorResponse", selector, nodeRecord);
    ports.querySelectorResponse.send([selector, nodeRecord]);
  }

  /**
   * Preload an image at the given URL.
   *
   * @param  {String} url
   */
  function preloadImage(url) {
    log("preloadImage", url);

    new Image().src = url;
  }
}

/**
 * Convert an HtmlElement to an object matching the DomPorts HtmlElement record type alias.
 *
 * @param  {HtmlElement} node The DOM node; see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
 * @return {Object}
 */
function toNodeRecord(node) {
  const nodeRecord = {
    checked: node.checked || null,
    clientHeight: node.clientHeight || null,
    clientWidth: node.clientWidth || null,
    content: node.content || null,
    data: Object.keys(node.dataset || {}).map(
      key => [key, node.dataset[key]]
    ), // (name, value) tuple list
    for: node.htmlFor || null,
    href: node.href || null,
    id: node.id || null,
    innerHtml: node.innerHTML || null,
    pathname: node.pathname || null,
    value: node.value || null,
  };

  // Firefox throws an Error when JSON serializing an object with a reference to itself
  // and `window.content === window` in Firefox
  if (nodeRecord.content === window) {
    nodeRecord.content = null;
  }

  return nodeRecord;
}

/**
 * Convert an Event to an object matching the DomPorts Event record type alias.
 *
 * @param  {Event} event Event object; see https://developer.mozilla.org/en-US/docs/Web/API/Event
 * @return {Object}
 */
function toEventRecord(event) {
  return {
    clientX: event.clientX || null,
    clientY: event.clientY || null,
    keyCode: event.keyCode || null,
    touchClientX: event.targetTouches
      && event.targetTouches[0]
      && event.targetTouches[0].clientX
      || null,
    touchClientY: event.targetTouches
      && event.targetTouches[0]
      && event.targetTouches[0].clientY
      || null,
  };
}

/**
 * Convert an HtmlElement to an object matching the DomPorts Position record type alias.
 *
 * @param  {HtmlElement} node The DOM node; see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
 * @return {Object}
 */
function toPositionRecord(node) {
  const top = sumNodePropertyWithAncestors("offsetTop", 0, node);
  const left = sumNodePropertyWithAncestors("offsetLeft", 0, node);

  return {
    top: top,
    right: left + node.offsetWidth,
    bottom: top + node.offsetHeight,
    left: left,
  };
}

/**
 * Traverse a DOM node's direct ancestors and sum all of the values from the given property.
 *
 * @param  {String}      property Name of a property of an HTMLElement
 * @param  {Number}      sum      Total accumulated value of the property
 * @param  {HTMLElement} node     The current node from which to extract the property
 * @return {Number}
 */
function sumNodePropertyWithAncestors(property, sum, node) {
  const parent = node.offsetParent;

  if (!parent) {
    return sum + node[property];
  }

  return sumNodePropertyWithAncestors(property, sum + node[property], parent);
}

function preventDefault(event) {
  event.preventDefault();
}

function throwMissingAddEventListenerError(message, object) {
  const keys = [];

  if (object && typeof object === "object") {
    for (var property in object) {
      keys.push(property);
    }
  }

  const keysMessage = object ? " | Keys: " + keys.join(",") : "";

  throw new Error(message + keysMessage);
}
