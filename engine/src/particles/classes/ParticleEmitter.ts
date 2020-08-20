import * as THREE from "three"
import { createPseudoRandom } from "../../common/functions/MathRandomFunctions"
import {
  loadTexturePackerJSON,
  needsUpdate,
  setAccelerationAt,
  setAngularAccelerationAt,
  setAngularVelocityAt,
  setBrownianAt,
  setColorsAt,
  setFrameAt,
  setMaterialTime,
  setMatrixAt,
  setOffsetAt,
  setOpacitiesAt,
  setOrientationsAt,
  setScalesAt,
  setTimingsAt,
  setVelocityAt,
  setVelocityScaleAt,
  setWorldAccelerationAt
} from "./ParticleMesh"
import { ParticleEmitterInterface, ParticleEmitter } from "../interfaces"
import { Mesh, Geometry } from "three"

const error = console.error
const FRAME_STYLES = ["sequence", "randomsequence", "random"]
const DEG2RAD = THREE.MathUtils.DEG2RAD

let emitterRegistry = new Set()
// let emitterRegistry = []

export function createParticleEmitter(
  options: ParticleEmitterInterface,
  matrixWorld: THREE.Matrix4,
  time = 0
): ParticleEmitter {
  const config = {
    particleMesh: null,
    enabled: true,
    count: -1, // use all available particles
    textureFrame: undefined,
    lifeTime: 1, // may also be [min,max]
    repeatTime: 0, // if 0, use the maximum lifeTime
    burst: 0, // if 1 all particles are spawned at once
    seed: undefined, // a number between 0 and 1
    worldUp: false, // particles relative to world UP (they will get rotated if the camera tilts)

    // per particle values
    atlas: 0,
    frames: [],
    colors: [{ r: 1, g: 1, b: 1 }],
    orientations: [0],
    scales: [1],
    opacities: [1],
    frameStyle: "sequence",
    offset: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    acceleration: { x: 0, y: 0, z: 0 },
    radialVelocity: 0,
    radialAcceleration: 0,
    angularVelocity: { x: 0, y: 0, z: 0 },
    angularAcceleration: { x: 0, y: 0, z: 0 },
    orbitalVelocity: 0,
    orbitalAcceleration: 0,
    worldAcceleration: { x: 0, y: 0, z: 0 },
    brownianSpeed: 0,
    brownianScale: 0,
    velocityScale: 0,
    velocityScaleMin: 0.1,
    velocityScaleMax: 1
  }

  Object.defineProperties(config, Object.getOwnPropertyDescriptors(options)) // preserves getters

  const mesh = config.particleMesh
  const geometry = mesh.geometry
  const id = (emitterRegistry.size == 0) ? 0 : Array.from(emitterRegistry)[emitterRegistry.size - 1]["id"] + 1
  const startTime = time
  const startIndex = mesh.userData.nextIndex
  const meshParticleCount = mesh.userData.meshConfig.particleCount
  const count = config.count
  const burst = config.burst
  const lifeTime = config.lifeTime
  const seed = config.seed
  const rndFn = createPseudoRandom(seed)

  const particleRepeatTime = config.repeatTime

  const effectRepeatTime = Math.max(particleRepeatTime, Array.isArray(lifeTime) ? Math.max(...lifeTime) : lifeTime)
  const textureFrame = config.textureFrame ? config.textureFrame : mesh.userData.meshConfig.textureFrame

  if (config.count > 0 && startIndex + config.count > meshParticleCount) {
    error(`run out of particles, increase the particleCount for this ThreeParticleMesh`)
  }
  // clear previous Set()
  if(mesh.userData.nextIndex == 0){
    emitterRegistry.clear()
  }
  const numParticles = count >= 0 ? count : meshParticleCount - mesh.userData.nextIndex
  mesh.userData.nextIndex += numParticles

  const endIndex = Math.min(meshParticleCount, startIndex + numParticles)

  const spawnDelta = (effectRepeatTime / numParticles) * (1 - burst)
  // const vertices = model3D && typeof config.offset === "function" && model3D.isMesh ? calcSpawnOffsetsFromGeometry(model3D.geometry) : undefined

  for (let i = startIndex; i < endIndex; i++) {
    const spawnTime = time + (i - startIndex) * spawnDelta
    spawn(geometry, matrixWorld, config, i, spawnTime, lifeTime, particleRepeatTime, textureFrame, seed, rndFn)
  }

  needsUpdate(geometry)
  if (mesh.userData.meshConfig.style === "particle") {
    loadTexturePackerJSON(mesh, config, startIndex, endIndex)
  }

  let emitter = {
    startTime, 
    startIndex, 
    endIndex,
    mesh
  }
  
  emitterRegistry.add(emitter)
  return emitter
  
}

