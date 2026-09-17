# keyboard-identifier

High-performance Node.js native bindings for the [`keyboard_identifier`](https://crates.io/crates/keyboard_identifier) Rust crate, built with `napi-rs`. Track keyboard device connections and rich key action events in real time.

## Features

* **Event Listeners:** Monitor hardware plug, unplug, and detailed key action events.
* **Device Identification:** Extract Vendor IDs, Product IDs, Serials, and system port paths.
* **Rich Key Data:** Access standardized Web Keyboard Event properties (logical key, physical code, modifiers, location, repeat state, and composition status).
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

  // Listen for rich key action events
  // Note: The callback receives a single array argument [kb, event] due to 
  // N-API threadsafe function limitations. Destructure it accordingly.
  manager.onKeyAction(([kb, event]) => {
    const kbName = kb.keyboardId.name || "Unknown Keyboard";
    console.log(`\nKey Action on [${kbName}]:`);
    console.dir({
      state: event.state,           // "Down" or "Up"
      key: event.key,               // Logical key (e.g., "a", "Enter", "Shift")
      code: event.code,             // Physical code (e.g., "KeyA", "Enter", "ShiftLeft")
      location: event.location,     // "Standard", "Left", "Right", or "Numpad"
      modifiers: event.modifiers,   // { shift, ctrl, alt, meta, capsLock, numLock }
      repeat: event.repeat,         // true if auto-repeating
      isComposing: event.isComposing,
    }, { depth: null });
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

#### `JsPortId`
| Field | Type | Description |
| :--- | :--- | :--- |
| `physicalPath` | `string \| null` | OS-specific physical port string. |

#### `JsKeyEvent`
| Field | Type | Description |
| :--- | :--- | :--- |
| `state` | `"Down" \| "Up"` | Whether the key is currently pressed down or released. |
| `key` | `string` | Logical key value representing the meaning of the keypress (e.g., `"a"`, `"Enter"`, `"Shift"`). |
| `code` | `string` | Physical key position code based on the US layout (e.g., `"KeyA"`, `"Enter"`, `"ShiftLeft"`). |
| `location` | `"Standard" \| "Left" \| "Right" \| "Numpad"` | Physical location of the key (useful for distinguishing left/right modifiers or numpad keys). |
| `modifiers` | `JsModifiers` | Object containing the current state of all tracked modifier keys. |
| `repeat` | `boolean` | `true` if the event is an auto-repeated keypress (holding the key down). |
| `isComposing` | `boolean` | `true` if the event is part of an IME composition session (should usually be ignored by standard text editors). |

#### `JsModifiers`
| Field | Type | Description |
| :--- | :--- | :--- |
| `shift` | `boolean` | `true` if a Shift key is currently held down. |
| `ctrl` | `boolean` | `true` if a Control key is currently held down. |
| `alt` | `boolean` | `true` if an Alt key is currently held down. |
| `meta` | `boolean` | `true` if a Meta/Command/Windows key is currently held down. |
| `capsLock` | `boolean` | `true` if Caps Lock is currently active/toggled on. |
| `numLock` | `boolean` | `true` if Num Lock is currently active/toggled on. |

## Platform Requirements

- Linux: Users will need elevated privileges (sudo) or proper udev rules granting read access to /dev/input/event* devices to capture raw keypresses and device events.
- Windows: Generally works out of the box, but may require running the terminal as Administrator depending on system security policies.
- macOS: Requires explicit "Input Monitoring" and/or "Accessibility" permissions in System Settings to capture global keyboard events. 

## License

MIT
