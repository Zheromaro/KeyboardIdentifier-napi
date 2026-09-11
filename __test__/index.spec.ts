import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import test from 'ava'

import { newKeyboardSource, type KeyboardManager } from '../index'

const require = createRequire(import.meta.url)
const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')

const hasLocalWasm =
  existsSync(join(rootDir, 'keyboard_identifier_napi.wasm32-wasi.wasm')) ||
  existsSync(join(rootDir, 'keyboard_identifier_napi.wasm32-wasi.debug.wasm'))

// Share a single manager instance to avoid "already active" errors
// on platforms that restrict multiple concurrent keyboard sources.
let manager: KeyboardManager

test.before(async () => {
  manager = await newKeyboardSource()
})

test.after(() => {
  manager.close()
})

test('newKeyboardSource returns a valid KeyboardManager', (t) => {
  t.truthy(manager)
  t.is(typeof manager.getKeyboards, 'function')
  t.is(typeof manager.onPlugged, 'function')
  t.is(typeof manager.onUnplugged, 'function')
  t.is(typeof manager.onPressed, 'function')
})

test('getKeyboards returns an array of keyboard objects', (t) => {
  const keyboards = manager.getKeyboards()

  t.true(Array.isArray(keyboards))

  if (keyboards.length > 0) {
    const kb = keyboards[0]
    t.truthy(kb)
    t.truthy(kb.keyboardId)
    t.truthy(kb.portId)

    t.true(kb.keyboardId.name === undefined || typeof kb.keyboardId.name === 'string')
    t.true(kb.keyboardId.vendorId === undefined || typeof kb.keyboardId.vendorId === 'string')
    t.true(kb.keyboardId.productId === undefined || typeof kb.keyboardId.productId === 'string')
    t.true(kb.keyboardId.serial === undefined || typeof kb.keyboardId.serial === 'string')
    t.true(kb.portId.physicalPath === undefined || typeof kb.portId.physicalPath === 'string')
  }
})

test('event listeners can be registered without throwing errors', (t) => {
  t.notThrows(() => {
    manager.onPlugged(() => {})
  })

  t.notThrows(() => {
    manager.onUnplugged(() => {})
  })

  t.notThrows(() => {
    manager.onPressed(() => {})
  })
})

const testWasiBinding = hasLocalWasm ? test : test.skip

testWasiBinding('generated WASI binding loads from a local wasm artifact', async (t) => {
  const binding = require(join(rootDir, 'keyboard_identifier_napi.wasi.cjs')) as {
    newKeyboardSource: () => Promise<{ getKeyboards: () => any[]; close: () => void }>
  }

  const wasiManager = await binding.newKeyboardSource()

  t.teardown(() => {
    wasiManager.close()
  })

  t.truthy(wasiManager)
  t.true(Array.isArray(wasiManager.getKeyboards()))
})
