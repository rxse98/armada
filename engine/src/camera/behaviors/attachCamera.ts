import { Behavior } from "../../common/interfaces/Behavior"
import { Entity } from "../../ecs/classes/Entity"
import { CameraComponent } from "../components/CameraComponent"

export const attachCamera: Behavior = (entity: Entity): void => {
  console.log("Attaching camera to entity")
  CameraComponent.instance.followTarget = entity
}
