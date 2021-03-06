import { Object3D } from "three"
import { SceneManager } from "../../classes/SceneManager"
import { Object3DComponent } from "../../components/Object3DComponent"
import {
  AmbientLightProbeTagComponent,
  AmbientLightTagComponent,
  ArrayCameraTagComponent,
  AudioListenerTagComponent,
  AudioTagComponent,
  BoneTagComponent,
  CameraTagComponent,
  CubeCameraTagComponent,
  DirectionalLightTagComponent,
  GroupTagComponent,
  HemisphereLightProbeTagComponent,
  HemisphereLightTagComponent,
  ImmediateRenderObjectTagComponent,
  InstancedMeshTagComponent,
  LightProbeTagComponent,
  LightTagComponent,
  LineLoopTagComponent,
  LineSegmentsTagComponent,
  LineTagComponent,
  LODTagComponent,
  MeshTagComponent,
  OrthographicCameraTagComponent,
  PerspectiveCameraTagComponent,
  PointLightTagComponent,
  PointsTagComponent,
  PositionalAudioTagComponent,
  RectAreaLightTagComponent,
  SceneTagComponent,
  SkinnedMeshTagComponent,
  SpotLightTagComponent,
  SpriteTagComponent
} from "../../components/Object3DTagComponents"
import { Behavior } from "../../interfaces/Behavior"
import { Entity } from "../../../ecs/classes/Entity"
import { ComponentConstructor, Component } from "../../../ecs/classes/Component"
import {
  addComponent,
  getMutableComponent,
  hasComponent,
  getComponent,
  removeComponent,
  removeEntity
} from "../../../ecs/functions/EntityFunctions"
import { hasRegisteredComponent, registerComponent } from "../../../ecs/functions/ComponentFunctions"
import { SkyboxComponent } from "../../../scene/components/SkyboxComponent"

export function addTagComponentFromBehavior<C>(
  entity: Entity,
  args: { component: ComponentConstructor<Component<C>> }
): void {
  addComponent(entity, args.component, args)
}

export const addObject3DComponent: Behavior = (
  entity: Entity,
  args: { obj: any; objArgs: any; parentEntity?: Entity }
) => {
  const object3d = args.obj ? new args.obj(args.objArgs) : new Object3D()

  if (!hasRegisteredComponent(Object3DComponent as any)) {
    registerComponent(Object3DComponent)
  }
  // object3d = new args.obj(args.objArgs)
  addComponent(entity, Object3DComponent, { value: object3d })
  getMutableComponent<Object3DComponent>(entity, Object3DComponent).value = object3d

  getComponentTags(object3d).forEach((component: any) => {
    addComponent(entity, component)
  })
  if (args.parentEntity === undefined) args.parentEntity = SceneManager.instance.scene
  if (args.parentEntity && hasComponent(args.parentEntity, Object3DComponent as any)) {
    getComponent<Object3DComponent>(args.parentEntity, Object3DComponent).value.add(object3d)
  }
  // Add the obj to our scene graph
  else SceneManager.instance.scene.add(object3d)
  object3d["entity"] = entity
  return entity
}

export function removeObject3DComponent(entity, unparent = true) {
  const object3d = getComponent<Object3DComponent>(entity, Object3DComponent, true).value
  SceneManager.instance.scene.remove(object3d)

  if (unparent) {
    // Using "true" as the entity could be removed somewhere else
    object3d.parent && object3d.parent.remove(object3d)
  }
  removeComponent(entity, Object3DComponent)

  for (let i = entity.componentTypes.length - 1; i >= 0; i--) {
    const Component = entity.componentTypes[i]

    if (Component.isObject3DTagComponent) {
      removeComponent(entity, Component)
    }
  }

  object3d["entity"] = null
}

export function remove(entity, forceImmediate) {
  if (hasComponent<Object3DComponent>(entity, Object3DComponent)) {
    const obj = getObject3D(entity)
    obj.traverse(o => {
      if ((o as any).entity) removeEntity((o as any).entity, forceImmediate)
      ;(o as any).entity = null
    })
    obj.parent && obj.parent.remove(obj)
  }
  removeEntity(entity, forceImmediate)
}