//needsUpdate

export function deleteParticleEmitter(emitter: ParticleEmitter): void {
  let shiftAmount = emitter.endIndex - emitter.startIndex
  emitterRegistry.delete(emitter)


  for (let i = emitter.startIndex; i < emitter.endIndex; i++) {
    despawn(emitter.mesh.geometry, i)
  }
  needsUpdate(emitter.mesh.geometry)
  
  
  let geometry = emitter.mesh.geometry

  for(let i = emitter.startIndex; i <= emitter.mesh.userData.nextIndex; i++){
    copyEmitterAttrs(geometry.getAttribute("velocity"), i, shiftAmount)
    copyEmitterAttrs(geometry.getAttribute("row1"), i, shiftAmount)
    copyEmitterAttrs(geometry.getAttribute("row2"), i, shiftAmount)
    copyEmitterAttrs(geometry.getAttribute("row3"), i, shiftAmount)
    copyEmitterAttrs(geometry.getAttribute("offset"), i, shiftAmount)
    copyEmitterAttrs(geometry.getAttribute("scales"), i, shiftAmount)
    copyEmitterAttrs(geometry.getAttribute("orientations"), i, shiftAmount)
    copyEmitterAttrs(geometry.getAttribute("colors"), i, shiftAmount)
    copyEmitterAttrs(geometry.getAttribute("opacities"), i, shiftAmount)
    copyEmitterAttrs(geometry.getAttribute("timings"), i, shiftAmount)
    copyEmitterAttrs(geometry.getAttribute("acceleration"), i, shiftAmount)
    copyEmitterAttrs(geometry.getAttribute("angularvelocity"), i, shiftAmount)
    copyEmitterAttrs(geometry.getAttribute("angularacceleration"), i, shiftAmount)
    copyEmitterAttrs(geometry.getAttribute("worldacceleration"), i, shiftAmount)
    copyEmitterAttrs(geometry.getAttribute("velocityscale"), i, shiftAmount)  
  }

  emitter.mesh.userData.nextIndex -= shiftAmount
  let arrayEmitter = Array.from(emitterRegistry)
  for(let i = 0; i < emitterRegistry.size; i++) {
    if(i == 0 ? arrayEmitter[i]["startIndex"] != 0 : arrayEmitter[i - 1]["endIndex"] != arrayEmitter[i]["startIndex"]){
      arrayEmitter[i]["startIndex"] -= shiftAmount
      arrayEmitter[i]["endIndex"] -= shiftAmount
    }  
  }

}

function copyEmitterAttrs(attributes, index, shiftAmount){
  if(attributes.array.length == 400){
    attributes.setXYZW(index,
      attributes.getX(index + shiftAmount), 
      attributes.getY(index + shiftAmount), 
      attributes.getZ(index + shiftAmount), 
      attributes.getW(index + shiftAmount))
  }
  else if (attributes.array.length == 300){
    attributes.setXYZ(index,
      attributes.getX(index + shiftAmount),
      attributes.getY(index + shiftAmount),
      attributes.getZ(index + shiftAmount))
  } 
}

// function copyEmitterAttrsV2(geometry, index, shiftAmount){
//   let velocity = geometry.getAttribute("velocity")
//   let row1 = geometry.getAttribute("row1")
//   let row2 = geometry.getAttribute("row2")
//   let row3 = geometry.getAttribute("row3")
//   let offset = geometry.getAttribute("offset")
//   let scales = geometry.getAttribute("scales")
//   let orientations = geometry.getAttribute("orientations")
//   let colors = geometry.getAttribute("colors")
//   let opacities = geometry.getAttribute("opacities")
//   let timings = geometry.getAttribute("timings")
//   let acceleration = geometry.getAttribute("acceleration")
//   let angularvelocity = geometry.getAttribute("angularvelocity")
//   let angularacceleration = geometry.getAttribute("angularacceleration")
//   let worldacceleration = geometry.getAttribute("worldacceleration")
//   let velocityscale = geometry.getAttribute("velocityscale")
  
//   velocity.setXYZW(index,
//     velocity.getX(index + shiftAmount), 
//     velocity.getY(index + shiftAmount), 
//     velocity.getZ(index + shiftAmount), 
//     velocity.getW(index + shiftAmount))

//   row1.setXYZW(index, 
//     row1.getX(index + shiftAmount), 
//     row1.getY(index + shiftAmount), 
//     row1.getZ(index + shiftAmount), 
//     row1.getW(index + shiftAmount))

