# Elm Dom Ports [![Build Status](https://travis-ci.org/knledg/elm-dom-ports.svg?branch=master)](https://travis-ci.org/knledg/elm-dom-ports)

Interface with the DOM manually in Elm.

## Why?

It's popular at the moment to build web apps solely as "Single Page Apps", wherein a JavaScript application completely takes over the DOM. However, this isn't always the best solution. When you're just toggling a class to show/hide a menu, it may be overkill to use a Virtual DOM solution.

In this scenario, Elm Dom Ports exposes much of the underlying JavaScript DOM API, enabling you to manually modify the DOM using Elm. This empowers you to bring interactivity to your app in a jQuery-style manner, while adding the safety of Elm.

## Quick Start

### 1. Install via NPM

```
$ npm install --save elm-dom-ports
```

### 2. In `elm-package.json`, import [`Ports/Dom.elm`](lib/elm/Ports/Dom.elm)

Add `node_modules/elm-dom-ports/lib/elm` to your `source-directories`:

```js
// elm-package.json
{
    // ...

    "source-directories": [
        "../../node_modules/elm-dom-ports/lib/elm",
        "./"
    ],

    // ...
}
```

### 3. Use it in your Elm code

```elm
update msg model =
  case msg of
    OpenMenu ->
      ( model
      , Ports.Dom.addClass ("#mobile_menu", "mobile-menu--opened")
      )

    CloseMenu ->
      ( model
      , Ports.Dom.removeClass ("#mobile_menu", "mobile-menu--opened")
      )

    FocusOnSearchBox ->
      ( model
      , Ports.Dom.focus "#search_box"
      )

    PopulateSearchBox searchQuery ->
      ( model
      , Ports.Dom.setProperty ("#search_box", "value", Json.Encode.string searchQuery)
      )

    HideContactForm ->
      ( model
      , Ports.Dom.setCssProperty ("#contact_form", "visibility", "hidden")
      )
```

### 4. Register your Elm app in JavaScript

```javascript
var domPorts = require("elm-dom-ports");
var myApp = Elm.MyApp.embed(document.getElementById("app-container"));

domPorts.register(myApp.ports);
```

## API Reference

[View the full API reference here.](./API.md)

## Questions or Problems?

Feel free to create an issue in the [GitHub issue tracker](https://github.com/knledg/elm-dom-ports/issues).