export function getObject3D(entity) {
  const component = getComponent<Object3DComponent>(entity, Object3DComponent)
  return component && component.value
}

export function getComponentTags(object3d: Object3D): Component<any>[] {
  const components: Component<any>[] = []
  if (object3d.type === "Audio" && (object3d as any).panner !== undefined) {
    if (!hasRegisteredComponent<PositionalAudioTagComponent>(PositionalAudioTagComponent))
      registerComponent(PositionalAudioTagComponent)
    components.push(PositionalAudioTagComponent as any)
  }
  if (object3d.type === "Audio" && (object3d as any).panner !== undefined) {
    if (!hasRegisteredComponent(PositionalAudioTagComponent)) registerComponent(PositionalAudioTagComponent)
    components.push(PositionalAudioTagComponent as any)
  } else if (object3d.type === "Audio") {
    if (!hasRegisteredComponent(AudioTagComponent as any)) registerComponent(AudioTagComponent)
    components.push(AudioTagComponent as any)
  } else if (object3d.type === "AudioListener") {
    if (!hasRegisteredComponent(AudioListenerTagComponent as any)) registerComponent(AudioListenerTagComponent)
    components.push(AudioListenerTagComponent as any)
  } else if ((object3d as any).isCamera) {
    if (!hasRegisteredComponent(CameraTagComponent as any)) registerComponent(CameraTagComponent)
    components.push(CameraTagComponent as any)

    if ((object3d as any).isOrthographicCamera) {
      if (!hasRegisteredComponent(OrthographicCameraTagComponent as any))
        registerComponent(OrthographicCameraTagComponent)
      components.push(OrthographicCameraTagComponent as any)
    } else if ((object3d as any).isPerspectiveCamera) {
      if (!hasRegisteredComponent(PerspectiveCameraTagComponent as any))
        registerComponent(PerspectiveCameraTagComponent)
      components.push(PerspectiveCameraTagComponent as any)
    }
    if ((object3d as any).isArrayCamera) {
      if (!hasRegisteredComponent(ArrayCameraTagComponent as any)) registerComponent(ArrayCameraTagComponent)
      components.push(ArrayCameraTagComponent as any)
    } else if (object3d.type === "CubeCamera") {
      if (!hasRegisteredComponent(CubeCameraTagComponent as any)) registerComponent(CubeCameraTagComponent)
      components.push(CubeCameraTagComponent as any)
    } else if ((object3d as any).isImmediateRenderObject) {
      if (!hasRegisteredComponent(ImmediateRenderObjectTagComponent as any))
        registerComponent(ImmediateRenderObjectTagComponent)
      components.push(ImmediateRenderObjectTagComponent as any)
    }
  } else if ((object3d as any).isLight) {
    if (!hasRegisteredComponent(LightTagComponent as any)) registerComponent(LightTagComponent)
    components.push(LightTagComponent as any)

    if ((object3d as any).isAmbientLight) {
      if (!hasRegisteredComponent(AmbientLightTagComponent as any)) registerComponent(AmbientLightTagComponent)
      components.push(AmbientLightTagComponent as any)
    } else if ((object3d as any).isDirectionalLight) {
      if (!hasRegisteredComponent(DirectionalLightTagComponent as any)) registerComponent(DirectionalLightTagComponent)
      components.push(DirectionalLightTagComponent as any)
    } else if ((object3d as any).isHemisphereLight) {
      if (!hasRegisteredComponent(HemisphereLightTagComponent as any)) registerComponent(HemisphereLightTagComponent)
      components.push(HemisphereLightTagComponent as any)
    } else if ((object3d as any).isPointLight) {
      if (!hasRegisteredComponent(PointLightTagComponent as any)) registerComponent(PointLightTagComponent)
      components.push(PointLightTagComponent as any)
    } else if ((object3d as any).isRectAreaLight) {
      if (!hasRegisteredComponent(RectAreaLightTagComponent as any)) registerComponent(RectAreaLightTagComponent)
      components.push(RectAreaLightTagComponent as any)
    } else if ((object3d as any).isSpotLight) {
      if (!hasRegisteredComponent(SpotLightTagComponent as any)) registerComponent(SpotLightTagComponent)
      components.push(SpotLightTagComponent as any)
    }
  } else if ((object3d as any).isLightProbe) {
    if (!hasRegisteredComponent(LightProbeTagComponent as any)) registerComponent(LightProbeTagComponent)
    components.push(LightProbeTagComponent as any)

    if ((object3d as any).isAmbientLightProbe) {
      if (!hasRegisteredComponent(AmbientLightProbeTagComponent as any))
        registerComponent(AmbientLightProbeTagComponent)
      components.push(AmbientLightProbeTagComponent as any)
    } else if ((object3d as any).isHemisphereLightProbe) {
      if (!hasRegisteredComponent(HemisphereLightProbeTagComponent as any))
        registerComponent(HemisphereLightProbeTagComponent)
      components.push(HemisphereLightProbeTagComponent as any)
    }
  } else if ((object3d as any).isBone) {
    if (!hasRegisteredComponent(BoneTagComponent as any)) registerComponent(BoneTagComponent)
    components.push(BoneTagComponent as any)
  } else if ((object3d as any).isGroup) {
    if (!hasRegisteredComponent(GroupTagComponent as any)) registerComponent(GroupTagComponent)
    components.push(GroupTagComponent as any)
  } else if ((object3d as any).isLOD) {
    if (!hasRegisteredComponent(LODTagComponent as any)) registerComponent(LODTagComponent)
    components.push(LODTagComponent as any)
  } else if ((object3d as any).isMesh) {
    if (!hasRegisteredComponent(MeshTagComponent as any)) registerComponent(MeshTagComponent)
    components.push(MeshTagComponent as any)

    if ((object3d as any).isInstancedMesh) {
      if (!hasRegisteredComponent(InstancedMeshTagComponent as any)) registerComponent(InstancedMeshTagComponent)
      components.push(InstancedMeshTagComponent as any)
    } else if ((object3d as any).isSkinnedMesh) {
      if (!hasRegisteredComponent(SkinnedMeshTagComponent as any)) registerComponent(SkinnedMeshTagComponent)
      components.push(SkinnedMeshTagComponent as any)
    }
  } else if ((object3d as any).isLine) {
    if (!hasRegisteredComponent(LineTagComponent as any)) registerComponent(LineTagComponent)
    components.push(LineTagComponent as any)

    if ((object3d as any).isLineLoop) {
      if (!hasRegisteredComponent(LineLoopTagComponent as any)) registerComponent(LineLoopTagComponent)
      components.push(HemisphereLightProbeTagComponent as any)
    } else if ((object3d as any).isLineSegments) {
      if (!hasRegisteredComponent(LineSegmentsTagComponent as any)) registerComponent(LineSegmentsTagComponent)
      components.push(LineSegmentsTagComponent as any)
    }
  } else if ((object3d as any).isPoints) {
    if (!hasRegisteredComponent(PointsTagComponent as any)) registerComponent(PointsTagComponent)
    components.push(PointsTagComponent as any)
  } else if ((object3d as any).isSprite) {
    if (!hasRegisteredComponent(SpriteTagComponent as any)) registerComponent(SpriteTagComponent)
    components.push(SpriteTagComponent as any)
  } else if ((object3d as any).isScene) {
    if (!hasRegisteredComponent(SceneTagComponent as any)) registerComponent(SceneTagComponent)
    components.push(SceneTagComponent as any)
  } else if ((object3d as any).isSky) {
    if (!hasRegisteredComponent(SkyboxComponent as any)) registerComponent(SkyboxComponent)
    components.push(SceneTagComponent as any)
  }
  return components
}