//   row2.setXYZW(index, 
//     row2.getX(index + shiftAmount), 
//     row2.getY(index + shiftAmount), 
//     row2.getZ(index + shiftAmount), 
//     row2.getW(index + shiftAmount))

//   row3.setXYZW(index, 
//     row3.getX(index + shiftAmount), 
//     row3.getY(index + shiftAmount), 
//     row3.getZ(index + shiftAmount), 
//     row3.getW(index + shiftAmount))

//   offset.setXYZ(index,
//     offset.getX(index + shiftAmount),
//     offset.getY(index + shiftAmount),
//     offset.getZ(index + shiftAmount))

//   // scales.setW(index - 1, scales.getW(index + shiftAmount))
//   scales.setXYZ(index,
//     scales.getX(index + shiftAmount),
//     scales.getY(index + shiftAmount),
//     scales.getZ(index + shiftAmount))

//   // orientations.setX(index, orientations.getX(index + shiftAmount))
//   orientations.setXYZW(index, 
//     orientations.getX(index + shiftAmount),
//     orientations.getY(index + shiftAmount),
//     orientations.getZ(index + shiftAmount),
//     orientations.getW(index + shiftAmount))

//   colors.setXYZW(index, 
//     colors.getX(index + shiftAmount),
//     colors.getY(index + shiftAmount),
//     colors.getZ(index + shiftAmount),
//     colors.getW(index + shiftAmount))

//   opacities.setXYZW(index, 
//     opacities.getX(index + shiftAmount),
//     opacities.getY(index + shiftAmount),
//     opacities.getZ(index + shiftAmount),
//     opacities.getW(index + shiftAmount))

//   timings.setXYZW(index, 
//     timings.getX(index + shiftAmount),
//     timings.getY(index + shiftAmount),
//     timings.getZ(index + shiftAmount),
//     timings.getW(index + shiftAmount))

//   acceleration.setXYZW(index, 
//     acceleration.getX(index + shiftAmount),
//     acceleration.getY(index + shiftAmount),
//     acceleration.getZ(index + shiftAmount),
//     acceleration.getW(index + shiftAmount))

//   angularvelocity.setXYZW(index, 
//     angularvelocity.getX(index + shiftAmount),
//     angularvelocity.getY(index + shiftAmount),
//     angularvelocity.getZ(index + shiftAmount),
//     angularvelocity.getW(index + shiftAmount))

//   angularacceleration.setXYZW(index, 
//     angularacceleration.getX(index + shiftAmount),
//     angularacceleration.getY(index + shiftAmount),
//     angularacceleration.getZ(index + shiftAmount),
//     angularacceleration.getW(index + shiftAmount))

//   worldacceleration.setXYZ(index,
//     worldacceleration.getX(index + shiftAmount),
//     worldacceleration.getY(index + shiftAmount),
//     worldacceleration.getZ(index + shiftAmount))

//   velocityscale.setXYZ(index,
//     velocityscale.getX(index + shiftAmount),
//     velocityscale.getY(index + shiftAmount),
//     velocityscale.getZ(index + shiftAmount))
// }

function despawn(geometry, index) {
  // TODO: cleanup mesh!

  // matrixWorld = null
  let matrixWorld = {
    elements: []
  }

  setMatrixAt(geometry, index, matrixWorld)
  setOffsetAt(geometry, index, 0)
  setScalesAt(geometry, index, 0)
  setColorsAt(geometry, index, [{}])
  setOrientationsAt(geometry, index, 0, 0)
  setOpacitiesAt(geometry, index, 0)
  setFrameAt(geometry, index, 0, 0, 0, 0, 0, 0)

  setTimingsAt(geometry, index, 0, 0, 0, 0)
  setVelocityAt(geometry, index, 0, 0, 0, 0)
  setAccelerationAt(geometry, index, 0, 0, 0, 0)
  setAngularVelocityAt(geometry, index, 0, 0, 0, 0)
  setAngularAccelerationAt(geometry, index, 0, 0, 0, 0)
  setWorldAccelerationAt(geometry, index, 0, 0, 0)
  setBrownianAt(geometry, index, 0, 0)
  setVelocityScaleAt(geometry, index, 0, 0, 0)
}

export function setEmitterTime(emitter: ParticleEmitter, time: number): void {
  setMaterialTime(emitter.mesh.material, time)
}

