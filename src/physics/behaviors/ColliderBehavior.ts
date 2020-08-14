import { Quaternion } from "cannon-es/src/math/Quaternion"
import { Vec3 } from "cannon-es/src/math/Vec3"
import { Behavior } from "../../common/interfaces/Behavior"
import { Object3DComponent } from "ecsy-three"
import { TransformComponent } from "../../transform/components/TransformComponent"
import { PhysicsWorld } from "../components/PhysicsWorld"
import { Entity } from "ecsy"
import { Collider } from "../components/Collider"
import {
  _createBox,
  _createCylinder,
  _createShare,
  _createConvexGeometry,
  _createGroundGeometry
} from "../behaviors/PhysicsBehaviors"

export const quaternion = new Quaternion()
//let quaternion = new THREE.Quaternion();
//let euler = new THREE.Euler();
export const ColliderBehavior: Behavior = (entity: Entity, args): void => {
  if (args.phase == "onAdded") {
    const collider = entity.getMutableComponent(Collider)
    const transform = entity.getMutableComponent(TransformComponent)
    console.log('<--------------------------');
    console.log(transform.position);

  //  const object = entity.getComponent<Object3DComponent>(Object3DComponent).value

    //  object ? "" : (object = { userData: { body: {} } })
    let body
    if (collider.type === "box") body = _createBox(collider, transform)
    else if (collider.type === "cylinder") body = _createCylinder(collider)
    else if (collider.type === "share") body = _createShare(collider)
    else if (collider.type === "convex") body = _createConvexGeometry(collider, null)
    else if (collider.type === "ground") body = _createGroundGeometry(collider)

    //console.log(body);


    body.position = transform.position

    //quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)

    //transform.rotation = quaternion.toArray()
  //  object.userData.collider = body;
    collider.collider = body
    PhysicsWorld.instance._physicsWorld.addBody(body)


  } else if (args.phase == "onRemoved") {
    const collider = entity.getMutableComponent(Collider).collider
    PhysicsWorld.instance._physicsWorld.removeBody(collider)
  //  collider.collider = false
  //  const object = entity.getComponent<Object3DComponent>(Object3DComponent).value
  //  const body = object.userData.body
    //delete object.userData.body
  }
}

/*
function createConvexGeometry( entity , mesh){
  let rigidBody, object, transform, attributePosition
  if( mesh ) {

    object = mesh
    attributePosition = mesh.geometry.attributes.position

  } else {
    rigidBody = entity.getComponent(Collider)
    object = entity.getObject3D();
    transform = entity.getComponent(ECSYTHREEX.Transform)
    attributePosition = object.geometry.attributes.position
  }


  var convexBody = new CANNON.Body({
    mass: 50
  });
    let verts = [], faces = [], normals =[]


    // Get vertice
    for(let j = 0; j < attributePosition.array.length; j+=3){
        verts.push(new CANNON.Vec3( attributePosition.array[j] ,
                                    attributePosition.array[j+1],
                                    attributePosition.array[j+2] ));
    }
    console.log(verts);
    // Get faces

    for(var j=0; j<object.geometry.index.array.length; j+=3){
        faces.push([
          object.geometry.index.array[j],
          object.geometry.index.array[j+1],
          object.geometry.index.array[j+2]
        ]);
    }

    for(var j=0; j<attributeNormal.array.length; j+=3){
        normals.push([
          attributeNormal.array[j],
          attributeNormal.array[j+1],
          attributeNormal.array[j+2]
        ]);
    }

console.log(faces);
console.log(normals);
    // Get offset
  //  let offset = new CANNON.Vec3(200,200,200);

    // Construct polyhedron
    var bunnyPart = new CANNON.ConvexPolyhedron({ vertices: verts, faces });
    console.log(bunnyPart);

    var q = new CANNON.Quaternion();
    q.setFromAxisAngle(new CANNON.Vec3(1,1,0), -Math.PI/2);
  //  body.addShape(cylinderShape, new CANNON.Vec3(), q);
    // Add to compound
    convexBody.addShape(bunnyPart, new CANNON.Vec3(), q)//,offset);
    return convexBody
}
*/