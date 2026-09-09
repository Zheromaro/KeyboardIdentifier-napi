# keyboard-identifier

High-performance Node.js native bindings for the [`keyboard_identifier`](https://crates.io/crates/keyboard_identifier) Rust crate, built with `napi.rs`. Track keyboard device connections and keypress events in real time.

## Features

* **Event Listeners:** Monitor hardware plug, unplug, and keypress events.
* **Device Identification:** Extract Vendor IDs, Product IDs, Serials, and system port paths.
* **Non-Blocking Execution:** Asynchronous event loop integration powered by Rust threads.

## Installation

```bash
npm install keyboard-identifier
```

## Quick Start

```javascript
const { newKeyboardSource } = require("keyboard-identifier");

async function main() {
  // Initialize and start listening for hardware events
  const manager = await newKeyboardSource();

  // Get currently connected devices
  const keyboards = manager.getKeyboards();
  console.log("Connected Keyboards:", keyboards);

  // Listen for device connections
  manager.onPlugged((kb) => {
    console.log("Keyboard plugged:", kb);
  });

  // Listen for device disconnections
  manager.onUnplugged((kb) => {
    console.log("Keyboard unplugged:", kb);
  });

  // Listen for keypress events
  manager.onPressed((kb) => {
    console.log("Key pressed on device:", kb.keyboardId.name);
  });
}

main().catch(console.error);
```

## API Reference

### `newKeyboardSource(): Promise<KeyboardManager>`
Initializes the inner event listener and returns an active `KeyboardManager` instance.

---

### `KeyboardManager`

* **`getKeyboards(): JsKeyboard[]`**  
  Returns a snapshot array of all currently attached keyboard devices.

* **`onPlugged(callback: (kb: JsKeyboard) => void): void`**  
  Triggers the provided callback whenever a keyboard is plugged in.

* **`onUnplugged(callback: (kb: JsKeyboard) => void): void`**  
  Triggers the provided callback whenever a keyboard is disconnected.

* **`onPressed(callback: (kb: JsKeyboard) => void): void`**  
  Triggers the provided callback whenever a keypress occurs on any connected keyboard.

---

### Data Structures

#### `JsKeyboard`
| Field | Type | Description |
| :--- | :--- | :--- |
| `keyboardId` | `JsKeyboardId` | Metadata identifying the specific hardware. |
| `portId` | `JsPortId` | Physical port connection path details. |

#### `JsKeyboardId`
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | `string \| null` | Human-readable name of the device. |
| `vendorId` | `string \| null` | Hardware USB Vendor ID. |
| `productId` | `string \| null` | Hardware USB Product ID. |
| `serial` | `string \| null` | Serial number string, if reported. |

#### `JsPortId`
| Field | Type | Description |
| :--- | :--- | :--- |
| `physicalPath` | `string \| null` | OS-specific physical port string. |

## Platform Requirements

This package relies on OS-level hardware access APIs provided by the underlying Rust crate. On Linux systems, users may need elevated privileges (or proper `udev` permissions) to capture raw keypresses and device events.

## License

MIT