export function setEmitterMatrixWorld(emitter: ParticleEmitter, matrixWorld: THREE.Matrix4, time: number, deltaTime: number): void {
  const geometry = emitter.mesh.geometry
  const endIndex = emitter.endIndex
  const startIndex = emitter.startIndex
  const timings = geometry.getAttribute("timings")
  let isMoved = false

  for (let i = startIndex; i < endIndex; i++) {
    const startTime = timings.getX(i)
    const lifeTime = timings.getY(i)
    const repeatTime = timings.getZ(i)
    const age = (time - startTime) % Math.max(repeatTime, lifeTime)
    if (age > 0 && age < deltaTime) {
      setMatrixAt(geometry, i, matrixWorld)
      isMoved = true
    }
  }

  if (isMoved) {
    needsUpdate(geometry, ["row1", "row2", "row3"])
  }
}

function spawn(geometry, matrixWorld, config, index, spawnTime, lifeTime, repeatTime, textureFrame, seed, rndFn) {
  const velocity = config.velocity
  const acceleration = config.acceleration
  const angularVelocity = config.angularVelocity
  const angularAcceleration = config.angularAcceleration
  const worldAcceleration = config.worldAcceleration

  const particleLifeTime = Array.isArray(lifeTime) ? rndFn() * (lifeTime[1] - lifeTime[0]) + lifeTime[0] : lifeTime
  const orientations = config.orientations.map(o => o * DEG2RAD)
  const frames = config.frames
  const atlas = config.atlas

  const startFrame = frames.length > 0 ? frames[0] : 0
  const endFrame =
    frames.length > 1 ? frames[1] : frames.length > 0 ? frames[0] : textureFrame.cols * textureFrame.rows - 1
  const frameStyleIndex = FRAME_STYLES.indexOf(config.frameStyle) >= 0 ? FRAME_STYLES.indexOf(config.frameStyle) : 0
  const atlasIndex = typeof atlas === "number" ? atlas : 0

  setMatrixAt(geometry, index, matrixWorld)
  setOffsetAt(geometry, index, config.offset)
  setScalesAt(geometry, index, config.scales)
  setColorsAt(geometry, index, config.colors)
  setOrientationsAt(geometry, index, orientations, config.worldUp ? 1 : 0)
  setOpacitiesAt(geometry, index, config.opacities)
  setFrameAt(geometry, index, atlasIndex, frameStyleIndex, startFrame, endFrame, textureFrame.cols, textureFrame.rows)

  setTimingsAt(geometry, index, spawnTime, particleLifeTime, repeatTime, config.seed)
  setVelocityAt(geometry, index, velocity.x, velocity.y, velocity.z, config.radialVelocity)
  setAccelerationAt(geometry, index, acceleration.x, acceleration.y, acceleration.z, config.radialAcceleration)
  setAngularVelocityAt(
    geometry,
    index,
    angularVelocity.x * DEG2RAD,
    angularVelocity.y * DEG2RAD,
    angularVelocity.z * DEG2RAD,
    config.orbitalVelocity * DEG2RAD
  )
  setAngularAccelerationAt(
    geometry,
    index,
    angularAcceleration.x * DEG2RAD,
    angularAcceleration.y * DEG2RAD,
    angularAcceleration.z * DEG2RAD,
    config.orbitalAcceleration * DEG2RAD
  )
  setWorldAccelerationAt(geometry, index, worldAcceleration.x, worldAcceleration.y, worldAcceleration.z)
  setBrownianAt(geometry, index, config.brownianSpeed, config.brownianScale)
  setVelocityScaleAt(geometry, index, config.velocityScale, config.velocityScaleMin, config.velocityScaleMax)

}

// function calcSpawnOffsetsFromGeometry(geometry): any {
//   if (!geometry || !geometry.object3D) {
//     return undefined
//   }
//
//   const worldPositions = []
//   const pos = new THREE.Vector3()
//   const inverseObjectMatrix = new THREE.Matrix4()
//   const mat4 = new THREE.Matrix4()
//
//   geometry.object3D.updateMatrixWorld()
//   inverseObjectMatrix.getInverse(geometry.object3D.matrixWorld)
//
//   geometry.object3D.traverse(node => {
//     if (!node.geometry || !node.geometry.getAttribute) {
//       return
//     }
//
//     const position = node.geometry.getAttribute("position")
//     if (!position || position.itemSize !== 3) {
//       return
//     }
//
//     for (let i = 0; i < position.count; i++) {
//       mat4.copy(node.matrixWorld).multiply(inverseObjectMatrix)
//       pos.fromBufferAttribute(position, i).applyMatrix4(mat4)
//       worldPositions.push(pos.x, pos.y, pos.z)
//     }
//   })
//
//   return Float32Array.from(worldPositions)
// }
