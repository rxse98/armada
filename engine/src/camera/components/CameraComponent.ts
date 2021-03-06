// TODO: Change camera properties to object and use setter that updates camera

import { Component } from "../../ecs/classes/Component"

export class CameraComponent extends Component<CameraComponent> {
  static instance: CameraComponent = null
  camera: any // Reference to the actual camera object
  followTarget: any // Reference to the object that should be followed
  fov: number // Field of view
  aspect: number // Width / height
  near: number // Geometry closer than this gets removed
  far: number // Geometry farther than this gets removed
  layers: number // Bitmask of layers the camera can see, converted to an int
  handleResize: boolean // Should the camera resize if the window does?
  constructor() {
    super()
    CameraComponent.instance = this
  }
}
