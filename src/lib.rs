#![deny(clippy::all)]
use keyboard_identifier::{KeyboardManager as InnerManager, keyboard_source::*};
use napi::bindgen_prelude::*;
use napi::threadsafe_function::ThreadsafeFunctionCallMode;
use napi_derive::napi;

#[napi(object)]
pub struct JsPortId {
  pub physical_path: Option<String>,
}

#[napi(object)]
pub struct JsKeyboardId {
  pub name: Option<String>,
  pub vendor_id: Option<String>,
  pub product_id: Option<String>,
  pub serial: Option<String>,
}

#[napi(object)]
pub struct JsKeyboard {
  pub keyboard_id: JsKeyboardId,
  pub port_id: JsPortId,
}

impl From<&Keyboard> for JsKeyboard {
  fn from(kb: &Keyboard) -> Self {
    JsKeyboard {
      keyboard_id: JsKeyboardId {
        name: kb.keyboard_id.name.clone(),
        vendor_id: kb.keyboard_id.vendor_id.clone(),
        product_id: kb.keyboard_id.product_id.clone(),
        serial: kb.keyboard_id.serial.clone(),
      },
      port_id: JsPortId {
        physical_path: kb.port_id.physical_path.clone(),
      },
    }
  }
}

#[napi]
pub struct KeyboardManager {
  inner: InnerManager,
}

#[napi]
impl KeyboardManager {
  #[napi]
  pub fn on_plugged(
    &self,
    #[napi(ts_arg_type = "(kb: JsKeyboard) => void")] callback: Function<JsKeyboard, ()>,
  ) -> Result<()> {
    let tsfn = callback
      .build_threadsafe_function()
      .callee_handled::<false>()
      .build()?;

    self.inner.on_plugged(move |kb| {
      let _ = tsfn.call(kb.into(), ThreadsafeFunctionCallMode::NonBlocking);
    });

    Ok(())
  }

  #[napi]
  pub fn on_unplugged(
    &self,
    #[napi(ts_arg_type = "(kb: JsKeyboard) => void")] callback: Function<JsKeyboard, ()>,
  ) -> Result<()> {
    let tsfn = callback
      .build_threadsafe_function()
      .callee_handled::<false>()
      .build()?;

    self.inner.on_unplugged(move |kb| {
      let _ = tsfn.call(kb.into(), ThreadsafeFunctionCallMode::NonBlocking);
    });

    Ok(())
  }

  #[napi]
  pub fn on_pressed(
    &self,
    #[napi(ts_arg_type = "(kb: JsKeyboard) => void")] callback: Function<JsKeyboard, ()>,
  ) -> Result<()> {
    let tsfn = callback
      .build_threadsafe_function()
      .callee_handled::<false>()
      .build()?;

    self.inner.on_pressed(move |kb| {
      let _ = tsfn.call(kb.into(), ThreadsafeFunctionCallMode::NonBlocking);
    });

    Ok(())
  }

  #[napi]
  pub fn get_keyboards(&self) -> Vec<JsKeyboard> {
    self
      .inner
      .get_keyboards()
      .iter()
      .map(JsKeyboard::from)
      .collect()
  }
}

#[napi]
pub async fn new_keyboard_source() -> Result<KeyboardManager> {
  let mut inner = InnerManager::new()
    .await
    .map_err(|err| Error::from_reason(err.to_string()))?;

  inner.listen().await;

  Ok(KeyboardManager { inner })
}
