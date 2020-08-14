import { Behavior } from "../../common/interfaces/Behavior"
import { Entity } from "ecsy"
import { VehicleComponent } from "../components/VehicleComponent"
import { Vector2 } from "../../common/types/NumericalTypes"

export const drive: Behavior = (entity: Entity, args: { value: Vector2 }): void => {
  const vehicleComponent = entity.getMutableComponent(VehicleComponent)
  const vehicle = vehicleComponent.vehicle

  vehicle.setBrake(0, 0)
  vehicle.setBrake(0, 1)
  vehicle.setBrake(0, 2)
  vehicle.setBrake(0, 3)

  // forward
  if (args.value[1] > 0) {
    vehicle.applyEngineForce(-vehicleComponent.maxForce * args.value[1], 2)
    vehicle.applyEngineForce(-vehicleComponent.maxForce * args.value[1], 3)
  }
  // backward
  else if (args.value[1] < 0) {
    vehicle.applyEngineForce(vehicleComponent.maxForce * args.value[1], 2)
    vehicle.applyEngineForce(vehicleComponent.maxForce * args.value[1], 3)
    // stop
  } else if (args.value[0] > 0) {
    vehicle.setBrake(vehicleComponent.brakeForce, 0)
    vehicle.setBrake(vehicleComponent.brakeForce, 1)
    vehicle.setBrake(vehicleComponent.brakeForce, 2)
    vehicle.setBrake(vehicleComponent.brakeForce, 3)
  }
}