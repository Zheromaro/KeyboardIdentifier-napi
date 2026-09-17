use keyboard_identifier::keyboard_types::{
  KeyState, KeyboardEvent as KeyEvent, Location, Modifiers,
};
use napi_derive::napi;

#[napi(string_enum)]
pub enum JsKeyState {
  Down,
  Up,
}

#[napi(string_enum)]
pub enum JsLocation {
  Standard,
  Left,
  Right,
  Numpad,
}

impl From<Location> for JsLocation {
  fn from(loc: Location) -> Self {
    match loc {
      Location::Standard => JsLocation::Standard,
      Location::Left => JsLocation::Left,
      Location::Right => JsLocation::Right,
      Location::Numpad => JsLocation::Numpad,
    }
  }
}

#[napi(object)]
pub struct JsModifiers {
  pub shift: bool,
  pub ctrl: bool,
  pub alt: bool,
  pub meta: bool,
  pub caps_lock: bool,
  pub num_lock: bool,
}

impl From<&Modifiers> for JsModifiers {
  fn from(m: &Modifiers) -> Self {
    JsModifiers {
      shift: m.shift(),
      ctrl: m.ctrl(),
      alt: m.alt(),
      meta: m.meta(),
      caps_lock: m.contains(Modifiers::CAPS_LOCK),
      num_lock: m.contains(Modifiers::NUM_LOCK),
    }
  }
}

#[napi(object)]
pub struct JsKeyEvent {
  pub state: JsKeyState,
  pub key: String,
  pub code: String,
  pub location: JsLocation,
  pub modifiers: JsModifiers,
  pub repeat: bool,
  pub is_composing: bool,
}

impl From<&KeyEvent> for JsKeyEvent {
  fn from(event: &KeyEvent) -> Self {
    JsKeyEvent {
      state: match event.state {
        KeyState::Down => JsKeyState::Down,
        KeyState::Up => JsKeyState::Up,
      },
      key: event.key.to_string(),
      code: event.code.to_string(),
      location: event.location.into(),
      modifiers: (&event.modifiers).into(),
      repeat: event.repeat,
      is_composing: event.is_composing,
    }
  }
}
