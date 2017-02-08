port module Ports.Dom exposing (..)


import Json.Encode


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


{-| Subscriptions (Receive from JS) -}


-- standard DOM event handlers
port onSubmit : ((Selector, JsonPayload) -> msg) -> Sub msg
port onClick : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
port onChange : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
port onInput : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
port onKeyup : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
port onFocus : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
port onBlur : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
port onPaste : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
port onMousedown : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
port onTouchstart : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
port onTouchmove : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
port onTouchend : ((Selector, HtmlElement, Event) -> msg) -> Sub msg
port onResize : ((Selector, HtmlElement, Event) -> msg) -> Sub msg


-- custom event handlers
port innerHtmlReplaced : (Selector -> msg) -> Sub msg
port nodePosition : ((Selector, Position) -> msg) -> Sub msg
port querySelectorResponse : ((Selector, HtmlElement) -> msg) -> Sub msg
port appendChildSuccess : ((Selector, RawHtml) -> msg) -> Sub msg


{-| Commands (Send to JS) -}


-- event listeners
port addEventListener : (Selector, EventName, Maybe EventListenerOptions) -> Cmd msg
port addClickListener : Selector -> Cmd msg
port addSubmitListener : (Selector, List String) -> Cmd msg


-- class
port addClass : (Selector, Classname) -> Cmd msg
port removeClass : (Selector, Classname) -> Cmd msg
port toggleClass : (Selector, Classname) -> Cmd msg


-- DOM Node addition/removal
port innerHtml : (Selector, RawHtml) -> Cmd msg
port appendChild : (ParentSelector, RawHtml) -> Cmd msg -- Append the RawHtml as a child of the ParentSelector node
port removeNodes : Selector -> Cmd msg


-- click (on something)
port click : Selector -> Cmd msg


-- focus
port focus : Selector -> Cmd msg


-- scroll
port windowScrollTo : (Coordinate, Coordinate) -> Cmd msg -- X,Y order
port windowScrollToSelector : Selector -> Cmd msg
port preventTouchScroll : () -> Cmd msg
port allowTouchScroll : () -> Cmd msg


-- arbitrary properties
port setProperty : (Selector, Property, Json.Encode.Value) -> Cmd msg
port setCssProperty : (Selector, Property, CssValue) -> Cmd msg
port removeCssProperty : (Selector, Property) -> Cmd msg
port setDataAttribute : (Selector, DataKey, DataValue) -> Cmd msg


-- DOM inspection
port getNodePosition : Selector -> Cmd msg
port querySelector : Selector -> Cmd msg


-- Helper Functions


{-| Given a list of data attributes, extract the value of one.

    dataAttribute [("foo", "this"), ("bar", "that"), ("baz", "other")] "baz" == Just "other"
    dataAttribute [("foo", "this"), ("bar", "that"), ("baz", "other")] "qux" == Nothing
-}
dataAttribute : List (DataKey, DataValue) -> DataKey -> Maybe DataValue
dataAttribute attributes key_ =
  case attributes of
    [] ->
      Nothing

    (key, value) :: otherAttributes ->
      if key_ == key then
        Just value

      else
        dataAttribute otherAttributes key_
