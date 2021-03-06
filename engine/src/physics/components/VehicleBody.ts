import { Vector3 } from "../../../src/common"
import { Component } from "../../../src/ecs/classes/Component"
import { Types } from "../../../src/ecs/types/Types"

interface PropTypes {
  wheelMesh: any
  convexMesh: any
  mass: number
  scale: Vector3
}

export class VehicleBody extends Component<PropTypes> {
  wheelMesh: any
  convexMesh: any
  mass: number
  scale: number[]
}

VehicleBody.schema = {
  mass: { type: Types.Number, default: 1 },
  scale: { type: Types.Array, default: [0.2, 0.1, 0.1] },
  wheelMesh: { type: Types.Ref },
  convexMesh: { type: Types.Ref }
}
