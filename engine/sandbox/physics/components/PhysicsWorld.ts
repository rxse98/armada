import { SAPBroadphase } from "cannon-es/src/collision/SAPBroadphase"
import { ContactMaterial } from "cannon-es/src/material/ContactMaterial"
import { Material } from "cannon-es/src/material/Material"
import { World } from "cannon-es/src/world/World"
import { Component } from "../../../src/ecs/classes/Component"
import { Types } from "../../../src/ecs/types/Types"

interface PropTypes {
  physicsWorld: World
}

export class PhysicsWorld extends Component<any> {
  static instance: PhysicsWorld
  frame: number
  physicsWorld: any
  timeStep: number
  groundMaterial = new Material("groundMaterial")
  wheelMaterial = new Material("wheelMaterial")
  wheelGroundContactMaterial = new ContactMaterial(this.wheelMaterial, this.groundMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000
  })
  constructor() {
    super()
    PhysicsWorld.instance = this
    this.frame = 0
    this.physicsWorld = new World()
    this.timeStep = 1 / 60
    this.physicsWorld.gravity.set(0, -10, 0)
    //  this.physicsWorld.broadphase = new NaiveBroadphase();
    this.physicsWorld.broadphase = new SAPBroadphase(this.physicsWorld)

    // We must add the contact materials to the world
    this.physicsWorld.addContactMaterial(PhysicsWorld.instance.wheelGroundContactMaterial)
  }
}
PhysicsWorld.schema = {
  physicsWorld: { type: Types.Ref, default: null }
}
