import "./webxr-input.mock"
//jest.mock("./webxr-input.mock")

import { InputSystem } from "../../src/input/systems/InputSystem"
import { initializeWorld, registerSystem, getSystem } from "../../src/ecs"

test("check navigator", () => {
  expect("xr" in navigator).toBeTruthy()
  expect("requestSession" in (navigator as any).xr).toBeTruthy()
})

test("check hidden magic from the globalised world", () => {
  expect(() => {
    initializeWorld()
    registerSystem(InputSystem)
  }).not.toThrowError()
})

test("start XR sesion", () => {
  expect(() => {
    const system = getSystem(InputSystem)
    system.init({ onVRSupportRequested })
  }).not.toThrowError()

  function onVRSupportRequested(isSupported = false) {
    expect(isSupported).toBeTruthy()
  }
})
