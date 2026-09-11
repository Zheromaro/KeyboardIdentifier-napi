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

  manager.onPressed((kb) => {
    console.log("Keyboard pressed:");
    console.dir(kb.keyboardId.name, { depth: null });
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
