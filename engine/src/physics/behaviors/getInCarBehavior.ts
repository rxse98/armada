export const drive: Behavior = (entity: Entity, args: { value: Vector2 }): void => {
  const vehicleComponent = getMutableComponent(entity, VehicleComponent)
  const vehicle = vehicleComponent.vehicle

  vehicle.setBrake(0, 0)
  vehicle.setBrake(0, 1)
  vehicle.setBrake(0, 2)
  vehicle.setBrake(0, 3)

  // forward
  if (args.value[1] > 0) {
    vehicle.applyEngineForce(-vehicleComponent.maxForce, 2)
    vehicle.applyEngineForce(-vehicleComponent.maxForce, 3)
  }
  // backward
  else if (args.value[1] < 0) {
    vehicle.applyEngineForce(vehicleComponent.maxForce, 2)
    vehicle.applyEngineForce(vehicleComponent.maxForce, 3)
    // left
  } else if (args.value[0] > 0) {
    vehicle.setBrake(vehicleComponent.brakeForce, 0)
    vehicle.setBrake(vehicleComponent.brakeForce, 1)
    // right
  } else if (args.value[0] < 0) {
    vehicle.setBrake(vehicleComponent.brakeForce, 2)
    vehicle.setBrake(vehicleComponent.brakeForce, 3)
  }
}
