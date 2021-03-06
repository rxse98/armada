import { decelerate } from "../../common/defaults/behaviors/decelerate"
import { jumping } from "../../common/defaults/behaviors/jump"
import { StateSchema } from "../interfaces/StateSchema"
import { DefaultStateTypes } from "./DefaultStateTypes"

export const DefaultStateGroups = {
  MOVEMENT: 0,
  MOVEMENT_MODIFIERS: 1
}

export const DefaultStateSchema: StateSchema = {
  groups: {
    [DefaultStateGroups.MOVEMENT]: {
      exclusive: true,
      default: DefaultStateTypes.IDLE,
      states: [DefaultStateTypes.IDLE, DefaultStateTypes.MOVING]
    },
    [DefaultStateGroups.MOVEMENT_MODIFIERS]: {
      exclusive: true,
      states: [DefaultStateTypes.CROUCHING, DefaultStateTypes.SPRINTING, DefaultStateTypes.JUMPING]
    }
  },
  states: {
    [DefaultStateTypes.IDLE]: { group: DefaultStateGroups.MOVEMENT, onUpdate: { behavior: decelerate } },
    [DefaultStateTypes.MOVING]: {
      group: DefaultStateGroups.MOVEMENT
    },
    [DefaultStateTypes.JUMPING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, onUpdate: { behavior: jumping } },
    [DefaultStateTypes.CROUCHING]: {
      group: DefaultStateGroups.MOVEMENT_MODIFIERS,
      blockedBy: DefaultStateTypes.JUMPING
    },
    [DefaultStateTypes.SPRINTING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS }
  }
}
