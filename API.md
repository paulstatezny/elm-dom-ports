# Full API Reference

## Type Aliases for Port Signatures

```elm
type alias Classname = String
type alias Coordinate = Float
type alias CssValue = String
type alias DataKey = String
type alias DataValue = String
type alias EventName = String -- DOM event, per the spec
type alias JsonPayload = Json.Encode.Value
type alias ParentSelector = String -- DOM Selector, e.g. ".some-class", of a PARENT element
type alias Pathname = String
type alias Property = String
type alias Query = String
type alias RawHtml = String
type alias Selector = String -- DOM Selector, e.g. ".some-class"
type alias Title = String
type alias Url = String

type alias HtmlElement =
  { checked : Maybe Bool
  , clientWidth : Maybe Int
  , clientHeight : Maybe Int
  , content : Maybe String
  , data : List (DataKey, DataValue)
  , for : Maybe String
  , href : Maybe String
  , id : Maybe String
  , innerHtml : Maybe String
  , pathname : Maybe String
  , value : Maybe String
  }


type alias Event =
  { clientX : Maybe Float
  , clientY : Maybe Float
  , keyCode : Maybe Int
  , touchClientX : Maybe Float
  , touchClientY : Maybe Float
  }


type alias Position =
  { top : Float
  , right : Float
  , bottom : Float
  , left : Float
  }


type alias EventListenerOptions =
  { stopPropagation : Bool
  , preventDefault : Bool
  }
```

## Commands

### `addEventListener`

```elm
port addEventListener : (Selector, EventName, Maybe EventListenerOptions) -> Cmd msg
```

### `addClickListener`

```elm
port addClickListener : Selector -> Cmd msg
```

### `addSubmitListener`

```elm
port addSubmitListener : (Selector, List String) -> Cmd msg
```

### `addClass`

```elm
port addClass : (Selector, Classname) -> Cmd msg
```

### `removeClass`

```elm
port removeClass : (Selector, Classname) -> Cmd msg
```

### `toggleClass`

```elm
port toggleClass : (Selector, Classname) -> Cmd msg
```

### `innerHtml`

```elm
port innerHtml : (Selector, RawHtml) -> Cmd msg
```

### `appendChild`

```elm
port appendChild : (ParentSelector, RawHtml) -> Cmd msg -- Append the RawHtml as a child of the ParentSelector node
```

### `removeNodes`

```elm
port removeNodes : Selector -> Cmd msg
```

### `click`

```elm
port click : Selector -> Cmd msg
```

### `focus`

```elm
port focus : Selector -> Cmd msg
```

### `windowScrollTo`

```elm
port windowScrollTo : (Coordinate, Coordinate) -> Cmd msg -- X,Y order
```

### `windowScrollToSelector`

```elm
port windowScrollToSelector : Selector -> Cmd msg
```

### `preventTouchScroll`

```elm
port preventTouchScroll : () -> Cmd msg
```

### `allowTouchScroll`

```elm
port allowTouchScroll : () -> Cmd msg
```

### `setProperty`

```elm
port setProperty : (Selector, Property, Json.Encode.Value) -> Cmd msg
```

### `setCssProperty`

```elm
port setCssProperty : (Selector, Property, CssValue) -> Cmd msg
```

### `removeCssProperty`

```elm
port removeCssProperty : (Selector, Property) -> Cmd msg
```

### `setDataAttribute`

```elm
port setDataAttribute : (Selector, DataKey, DataValue) -> Cmd msg
```

### `getNodePosition`

```elm
port getNodePosition : Selector -> Cmd msg
```

### `querySelector`

```elm
port querySelector : Selector -> Cmd msg
```

### `preloadImage`

```elm
port preloadImage : Url -> Cmd msg
```


## Subscriptions

### `onSubmit`

```elm
port onSubmit : ((Selector, JsonPayload) -> msg) -> Sub msg
```

### `onClick`

```elm
port onClick : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
```

### `onChange`

```elm
port onChange : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
```

### `onInput`

```elm
port onInput : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
```

### `onKeyup`

```elm
port onKeyup : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
```

### `onFocus`

```elm
port onFocus : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
```

### `onBlur`

```elm
port onBlur : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
```

### `onPaste`

```elm
port onPaste : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
```

### `onMousedown`

```elm
port onMousedown : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
```

### `onTouchstart`

```elm
port onTouchstart : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
```

### `onTouchmove`

```elm
port onTouchmove : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
```

### `onTouchend`

```elm
port onTouchend : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
```

### `onResize`

```elm
port onResize : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
```

### `innerHtmlReplaced`

```elm
port innerHtmlReplaced : (Selector -> msg) -> Sub msg
```

### `nodePosition`

```elm
port nodePosition : ((Selector, Position) -> msg) -> Sub msg
```

### `querySelectorResponse`

```elm
port querySelectorResponse : ((Selector, HtmlElement) -> msg) -> Sub msg
```

### `appendChildSuccess`

```elm
port appendChildSuccess : ((Selector, RawHtml) -> msg) -> Sub msg
```
