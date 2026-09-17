const { newKeyboardSource } = require("./index.js");

async function main() {
  const manager = await newKeyboardSource();

  console.log("Keyboard manager started.");
  console.log("Press Ctrl+C to exit.\n");

  console.log("Current keyboards:");
  console.dir(manager.getKeyboards(), { depth: null });

  manager.onPlugged((kb) => {
    console.log("Keyboard plugged:");
    console.dir(kb, { depth: null });
  });

  manager.onUnplugged((kb) => {
    console.log("Keyboard unplugged:");
    console.dir(kb, { depth: null });
  });

  // Updated to use the new onKeyAction API
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

  // Keep the process alive until Ctrl+C.
  await new Promise((resolve) => {
    process.once("SIGINT", () => {
      console.log("\nExiting...");
      manager.close();
      resolve();
    });
  });

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
