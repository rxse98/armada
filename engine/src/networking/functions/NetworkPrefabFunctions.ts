import { Entity } from "../../ecs/classes/Entity"
import { createEntity, addComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions"
import { Network } from "../components/Network"
import { NetworkObject } from "../components/NetworkObject"
import { NetworkPrefab } from "../interfaces/NetworkPrefab"
import { hasRegisteredComponent, registerComponent } from "../../ecs/functions/ComponentFunctions"

export function createNetworkPrefab(prefab: NetworkPrefab, networkId: string | number): Entity {
  const entity = createEntity()
  // Add a NetworkObject component to the entity, this will store information about changing state
  addComponent(entity, NetworkObject, { networkId })
  // Call each create action
  prefab.onCreate?.forEach(action => {
    // If it's a networked behavior, or this is the local player, call it
    if (action.networked || networkId === (Network.instance as Network).mySocketID)
      // Call the behavior with the args
      action.behavior(entity, action.args)
  })
  // Instantiate network components
  // These will be attached to the entity on all clients
  prefab.networkComponents?.forEach(component => {
    // Register the component if it hasn't already been registered with the world
    if (!hasRegisteredComponent(component.type)) registerComponent(component.type)
    // Add the component to our entity
    addComponent(entity, component.type)
    // If the component has initialization data...
    // If the component has no initialization data, return
    if (component.data == undefined) return // Get a mutable reference to the component
    const addedComponent = getMutableComponent(entity, component.type)
    // Set initialization data for each key
    Object.keys(component.data).forEach(initValue => {
      // Get the component on the entity, and set it to the initializing value from the prefab
      addedComponent[initValue] = component.data[initValue]
    })
  })
  // Instantiate local components
  // If this is the local player, spawn the local components (these will not be spawned for other clients)
  // This is good for input, camera, etc
  if (networkId === (Network.instance as Network).mySocketID && prefab.components)
    // For each local component on the prefab...
    prefab.components?.forEach(component => {
      // If the component hasn't been registered with the world, register it
      if (!hasRegisteredComponent(component.type)) registerComponent(component.type)
      // The component to the entity
      addComponent(entity, component.type)
      // If the component has no initialization data, return
      if (component.data == undefined) return
      // Get a mutable reference to the component
      const addedComponent = getMutableComponent(entity, component.type)
      // Set initialization data for each key
      Object.keys(component.data).forEach(initValue => {
        // Get the component on the entity, and set it to the initializing value from the prefab
        addedComponent[initValue] = component.data[initValue]
      })
    })
  return entity
}
