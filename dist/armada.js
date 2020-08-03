import { Component, Types, TagComponent, System } from 'ecsy';
import { Transform } from 'ecsy-three/src/extras/components';

// Constructs a component with a map and data values
// Data contains a map() of arbitrary data
class BehaviorComponent extends Component {
    constructor() {
        super(false);
        this.data = new Map();
        this.data = new Map();
    }
    copy(src) {
        this.map = src.map;
        this.data = new Map(src.data);
        return this;
    }
    reset() {
        this.data.clear();
    }
}

// Default component, holds data about what behaviors our character has.
const defaultJumpValues = {
    canJump: true,
    t: 0,
    height: 1.0,
    duration: 1
};
class Actor extends Component {
    constructor() {
        super();
        this.jump = defaultJumpValues;
        this.reset();
    }
    copy(src) {
        this.rotationSpeedX = src.rotationSpeedX;
        this.rotationSpeedY = src.rotationSpeedY;
        this.maxSpeed = src.maxSpeed;
        this.accelerationSpeed = src.accelerationSpeed;
        this.jump = src.jump;
        return this;
    }
    reset() {
        this.rotationSpeedX = 1;
        this.rotationSpeedY = 1;
        this.maxSpeed = 10;
        this.accelerationSpeed = 1;
        this.jump = defaultJumpValues;
    }
}

const vector3Identity = [0, 0, 0];
const vector3ScaleIdentity = [1, 1, 1];
const quaternionIdentity = [0, 0, 0, 1];
class TransformComponent extends Component {
    constructor() {
        super();
        this.position = vector3Identity;
        this.rotation = quaternionIdentity;
        this.scale = vector3ScaleIdentity;
        this.velocity = vector3Identity;
        this.position = vector3Identity;
        this.rotation = quaternionIdentity;
        this.scale = vector3ScaleIdentity;
        this.velocity = vector3Identity;
    }
    copy(src) {
        this.position = src.position;
        this.rotation = src.rotation;
        this.scale = src.scale;
        this.velocity = src.velocity;
        return this;
    }
    reset() {
        this.position = vector3Identity;
        this.rotation = quaternionIdentity;
        this.scale = vector3ScaleIdentity;
        this.velocity = vector3Identity;
    }
}

let actor;
let transform;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const decelerate = (entity, delta) => {
    // get actor comonent
    actor = entity.getComponent(Actor);
    // get the transform
    transform = entity.getMutableComponent(TransformComponent);
    // if magnitude of velocity is more than .001
    // if (vec3.length(transform.velocity as vec3) > 0.001) {
    //   // add to velocity by adding state value * acceleration * delta
    //   transform.velocity[0] *= Math.max(1.0 - actor.accelerationSpeed * delta, 0)
    //   // transform.velocity[1] *= Math.max(1.0 - actor.accelerationSpeed * delta, 0)
    //   transform.velocity[2] *= Math.max(1.0 - actor.accelerationSpeed * delta, 0)
    //   console.log(transform.velocity[0] + " | " + transform.velocity[1] + " | " + transform.velocity[2])
    // }
    // clamp velocity to max value
};

class State extends BehaviorComponent {
}

const BinaryValue = {
    ON: 1,
    OFF: 0
};

var StateType;
(function (StateType) {
    StateType[StateType["DISCRETE"] = 0] = "DISCRETE";
    StateType[StateType["ONED"] = 1] = "ONED";
    StateType[StateType["TWOD"] = 2] = "TWOD";
    StateType[StateType["THREED"] = 3] = "THREED";
})(StateType || (StateType = {}));

var LifecycleValue;
(function (LifecycleValue) {
    LifecycleValue[LifecycleValue["STARTED"] = 0] = "STARTED";
    LifecycleValue[LifecycleValue["CONTINUED"] = 1] = "CONTINUED";
    LifecycleValue[LifecycleValue["ENDED"] = 2] = "ENDED";
})(LifecycleValue || (LifecycleValue = {}));
var LifecycleValue$1 = LifecycleValue;

let stateComponent;
let stateGroup;
const toggleState = (entity, args) => {
    if (args.value === BinaryValue.ON)
        addState(entity, args);
    else
        removeState(entity, args);
};
const addState = (entity, args) => {
    stateComponent = entity.getComponent(State);
    if (stateComponent.data.has(args.state))
        return;
    console.log("Adding state: " + args.state);
    stateComponent.data.set(args.state, {
        state: args.state,
        type: StateType.DISCRETE,
        lifecycleState: LifecycleValue$1.STARTED,
        group: stateComponent.map.states[args.state].group
    });
    stateGroup = stateComponent.map.states[args.state].group;
    // If state group is set to exclusive (XOR) then check if other states from state group are on
    if (stateComponent.map.groups[stateGroup].exclusive) {
        stateComponent.map.groups[stateGroup].states.forEach(state => {
            if (state === args.state || !stateComponent.data.has(state))
                return;
            stateComponent.data.delete(state);
            console.log("Removed mutex state " + state);
        });
    }
};
const removeState = (entity, args) => {
    // check state group
    stateComponent = entity.getComponent(State);
    if (stateComponent.data.has(args.state)) {
        stateComponent.data.delete(args.state);
        console.log("Removed component from " + entity.id);
    }
};
const hasState = (entity, args) => {
    // check state group
    stateComponent = entity.getComponent(State);
    if (stateComponent.data.has(args.state))
        return true;
    return false;
};

const DefaultStateTypes = {
    // Main States
    IDLE: 0,
    MOVING: 1,
    JUMPING: 2,
    FALLING: 3,
    // Modifier States
    CROUCHING: 4,
    WALKING: 5,
    SPRINTING: 6,
    INTERACTING: 7,
    // Moving substates
    MOVING_FORWARD: 8,
    MOVING_BACKWARD: 9,
    MOVING_LEFT: 10,
    MOVING_RIGHT: 11
};

let actor$1;
let transform$1;
const jump = (entity) => {
    console.log("Jump!");
    addState(entity, { state: DefaultStateTypes.JUMPING });
    actor$1 = entity.getMutableComponent(Actor);
    actor$1.jump.t = 0;
};
const jumping = (entity, args, delta) => {
    transform$1 = entity.getComponent(TransformComponent);
    actor$1 = entity.getMutableComponent(Actor);
    actor$1.jump.t += delta;
    if (actor$1.jump.t < actor$1.jump.duration) {
        transform$1.velocity[1] = transform$1.velocity[1] + Math.cos((actor$1.jump.t / actor$1.jump.duration) * Math.PI);
        console.log("Jumping: " + actor$1.jump.t);
        return;
    }
    removeState(entity, { state: DefaultStateTypes.JUMPING });
    console.log("Jumped");
};

// Input inherits from BehaviorComponent, which adds .map and .data
class Input extends BehaviorComponent {
}
// Set schema to itself plus gamepad data
Input.schema = Object.assign(Object.assign({}, Input.schema), { gamepadConnected: { type: Types.Boolean, default: false }, gamepadThreshold: { type: Types.Number, default: 0.1 }, gamepadButtons: { type: Types.Array, default: [] }, gamepadInput: { type: Types.Array, default: [] } });

// Button -- discrete states of ON and OFF, like a button
// OneD -- one dimensional value between 0 and 1, or -1 and 1, like a trigger
// TwoD -- Two dimensional value with x: -1, 1 and y: -1, 1 like a mouse input
// ThreeD -- Three dimensional value, just in case
// 6DOF -- Six dimensional input, three for pose and three for rotation (in euler?), i.e. for VR controllers
var InputType;
(function (InputType) {
    InputType[InputType["BUTTON"] = 0] = "BUTTON";
    InputType[InputType["ONED"] = 1] = "ONED";
    InputType[InputType["TWOD"] = 2] = "TWOD";
    InputType[InputType["THREED"] = 3] = "THREED";
    InputType[InputType["SIXDOF"] = 4] = "SIXDOF";
})(InputType || (InputType = {}));

class Crouching extends TagComponent {
}

class Sprinting extends TagComponent {
}

let input;
let actor$2;
let transform$2;
let inputValue; // Could be a (small) source of garbage
let outputSpeed;
const move = (entity, args, delta) => {
    input = entity.getComponent(Input);
    actor$2 = entity.getComponent(Actor);
    transform$2 = entity.getMutableComponent(TransformComponent);
    const movementModifer = entity.hasComponent(Crouching) ? 0.5 : entity.hasComponent(Sprinting) ? 1.5 : 1.0;
    const inputType = args.inputType;
    outputSpeed = actor$2.accelerationSpeed * delta * movementModifer;
    if (inputType === InputType.TWOD) {
        inputValue = args.value;
        transform$2.velocity[0] = Math.min(transform$2.velocity[0] + inputValue[0] * outputSpeed, actor$2.maxSpeed);
        transform$2.velocity[2] = Math.min(transform$2.velocity[2] + inputValue[1] * outputSpeed, actor$2.maxSpeed);
    }
    else if (inputType === InputType.THREED) {
        inputValue = input.data.get(args.input).value;
        transform$2.velocity[0] = Math.min(transform$2.velocity[0] + inputValue[0] * outputSpeed, actor$2.maxSpeed);
        transform$2.velocity[1] = Math.min(transform$2.velocity[1] + inputValue[1] * outputSpeed, actor$2.maxSpeed);
        transform$2.velocity[2] = Math.min(transform$2.velocity[2] + inputValue[2] * outputSpeed, actor$2.maxSpeed);
    }
    else {
        console.error("Movement is only available for 2D and 3D inputs");
    }
    console.log("Moved");
};

/**
 * Common utilities
 * @module glMatrix
 */
// Configuration Constants
var EPSILON = 0.000001;
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
if (!Math.hypot) Math.hypot = function () {
  var y = 0,
      i = arguments.length;

  while (i--) {
    y += arguments[i] * arguments[i];
  }

  return Math.sqrt(y);
};

/**
 * 3x3 Matrix
 * @module mat3
 */

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */

function create() {
  var out = new ARRAY_TYPE(9);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }

  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}

/**
 * 3 Dimensional Vector
 * @module vec3
 */

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */

function create$1() {
  var out = new ARRAY_TYPE(3);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  return out;
}
/**
 * Calculates the length of a vec3
 *
 * @param {ReadonlyVec3} a vector to calculate length of
 * @returns {Number} length of a
 */

function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.hypot(x, y, z);
}
/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */

function fromValues(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to normalize
 * @returns {vec3} out
 */

function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}
/**
 * Calculates the dot product of two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function cross(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2];
  var bx = b[0],
      by = b[1],
      bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
/**
 * Alias for {@link vec3.length}
 * @function
 */

var len = length;
/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach = function () {
  var vec = create$1();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 3;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }

    return a;
  };
}();

/**
 * 4 Dimensional Vector
 * @module vec4
 */

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */

function create$2() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }

  return out;
}
/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */

function set(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to normalize
 * @returns {vec4} out
 */

function normalize$1(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len = x * x + y * y + z * z + w * w;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }

  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
  return out;
}
/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach$1 = function () {
  var vec = create$2();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 4;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }

    return a;
  };
}();

/**
 * Quaternion
 * @module quat
 */

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */

function create$3() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  out[3] = 1;
  return out;
}
/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyVec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/

function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {quat} out
 */

function multiply(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

function slerp(out, a, b, t) {
  // benchmarks:
  //    http://jsperf.com/quaternion-slerp-implementations
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  var omega, cosom, sinom, scale0, scale1; // calc cosine

  cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)

  if (cosom < 0.0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  } // calculate coefficients


  if (1.0 - cosom > EPSILON) {
    // standard case (slerp)
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    // "from" and "to" quaternions are very close
    //  ... so we can do a linear interpolation
    scale0 = 1.0 - t;
    scale1 = t;
  } // calculate final values


  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyMat3} m rotation matrix
 * @returns {quat} out
 * @function
 */

function fromMat3(out, m) {
  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;

  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0); // 2w

    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot; // 1/(4w)

    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    // |w| <= 1/2
    var i = 0;
    if (m[4] > m[0]) i = 1;
    if (m[8] > m[i * 3 + i]) i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }

  return out;
}
/**
 * Creates a quaternion from the given euler angle x, y, z.
 *
 * @param {quat} out the receiving quaternion
 * @param {x} Angle to rotate around X axis in degrees.
 * @param {y} Angle to rotate around Y axis in degrees.
 * @param {z} Angle to rotate around Z axis in degrees.
 * @returns {quat} out
 * @function
 */

function fromEuler(out, x, y, z) {
  var halfToRad = 0.5 * Math.PI / 180.0;
  x *= halfToRad;
  y *= halfToRad;
  z *= halfToRad;
  var sx = Math.sin(x);
  var cx = Math.cos(x);
  var sy = Math.sin(y);
  var cy = Math.cos(y);
  var sz = Math.sin(z);
  var cz = Math.cos(z);
  out[0] = sx * cy * cz - cx * sy * sz;
  out[1] = cx * sy * cz + sx * cy * sz;
  out[2] = cx * cy * sz - sx * sy * cz;
  out[3] = cx * cy * cz + sx * sy * sz;
  return out;
}
/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */

var set$1 = set;
/**
 * Alias for {@link quat.multiply}
 * @function
 */

var mul = multiply;
/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */

var normalize$2 = normalize$1;
/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {ReadonlyVec3} a the initial vector
 * @param {ReadonlyVec3} b the destination vector
 * @returns {quat} out
 */

var rotationTo = function () {
  var tmpvec3 = create$1();
  var xUnitVec3 = fromValues(1, 0, 0);
  var yUnitVec3 = fromValues(0, 1, 0);
  return function (out, a, b) {
    var dot$1 = dot(a, b);

    if (dot$1 < -0.999999) {
      cross(tmpvec3, xUnitVec3, a);
      if (len(tmpvec3) < 0.000001) cross(tmpvec3, yUnitVec3, a);
      normalize(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot$1 > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot$1;
      return normalize$2(out, out);
    }
  };
}();
/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {ReadonlyQuat} c the third operand
 * @param {ReadonlyQuat} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

var sqlerp = function () {
  var temp1 = create$3();
  var temp2 = create$3();
  return function (out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}();
/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {ReadonlyVec3} view  the vector representing the viewing direction
 * @param {ReadonlyVec3} right the vector representing the local "right" direction
 * @param {ReadonlyVec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */

var setAxes = function () {
  var matr = create();
  return function (out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize$2(out, fromMat3(out, matr));
  };
}();

let actor$3;
let transform$3;
let inputValue$1;
const q = [0, 0, 0, 0];
const qOut = [0, 0, 0, 0];
let inputComponent;
const rotateAround = (entity, args, delta) => {
    inputComponent = entity.getComponent(Input);
    actor$3 = entity.getComponent(Actor);
    transform$3 = entity.getComponent(TransformComponent);
    if (!inputComponent.data.has(args.input)) {
        inputComponent.data.set(args.input, { type: args.inputType, value: create$1() });
    }
    set$1(qOut, transform$3.rotation[0], transform$3.rotation[1], transform$3.rotation[2], transform$3.rotation[3]);
    if (args.inputType === InputType.TWOD) {
        if (inputComponent.data.has(args.input)) {
            inputValue$1 = inputComponent.data.get(args.input).value;
            fromEuler(q, inputValue$1[1] * actor$3.rotationSpeedY * delta, inputValue$1[0] * actor$3.rotationSpeedX * delta, 0);
        }
    }
    else if (args.inputType === InputType.THREED) {
        inputValue$1 = inputComponent.data.get(args.input).value;
        fromEuler(q, inputValue$1[0] * actor$3.rotationSpeedY * delta, inputValue$1[1] * actor$3.rotationSpeedX * delta, inputValue$1[2] * actor$3.rotationSpeedZ * delta);
    }
    else {
        console.error("Rotation is only available for 2D and 3D inputs");
    }
    mul(qOut, q, qOut);
    transform$3.rotation = [qOut[0], qOut[1], qOut[2], qOut[3]];
    console.log("rotated ");
};

let transform$4;
const updatePosition = (entity, delta) => {
    transform$4 = entity.getMutableComponent(TransformComponent);
    // if (vec3.length(transform.velocity as vec3) > 0.001)
    //   vec3.add(transform.position as vec3, transform.position as vec3, vec3.scale(_output, transform.velocity as vec3, delta))
};

class TransformComponentSystem extends System {
    execute(delta, time) {
        var _a, _b;
        (_a = this.queries.transforms.added) === null || _a === void 0 ? void 0 : _a.forEach(entity => {
            console.log('TransformComponentSystem query added');
            const armadaTransform = entity.getComponent(TransformComponent);
            const transform = entity.getMutableComponent(Transform);
            const input = entity.getMutableComponent(Input);
            let pos = armadaTransform.position;
            let rot = armadaTransform.rotation;
            transform.position.set(pos[0], pos[1], pos[2]);
            transform.rotation.set(rot[0], rot[1], rot[2]);
        });
        (_b = this.queries.transforms.changed) === null || _b === void 0 ? void 0 : _b.forEach(entity => {
            const armadaTransform = entity.getComponent(TransformComponent);
            const transform = entity.getMutableComponent(Transform);
            let pos = armadaTransform.position;
            let rot = armadaTransform.rotation;
            transform.position.set(pos[0], pos[1], pos[2]);
            transform.rotation.set(rot[0], rot[1], rot[2]);
        });
    }
}
TransformComponentSystem.queries = {
    transforms: {
        components: [Transform, TransformComponent],
        listen: {
            added: true,
            changed: true,
            removed: true
        }
    }
};

var Thumbsticks;
(function (Thumbsticks) {
    Thumbsticks[Thumbsticks["Left"] = 0] = "Left";
    Thumbsticks[Thumbsticks["Right"] = 1] = "Right";
})(Thumbsticks || (Thumbsticks = {}));

// Local reference to input component
let input$1;
const _value = [0, 0];
// System behavior called whenever the mouse pressed
const handleMouseMovement = (entity, args) => {
    input$1 = entity.getComponent(Input);
    _value[0] = (args.event.clientX / window.innerWidth) * 2 - 1;
    _value[1] = (args.event.clientY / window.innerHeight) * -2 + 1;
    // Set type to TWOD (two-dimensional axis) and value to a normalized -1, 1 on X and Y
    input$1.data.set(input$1.map.mouseInputMap.axes["mousePosition"], {
        type: InputType.TWOD,
        value: _value
    });
};
// System behavior called when a mouse button is fired
const handleMouseButton = (entity, args) => {
    // Get immutable reference to Input and check if the button is defined -- ignore undefined buttons
    input$1 = entity.getComponent(Input);
    if (input$1.map.mouseInputMap.buttons[args.event.button] === undefined)
        return; // Set type to BUTTON (up/down discrete state) and value to up or down, as called by the DOM mouse events
    if (args.value === BinaryValue.ON) {
        console.log("Mouse button down: " + args.event.button);
        input$1.data.set(input$1.map.mouseInputMap.buttons[args.event.button], {
            type: InputType.BUTTON,
            value: args.value
        });
    }
    else {
        console.log("Mouse button up" + args.event.button);
        input$1.data.delete(input$1.map.mouseInputMap.buttons[args.event.button]);
    }
};
// System behavior called when a keyboard key is pressed
function handleKey(entity, args) {
    // Get immutable reference to Input and check if the button is defined -- ignore undefined keys
    input$1 = entity.getComponent(Input);
    if (input$1.map.keyboardInputMap[args.event.key] === undefined)
        return;
    // If the key is in the map but it's in the same state as now, let's skip it (debounce)
    if (input$1.data.has(input$1.map.keyboardInputMap[args.event.key]) && input$1.data.get(input$1.map.keyboardInputMap[args.event.key]).value === args.value)
        return;
    // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
    if (args.value === BinaryValue.ON) {
        console.log("Key down: " + args.event.key);
        input$1.data.set(input$1.map.keyboardInputMap[args.event.key], {
            type: InputType.BUTTON,
            value: args.value
        });
    }
    else {
        console.log("Key up: " + args.event.key);
        input$1.data.delete(input$1.map.mouseInputMap.buttons[args.event.key]);
    }
}

/**
 *
 * @param value -1 to 1
 * @param threshold 0 to 1
 */
function applyThreshold(value, threshold) {
    if (threshold >= 1) {
        return 0;
    }
    if (value < threshold && value > -threshold) {
        return 0;
    }
    return (Math.sign(value) * (Math.abs(value) - threshold)) / (1 - threshold);
}

const inputPerGamepad = 2;
let input$2;
let gamepads;
let input0;
let input1;
let gamepad;
let inputBase;
let x;
let y;
let prevLeftX;
let prevLeftY;
let _index; // temp var for iterator loops
// System behavior to handle gamepad input
const handleGamepads = (entity) => {
    if (!input$2.gamepadConnected)
        return;
    // Get an immutable reference to input
    input$2 = entity.getComponent(Input);
    // Get gamepads from the DOM
    gamepads = navigator.getGamepads();
    // Loop over connected gamepads
    for (_index = 0; _index < gamepads.length; _index++) {
        // If there's no gamepad at this index, skip
        if (!gamepads[_index])
            return;
        // Hold reference to this gamepad
        gamepad = gamepads[_index];
        // If the gamepad has analog inputs (dpads that aren't up UP/DOWN/L/R but have -1 to 1 values for X and Y)
        if (gamepad.axes) {
            input0 = inputPerGamepad * _index;
            input1 = inputPerGamepad * _index + 1;
            // GamePad 0 LStick XY
            if (input$2.map.eventBindings.input[input0] && gamepad.axes.length >= inputPerGamepad)
                handleGamepadAxis(entity, { gamepad: gamepad, inputIndex: 0, mappedInputValue: input$2.map.gamepadInputMap.axes[input0] });
            // GamePad 1 LStick XY
            if (input$2.map.gamepadInputMap.axes[input1] && gamepad.axes.length >= inputPerGamepad * 2)
                handleGamepadAxis(entity, { gamepad, inputIndex: 1, mappedInputValue: input$2.map.gamepadInputMap.axes[input1] });
        }
        // If the gamepad doesn't have buttons, or the input isn't mapped, return
        if (!gamepad.buttons || !input$2.map.gamepadInputMap.axes)
            return;
        // Otherwise, loop through gamepad buttons
        for (_index = 0; _index < gamepad.buttons.length; _index++) {
            handleGamepadButton(entity, { gamepad, index: _index, mappedInputValue: input$2.map.gamepadInputMap.axes[input1] });
        }
    }
};
const handleGamepadButton = (entity, args) => {
    // Get mutable component reference
    input$2 = entity.getMutableComponent(Input);
    // Make sure button is in the map
    if (typeof input$2.map.gamepadInputMap.axes[args.index] === "undefined" ||
        gamepad.buttons[args.index].touched === (input$2.gamepadButtons[args.index] === BinaryValue.ON))
        return;
    // Set input data
    input$2.data.set(input$2.map.gamepadInputMap.axes[args.index], {
        type: InputType.BUTTON,
        value: gamepad.buttons[args.index].touched ? BinaryValue.ON : BinaryValue.OFF
    });
    input$2.gamepadButtons[args.index] = gamepad.buttons[args.index].touched ? 1 : 0;
};
const handleGamepadAxis = (entity, args) => {
    // get immutable component reference
    input$2 = entity.getComponent(Input);
    inputBase = args.inputIndex * 2;
    x = applyThreshold(gamepad.axes[inputBase], input$2.gamepadThreshold);
    y = applyThreshold(gamepad.axes[inputBase + 1], input$2.gamepadThreshold);
    prevLeftX = input$2.gamepadInput[inputBase];
    prevLeftY = input$2.gamepadInput[inputBase + 1];
    // Axis has changed, so get mutable reference to Input and set data
    if (x !== prevLeftX || y !== prevLeftY) {
        entity.getMutableComponent(Input).data.set(args.mappedInputValue, {
            type: InputType.TWOD,
            value: [x, y]
        });
        input$2.gamepadInput[inputBase] = x;
        input$2.gamepadInput[inputBase + 1] = y;
    }
};
// When a gamepad connects
const handleGamepadConnected = (entity, args) => {
    input$2 = entity.getMutableComponent(Input);
    console.log("A gamepad connected:", args.event.gamepad, args.event.gamepad.mapping);
    if (args.event.gamepad.mapping !== "standard")
        return console.error("Non-standard gamepad mapping detected, not properly handled");
    input$2.gamepadConnected = true;
    gamepad = args.event.gamepad;
    for (let index = 0; index < gamepad.buttons.length; index++) {
        if (typeof input$2.gamepadButtons[index] === "undefined")
            input$2.gamepadButtons[index] = 0;
    }
};
// When a gamepad disconnects
const handleGamepadDisconnected = (entity, args) => {
    input$2 = entity.getMutableComponent(Input);
    console.log("A gamepad disconnected:", args.event.gamepad);
    input$2.gamepadConnected = false;
    if (!input$2.map)
        return; // Already disconnected?
    for (let index = 0; index < input$2.gamepadButtons.length; index++) {
        if (input$2.gamepadButtons[index] === BinaryValue.ON && typeof input$2.map.gamepadInputMap.axes[index] !== "undefined") {
            input$2.data.set(input$2.map.gamepadInputMap.axes[index], {
                type: InputType.BUTTON,
                value: BinaryValue.OFF
            });
        }
        input$2.gamepadButtons[index] = 0;
    }
};

function setTouchHandler(touchHandler) {
    if ("verticalZoomIn" in touchHandler ||
        "verticalZoomOut" in touchHandler ||
        "horizontalZoomIn" in touchHandler ||
        "horizontalZoomOut" in touchHandler) {
        const zoomInOutHandler = {};
        zoomInOutHandler.th = touchHandler;
        zoomInOutHandler.tpCache = [];
        zoomInOutHandler.handle_zoom_in_out = function (ev) {
            if (ev.targetTouches.length === 2 && ev.changedTouches.length === 2) {
                const new_point1 = ev.targetTouches[0], new_point2 = ev.targetTouches[1];
                let point1 = -1, point2 = -1; // Old points indexes.
                // Find old points in tpCache.
                for (let i = 0; i < this.tpCache.length; i++) {
                    if (this.tpCache[i].identifier === new_point1.identifier)
                        point1 = i;
                    if (this.tpCache[i].identifier === new_point2.identifier)
                        point2 = i;
                }
                if (point1 === -1 || point2 === -1) {
                    this.tpCache = [];
                    return;
                }
                // This threshold is device dependent as well as application specific.
                const threshold = Math.min(ev.target.clientWidth, ev.target.clientHeight) / 10;
                // Calculate the difference between the start and move coordinates.
                const y_distance = Math.abs(this.tpCache[point1].clientY - this.tpCache[point2].clientY);
                const new_y_distance = Math.abs(new_point1.clientY - new_point2.clientY);
                const y_distance_diff = Math.abs(y_distance - new_y_distance);
                const x_distance = Math.abs(this.tpCache[point1].clientX - this.tpCache[point2].clientX);
                const new_x_distance = Math.abs(new_point1.clientX - new_point2.clientX);
                const x_distance_diff = Math.abs(x_distance - new_x_distance);
                if (y_distance_diff > threshold && x_distance_diff < threshold) {
                    ev.target.style.background = "green";
                    if (new_y_distance > y_distance) {
                        if ("verticalZoomOut" in this.th)
                            this.th.verticalZoomOut();
                    }
                    else {
                        if ("verticalZoomIn" in this.th)
                            this.th.verticalZoomIn();
                    }
                    this.tpCache[point1] = new_point1;
                    this.tpCache[point2] = new_point2;
                    return;
                }
                if (x_distance_diff > threshold && y_distance_diff < threshold) {
                    if (new_x_distance > x_distance) {
                        if ("horizontalZoomOut" in this.th)
                            this.th.horizontalZoomOut();
                    }
                    else {
                        if ("horizontalZoomIn" in this.th)
                            this.th.horizontalZoomIn();
                    }
                    this.tpCache[point1] = new_point1;
                    this.tpCache[point2] = new_point2;
                }
            }
        };
        zoomInOutHandler.touch_start = function (ev) {
            // If the user makes simultaneous touches, the browser will fire a
            // separate touchstart event for each touch point. Thus if there are
            // three simultaneous touches, the first touchstart event will have
            // targetTouches length of one, the second event will have a length
            // of two, and so on.
            ev.preventDefault();
            // Cache the touch points for later processing of 2-touch zoom.
            if (ev.targetTouches.length === 2) {
                for (let i = 0; i < ev.targetTouches.length; i++)
                    this.tpCache.push(ev.targetTouches[i]);
            }
            if ("touchStart" in this.th)
                this.th.touchStart();
        };
        zoomInOutHandler.touch_move = function (ev) {
            ev.preventDefault();
            this.handle_zoom_in_out(ev);
            if ("touchMove" in this.th)
                this.th.touchMove();
        };
        zoomInOutHandler.touch_end_handler = function (ev) {
            ev.preventDefault();
            if (ev.targetTouches.length === 0)
                this.tpCache = [];
            if ("touchEnd" in this.th)
                this.th.touchEnd();
        };
        touchHandler.element.ontouchstart = zoomInOutHandler.touch_start.bind(zoomInOutHandler);
        touchHandler.element.ontouchend = zoomInOutHandler.touch_end.bind(zoomInOutHandler);
        touchHandler.element.ontouchcancel = touchHandler.element.ontouchend;
        touchHandler.element.ontouchmove = zoomInOutHandler.touch_move.bind(zoomInOutHandler);
    }
    else {
        touchHandler.element.ontouchstart = touchHandler.touchStart.bind(touchHandler);
        touchHandler.element.ontouchend = touchHandler.touchEnd.bind(touchHandler);
        touchHandler.element.ontouchcancel = touchHandler.element.ontouchend;
        touchHandler.element.ontouchmove = touchHandler.touchMove.bind(touchHandler);
    }
}

var GamepadButtons;
(function (GamepadButtons) {
    GamepadButtons[GamepadButtons["A"] = 0] = "A";
    GamepadButtons[GamepadButtons["B"] = 1] = "B";
    GamepadButtons[GamepadButtons["X"] = 2] = "X";
    GamepadButtons[GamepadButtons["Y"] = 3] = "Y";
    GamepadButtons[GamepadButtons["LBumper"] = 4] = "LBumper";
    GamepadButtons[GamepadButtons["RBumper"] = 5] = "RBumper";
    GamepadButtons[GamepadButtons["LTrigger"] = 6] = "LTrigger";
    GamepadButtons[GamepadButtons["RTrigger"] = 7] = "RTrigger";
    GamepadButtons[GamepadButtons["Back"] = 8] = "Back";
    GamepadButtons[GamepadButtons["Start"] = 9] = "Start";
    GamepadButtons[GamepadButtons["LStick"] = 10] = "LStick";
    GamepadButtons[GamepadButtons["RString"] = 11] = "RString";
    GamepadButtons[GamepadButtons["DPad1"] = 12] = "DPad1";
    GamepadButtons[GamepadButtons["DPad2"] = 13] = "DPad2";
    GamepadButtons[GamepadButtons["DPad3"] = 14] = "DPad3";
    GamepadButtons[GamepadButtons["DPad4"] = 15] = "DPad4";
})(GamepadButtons || (GamepadButtons = {}));

function preventDefault(e) {
    event.preventDefault();
}

const keys = { 37: 1, 38: 1, 39: 1, 40: 1 };
function preventDefault$1(e) {
    e.preventDefault();
}
function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault$1(e);
        return false;
    }
}
// modern Chrome requires { passive: false } when adding event
let supportsPassive = false;
try {
    window.addEventListener("test", null, Object.defineProperty({}, "passive", {
        get: function () {
            supportsPassive = true;
        }
    }));
    // eslint-disable-next-line no-empty
}
catch (e) { }
const wheelOpt = supportsPassive ? { passive: false } : false;
// const wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : "mousewheel"
// call this to Disable
function disableScroll() {
    window.addEventListener("DOMMouseScroll", preventDefault$1, false); // older FF
    // window.addEventListener(wheelEvent, preventDefault, wheelOpt) // modern desktop
    window.addEventListener("touchmove", preventDefault$1, wheelOpt); // mobile
    window.addEventListener("keydown", preventDefaultForScrollKeys, false);
}
// call this to Enable
function enableScroll() {
    window.removeEventListener("DOMMouseScroll", preventDefault$1, false);
    // window.removeEventListener(wheelEvent, preventDefault)
    window.removeEventListener("touchmove", preventDefault$1);
    window.removeEventListener("keydown", preventDefaultForScrollKeys, false);
}

const MouseButtons = {
    LeftButton: 0,
    MiddleButton: 1,
    RightButton: 2
};

// Abstract inputs that all input devices get mapped to
const DefaultInput = {
    PRIMARY: 0,
    SECONDARY: 1,
    FORWARD: 2,
    BACKWARD: 3,
    UP: 4,
    DOWN: 5,
    LEFT: 6,
    RIGHT: 7,
    INTERACT: 8,
    CROUCH: 9,
    JUMP: 10,
    WALK: 11,
    RUN: 12,
    SPRINT: 13,
    SNEAK: 14,
    SCREENXY: 15,
    MOVEMENT_PLAYERONE: 16,
    LOOKTURN_PLAYERONE: 17,
    MOVEMENT_PLAYERTWO: 18,
    LOOKTURN_PLAYERTWO: 19,
    ALTERNATE: 20
};
const DefaultInputMap = {
    // When an Input component is added, the system will call this array of behaviors
    onAdded: [
        {
            behavior: disableScroll
            // args: { }
        }
    ],
    // When an Input component is removed, the system will call this array of behaviors
    onRemoved: [
        {
            behavior: enableScroll
            // args: { }
        }
    ],
    // When the input component is added or removed, the system will bind/unbind these events to the DOM
    eventBindings: {
        // Mouse
        ["contextmenu"]: {
            behavior: preventDefault
        },
        ["mousemove"]: {
            behavior: handleMouseMovement,
            args: {
                value: DefaultInput.SCREENXY
            }
        },
        ["mouseup"]: {
            behavior: handleMouseButton,
            args: {
                value: BinaryValue.OFF
            }
        },
        ["mousedown"]: {
            behavior: handleMouseButton,
            args: {
                value: BinaryValue.ON
            }
        },
        // Keys
        ["keyup"]: {
            behavior: handleKey,
            args: {
                value: BinaryValue.OFF
            }
        },
        ["keydown"]: {
            behavior: handleKey,
            args: {
                value: BinaryValue.ON
            }
        },
        // Gamepad
        ["gamepadconnected"]: {
            behavior: handleGamepadConnected
        },
        ["gamepaddisconnected"]: {
            behavior: handleGamepadDisconnected
        }
    },
    // Map mouse buttons to abstract input
    mouseInputMap: {
        buttons: {
            [MouseButtons.LeftButton]: DefaultInput.PRIMARY,
            [MouseButtons.RightButton]: DefaultInput.SECONDARY
            // [MouseButtons.MiddleButton]: DefaultInput.INTERACT
        },
        axes: {
            mousePosition: DefaultInput.SCREENXY
        }
    },
    // Map gamepad buttons to abstract input
    gamepadInputMap: {
        buttons: {
            [GamepadButtons.A]: DefaultInput.JUMP,
            [GamepadButtons.B]: DefaultInput.CROUCH,
            // [GamepadButtons.X]: DefaultInput.SPRINT, // X - secondary input
            // [GamepadButtons.Y]: DefaultInput.INTERACT, // Y - tertiary input
            // 4: DefaultInput.DEFAULT, // LB
            // 5: DefaultInput.DEFAULT, // RB
            // 6: DefaultInput.DEFAULT, // LT
            // 7: DefaultInput.DEFAULT, // RT
            // 8: DefaultInput.DEFAULT, // Back
            // 9: DefaultInput.DEFAULT, // Start
            // 10: DefaultInput.DEFAULT, // LStick
            // 11: DefaultInput.DEFAULT, // RStick
            [GamepadButtons.DPad1]: DefaultInput.FORWARD,
            [GamepadButtons.DPad2]: DefaultInput.BACKWARD,
            [GamepadButtons.DPad3]: DefaultInput.LEFT,
            [GamepadButtons.DPad4]: DefaultInput.RIGHT // DPAD 4
        },
        axes: {
            [Thumbsticks.Left]: DefaultInput.MOVEMENT_PLAYERONE,
            [Thumbsticks.Right]: DefaultInput.LOOKTURN_PLAYERONE
        }
    },
    // Map keyboard buttons to abstract input
    keyboardInputMap: {
        w: DefaultInput.FORWARD,
        a: DefaultInput.LEFT,
        s: DefaultInput.BACKWARD,
        d: DefaultInput.RIGHT,
        [" "]: DefaultInput.JUMP,
        shift: DefaultInput.CROUCH
    },
    // Map how inputs relate to each other
    inputRelationships: {
        [DefaultInput.FORWARD]: { opposes: [DefaultInput.BACKWARD] },
        [DefaultInput.BACKWARD]: { opposes: [DefaultInput.FORWARD] },
        [DefaultInput.LEFT]: { opposes: [DefaultInput.RIGHT] },
        [DefaultInput.RIGHT]: { opposes: [DefaultInput.LEFT] },
        [DefaultInput.CROUCH]: { blockedBy: [DefaultInput.JUMP, DefaultInput.SPRINT] },
        [DefaultInput.JUMP]: { overrides: [DefaultInput.CROUCH] }
    },
    // "Button behaviors" are called when button input is called (i.e. not axis input)
    inputButtonBehaviors: {
        [DefaultInput.JUMP]: {
            [BinaryValue.ON]: {
                behavior: jump,
                args: {}
            }
        },
        [DefaultInput.FORWARD]: {
            [BinaryValue.ON]: {
                behavior: move,
                args: {
                    inputType: InputType.TWOD,
                    input: {
                        value: [0, -1]
                    },
                    value: [0, -1]
                }
            }
        },
        [DefaultInput.BACKWARD]: {
            [BinaryValue.ON]: {
                behavior: move,
                args: {
                    inputType: InputType.TWOD,
                    input: {
                        value: [0, 1]
                    },
                    value: [0, 1]
                }
            }
        },
        [DefaultInput.LEFT]: {
            [BinaryValue.ON]: {
                behavior: move,
                args: {
                    inputType: InputType.TWOD,
                    input: {
                        value: [-1, 0]
                    },
                    value: [-1, 0]
                }
            }
        },
        [DefaultInput.RIGHT]: {
            [BinaryValue.ON]: {
                behavior: move,
                args: {
                    inputType: InputType.TWOD,
                    input: {
                        value: [1, 0]
                    },
                    value: [1, 0]
                }
            }
        }
        // [DefaultInput.CROUCH]: {
        //   [BinaryValue.ON]: {
        //     behavior: startCrouching,
        //     args: { state: DefaultStateTypes.CROUCHING }
        //   },
        //   [BinaryValue.OFF]: {
        //     behavior: stopCrouching,
        //     args: { state: DefaultStateTypes.CROUCHING }
        //   }
        // }
    },
    // Axis behaviors are called by continuous input and map to a scalar, vec2 or vec3
    inputAxisBehaviors: {
        [DefaultInput.MOVEMENT_PLAYERONE]: {
            behavior: move,
            args: {
                input: DefaultInput.MOVEMENT_PLAYERONE,
                inputType: InputType.TWOD
            }
        },
        [DefaultInput.SCREENXY]: {
            behavior: rotateAround,
            args: {
                input: DefaultInput.LOOKTURN_PLAYERONE,
                inputType: InputType.TWOD
            }
        }
    }
};

class InputSystem extends System {
    execute(delta) {
        // Called when input component is added to entity
        this.queries.inputs.added.forEach(entity => {
            var _a;
            // Get component reference
            this._inputComponent = entity.getComponent(Input);
            // If input doesn't have a map, set the default
            if (this._inputComponent.map === undefined)
                this._inputComponent.map = DefaultInputMap;
            // Call all behaviors in "onAdded" of input map
            this._inputComponent.map.onAdded.forEach(behavior => {
                behavior.behavior(entity, Object.assign({}, behavior.args));
            });
            // Bind DOM events to event behavior
            (_a = Object.keys(this._inputComponent.map.eventBindings)) === null || _a === void 0 ? void 0 : _a.forEach((key) => {
                document.addEventListener(key, e => {
                    this._inputComponent.map.eventBindings[key].behavior(entity, Object.assign({ event: e }, this._inputComponent.map.eventBindings[key].args));
                });
            });
        });
        // Called when input component is removed from entity
        this.queries.inputs.removed.forEach(entity => {
            // Get component reference
            this._inputComponent = entity.getComponent(Input);
            // Call all behaviors in "onRemoved" of input map
            this._inputComponent.map.onRemoved.forEach(behavior => {
                behavior.behavior(entity, behavior.args);
            });
            // Unbind events from DOM
            Object.keys(this._inputComponent.map.eventBindings).forEach((key) => {
                document.addEventListener(key, e => {
                    this._inputComponent.map.eventBindings[key].behavior(entity, Object.assign({ event: e }, this._inputComponent.map.eventBindings[key].args));
                });
            });
        });
        // Called every frame on all input components
        this.queries.inputs.results.forEach(entity => handleInput(entity, delta));
    }
}
let input$3;
const handleInput = (entity, delta) => {
    input$3 = entity.getComponent(Input);
    input$3.data.forEach((value, key) => {
        if (value.type === InputType.BUTTON) {
            if (input$3.map.inputButtonBehaviors[key] && input$3.map.inputButtonBehaviors[key][value.value]) {
                if (value.lifecycleState === undefined || value.lifecycleState === LifecycleValue$1.STARTED) {
                    input$3.data.set(key, {
                        type: value.type,
                        value: value.value,
                        lifecycleState: LifecycleValue$1.CONTINUED
                    });
                    input$3.map.inputButtonBehaviors[key][value.value].behavior(entity, input$3.map.inputButtonBehaviors[key][value.value].args, delta);
                }
            }
        }
        else if (value.type === InputType.ONED || value.type === InputType.TWOD || value.type === InputType.THREED) {
            if (input$3.map.inputAxisBehaviors[key]) {
                if (value.lifecycleState === undefined || value.lifecycleState === LifecycleValue$1.STARTED) {
                    input$3.data.set(key, {
                        type: value.type,
                        value: value.value,
                        lifecycleState: LifecycleValue$1.CONTINUED
                    });
                    input$3.map.inputAxisBehaviors[key].behavior(entity, input$3.map.inputAxisBehaviors[key].args, delta);
                }
            }
        }
        else {
            console.error("handleInput called with an invalid input type");
        }
    });
    input$3.data.clear();
};
InputSystem.queries = {
    inputs: {
        components: [Input],
        listen: {
            added: true,
            removed: true
        }
    }
};

const jumpingBehavior = jumping;
const DefaultStateGroups = {
    MOVEMENT: 0,
    MOVEMENT_MODIFIERS: 1
};
const DefaultStateSchema = {
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
        [DefaultStateTypes.JUMPING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, onUpdate: { behavior: jumpingBehavior } },
        [DefaultStateTypes.CROUCHING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, blockedBy: DefaultStateTypes.JUMPING },
        [DefaultStateTypes.SPRINTING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS }
    }
};

class StateSystem extends System {
    constructor() {
        super(...arguments);
        this.callBehaviors = (entity, args, delta) => {
            this._state = entity.getComponent(State);
            this._state.data.forEach((stateValue) => {
                if (this._state.map.states[stateValue.state] !== undefined && this._state.map.states[stateValue.state][args.phase] !== undefined) {
                    if (stateValue.lifecycleState === LifecycleValue$1.STARTED) {
                        this._state.data.set(stateValue.state, Object.assign(Object.assign({}, stateValue), { lifecycleState: LifecycleValue$1.CONTINUED }));
                    }
                    this._state.map.states[stateValue.state][args.phase].behavior(entity, this._state.map.states[stateValue.state][args.phase].args, delta);
                }
            });
        };
    }
    execute(delta, time) {
        var _a, _b, _c;
        (_a = this.queries.state.added) === null || _a === void 0 ? void 0 : _a.forEach(entity => {
            var _a;
            // If stategroup has a default, add it to our state map
            this._state = entity.getComponent(State);
            if (this._state.map === undefined)
                return;
            Object.keys((_a = this._state.map) === null || _a === void 0 ? void 0 : _a.groups).forEach((stateGroup) => {
                if (this._state.map.groups[stateGroup] !== undefined && this._state.map.groups[stateGroup].default !== undefined) {
                    addState(entity, { state: this._state.map.groups[stateGroup].default });
                    console.log("Added default state: " + this._state.map.groups[stateGroup].default);
                }
            });
        });
        (_b = this.queries.state.changed) === null || _b === void 0 ? void 0 : _b.forEach(entity => {
            var _a;
            // If stategroup has a default, add it to our state map
            this._state = entity.getComponent(State);
            if (this._state.map === undefined)
                return;
            Object.keys((_a = this._state.map) === null || _a === void 0 ? void 0 : _a.groups).forEach((stateGroup) => {
                if (this._state.map.groups[stateGroup] !== undefined && this._state.map.groups[stateGroup].default !== undefined) {
                    addState(entity, { state: this._state.map.groups[stateGroup].default });
                    console.log("Added default state: " + this._state.map.groups[stateGroup].default);
                }
            });
        });
        (_c = this.queries.state.results) === null || _c === void 0 ? void 0 : _c.forEach(entity => {
            this.callBehaviors(entity, { phase: "onUpdate" }, delta);
            this.callBehaviors(entity, { phase: "onLateUpdate" }, delta);
        });
    }
}
StateSystem.queries = {
    state: {
        components: [State],
        listen: {
            added: true,
            changed: true,
            removed: true
        }
    }
};

class MessageSchema {
    constructor(_messageType, _struct) {
        this._messageType = _messageType;
        this._struct = _struct;
        this._bytes = 0;
        this.calcBytes();
    }
    get messageType() {
        return this._messageType;
    }
    calcBytes() {
        const iterate = (obj) => {
            var _a, _b;
            for (const property in obj) {
                const type = (obj === null || obj === void 0 ? void 0 : obj._type) || ((_a = obj === null || obj === void 0 ? void 0 : obj.type) === null || _a === void 0 ? void 0 : _a._type);
                const bytes = obj._bytes || ((_b = obj.type) === null || _b === void 0 ? void 0 : _b._bytes);
                if (!type) {
                    if (typeof obj[property] === "object") {
                        iterate(obj[property]);
                    }
                }
                else {
                    if (property !== "_type" && property !== "type")
                        return;
                    if (!bytes)
                        return;
                    // we multiply the bytes by the String8 / String16 length.
                    if (type === "String8" || type === "String16") {
                        const length = obj.length || 12;
                        this._bytes += bytes * length;
                    }
                    else {
                        this._bytes += bytes;
                    }
                }
            }
        };
        iterate(this._struct);
    }
    get struct() {
        return this._struct;
    }
    get bytes() {
        return this._bytes;
    }
}

// TODO: Clean me up, add schema, etc
class MediaStreamComponent extends Component {
    constructor() {
        super();
        this.initialized = false;
        this.consumers = [];
        this.screenShareVideoPaused = false;
        this.screenShareAudioPaused = false;
        this.videoPaused = false;
        this.audioPaused = false;
        MediaStreamComponent.instance = this;
        this.videoPaused = true;
        this.audioPaused = true;
    }
    toggleVideoPaused() {
        this.videoPaused = !this.videoPaused;
        return this.videoPaused;
    }
    toggleAudioPaused() {
        this.audioPaused = !this.audioPaused;
        return this.audioPaused;
    }
}

class RingBuffer {
    constructor(size) {
        this.buffer = [];
        this.pos = 0;
        console.log("Constructing ring buffer");
        if (size < 0) {
            throw new RangeError("The size does not allow negative values.");
        }
        this.size = size;
    }
    static fromArray(data, size = 0) {
        const actionBuffer = new RingBuffer(size);
        actionBuffer.fromArray(data, size === 0);
        return actionBuffer;
    }
    copy() {
        const newAxisBuffer = new RingBuffer(this.getBufferLength());
        newAxisBuffer.buffer = this.buffer;
        return newAxisBuffer;
    }
    clone() {
        const newAxisBuffer = new RingBuffer(this.getBufferLength());
        newAxisBuffer.buffer = this.buffer;
        return newAxisBuffer;
    }
    getSize() {
        return this.size;
    }
    getPos() {
        return this.pos;
    }
    getBufferLength() {
        return this.buffer.length;
    }
    add(...items) {
        items.forEach(item => {
            this.buffer[this.pos] = item;
            this.pos = (this.pos + 1) % this.size;
        });
    }
    get(index) {
        if (index < 0) {
            index += this.buffer.length;
        }
        if (index < 0 || index > this.buffer.length) {
            return undefined;
        }
        if (this.buffer.length < this.size) {
            return this.buffer[index];
        }
        return this.buffer[(this.pos + index) % this.size];
    }
    getFirst() {
        return this.get(0);
    }
    getLast() {
        return this.get(-1);
    }
    remove(index, count = 1) {
        if (index < 0) {
            index += this.buffer.length;
        }
        if (index < 0 || index > this.buffer.length) {
            return [];
        }
        const arr = this.toArray();
        const removedItems = arr.splice(index, count);
        this.fromArray(arr);
        return removedItems;
    }
    pop() {
        return this.remove(0)[0];
    }
    popLast() {
        return this.remove(-1)[0];
    }
    toArray() {
        return this.buffer.slice(this.pos).concat(this.buffer.slice(0, this.pos));
    }
    fromArray(data, resize = false) {
        if (!Array.isArray(data)) {
            throw new TypeError("Input value is not an array.");
        }
        if (resize)
            this.resize(data.length);
        if (this.size === 0)
            return;
        this.buffer = data.slice(-this.size);
        this.pos = this.buffer.length % this.size;
    }
    clear() {
        this.buffer = [];
        this.pos = 0;
    }
    resize(newSize) {
        if (newSize < 0) {
            throw new RangeError("The size does not allow negative values.");
        }
        if (newSize === 0) {
            this.clear();
        }
        else if (newSize !== this.size) {
            const currentBuffer = this.toArray();
            this.fromArray(currentBuffer.slice(-newSize));
            this.pos = this.buffer.length % newSize;
        }
        this.size = newSize;
    }
    full() {
        return this.buffer.length === this.size;
    }
    empty() {
        return this.buffer.length === 0;
    }
}

// TODO: Clean me up, add schema, etc
class MessageQueue extends Component {
    // TODO: Message ring buffer should be able to grow
    constructor() {
        super();
        this.outgoingReliableQueue = new RingBuffer(200);
        this.outgoingUnreliableQueue = new RingBuffer(200);
        this.incomingReliableQueue = new RingBuffer(200);
        this.incomingUnreliableQueue = new RingBuffer(200);
        MessageQueue.instance = this;
    }
}

class NetworkClient extends Component {
}
NetworkClient.schema = {
    networkId: { type: Types.Number },
    userId: { type: Types.String, default: "" },
    name: { type: Types.String, default: "Player" }
};

// TODO: Clean me up, add schema, etc
class NetworkTransportComponent extends Component {
    constructor() {
        super();
        this.initialized = false;
        NetworkTransportComponent.instance = this;
    }
}

// adding constraints, VIDEO_CONSTRAINTS is video quality levels
// localMediaConstraints is passed to the getUserMedia object to request a lower video quality than the maximum
const VIDEO_CONSTRAINTS = {
    qvga: { width: { ideal: 320 }, height: { ideal: 240 } },
    vga: { width: { ideal: 640 }, height: { ideal: 480 } },
    hd: { width: { ideal: 1280 }, height: { ideal: 720 } }
};
const localMediaConstraints = {
    audio: true,
    video: {
        width: VIDEO_CONSTRAINTS.qvga.width,
        height: VIDEO_CONSTRAINTS.qvga.height,
        frameRate: { max: 30 }
    }
};
// encodings for outgoing video
// just two resolutions, for now, as chrome 75 seems to ignore more
// than two encodings
const CAM_VIDEO_SIMULCAST_ENCODINGS = [
    { maxBitrate: 36000, scaleResolutionDownBy: 2 }
    // { maxBitrate: 96000, scaleResolutionDownBy: 2 },
    // { maxBitrate: 680000, scaleResolutionDownBy: 1 },
];

class NetworkObject extends Component {
}
NetworkObject.schema = {
    ownerId: { type: Types.Number },
    networkId: { type: Types.Number }
};

// Assemblage is a pattern for creating an entity and component collection as a prototype
const NetworkObjectAssemblage = {
    components: [{ type: NetworkObject }, { type: TransformComponent }]
};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

class MediaStreamControlSystem extends System {
    constructor(world) {
        super(world);
        MediaStreamControlSystem.instance = this;
        this.mediaStreamComponent = world
            .registerComponent(MediaStreamComponent)
            .createEntity()
            .addComponent(MediaStreamComponent)
            .getComponent(MediaStreamComponent);
        this.startCamera();
    }
    execute() {
        // eh
    }
    startCamera() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.mediaStreamComponent.mediaStream)
                return false;
            console.log("start camera");
            return this.getMediaStream();
        });
    }
    // switch to sending video from the "next" camera device in our device
    // list (if we have multiple cameras)
    cycleCamera() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(this.mediaStreamComponent.camVideoProducer && this.mediaStreamComponent.camVideoProducer.track)) {
                console.log("cannot cycle camera - no current camera track");
                return false;
            }
            console.log("cycle camera");
            // find "next" device in device list
            const deviceId = yield this.getCurrentDeviceId();
            const allDevices = yield navigator.mediaDevices.enumerateDevices();
            const vidDevices = allDevices.filter(d => d.kind === "videoinput");
            if (!(vidDevices.length > 1)) {
                console.log("cannot cycle camera - only one camera");
                return false;
            }
            let idx = vidDevices.findIndex(d => d.deviceId === deviceId);
            if (idx === vidDevices.length - 1)
                idx = 0;
            else
                idx += 1;
            // get a new video stream. might as well get a new audio stream too,
            // just in case browsers want to group audio/video streams together
            // from the same device when possible (though they don't seem to,
            // currently)
            console.log("getting a video stream from new device", vidDevices[idx].label);
            this.mediaStreamComponent.mediaStream = yield navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: vidDevices[idx].deviceId } },
                audio: true
            });
            // replace the tracks we are sending
            yield this.mediaStreamComponent.camVideoProducer.replaceTrack({ track: this.mediaStreamComponent.mediaStream.getVideoTracks()[0] });
            yield this.mediaStreamComponent.camAudioProducer.replaceTrack({ track: this.mediaStreamComponent.mediaStream.getAudioTracks()[0] });
            return true;
        });
    }
    // -- user interface --
    getScreenPausedState() {
        return MediaStreamComponent.instance.screenShareVideoPaused;
    }
    getScreenAudioPausedState() {
        return MediaStreamComponent.instance.screenShareAudioPaused;
    }
    toggleWebcamVideoPauseState() {
        return __awaiter(this, void 0, void 0, function* () {
            const videoPaused = MediaStreamComponent.instance.toggleVideoPaused();
            if (videoPaused)
                NetworkTransportComponent.instance.transport.pauseProducer(MediaStreamComponent.instance.camVideoProducer);
            else
                NetworkTransportComponent.instance.transport.resumeProducer(MediaStreamComponent.instance.camVideoProducer);
        });
    }
    toggleWebcamAudioPauseState() {
        return __awaiter(this, void 0, void 0, function* () {
            const audioPaused = MediaStreamComponent.instance.toggleAudioPaused();
            if (audioPaused)
                NetworkTransportComponent.instance.transport.resumeProducer(MediaStreamComponent.instance.camAudioProducer);
            else
                NetworkTransportComponent.instance.transport.pauseProducer(MediaStreamComponent.instance.camAudioProducer);
        });
    }
    toggleScreenshareVideoPauseState() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.getScreenPausedState())
                NetworkTransportComponent.instance.transport.pauseProducer(MediaStreamComponent.instance.screenVideoProducer);
            else
                NetworkTransportComponent.instance.transport.resumeProducer(MediaStreamComponent.instance.screenVideoProducer);
            MediaStreamComponent.instance.screenShareVideoPaused = !MediaStreamComponent.instance.screenShareVideoPaused;
        });
    }
    toggleScreenshareAudioPauseState() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.getScreenAudioPausedState())
                NetworkTransportComponent.instance.transport.pauseProducer(MediaStreamComponent.instance.screenAudioProducer);
            else
                NetworkTransportComponent.instance.transport.resumeProducer(MediaStreamComponent.instance.screenAudioProducer);
            MediaStreamComponent.instance.screenShareAudioPaused = !MediaStreamComponent.instance.screenShareAudioPaused;
        });
    }
    removeVideoAudio(consumer) {
        document.querySelectorAll(consumer.id).forEach(v => {
            if (v.consumer === consumer)
                v.parentNode.removeChild(v);
        });
    }
    addVideoAudio(consumer, peerId) {
        if (!(consumer && consumer.track)) {
            return;
        }
        const elementID = `${peerId}_${consumer.kind}`;
        let el = document.getElementById(elementID);
        // set some attributes on our audio and video elements to make
        // mobile Safari happy. note that for audio to play you need to be
        // capturing from the mic/camera
        if (consumer.kind === "video") {
            if (el === null) {
                console.log(`Creating video element for user with ID: ${peerId}`);
                el = document.createElement("video");
                el.id = `${peerId}_${consumer.kind}`;
                // @ts-ignore
                el.autoplay = true;
                // @ts-ignore
                // el.muted = true // necessary for
                // @ts-ignore
                // el.style = "visibility: hidden;"
                document.body.appendChild(el);
                // @ts-ignore
                el.setAttribute("playsinline", true);
            }
            // TODO: do i need to update video width and height? or is that based on stream...?
            console.log(`Updating video source for user with ID: ${peerId}`);
            // @ts-ignore
            el.srcObject = new MediaStream([consumer.track.clone()]);
            // @ts-ignore
            el.consumer = consumer;
            // let's "yield" and return before playing, rather than awaiting on
            // play() succeeding. play() will not succeed on a producer-paused
            // track until the producer unpauses.
            // @ts-ignore
            el.play().catch((e) => {
                console.log(`Play video error: ${e}`);
                console.error(e);
            });
        }
        else {
            // Positional Audio Works in Firefox:
            // Global Audio:
            if (el === null) {
                console.log(`Creating audio element for user with ID: ${peerId}`);
                el = document.createElement("audio");
                el.id = `${peerId}_${consumer.kind}`;
                document.body.appendChild(el);
                // @ts-ignore
                el.setAttribute("playsinline", true);
                // @ts-ignore
                el.setAttribute("autoplay", true);
            }
            console.log(`Updating <audio> source object for client with ID: ${peerId}`);
            // @ts-ignore
            el.srcObject = new MediaStream([consumer.track.clone()]);
            // @ts-ignore
            el.consumer = consumer;
            // @ts-ignore
            el.volume = 0; // start at 0 and let the three.js scene take over from here...
            // this.worldScene.createOrUpdatePositionalAudio(peerId)
            // let's "yield" and return before playing, rather than awaiting on
            // play() succeeding. play() will not succeed on a producer-paused
            // track until the producer unpauses.
            // @ts-ignore
            el.play().catch((e) => {
                console.log(`Play audio error: ${e}`);
                console.error(e);
            });
        }
    }
    getCurrentDeviceId() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!MediaStreamComponent.instance.camVideoProducer)
                return null;
            const { deviceId } = MediaStreamComponent.instance.camVideoProducer.track.getSettings();
            if (deviceId)
                return deviceId;
            // Firefox doesn't have deviceId in MediaTrackSettings object
            const track = MediaStreamComponent.instance.mediaStream && MediaStreamComponent.instance.mediaStream.getVideoTracks()[0];
            if (!track)
                return null;
            const devices = yield navigator.mediaDevices.enumerateDevices();
            const deviceInfo = devices.find(d => d.label.startsWith(track.label));
            return deviceInfo.deviceId;
        });
    }
    stopCamera() {
        throw new Error("Method not implemented.");
    }
    stopScreenshare() {
        throw new Error("Method not implemented.");
    }
    startAudio() {
        throw new Error("Method not implemented.");
    }
    stopAudio() {
        throw new Error("Method not implemented.");
    }
    muteUser(userId) {
        throw new Error("Method not implemented.");
    }
    unmuteUser(userId) {
        throw new Error("Method not implemented.");
    }
    getMediaStream() {
        return __awaiter(this, void 0, void 0, function* () {
            this.mediaStreamComponent.mediaStream = yield navigator.mediaDevices.getUserMedia(localMediaConstraints);
            if (this.mediaStreamComponent.mediaStream.active) {
                this.mediaStreamComponent.audioPaused = false;
                this.mediaStreamComponent.videoPaused = false;
                return true;
            }
            this.mediaStreamComponent.audioPaused = true;
            this.mediaStreamComponent.videoPaused = true;
            return false;
        });
    }
}

const set$2 = (obj, path, value) => {
    const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
    pathArray.reduce((acc, key, i) => {
        if (acc[key] === undefined)
            acc[key] = {};
        if (i === pathArray.length - 1)
            acc[key] = value;
        return acc[key];
    }, obj);
};

function cropString(str, length) {
    return str.padEnd(length, " ").slice(0, length);
}

class NetworkSystem extends System {
    constructor(world) {
        super(world);
        this.clients = []; // TODO: Replace with ringbuffer
        this._schemas = new Map();
        this._buffer = new ArrayBuffer(0);
        this._dataView = new DataView(this._buffer);
        this._bytes = 0;
    }
    initializeSession(world, transport) {
        console.log("Initialization session");
        NetworkSystem.instance = this;
        this.networkTransport = world
            .registerComponent(NetworkTransportComponent)
            .createEntity()
            .addComponent(NetworkTransportComponent)
            .getComponent(NetworkTransportComponent);
        this._isInitialized = true;
        NetworkTransportComponent.instance.transport = transport;
        console.log("Init transport:");
        transport.initialize();
    }
    setLocalConnectionId(_id) {
        console.log(`Initialized with socket ID ${_id}`);
        this.mySocketID = _id;
    }
    initializeClient(myClientId, allClientIds) {
        this.setLocalConnectionId(myClientId);
        console.log("My id: ", myClientId);
        console.log("ids: ");
        console.log(allClientIds.length);
        if (allClientIds === undefined)
            return console.log("All IDs are null");
        // for each existing user, add them as a client and add tracks to their peer connection
        for (let i = 0; i < allClientIds.length; i++)
            this.addClient(allClientIds[i]);
    }
    addClient(_id) {
        if (this.clients.includes(_id))
            return console.error("Client is already in client list");
        if (_id === this.mySocketID)
            return console.log("Not adding client because we are that client");
        console.log(`A new user connected with the id: ${_id}`);
        // Create an entity, add component NetworkClient and set id
        this.clients.push(_id);
        console.log("Adding client ", _id);
    }
    getClosestPeers() {
        return this.clients;
    }
    onConnected() {
        console.log("Client connected to server!");
    }
    removeClient(_id) {
        if (_id in this.clients) {
            if (_id === this.mySocketID) {
                console.log("Server thinks that we disconnected!");
            }
            else {
                console.log(`A user was disconnected with the id: ${_id}`);
                // Get NetworkClient component where id is _id, and destroy the entity
            }
        }
    }
    execute(delta) {
        if (!this._isInitialized)
            return;
        // Ask transport for all new messages
    }
    addMessageSchema(messageType, messageData) {
        const s = new MessageSchema(messageType, messageData);
        this._schemas.set(messageType, s);
        return s;
    }
    getLocalConnectionId() {
        return this.mySocketID;
    }
    deinitializeSession() {
        var _a;
        (_a = this._sessionEntity) === null || _a === void 0 ? void 0 : _a.remove();
        this._isInitialized = false;
        // NetworkTransport.instance.transport.deinitialize()
    }
    toBuffer(input) {
        // deep clone the worldState
        const data = Object.assign({}, input);
        this._buffer = new ArrayBuffer(8 * 1024);
        this._dataView = new DataView(this._buffer);
        this._bytes = 0;
        const flat = this.flattenSchema(this._schema, data);
        // to buffer
        flat.forEach((f) => {
            if (f.t === "String8") {
                for (let j = 0; j < f.d.length; j++) {
                    this._dataView.setUint8(this._bytes, f.d[j].charCodeAt(0));
                    this._bytes++;
                }
            }
            else if (f.t === "String16") {
                for (let j = 0; j < f.d.length; j++) {
                    this._dataView.setUint16(this._bytes, f.d[j].charCodeAt(0));
                    this._bytes += 2;
                }
            }
            else if (f.t === "Int8Array") {
                this._dataView.setInt8(this._bytes, f.d);
                this._bytes++;
            }
            else if (f.t === "Uint8Array") {
                this._dataView.setUint8(this._bytes, f.d);
                this._bytes++;
            }
            else if (f.t === "Int16Array") {
                this._dataView.setInt16(this._bytes, f.d);
                this._bytes += 2;
            }
            else if (f.t === "Uint16Array") {
                this._dataView.setUint16(this._bytes, f.d);
                this._bytes += 2;
            }
            else if (f.t === "Int32Array") {
                this._dataView.setInt32(this._bytes, f.d);
                this._bytes += 4;
            }
            else if (f.t === "Uint32Array") {
                this._dataView.setUint32(this._bytes, f.d);
                this._bytes += 4;
            }
            else if (f.t === "BigInt64Array") {
                this._dataView.setBigInt64(this._bytes, BigInt(f.d));
                this._bytes += 8;
            }
            else if (f.t === "BigUint64Array") {
                this._dataView.setBigUint64(this._bytes, BigInt(f.d));
                this._bytes += 8;
            }
            else if (f.t === "Float32Array") {
                this._dataView.setFloat32(this._bytes, f.d);
                this._bytes += 4;
            }
            else if (f.t === "Float64Array") {
                this._dataView.setFloat64(this._bytes, f.d);
                this._bytes += 8;
            }
        });
        // TODO: Pooling
        const newBuffer = new ArrayBuffer(this._bytes);
        const view = new DataView(newBuffer);
        // copy all data to a new (resized) ArrayBuffer
        for (let i = 0; i < this._bytes; i++) {
            view.setUint8(i, this._dataView.getUint8(i));
        }
        return newBuffer;
    }
    fromBuffer(buffer) {
        // check where, in the buffer, the schemas are
        let index = 0;
        const indexes = [];
        const view = new DataView(buffer);
        const int8 = Array.from(new Int8Array(buffer));
        //TODO: WTF is this black magic?
        while (index > -1) {
            index = int8.indexOf(35, index);
            if (index !== -1) {
                indexes.push(index);
                index++;
            }
        }
        // get the schema ids
        const schemaIds = [];
        indexes.forEach(index => {
            let id = 0;
            for (let i = 0; i < 5; i++) {
                const char = int8[index + i];
                id += char;
            }
            schemaIds.push(id);
        });
        // assemble all info about the schemas we need
        const schemas = [];
        schemaIds.forEach((id, i) => {
            // check if the schemaId exists
            // (this can be, for example, if charCode 35 is not really a #)
            const schemaId = this._schemas.get(id);
            if (schemaId)
                schemas.push({ id, schema: this._schemas.get(id), startsAt: indexes[i] + 5 });
        });
        // schemas[] contains now all the schemas we need to fromBuffer the bufferArray
        // lets begin the serialization
        let data = {}; // holds all the data we want to give back
        let bytes = 0; // the current bytes of arrayBuffer iteration
        const dataPerSchema = {};
        const deserializeSchema = (struct) => {
            var _a, _b;
            let data = {};
            if (typeof struct === "object") {
                for (const property in struct) {
                    const prop = struct[property];
                    // handle specialTypes e.g.:  "x: { type: int16, digits: 2 }"
                    let specialTypes;
                    if (((_a = prop === null || prop === void 0 ? void 0 : prop.type) === null || _a === void 0 ? void 0 : _a._type) && ((_b = prop === null || prop === void 0 ? void 0 : prop.type) === null || _b === void 0 ? void 0 : _b._bytes)) {
                        specialTypes = prop;
                        prop._type = prop.type._type;
                        prop._bytes = prop.type._bytes;
                    }
                    if (prop && prop["_type"] && prop["_bytes"]) {
                        const _type = prop["_type"];
                        const _bytes = prop["_bytes"];
                        let value;
                        if (_type === "String8") {
                            value = "";
                            const length = prop.length || 12;
                            for (let i = 0; i < length; i++) {
                                const char = String.fromCharCode(view.getUint8(bytes));
                                value += char;
                                bytes++;
                            }
                        }
                        else if (_type === "String16") {
                            value = "";
                            const length = prop.length || 12;
                            for (let i = 0; i < length; i++) {
                                const char = String.fromCharCode(view.getUint16(bytes));
                                value += char;
                                bytes += 2;
                            }
                        }
                        else if (_type === "Int8Array") {
                            value = view.getInt8(bytes);
                            bytes += _bytes;
                        }
                        else if (_type === "Uint8Array") {
                            value = view.getUint8(bytes);
                            bytes += _bytes;
                        }
                        else if (_type === "Int16Array") {
                            value = view.getInt16(bytes);
                            bytes += _bytes;
                        }
                        else if (_type === "Uint16Array") {
                            value = view.getUint16(bytes);
                            bytes += _bytes;
                        }
                        else if (_type === "Int32Array") {
                            value = view.getInt32(bytes);
                            bytes += _bytes;
                        }
                        else if (_type === "Uint32Array") {
                            value = view.getUint32(bytes);
                            bytes += _bytes;
                        }
                        else if (_type === "BigInt64Array") {
                            value = parseInt(view.getBigInt64(bytes).toString());
                            bytes += _bytes;
                        }
                        else if (_type === "BigUint64Array") {
                            value = parseInt(view.getBigUint64(bytes).toString());
                            bytes += _bytes;
                        }
                        else if (_type === "Float32Array") {
                            value = view.getFloat32(bytes);
                            bytes += _bytes;
                        }
                        else if (_type === "Float64Array") {
                            value = view.getFloat64(bytes);
                            bytes += _bytes;
                        }
                        // apply special types options
                        else if (typeof value === "number" && (specialTypes === null || specialTypes === void 0 ? void 0 : specialTypes.digits)) {
                            value *= Math.pow(10, -specialTypes.digits);
                            value = parseFloat(value.toFixed(specialTypes.digits));
                        }
                        data = Object.assign(Object.assign({}, data), { [property]: value });
                    }
                }
            }
            return data;
        };
        schemas.forEach((s, i) => {
            var _a, _b, _c;
            const struct = (_a = s.schema) === null || _a === void 0 ? void 0 : _a.struct;
            const start = s.startsAt;
            let end = buffer.byteLength;
            const id = ((_b = s.schema) === null || _b === void 0 ? void 0 : _b.id) || "XX";
            if (id === "XX")
                console.error("ERROR: Something went horribly wrong!");
            end = schemas[i + 1].startsAt - 5;
            // TODO: bytes is not accurate since it includes child schemas
            const length = ((_c = s.schema) === null || _c === void 0 ? void 0 : _c.bytes) || 1;
            // determine how many iteration we have to make in this schema
            // the players array maybe contains 5 player, so we have to make 5 iterations
            const iterations = (end - start) / length;
            for (let i = 0; i < iterations; i++) {
                bytes = start + i * length;
                // gets the data from this schema
                const schemaData = deserializeSchema(struct);
                if (iterations <= 1)
                    dataPerSchema[id] = Object.assign({}, schemaData);
                else {
                    if (typeof dataPerSchema[id] === "undefined")
                        dataPerSchema[id] = [];
                    dataPerSchema[id].push(schemaData);
                }
            }
        });
        // add dataPerScheme to data
        data = {};
        const populateData = (obj, key, value, path = "", isArray = false) => {
            if (obj && obj._id && obj._id === key) {
                const p = path.replace(/_struct\./, "").replace(/\.$/, "");
                // if it is a schema[], but only has one set, we manually have to make sure it transforms to an array
                if (isArray && !Array.isArray(value))
                    value = [value];
                // '' is the top level
                if (p === "")
                    data = Object.assign(Object.assign({}, data), value);
                else
                    set$2(data, p, value);
            }
            else {
                for (const props in obj) {
                    if (typeof obj[props] === "object") {
                        const p = Array.isArray(obj) ? "" : `${props}.`;
                        populateData(obj[props], key, value, path + p, Array.isArray(obj));
                    }
                    //obj
                }
            }
        };
        for (let i = 0; i < Object.keys(dataPerSchema).length; i++) {
            const key = Object.keys(dataPerSchema)[i];
            const value = dataPerSchema[key];
            populateData(this._schema, key, value, "");
        }
        return data;
    }
    flattenSchema(schema, data) {
        const flat = [];
        const flatten = (schema, data) => {
            var _a, _b, _c, _d, _e, _f, _g;
            // add the schema id to flat[] (its a String8 with 5 characters, the first char is #)
            if (schema === null || schema === void 0 ? void 0 : schema._id)
                flat.push({ d: schema._id, t: "String8" });
            else if ((_a = schema === null || schema === void 0 ? void 0 : schema[0]) === null || _a === void 0 ? void 0 : _a._id)
                flat.push({ d: schema[0]._id, t: "String8" });
            // if it is a schema
            if (schema === null || schema === void 0 ? void 0 : schema._struct)
                schema = schema._struct;
            // if it is a schema[]
            else if ((_b = schema === null || schema === void 0 ? void 0 : schema[0]) === null || _b === void 0 ? void 0 : _b._struct)
                schema = schema[0]._struct;
            for (const property in data) {
                if (typeof data[property] === "object") {
                    // if data is array, but schemas is flat, use index 0 on the next iteration
                    if (Array.isArray(data))
                        flatten(schema, data[parseInt(property)]);
                    else
                        flatten(schema[property], data[property]);
                }
                else {
                    // handle special types e.g.:  "x: { type: int16, digits: 2 }"
                    if ((_d = (_c = schema[property]) === null || _c === void 0 ? void 0 : _c.type) === null || _d === void 0 ? void 0 : _d._type) {
                        if ((_e = schema[property]) === null || _e === void 0 ? void 0 : _e.digits) {
                            data[property] *= Math.pow(10, schema[property].digits);
                            data[property] = parseInt(data[property].toFixed(0));
                        }
                        if ((_f = schema[property]) === null || _f === void 0 ? void 0 : _f.length) {
                            const length = (_g = schema[property]) === null || _g === void 0 ? void 0 : _g.length;
                            data[property] = cropString(data[property], length);
                        }
                        flat.push({ d: data[property], t: schema[property].type._type });
                    }
                    else {
                        // crop strings to default lenght of 12 characters if nothing else is specified
                        if (schema[property]._type === "String8" || schema[property]._type === "String16") {
                            data[property] = cropString(data[property], 12);
                        }
                        flat.push({ d: data[property], t: schema[property]._type });
                    }
                }
            }
        };
        flatten(schema, data);
        return flat;
    }
}
NetworkSystem.queries = {
    networkObject: {
        components: [NetworkObject]
    },
    networkOwners: {
        components: [NetworkClient]
    }
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, basedir, module) {
	return module = {
	  path: basedir,
	  exports: {},
	  require: function (path, base) {
      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    }
	}, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */
var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
var parts = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'];

var parseuri = function parseuri(str) {
  var src = str,
      b = str.indexOf('['),
      e = str.indexOf(']');

  if (b != -1 && e != -1) {
    str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
  }

  var m = re.exec(str || ''),
      uri = {},
      i = 14;

  while (i--) {
    uri[parts[i]] = m[i] || '';
  }

  if (b != -1 && e != -1) {
    uri.source = src;
    uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
    uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
    uri.ipv6uri = true;
  }

  return uri;
};

var global$1 = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};

// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;

if (typeof global$1.setTimeout === 'function') {
  cachedSetTimeout = setTimeout;
}

if (typeof global$1.clearTimeout === 'function') {
  cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

function nextTick(fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
} // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

var title = 'browser';
var platform = 'browser';
var browser = true;
var env = {};
var argv = [];
var version = ''; // empty string to avoid regexp issues

var versions = {};
var release = {};
var config = {};

function noop() {}

var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;

function binding(name) {
  throw new Error('process.binding is not supported');
}

function cwd() {
  return '/';
}

function chdir(dir) {
  throw new Error('process.chdir is not supported');
}

function umask() {
  return 0;
} // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js


var performance = global$1.performance || {};

var performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function () {
  return new Date().getTime();
}; // generate timestamp or delta
// see http://nodejs.org/api/process.html#process_process_hrtime


function hrtime(previousTimestamp) {
  var clocktime = performanceNow.call(performance) * 1e-3;
  var seconds = Math.floor(clocktime);
  var nanoseconds = Math.floor(clocktime % 1 * 1e9);

  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];

    if (nanoseconds < 0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }

  return [seconds, nanoseconds];
}

var startTime = new Date();

function uptime() {
  var currentTime = new Date();
  var dif = currentTime - startTime;
  return dif / 1000;
}

var browser$1 = {
  nextTick: nextTick,
  title: title,
  browser: browser,
  env: env,
  argv: argv,
  version: version,
  versions: versions,
  on: on,
  addListener: addListener,
  once: once,
  off: off,
  removeListener: removeListener,
  removeAllListeners: removeAllListeners,
  emit: emit,
  binding: binding,
  cwd: cwd,
  chdir: chdir,
  umask: umask,
  hrtime: hrtime,
  platform: platform,
  release: release,
  config: config,
  uptime: uptime
};

/**
 * Helpers.
 */
var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y$1 = d * 365.25;
/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

var ms = function (val, options) {
  options = options || {};
  var type = typeof val;

  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }

  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
};
/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */


function parse(str) {
  str = String(str);

  if (str.length > 100) {
    return;
  }

  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);

  if (!match) {
    return;
  }

  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();

  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y$1;

    case 'weeks':
    case 'week':
    case 'w':
      return n * w;

    case 'days':
    case 'day':
    case 'd':
      return n * d;

    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;

    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;

    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;

    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;

    default:
      return undefined;
  }
}
/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */


function fmtShort(ms) {
  var msAbs = Math.abs(ms);

  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }

  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }

  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }

  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }

  return ms + 'ms';
}
/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */


function fmtLong(ms) {
  var msAbs = Math.abs(ms);

  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }

  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }

  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }

  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }

  return ms + ' ms';
}
/**
 * Pluralization helper.
 */


function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
  createDebug.debug = createDebug;
  createDebug.default = createDebug;
  createDebug.coerce = coerce;
  createDebug.disable = disable;
  createDebug.enable = enable;
  createDebug.enabled = enabled;
  createDebug.humanize = ms;
  Object.keys(env).forEach(key => {
    createDebug[key] = env[key];
  });
  /**
  * Active `debug` instances.
  */

  createDebug.instances = [];
  /**
  * The currently active debug mode names, and names to skip.
  */

  createDebug.names = [];
  createDebug.skips = [];
  /**
  * Map of special "%n" handling functions, for the debug "format" argument.
  *
  * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
  */

  createDebug.formatters = {};
  /**
  * Selects a color for a debug namespace
  * @param {String} namespace The namespace string for the for the debug instance to be colored
  * @return {Number|String} An ANSI color code for the given namespace
  * @api private
  */

  function selectColor(namespace) {
    let hash = 0;

    for (let i = 0; i < namespace.length; i++) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  }

  createDebug.selectColor = selectColor;
  /**
  * Create a debugger with the given `namespace`.
  *
  * @param {String} namespace
  * @return {Function}
  * @api public
  */

  function createDebug(namespace) {
    let prevTime;

    function debug(...args) {
      // Disabled?
      if (!debug.enabled) {
        return;
      }

      const self = debug; // Set `diff` timestamp

      const curr = Number(new Date());
      const ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;
      args[0] = createDebug.coerce(args[0]);

      if (typeof args[0] !== 'string') {
        // Anything else let's inspect with %O
        args.unshift('%O');
      } // Apply any `formatters` transformations


      let index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
        // If we encounter an escaped % then don't increase the array index
        if (match === '%%') {
          return match;
        }

        index++;
        const formatter = createDebug.formatters[format];

        if (typeof formatter === 'function') {
          const val = args[index];
          match = formatter.call(self, val); // Now we need to remove `args[index]` since it's inlined in the `format`

          args.splice(index, 1);
          index--;
        }

        return match;
      }); // Apply env-specific formatting (colors, etc.)

      createDebug.formatArgs.call(self, args);
      const logFn = self.log || createDebug.log;
      logFn.apply(self, args);
    }

    debug.namespace = namespace;
    debug.enabled = createDebug.enabled(namespace);
    debug.useColors = createDebug.useColors();
    debug.color = selectColor(namespace);
    debug.destroy = destroy;
    debug.extend = extend; // Debug.formatArgs = formatArgs;
    // debug.rawLog = rawLog;
    // env-specific initialization logic for debug instances

    if (typeof createDebug.init === 'function') {
      createDebug.init(debug);
    }

    createDebug.instances.push(debug);
    return debug;
  }

  function destroy() {
    const index = createDebug.instances.indexOf(this);

    if (index !== -1) {
      createDebug.instances.splice(index, 1);
      return true;
    }

    return false;
  }

  function extend(namespace, delimiter) {
    const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
    newDebug.log = this.log;
    return newDebug;
  }
  /**
  * Enables a debug mode by namespaces. This can include modes
  * separated by a colon and wildcards.
  *
  * @param {String} namespaces
  * @api public
  */


  function enable(namespaces) {
    createDebug.save(namespaces);
    createDebug.names = [];
    createDebug.skips = [];
    let i;
    const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    const len = split.length;

    for (i = 0; i < len; i++) {
      if (!split[i]) {
        // ignore empty strings
        continue;
      }

      namespaces = split[i].replace(/\*/g, '.*?');

      if (namespaces[0] === '-') {
        createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
      } else {
        createDebug.names.push(new RegExp('^' + namespaces + '$'));
      }
    }

    for (i = 0; i < createDebug.instances.length; i++) {
      const instance = createDebug.instances[i];
      instance.enabled = createDebug.enabled(instance.namespace);
    }
  }
  /**
  * Disable debug output.
  *
  * @return {String} namespaces
  * @api public
  */


  function disable() {
    const namespaces = [...createDebug.names.map(toNamespace), ...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)].join(',');
    createDebug.enable('');
    return namespaces;
  }
  /**
  * Returns true if the given mode name is enabled, false otherwise.
  *
  * @param {String} name
  * @return {Boolean}
  * @api public
  */


  function enabled(name) {
    if (name[name.length - 1] === '*') {
      return true;
    }

    let i;
    let len;

    for (i = 0, len = createDebug.skips.length; i < len; i++) {
      if (createDebug.skips[i].test(name)) {
        return false;
      }
    }

    for (i = 0, len = createDebug.names.length; i < len; i++) {
      if (createDebug.names[i].test(name)) {
        return true;
      }
    }

    return false;
  }
  /**
  * Convert regexp to namespace
  *
  * @param {RegExp} regxep
  * @return {String} namespace
  * @api private
  */


  function toNamespace(regexp) {
    return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, '*');
  }
  /**
  * Coerce `val`.
  *
  * @param {Mixed} val
  * @return {Mixed}
  * @api private
  */


  function coerce(val) {
    if (val instanceof Error) {
      return val.stack || val.message;
    }

    return val;
  }

  createDebug.enable(createDebug.load());
  return createDebug;
}

var common = setup;

var browser$2 = createCommonjsModule(function (module, exports) {
  /* eslint-env browser */

  /**
   * This is the web browser implementation of `debug()`.
   */
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = localstorage();
  /**
   * Colors.
   */

  exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
  /**
   * Currently only WebKit-based Web Inspectors, Firefox >= v31,
   * and the Firebug extension (any Firefox version) are known
   * to support "%c" CSS customizations.
   *
   * TODO: add a `localStorage` variable to explicitly enable/disable colors
   */
  // eslint-disable-next-line complexity

  function useColors() {
    // NB: In an Electron preload script, document will be defined but not fully
    // initialized. Since we know we're in Chrome, we'll just detect this case
    // explicitly
    if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
      return true;
    } // Internet Explorer and Edge do not support colors.


    if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    } // Is webkit? http://stackoverflow.com/a/16459606/376773
    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632


    return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
    typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
    typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  /**
   * Colorize log arguments if enabled.
   *
   * @api public
   */


  function formatArgs(args) {
    args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);

    if (!this.useColors) {
      return;
    }

    const c = 'color: ' + this.color;
    args.splice(1, 0, c, 'color: inherit'); // The final "%c" is somewhat tricky, because there could be other
    // arguments passed either before or after the %c, so we need to
    // figure out the correct index to insert the CSS into

    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, match => {
      if (match === '%%') {
        return;
      }

      index++;

      if (match === '%c') {
        // We only are interested in the *last* %c
        // (the user may have provided their own)
        lastC = index;
      }
    });
    args.splice(lastC, 0, c);
  }
  /**
   * Invokes `console.log()` when available.
   * No-op when `console.log` is not a "function".
   *
   * @api public
   */


  function log(...args) {
    // This hackery is required for IE8/9, where
    // the `console.log` function doesn't have 'apply'
    return typeof console === 'object' && console.log && console.log(...args);
  }
  /**
   * Save `namespaces`.
   *
   * @param {String} namespaces
   * @api private
   */


  function save(namespaces) {
    try {
      if (namespaces) {
        exports.storage.setItem('debug', namespaces);
      } else {
        exports.storage.removeItem('debug');
      }
    } catch (error) {// Swallow
      // XXX (@Qix-) should we be logging these?
    }
  }
  /**
   * Load `namespaces`.
   *
   * @return {String} returns the previously persisted debug modes
   * @api private
   */


  function load() {
    let r;

    try {
      r = exports.storage.getItem('debug');
    } catch (error) {// Swallow
      // XXX (@Qix-) should we be logging these?
    } // If debug isn't set in LS, and we're in Electron, try to load $DEBUG


    if (!r && typeof browser$1 !== 'undefined' && 'env' in browser$1) {
      r = browser$1.env.DEBUG;
    }

    return r;
  }
  /**
   * Localstorage attempts to return the localstorage.
   *
   * This is necessary because safari throws
   * when a user disables cookies/localstorage
   * and you attempt to access it.
   *
   * @return {LocalStorage}
   * @api private
   */


  function localstorage() {
    try {
      // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
      // The Browser also has localStorage in the global context.
      return localStorage;
    } catch (error) {// Swallow
      // XXX (@Qix-) should we be logging these?
    }
  }

  module.exports = common(exports);
  const {
    formatters
  } = module.exports;
  /**
   * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
   */

  formatters.j = function (v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return '[UnexpectedJSONParseError]: ' + error.message;
    }
  };
});

/**
 * Module dependencies.
 */

var debug = browser$2('socket.io-client:url');
/**
 * Module exports.
 */

var url_1 = url;
/**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */

function url(uri, loc) {
  var obj = uri; // default to window.location

  loc = loc || typeof location !== 'undefined' && location;
  if (null == uri) uri = loc.protocol + '//' + loc.host; // relative path support

  if ('string' === typeof uri) {
    if ('/' === uri.charAt(0)) {
      if ('/' === uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.host + uri;
      }
    }

    if (!/^(https?|wss?):\/\//.test(uri)) {
      debug('protocol-less url %s', uri);

      if ('undefined' !== typeof loc) {
        uri = loc.protocol + '//' + uri;
      } else {
        uri = 'https://' + uri;
      }
    } // parse


    debug('parse %s', uri);
    obj = parseuri(uri);
  } // make sure we treat `localhost:80` and `localhost` equally


  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = '80';
    } else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = '443';
    }
  }

  obj.path = obj.path || '/';
  var ipv6 = obj.host.indexOf(':') !== -1;
  var host = ipv6 ? '[' + obj.host + ']' : obj.host; // define unique id

  obj.id = obj.protocol + '://' + host + ':' + obj.port; // define href

  obj.href = obj.protocol + '://' + host + (loc && loc.port === obj.port ? '' : ':' + obj.port);
  return obj;
}

/**
 * Helpers.
 */
var s$1 = 1000;
var m$1 = s$1 * 60;
var h$1 = m$1 * 60;
var d$1 = h$1 * 24;
var y$2 = d$1 * 365.25;
/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

var ms$1 = function (val, options) {
  options = options || {};
  var type = typeof val;

  if (type === 'string' && val.length > 0) {
    return parse$1(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong$1(val) : fmtShort$1(val);
  }

  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
};
/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */


function parse$1(str) {
  str = String(str);

  if (str.length > 100) {
    return;
  }

  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);

  if (!match) {
    return;
  }

  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();

  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y$2;

    case 'days':
    case 'day':
    case 'd':
      return n * d$1;

    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h$1;

    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m$1;

    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s$1;

    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;

    default:
      return undefined;
  }
}
/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */


function fmtShort$1(ms) {
  if (ms >= d$1) {
    return Math.round(ms / d$1) + 'd';
  }

  if (ms >= h$1) {
    return Math.round(ms / h$1) + 'h';
  }

  if (ms >= m$1) {
    return Math.round(ms / m$1) + 'm';
  }

  if (ms >= s$1) {
    return Math.round(ms / s$1) + 's';
  }

  return ms + 'ms';
}
/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */


function fmtLong$1(ms) {
  return plural$1(ms, d$1, 'day') || plural$1(ms, h$1, 'hour') || plural$1(ms, m$1, 'minute') || plural$1(ms, s$1, 'second') || ms + ' ms';
}
/**
 * Pluralization helper.
 */


function plural$1(ms, n, name) {
  if (ms < n) {
    return;
  }

  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }

  return Math.ceil(ms / n) + ' ' + name + 's';
}

var debug$1 = createCommonjsModule(function (module, exports) {
  /**
   * This is the common logic for both the Node.js and web browser
   * implementations of `debug()`.
   *
   * Expose `debug()` as the module.
   */
  exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
  exports.coerce = coerce;
  exports.disable = disable;
  exports.enable = enable;
  exports.enabled = enabled;
  exports.humanize = ms$1;
  /**
   * Active `debug` instances.
   */

  exports.instances = [];
  /**
   * The currently active debug mode names, and names to skip.
   */

  exports.names = [];
  exports.skips = [];
  /**
   * Map of special "%n" handling functions, for the debug "format" argument.
   *
   * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
   */

  exports.formatters = {};
  /**
   * Select a color.
   * @param {String} namespace
   * @return {Number}
   * @api private
   */

  function selectColor(namespace) {
    var hash = 0,
        i;

    for (i in namespace) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return exports.colors[Math.abs(hash) % exports.colors.length];
  }
  /**
   * Create a debugger with the given `namespace`.
   *
   * @param {String} namespace
   * @return {Function}
   * @api public
   */


  function createDebug(namespace) {
    var prevTime;

    function debug() {
      // disabled?
      if (!debug.enabled) return;
      var self = debug; // set `diff` timestamp

      var curr = +new Date();
      var ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr; // turn the `arguments` into a proper Array

      var args = new Array(arguments.length);

      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }

      args[0] = exports.coerce(args[0]);

      if ('string' !== typeof args[0]) {
        // anything else let's inspect with %O
        args.unshift('%O');
      } // apply any `formatters` transformations


      var index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
        // if we encounter an escaped % then don't increase the array index
        if (match === '%%') return match;
        index++;
        var formatter = exports.formatters[format];

        if ('function' === typeof formatter) {
          var val = args[index];
          match = formatter.call(self, val); // now we need to remove `args[index]` since it's inlined in the `format`

          args.splice(index, 1);
          index--;
        }

        return match;
      }); // apply env-specific formatting (colors, etc.)

      exports.formatArgs.call(self, args);
      var logFn = debug.log || exports.log || console.log.bind(console);
      logFn.apply(self, args);
    }

    debug.namespace = namespace;
    debug.enabled = exports.enabled(namespace);
    debug.useColors = exports.useColors();
    debug.color = selectColor(namespace);
    debug.destroy = destroy; // env-specific initialization logic for debug instances

    if ('function' === typeof exports.init) {
      exports.init(debug);
    }

    exports.instances.push(debug);
    return debug;
  }

  function destroy() {
    var index = exports.instances.indexOf(this);

    if (index !== -1) {
      exports.instances.splice(index, 1);
      return true;
    } else {
      return false;
    }
  }
  /**
   * Enables a debug mode by namespaces. This can include modes
   * separated by a colon and wildcards.
   *
   * @param {String} namespaces
   * @api public
   */


  function enable(namespaces) {
    exports.save(namespaces);
    exports.names = [];
    exports.skips = [];
    var i;
    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    var len = split.length;

    for (i = 0; i < len; i++) {
      if (!split[i]) continue; // ignore empty strings

      namespaces = split[i].replace(/\*/g, '.*?');

      if (namespaces[0] === '-') {
        exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
      } else {
        exports.names.push(new RegExp('^' + namespaces + '$'));
      }
    }

    for (i = 0; i < exports.instances.length; i++) {
      var instance = exports.instances[i];
      instance.enabled = exports.enabled(instance.namespace);
    }
  }
  /**
   * Disable debug output.
   *
   * @api public
   */


  function disable() {
    exports.enable('');
  }
  /**
   * Returns true if the given mode name is enabled, false otherwise.
   *
   * @param {String} name
   * @return {Boolean}
   * @api public
   */


  function enabled(name) {
    if (name[name.length - 1] === '*') {
      return true;
    }

    var i, len;

    for (i = 0, len = exports.skips.length; i < len; i++) {
      if (exports.skips[i].test(name)) {
        return false;
      }
    }

    for (i = 0, len = exports.names.length; i < len; i++) {
      if (exports.names[i].test(name)) {
        return true;
      }
    }

    return false;
  }
  /**
   * Coerce `val`.
   *
   * @param {Mixed} val
   * @return {Mixed}
   * @api private
   */


  function coerce(val) {
    if (val instanceof Error) return val.stack || val.message;
    return val;
  }
});

var browser$3 = createCommonjsModule(function (module, exports) {
  /**
   * This is the web browser implementation of `debug()`.
   *
   * Expose `debug()` as the module.
   */
  exports = module.exports = debug$1;
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = 'undefined' != typeof chrome && 'undefined' != typeof chrome.storage ? chrome.storage.local : localstorage();
  /**
   * Colors.
   */

  exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
  /**
   * Currently only WebKit-based Web Inspectors, Firefox >= v31,
   * and the Firebug extension (any Firefox version) are known
   * to support "%c" CSS customizations.
   *
   * TODO: add a `localStorage` variable to explicitly enable/disable colors
   */

  function useColors() {
    // NB: In an Electron preload script, document will be defined but not fully
    // initialized. Since we know we're in Chrome, we'll just detect this case
    // explicitly
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
      return true;
    } // Internet Explorer and Edge do not support colors.


    if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    } // is webkit? http://stackoverflow.com/a/16459606/376773
    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632


    return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // is firebug? http://stackoverflow.com/a/398120/376773
    typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // double check webkit in userAgent just in case we are in a worker
    typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  /**
   * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
   */


  exports.formatters.j = function (v) {
    try {
      return JSON.stringify(v);
    } catch (err) {
      return '[UnexpectedJSONParseError]: ' + err.message;
    }
  };
  /**
   * Colorize log arguments if enabled.
   *
   * @api public
   */


  function formatArgs(args) {
    var useColors = this.useColors;
    args[0] = (useColors ? '%c' : '') + this.namespace + (useColors ? ' %c' : ' ') + args[0] + (useColors ? '%c ' : ' ') + '+' + exports.humanize(this.diff);
    if (!useColors) return;
    var c = 'color: ' + this.color;
    args.splice(1, 0, c, 'color: inherit'); // the final "%c" is somewhat tricky, because there could be other
    // arguments passed either before or after the %c, so we need to
    // figure out the correct index to insert the CSS into

    var index = 0;
    var lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, function (match) {
      if ('%%' === match) return;
      index++;

      if ('%c' === match) {
        // we only are interested in the *last* %c
        // (the user may have provided their own)
        lastC = index;
      }
    });
    args.splice(lastC, 0, c);
  }
  /**
   * Invokes `console.log()` when available.
   * No-op when `console.log` is not a "function".
   *
   * @api public
   */


  function log() {
    // this hackery is required for IE8/9, where
    // the `console.log` function doesn't have 'apply'
    return 'object' === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
  }
  /**
   * Save `namespaces`.
   *
   * @param {String} namespaces
   * @api private
   */


  function save(namespaces) {
    try {
      if (null == namespaces) {
        exports.storage.removeItem('debug');
      } else {
        exports.storage.debug = namespaces;
      }
    } catch (e) {}
  }
  /**
   * Load `namespaces`.
   *
   * @return {String} returns the previously persisted debug modes
   * @api private
   */


  function load() {
    var r;

    try {
      r = exports.storage.debug;
    } catch (e) {} // If debug isn't set in LS, and we're in Electron, try to load $DEBUG


    if (!r && typeof browser$1 !== 'undefined' && 'env' in browser$1) {
      r = browser$1.env.DEBUG;
    }

    return r;
  }
  /**
   * Enable namespaces listed in `localStorage.debug` initially.
   */


  exports.enable(load());
  /**
   * Localstorage attempts to return the localstorage.
   *
   * This is necessary because safari throws
   * when a user disables cookies/localstorage
   * and you attempt to access it.
   *
   * @return {LocalStorage}
   * @api private
   */

  function localstorage() {
    try {
      return window.localStorage;
    } catch (e) {}
  }
});

var componentEmitter = createCommonjsModule(function (module) {
  /**
   * Expose `Emitter`.
   */
  {
    module.exports = Emitter;
  }
  /**
   * Initialize a new `Emitter`.
   *
   * @api public
   */


  function Emitter(obj) {
    if (obj) return mixin(obj);
  }
  /**
   * Mixin the emitter properties.
   *
   * @param {Object} obj
   * @return {Object}
   * @api private
   */

  function mixin(obj) {
    for (var key in Emitter.prototype) {
      obj[key] = Emitter.prototype[key];
    }

    return obj;
  }
  /**
   * Listen on the given `event` with `fn`.
   *
   * @param {String} event
   * @param {Function} fn
   * @return {Emitter}
   * @api public
   */


  Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
    this._callbacks = this._callbacks || {};
    (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
    return this;
  };
  /**
   * Adds an `event` listener that will be invoked a single
   * time then automatically removed.
   *
   * @param {String} event
   * @param {Function} fn
   * @return {Emitter}
   * @api public
   */


  Emitter.prototype.once = function (event, fn) {
    function on() {
      this.off(event, on);
      fn.apply(this, arguments);
    }

    on.fn = fn;
    this.on(event, on);
    return this;
  };
  /**
   * Remove the given callback for `event` or all
   * registered callbacks.
   *
   * @param {String} event
   * @param {Function} fn
   * @return {Emitter}
   * @api public
   */


  Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
    this._callbacks = this._callbacks || {}; // all

    if (0 == arguments.length) {
      this._callbacks = {};
      return this;
    } // specific event


    var callbacks = this._callbacks['$' + event];
    if (!callbacks) return this; // remove all handlers

    if (1 == arguments.length) {
      delete this._callbacks['$' + event];
      return this;
    } // remove specific handler


    var cb;

    for (var i = 0; i < callbacks.length; i++) {
      cb = callbacks[i];

      if (cb === fn || cb.fn === fn) {
        callbacks.splice(i, 1);
        break;
      }
    }

    return this;
  };
  /**
   * Emit `event` with the given args.
   *
   * @param {String} event
   * @param {Mixed} ...
   * @return {Emitter}
   */


  Emitter.prototype.emit = function (event) {
    this._callbacks = this._callbacks || {};
    var args = [].slice.call(arguments, 1),
        callbacks = this._callbacks['$' + event];

    if (callbacks) {
      callbacks = callbacks.slice(0);

      for (var i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(this, args);
      }
    }

    return this;
  };
  /**
   * Return array of callbacks for `event`.
   *
   * @param {String} event
   * @return {Array}
   * @api public
   */


  Emitter.prototype.listeners = function (event) {
    this._callbacks = this._callbacks || {};
    return this._callbacks['$' + event] || [];
  };
  /**
   * Check if this emitter has `event` handlers.
   *
   * @param {String} event
   * @return {Boolean}
   * @api public
   */


  Emitter.prototype.hasListeners = function (event) {
    return !!this.listeners(event).length;
  };
});

var toString = {}.toString;

var isarray = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var inited = false;

function init() {
  inited = true;
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;
}

function toByteArray(b64) {
  if (!inited) {
    init();
  }

  var i, j, l, tmp, placeHolders, arr;
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4');
  } // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice


  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0; // base64 is 4/3 + up to two characters of the original data

  arr = new Arr(len * 3 / 4 - placeHolders); // if there are placeholders, only get up to the last complete 4 chars

  l = placeHolders > 0 ? len - 4 : len;
  var L = 0;

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = tmp >> 16 & 0xFF;
    arr[L++] = tmp >> 8 & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  if (placeHolders === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr[L++] = tmp & 0xFF;
  } else if (placeHolders === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr[L++] = tmp >> 8 & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  return arr;
}

function tripletToBase64(num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
}

function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];

  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
    output.push(tripletToBase64(tmp));
  }

  return output.join('');
}

function fromByteArray(uint8) {
  if (!inited) {
    init();
  }

  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes

  var output = '';
  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3
  // go through the array every three bytes, we'll deal with trailing stuff later

  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
  } // pad the end with zeros, but make sure to not forget the extra bytes


  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup[tmp >> 2];
    output += lookup[tmp << 4 & 0x3F];
    output += '==';
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    output += lookup[tmp >> 10];
    output += lookup[tmp >> 4 & 0x3F];
    output += lookup[tmp << 2 & 0x3F];
    output += '=';
  }

  parts.push(output);
  return parts.join('');
}

function read(buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];
  i += d;
  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;

  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;

  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }

  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}

function write(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);

    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }

    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }

    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = e << mLen | m;
  eLen += mLen;

  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
}

var toString$1 = {}.toString;

var isArray = Array.isArray || function (arr) {
  return toString$1.call(arr) == '[object Array]';
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */


var INSPECT_MAX_BYTES = 50;
/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */

Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined ? global$1.TYPED_ARRAY_SUPPORT : true;

function kMaxLength() {
  return Buffer.TYPED_ARRAY_SUPPORT ? 0x7fffffff : 0x3fffffff;
}

function createBuffer(that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length');
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length);
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length);
    }

    that.length = length;
  }

  return that;
}
/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */


function Buffer(arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length);
  } // Common case.


  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error('If encoding is specified then the first argument must be a string');
    }

    return allocUnsafe(this, arg);
  }

  return from(this, arg, encodingOrOffset, length);
}

Buffer.poolSize = 8192; // not used by this implementation
// TODO: Legacy, not needed anymore. Remove in next major version.

Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype;
  return arr;
};

function from(that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number');
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length);
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset);
  }

  return fromObject(that, value);
}
/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/


Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length);
};

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;
}

function assertSize(size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number');
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative');
  }
}

function alloc(that, size, fill, encoding) {
  assertSize(size);

  if (size <= 0) {
    return createBuffer(that, size);
  }

  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string' ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
  }

  return createBuffer(that, size);
}
/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/


Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding);
};

function allocUnsafe(that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);

  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }

  return that;
}
/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */


Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size);
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */


Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size);
};

function fromString(that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding');
  }

  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);
  var actual = that.write(string, encoding);

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual);
  }

  return that;
}

function fromArrayLike(that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }

  return that;
}

function fromArrayBuffer(that, array, byteOffset, length) {
  array.byteLength; // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds');
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds');
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array);
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array;
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array);
  }

  return that;
}

function fromObject(that, obj) {
  if (internalIsBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);

    if (that.length === 0) {
      return that;
    }

    obj.copy(that, 0, 0, len);
    return that;
  }

  if (obj) {
    if (typeof ArrayBuffer !== 'undefined' && obj.buffer instanceof ArrayBuffer || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0);
      }

      return fromArrayLike(that, obj);
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data);
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.');
}

function checked(length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + kMaxLength().toString(16) + ' bytes');
  }

  return length | 0;
}

Buffer.isBuffer = isBuffer;

function internalIsBuffer(b) {
  return !!(b != null && b._isBuffer);
}

Buffer.compare = function compare(a, b) {
  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
    throw new TypeError('Arguments must be Buffers');
  }

  if (a === b) return 0;
  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
};

Buffer.isEncoding = function isEncoding(encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true;

    default:
      return false;
  }
};

Buffer.concat = function concat(list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers');
  }

  if (list.length === 0) {
    return Buffer.alloc(0);
  }

  var i;

  if (length === undefined) {
    length = 0;

    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  var buffer = Buffer.allocUnsafe(length);
  var pos = 0;

  for (i = 0; i < list.length; ++i) {
    var buf = list[i];

    if (!internalIsBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }

    buf.copy(buffer, pos);
    pos += buf.length;
  }

  return buffer;
};

function byteLength(string, encoding) {
  if (internalIsBuffer(string)) {
    return string.length;
  }

  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength;
  }

  if (typeof string !== 'string') {
    string = '' + string;
  }

  var len = string.length;
  if (len === 0) return 0; // Use a for loop to avoid recursion

  var loweredCase = false;

  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len;

      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length;

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2;

      case 'hex':
        return len >>> 1;

      case 'base64':
        return base64ToBytes(string).length;

      default:
        if (loweredCase) return utf8ToBytes(string).length; // assume utf8

        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}

Buffer.byteLength = byteLength;

function slowToString(encoding, start, end) {
  var loweredCase = false; // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.
  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.

  if (start === undefined || start < 0) {
    start = 0;
  } // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.


  if (start > this.length) {
    return '';
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return '';
  } // Force coersion to uint32. This will also coerce falsey/NaN values to 0.


  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return '';
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end);

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end);

      case 'ascii':
        return asciiSlice(this, start, end);

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end);

      case 'base64':
        return base64Slice(this, start, end);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
} // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.


Buffer.prototype._isBuffer = true;

function swap(b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer.prototype.swap16 = function swap16() {
  var len = this.length;

  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits');
  }

  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }

  return this;
};

Buffer.prototype.swap32 = function swap32() {
  var len = this.length;

  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits');
  }

  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }

  return this;
};

Buffer.prototype.swap64 = function swap64() {
  var len = this.length;

  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits');
  }

  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }

  return this;
};

Buffer.prototype.toString = function toString() {
  var length = this.length | 0;
  if (length === 0) return '';
  if (arguments.length === 0) return utf8Slice(this, 0, length);
  return slowToString.apply(this, arguments);
};

Buffer.prototype.equals = function equals(b) {
  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer');
  if (this === b) return true;
  return Buffer.compare(this, b) === 0;
};

Buffer.prototype.inspect = function inspect() {
  var str = '';
  var max = INSPECT_MAX_BYTES;

  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
    if (this.length > max) str += ' ... ';
  }

  return '<Buffer ' + str + '>';
};

Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
  if (!internalIsBuffer(target)) {
    throw new TypeError('Argument must be a Buffer');
  }

  if (start === undefined) {
    start = 0;
  }

  if (end === undefined) {
    end = target ? target.length : 0;
  }

  if (thisStart === undefined) {
    thisStart = 0;
  }

  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index');
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0;
  }

  if (thisStart >= thisEnd) {
    return -1;
  }

  if (start >= end) {
    return 1;
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;
  if (this === target) return 0;
  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);
  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break;
    }
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
}; // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf


function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1; // Normalize byteOffset

  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }

  byteOffset = +byteOffset; // Coerce to Number.

  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : buffer.length - 1;
  } // Normalize byteOffset: negative offsets start from the end of the buffer


  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;

  if (byteOffset >= buffer.length) {
    if (dir) return -1;else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;else return -1;
  } // Normalize val


  if (typeof val === 'string') {
    val = Buffer.from(val, encoding);
  } // Finally, search either indexOf (if dir is true) or lastIndexOf


  if (internalIsBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1;
    }

    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
  } else if (typeof val === 'number') {
    val = val & 0xFF; // Search for a byte value [0-255]

    if (Buffer.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
      }
    }

    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
  }

  throw new TypeError('val must be string, number or Buffer');
}

function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();

    if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1;
      }

      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read(buf, i) {
    if (indexSize === 1) {
      return buf[i];
    } else {
      return buf.readUInt16BE(i * indexSize);
    }
  }

  var i;

  if (dir) {
    var foundIndex = -1;

    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;

    for (i = byteOffset; i >= 0; i--) {
      var found = true;

      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break;
        }
      }

      if (found) return i;
    }
  }

  return -1;
}

Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1;
};

Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};

Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};

function hexWrite(buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;

  if (!length) {
    length = remaining;
  } else {
    length = Number(length);

    if (length > remaining) {
      length = remaining;
    }
  } // must be an even number of digits


  var strLen = string.length;
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string');

  if (length > strLen / 2) {
    length = strLen / 2;
  }

  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed)) return i;
    buf[offset + i] = parsed;
  }

  return i;
}

function utf8Write(buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}

function asciiWrite(buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length);
}

function latin1Write(buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length);
}

function base64Write(buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length);
}

function ucs2Write(buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}

Buffer.prototype.write = function write(string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0; // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0; // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0;

    if (isFinite(length)) {
      length = length | 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    } // legacy write(string, encoding, offset, length) - remove in v0.13

  } else {
    throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds');
  }

  if (!encoding) encoding = 'utf8';
  var loweredCase = false;

  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length);

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length);

      case 'ascii':
        return asciiWrite(this, string, offset, length);

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length);

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer.prototype.toJSON = function toJSON() {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  };
};

function base64Slice(buf, start, end) {
  if (start === 0 && end === buf.length) {
    return fromByteArray(buf);
  } else {
    return fromByteArray(buf.slice(start, end));
  }
}

function utf8Slice(buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];
  var i = start;

  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }

          break;

        case 2:
          secondByte = buf[i + 1];

          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;

            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }

          break;

        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];

          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;

            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }

          break;

        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];

          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;

            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }

      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res);
} // Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety


var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray(codePoints) {
  var len = codePoints.length;

  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
  } // Decode in chunks to avoid "call stack size exceeded".


  var res = '';
  var i = 0;

  while (i < len) {
    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
  }

  return res;
}

function asciiSlice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }

  return ret;
}

function latin1Slice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }

  return ret;
}

function hexSlice(buf, start, end) {
  var len = buf.length;
  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;
  var out = '';

  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }

  return out;
}

function utf16leSlice(buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';

  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }

  return res;
}

Buffer.prototype.slice = function slice(start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;
  var newBuf;

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer(sliceLen, undefined);

    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }

  return newBuf;
};
/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */


function checkOffset(offset, ext, length) {
  if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
}

Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);
  var val = this[offset];
  var mul = 1;
  var i = 0;

  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val;
};

Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;

  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;

  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val;
};

Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset];
};

Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | this[offset + 1] << 8;
};

Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] << 8 | this[offset + 1];
};

Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
};

Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};

Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);
  var val = this[offset];
  var mul = 1;
  var i = 0;

  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  mul *= 0x80;
  if (val >= mul) val -= Math.pow(2, 8 * byteLength);
  return val;
};

Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);
  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];

  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }

  mul *= 0x80;
  if (val >= mul) val -= Math.pow(2, 8 * byteLength);
  return val;
};

Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return this[offset];
  return (0xff - this[offset] + 1) * -1;
};

Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | this[offset + 1] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | this[offset] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};

Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};

Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, true, 23, 4);
};

Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, false, 23, 4);
};

Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, true, 52, 8);
};

Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, false, 52, 8);
};

function checkInt(buf, value, offset, ext, max, min) {
  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
}

Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;

  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;

  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;

  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;

  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  this[offset] = value & 0xff;
  return offset + 1;
};

function objectWriteUInt16(buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1;

  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & 0xff << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }

  return offset + 2;
};

Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }

  return offset + 2;
};

function objectWriteUInt32(buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1;

  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 0xff;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }

  return offset + 4;
};

Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }

  return offset + 4;
};

Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;

  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);
    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;

  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }

    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;

  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);
    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;

  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }

    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = value & 0xff;
  return offset + 1;
};

Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }

  return offset + 2;
};

Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }

  return offset + 2;
};

Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }

  return offset + 4;
};

Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }

  return offset + 4;
};

function checkIEEE754(buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
  if (offset < 0) throw new RangeError('Index out of range');
}

function writeFloat(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4);
  }

  write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4;
}

Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert);
};

Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert);
};

function writeDouble(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8);
  }

  write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8;
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert);
};

Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert);
}; // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)


Buffer.prototype.copy = function copy(target, targetStart, start, end) {
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start; // Copy 0 bytes; we're done

  if (end === start) return 0;
  if (target.length === 0 || this.length === 0) return 0; // Fatal error conditions

  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds');
  }

  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds');
  if (end < 0) throw new RangeError('sourceEnd out of bounds'); // Are we oob?

  if (end > this.length) end = this.length;

  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;
  var i;

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
  }

  return len;
}; // Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])


Buffer.prototype.fill = function fill(val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }

    if (val.length === 1) {
      var code = val.charCodeAt(0);

      if (code < 256) {
        val = code;
      }
    }

    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string');
    }

    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding);
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  } // Invalid ranges are not set to a default, so can range check early.


  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index');
  }

  if (end <= start) {
    return this;
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;
  if (!val) val = 0;
  var i;

  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = internalIsBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
    var len = bytes.length;

    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this;
}; // HELPER FUNCTIONS
// ================


var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function base64clean(str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, ''); // Node converts strings with length < 2 to ''

  if (str.length < 2) return ''; // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not

  while (str.length % 4 !== 0) {
    str = str + '=';
  }

  return str;
}

function stringtrim(str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i); // is surrogate component

    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        } // valid lead


        leadSurrogate = codePoint;
        continue;
      } // 2 leads in a row


      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue;
      } // valid surrogate pair


      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null; // encode utf8

    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break;
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break;
      bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break;
      bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break;
      bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else {
      throw new Error('Invalid code point');
    }
  }

  return bytes;
}

function asciiToBytes(str) {
  var byteArray = [];

  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }

  return byteArray;
}

function utf16leToBytes(str, units) {
  var c, hi, lo;
  var byteArray = [];

  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break;
    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray;
}

function base64ToBytes(str) {
  return toByteArray(base64clean(str));
}

function blitBuffer(src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length) break;
    dst[i + offset] = src[i];
  }

  return i;
}

function isnan(val) {
  return val !== val; // eslint-disable-line no-self-compare
} // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually


function isBuffer(obj) {
  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj));
}

function isFastBuffer(obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
} // For Node v0.10 support. Remove this eventually.


function isSlowBuffer(obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0));
}

var isBuffer$1 = isBuf;
var withNativeBuffer = typeof Buffer === 'function' && typeof Buffer.isBuffer === 'function';
var withNativeArrayBuffer = typeof ArrayBuffer === 'function';

var isView = function (obj) {
  return typeof ArrayBuffer.isView === 'function' ? ArrayBuffer.isView(obj) : obj.buffer instanceof ArrayBuffer;
};
/**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */


function isBuf(obj) {
  return withNativeBuffer && Buffer.isBuffer(obj) || withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj));
}

/*global Blob,File*/

/**
 * Module requirements
 */

var toString$2 = Object.prototype.toString;
var withNativeBlob = typeof Blob === 'function' || typeof Blob !== 'undefined' && toString$2.call(Blob) === '[object BlobConstructor]';
var withNativeFile = typeof File === 'function' || typeof File !== 'undefined' && toString$2.call(File) === '[object FileConstructor]';
/**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */

var deconstructPacket = function (packet) {
  var buffers = [];
  var packetData = packet.data;
  var pack = packet;
  pack.data = _deconstructPacket(packetData, buffers);
  pack.attachments = buffers.length; // number of binary 'attachments'

  return {
    packet: pack,
    buffers: buffers
  };
};

function _deconstructPacket(data, buffers) {
  if (!data) return data;

  if (isBuffer$1(data)) {
    var placeholder = {
      _placeholder: true,
      num: buffers.length
    };
    buffers.push(data);
    return placeholder;
  } else if (isarray(data)) {
    var newData = new Array(data.length);

    for (var i = 0; i < data.length; i++) {
      newData[i] = _deconstructPacket(data[i], buffers);
    }

    return newData;
  } else if (typeof data === 'object' && !(data instanceof Date)) {
    var newData = {};

    for (var key in data) {
      newData[key] = _deconstructPacket(data[key], buffers);
    }

    return newData;
  }

  return data;
}
/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */


var reconstructPacket = function (packet, buffers) {
  packet.data = _reconstructPacket(packet.data, buffers);
  packet.attachments = undefined; // no longer useful

  return packet;
};

function _reconstructPacket(data, buffers) {
  if (!data) return data;

  if (data && data._placeholder) {
    return buffers[data.num]; // appropriate buffer (should be natural order anyway)
  } else if (isarray(data)) {
    for (var i = 0; i < data.length; i++) {
      data[i] = _reconstructPacket(data[i], buffers);
    }
  } else if (typeof data === 'object') {
    for (var key in data) {
      data[key] = _reconstructPacket(data[key], buffers);
    }
  }

  return data;
}
/**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */


var removeBlobs = function (data, callback) {
  function _removeBlobs(obj, curKey, containingObject) {
    if (!obj) return obj; // convert any blob

    if (withNativeBlob && obj instanceof Blob || withNativeFile && obj instanceof File) {
      pendingBlobs++; // async filereader

      var fileReader = new FileReader();

      fileReader.onload = function () {
        // this.result == arraybuffer
        if (containingObject) {
          containingObject[curKey] = this.result;
        } else {
          bloblessData = this.result;
        } // if nothing pending its callback time


        if (! --pendingBlobs) {
          callback(bloblessData);
        }
      };

      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
    } else if (isarray(obj)) {
      // handle array
      for (var i = 0; i < obj.length; i++) {
        _removeBlobs(obj[i], i, obj);
      }
    } else if (typeof obj === 'object' && !isBuffer$1(obj)) {
      // and object
      for (var key in obj) {
        _removeBlobs(obj[key], key, obj);
      }
    }
  }

  var pendingBlobs = 0;
  var bloblessData = data;

  _removeBlobs(bloblessData);

  if (!pendingBlobs) {
    callback(bloblessData);
  }
};

var binary = {
  deconstructPacket: deconstructPacket,
  reconstructPacket: reconstructPacket,
  removeBlobs: removeBlobs
};

var socket_ioParser = createCommonjsModule(function (module, exports) {
  /**
   * Module dependencies.
   */
  var debug = browser$3('socket.io-parser');
  /**
   * Protocol version.
   *
   * @api public
   */

  exports.protocol = 4;
  /**
   * Packet types.
   *
   * @api public
   */

  exports.types = ['CONNECT', 'DISCONNECT', 'EVENT', 'ACK', 'ERROR', 'BINARY_EVENT', 'BINARY_ACK'];
  /**
   * Packet type `connect`.
   *
   * @api public
   */

  exports.CONNECT = 0;
  /**
   * Packet type `disconnect`.
   *
   * @api public
   */

  exports.DISCONNECT = 1;
  /**
   * Packet type `event`.
   *
   * @api public
   */

  exports.EVENT = 2;
  /**
   * Packet type `ack`.
   *
   * @api public
   */

  exports.ACK = 3;
  /**
   * Packet type `error`.
   *
   * @api public
   */

  exports.ERROR = 4;
  /**
   * Packet type 'binary event'
   *
   * @api public
   */

  exports.BINARY_EVENT = 5;
  /**
   * Packet type `binary ack`. For acks with binary arguments.
   *
   * @api public
   */

  exports.BINARY_ACK = 6;
  /**
   * Encoder constructor.
   *
   * @api public
   */

  exports.Encoder = Encoder;
  /**
   * Decoder constructor.
   *
   * @api public
   */

  exports.Decoder = Decoder;
  /**
   * A socket.io Encoder instance
   *
   * @api public
   */

  function Encoder() {}

  var ERROR_PACKET = exports.ERROR + '"encode error"';
  /**
   * Encode a packet as a single string if non-binary, or as a
   * buffer sequence, depending on packet type.
   *
   * @param {Object} obj - packet object
   * @param {Function} callback - function to handle encodings (likely engine.write)
   * @return Calls callback with Array of encodings
   * @api public
   */

  Encoder.prototype.encode = function (obj, callback) {
    debug('encoding packet %j', obj);

    if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
      encodeAsBinary(obj, callback);
    } else {
      var encoding = encodeAsString(obj);
      callback([encoding]);
    }
  };
  /**
   * Encode packet as string.
   *
   * @param {Object} packet
   * @return {String} encoded
   * @api private
   */


  function encodeAsString(obj) {
    // first is type
    var str = '' + obj.type; // attachments if we have them

    if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
      str += obj.attachments + '-';
    } // if we have a namespace other than `/`
    // we append it followed by a comma `,`


    if (obj.nsp && '/' !== obj.nsp) {
      str += obj.nsp + ',';
    } // immediately followed by the id


    if (null != obj.id) {
      str += obj.id;
    } // json data


    if (null != obj.data) {
      var payload = tryStringify(obj.data);

      if (payload !== false) {
        str += payload;
      } else {
        return ERROR_PACKET;
      }
    }

    debug('encoded %j as %s', obj, str);
    return str;
  }

  function tryStringify(str) {
    try {
      return JSON.stringify(str);
    } catch (e) {
      return false;
    }
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   *
   * @param {Object} packet
   * @return {Buffer} encoded
   * @api private
   */


  function encodeAsBinary(obj, callback) {
    function writeEncoding(bloblessData) {
      var deconstruction = binary.deconstructPacket(bloblessData);
      var pack = encodeAsString(deconstruction.packet);
      var buffers = deconstruction.buffers;
      buffers.unshift(pack); // add packet info to beginning of data list

      callback(buffers); // write all the buffers
    }

    binary.removeBlobs(obj, writeEncoding);
  }
  /**
   * A socket.io Decoder instance
   *
   * @return {Object} decoder
   * @api public
   */


  function Decoder() {
    this.reconstructor = null;
  }
  /**
   * Mix in `Emitter` with Decoder.
   */


  componentEmitter(Decoder.prototype);
  /**
   * Decodes an encoded packet string into packet JSON.
   *
   * @param {String} obj - encoded packet
   * @return {Object} packet
   * @api public
   */

  Decoder.prototype.add = function (obj) {
    var packet;

    if (typeof obj === 'string') {
      packet = decodeString(obj);

      if (exports.BINARY_EVENT === packet.type || exports.BINARY_ACK === packet.type) {
        // binary packet's json
        this.reconstructor = new BinaryReconstructor(packet); // no attachments, labeled binary but no binary data to follow

        if (this.reconstructor.reconPack.attachments === 0) {
          this.emit('decoded', packet);
        }
      } else {
        // non-binary full packet
        this.emit('decoded', packet);
      }
    } else if (isBuffer$1(obj) || obj.base64) {
      // raw binary data
      if (!this.reconstructor) {
        throw new Error('got binary data when not reconstructing a packet');
      } else {
        packet = this.reconstructor.takeBinaryData(obj);

        if (packet) {
          // received final buffer
          this.reconstructor = null;
          this.emit('decoded', packet);
        }
      }
    } else {
      throw new Error('Unknown type: ' + obj);
    }
  };
  /**
   * Decode a packet String (JSON data)
   *
   * @param {String} str
   * @return {Object} packet
   * @api private
   */


  function decodeString(str) {
    var i = 0; // look up type

    var p = {
      type: Number(str.charAt(0))
    };

    if (null == exports.types[p.type]) {
      return error('unknown packet type ' + p.type);
    } // look up attachments if type binary


    if (exports.BINARY_EVENT === p.type || exports.BINARY_ACK === p.type) {
      var buf = '';

      while (str.charAt(++i) !== '-') {
        buf += str.charAt(i);
        if (i == str.length) break;
      }

      if (buf != Number(buf) || str.charAt(i) !== '-') {
        throw new Error('Illegal attachments');
      }

      p.attachments = Number(buf);
    } // look up namespace (if any)


    if ('/' === str.charAt(i + 1)) {
      p.nsp = '';

      while (++i) {
        var c = str.charAt(i);
        if (',' === c) break;
        p.nsp += c;
        if (i === str.length) break;
      }
    } else {
      p.nsp = '/';
    } // look up id


    var next = str.charAt(i + 1);

    if ('' !== next && Number(next) == next) {
      p.id = '';

      while (++i) {
        var c = str.charAt(i);

        if (null == c || Number(c) != c) {
          --i;
          break;
        }

        p.id += str.charAt(i);
        if (i === str.length) break;
      }

      p.id = Number(p.id);
    } // look up json data


    if (str.charAt(++i)) {
      var payload = tryParse(str.substr(i));
      var isPayloadValid = payload !== false && (p.type === exports.ERROR || isarray(payload));

      if (isPayloadValid) {
        p.data = payload;
      } else {
        return error('invalid payload');
      }
    }

    debug('decoded %s as %j', str, p);
    return p;
  }

  function tryParse(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return false;
    }
  }
  /**
   * Deallocates a parser's resources
   *
   * @api public
   */


  Decoder.prototype.destroy = function () {
    if (this.reconstructor) {
      this.reconstructor.finishedReconstruction();
    }
  };
  /**
   * A manager of a binary event's 'buffer sequence'. Should
   * be constructed whenever a packet of type BINARY_EVENT is
   * decoded.
   *
   * @param {Object} packet
   * @return {BinaryReconstructor} initialized reconstructor
   * @api private
   */


  function BinaryReconstructor(packet) {
    this.reconPack = packet;
    this.buffers = [];
  }
  /**
   * Method to be called when binary data received from connection
   * after a BINARY_EVENT packet.
   *
   * @param {Buffer | ArrayBuffer} binData - the raw binary data received
   * @return {null | Object} returns null if more binary data is expected or
   *   a reconstructed packet object if all buffers have been received.
   * @api private
   */


  BinaryReconstructor.prototype.takeBinaryData = function (binData) {
    this.buffers.push(binData);

    if (this.buffers.length === this.reconPack.attachments) {
      // done with buffer list
      var packet = binary.reconstructPacket(this.reconPack, this.buffers);
      this.finishedReconstruction();
      return packet;
    }

    return null;
  };
  /**
   * Cleans up binary packet reconstruction variables.
   *
   * @api private
   */


  BinaryReconstructor.prototype.finishedReconstruction = function () {
    this.reconPack = null;
    this.buffers = [];
  };

  function error(msg) {
    return {
      type: exports.ERROR,
      data: 'parser error: ' + msg
    };
  }
});

var hasCors = createCommonjsModule(function (module) {
  /**
   * Module exports.
   *
   * Logic borrowed from Modernizr:
   *
   *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
   */
  try {
    module.exports = typeof XMLHttpRequest !== 'undefined' && 'withCredentials' in new XMLHttpRequest();
  } catch (err) {
    // if XMLHttp support is disabled in IE then it will throw
    // when trying to create
    module.exports = false;
  }
});

var globalThis_browser = function () {
  if (typeof self !== 'undefined') {
    return self;
  } else if (typeof window !== 'undefined') {
    return window;
  } else {
    return Function('return this')(); // eslint-disable-line no-new-func
  }
}();

var xmlhttprequest = function (opts) {
  var xdomain = opts.xdomain; // scheme must be same when usign XDomainRequest
  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx

  var xscheme = opts.xscheme; // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
  // https://github.com/Automattic/engine.io-client/pull/217

  var enablesXDR = opts.enablesXDR; // XMLHttpRequest can be disabled on IE

  try {
    if ('undefined' !== typeof XMLHttpRequest && (!xdomain || hasCors)) {
      return new XMLHttpRequest();
    }
  } catch (e) {} // Use XDomainRequest for IE8 if enablesXDR is true
  // because loading bar keeps flashing when using jsonp-polling
  // https://github.com/yujiosaka/socke.io-ie8-loading-example


  try {
    if ('undefined' !== typeof XDomainRequest && !xscheme && enablesXDR) {
      return new XDomainRequest();
    }
  } catch (e) {}

  if (!xdomain) {
    try {
      return new globalThis_browser[['Active'].concat('Object').join('X')]('Microsoft.XMLHTTP');
    } catch (e) {}
  }
};

/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */
var keys$1 = Object.keys || function keys(obj) {
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }

  return arr;
};

/* global Blob File */

/*
 * Module requirements.
 */

var toString$3 = Object.prototype.toString;
var withNativeBlob$1 = typeof Blob === 'function' || typeof Blob !== 'undefined' && toString$3.call(Blob) === '[object BlobConstructor]';
var withNativeFile$1 = typeof File === 'function' || typeof File !== 'undefined' && toString$3.call(File) === '[object FileConstructor]';
/**
 * Module exports.
 */

var hasBinary2 = hasBinary;
/**
 * Checks for binary data.
 *
 * Supports Buffer, ArrayBuffer, Blob and File.
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(obj) {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  if (isarray(obj)) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (hasBinary(obj[i])) {
        return true;
      }
    }

    return false;
  }

  if (typeof Buffer === 'function' && Buffer.isBuffer && Buffer.isBuffer(obj) || typeof ArrayBuffer === 'function' && obj instanceof ArrayBuffer || withNativeBlob$1 && obj instanceof Blob || withNativeFile$1 && obj instanceof File) {
    return true;
  } // see: https://github.com/Automattic/has-binary/pull/4


  if (obj.toJSON && typeof obj.toJSON === 'function' && arguments.length === 1) {
    return hasBinary(obj.toJSON(), true);
  }

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
      return true;
    }
  }

  return false;
}

/**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */
var arraybuffer_slice = function (arraybuffer, start, end) {
  var bytes = arraybuffer.byteLength;
  start = start || 0;
  end = end || bytes;

  if (arraybuffer.slice) {
    return arraybuffer.slice(start, end);
  }

  if (start < 0) {
    start += bytes;
  }

  if (end < 0) {
    end += bytes;
  }

  if (end > bytes) {
    end = bytes;
  }

  if (start >= bytes || start >= end || bytes === 0) {
    return new ArrayBuffer(0);
  }

  var abv = new Uint8Array(arraybuffer);
  var result = new Uint8Array(end - start);

  for (var i = start, ii = 0; i < end; i++, ii++) {
    result[ii] = abv[i];
  }

  return result.buffer;
};

var after_1 = after;

function after(count, callback, err_cb) {
  var bail = false;
  err_cb = err_cb || noop$1;
  proxy.count = count;
  return count === 0 ? callback() : proxy;

  function proxy(err, result) {
    if (proxy.count <= 0) {
      throw new Error('after called too many times');
    }

    --proxy.count; // after first error, rest are passed to err_cb

    if (err) {
      bail = true;
      callback(err); // future error callbacks will go to error handler

      callback = err_cb;
    } else if (proxy.count === 0 && !bail) {
      callback(null, result);
    }
  }
}

function noop$1() {}

/*! https://mths.be/utf8js v2.1.2 by @mathias */
var stringFromCharCode = String.fromCharCode; // Taken from https://mths.be/punycode

function ucs2decode(string) {
  var output = [];
  var counter = 0;
  var length = string.length;
  var value;
  var extra;

  while (counter < length) {
    value = string.charCodeAt(counter++);

    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
      // high surrogate, and there is a next character
      extra = string.charCodeAt(counter++);

      if ((extra & 0xFC00) == 0xDC00) {
        // low surrogate
        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        // unmatched surrogate; only append this code unit, in case the next
        // code unit is the high surrogate of a surrogate pair
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }

  return output;
} // Taken from https://mths.be/punycode


function ucs2encode(array) {
  var length = array.length;
  var index = -1;
  var value;
  var output = '';

  while (++index < length) {
    value = array[index];

    if (value > 0xFFFF) {
      value -= 0x10000;
      output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
      value = 0xDC00 | value & 0x3FF;
    }

    output += stringFromCharCode(value);
  }

  return output;
}

function checkScalarValue(codePoint, strict) {
  if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
    if (strict) {
      throw Error('Lone surrogate U+' + codePoint.toString(16).toUpperCase() + ' is not a scalar value');
    }

    return false;
  }

  return true;
}
/*--------------------------------------------------------------------------*/


function createByte(codePoint, shift) {
  return stringFromCharCode(codePoint >> shift & 0x3F | 0x80);
}

function encodeCodePoint(codePoint, strict) {
  if ((codePoint & 0xFFFFFF80) == 0) {
    // 1-byte sequence
    return stringFromCharCode(codePoint);
  }

  var symbol = '';

  if ((codePoint & 0xFFFFF800) == 0) {
    // 2-byte sequence
    symbol = stringFromCharCode(codePoint >> 6 & 0x1F | 0xC0);
  } else if ((codePoint & 0xFFFF0000) == 0) {
    // 3-byte sequence
    if (!checkScalarValue(codePoint, strict)) {
      codePoint = 0xFFFD;
    }

    symbol = stringFromCharCode(codePoint >> 12 & 0x0F | 0xE0);
    symbol += createByte(codePoint, 6);
  } else if ((codePoint & 0xFFE00000) == 0) {
    // 4-byte sequence
    symbol = stringFromCharCode(codePoint >> 18 & 0x07 | 0xF0);
    symbol += createByte(codePoint, 12);
    symbol += createByte(codePoint, 6);
  }

  symbol += stringFromCharCode(codePoint & 0x3F | 0x80);
  return symbol;
}

function utf8encode(string, opts) {
  opts = opts || {};
  var strict = false !== opts.strict;
  var codePoints = ucs2decode(string);
  var length = codePoints.length;
  var index = -1;
  var codePoint;
  var byteString = '';

  while (++index < length) {
    codePoint = codePoints[index];
    byteString += encodeCodePoint(codePoint, strict);
  }

  return byteString;
}
/*--------------------------------------------------------------------------*/


function readContinuationByte() {
  if (byteIndex >= byteCount) {
    throw Error('Invalid byte index');
  }

  var continuationByte = byteArray[byteIndex] & 0xFF;
  byteIndex++;

  if ((continuationByte & 0xC0) == 0x80) {
    return continuationByte & 0x3F;
  } // If we end up here, it’s not a continuation byte


  throw Error('Invalid continuation byte');
}

function decodeSymbol(strict) {
  var byte1;
  var byte2;
  var byte3;
  var byte4;
  var codePoint;

  if (byteIndex > byteCount) {
    throw Error('Invalid byte index');
  }

  if (byteIndex == byteCount) {
    return false;
  } // Read first byte


  byte1 = byteArray[byteIndex] & 0xFF;
  byteIndex++; // 1-byte sequence (no continuation bytes)

  if ((byte1 & 0x80) == 0) {
    return byte1;
  } // 2-byte sequence


  if ((byte1 & 0xE0) == 0xC0) {
    byte2 = readContinuationByte();
    codePoint = (byte1 & 0x1F) << 6 | byte2;

    if (codePoint >= 0x80) {
      return codePoint;
    } else {
      throw Error('Invalid continuation byte');
    }
  } // 3-byte sequence (may include unpaired surrogates)


  if ((byte1 & 0xF0) == 0xE0) {
    byte2 = readContinuationByte();
    byte3 = readContinuationByte();
    codePoint = (byte1 & 0x0F) << 12 | byte2 << 6 | byte3;

    if (codePoint >= 0x0800) {
      return checkScalarValue(codePoint, strict) ? codePoint : 0xFFFD;
    } else {
      throw Error('Invalid continuation byte');
    }
  } // 4-byte sequence


  if ((byte1 & 0xF8) == 0xF0) {
    byte2 = readContinuationByte();
    byte3 = readContinuationByte();
    byte4 = readContinuationByte();
    codePoint = (byte1 & 0x07) << 0x12 | byte2 << 0x0C | byte3 << 0x06 | byte4;

    if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
      return codePoint;
    }
  }

  throw Error('Invalid UTF-8 detected');
}

var byteArray;
var byteCount;
var byteIndex;

function utf8decode(byteString, opts) {
  opts = opts || {};
  var strict = false !== opts.strict;
  byteArray = ucs2decode(byteString);
  byteCount = byteArray.length;
  byteIndex = 0;
  var codePoints = [];
  var tmp;

  while ((tmp = decodeSymbol(strict)) !== false) {
    codePoints.push(tmp);
  }

  return ucs2encode(codePoints);
}

var utf8 = {
  version: '2.1.2',
  encode: utf8encode,
  decode: utf8decode
};

var base64Arraybuffer = createCommonjsModule(function (module, exports) {
  /*
   * base64-arraybuffer
   * https://github.com/niklasvh/base64-arraybuffer
   *
   * Copyright (c) 2012 Niklas von Hertzen
   * Licensed under the MIT license.
   */
  (function () {

    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"; // Use a lookup table to find the index.

    var lookup = new Uint8Array(256);

    for (var i = 0; i < chars.length; i++) {
      lookup[chars.charCodeAt(i)] = i;
    }

    exports.encode = function (arraybuffer) {
      var bytes = new Uint8Array(arraybuffer),
          i,
          len = bytes.length,
          base64 = "";

      for (i = 0; i < len; i += 3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
        base64 += chars[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
        base64 += chars[bytes[i + 2] & 63];
      }

      if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + "=";
      } else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + "==";
      }

      return base64;
    };

    exports.decode = function (base64) {
      var bufferLength = base64.length * 0.75,
          len = base64.length,
          i,
          p = 0,
          encoded1,
          encoded2,
          encoded3,
          encoded4;

      if (base64[base64.length - 1] === "=") {
        bufferLength--;

        if (base64[base64.length - 2] === "=") {
          bufferLength--;
        }
      }

      var arraybuffer = new ArrayBuffer(bufferLength),
          bytes = new Uint8Array(arraybuffer);

      for (i = 0; i < len; i += 4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i + 1)];
        encoded3 = lookup[base64.charCodeAt(i + 2)];
        encoded4 = lookup[base64.charCodeAt(i + 3)];
        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
      }

      return arraybuffer;
    };
  })();
});

/**
 * Create a blob builder even when vendor prefixes exist
 */
var BlobBuilder = typeof BlobBuilder !== 'undefined' ? BlobBuilder : typeof WebKitBlobBuilder !== 'undefined' ? WebKitBlobBuilder : typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : false;
/**
 * Check if Blob constructor is supported
 */

var blobSupported = function () {
  try {
    var a = new Blob(['hi']);
    return a.size === 2;
  } catch (e) {
    return false;
  }
}();
/**
 * Check if Blob constructor supports ArrayBufferViews
 * Fails in Safari 6, so we need to map to ArrayBuffers there.
 */


var blobSupportsArrayBufferView = blobSupported && function () {
  try {
    var b = new Blob([new Uint8Array([1, 2])]);
    return b.size === 2;
  } catch (e) {
    return false;
  }
}();
/**
 * Check if BlobBuilder is supported
 */


var blobBuilderSupported = BlobBuilder && BlobBuilder.prototype.append && BlobBuilder.prototype.getBlob;
/**
 * Helper function that maps ArrayBufferViews to ArrayBuffers
 * Used by BlobBuilder constructor and old browsers that didn't
 * support it in the Blob constructor.
 */

function mapArrayBufferViews(ary) {
  return ary.map(function (chunk) {
    if (chunk.buffer instanceof ArrayBuffer) {
      var buf = chunk.buffer; // if this is a subarray, make a copy so we only
      // include the subarray region from the underlying buffer

      if (chunk.byteLength !== buf.byteLength) {
        var copy = new Uint8Array(chunk.byteLength);
        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
        buf = copy.buffer;
      }

      return buf;
    }

    return chunk;
  });
}

function BlobBuilderConstructor(ary, options) {
  options = options || {};
  var bb = new BlobBuilder();
  mapArrayBufferViews(ary).forEach(function (part) {
    bb.append(part);
  });
  return options.type ? bb.getBlob(options.type) : bb.getBlob();
}

function BlobConstructor(ary, options) {
  return new Blob(mapArrayBufferViews(ary), options || {});
}

if (typeof Blob !== 'undefined') {
  BlobBuilderConstructor.prototype = Blob.prototype;
  BlobConstructor.prototype = Blob.prototype;
}

var blob = function () {
  if (blobSupported) {
    return blobSupportsArrayBufferView ? Blob : BlobConstructor;
  } else if (blobBuilderSupported) {
    return BlobBuilderConstructor;
  } else {
    return undefined;
  }
}();

var browser$4 = createCommonjsModule(function (module, exports) {
  /**
   * Module dependencies.
   */
  var base64encoder;

  if (typeof ArrayBuffer !== 'undefined') {
    base64encoder = base64Arraybuffer;
  }
  /**
   * Check if we are running an android browser. That requires us to use
   * ArrayBuffer with polling transports...
   *
   * http://ghinda.net/jpeg-blob-ajax-android/
   */


  var isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  /**
   * Check if we are running in PhantomJS.
   * Uploading a Blob with PhantomJS does not work correctly, as reported here:
   * https://github.com/ariya/phantomjs/issues/11395
   * @type boolean
   */

  var isPhantomJS = typeof navigator !== 'undefined' && /PhantomJS/i.test(navigator.userAgent);
  /**
   * When true, avoids using Blobs to encode payloads.
   * @type boolean
   */

  var dontSendBlobs = isAndroid || isPhantomJS;
  /**
   * Current protocol version.
   */

  exports.protocol = 3;
  /**
   * Packet types.
   */

  var packets = exports.packets = {
    open: 0 // non-ws
    ,
    close: 1 // non-ws
    ,
    ping: 2,
    pong: 3,
    message: 4,
    upgrade: 5,
    noop: 6
  };
  var packetslist = keys$1(packets);
  /**
   * Premade error packet.
   */

  var err = {
    type: 'error',
    data: 'parser error'
  };
  /**
   * Create a blob api even for blob builder when vendor prefixes exist
   */

  /**
   * Encodes a packet.
   *
   *     <packet type id> [ <data> ]
   *
   * Example:
   *
   *     5hello world
   *     3
   *     4
   *
   * Binary is encoded in an identical principle
   *
   * @api private
   */

  exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
    if (typeof supportsBinary === 'function') {
      callback = supportsBinary;
      supportsBinary = false;
    }

    if (typeof utf8encode === 'function') {
      callback = utf8encode;
      utf8encode = null;
    }

    var data = packet.data === undefined ? undefined : packet.data.buffer || packet.data;

    if (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer) {
      return encodeArrayBuffer(packet, supportsBinary, callback);
    } else if (typeof blob !== 'undefined' && data instanceof blob) {
      return encodeBlob(packet, supportsBinary, callback);
    } // might be an object with { base64: true, data: dataAsBase64String }


    if (data && data.base64) {
      return encodeBase64Object(packet, callback);
    } // Sending data as a utf-8 string


    var encoded = packets[packet.type]; // data fragment is optional

    if (undefined !== packet.data) {
      encoded += utf8encode ? utf8.encode(String(packet.data), {
        strict: false
      }) : String(packet.data);
    }

    return callback('' + encoded);
  };

  function encodeBase64Object(packet, callback) {
    // packet data is an object { base64: true, data: dataAsBase64String }
    var message = 'b' + exports.packets[packet.type] + packet.data.data;
    return callback(message);
  }
  /**
   * Encode packet helpers for binary types
   */


  function encodeArrayBuffer(packet, supportsBinary, callback) {
    if (!supportsBinary) {
      return exports.encodeBase64Packet(packet, callback);
    }

    var data = packet.data;
    var contentArray = new Uint8Array(data);
    var resultBuffer = new Uint8Array(1 + data.byteLength);
    resultBuffer[0] = packets[packet.type];

    for (var i = 0; i < contentArray.length; i++) {
      resultBuffer[i + 1] = contentArray[i];
    }

    return callback(resultBuffer.buffer);
  }

  function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
    if (!supportsBinary) {
      return exports.encodeBase64Packet(packet, callback);
    }

    var fr = new FileReader();

    fr.onload = function () {
      exports.encodePacket({
        type: packet.type,
        data: fr.result
      }, supportsBinary, true, callback);
    };

    return fr.readAsArrayBuffer(packet.data);
  }

  function encodeBlob(packet, supportsBinary, callback) {
    if (!supportsBinary) {
      return exports.encodeBase64Packet(packet, callback);
    }

    if (dontSendBlobs) {
      return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
    }

    var length = new Uint8Array(1);
    length[0] = packets[packet.type];
    var blob$1 = new blob([length.buffer, packet.data]);
    return callback(blob$1);
  }
  /**
   * Encodes a packet with binary data in a base64 string
   *
   * @param {Object} packet, has `type` and `data`
   * @return {String} base64 encoded message
   */


  exports.encodeBase64Packet = function (packet, callback) {
    var message = 'b' + exports.packets[packet.type];

    if (typeof blob !== 'undefined' && packet.data instanceof blob) {
      var fr = new FileReader();

      fr.onload = function () {
        var b64 = fr.result.split(',')[1];
        callback(message + b64);
      };

      return fr.readAsDataURL(packet.data);
    }

    var b64data;

    try {
      b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
    } catch (e) {
      // iPhone Safari doesn't let you apply with typed arrays
      var typed = new Uint8Array(packet.data);
      var basic = new Array(typed.length);

      for (var i = 0; i < typed.length; i++) {
        basic[i] = typed[i];
      }

      b64data = String.fromCharCode.apply(null, basic);
    }

    message += btoa(b64data);
    return callback(message);
  };
  /**
   * Decodes a packet. Changes format to Blob if requested.
   *
   * @return {Object} with `type` and `data` (if any)
   * @api private
   */


  exports.decodePacket = function (data, binaryType, utf8decode) {
    if (data === undefined) {
      return err;
    } // String data


    if (typeof data === 'string') {
      if (data.charAt(0) === 'b') {
        return exports.decodeBase64Packet(data.substr(1), binaryType);
      }

      if (utf8decode) {
        data = tryDecode(data);

        if (data === false) {
          return err;
        }
      }

      var type = data.charAt(0);

      if (Number(type) != type || !packetslist[type]) {
        return err;
      }

      if (data.length > 1) {
        return {
          type: packetslist[type],
          data: data.substring(1)
        };
      } else {
        return {
          type: packetslist[type]
        };
      }
    }

    var asArray = new Uint8Array(data);
    var type = asArray[0];
    var rest = arraybuffer_slice(data, 1);

    if (blob && binaryType === 'blob') {
      rest = new blob([rest]);
    }

    return {
      type: packetslist[type],
      data: rest
    };
  };

  function tryDecode(data) {
    try {
      data = utf8.decode(data, {
        strict: false
      });
    } catch (e) {
      return false;
    }

    return data;
  }
  /**
   * Decodes a packet encoded in a base64 string
   *
   * @param {String} base64 encoded message
   * @return {Object} with `type` and `data` (if any)
   */


  exports.decodeBase64Packet = function (msg, binaryType) {
    var type = packetslist[msg.charAt(0)];

    if (!base64encoder) {
      return {
        type: type,
        data: {
          base64: true,
          data: msg.substr(1)
        }
      };
    }

    var data = base64encoder.decode(msg.substr(1));

    if (binaryType === 'blob' && blob) {
      data = new blob([data]);
    }

    return {
      type: type,
      data: data
    };
  };
  /**
   * Encodes multiple messages (payload).
   *
   *     <length>:data
   *
   * Example:
   *
   *     11:hello world2:hi
   *
   * If any contents are binary, they will be encoded as base64 strings. Base64
   * encoded strings are marked with a b before the length specifier
   *
   * @param {Array} packets
   * @api private
   */


  exports.encodePayload = function (packets, supportsBinary, callback) {
    if (typeof supportsBinary === 'function') {
      callback = supportsBinary;
      supportsBinary = null;
    }

    var isBinary = hasBinary2(packets);

    if (supportsBinary && isBinary) {
      if (blob && !dontSendBlobs) {
        return exports.encodePayloadAsBlob(packets, callback);
      }

      return exports.encodePayloadAsArrayBuffer(packets, callback);
    }

    if (!packets.length) {
      return callback('0:');
    }

    function setLengthHeader(message) {
      return message.length + ':' + message;
    }

    function encodeOne(packet, doneCallback) {
      exports.encodePacket(packet, !isBinary ? false : supportsBinary, false, function (message) {
        doneCallback(null, setLengthHeader(message));
      });
    }

    map(packets, encodeOne, function (err, results) {
      return callback(results.join(''));
    });
  };
  /**
   * Async array map using after
   */


  function map(ary, each, done) {
    var result = new Array(ary.length);
    var next = after_1(ary.length, done);

    var eachWithIndex = function (i, el, cb) {
      each(el, function (error, msg) {
        result[i] = msg;
        cb(error, result);
      });
    };

    for (var i = 0; i < ary.length; i++) {
      eachWithIndex(i, ary[i], next);
    }
  }
  /*
   * Decodes data when a payload is maybe expected. Possible binary contents are
   * decoded from their base64 representation
   *
   * @param {String} data, callback method
   * @api public
   */


  exports.decodePayload = function (data, binaryType, callback) {
    if (typeof data !== 'string') {
      return exports.decodePayloadAsBinary(data, binaryType, callback);
    }

    if (typeof binaryType === 'function') {
      callback = binaryType;
      binaryType = null;
    }

    var packet;

    if (data === '') {
      // parser error - ignoring payload
      return callback(err, 0, 1);
    }

    var length = '',
        n,
        msg;

    for (var i = 0, l = data.length; i < l; i++) {
      var chr = data.charAt(i);

      if (chr !== ':') {
        length += chr;
        continue;
      }

      if (length === '' || length != (n = Number(length))) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      msg = data.substr(i + 1, n);

      if (length != msg.length) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      if (msg.length) {
        packet = exports.decodePacket(msg, binaryType, false);

        if (err.type === packet.type && err.data === packet.data) {
          // parser error in individual packet - ignoring payload
          return callback(err, 0, 1);
        }

        var ret = callback(packet, i + n, l);
        if (false === ret) return;
      } // advance cursor


      i += n;
      length = '';
    }

    if (length !== '') {
      // parser error - ignoring payload
      return callback(err, 0, 1);
    }
  };
  /**
   * Encodes multiple messages (payload) as binary.
   *
   * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
   * 255><data>
   *
   * Example:
   * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
   *
   * @param {Array} packets
   * @return {ArrayBuffer} encoded payload
   * @api private
   */


  exports.encodePayloadAsArrayBuffer = function (packets, callback) {
    if (!packets.length) {
      return callback(new ArrayBuffer(0));
    }

    function encodeOne(packet, doneCallback) {
      exports.encodePacket(packet, true, true, function (data) {
        return doneCallback(null, data);
      });
    }

    map(packets, encodeOne, function (err, encodedPackets) {
      var totalLength = encodedPackets.reduce(function (acc, p) {
        var len;

        if (typeof p === 'string') {
          len = p.length;
        } else {
          len = p.byteLength;
        }

        return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
      }, 0);
      var resultArray = new Uint8Array(totalLength);
      var bufferIndex = 0;
      encodedPackets.forEach(function (p) {
        var isString = typeof p === 'string';
        var ab = p;

        if (isString) {
          var view = new Uint8Array(p.length);

          for (var i = 0; i < p.length; i++) {
            view[i] = p.charCodeAt(i);
          }

          ab = view.buffer;
        }

        if (isString) {
          // not true binary
          resultArray[bufferIndex++] = 0;
        } else {
          // true binary
          resultArray[bufferIndex++] = 1;
        }

        var lenStr = ab.byteLength.toString();

        for (var i = 0; i < lenStr.length; i++) {
          resultArray[bufferIndex++] = parseInt(lenStr[i]);
        }

        resultArray[bufferIndex++] = 255;
        var view = new Uint8Array(ab);

        for (var i = 0; i < view.length; i++) {
          resultArray[bufferIndex++] = view[i];
        }
      });
      return callback(resultArray.buffer);
    });
  };
  /**
   * Encode as Blob
   */


  exports.encodePayloadAsBlob = function (packets, callback) {
    function encodeOne(packet, doneCallback) {
      exports.encodePacket(packet, true, true, function (encoded) {
        var binaryIdentifier = new Uint8Array(1);
        binaryIdentifier[0] = 1;

        if (typeof encoded === 'string') {
          var view = new Uint8Array(encoded.length);

          for (var i = 0; i < encoded.length; i++) {
            view[i] = encoded.charCodeAt(i);
          }

          encoded = view.buffer;
          binaryIdentifier[0] = 0;
        }

        var len = encoded instanceof ArrayBuffer ? encoded.byteLength : encoded.size;
        var lenStr = len.toString();
        var lengthAry = new Uint8Array(lenStr.length + 1);

        for (var i = 0; i < lenStr.length; i++) {
          lengthAry[i] = parseInt(lenStr[i]);
        }

        lengthAry[lenStr.length] = 255;

        if (blob) {
          var blob$1 = new blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
          doneCallback(null, blob$1);
        }
      });
    }

    map(packets, encodeOne, function (err, results) {
      return callback(new blob(results));
    });
  };
  /*
   * Decodes data when a payload is maybe expected. Strings are decoded by
   * interpreting each byte as a key code for entries marked to start with 0. See
   * description of encodePayloadAsBinary
   *
   * @param {ArrayBuffer} data, callback method
   * @api public
   */


  exports.decodePayloadAsBinary = function (data, binaryType, callback) {
    if (typeof binaryType === 'function') {
      callback = binaryType;
      binaryType = null;
    }

    var bufferTail = data;
    var buffers = [];

    while (bufferTail.byteLength > 0) {
      var tailArray = new Uint8Array(bufferTail);
      var isString = tailArray[0] === 0;
      var msgLength = '';

      for (var i = 1;; i++) {
        if (tailArray[i] === 255) break; // 310 = char length of Number.MAX_VALUE

        if (msgLength.length > 310) {
          return callback(err, 0, 1);
        }

        msgLength += tailArray[i];
      }

      bufferTail = arraybuffer_slice(bufferTail, 2 + msgLength.length);
      msgLength = parseInt(msgLength);
      var msg = arraybuffer_slice(bufferTail, 0, msgLength);

      if (isString) {
        try {
          msg = String.fromCharCode.apply(null, new Uint8Array(msg));
        } catch (e) {
          // iPhone Safari doesn't let you apply to typed arrays
          var typed = new Uint8Array(msg);
          msg = '';

          for (var i = 0; i < typed.length; i++) {
            msg += String.fromCharCode(typed[i]);
          }
        }
      }

      buffers.push(msg);
      bufferTail = arraybuffer_slice(bufferTail, msgLength);
    }

    var total = buffers.length;
    buffers.forEach(function (buffer, i) {
      callback(exports.decodePacket(buffer, binaryType, true), i, total);
    });
  };
});

var componentEmitter$1 = createCommonjsModule(function (module) {
  /**
   * Expose `Emitter`.
   */
  {
    module.exports = Emitter;
  }
  /**
   * Initialize a new `Emitter`.
   *
   * @api public
   */


  function Emitter(obj) {
    if (obj) return mixin(obj);
  }
  /**
   * Mixin the emitter properties.
   *
   * @param {Object} obj
   * @return {Object}
   * @api private
   */

  function mixin(obj) {
    for (var key in Emitter.prototype) {
      obj[key] = Emitter.prototype[key];
    }

    return obj;
  }
  /**
   * Listen on the given `event` with `fn`.
   *
   * @param {String} event
   * @param {Function} fn
   * @return {Emitter}
   * @api public
   */


  Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
    this._callbacks = this._callbacks || {};
    (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
    return this;
  };
  /**
   * Adds an `event` listener that will be invoked a single
   * time then automatically removed.
   *
   * @param {String} event
   * @param {Function} fn
   * @return {Emitter}
   * @api public
   */


  Emitter.prototype.once = function (event, fn) {
    function on() {
      this.off(event, on);
      fn.apply(this, arguments);
    }

    on.fn = fn;
    this.on(event, on);
    return this;
  };
  /**
   * Remove the given callback for `event` or all
   * registered callbacks.
   *
   * @param {String} event
   * @param {Function} fn
   * @return {Emitter}
   * @api public
   */


  Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
    this._callbacks = this._callbacks || {}; // all

    if (0 == arguments.length) {
      this._callbacks = {};
      return this;
    } // specific event


    var callbacks = this._callbacks['$' + event];
    if (!callbacks) return this; // remove all handlers

    if (1 == arguments.length) {
      delete this._callbacks['$' + event];
      return this;
    } // remove specific handler


    var cb;

    for (var i = 0; i < callbacks.length; i++) {
      cb = callbacks[i];

      if (cb === fn || cb.fn === fn) {
        callbacks.splice(i, 1);
        break;
      }
    } // Remove event specific arrays for event types that no
    // one is subscribed for to avoid memory leak.


    if (callbacks.length === 0) {
      delete this._callbacks['$' + event];
    }

    return this;
  };
  /**
   * Emit `event` with the given args.
   *
   * @param {String} event
   * @param {Mixed} ...
   * @return {Emitter}
   */


  Emitter.prototype.emit = function (event) {
    this._callbacks = this._callbacks || {};
    var args = new Array(arguments.length - 1),
        callbacks = this._callbacks['$' + event];

    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }

    if (callbacks) {
      callbacks = callbacks.slice(0);

      for (var i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(this, args);
      }
    }

    return this;
  };
  /**
   * Return array of callbacks for `event`.
   *
   * @param {String} event
   * @return {Array}
   * @api public
   */


  Emitter.prototype.listeners = function (event) {
    this._callbacks = this._callbacks || {};
    return this._callbacks['$' + event] || [];
  };
  /**
   * Check if this emitter has `event` handlers.
   *
   * @param {String} event
   * @return {Boolean}
   * @api public
   */


  Emitter.prototype.hasListeners = function (event) {
    return !!this.listeners(event).length;
  };
});

/**
 * Module dependencies.
 */

/**
 * Module exports.
 */

var transport = Transport;
/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport(opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
  this.socket = opts.socket;
  this.enablesXDR = opts.enablesXDR;
  this.withCredentials = opts.withCredentials; // SSL options for Node.js client

  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;
  this.forceNode = opts.forceNode; // results of ReactNative environment detection

  this.isReactNative = opts.isReactNative; // other options for Node.js client

  this.extraHeaders = opts.extraHeaders;
  this.localAddress = opts.localAddress;
}
/**
 * Mix in `Emitter`.
 */


componentEmitter$1(Transport.prototype);
/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};
/**
 * Opens the transport.
 *
 * @api public
 */


Transport.prototype.open = function () {
  if ('closed' === this.readyState || '' === this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};
/**
 * Closes the transport.
 *
 * @api private
 */


Transport.prototype.close = function () {
  if ('opening' === this.readyState || 'open' === this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};
/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */


Transport.prototype.send = function (packets) {
  if ('open' === this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};
/**
 * Called upon open
 *
 * @api private
 */


Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};
/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */


Transport.prototype.onData = function (data) {
  var packet = browser$4.decodePacket(data, this.socket.binaryType);
  this.onPacket(packet);
};
/**
 * Called with a decoded packet.
 */


Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};
/**
 * Called upon close.
 *
 * @api private
 */


Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};

/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */
var encode = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};
/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */


var decode = function (qs) {
  var qry = {};
  var pairs = qs.split('&');

  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }

  return qry;
};

var parseqs = {
  encode: encode,
  decode: decode
};

var componentInherit = function (a, b) {
  var fn = function () {};

  fn.prototype = b.prototype;
  a.prototype = new fn();
  a.prototype.constructor = a;
};

var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(''),
    length$1 = 64,
    map = {},
    seed = 0,
    i = 0,
    prev;
/**
 * Return a string representing the specified number.
 *
 * @param {Number} num The number to convert.
 * @returns {String} The string representation of the number.
 * @api public
 */

function encode$1(num) {
  var encoded = '';

  do {
    encoded = alphabet[num % length$1] + encoded;
    num = Math.floor(num / length$1);
  } while (num > 0);

  return encoded;
}
/**
 * Return the integer value specified by the given string.
 *
 * @param {String} str The string to convert.
 * @returns {Number} The integer value represented by the string.
 * @api public
 */


function decode$1(str) {
  var decoded = 0;

  for (i = 0; i < str.length; i++) {
    decoded = decoded * length$1 + map[str.charAt(i)];
  }

  return decoded;
}
/**
 * Yeast: A tiny growing id generator.
 *
 * @returns {String} A unique id.
 * @api public
 */


function yeast() {
  var now = encode$1(+new Date());
  if (now !== prev) return seed = 0, prev = now;
  return now + '.' + encode$1(seed++);
} //
// Map each character to its index.
//


for (; i < length$1; i++) map[alphabet[i]] = i; //
// Expose the `yeast`, `encode` and `decode` functions.
//


yeast.encode = encode$1;
yeast.decode = decode$1;
var yeast_1 = yeast;

/**
 * Module dependencies.
 */

var debug$2 = browser$2('engine.io-client:polling');
/**
 * Module exports.
 */

var polling = Polling;
/**
 * Is XHR2 supported?
 */

var hasXHR2 = function () {
  var XMLHttpRequest = xmlhttprequest;
  var xhr = new XMLHttpRequest({
    xdomain: false
  });
  return null != xhr.responseType;
}();
/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */


function Polling(opts) {
  var forceBase64 = opts && opts.forceBase64;

  if (!hasXHR2 || forceBase64) {
    this.supportsBinary = false;
  }

  transport.call(this, opts);
}
/**
 * Inherits from Transport.
 */


componentInherit(Polling, transport);
/**
 * Transport name.
 */

Polling.prototype.name = 'polling';
/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function () {
  this.poll();
};
/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */


Polling.prototype.pause = function (onPause) {
  var self = this;
  this.readyState = 'pausing';

  function pause() {
    debug$2('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug$2('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function () {
        debug$2('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug$2('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function () {
        debug$2('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};
/**
 * Starts polling cycle.
 *
 * @api public
 */


Polling.prototype.poll = function () {
  debug$2('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};
/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */


Polling.prototype.onData = function (data) {
  var self = this;
  debug$2('polling got data %s', data);

  var callback = function (packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' === self.readyState) {
      self.onOpen();
    } // if its a close packet, we close the ongoing requests


    if ('close' === packet.type) {
      self.onClose();
      return false;
    } // otherwise bypass onData and handle the message


    self.onPacket(packet);
  }; // decode payload


  browser$4.decodePayload(data, this.socket.binaryType, callback); // if an event did not trigger closing

  if ('closed' !== this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' === this.readyState) {
      this.poll();
    } else {
      debug$2('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};
/**
 * For polling, send a close packet.
 *
 * @api private
 */


Polling.prototype.doClose = function () {
  var self = this;

  function close() {
    debug$2('writing close packet');
    self.write([{
      type: 'close'
    }]);
  }

  if ('open' === this.readyState) {
    debug$2('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug$2('transport not open - deferring close');
    this.once('open', close);
  }
};
/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */


Polling.prototype.write = function (packets) {
  var self = this;
  this.writable = false;

  var callbackfn = function () {
    self.writable = true;
    self.emit('drain');
  };

  browser$4.encodePayload(packets, this.supportsBinary, function (data) {
    self.doWrite(data, callbackfn);
  });
};
/**
 * Generates uri for connection.
 *
 * @api private
 */


Polling.prototype.uri = function () {
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = ''; // cache busting is forced

  if (false !== this.timestampRequests) {
    query[this.timestampParam] = yeast_1();
  }

  if (!this.supportsBinary && !query.sid) {
    query.b64 = 1;
  }

  query = parseqs.encode(query); // avoid port if default for schema

  if (this.port && ('https' === schema && Number(this.port) !== 443 || 'http' === schema && Number(this.port) !== 80)) {
    port = ':' + this.port;
  } // prepend ? to query


  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

/* global attachEvent */

/**
 * Module requirements.
 */

var debug$3 = browser$2('engine.io-client:polling-xhr');
/**
 * Module exports.
 */

var pollingXhr = XHR;
var Request_1 = Request;
/**
 * Empty function
 */

function empty() {}
/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */


function XHR(opts) {
  polling.call(this, opts);
  this.requestTimeout = opts.requestTimeout;
  this.extraHeaders = opts.extraHeaders;

  if (typeof location !== 'undefined') {
    var isSSL = 'https:' === location.protocol;
    var port = location.port; // some user agents have empty `location.port`

    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = typeof location !== 'undefined' && opts.hostname !== location.hostname || port !== opts.port;
    this.xs = opts.secure !== isSSL;
  }
}
/**
 * Inherits from Polling.
 */


componentInherit(XHR, polling);
/**
 * XHR supports binary
 */

XHR.prototype.supportsBinary = true;
/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function (opts) {
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.xs = this.xs;
  opts.agent = this.agent || false;
  opts.supportsBinary = this.supportsBinary;
  opts.enablesXDR = this.enablesXDR;
  opts.withCredentials = this.withCredentials; // SSL options for Node.js client

  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  opts.requestTimeout = this.requestTimeout; // other options for Node.js client

  opts.extraHeaders = this.extraHeaders;
  return new Request(opts);
};
/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */


XHR.prototype.doWrite = function (data, fn) {
  var isBinary = typeof data !== 'string' && data !== undefined;
  var req = this.request({
    method: 'POST',
    data: data,
    isBinary: isBinary
  });
  var self = this;
  req.on('success', fn);
  req.on('error', function (err) {
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};
/**
 * Starts a poll cycle.
 *
 * @api private
 */


XHR.prototype.doPoll = function () {
  debug$3('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function (data) {
    self.onData(data);
  });
  req.on('error', function (err) {
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};
/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */


function Request(opts) {
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.xs = !!opts.xs;
  this.async = false !== opts.async;
  this.data = undefined !== opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.isBinary = opts.isBinary;
  this.supportsBinary = opts.supportsBinary;
  this.enablesXDR = opts.enablesXDR;
  this.withCredentials = opts.withCredentials;
  this.requestTimeout = opts.requestTimeout; // SSL options for Node.js client

  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized; // other options for Node.js client

  this.extraHeaders = opts.extraHeaders;
  this.create();
}
/**
 * Mix in `Emitter`.
 */


componentEmitter$1(Request.prototype);
/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function () {
  var opts = {
    agent: this.agent,
    xdomain: this.xd,
    xscheme: this.xs,
    enablesXDR: this.enablesXDR
  }; // SSL options for Node.js client

  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  var xhr = this.xhr = new xmlhttprequest(opts);
  var self = this;

  try {
    debug$3('xhr open %s: %s', this.method, this.uri);
    xhr.open(this.method, this.uri, this.async);

    try {
      if (this.extraHeaders) {
        xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);

        for (var i in this.extraHeaders) {
          if (this.extraHeaders.hasOwnProperty(i)) {
            xhr.setRequestHeader(i, this.extraHeaders[i]);
          }
        }
      }
    } catch (e) {}

    if ('POST' === this.method) {
      try {
        if (this.isBinary) {
          xhr.setRequestHeader('Content-type', 'application/octet-stream');
        } else {
          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        }
      } catch (e) {}
    }

    try {
      xhr.setRequestHeader('Accept', '*/*');
    } catch (e) {} // ie6 check


    if ('withCredentials' in xhr) {
      xhr.withCredentials = this.withCredentials;
    }

    if (this.requestTimeout) {
      xhr.timeout = this.requestTimeout;
    }

    if (this.hasXDR()) {
      xhr.onload = function () {
        self.onLoad();
      };

      xhr.onerror = function () {
        self.onError(xhr.responseText);
      };
    } else {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 2) {
          try {
            var contentType = xhr.getResponseHeader('Content-Type');

            if (self.supportsBinary && contentType === 'application/octet-stream' || contentType === 'application/octet-stream; charset=UTF-8') {
              xhr.responseType = 'arraybuffer';
            }
          } catch (e) {}
        }

        if (4 !== xhr.readyState) return;

        if (200 === xhr.status || 1223 === xhr.status) {
          self.onLoad();
        } else {
          // make sure the `error` event handler that's user-set
          // does not throw in the same tick and gets caught here
          setTimeout(function () {
            self.onError(typeof xhr.status === 'number' ? xhr.status : 0);
          }, 0);
        }
      };
    }

    debug$3('xhr data %s', this.data);
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly fhrom the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function () {
      self.onError(e);
    }, 0);
    return;
  }

  if (typeof document !== 'undefined') {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};
/**
 * Called upon successful response.
 *
 * @api private
 */


Request.prototype.onSuccess = function () {
  this.emit('success');
  this.cleanup();
};
/**
 * Called if we have data.
 *
 * @api private
 */


Request.prototype.onData = function (data) {
  this.emit('data', data);
  this.onSuccess();
};
/**
 * Called upon error.
 *
 * @api private
 */


Request.prototype.onError = function (err) {
  this.emit('error', err);
  this.cleanup(true);
};
/**
 * Cleans up house.
 *
 * @api private
 */


Request.prototype.cleanup = function (fromError) {
  if ('undefined' === typeof this.xhr || null === this.xhr) {
    return;
  } // xmlhttprequest


  if (this.hasXDR()) {
    this.xhr.onload = this.xhr.onerror = empty;
  } else {
    this.xhr.onreadystatechange = empty;
  }

  if (fromError) {
    try {
      this.xhr.abort();
    } catch (e) {}
  }

  if (typeof document !== 'undefined') {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};
/**
 * Called upon load.
 *
 * @api private
 */


Request.prototype.onLoad = function () {
  var data;

  try {
    var contentType;

    try {
      contentType = this.xhr.getResponseHeader('Content-Type');
    } catch (e) {}

    if (contentType === 'application/octet-stream' || contentType === 'application/octet-stream; charset=UTF-8') {
      data = this.xhr.response || this.xhr.responseText;
    } else {
      data = this.xhr.responseText;
    }
  } catch (e) {
    this.onError(e);
  }

  if (null != data) {
    this.onData(data);
  }
};
/**
 * Check if it has XDomainRequest.
 *
 * @api private
 */


Request.prototype.hasXDR = function () {
  return typeof XDomainRequest !== 'undefined' && !this.xs && this.enablesXDR;
};
/**
 * Aborts the request.
 *
 * @api public
 */


Request.prototype.abort = function () {
  this.cleanup();
};
/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */


Request.requestsCount = 0;
Request.requests = {};

if (typeof document !== 'undefined') {
  if (typeof attachEvent === 'function') {
    attachEvent('onunload', unloadHandler);
  } else if (typeof addEventListener === 'function') {
    var terminationEvent = 'onpagehide' in globalThis_browser ? 'pagehide' : 'unload';
    addEventListener(terminationEvent, unloadHandler, false);
  }
}

function unloadHandler() {
  for (var i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}
pollingXhr.Request = Request_1;

/**
 * Module requirements.
 */

/**
 * Module exports.
 */

var pollingJsonp = JSONPPolling;
/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;
var rEscapedNewline = /\\n/g;
/**
 * Global JSONP callbacks.
 */

var callbacks;
/**
 * Noop.
 */

function empty$1() {}
/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */


function JSONPPolling(opts) {
  polling.call(this, opts);
  this.query = this.query || {}; // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution

  if (!callbacks) {
    // we need to consider multiple engines in the same page
    callbacks = globalThis_browser.___eio = globalThis_browser.___eio || [];
  } // callback identifier


  this.index = callbacks.length; // add callback to jsonp global

  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  }); // append to query string

  this.query.j = this.index; // prevent spurious errors from being emitted when the window is unloaded

  if (typeof addEventListener === 'function') {
    addEventListener('beforeunload', function () {
      if (self.script) self.script.onerror = empty$1;
    }, false);
  }
}
/**
 * Inherits from Polling.
 */


componentInherit(JSONPPolling, polling);
/*
 * JSONP only supports binary as base64 encoded strings
 */

JSONPPolling.prototype.supportsBinary = false;
/**
 * Closes the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
    this.iframe = null;
  }

  polling.prototype.doClose.call(this);
};
/**
 * Starts a poll cycle.
 *
 * @api private
 */


JSONPPolling.prototype.doPoll = function () {
  var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();

  script.onerror = function (e) {
    self.onError('jsonp poll error', e);
  };

  var insertAt = document.getElementsByTagName('script')[0];

  if (insertAt) {
    insertAt.parentNode.insertBefore(script, insertAt);
  } else {
    (document.head || document.body).appendChild(script);
  }

  this.script = script;
  var isUAgecko = 'undefined' !== typeof navigator && /gecko/i.test(navigator.userAgent);

  if (isUAgecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};
/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */


JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;
    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);
    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete() {
    initIframe();
    fn();
  }

  function initIframe() {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;
    self.form.appendChild(iframe);
    self.iframe = iframe;
  }

  initIframe(); // escape \n to prevent it from being converted into \r\n by some UAs
  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side

  data = data.replace(rEscapedNewline, '\\\n');
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch (e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function () {
      if (self.iframe.readyState === 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};

var _nodeResolve_empty = {};

var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': _nodeResolve_empty
});

var require$$1 = getCjsExportFromNamespace(_nodeResolve_empty$1);

/**
 * Module dependencies.
 */

var debug$4 = browser$2('engine.io-client:websocket');
var BrowserWebSocket, NodeWebSocket;

if (typeof WebSocket !== 'undefined') {
  BrowserWebSocket = WebSocket;
} else if (typeof self !== 'undefined') {
  BrowserWebSocket = self.WebSocket || self.MozWebSocket;
}

if (typeof window === 'undefined') {
  try {
    NodeWebSocket = require$$1;
  } catch (e) {}
}
/**
 * Get either the `WebSocket` or `MozWebSocket` globals
 * in the browser or try to resolve WebSocket-compatible
 * interface exposed by `ws` for Node-like environment.
 */


var WebSocketImpl = BrowserWebSocket || NodeWebSocket;
/**
 * Module exports.
 */

var websocket = WS;
/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS(opts) {
  var forceBase64 = opts && opts.forceBase64;

  if (forceBase64) {
    this.supportsBinary = false;
  }

  this.perMessageDeflate = opts.perMessageDeflate;
  this.usingBrowserWebSocket = BrowserWebSocket && !opts.forceNode;
  this.protocols = opts.protocols;

  if (!this.usingBrowserWebSocket) {
    WebSocketImpl = NodeWebSocket;
  }

  transport.call(this, opts);
}
/**
 * Inherits from Transport.
 */


componentInherit(WS, transport);
/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';
/*
 * WebSockets support binary
 */

WS.prototype.supportsBinary = true;
/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function () {
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var uri = this.uri();
  var protocols = this.protocols;
  var opts = {};

  if (!this.isReactNative) {
    opts.agent = this.agent;
    opts.perMessageDeflate = this.perMessageDeflate; // SSL options for Node.js client

    opts.pfx = this.pfx;
    opts.key = this.key;
    opts.passphrase = this.passphrase;
    opts.cert = this.cert;
    opts.ca = this.ca;
    opts.ciphers = this.ciphers;
    opts.rejectUnauthorized = this.rejectUnauthorized;
  }

  if (this.extraHeaders) {
    opts.headers = this.extraHeaders;
  }

  if (this.localAddress) {
    opts.localAddress = this.localAddress;
  }

  try {
    this.ws = this.usingBrowserWebSocket && !this.isReactNative ? protocols ? new WebSocketImpl(uri, protocols) : new WebSocketImpl(uri) : new WebSocketImpl(uri, protocols, opts);
  } catch (err) {
    return this.emit('error', err);
  }

  if (this.ws.binaryType === undefined) {
    this.supportsBinary = false;
  }

  if (this.ws.supports && this.ws.supports.binary) {
    this.supportsBinary = true;
    this.ws.binaryType = 'nodebuffer';
  } else {
    this.ws.binaryType = 'arraybuffer';
  }

  this.addEventListeners();
};
/**
 * Adds event listeners to the socket
 *
 * @api private
 */


WS.prototype.addEventListeners = function () {
  var self = this;

  this.ws.onopen = function () {
    self.onOpen();
  };

  this.ws.onclose = function () {
    self.onClose();
  };

  this.ws.onmessage = function (ev) {
    self.onData(ev.data);
  };

  this.ws.onerror = function (e) {
    self.onError('websocket error', e);
  };
};
/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */


WS.prototype.write = function (packets) {
  var self = this;
  this.writable = false; // encodePacket efficient as it uses WS framing
  // no need for encodePayload

  var total = packets.length;

  for (var i = 0, l = total; i < l; i++) {
    (function (packet) {
      browser$4.encodePacket(packet, self.supportsBinary, function (data) {
        if (!self.usingBrowserWebSocket) {
          // always create a new object (GH-437)
          var opts = {};

          if (packet.options) {
            opts.compress = packet.options.compress;
          }

          if (self.perMessageDeflate) {
            var len = 'string' === typeof data ? Buffer.byteLength(data) : data.length;

            if (len < self.perMessageDeflate.threshold) {
              opts.compress = false;
            }
          }
        } // Sometimes the websocket has already been closed but the browser didn't
        // have a chance of informing us about it yet, in that case send will
        // throw an error


        try {
          if (self.usingBrowserWebSocket) {
            // TypeError is thrown when passing the second argument on Safari
            self.ws.send(data);
          } else {
            self.ws.send(data, opts);
          }
        } catch (e) {
          debug$4('websocket closed before onclose event');
        }

        --total || done();
      });
    })(packets[i]);
  }

  function done() {
    self.emit('flush'); // fake drain
    // defer to next tick to allow Socket to clear writeBuffer

    setTimeout(function () {
      self.writable = true;
      self.emit('drain');
    }, 0);
  }
};
/**
 * Called upon close
 *
 * @api private
 */


WS.prototype.onClose = function () {
  transport.prototype.onClose.call(this);
};
/**
 * Closes socket.
 *
 * @api private
 */


WS.prototype.doClose = function () {
  if (typeof this.ws !== 'undefined') {
    this.ws.close();
  }
};
/**
 * Generates uri for connection.
 *
 * @api private
 */


WS.prototype.uri = function () {
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = ''; // avoid port if default for schema

  if (this.port && ('wss' === schema && Number(this.port) !== 443 || 'ws' === schema && Number(this.port) !== 80)) {
    port = ':' + this.port;
  } // append timestamp to URI


  if (this.timestampRequests) {
    query[this.timestampParam] = yeast_1();
  } // communicate binary support capabilities


  if (!this.supportsBinary) {
    query.b64 = 1;
  }

  query = parseqs.encode(query); // prepend ? to query

  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};
/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */


WS.prototype.check = function () {
  return !!WebSocketImpl && !('__initialize' in WebSocketImpl && this.name === WS.prototype.name);
};

/**
 * Module dependencies
 */

/**
 * Export transports.
 */

var polling_1 = polling$1;
var websocket_1 = websocket;
/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling$1(opts) {
  var xhr;
  var xd = false;
  var xs = false;
  var jsonp = false !== opts.jsonp;

  if (typeof location !== 'undefined') {
    var isSSL = 'https:' === location.protocol;
    var port = location.port; // some user agents have empty `location.port`

    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname !== location.hostname || port !== opts.port;
    xs = opts.secure !== isSSL;
  }

  opts.xdomain = xd;
  opts.xscheme = xs;
  xhr = new xmlhttprequest(opts);

  if ('open' in xhr && !opts.forceJSONP) {
    return new pollingXhr(opts);
  } else {
    if (!jsonp) throw new Error('JSONP disabled');
    return new pollingJsonp(opts);
  }
}

var transports = {
  polling: polling_1,
  websocket: websocket_1
};

var indexOf = [].indexOf;

var indexof = function (arr, obj) {
  if (indexOf) return arr.indexOf(obj);

  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }

  return -1;
};

/**
 * Module dependencies.
 */

var debug$5 = browser$2('engine.io-client:socket');
/**
 * Module exports.
 */

var socket = Socket;
/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket(uri, opts) {
  if (!(this instanceof Socket)) return new Socket(uri, opts);
  opts = opts || {};

  if (uri && 'object' === typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = parseuri(uri);
    opts.hostname = uri.host;
    opts.secure = uri.protocol === 'https' || uri.protocol === 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  } else if (opts.host) {
    opts.hostname = parseuri(opts.host).host;
  }

  this.secure = null != opts.secure ? opts.secure : typeof location !== 'undefined' && 'https:' === location.protocol;

  if (opts.hostname && !opts.port) {
    // if no port is specified manually, use the protocol default
    opts.port = this.secure ? '443' : '80';
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname || (typeof location !== 'undefined' ? location.hostname : 'localhost');
  this.port = opts.port || (typeof location !== 'undefined' && location.port ? location.port : this.secure ? 443 : 80);
  this.query = opts.query || {};
  if ('string' === typeof this.query) this.query = parseqs.decode(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.jsonp = false !== opts.jsonp;
  this.forceBase64 = !!opts.forceBase64;
  this.enablesXDR = !!opts.enablesXDR;
  this.withCredentials = false !== opts.withCredentials;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = opts.timestampRequests;
  this.transports = opts.transports || ['polling', 'websocket'];
  this.transportOptions = opts.transportOptions || {};
  this.readyState = '';
  this.writeBuffer = [];
  this.prevBufferLen = 0;
  this.policyPort = opts.policyPort || 843;
  this.rememberUpgrade = opts.rememberUpgrade || false;
  this.binaryType = null;
  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
  this.perMessageDeflate = false !== opts.perMessageDeflate ? opts.perMessageDeflate || {} : false;
  if (true === this.perMessageDeflate) this.perMessageDeflate = {};

  if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
    this.perMessageDeflate.threshold = 1024;
  } // SSL options for Node.js client


  this.pfx = opts.pfx || null;
  this.key = opts.key || null;
  this.passphrase = opts.passphrase || null;
  this.cert = opts.cert || null;
  this.ca = opts.ca || null;
  this.ciphers = opts.ciphers || null;
  this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? true : opts.rejectUnauthorized;
  this.forceNode = !!opts.forceNode; // detect ReactNative environment

  this.isReactNative = typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative'; // other options for Node.js or ReactNative client

  if (typeof self === 'undefined' || this.isReactNative) {
    if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
      this.extraHeaders = opts.extraHeaders;
    }

    if (opts.localAddress) {
      this.localAddress = opts.localAddress;
    }
  } // set on handshake


  this.id = null;
  this.upgrades = null;
  this.pingInterval = null;
  this.pingTimeout = null; // set on heartbeat

  this.pingIntervalTimer = null;
  this.pingTimeoutTimer = null;
  this.open();
}

Socket.priorWebsocketSuccess = false;
/**
 * Mix in `Emitter`.
 */

componentEmitter$1(Socket.prototype);
/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = browser$4.protocol; // this is an int

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = transport;
Socket.transports = transports;
Socket.parser = browser$4;
/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug$5('creating transport "%s"', name);
  var query = clone(this.query); // append engine.io protocol identifier

  query.EIO = browser$4.protocol; // transport name

  query.transport = name; // per-transport options

  var options = this.transportOptions[name] || {}; // session id if we already have one

  if (this.id) query.sid = this.id;
  var transport = new transports[name]({
    query: query,
    socket: this,
    agent: options.agent || this.agent,
    hostname: options.hostname || this.hostname,
    port: options.port || this.port,
    secure: options.secure || this.secure,
    path: options.path || this.path,
    forceJSONP: options.forceJSONP || this.forceJSONP,
    jsonp: options.jsonp || this.jsonp,
    forceBase64: options.forceBase64 || this.forceBase64,
    enablesXDR: options.enablesXDR || this.enablesXDR,
    withCredentials: options.withCredentials || this.withCredentials,
    timestampRequests: options.timestampRequests || this.timestampRequests,
    timestampParam: options.timestampParam || this.timestampParam,
    policyPort: options.policyPort || this.policyPort,
    pfx: options.pfx || this.pfx,
    key: options.key || this.key,
    passphrase: options.passphrase || this.passphrase,
    cert: options.cert || this.cert,
    ca: options.ca || this.ca,
    ciphers: options.ciphers || this.ciphers,
    rejectUnauthorized: options.rejectUnauthorized || this.rejectUnauthorized,
    perMessageDeflate: options.perMessageDeflate || this.perMessageDeflate,
    extraHeaders: options.extraHeaders || this.extraHeaders,
    forceNode: options.forceNode || this.forceNode,
    localAddress: options.localAddress || this.localAddress,
    requestTimeout: options.requestTimeout || this.requestTimeout,
    protocols: options.protocols || void 0,
    isReactNative: this.isReactNative
  });
  return transport;
};

function clone(obj) {
  var o = {};

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }

  return o;
}
/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */


Socket.prototype.open = function () {
  var transport;

  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') !== -1) {
    transport = 'websocket';
  } else if (0 === this.transports.length) {
    // Emit error on next tick so it can be listened to
    var self = this;
    setTimeout(function () {
      self.emit('error', 'No transports available');
    }, 0);
    return;
  } else {
    transport = this.transports[0];
  }

  this.readyState = 'opening'; // Retry with the next transport if the transport is disabled (jsonp: false)

  try {
    transport = this.createTransport(transport);
  } catch (e) {
    this.transports.shift();
    this.open();
    return;
  }

  transport.open();
  this.setTransport(transport);
};
/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */


Socket.prototype.setTransport = function (transport) {
  debug$5('setting transport %s', transport.name);
  var self = this;

  if (this.transport) {
    debug$5('clearing existing transport %s', this.transport.name);
    this.transport.removeAllListeners();
  } // set up transport


  this.transport = transport; // set up transport listeners

  transport.on('drain', function () {
    self.onDrain();
  }).on('packet', function (packet) {
    self.onPacket(packet);
  }).on('error', function (e) {
    self.onError(e);
  }).on('close', function () {
    self.onClose('transport close');
  });
};
/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */


Socket.prototype.probe = function (name) {
  debug$5('probing transport "%s"', name);
  var transport = this.createTransport(name, {
    probe: 1
  });
  var failed = false;
  var self = this;
  Socket.priorWebsocketSuccess = false;

  function onTransportOpen() {
    if (self.onlyBinaryUpgrades) {
      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
      failed = failed || upgradeLosesBinary;
    }

    if (failed) return;
    debug$5('probe transport "%s" opened', name);
    transport.send([{
      type: 'ping',
      data: 'probe'
    }]);
    transport.once('packet', function (msg) {
      if (failed) return;

      if ('pong' === msg.type && 'probe' === msg.data) {
        debug$5('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);
        if (!transport) return;
        Socket.priorWebsocketSuccess = 'websocket' === transport.name;
        debug$5('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' === self.readyState) return;
          debug$5('changing transport and sending upgrade packet');
          cleanup();
          self.setTransport(transport);
          transport.send([{
            type: 'upgrade'
          }]);
          self.emit('upgrade', transport);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug$5('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('upgradeError', err);
      }
    });
  }

  function freezeTransport() {
    if (failed) return; // Any callback called by transport should be ignored since now

    failed = true;
    cleanup();
    transport.close();
    transport = null;
  } // Handle any error that happens while probing


  function onerror(err) {
    var error = new Error('probe error: ' + err);
    error.transport = transport.name;
    freezeTransport();
    debug$5('probe transport "%s" failed because of error: %s', name, err);
    self.emit('upgradeError', error);
  }

  function onTransportClose() {
    onerror('transport closed');
  } // When the socket is closed while we're probing


  function onclose() {
    onerror('socket closed');
  } // When the socket is upgraded while we're probing


  function onupgrade(to) {
    if (transport && to.name !== transport.name) {
      debug$5('"%s" works - aborting "%s"', to.name, transport.name);
      freezeTransport();
    }
  } // Remove all listeners on the transport and on self


  function cleanup() {
    transport.removeListener('open', onTransportOpen);
    transport.removeListener('error', onerror);
    transport.removeListener('close', onTransportClose);
    self.removeListener('close', onclose);
    self.removeListener('upgrading', onupgrade);
  }

  transport.once('open', onTransportOpen);
  transport.once('error', onerror);
  transport.once('close', onTransportClose);
  this.once('close', onclose);
  this.once('upgrading', onupgrade);
  transport.open();
};
/**
 * Called when connection is deemed open.
 *
 * @api public
 */


Socket.prototype.onOpen = function () {
  debug$5('socket open');
  this.readyState = 'open';
  Socket.priorWebsocketSuccess = 'websocket' === this.transport.name;
  this.emit('open');
  this.flush(); // we check for `readyState` in case an `open`
  // listener already closed the socket

  if ('open' === this.readyState && this.upgrade && this.transport.pause) {
    debug$5('starting upgrade probes');

    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};
/**
 * Handles a packet.
 *
 * @api private
 */


Socket.prototype.onPacket = function (packet) {
  if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
    debug$5('socket receive: type "%s", data "%s"', packet.type, packet.data);
    this.emit('packet', packet); // Socket is live - any packet counts

    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(JSON.parse(packet.data));
        break;

      case 'pong':
        this.setPing();
        this.emit('pong');
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.onError(err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        break;
    }
  } else {
    debug$5('packet received with socket readyState "%s"', this.readyState);
  }
};
/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */


Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen(); // In case open handler closes socket

  if ('closed' === this.readyState) return;
  this.setPing(); // Prolong liveness of socket on heartbeat

  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};
/**
 * Resets ping timeout.
 *
 * @api private
 */


Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' === self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || self.pingInterval + self.pingTimeout);
};
/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */


Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug$5('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};
/**
* Sends a ping packet.
*
* @api private
*/


Socket.prototype.ping = function () {
  var self = this;
  this.sendPacket('ping', function () {
    self.emit('ping');
  });
};
/**
 * Called on `drain` event
 *
 * @api private
 */


Socket.prototype.onDrain = function () {
  this.writeBuffer.splice(0, this.prevBufferLen); // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`

  this.prevBufferLen = 0;

  if (0 === this.writeBuffer.length) {
    this.emit('drain');
  } else {
    this.flush();
  }
};
/**
 * Flush write buffers.
 *
 * @api private
 */


Socket.prototype.flush = function () {
  if ('closed' !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
    debug$5('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer); // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`

    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};
/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @param {Object} options.
 * @return {Socket} for chaining.
 * @api public
 */


Socket.prototype.write = Socket.prototype.send = function (msg, options, fn) {
  this.sendPacket('message', msg, options, fn);
  return this;
};
/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Object} options.
 * @param {Function} callback function.
 * @api private
 */


Socket.prototype.sendPacket = function (type, data, options, fn) {
  if ('function' === typeof data) {
    fn = data;
    data = undefined;
  }

  if ('function' === typeof options) {
    fn = options;
    options = null;
  }

  if ('closing' === this.readyState || 'closed' === this.readyState) {
    return;
  }

  options = options || {};
  options.compress = false !== options.compress;
  var packet = {
    type: type,
    data: data,
    options: options
  };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  if (fn) this.once('flush', fn);
  this.flush();
};
/**
 * Closes the connection.
 *
 * @api private
 */


Socket.prototype.close = function () {
  if ('opening' === this.readyState || 'open' === this.readyState) {
    this.readyState = 'closing';
    var self = this;

    if (this.writeBuffer.length) {
      this.once('drain', function () {
        if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      });
    } else if (this.upgrading) {
      waitForUpgrade();
    } else {
      close();
    }
  }

  function close() {
    self.onClose('forced close');
    debug$5('socket closing - telling transport to close');
    self.transport.close();
  }

  function cleanupAndClose() {
    self.removeListener('upgrade', cleanupAndClose);
    self.removeListener('upgradeError', cleanupAndClose);
    close();
  }

  function waitForUpgrade() {
    // wait for upgrade to finish since we can't send packets while pausing a transport
    self.once('upgrade', cleanupAndClose);
    self.once('upgradeError', cleanupAndClose);
  }

  return this;
};
/**
 * Called upon transport error
 *
 * @api private
 */


Socket.prototype.onError = function (err) {
  debug$5('socket error %j', err);
  Socket.priorWebsocketSuccess = false;
  this.emit('error', err);
  this.onClose('transport error', err);
};
/**
 * Called upon transport close.
 *
 * @api private
 */


Socket.prototype.onClose = function (reason, desc) {
  if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
    debug$5('socket close with reason: "%s"', reason);
    var self = this; // clear timers

    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer); // stop event from firing again for transport

    this.transport.removeAllListeners('close'); // ensure transport won't stay open

    this.transport.close(); // ignore further transport communication

    this.transport.removeAllListeners(); // set ready state

    this.readyState = 'closed'; // clear session id

    this.id = null; // emit close event

    this.emit('close', reason, desc); // clean buffers after, so users can still
    // grab the buffers on `close` event

    self.writeBuffer = [];
    self.prevBufferLen = 0;
  }
};
/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */


Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];

  for (var i = 0, j = upgrades.length; i < j; i++) {
    if (~indexof(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }

  return filteredUpgrades;
};

var lib = socket;
/**
 * Exports parser
 *
 * @api public
 *
 */

var parser = browser$4;
lib.parser = parser;

var toArray_1 = toArray;

function toArray(list, index) {
  var array = [];
  index = index || 0;

  for (var i = index || 0; i < list.length; i++) {
    array[i - index] = list[i];
  }

  return array;
}

/**
 * Module exports.
 */
var on_1 = on$1;
/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

function on$1(obj, ev, fn) {
  obj.on(ev, fn);
  return {
    destroy: function () {
      obj.removeListener(ev, fn);
    }
  };
}

/**
 * Slice reference.
 */
var slice = [].slice;
/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

var componentBind = function (obj, fn) {
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function () {
    return fn.apply(obj, args.concat(slice.call(arguments)));
  };
};

var socket$1 = createCommonjsModule(function (module, exports) {
  /**
   * Module dependencies.
   */
  var debug = browser$2('socket.io-client:socket');
  /**
   * Module exports.
   */

  module.exports = exports = Socket;
  /**
   * Internal events (blacklisted).
   * These events can't be emitted by the user.
   *
   * @api private
   */

  var events = {
    connect: 1,
    connect_error: 1,
    connect_timeout: 1,
    connecting: 1,
    disconnect: 1,
    error: 1,
    reconnect: 1,
    reconnect_attempt: 1,
    reconnect_failed: 1,
    reconnect_error: 1,
    reconnecting: 1,
    ping: 1,
    pong: 1
  };
  /**
   * Shortcut to `Emitter#emit`.
   */

  var emit = componentEmitter.prototype.emit;
  /**
   * `Socket` constructor.
   *
   * @api public
   */

  function Socket(io, nsp, opts) {
    this.io = io;
    this.nsp = nsp;
    this.json = this; // compat

    this.ids = 0;
    this.acks = {};
    this.receiveBuffer = [];
    this.sendBuffer = [];
    this.connected = false;
    this.disconnected = true;
    this.flags = {};

    if (opts && opts.query) {
      this.query = opts.query;
    }

    if (this.io.autoConnect) this.open();
  }
  /**
   * Mix in `Emitter`.
   */


  componentEmitter(Socket.prototype);
  /**
   * Subscribe to open, close and packet events
   *
   * @api private
   */

  Socket.prototype.subEvents = function () {
    if (this.subs) return;
    var io = this.io;
    this.subs = [on_1(io, 'open', componentBind(this, 'onopen')), on_1(io, 'packet', componentBind(this, 'onpacket')), on_1(io, 'close', componentBind(this, 'onclose'))];
  };
  /**
   * "Opens" the socket.
   *
   * @api public
   */


  Socket.prototype.open = Socket.prototype.connect = function () {
    if (this.connected) return this;
    this.subEvents();
    this.io.open(); // ensure open

    if ('open' === this.io.readyState) this.onopen();
    this.emit('connecting');
    return this;
  };
  /**
   * Sends a `message` event.
   *
   * @return {Socket} self
   * @api public
   */


  Socket.prototype.send = function () {
    var args = toArray_1(arguments);
    args.unshift('message');
    this.emit.apply(this, args);
    return this;
  };
  /**
   * Override `emit`.
   * If the event is in `events`, it's emitted normally.
   *
   * @param {String} event name
   * @return {Socket} self
   * @api public
   */


  Socket.prototype.emit = function (ev) {
    if (events.hasOwnProperty(ev)) {
      emit.apply(this, arguments);
      return this;
    }

    var args = toArray_1(arguments);
    var packet = {
      type: (this.flags.binary !== undefined ? this.flags.binary : hasBinary2(args)) ? socket_ioParser.BINARY_EVENT : socket_ioParser.EVENT,
      data: args
    };
    packet.options = {};
    packet.options.compress = !this.flags || false !== this.flags.compress; // event ack callback

    if ('function' === typeof args[args.length - 1]) {
      debug('emitting packet with ack id %d', this.ids);
      this.acks[this.ids] = args.pop();
      packet.id = this.ids++;
    }

    if (this.connected) {
      this.packet(packet);
    } else {
      this.sendBuffer.push(packet);
    }

    this.flags = {};
    return this;
  };
  /**
   * Sends a packet.
   *
   * @param {Object} packet
   * @api private
   */


  Socket.prototype.packet = function (packet) {
    packet.nsp = this.nsp;
    this.io.packet(packet);
  };
  /**
   * Called upon engine `open`.
   *
   * @api private
   */


  Socket.prototype.onopen = function () {
    debug('transport is open - connecting'); // write connect packet if necessary

    if ('/' !== this.nsp) {
      if (this.query) {
        var query = typeof this.query === 'object' ? parseqs.encode(this.query) : this.query;
        debug('sending connect packet with query %s', query);
        this.packet({
          type: socket_ioParser.CONNECT,
          query: query
        });
      } else {
        this.packet({
          type: socket_ioParser.CONNECT
        });
      }
    }
  };
  /**
   * Called upon engine `close`.
   *
   * @param {String} reason
   * @api private
   */


  Socket.prototype.onclose = function (reason) {
    debug('close (%s)', reason);
    this.connected = false;
    this.disconnected = true;
    delete this.id;
    this.emit('disconnect', reason);
  };
  /**
   * Called with socket packet.
   *
   * @param {Object} packet
   * @api private
   */


  Socket.prototype.onpacket = function (packet) {
    var sameNamespace = packet.nsp === this.nsp;
    var rootNamespaceError = packet.type === socket_ioParser.ERROR && packet.nsp === '/';
    if (!sameNamespace && !rootNamespaceError) return;

    switch (packet.type) {
      case socket_ioParser.CONNECT:
        this.onconnect();
        break;

      case socket_ioParser.EVENT:
        this.onevent(packet);
        break;

      case socket_ioParser.BINARY_EVENT:
        this.onevent(packet);
        break;

      case socket_ioParser.ACK:
        this.onack(packet);
        break;

      case socket_ioParser.BINARY_ACK:
        this.onack(packet);
        break;

      case socket_ioParser.DISCONNECT:
        this.ondisconnect();
        break;

      case socket_ioParser.ERROR:
        this.emit('error', packet.data);
        break;
    }
  };
  /**
   * Called upon a server event.
   *
   * @param {Object} packet
   * @api private
   */


  Socket.prototype.onevent = function (packet) {
    var args = packet.data || [];
    debug('emitting event %j', args);

    if (null != packet.id) {
      debug('attaching ack callback to event');
      args.push(this.ack(packet.id));
    }

    if (this.connected) {
      emit.apply(this, args);
    } else {
      this.receiveBuffer.push(args);
    }
  };
  /**
   * Produces an ack callback to emit with an event.
   *
   * @api private
   */


  Socket.prototype.ack = function (id) {
    var self = this;
    var sent = false;
    return function () {
      // prevent double callbacks
      if (sent) return;
      sent = true;
      var args = toArray_1(arguments);
      debug('sending ack %j', args);
      self.packet({
        type: hasBinary2(args) ? socket_ioParser.BINARY_ACK : socket_ioParser.ACK,
        id: id,
        data: args
      });
    };
  };
  /**
   * Called upon a server acknowlegement.
   *
   * @param {Object} packet
   * @api private
   */


  Socket.prototype.onack = function (packet) {
    var ack = this.acks[packet.id];

    if ('function' === typeof ack) {
      debug('calling ack %s with %j', packet.id, packet.data);
      ack.apply(this, packet.data);
      delete this.acks[packet.id];
    } else {
      debug('bad ack %s', packet.id);
    }
  };
  /**
   * Called upon server connect.
   *
   * @api private
   */


  Socket.prototype.onconnect = function () {
    this.connected = true;
    this.disconnected = false;
    this.emit('connect');
    this.emitBuffered();
  };
  /**
   * Emit buffered events (received and emitted).
   *
   * @api private
   */


  Socket.prototype.emitBuffered = function () {
    var i;

    for (i = 0; i < this.receiveBuffer.length; i++) {
      emit.apply(this, this.receiveBuffer[i]);
    }

    this.receiveBuffer = [];

    for (i = 0; i < this.sendBuffer.length; i++) {
      this.packet(this.sendBuffer[i]);
    }

    this.sendBuffer = [];
  };
  /**
   * Called upon server disconnect.
   *
   * @api private
   */


  Socket.prototype.ondisconnect = function () {
    debug('server disconnect (%s)', this.nsp);
    this.destroy();
    this.onclose('io server disconnect');
  };
  /**
   * Called upon forced client/server side disconnections,
   * this method ensures the manager stops tracking us and
   * that reconnections don't get triggered for this.
   *
   * @api private.
   */


  Socket.prototype.destroy = function () {
    if (this.subs) {
      // clean subscriptions to avoid reconnections
      for (var i = 0; i < this.subs.length; i++) {
        this.subs[i].destroy();
      }

      this.subs = null;
    }

    this.io.destroy(this);
  };
  /**
   * Disconnects the socket manually.
   *
   * @return {Socket} self
   * @api public
   */


  Socket.prototype.close = Socket.prototype.disconnect = function () {
    if (this.connected) {
      debug('performing disconnect (%s)', this.nsp);
      this.packet({
        type: socket_ioParser.DISCONNECT
      });
    } // remove socket from pool


    this.destroy();

    if (this.connected) {
      // fire events
      this.onclose('io client disconnect');
    }

    return this;
  };
  /**
   * Sets the compress flag.
   *
   * @param {Boolean} if `true`, compresses the sending data
   * @return {Socket} self
   * @api public
   */


  Socket.prototype.compress = function (compress) {
    this.flags.compress = compress;
    return this;
  };
  /**
   * Sets the binary flag
   *
   * @param {Boolean} whether the emitted data contains binary
   * @return {Socket} self
   * @api public
   */


  Socket.prototype.binary = function (binary) {
    this.flags.binary = binary;
    return this;
  };
});

/**
 * Expose `Backoff`.
 */
var backo2 = Backoff;
/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */

function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 10000;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}
/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */


Backoff.prototype.duration = function () {
  var ms = this.ms * Math.pow(this.factor, this.attempts++);

  if (this.jitter) {
    var rand = Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
  }

  return Math.min(ms, this.max) | 0;
};
/**
 * Reset the number of attempts.
 *
 * @api public
 */


Backoff.prototype.reset = function () {
  this.attempts = 0;
};
/**
 * Set the minimum duration
 *
 * @api public
 */


Backoff.prototype.setMin = function (min) {
  this.ms = min;
};
/**
 * Set the maximum duration
 *
 * @api public
 */


Backoff.prototype.setMax = function (max) {
  this.max = max;
};
/**
 * Set the jitter
 *
 * @api public
 */


Backoff.prototype.setJitter = function (jitter) {
  this.jitter = jitter;
};

/**
 * Module dependencies.
 */

var debug$6 = browser$2('socket.io-client:manager');
/**
 * IE6+ hasOwnProperty
 */

var has = Object.prototype.hasOwnProperty;
/**
 * Module exports
 */

var manager = Manager;
/**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */

function Manager(uri, opts) {
  if (!(this instanceof Manager)) return new Manager(uri, opts);

  if (uri && 'object' === typeof uri) {
    opts = uri;
    uri = undefined;
  }

  opts = opts || {};
  opts.path = opts.path || '/socket.io';
  this.nsps = {};
  this.subs = [];
  this.opts = opts;
  this.reconnection(opts.reconnection !== false);
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
  this.reconnectionDelay(opts.reconnectionDelay || 1000);
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
  this.randomizationFactor(opts.randomizationFactor || 0.5);
  this.backoff = new backo2({
    min: this.reconnectionDelay(),
    max: this.reconnectionDelayMax(),
    jitter: this.randomizationFactor()
  });
  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
  this.readyState = 'closed';
  this.uri = uri;
  this.connecting = [];
  this.lastPing = null;
  this.encoding = false;
  this.packetBuffer = [];

  var _parser = opts.parser || socket_ioParser;

  this.encoder = new _parser.Encoder();
  this.decoder = new _parser.Decoder();
  this.autoConnect = opts.autoConnect !== false;
  if (this.autoConnect) this.open();
}
/**
 * Propagate given event to sockets and emit on `this`
 *
 * @api private
 */


Manager.prototype.emitAll = function () {
  this.emit.apply(this, arguments);

  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
    }
  }
};
/**
 * Update `socket.id` of all sockets
 *
 * @api private
 */


Manager.prototype.updateSocketIds = function () {
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].id = this.generateId(nsp);
    }
  }
};
/**
 * generate `socket.id` for the given `nsp`
 *
 * @param {String} nsp
 * @return {String}
 * @api private
 */


Manager.prototype.generateId = function (nsp) {
  return (nsp === '/' ? '' : nsp + '#') + this.engine.id;
};
/**
 * Mix in `Emitter`.
 */


componentEmitter(Manager.prototype);
/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnection = function (v) {
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};
/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */


Manager.prototype.reconnectionAttempts = function (v) {
  if (!arguments.length) return this._reconnectionAttempts;
  this._reconnectionAttempts = v;
  return this;
};
/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */


Manager.prototype.reconnectionDelay = function (v) {
  if (!arguments.length) return this._reconnectionDelay;
  this._reconnectionDelay = v;
  this.backoff && this.backoff.setMin(v);
  return this;
};

Manager.prototype.randomizationFactor = function (v) {
  if (!arguments.length) return this._randomizationFactor;
  this._randomizationFactor = v;
  this.backoff && this.backoff.setJitter(v);
  return this;
};
/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */


Manager.prototype.reconnectionDelayMax = function (v) {
  if (!arguments.length) return this._reconnectionDelayMax;
  this._reconnectionDelayMax = v;
  this.backoff && this.backoff.setMax(v);
  return this;
};
/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */


Manager.prototype.timeout = function (v) {
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};
/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */


Manager.prototype.maybeReconnectOnOpen = function () {
  // Only try to reconnect if it's the first time we're connecting
  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.reconnect();
  }
};
/**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */


Manager.prototype.open = Manager.prototype.connect = function (fn, opts) {
  debug$6('readyState %s', this.readyState);
  if (~this.readyState.indexOf('open')) return this;
  debug$6('opening %s', this.uri);
  this.engine = lib(this.uri, this.opts);
  var socket = this.engine;
  var self = this;
  this.readyState = 'opening';
  this.skipReconnect = false; // emit `open`

  var openSub = on_1(socket, 'open', function () {
    self.onopen();
    fn && fn();
  }); // emit `connect_error`

  var errorSub = on_1(socket, 'error', function (data) {
    debug$6('connect_error');
    self.cleanup();
    self.readyState = 'closed';
    self.emitAll('connect_error', data);

    if (fn) {
      var err = new Error('Connection error');
      err.data = data;
      fn(err);
    } else {
      // Only do this if there is no fn to handle the error
      self.maybeReconnectOnOpen();
    }
  }); // emit `connect_timeout`

  if (false !== this._timeout) {
    var timeout = this._timeout;
    debug$6('connect attempt will timeout after %d', timeout); // set timer

    var timer = setTimeout(function () {
      debug$6('connect attempt timed out after %d', timeout);
      openSub.destroy();
      socket.close();
      socket.emit('error', 'timeout');
      self.emitAll('connect_timeout', timeout);
    }, timeout);
    this.subs.push({
      destroy: function () {
        clearTimeout(timer);
      }
    });
  }

  this.subs.push(openSub);
  this.subs.push(errorSub);
  return this;
};
/**
 * Called upon transport open.
 *
 * @api private
 */


Manager.prototype.onopen = function () {
  debug$6('open'); // clear old subs

  this.cleanup(); // mark as open

  this.readyState = 'open';
  this.emit('open'); // add new subs

  var socket = this.engine;
  this.subs.push(on_1(socket, 'data', componentBind(this, 'ondata')));
  this.subs.push(on_1(socket, 'ping', componentBind(this, 'onping')));
  this.subs.push(on_1(socket, 'pong', componentBind(this, 'onpong')));
  this.subs.push(on_1(socket, 'error', componentBind(this, 'onerror')));
  this.subs.push(on_1(socket, 'close', componentBind(this, 'onclose')));
  this.subs.push(on_1(this.decoder, 'decoded', componentBind(this, 'ondecoded')));
};
/**
 * Called upon a ping.
 *
 * @api private
 */


Manager.prototype.onping = function () {
  this.lastPing = new Date();
  this.emitAll('ping');
};
/**
 * Called upon a packet.
 *
 * @api private
 */


Manager.prototype.onpong = function () {
  this.emitAll('pong', new Date() - this.lastPing);
};
/**
 * Called with data.
 *
 * @api private
 */


Manager.prototype.ondata = function (data) {
  this.decoder.add(data);
};
/**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */


Manager.prototype.ondecoded = function (packet) {
  this.emit('packet', packet);
};
/**
 * Called upon socket error.
 *
 * @api private
 */


Manager.prototype.onerror = function (err) {
  debug$6('error', err);
  this.emitAll('error', err);
};
/**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */


Manager.prototype.socket = function (nsp, opts) {
  var socket = this.nsps[nsp];

  if (!socket) {
    socket = new socket$1(this, nsp, opts);
    this.nsps[nsp] = socket;
    var self = this;
    socket.on('connecting', onConnecting);
    socket.on('connect', function () {
      socket.id = self.generateId(nsp);
    });

    if (this.autoConnect) {
      // manually call here since connecting event is fired before listening
      onConnecting();
    }
  }

  function onConnecting() {
    if (!~indexof(self.connecting, socket)) {
      self.connecting.push(socket);
    }
  }

  return socket;
};
/**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */


Manager.prototype.destroy = function (socket) {
  var index = indexof(this.connecting, socket);
  if (~index) this.connecting.splice(index, 1);
  if (this.connecting.length) return;
  this.close();
};
/**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */


Manager.prototype.packet = function (packet) {
  debug$6('writing packet %j', packet);
  var self = this;
  if (packet.query && packet.type === 0) packet.nsp += '?' + packet.query;

  if (!self.encoding) {
    // encode, then write to engine with result
    self.encoding = true;
    this.encoder.encode(packet, function (encodedPackets) {
      for (var i = 0; i < encodedPackets.length; i++) {
        self.engine.write(encodedPackets[i], packet.options);
      }

      self.encoding = false;
      self.processPacketQueue();
    });
  } else {
    // add packet to the queue
    self.packetBuffer.push(packet);
  }
};
/**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */


Manager.prototype.processPacketQueue = function () {
  if (this.packetBuffer.length > 0 && !this.encoding) {
    var pack = this.packetBuffer.shift();
    this.packet(pack);
  }
};
/**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */


Manager.prototype.cleanup = function () {
  debug$6('cleanup');
  var subsLength = this.subs.length;

  for (var i = 0; i < subsLength; i++) {
    var sub = this.subs.shift();
    sub.destroy();
  }

  this.packetBuffer = [];
  this.encoding = false;
  this.lastPing = null;
  this.decoder.destroy();
};
/**
 * Close the current socket.
 *
 * @api private
 */


Manager.prototype.close = Manager.prototype.disconnect = function () {
  debug$6('disconnect');
  this.skipReconnect = true;
  this.reconnecting = false;

  if ('opening' === this.readyState) {
    // `onclose` will not fire because
    // an open event never happened
    this.cleanup();
  }

  this.backoff.reset();
  this.readyState = 'closed';
  if (this.engine) this.engine.close();
};
/**
 * Called upon engine close.
 *
 * @api private
 */


Manager.prototype.onclose = function (reason) {
  debug$6('onclose');
  this.cleanup();
  this.backoff.reset();
  this.readyState = 'closed';
  this.emit('close', reason);

  if (this._reconnection && !this.skipReconnect) {
    this.reconnect();
  }
};
/**
 * Attempt a reconnection.
 *
 * @api private
 */


Manager.prototype.reconnect = function () {
  if (this.reconnecting || this.skipReconnect) return this;
  var self = this;

  if (this.backoff.attempts >= this._reconnectionAttempts) {
    debug$6('reconnect failed');
    this.backoff.reset();
    this.emitAll('reconnect_failed');
    this.reconnecting = false;
  } else {
    var delay = this.backoff.duration();
    debug$6('will wait %dms before reconnect attempt', delay);
    this.reconnecting = true;
    var timer = setTimeout(function () {
      if (self.skipReconnect) return;
      debug$6('attempting reconnect');
      self.emitAll('reconnect_attempt', self.backoff.attempts);
      self.emitAll('reconnecting', self.backoff.attempts); // check again for the case socket closed in above events

      if (self.skipReconnect) return;
      self.open(function (err) {
        if (err) {
          debug$6('reconnect attempt error');
          self.reconnecting = false;
          self.reconnect();
          self.emitAll('reconnect_error', err.data);
        } else {
          debug$6('reconnect success');
          self.onreconnect();
        }
      });
    }, delay);
    this.subs.push({
      destroy: function () {
        clearTimeout(timer);
      }
    });
  }
};
/**
 * Called upon successful reconnect.
 *
 * @api private
 */


Manager.prototype.onreconnect = function () {
  var attempt = this.backoff.attempts;
  this.reconnecting = false;
  this.backoff.reset();
  this.updateSocketIds();
  this.emitAll('reconnect', attempt);
};

var lib$1 = createCommonjsModule(function (module, exports) {
  /**
   * Module dependencies.
   */
  var debug = browser$2('socket.io-client');
  /**
   * Module exports.
   */

  module.exports = exports = lookup;
  /**
   * Managers cache.
   */

  var cache = exports.managers = {};
  /**
   * Looks up an existing `Manager` for multiplexing.
   * If the user summons:
   *
   *   `io('http://localhost/a');`
   *   `io('http://localhost/b');`
   *
   * We reuse the existing instance based on same scheme/port/host,
   * and we initialize sockets for each namespace.
   *
   * @api public
   */

  function lookup(uri, opts) {
    if (typeof uri === 'object') {
      opts = uri;
      uri = undefined;
    }

    opts = opts || {};
    var parsed = url_1(uri);
    var source = parsed.source;
    var id = parsed.id;
    var path = parsed.path;
    var sameNamespace = cache[id] && path in cache[id].nsps;
    var newConnection = opts.forceNew || opts['force new connection'] || false === opts.multiplex || sameNamespace;
    var io;

    if (newConnection) {
      debug('ignoring socket cache for %s', source);
      io = manager(source, opts);
    } else {
      if (!cache[id]) {
        debug('new io instance for %s', source);
        cache[id] = manager(source, opts);
      }

      io = cache[id];
    }

    if (parsed.query && !opts.query) {
      opts.query = parsed.query;
    }

    return io.socket(parsed.path, opts);
  }
  /**
   * Protocol version.
   *
   * @api public
   */


  exports.protocol = socket_ioParser.protocol;
  /**
   * `connect`.
   *
   * @param {String} uri
   * @api public
   */

  exports.connect = lookup;
  /**
   * Expose constructors for standalone build.
   *
   * @api public
   */

  exports.Manager = manager;
  exports.Socket = socket$1;
});

var es5 = createCommonjsModule(function (module, exports) {
  !function (e, t) {
     module.exports = t() ;
  }(commonjsGlobal, function () {
    return function (e) {
      var t = {};

      function r(n) {
        if (t[n]) return t[n].exports;
        var i = t[n] = {
          i: n,
          l: !1,
          exports: {}
        };
        return e[n].call(i.exports, i, i.exports, r), i.l = !0, i.exports;
      }

      return r.m = e, r.c = t, r.d = function (e, t, n) {
        r.o(e, t) || Object.defineProperty(e, t, {
          enumerable: !0,
          get: n
        });
      }, r.r = function (e) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
          value: "Module"
        }), Object.defineProperty(e, "__esModule", {
          value: !0
        });
      }, r.t = function (e, t) {
        if (1 & t && (e = r(e)), 8 & t) return e;
        if (4 & t && "object" == typeof e && e && e.__esModule) return e;
        var n = Object.create(null);
        if (r.r(n), Object.defineProperty(n, "default", {
          enumerable: !0,
          value: e
        }), 2 & t && "string" != typeof e) for (var i in e) r.d(n, i, function (t) {
          return e[t];
        }.bind(null, i));
        return n;
      }, r.n = function (e) {
        var t = e && e.__esModule ? function () {
          return e.default;
        } : function () {
          return e;
        };
        return r.d(t, "a", t), t;
      }, r.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t);
      }, r.p = "", r(r.s = 90);
    }({
      17: function (e, t, r) {

        t.__esModule = !0, t.default = void 0;

        var n = r(18),
            i = function () {
          function e() {}

          return e.getFirstMatch = function (e, t) {
            var r = t.match(e);
            return r && r.length > 0 && r[1] || "";
          }, e.getSecondMatch = function (e, t) {
            var r = t.match(e);
            return r && r.length > 1 && r[2] || "";
          }, e.matchAndReturnConst = function (e, t, r) {
            if (e.test(t)) return r;
          }, e.getWindowsVersionName = function (e) {
            switch (e) {
              case "NT":
                return "NT";

              case "XP":
                return "XP";

              case "NT 5.0":
                return "2000";

              case "NT 5.1":
                return "XP";

              case "NT 5.2":
                return "2003";

              case "NT 6.0":
                return "Vista";

              case "NT 6.1":
                return "7";

              case "NT 6.2":
                return "8";

              case "NT 6.3":
                return "8.1";

              case "NT 10.0":
                return "10";

              default:
                return;
            }
          }, e.getMacOSVersionName = function (e) {
            var t = e.split(".").splice(0, 2).map(function (e) {
              return parseInt(e, 10) || 0;
            });
            if (t.push(0), 10 === t[0]) switch (t[1]) {
              case 5:
                return "Leopard";

              case 6:
                return "Snow Leopard";

              case 7:
                return "Lion";

              case 8:
                return "Mountain Lion";

              case 9:
                return "Mavericks";

              case 10:
                return "Yosemite";

              case 11:
                return "El Capitan";

              case 12:
                return "Sierra";

              case 13:
                return "High Sierra";

              case 14:
                return "Mojave";

              case 15:
                return "Catalina";

              default:
                return;
            }
          }, e.getAndroidVersionName = function (e) {
            var t = e.split(".").splice(0, 2).map(function (e) {
              return parseInt(e, 10) || 0;
            });
            if (t.push(0), !(1 === t[0] && t[1] < 5)) return 1 === t[0] && t[1] < 6 ? "Cupcake" : 1 === t[0] && t[1] >= 6 ? "Donut" : 2 === t[0] && t[1] < 2 ? "Eclair" : 2 === t[0] && 2 === t[1] ? "Froyo" : 2 === t[0] && t[1] > 2 ? "Gingerbread" : 3 === t[0] ? "Honeycomb" : 4 === t[0] && t[1] < 1 ? "Ice Cream Sandwich" : 4 === t[0] && t[1] < 4 ? "Jelly Bean" : 4 === t[0] && t[1] >= 4 ? "KitKat" : 5 === t[0] ? "Lollipop" : 6 === t[0] ? "Marshmallow" : 7 === t[0] ? "Nougat" : 8 === t[0] ? "Oreo" : 9 === t[0] ? "Pie" : void 0;
          }, e.getVersionPrecision = function (e) {
            return e.split(".").length;
          }, e.compareVersions = function (t, r, n) {
            void 0 === n && (n = !1);
            var i = e.getVersionPrecision(t),
                s = e.getVersionPrecision(r),
                a = Math.max(i, s),
                o = 0,
                u = e.map([t, r], function (t) {
              var r = a - e.getVersionPrecision(t),
                  n = t + new Array(r + 1).join(".0");
              return e.map(n.split("."), function (e) {
                return new Array(20 - e.length).join("0") + e;
              }).reverse();
            });

            for (n && (o = a - Math.min(i, s)), a -= 1; a >= o;) {
              if (u[0][a] > u[1][a]) return 1;

              if (u[0][a] === u[1][a]) {
                if (a === o) return 0;
                a -= 1;
              } else if (u[0][a] < u[1][a]) return -1;
            }
          }, e.map = function (e, t) {
            var r,
                n = [];
            if (Array.prototype.map) return Array.prototype.map.call(e, t);

            for (r = 0; r < e.length; r += 1) n.push(t(e[r]));

            return n;
          }, e.find = function (e, t) {
            var r, n;
            if (Array.prototype.find) return Array.prototype.find.call(e, t);

            for (r = 0, n = e.length; r < n; r += 1) {
              var i = e[r];
              if (t(i, r)) return i;
            }
          }, e.assign = function (e) {
            for (var t, r, n = e, i = arguments.length, s = new Array(i > 1 ? i - 1 : 0), a = 1; a < i; a++) s[a - 1] = arguments[a];

            if (Object.assign) return Object.assign.apply(Object, [e].concat(s));

            var o = function () {
              var e = s[t];
              "object" == typeof e && null !== e && Object.keys(e).forEach(function (t) {
                n[t] = e[t];
              });
            };

            for (t = 0, r = s.length; t < r; t += 1) o();

            return e;
          }, e.getBrowserAlias = function (e) {
            return n.BROWSER_ALIASES_MAP[e];
          }, e.getBrowserTypeByAlias = function (e) {
            return n.BROWSER_MAP[e] || "";
          }, e;
        }();

        t.default = i, e.exports = t.default;
      },
      18: function (e, t, r) {

        t.__esModule = !0, t.ENGINE_MAP = t.OS_MAP = t.PLATFORMS_MAP = t.BROWSER_MAP = t.BROWSER_ALIASES_MAP = void 0;
        t.BROWSER_ALIASES_MAP = {
          "Amazon Silk": "amazon_silk",
          "Android Browser": "android",
          Bada: "bada",
          BlackBerry: "blackberry",
          Chrome: "chrome",
          Chromium: "chromium",
          Electron: "electron",
          Epiphany: "epiphany",
          Firefox: "firefox",
          Focus: "focus",
          Generic: "generic",
          "Google Search": "google_search",
          Googlebot: "googlebot",
          "Internet Explorer": "ie",
          "K-Meleon": "k_meleon",
          Maxthon: "maxthon",
          "Microsoft Edge": "edge",
          "MZ Browser": "mz",
          "NAVER Whale Browser": "naver",
          Opera: "opera",
          "Opera Coast": "opera_coast",
          PhantomJS: "phantomjs",
          Puffin: "puffin",
          QupZilla: "qupzilla",
          QQ: "qq",
          QQLite: "qqlite",
          Safari: "safari",
          Sailfish: "sailfish",
          "Samsung Internet for Android": "samsung_internet",
          SeaMonkey: "seamonkey",
          Sleipnir: "sleipnir",
          Swing: "swing",
          Tizen: "tizen",
          "UC Browser": "uc",
          Vivaldi: "vivaldi",
          "WebOS Browser": "webos",
          WeChat: "wechat",
          "Yandex Browser": "yandex",
          Roku: "roku"
        };
        t.BROWSER_MAP = {
          amazon_silk: "Amazon Silk",
          android: "Android Browser",
          bada: "Bada",
          blackberry: "BlackBerry",
          chrome: "Chrome",
          chromium: "Chromium",
          electron: "Electron",
          epiphany: "Epiphany",
          firefox: "Firefox",
          focus: "Focus",
          generic: "Generic",
          googlebot: "Googlebot",
          google_search: "Google Search",
          ie: "Internet Explorer",
          k_meleon: "K-Meleon",
          maxthon: "Maxthon",
          edge: "Microsoft Edge",
          mz: "MZ Browser",
          naver: "NAVER Whale Browser",
          opera: "Opera",
          opera_coast: "Opera Coast",
          phantomjs: "PhantomJS",
          puffin: "Puffin",
          qupzilla: "QupZilla",
          qq: "QQ Browser",
          qqlite: "QQ Browser Lite",
          safari: "Safari",
          sailfish: "Sailfish",
          samsung_internet: "Samsung Internet for Android",
          seamonkey: "SeaMonkey",
          sleipnir: "Sleipnir",
          swing: "Swing",
          tizen: "Tizen",
          uc: "UC Browser",
          vivaldi: "Vivaldi",
          webos: "WebOS Browser",
          wechat: "WeChat",
          yandex: "Yandex Browser"
        };
        t.PLATFORMS_MAP = {
          tablet: "tablet",
          mobile: "mobile",
          desktop: "desktop",
          tv: "tv"
        };
        t.OS_MAP = {
          WindowsPhone: "Windows Phone",
          Windows: "Windows",
          MacOS: "macOS",
          iOS: "iOS",
          Android: "Android",
          WebOS: "WebOS",
          BlackBerry: "BlackBerry",
          Bada: "Bada",
          Tizen: "Tizen",
          Linux: "Linux",
          ChromeOS: "Chrome OS",
          PlayStation4: "PlayStation 4",
          Roku: "Roku"
        };
        t.ENGINE_MAP = {
          EdgeHTML: "EdgeHTML",
          Blink: "Blink",
          Trident: "Trident",
          Presto: "Presto",
          Gecko: "Gecko",
          WebKit: "WebKit"
        };
      },
      90: function (e, t, r) {

        t.__esModule = !0, t.default = void 0;
        var n,
            i = (n = r(91)) && n.__esModule ? n : {
          default: n
        },
            s = r(18);

        function a(e, t) {
          for (var r = 0; r < t.length; r++) {
            var n = t[r];
            n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
          }
        }

        var o = function () {
          function e() {}

          var t, r, n;
          return e.getParser = function (e, t) {
            if (void 0 === t && (t = !1), "string" != typeof e) throw new Error("UserAgent should be a string");
            return new i.default(e, t);
          }, e.parse = function (e) {
            return new i.default(e).getResult();
          }, t = e, n = [{
            key: "BROWSER_MAP",
            get: function () {
              return s.BROWSER_MAP;
            }
          }, {
            key: "ENGINE_MAP",
            get: function () {
              return s.ENGINE_MAP;
            }
          }, {
            key: "OS_MAP",
            get: function () {
              return s.OS_MAP;
            }
          }, {
            key: "PLATFORMS_MAP",
            get: function () {
              return s.PLATFORMS_MAP;
            }
          }], (r = null) && a(t.prototype, r), n && a(t, n), e;
        }();

        t.default = o, e.exports = t.default;
      },
      91: function (e, t, r) {

        t.__esModule = !0, t.default = void 0;
        var n = u(r(92)),
            i = u(r(93)),
            s = u(r(94)),
            a = u(r(95)),
            o = u(r(17));

        function u(e) {
          return e && e.__esModule ? e : {
            default: e
          };
        }

        var d = function () {
          function e(e, t) {
            if (void 0 === t && (t = !1), null == e || "" === e) throw new Error("UserAgent parameter can't be empty");
            this._ua = e, this.parsedResult = {}, !0 !== t && this.parse();
          }

          var t = e.prototype;
          return t.getUA = function () {
            return this._ua;
          }, t.test = function (e) {
            return e.test(this._ua);
          }, t.parseBrowser = function () {
            var e = this;
            this.parsedResult.browser = {};
            var t = o.default.find(n.default, function (t) {
              if ("function" == typeof t.test) return t.test(e);
              if (t.test instanceof Array) return t.test.some(function (t) {
                return e.test(t);
              });
              throw new Error("Browser's test function is not valid");
            });
            return t && (this.parsedResult.browser = t.describe(this.getUA())), this.parsedResult.browser;
          }, t.getBrowser = function () {
            return this.parsedResult.browser ? this.parsedResult.browser : this.parseBrowser();
          }, t.getBrowserName = function (e) {
            return e ? String(this.getBrowser().name).toLowerCase() || "" : this.getBrowser().name || "";
          }, t.getBrowserVersion = function () {
            return this.getBrowser().version;
          }, t.getOS = function () {
            return this.parsedResult.os ? this.parsedResult.os : this.parseOS();
          }, t.parseOS = function () {
            var e = this;
            this.parsedResult.os = {};
            var t = o.default.find(i.default, function (t) {
              if ("function" == typeof t.test) return t.test(e);
              if (t.test instanceof Array) return t.test.some(function (t) {
                return e.test(t);
              });
              throw new Error("Browser's test function is not valid");
            });
            return t && (this.parsedResult.os = t.describe(this.getUA())), this.parsedResult.os;
          }, t.getOSName = function (e) {
            var t = this.getOS().name;
            return e ? String(t).toLowerCase() || "" : t || "";
          }, t.getOSVersion = function () {
            return this.getOS().version;
          }, t.getPlatform = function () {
            return this.parsedResult.platform ? this.parsedResult.platform : this.parsePlatform();
          }, t.getPlatformType = function (e) {
            void 0 === e && (e = !1);
            var t = this.getPlatform().type;
            return e ? String(t).toLowerCase() || "" : t || "";
          }, t.parsePlatform = function () {
            var e = this;
            this.parsedResult.platform = {};
            var t = o.default.find(s.default, function (t) {
              if ("function" == typeof t.test) return t.test(e);
              if (t.test instanceof Array) return t.test.some(function (t) {
                return e.test(t);
              });
              throw new Error("Browser's test function is not valid");
            });
            return t && (this.parsedResult.platform = t.describe(this.getUA())), this.parsedResult.platform;
          }, t.getEngine = function () {
            return this.parsedResult.engine ? this.parsedResult.engine : this.parseEngine();
          }, t.getEngineName = function (e) {
            return e ? String(this.getEngine().name).toLowerCase() || "" : this.getEngine().name || "";
          }, t.parseEngine = function () {
            var e = this;
            this.parsedResult.engine = {};
            var t = o.default.find(a.default, function (t) {
              if ("function" == typeof t.test) return t.test(e);
              if (t.test instanceof Array) return t.test.some(function (t) {
                return e.test(t);
              });
              throw new Error("Browser's test function is not valid");
            });
            return t && (this.parsedResult.engine = t.describe(this.getUA())), this.parsedResult.engine;
          }, t.parse = function () {
            return this.parseBrowser(), this.parseOS(), this.parsePlatform(), this.parseEngine(), this;
          }, t.getResult = function () {
            return o.default.assign({}, this.parsedResult);
          }, t.satisfies = function (e) {
            var t = this,
                r = {},
                n = 0,
                i = {},
                s = 0;

            if (Object.keys(e).forEach(function (t) {
              var a = e[t];
              "string" == typeof a ? (i[t] = a, s += 1) : "object" == typeof a && (r[t] = a, n += 1);
            }), n > 0) {
              var a = Object.keys(r),
                  u = o.default.find(a, function (e) {
                return t.isOS(e);
              });

              if (u) {
                var d = this.satisfies(r[u]);
                if (void 0 !== d) return d;
              }

              var c = o.default.find(a, function (e) {
                return t.isPlatform(e);
              });

              if (c) {
                var f = this.satisfies(r[c]);
                if (void 0 !== f) return f;
              }
            }

            if (s > 0) {
              var l = Object.keys(i),
                  h = o.default.find(l, function (e) {
                return t.isBrowser(e, !0);
              });
              if (void 0 !== h) return this.compareVersion(i[h]);
            }
          }, t.isBrowser = function (e, t) {
            void 0 === t && (t = !1);
            var r = this.getBrowserName().toLowerCase(),
                n = e.toLowerCase(),
                i = o.default.getBrowserTypeByAlias(n);
            return t && i && (n = i.toLowerCase()), n === r;
          }, t.compareVersion = function (e) {
            var t = [0],
                r = e,
                n = !1,
                i = this.getBrowserVersion();
            if ("string" == typeof i) return ">" === e[0] || "<" === e[0] ? (r = e.substr(1), "=" === e[1] ? (n = !0, r = e.substr(2)) : t = [], ">" === e[0] ? t.push(1) : t.push(-1)) : "=" === e[0] ? r = e.substr(1) : "~" === e[0] && (n = !0, r = e.substr(1)), t.indexOf(o.default.compareVersions(i, r, n)) > -1;
          }, t.isOS = function (e) {
            return this.getOSName(!0) === String(e).toLowerCase();
          }, t.isPlatform = function (e) {
            return this.getPlatformType(!0) === String(e).toLowerCase();
          }, t.isEngine = function (e) {
            return this.getEngineName(!0) === String(e).toLowerCase();
          }, t.is = function (e) {
            return this.isBrowser(e) || this.isOS(e) || this.isPlatform(e);
          }, t.some = function (e) {
            var t = this;
            return void 0 === e && (e = []), e.some(function (e) {
              return t.is(e);
            });
          }, e;
        }();

        t.default = d, e.exports = t.default;
      },
      92: function (e, t, r) {

        t.__esModule = !0, t.default = void 0;
        var n,
            i = (n = r(17)) && n.__esModule ? n : {
          default: n
        };
        var s = /version\/(\d+(\.?_?\d+)+)/i,
            a = [{
          test: [/googlebot/i],
          describe: function (e) {
            var t = {
              name: "Googlebot"
            },
                r = i.default.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, e) || i.default.getFirstMatch(s, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/opera/i],
          describe: function (e) {
            var t = {
              name: "Opera"
            },
                r = i.default.getFirstMatch(s, e) || i.default.getFirstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/opr\/|opios/i],
          describe: function (e) {
            var t = {
              name: "Opera"
            },
                r = i.default.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, e) || i.default.getFirstMatch(s, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/SamsungBrowser/i],
          describe: function (e) {
            var t = {
              name: "Samsung Internet for Android"
            },
                r = i.default.getFirstMatch(s, e) || i.default.getFirstMatch(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/Whale/i],
          describe: function (e) {
            var t = {
              name: "NAVER Whale Browser"
            },
                r = i.default.getFirstMatch(s, e) || i.default.getFirstMatch(/(?:whale)[\s/](\d+(?:\.\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/MZBrowser/i],
          describe: function (e) {
            var t = {
              name: "MZ Browser"
            },
                r = i.default.getFirstMatch(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i, e) || i.default.getFirstMatch(s, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/focus/i],
          describe: function (e) {
            var t = {
              name: "Focus"
            },
                r = i.default.getFirstMatch(/(?:focus)[\s/](\d+(?:\.\d+)+)/i, e) || i.default.getFirstMatch(s, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/swing/i],
          describe: function (e) {
            var t = {
              name: "Swing"
            },
                r = i.default.getFirstMatch(/(?:swing)[\s/](\d+(?:\.\d+)+)/i, e) || i.default.getFirstMatch(s, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/coast/i],
          describe: function (e) {
            var t = {
              name: "Opera Coast"
            },
                r = i.default.getFirstMatch(s, e) || i.default.getFirstMatch(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/opt\/\d+(?:.?_?\d+)+/i],
          describe: function (e) {
            var t = {
              name: "Opera Touch"
            },
                r = i.default.getFirstMatch(/(?:opt)[\s/](\d+(\.?_?\d+)+)/i, e) || i.default.getFirstMatch(s, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/yabrowser/i],
          describe: function (e) {
            var t = {
              name: "Yandex Browser"
            },
                r = i.default.getFirstMatch(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i, e) || i.default.getFirstMatch(s, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/ucbrowser/i],
          describe: function (e) {
            var t = {
              name: "UC Browser"
            },
                r = i.default.getFirstMatch(s, e) || i.default.getFirstMatch(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/Maxthon|mxios/i],
          describe: function (e) {
            var t = {
              name: "Maxthon"
            },
                r = i.default.getFirstMatch(s, e) || i.default.getFirstMatch(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/epiphany/i],
          describe: function (e) {
            var t = {
              name: "Epiphany"
            },
                r = i.default.getFirstMatch(s, e) || i.default.getFirstMatch(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/puffin/i],
          describe: function (e) {
            var t = {
              name: "Puffin"
            },
                r = i.default.getFirstMatch(s, e) || i.default.getFirstMatch(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/sleipnir/i],
          describe: function (e) {
            var t = {
              name: "Sleipnir"
            },
                r = i.default.getFirstMatch(s, e) || i.default.getFirstMatch(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/k-meleon/i],
          describe: function (e) {
            var t = {
              name: "K-Meleon"
            },
                r = i.default.getFirstMatch(s, e) || i.default.getFirstMatch(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/micromessenger/i],
          describe: function (e) {
            var t = {
              name: "WeChat"
            },
                r = i.default.getFirstMatch(/(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i, e) || i.default.getFirstMatch(s, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/qqbrowser/i],
          describe: function (e) {
            var t = {
              name: /qqbrowserlite/i.test(e) ? "QQ Browser Lite" : "QQ Browser"
            },
                r = i.default.getFirstMatch(/(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i, e) || i.default.getFirstMatch(s, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/msie|trident/i],
          describe: function (e) {
            var t = {
              name: "Internet Explorer"
            },
                r = i.default.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/\sedg\//i],
          describe: function (e) {
            var t = {
              name: "Microsoft Edge"
            },
                r = i.default.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/edg([ea]|ios)/i],
          describe: function (e) {
            var t = {
              name: "Microsoft Edge"
            },
                r = i.default.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/vivaldi/i],
          describe: function (e) {
            var t = {
              name: "Vivaldi"
            },
                r = i.default.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/seamonkey/i],
          describe: function (e) {
            var t = {
              name: "SeaMonkey"
            },
                r = i.default.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/sailfish/i],
          describe: function (e) {
            var t = {
              name: "Sailfish"
            },
                r = i.default.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/silk/i],
          describe: function (e) {
            var t = {
              name: "Amazon Silk"
            },
                r = i.default.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/phantom/i],
          describe: function (e) {
            var t = {
              name: "PhantomJS"
            },
                r = i.default.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/slimerjs/i],
          describe: function (e) {
            var t = {
              name: "SlimerJS"
            },
                r = i.default.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
          describe: function (e) {
            var t = {
              name: "BlackBerry"
            },
                r = i.default.getFirstMatch(s, e) || i.default.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/(web|hpw)[o0]s/i],
          describe: function (e) {
            var t = {
              name: "WebOS Browser"
            },
                r = i.default.getFirstMatch(s, e) || i.default.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/bada/i],
          describe: function (e) {
            var t = {
              name: "Bada"
            },
                r = i.default.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/tizen/i],
          describe: function (e) {
            var t = {
              name: "Tizen"
            },
                r = i.default.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i, e) || i.default.getFirstMatch(s, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/qupzilla/i],
          describe: function (e) {
            var t = {
              name: "QupZilla"
            },
                r = i.default.getFirstMatch(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i, e) || i.default.getFirstMatch(s, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/firefox|iceweasel|fxios/i],
          describe: function (e) {
            var t = {
              name: "Firefox"
            },
                r = i.default.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/electron/i],
          describe: function (e) {
            var t = {
              name: "Electron"
            },
                r = i.default.getFirstMatch(/(?:electron)\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/chromium/i],
          describe: function (e) {
            var t = {
              name: "Chromium"
            },
                r = i.default.getFirstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, e) || i.default.getFirstMatch(s, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/chrome|crios|crmo/i],
          describe: function (e) {
            var t = {
              name: "Chrome"
            },
                r = i.default.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/GSA/i],
          describe: function (e) {
            var t = {
              name: "Google Search"
            },
                r = i.default.getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: function (e) {
            var t = !e.test(/like android/i),
                r = e.test(/android/i);
            return t && r;
          },
          describe: function (e) {
            var t = {
              name: "Android Browser"
            },
                r = i.default.getFirstMatch(s, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/playstation 4/i],
          describe: function (e) {
            var t = {
              name: "PlayStation 4"
            },
                r = i.default.getFirstMatch(s, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/safari|applewebkit/i],
          describe: function (e) {
            var t = {
              name: "Safari"
            },
                r = i.default.getFirstMatch(s, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/.*/i],
          describe: function (e) {
            var t = -1 !== e.search("\\(") ? /^(.*)\/(.*)[ \t]\((.*)/ : /^(.*)\/(.*) /;
            return {
              name: i.default.getFirstMatch(t, e),
              version: i.default.getSecondMatch(t, e)
            };
          }
        }];
        t.default = a, e.exports = t.default;
      },
      93: function (e, t, r) {

        t.__esModule = !0, t.default = void 0;
        var n,
            i = (n = r(17)) && n.__esModule ? n : {
          default: n
        },
            s = r(18);
        var a = [{
          test: [/Roku\/DVP/],
          describe: function (e) {
            var t = i.default.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, e);
            return {
              name: s.OS_MAP.Roku,
              version: t
            };
          }
        }, {
          test: [/windows phone/i],
          describe: function (e) {
            var t = i.default.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i, e);
            return {
              name: s.OS_MAP.WindowsPhone,
              version: t
            };
          }
        }, {
          test: [/windows /i],
          describe: function (e) {
            var t = i.default.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i, e),
                r = i.default.getWindowsVersionName(t);
            return {
              name: s.OS_MAP.Windows,
              version: t,
              versionName: r
            };
          }
        }, {
          test: [/Macintosh(.*?) FxiOS(.*?)\//],
          describe: function (e) {
            var t = {
              name: s.OS_MAP.iOS
            },
                r = i.default.getSecondMatch(/(Version\/)(\d[\d.]+)/, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/macintosh/i],
          describe: function (e) {
            var t = i.default.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, e).replace(/[_\s]/g, "."),
                r = i.default.getMacOSVersionName(t),
                n = {
              name: s.OS_MAP.MacOS,
              version: t
            };
            return r && (n.versionName = r), n;
          }
        }, {
          test: [/(ipod|iphone|ipad)/i],
          describe: function (e) {
            var t = i.default.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, e).replace(/[_\s]/g, ".");
            return {
              name: s.OS_MAP.iOS,
              version: t
            };
          }
        }, {
          test: function (e) {
            var t = !e.test(/like android/i),
                r = e.test(/android/i);
            return t && r;
          },
          describe: function (e) {
            var t = i.default.getFirstMatch(/android[\s/-](\d+(\.\d+)*)/i, e),
                r = i.default.getAndroidVersionName(t),
                n = {
              name: s.OS_MAP.Android,
              version: t
            };
            return r && (n.versionName = r), n;
          }
        }, {
          test: [/(web|hpw)[o0]s/i],
          describe: function (e) {
            var t = i.default.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i, e),
                r = {
              name: s.OS_MAP.WebOS
            };
            return t && t.length && (r.version = t), r;
          }
        }, {
          test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
          describe: function (e) {
            var t = i.default.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i, e) || i.default.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i, e) || i.default.getFirstMatch(/\bbb(\d+)/i, e);
            return {
              name: s.OS_MAP.BlackBerry,
              version: t
            };
          }
        }, {
          test: [/bada/i],
          describe: function (e) {
            var t = i.default.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, e);
            return {
              name: s.OS_MAP.Bada,
              version: t
            };
          }
        }, {
          test: [/tizen/i],
          describe: function (e) {
            var t = i.default.getFirstMatch(/tizen[/\s](\d+(\.\d+)*)/i, e);
            return {
              name: s.OS_MAP.Tizen,
              version: t
            };
          }
        }, {
          test: [/linux/i],
          describe: function () {
            return {
              name: s.OS_MAP.Linux
            };
          }
        }, {
          test: [/CrOS/],
          describe: function () {
            return {
              name: s.OS_MAP.ChromeOS
            };
          }
        }, {
          test: [/PlayStation 4/],
          describe: function (e) {
            var t = i.default.getFirstMatch(/PlayStation 4[/\s](\d+(\.\d+)*)/i, e);
            return {
              name: s.OS_MAP.PlayStation4,
              version: t
            };
          }
        }];
        t.default = a, e.exports = t.default;
      },
      94: function (e, t, r) {

        t.__esModule = !0, t.default = void 0;
        var n,
            i = (n = r(17)) && n.__esModule ? n : {
          default: n
        },
            s = r(18);
        var a = [{
          test: [/googlebot/i],
          describe: function () {
            return {
              type: "bot",
              vendor: "Google"
            };
          }
        }, {
          test: [/huawei/i],
          describe: function (e) {
            var t = i.default.getFirstMatch(/(can-l01)/i, e) && "Nova",
                r = {
              type: s.PLATFORMS_MAP.mobile,
              vendor: "Huawei"
            };
            return t && (r.model = t), r;
          }
        }, {
          test: [/nexus\s*(?:7|8|9|10).*/i],
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.tablet,
              vendor: "Nexus"
            };
          }
        }, {
          test: [/ipad/i],
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.tablet,
              vendor: "Apple",
              model: "iPad"
            };
          }
        }, {
          test: [/Macintosh(.*?) FxiOS(.*?)\//],
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.tablet,
              vendor: "Apple",
              model: "iPad"
            };
          }
        }, {
          test: [/kftt build/i],
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.tablet,
              vendor: "Amazon",
              model: "Kindle Fire HD 7"
            };
          }
        }, {
          test: [/silk/i],
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.tablet,
              vendor: "Amazon"
            };
          }
        }, {
          test: [/tablet(?! pc)/i],
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.tablet
            };
          }
        }, {
          test: function (e) {
            var t = e.test(/ipod|iphone/i),
                r = e.test(/like (ipod|iphone)/i);
            return t && !r;
          },
          describe: function (e) {
            var t = i.default.getFirstMatch(/(ipod|iphone)/i, e);
            return {
              type: s.PLATFORMS_MAP.mobile,
              vendor: "Apple",
              model: t
            };
          }
        }, {
          test: [/nexus\s*[0-6].*/i, /galaxy nexus/i],
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.mobile,
              vendor: "Nexus"
            };
          }
        }, {
          test: [/[^-]mobi/i],
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.mobile
            };
          }
        }, {
          test: function (e) {
            return "blackberry" === e.getBrowserName(!0);
          },
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.mobile,
              vendor: "BlackBerry"
            };
          }
        }, {
          test: function (e) {
            return "bada" === e.getBrowserName(!0);
          },
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.mobile
            };
          }
        }, {
          test: function (e) {
            return "windows phone" === e.getBrowserName();
          },
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.mobile,
              vendor: "Microsoft"
            };
          }
        }, {
          test: function (e) {
            var t = Number(String(e.getOSVersion()).split(".")[0]);
            return "android" === e.getOSName(!0) && t >= 3;
          },
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.tablet
            };
          }
        }, {
          test: function (e) {
            return "android" === e.getOSName(!0);
          },
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.mobile
            };
          }
        }, {
          test: function (e) {
            return "macos" === e.getOSName(!0);
          },
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.desktop,
              vendor: "Apple"
            };
          }
        }, {
          test: function (e) {
            return "windows" === e.getOSName(!0);
          },
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.desktop
            };
          }
        }, {
          test: function (e) {
            return "linux" === e.getOSName(!0);
          },
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.desktop
            };
          }
        }, {
          test: function (e) {
            return "playstation 4" === e.getOSName(!0);
          },
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.tv
            };
          }
        }, {
          test: function (e) {
            return "roku" === e.getOSName(!0);
          },
          describe: function () {
            return {
              type: s.PLATFORMS_MAP.tv
            };
          }
        }];
        t.default = a, e.exports = t.default;
      },
      95: function (e, t, r) {

        t.__esModule = !0, t.default = void 0;
        var n,
            i = (n = r(17)) && n.__esModule ? n : {
          default: n
        },
            s = r(18);
        var a = [{
          test: function (e) {
            return "microsoft edge" === e.getBrowserName(!0);
          },
          describe: function (e) {
            if (/\sedg\//i.test(e)) return {
              name: s.ENGINE_MAP.Blink
            };
            var t = i.default.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, e);
            return {
              name: s.ENGINE_MAP.EdgeHTML,
              version: t
            };
          }
        }, {
          test: [/trident/i],
          describe: function (e) {
            var t = {
              name: s.ENGINE_MAP.Trident
            },
                r = i.default.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: function (e) {
            return e.test(/presto/i);
          },
          describe: function (e) {
            var t = {
              name: s.ENGINE_MAP.Presto
            },
                r = i.default.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: function (e) {
            var t = e.test(/gecko/i),
                r = e.test(/like gecko/i);
            return t && !r;
          },
          describe: function (e) {
            var t = {
              name: s.ENGINE_MAP.Gecko
            },
                r = i.default.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }, {
          test: [/(apple)?webkit\/537\.36/i],
          describe: function () {
            return {
              name: s.ENGINE_MAP.Blink
            };
          }
        }, {
          test: [/(apple)?webkit/i],
          describe: function (e) {
            var t = {
              name: s.ENGINE_MAP.WebKit
            },
                r = i.default.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, e);
            return r && (t.version = r), t;
          }
        }];
        t.default = a, e.exports = t.default;
      }
    });
  });
});

var Logger_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const APP_NAME = 'mediasoup-client';

  class Logger {
    constructor(prefix) {
      if (prefix) {
        this._debug = browser$2.default(`${APP_NAME}:${prefix}`);
        this._warn = browser$2.default(`${APP_NAME}:WARN:${prefix}`);
        this._error = browser$2.default(`${APP_NAME}:ERROR:${prefix}`);
      } else {
        this._debug = browser$2.default(APP_NAME);
        this._warn = browser$2.default(`${APP_NAME}:WARN`);
        this._error = browser$2.default(`${APP_NAME}:ERROR`);
      }
      /* eslint-disable no-console */


      this._debug.log = console.info.bind(console);
      this._warn.log = console.warn.bind(console);
      this._error.log = console.error.bind(console);
      /* eslint-enable no-console */
    }

    get debug() {
      return this._debug;
    }

    get warn() {
      return this._warn;
    }

    get error() {
      return this._error;
    }

  }

  exports.Logger = Logger;
});

var errors = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /**
   * Error indicating not support for something.
   */

  class UnsupportedError extends Error {
    constructor(message) {
      super(message);
      this.name = 'UnsupportedError';

      if (Error.hasOwnProperty('captureStackTrace')) // Just in V8.
        {
          // @ts-ignore
          Error.captureStackTrace(this, UnsupportedError);
        } else {
        this.stack = new Error(message).stack;
      }
    }

  }

  exports.UnsupportedError = UnsupportedError;
  /**
   * Error produced when calling a method in an invalid state.
   */

  class InvalidStateError extends Error {
    constructor(message) {
      super(message);
      this.name = 'InvalidStateError';

      if (Error.hasOwnProperty('captureStackTrace')) // Just in V8.
        {
          // @ts-ignore
          Error.captureStackTrace(this, InvalidStateError);
        } else {
        this.stack = new Error(message).stack;
      }
    }

  }

  exports.InvalidStateError = InvalidStateError;
});

var h264ProfileLevelId = createCommonjsModule(function (module, exports) {
  const debug = browser$2('h264-profile-level-id');
  /* eslint-disable no-console */

  debug.log = console.info.bind(console);
  /* eslint-enable no-console */

  const ProfileConstrainedBaseline = 1;
  const ProfileBaseline = 2;
  const ProfileMain = 3;
  const ProfileConstrainedHigh = 4;
  const ProfileHigh = 5;
  exports.ProfileConstrainedBaseline = ProfileConstrainedBaseline;
  exports.ProfileBaseline = ProfileBaseline;
  exports.ProfileMain = ProfileMain;
  exports.ProfileConstrainedHigh = ProfileConstrainedHigh;
  exports.ProfileHigh = ProfileHigh; // All values are equal to ten times the level number, except level 1b which is
  // special.

  const Level1_b = 0;
  const Level1 = 10;
  const Level1_1 = 11;
  const Level1_2 = 12;
  const Level1_3 = 13;
  const Level2 = 20;
  const Level2_1 = 21;
  const Level2_2 = 22;
  const Level3 = 30;
  const Level3_1 = 31;
  const Level3_2 = 32;
  const Level4 = 40;
  const Level4_1 = 41;
  const Level4_2 = 42;
  const Level5 = 50;
  const Level5_1 = 51;
  const Level5_2 = 52;
  exports.Level1_b = Level1_b;
  exports.Level1 = Level1;
  exports.Level1_1 = Level1_1;
  exports.Level1_2 = Level1_2;
  exports.Level1_3 = Level1_3;
  exports.Level2 = Level2;
  exports.Level2_1 = Level2_1;
  exports.Level2_2 = Level2_2;
  exports.Level3 = Level3;
  exports.Level3_1 = Level3_1;
  exports.Level3_2 = Level3_2;
  exports.Level4 = Level4;
  exports.Level4_1 = Level4_1;
  exports.Level4_2 = Level4_2;
  exports.Level5 = Level5;
  exports.Level5_1 = Level5_1;
  exports.Level5_2 = Level5_2;

  class ProfileLevelId {
    constructor(profile, level) {
      this.profile = profile;
      this.level = level;
    }

  }

  exports.ProfileLevelId = ProfileLevelId; // Default ProfileLevelId.
  //
  // TODO: The default should really be profile Baseline and level 1 according to
  // the spec: https://tools.ietf.org/html/rfc6184#section-8.1. In order to not
  // break backwards compatibility with older versions of WebRTC where external
  // codecs don't have any parameters, use profile ConstrainedBaseline level 3_1
  // instead. This workaround will only be done in an interim period to allow
  // external clients to update their code.
  //
  // http://crbug/webrtc/6337.

  const DefaultProfileLevelId = new ProfileLevelId(ProfileConstrainedBaseline, Level3_1); // For level_idc=11 and profile_idc=0x42, 0x4D, or 0x58, the constraint set3
  // flag specifies if level 1b or level 1.1 is used.

  const ConstraintSet3Flag = 0x10; // Class for matching bit patterns such as "x1xx0000" where 'x' is allowed to be
  // either 0 or 1.

  class BitPattern {
    constructor(str) {
      this._mask = ~byteMaskString('x', str);
      this._maskedValue = byteMaskString('1', str);
    }

    isMatch(value) {
      return this._maskedValue === (value & this._mask);
    }

  } // Class for converting between profile_idc/profile_iop to Profile.


  class ProfilePattern {
    constructor(profile_idc, profile_iop, profile) {
      this.profile_idc = profile_idc;
      this.profile_iop = profile_iop;
      this.profile = profile;
    }

  } // This is from https://tools.ietf.org/html/rfc6184#section-8.1.


  const ProfilePatterns = [new ProfilePattern(0x42, new BitPattern('x1xx0000'), ProfileConstrainedBaseline), new ProfilePattern(0x4D, new BitPattern('1xxx0000'), ProfileConstrainedBaseline), new ProfilePattern(0x58, new BitPattern('11xx0000'), ProfileConstrainedBaseline), new ProfilePattern(0x42, new BitPattern('x0xx0000'), ProfileBaseline), new ProfilePattern(0x58, new BitPattern('10xx0000'), ProfileBaseline), new ProfilePattern(0x4D, new BitPattern('0x0x0000'), ProfileMain), new ProfilePattern(0x64, new BitPattern('00000000'), ProfileHigh), new ProfilePattern(0x64, new BitPattern('00001100'), ProfileConstrainedHigh)];
  /**
   * Parse profile level id that is represented as a string of 3 hex bytes.
   * Nothing will be returned if the string is not a recognized H264 profile
   * level id.
   *
   * @param {String} str - profile-level-id value as a string of 3 hex bytes.
   *
   * @returns {ProfileLevelId}
   */

  exports.parseProfileLevelId = function (str) {
    // The string should consist of 3 bytes in hexadecimal format.
    if (typeof str !== 'string' || str.length !== 6) return null;
    const profile_level_id_numeric = parseInt(str, 16);
    if (profile_level_id_numeric === 0) return null; // Separate into three bytes.

    const level_idc = profile_level_id_numeric & 0xFF;
    const profile_iop = profile_level_id_numeric >> 8 & 0xFF;
    const profile_idc = profile_level_id_numeric >> 16 & 0xFF; // Parse level based on level_idc and constraint set 3 flag.

    let level;

    switch (level_idc) {
      case Level1_1:
        {
          level = (profile_iop & ConstraintSet3Flag) !== 0 ? Level1_b : Level1_1;
          break;
        }

      case Level1:
      case Level1_2:
      case Level1_3:
      case Level2:
      case Level2_1:
      case Level2_2:
      case Level3:
      case Level3_1:
      case Level3_2:
      case Level4:
      case Level4_1:
      case Level4_2:
      case Level5:
      case Level5_1:
      case Level5_2:
        {
          level = level_idc;
          break;
        }
      // Unrecognized level_idc.

      default:
        {
          debug('parseProfileLevelId() | unrecognized level_idc:%s', level_idc);
          return null;
        }
    } // Parse profile_idc/profile_iop into a Profile enum.


    for (const pattern of ProfilePatterns) {
      if (profile_idc === pattern.profile_idc && pattern.profile_iop.isMatch(profile_iop)) {
        return new ProfileLevelId(pattern.profile, level);
      }
    }

    debug('parseProfileLevelId() | unrecognized profile_idc/profile_iop combination');
    return null;
  };
  /**
   * Returns canonical string representation as three hex bytes of the profile
   * level id, or returns nothing for invalid profile level ids.
   *
   * @param {ProfileLevelId} profile_level_id
   *
   * @returns {String}
   */


  exports.profileLevelIdToString = function (profile_level_id) {
    // Handle special case level == 1b.
    if (profile_level_id.level == Level1_b) {
      switch (profile_level_id.profile) {
        case ProfileConstrainedBaseline:
          {
            return '42f00b';
          }

        case ProfileBaseline:
          {
            return '42100b';
          }

        case ProfileMain:
          {
            return '4d100b';
          }
        // Level 1_b is not allowed for other profiles.

        default:
          {
            debug('profileLevelIdToString() | Level 1_b not is allowed for profile:%s', profile_level_id.profile);
            return null;
          }
      }
    }

    let profile_idc_iop_string;

    switch (profile_level_id.profile) {
      case ProfileConstrainedBaseline:
        {
          profile_idc_iop_string = '42e0';
          break;
        }

      case ProfileBaseline:
        {
          profile_idc_iop_string = '4200';
          break;
        }

      case ProfileMain:
        {
          profile_idc_iop_string = '4d00';
          break;
        }

      case ProfileConstrainedHigh:
        {
          profile_idc_iop_string = '640c';
          break;
        }

      case ProfileHigh:
        {
          profile_idc_iop_string = '6400';
          break;
        }

      default:
        {
          debug('profileLevelIdToString() | unrecognized profile:%s', profile_level_id.profile);
          return null;
        }
    }

    let levelStr = profile_level_id.level.toString(16);
    if (levelStr.length === 1) levelStr = `0${levelStr}`;
    return `${profile_idc_iop_string}${levelStr}`;
  };
  /**
   * Parse profile level id that is represented as a string of 3 hex bytes
   * contained in an SDP key-value map. A default profile level id will be
   * returned if the profile-level-id key is missing. Nothing will be returned if
   * the key is present but the string is invalid.
   *
   * @param {Object} [params={}] - Codec parameters object.
   *
   * @returns {ProfileLevelId}
   */


  exports.parseSdpProfileLevelId = function (params = {}) {
    const profile_level_id = params['profile-level-id'];
    return !profile_level_id ? DefaultProfileLevelId : exports.parseProfileLevelId(profile_level_id);
  };
  /**
   * Returns true if the parameters have the same H264 profile, i.e. the same
   * H264 profile (Baseline, High, etc).
   *
   * @param {Object} [params1={}] - Codec parameters object.
   * @param {Object} [params2={}] - Codec parameters object.
   *
   * @returns {Boolean}
   */


  exports.isSameProfile = function (params1 = {}, params2 = {}) {
    const profile_level_id_1 = exports.parseSdpProfileLevelId(params1);
    const profile_level_id_2 = exports.parseSdpProfileLevelId(params2); // Compare H264 profiles, but not levels.

    return Boolean(profile_level_id_1 && profile_level_id_2 && profile_level_id_1.profile === profile_level_id_2.profile);
  };
  /**
   * Generate codec parameters that will be used as answer in an SDP negotiation
   * based on local supported parameters and remote offered parameters. Both
   * local_supported_params and remote_offered_params represent sendrecv media
   * descriptions, i.e they are a mix of both encode and decode capabilities. In
   * theory, when the profile in local_supported_params represent a strict superset
   * of the profile in remote_offered_params, we could limit the profile in the
   * answer to the profile in remote_offered_params.
   *
   * However, to simplify the code, each supported H264 profile should be listed
   * explicitly in the list of local supported codecs, even if they are redundant.
   * Then each local codec in the list should be tested one at a time against the
   * remote codec, and only when the profiles are equal should this function be
   * called. Therefore, this function does not need to handle profile intersection,
   * and the profile of local_supported_params and remote_offered_params must be
   * equal before calling this function. The parameters that are used when
   * negotiating are the level part of profile-level-id and level-asymmetry-allowed.
   *
   * @param {Object} [local_supported_params={}]
   * @param {Object} [remote_offered_params={}]
   *
   * @returns {String} Canonical string representation as three hex bytes of the
   *   profile level id, or null if no one of the params have profile-level-id.
   *
   * @throws {TypeError} If Profile mismatch or invalid params.
   */


  exports.generateProfileLevelIdForAnswer = function (local_supported_params = {}, remote_offered_params = {}) {
    // If both local and remote params do not contain profile-level-id, they are
    // both using the default profile. In this case, don't return anything.
    if (!local_supported_params['profile-level-id'] && !remote_offered_params['profile-level-id']) {
      debug('generateProfileLevelIdForAnswer() | no profile-level-id in local and remote params');
      return null;
    } // Parse profile-level-ids.


    const local_profile_level_id = exports.parseSdpProfileLevelId(local_supported_params);
    const remote_profile_level_id = exports.parseSdpProfileLevelId(remote_offered_params); // The local and remote codec must have valid and equal H264 Profiles.

    if (!local_profile_level_id) throw new TypeError('invalid local_profile_level_id');
    if (!remote_profile_level_id) throw new TypeError('invalid remote_profile_level_id');
    if (local_profile_level_id.profile !== remote_profile_level_id.profile) throw new TypeError('H264 Profile mismatch'); // Parse level information.

    const level_asymmetry_allowed = isLevelAsymmetryAllowed(local_supported_params) && isLevelAsymmetryAllowed(remote_offered_params);
    const local_level = local_profile_level_id.level;
    const remote_level = remote_profile_level_id.level;
    const min_level = minLevel(local_level, remote_level); // Determine answer level. When level asymmetry is not allowed, level upgrade
    // is not allowed, i.e., the level in the answer must be equal to or lower
    // than the level in the offer.

    const answer_level = level_asymmetry_allowed ? local_level : min_level;
    debug('generateProfileLevelIdForAnswer() | result: [profile:%s, level:%s]', local_profile_level_id.profile, answer_level); // Return the resulting profile-level-id for the answer parameters.

    return exports.profileLevelIdToString(new ProfileLevelId(local_profile_level_id.profile, answer_level));
  }; // Convert a string of 8 characters into a byte where the positions containing
  // character c will have their bit set. For example, c = 'x', str = "x1xx0000"
  // will return 0b10110000.


  function byteMaskString(c, str) {
    return (str[0] === c) << 7 | (str[1] === c) << 6 | (str[2] === c) << 5 | (str[3] === c) << 4 | (str[4] === c) << 3 | (str[5] === c) << 2 | (str[6] === c) << 1 | (str[7] === c) << 0;
  } // Compare H264 levels and handle the level 1b case.


  function isLessLevel(a, b) {
    if (a === Level1_b) return b !== Level1 && b !== Level1_b;
    if (b === Level1_b) return a !== Level1;
    return a < b;
  }

  function minLevel(a, b) {
    return isLessLevel(a, b) ? a : b;
  }

  function isLevelAsymmetryAllowed(params = {}) {
    const level_asymmetry_allowed = params['level-asymmetry-allowed'];
    return level_asymmetry_allowed === 1 || level_asymmetry_allowed === '1';
  }
});

var utils = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /**
   * Clones the given object/array.
   *
   * @param {Object|Array} obj
   *
   * @returns {Object|Array}
   */

  function clone(data) {
    if (typeof data !== 'object') return {};
    return JSON.parse(JSON.stringify(data));
  }

  exports.clone = clone;
  /**
   * Generates a random positive integer.
   */

  function generateRandomNumber() {
    return Math.round(Math.random() * 10000000);
  }

  exports.generateRandomNumber = generateRandomNumber;
});

var ortc = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const RTP_PROBATOR_MID = 'probator';
  const RTP_PROBATOR_SSRC = 1234;
  const RTP_PROBATOR_CODEC_PAYLOAD_TYPE = 127;
  /**
   * Validates RtpCapabilities. It may modify given data by adding missing
   * fields with default values.
   * It throws if invalid.
   */

  function validateRtpCapabilities(caps) {
    if (typeof caps !== 'object') throw new TypeError('caps is not an object'); // codecs is optional. If unset, fill with an empty array.

    if (caps.codecs && !Array.isArray(caps.codecs)) throw new TypeError('caps.codecs is not an array');else if (!caps.codecs) caps.codecs = [];

    for (const codec of caps.codecs) {
      validateRtpCodecCapability(codec);
    } // headerExtensions is optional. If unset, fill with an empty array.


    if (caps.headerExtensions && !Array.isArray(caps.headerExtensions)) throw new TypeError('caps.headerExtensions is not an array');else if (!caps.headerExtensions) caps.headerExtensions = [];

    for (const ext of caps.headerExtensions) {
      validateRtpHeaderExtension(ext);
    }
  }

  exports.validateRtpCapabilities = validateRtpCapabilities;
  /**
   * Validates RtpCodecCapability. It may modify given data by adding missing
   * fields with default values.
   * It throws if invalid.
   */

  function validateRtpCodecCapability(codec) {
    const MimeTypeRegex = new RegExp('^(audio|video)/(.+)', 'i');
    if (typeof codec !== 'object') throw new TypeError('codec is not an object'); // mimeType is mandatory.

    if (!codec.mimeType || typeof codec.mimeType !== 'string') throw new TypeError('missing codec.mimeType');
    const mimeTypeMatch = MimeTypeRegex.exec(codec.mimeType);
    if (!mimeTypeMatch) throw new TypeError('invalid codec.mimeType'); // Just override kind with media component of mimeType.

    codec.kind = mimeTypeMatch[1].toLowerCase(); // preferredPayloadType is optional.

    if (codec.preferredPayloadType && typeof codec.preferredPayloadType !== 'number') throw new TypeError('invalid codec.preferredPayloadType'); // clockRate is mandatory.

    if (typeof codec.clockRate !== 'number') throw new TypeError('missing codec.clockRate'); // channels is optional. If unset, set it to 1 (just if audio).

    if (codec.kind === 'audio') {
      if (typeof codec.channels !== 'number') codec.channels = 1;
    } else {
      delete codec.channels;
    } // parameters is optional. If unset, set it to an empty object.


    if (!codec.parameters || typeof codec.parameters !== 'object') codec.parameters = {};

    for (const key of Object.keys(codec.parameters)) {
      let value = codec.parameters[key];

      if (value === undefined) {
        codec.parameters[key] = '';
        value = '';
      }

      if (typeof value !== 'string' && typeof value !== 'number') {
        throw new TypeError(`invalid codec parameter [key:${key}s, value:${value}]`);
      } // Specific parameters validation.


      if (key === 'apt') {
        if (typeof value !== 'number') throw new TypeError('invalid codec apt parameter');
      }
    } // rtcpFeedback is optional. If unset, set it to an empty array.


    if (!codec.rtcpFeedback || !Array.isArray(codec.rtcpFeedback)) codec.rtcpFeedback = [];

    for (const fb of codec.rtcpFeedback) {
      validateRtcpFeedback(fb);
    }
  }

  exports.validateRtpCodecCapability = validateRtpCodecCapability;
  /**
   * Validates RtcpFeedback. It may modify given data by adding missing
   * fields with default values.
   * It throws if invalid.
   */

  function validateRtcpFeedback(fb) {
    if (typeof fb !== 'object') throw new TypeError('fb is not an object'); // type is mandatory.

    if (!fb.type || typeof fb.type !== 'string') throw new TypeError('missing fb.type'); // parameter is optional. If unset set it to an empty string.

    if (!fb.parameter || typeof fb.parameter !== 'string') fb.parameter = '';
  }

  exports.validateRtcpFeedback = validateRtcpFeedback;
  /**
   * Validates RtpHeaderExtension. It may modify given data by adding missing
   * fields with default values.
   * It throws if invalid.
   */

  function validateRtpHeaderExtension(ext) {
    if (typeof ext !== 'object') throw new TypeError('ext is not an object'); // kind is optional. If unset set it to an empty string.

    if (!ext.kind || typeof ext.kind !== 'string') ext.kind = '';
    if (ext.kind !== '' && ext.kind !== 'audio' && ext.kind !== 'video') throw new TypeError('invalid ext.kind'); // uri is mandatory.

    if (!ext.uri || typeof ext.uri !== 'string') throw new TypeError('missing ext.uri'); // preferredId is mandatory.

    if (typeof ext.preferredId !== 'number') throw new TypeError('missing ext.preferredId'); // preferredEncrypt is optional. If unset set it to false.

    if (ext.preferredEncrypt && typeof ext.preferredEncrypt !== 'boolean') throw new TypeError('invalid ext.preferredEncrypt');else if (!ext.preferredEncrypt) ext.preferredEncrypt = false; // direction is optional. If unset set it to sendrecv.

    if (ext.direction && typeof ext.direction !== 'string') throw new TypeError('invalid ext.direction');else if (!ext.direction) ext.direction = 'sendrecv';
  }

  exports.validateRtpHeaderExtension = validateRtpHeaderExtension;
  /**
   * Validates RtpParameters. It may modify given data by adding missing
   * fields with default values.
   * It throws if invalid.
   */

  function validateRtpParameters(params) {
    if (typeof params !== 'object') throw new TypeError('params is not an object'); // mid is optional.

    if (params.mid && typeof params.mid !== 'string') throw new TypeError('params.mid is not a string'); // codecs is mandatory.

    if (!Array.isArray(params.codecs)) throw new TypeError('missing params.codecs');

    for (const codec of params.codecs) {
      validateRtpCodecParameters(codec);
    } // headerExtensions is optional. If unset, fill with an empty array.


    if (params.headerExtensions && !Array.isArray(params.headerExtensions)) throw new TypeError('params.headerExtensions is not an array');else if (!params.headerExtensions) params.headerExtensions = [];

    for (const ext of params.headerExtensions) {
      validateRtpHeaderExtensionParameters(ext);
    } // encodings is optional. If unset, fill with an empty array.


    if (params.encodings && !Array.isArray(params.encodings)) throw new TypeError('params.encodings is not an array');else if (!params.encodings) params.encodings = [];

    for (const encoding of params.encodings) {
      validateRtpEncodingParameters(encoding);
    } // rtcp is optional. If unset, fill with an empty object.


    if (params.rtcp && typeof params.rtcp !== 'object') throw new TypeError('params.rtcp is not an object');else if (!params.rtcp) params.rtcp = {};
    validateRtcpParameters(params.rtcp);
  }

  exports.validateRtpParameters = validateRtpParameters;
  /**
   * Validates RtpCodecParameters. It may modify given data by adding missing
   * fields with default values.
   * It throws if invalid.
   */

  function validateRtpCodecParameters(codec) {
    const MimeTypeRegex = new RegExp('^(audio|video)/(.+)', 'i');
    if (typeof codec !== 'object') throw new TypeError('codec is not an object'); // mimeType is mandatory.

    if (!codec.mimeType || typeof codec.mimeType !== 'string') throw new TypeError('missing codec.mimeType');
    const mimeTypeMatch = MimeTypeRegex.exec(codec.mimeType);
    if (!mimeTypeMatch) throw new TypeError('invalid codec.mimeType'); // payloadType is mandatory.

    if (typeof codec.payloadType !== 'number') throw new TypeError('missing codec.payloadType'); // clockRate is mandatory.

    if (typeof codec.clockRate !== 'number') throw new TypeError('missing codec.clockRate');
    const kind = mimeTypeMatch[1].toLowerCase(); // channels is optional. If unset, set it to 1 (just if audio).

    if (kind === 'audio') {
      if (typeof codec.channels !== 'number') codec.channels = 1;
    } else {
      delete codec.channels;
    } // parameters is optional. If unset, set it to an empty object.


    if (!codec.parameters || typeof codec.parameters !== 'object') codec.parameters = {};

    for (const key of Object.keys(codec.parameters)) {
      let value = codec.parameters[key];

      if (value === undefined) {
        codec.parameters[key] = '';
        value = '';
      }

      if (typeof value !== 'string' && typeof value !== 'number') {
        throw new TypeError(`invalid codec parameter [key:${key}s, value:${value}]`);
      } // Specific parameters validation.


      if (key === 'apt') {
        if (typeof value !== 'number') throw new TypeError('invalid codec apt parameter');
      }
    } // rtcpFeedback is optional. If unset, set it to an empty array.


    if (!codec.rtcpFeedback || !Array.isArray(codec.rtcpFeedback)) codec.rtcpFeedback = [];

    for (const fb of codec.rtcpFeedback) {
      validateRtcpFeedback(fb);
    }
  }

  exports.validateRtpCodecParameters = validateRtpCodecParameters;
  /**
   * Validates RtpHeaderExtensionParameteters. It may modify given data by adding missing
   * fields with default values.
   * It throws if invalid.
   */

  function validateRtpHeaderExtensionParameters(ext) {
    if (typeof ext !== 'object') throw new TypeError('ext is not an object'); // uri is mandatory.

    if (!ext.uri || typeof ext.uri !== 'string') throw new TypeError('missing ext.uri'); // id is mandatory.

    if (typeof ext.id !== 'number') throw new TypeError('missing ext.id'); // encrypt is optional. If unset set it to false.

    if (ext.encrypt && typeof ext.encrypt !== 'boolean') throw new TypeError('invalid ext.encrypt');else if (!ext.encrypt) ext.encrypt = false; // parameters is optional. If unset, set it to an empty object.

    if (!ext.parameters || typeof ext.parameters !== 'object') ext.parameters = {};

    for (const key of Object.keys(ext.parameters)) {
      let value = ext.parameters[key];

      if (value === undefined) {
        ext.parameters[key] = '';
        value = '';
      }

      if (typeof value !== 'string' && typeof value !== 'number') throw new TypeError('invalid header extension parameter');
    }
  }

  exports.validateRtpHeaderExtensionParameters = validateRtpHeaderExtensionParameters;
  /**
   * Validates RtpEncodingParameters. It may modify given data by adding missing
   * fields with default values.
   * It throws if invalid.
   */

  function validateRtpEncodingParameters(encoding) {
    if (typeof encoding !== 'object') throw new TypeError('encoding is not an object'); // ssrc is optional.

    if (encoding.ssrc && typeof encoding.ssrc !== 'number') throw new TypeError('invalid encoding.ssrc'); // rid is optional.

    if (encoding.rid && typeof encoding.rid !== 'string') throw new TypeError('invalid encoding.rid'); // rtx is optional.

    if (encoding.rtx && typeof encoding.rtx !== 'object') {
      throw new TypeError('invalid encoding.rtx');
    } else if (encoding.rtx) {
      // RTX ssrc is mandatory if rtx is present.
      if (typeof encoding.rtx.ssrc !== 'number') throw new TypeError('missing encoding.rtx.ssrc');
    } // dtx is optional. If unset set it to false.


    if (!encoding.dtx || typeof encoding.dtx !== 'boolean') encoding.dtx = false; // scalabilityMode is optional.

    if (encoding.scalabilityMode && typeof encoding.scalabilityMode !== 'string') throw new TypeError('invalid encoding.scalabilityMode');
  }

  exports.validateRtpEncodingParameters = validateRtpEncodingParameters;
  /**
   * Validates RtcpParameters. It may modify given data by adding missing
   * fields with default values.
   * It throws if invalid.
   */

  function validateRtcpParameters(rtcp) {
    if (typeof rtcp !== 'object') throw new TypeError('rtcp is not an object'); // cname is optional.

    if (rtcp.cname && typeof rtcp.cname !== 'string') throw new TypeError('invalid rtcp.cname'); // reducedSize is optional. If unset set it to true.

    if (!rtcp.reducedSize || typeof rtcp.reducedSize !== 'boolean') rtcp.reducedSize = true;
  }

  exports.validateRtcpParameters = validateRtcpParameters;
  /**
   * Validates SctpCapabilities. It may modify given data by adding missing
   * fields with default values.
   * It throws if invalid.
   */

  function validateSctpCapabilities(caps) {
    if (typeof caps !== 'object') throw new TypeError('caps is not an object'); // numStreams is mandatory.

    if (!caps.numStreams || typeof caps.numStreams !== 'object') throw new TypeError('missing caps.numStreams');
    validateNumSctpStreams(caps.numStreams);
  }

  exports.validateSctpCapabilities = validateSctpCapabilities;
  /**
   * Validates NumSctpStreams. It may modify given data by adding missing
   * fields with default values.
   * It throws if invalid.
   */

  function validateNumSctpStreams(numStreams) {
    if (typeof numStreams !== 'object') throw new TypeError('numStreams is not an object'); // OS is mandatory.

    if (typeof numStreams.OS !== 'number') throw new TypeError('missing numStreams.OS'); // MIS is mandatory.

    if (typeof numStreams.MIS !== 'number') throw new TypeError('missing numStreams.MIS');
  }

  exports.validateNumSctpStreams = validateNumSctpStreams;
  /**
   * Validates SctpParameters. It may modify given data by adding missing
   * fields with default values.
   * It throws if invalid.
   */

  function validateSctpParameters(params) {
    if (typeof params !== 'object') throw new TypeError('params is not an object'); // port is mandatory.

    if (typeof params.port !== 'number') throw new TypeError('missing params.port'); // OS is mandatory.

    if (typeof params.OS !== 'number') throw new TypeError('missing params.OS'); // MIS is mandatory.

    if (typeof params.MIS !== 'number') throw new TypeError('missing params.MIS'); // maxMessageSize is mandatory.

    if (typeof params.maxMessageSize !== 'number') throw new TypeError('missing params.maxMessageSize');
  }

  exports.validateSctpParameters = validateSctpParameters;
  /**
   * Validates SctpStreamParameters. It may modify given data by adding missing
   * fields with default values.
   * It throws if invalid.
   */

  function validateSctpStreamParameters(params) {
    if (typeof params !== 'object') throw new TypeError('params is not an object'); // streamId is mandatory.

    if (typeof params.streamId !== 'number') throw new TypeError('missing params.streamId'); // ordered is optional.

    let orderedGiven = false;
    if (typeof params.ordered === 'boolean') orderedGiven = true;else params.ordered = true; // maxPacketLifeTime is optional.

    if (params.maxPacketLifeTime && typeof params.maxPacketLifeTime !== 'number') throw new TypeError('invalid params.maxPacketLifeTime'); // maxRetransmits is optional.

    if (params.maxRetransmits && typeof params.maxRetransmits !== 'number') throw new TypeError('invalid params.maxRetransmits');
    if (params.maxPacketLifeTime && params.maxRetransmits) throw new TypeError('cannot provide both maxPacketLifeTime and maxRetransmits');

    if (orderedGiven && params.ordered && (params.maxPacketLifeTime || params.maxRetransmits)) {
      throw new TypeError('cannot be ordered with maxPacketLifeTime or maxRetransmits');
    } else if (!orderedGiven && (params.maxPacketLifeTime || params.maxRetransmits)) {
      params.ordered = false;
    } // priority is optional.


    if (params.priority && typeof params.priority !== 'string') throw new TypeError('invalid params.priority'); // label is optional.

    if (params.label && typeof params.label !== 'string') throw new TypeError('invalid params.label'); // protocol is optional.

    if (params.protocol && typeof params.protocol !== 'string') throw new TypeError('invalid params.protocol');
  }

  exports.validateSctpStreamParameters = validateSctpStreamParameters;
  /**
   * Generate extended RTP capabilities for sending and receiving.
   */

  function getExtendedRtpCapabilities(localCaps, remoteCaps) {
    const extendedRtpCapabilities = {
      codecs: [],
      headerExtensions: []
    }; // Match media codecs and keep the order preferred by remoteCaps.

    for (const remoteCodec of remoteCaps.codecs || []) {
      if (isRtxCodec(remoteCodec)) continue;
      const matchingLocalCodec = (localCaps.codecs || []).find(localCodec => matchCodecs(localCodec, remoteCodec, {
        strict: true,
        modify: true
      }));
      if (!matchingLocalCodec) continue;
      const extendedCodec = {
        mimeType: matchingLocalCodec.mimeType,
        kind: matchingLocalCodec.kind,
        clockRate: matchingLocalCodec.clockRate,
        channels: matchingLocalCodec.channels,
        localPayloadType: matchingLocalCodec.preferredPayloadType,
        localRtxPayloadType: undefined,
        remotePayloadType: remoteCodec.preferredPayloadType,
        remoteRtxPayloadType: undefined,
        localParameters: matchingLocalCodec.parameters,
        remoteParameters: remoteCodec.parameters,
        rtcpFeedback: reduceRtcpFeedback(matchingLocalCodec, remoteCodec)
      };
      extendedRtpCapabilities.codecs.push(extendedCodec);
    } // Match RTX codecs.


    for (const extendedCodec of extendedRtpCapabilities.codecs) {
      const matchingLocalRtxCodec = localCaps.codecs.find(localCodec => isRtxCodec(localCodec) && localCodec.parameters.apt === extendedCodec.localPayloadType);
      const matchingRemoteRtxCodec = remoteCaps.codecs.find(remoteCodec => isRtxCodec(remoteCodec) && remoteCodec.parameters.apt === extendedCodec.remotePayloadType);

      if (matchingLocalRtxCodec && matchingRemoteRtxCodec) {
        extendedCodec.localRtxPayloadType = matchingLocalRtxCodec.preferredPayloadType;
        extendedCodec.remoteRtxPayloadType = matchingRemoteRtxCodec.preferredPayloadType;
      }
    } // Match header extensions.


    for (const remoteExt of remoteCaps.headerExtensions) {
      const matchingLocalExt = localCaps.headerExtensions.find(localExt => matchHeaderExtensions(localExt, remoteExt));
      if (!matchingLocalExt) continue;
      const extendedExt = {
        kind: remoteExt.kind,
        uri: remoteExt.uri,
        sendId: matchingLocalExt.preferredId,
        recvId: remoteExt.preferredId,
        encrypt: matchingLocalExt.preferredEncrypt,
        direction: 'sendrecv'
      };

      switch (remoteExt.direction) {
        case 'sendrecv':
          extendedExt.direction = 'sendrecv';
          break;

        case 'recvonly':
          extendedExt.direction = 'sendonly';
          break;

        case 'sendonly':
          extendedExt.direction = 'recvonly';
          break;

        case 'inactive':
          extendedExt.direction = 'inactive';
          break;
      }

      extendedRtpCapabilities.headerExtensions.push(extendedExt);
    }

    return extendedRtpCapabilities;
  }

  exports.getExtendedRtpCapabilities = getExtendedRtpCapabilities;
  /**
   * Generate RTP capabilities for receiving media based on the given extended
   * RTP capabilities.
   */

  function getRecvRtpCapabilities(extendedRtpCapabilities) {
    const rtpCapabilities = {
      codecs: [],
      headerExtensions: []
    };

    for (const extendedCodec of extendedRtpCapabilities.codecs) {
      const codec = {
        mimeType: extendedCodec.mimeType,
        kind: extendedCodec.kind,
        preferredPayloadType: extendedCodec.remotePayloadType,
        clockRate: extendedCodec.clockRate,
        channels: extendedCodec.channels,
        parameters: extendedCodec.localParameters,
        rtcpFeedback: extendedCodec.rtcpFeedback
      };
      rtpCapabilities.codecs.push(codec); // Add RTX codec.

      if (!extendedCodec.remoteRtxPayloadType) continue;
      const rtxCodec = {
        mimeType: `${extendedCodec.kind}/rtx`,
        kind: extendedCodec.kind,
        preferredPayloadType: extendedCodec.remoteRtxPayloadType,
        clockRate: extendedCodec.clockRate,
        parameters: {
          apt: extendedCodec.remotePayloadType
        },
        rtcpFeedback: []
      };
      rtpCapabilities.codecs.push(rtxCodec); // TODO: In the future, we need to add FEC, CN, etc, codecs.
    }

    for (const extendedExtension of extendedRtpCapabilities.headerExtensions) {
      // Ignore RTP extensions not valid for receiving.
      if (extendedExtension.direction !== 'sendrecv' && extendedExtension.direction !== 'recvonly') {
        continue;
      }

      const ext = {
        kind: extendedExtension.kind,
        uri: extendedExtension.uri,
        preferredId: extendedExtension.recvId,
        preferredEncrypt: extendedExtension.encrypt,
        direction: extendedExtension.direction
      };
      rtpCapabilities.headerExtensions.push(ext);
    }

    return rtpCapabilities;
  }

  exports.getRecvRtpCapabilities = getRecvRtpCapabilities;
  /**
   * Generate RTP parameters of the given kind for sending media.
   * NOTE: mid, encodings and rtcp fields are left empty.
   */

  function getSendingRtpParameters(kind, extendedRtpCapabilities) {
    const rtpParameters = {
      mid: undefined,
      codecs: [],
      headerExtensions: [],
      encodings: [],
      rtcp: {}
    };

    for (const extendedCodec of extendedRtpCapabilities.codecs) {
      if (extendedCodec.kind !== kind) continue;
      const codec = {
        mimeType: extendedCodec.mimeType,
        payloadType: extendedCodec.localPayloadType,
        clockRate: extendedCodec.clockRate,
        channels: extendedCodec.channels,
        parameters: extendedCodec.localParameters,
        rtcpFeedback: extendedCodec.rtcpFeedback
      };
      rtpParameters.codecs.push(codec); // Add RTX codec.

      if (extendedCodec.localRtxPayloadType) {
        const rtxCodec = {
          mimeType: `${extendedCodec.kind}/rtx`,
          payloadType: extendedCodec.localRtxPayloadType,
          clockRate: extendedCodec.clockRate,
          parameters: {
            apt: extendedCodec.localPayloadType
          },
          rtcpFeedback: []
        };
        rtpParameters.codecs.push(rtxCodec);
      }
    }

    for (const extendedExtension of extendedRtpCapabilities.headerExtensions) {
      // Ignore RTP extensions of a different kind and those not valid for sending.
      if (extendedExtension.kind && extendedExtension.kind !== kind || extendedExtension.direction !== 'sendrecv' && extendedExtension.direction !== 'sendonly') {
        continue;
      }

      const ext = {
        uri: extendedExtension.uri,
        id: extendedExtension.sendId,
        encrypt: extendedExtension.encrypt,
        parameters: {}
      };
      rtpParameters.headerExtensions.push(ext);
    }

    return rtpParameters;
  }

  exports.getSendingRtpParameters = getSendingRtpParameters;
  /**
   * Generate RTP parameters of the given kind suitable for the remote SDP answer.
   */

  function getSendingRemoteRtpParameters(kind, extendedRtpCapabilities) {
    const rtpParameters = {
      mid: undefined,
      codecs: [],
      headerExtensions: [],
      encodings: [],
      rtcp: {}
    };

    for (const extendedCodec of extendedRtpCapabilities.codecs) {
      if (extendedCodec.kind !== kind) continue;
      const codec = {
        mimeType: extendedCodec.mimeType,
        payloadType: extendedCodec.localPayloadType,
        clockRate: extendedCodec.clockRate,
        channels: extendedCodec.channels,
        parameters: extendedCodec.remoteParameters,
        rtcpFeedback: extendedCodec.rtcpFeedback
      };
      rtpParameters.codecs.push(codec); // Add RTX codec.

      if (extendedCodec.localRtxPayloadType) {
        const rtxCodec = {
          mimeType: `${extendedCodec.kind}/rtx`,
          payloadType: extendedCodec.localRtxPayloadType,
          clockRate: extendedCodec.clockRate,
          parameters: {
            apt: extendedCodec.localPayloadType
          },
          rtcpFeedback: []
        };
        rtpParameters.codecs.push(rtxCodec);
      }
    }

    for (const extendedExtension of extendedRtpCapabilities.headerExtensions) {
      // Ignore RTP extensions of a different kind and those not valid for sending.
      if (extendedExtension.kind && extendedExtension.kind !== kind || extendedExtension.direction !== 'sendrecv' && extendedExtension.direction !== 'sendonly') {
        continue;
      }

      const ext = {
        uri: extendedExtension.uri,
        id: extendedExtension.sendId,
        encrypt: extendedExtension.encrypt,
        parameters: {}
      };
      rtpParameters.headerExtensions.push(ext);
    } // Reduce codecs' RTCP feedback. Use Transport-CC if available, REMB otherwise.


    if (rtpParameters.headerExtensions.some(ext => ext.uri === 'http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01')) {
      for (const codec of rtpParameters.codecs) {
        codec.rtcpFeedback = (codec.rtcpFeedback || []).filter(fb => fb.type !== 'goog-remb');
      }
    } else if (rtpParameters.headerExtensions.some(ext => ext.uri === 'http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time')) {
      for (const codec of rtpParameters.codecs) {
        codec.rtcpFeedback = (codec.rtcpFeedback || []).filter(fb => fb.type !== 'transport-cc');
      }
    } else {
      for (const codec of rtpParameters.codecs) {
        codec.rtcpFeedback = (codec.rtcpFeedback || []).filter(fb => fb.type !== 'transport-cc' && fb.type !== 'goog-remb');
      }
    }

    return rtpParameters;
  }

  exports.getSendingRemoteRtpParameters = getSendingRemoteRtpParameters;
  /**
   * Reduce given codecs by returning an array of codecs "compatible" with the
   * given capability codec. If no capability codec is given, take the first
   * one(s).
   *
   * Given codecs must be generated by ortc.getSendingRtpParameters() or
   * ortc.getSendingRemoteRtpParameters().
   *
   * The returned array of codecs also include a RTX codec if available.
   */

  function reduceCodecs(codecs, capCodec) {
    const filteredCodecs = []; // If no capability codec is given, take the first one (and RTX).

    if (!capCodec) {
      filteredCodecs.push(codecs[0]);
      if (isRtxCodec(codecs[1])) filteredCodecs.push(codecs[1]);
    } // Otherwise look for a compatible set of codecs.
    else {
        for (let idx = 0; idx < codecs.length; ++idx) {
          if (matchCodecs(codecs[idx], capCodec)) {
            filteredCodecs.push(codecs[idx]);
            if (isRtxCodec(codecs[idx + 1])) filteredCodecs.push(codecs[idx + 1]);
            break;
          }
        }

        if (filteredCodecs.length === 0) throw new TypeError('no matching codec found');
      }

    return filteredCodecs;
  }

  exports.reduceCodecs = reduceCodecs;
  /**
   * Create RTP parameters for a Consumer for the RTP probator.
   */

  function generateProbatorRtpParameters(videoRtpParameters) {
    // Clone given reference video RTP parameters.
    videoRtpParameters = utils.clone(videoRtpParameters); // This may throw.

    validateRtpParameters(videoRtpParameters);
    const rtpParameters = {
      mid: RTP_PROBATOR_MID,
      codecs: [],
      headerExtensions: [],
      encodings: [{
        ssrc: RTP_PROBATOR_SSRC
      }],
      rtcp: {
        cname: 'probator'
      }
    };
    rtpParameters.codecs.push(videoRtpParameters.codecs[0]);
    rtpParameters.codecs[0].payloadType = RTP_PROBATOR_CODEC_PAYLOAD_TYPE;
    rtpParameters.headerExtensions = videoRtpParameters.headerExtensions;
    return rtpParameters;
  }

  exports.generateProbatorRtpParameters = generateProbatorRtpParameters;
  /**
   * Whether media can be sent based on the given RTP capabilities.
   */

  function canSend(kind, extendedRtpCapabilities) {
    return extendedRtpCapabilities.codecs.some(codec => codec.kind === kind);
  }

  exports.canSend = canSend;
  /**
   * Whether the given RTP parameters can be received with the given RTP
   * capabilities.
   */

  function canReceive(rtpParameters, extendedRtpCapabilities) {
    // This may throw.
    validateRtpParameters(rtpParameters);
    if (rtpParameters.codecs.length === 0) return false;
    const firstMediaCodec = rtpParameters.codecs[0];
    return extendedRtpCapabilities.codecs.some(codec => codec.remotePayloadType === firstMediaCodec.payloadType);
  }

  exports.canReceive = canReceive;

  function isRtxCodec(codec) {
    if (!codec) return false;
    return /.+\/rtx$/i.test(codec.mimeType);
  }

  function matchCodecs(aCodec, bCodec, {
    strict = false,
    modify = false
  } = {}) {
    const aMimeType = aCodec.mimeType.toLowerCase();
    const bMimeType = bCodec.mimeType.toLowerCase();
    if (aMimeType !== bMimeType) return false;
    if (aCodec.clockRate !== bCodec.clockRate) return false;
    if (aCodec.channels !== bCodec.channels) return false; // Per codec special checks.

    switch (aMimeType) {
      case 'video/h264':
        {
          const aPacketizationMode = aCodec.parameters['packetization-mode'] || 0;
          const bPacketizationMode = bCodec.parameters['packetization-mode'] || 0;
          if (aPacketizationMode !== bPacketizationMode) return false; // If strict matching check profile-level-id.

          if (strict) {
            if (!h264ProfileLevelId.isSameProfile(aCodec.parameters, bCodec.parameters)) return false;
            let selectedProfileLevelId;

            try {
              selectedProfileLevelId = h264ProfileLevelId.generateProfileLevelIdForAnswer(aCodec.parameters, bCodec.parameters);
            } catch (error) {
              return false;
            }

            if (modify) {
              if (selectedProfileLevelId) aCodec.parameters['profile-level-id'] = selectedProfileLevelId;else delete aCodec.parameters['profile-level-id'];
            }
          }

          break;
        }

      case 'video/vp9':
        {
          // If strict matching check profile-id.
          if (strict) {
            const aProfileId = aCodec.parameters['profile-id'] || 0;
            const bProfileId = bCodec.parameters['profile-id'] || 0;
            if (aProfileId !== bProfileId) return false;
          }

          break;
        }
    }

    return true;
  }

  function matchHeaderExtensions(aExt, bExt) {
    if (aExt.kind && bExt.kind && aExt.kind !== bExt.kind) return false;
    if (aExt.uri !== bExt.uri) return false;
    return true;
  }

  function reduceRtcpFeedback(codecA, codecB) {
    const reducedRtcpFeedback = [];

    for (const aFb of codecA.rtcpFeedback || []) {
      const matchingBFb = (codecB.rtcpFeedback || []).find(bFb => bFb.type === aFb.type && (bFb.parameter === aFb.parameter || !bFb.parameter && !aFb.parameter));
      if (matchingBFb) reducedRtcpFeedback.push(matchingBFb);
    }

    return reducedRtcpFeedback;
  }
});

var lib$2 = createCommonjsModule(function (module, exports) {

  var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function (resolve) {
        resolve(value);
      });
    }

    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }

      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }

      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }

      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  class AwaitQueue {
    constructor({
      ClosedErrorClass,
      StoppedErrorClass
    } = {
      ClosedErrorClass: Error,
      StoppedErrorClass: Error
    }) {
      // Closed flag.
      this.closed = false; // Queue of pending tasks.

      this.pendingTasks = []; // Error class used when rejecting a task due to AwaitQueue being closed.

      this.ClosedErrorClass = Error; // Error class used when rejecting a task due to AwaitQueue being stopped.

      this.StoppedErrorClass = Error;
      this.ClosedErrorClass = ClosedErrorClass;
      this.StoppedErrorClass = StoppedErrorClass;
    }
    /**
     * The number of ongoing enqueued tasks.
     */


    get size() {
      return this.pendingTasks.length;
    }
    /**
     * Closes the AwaitQueue. Pending tasks will be rejected with ClosedErrorClass
     * error.
     */


    close() {
      if (this.closed) return;
      this.closed = true;

      for (const pendingTask of this.pendingTasks) {
        pendingTask.stopped = true;
        pendingTask.reject(new this.ClosedErrorClass('AwaitQueue closed'));
      } // Enpty the pending tasks array.


      this.pendingTasks.length = 0;
    }
    /**
     * Accepts a task as argument (and an optional task name) and enqueues it after
     * pending tasks. Once processed, the push() method resolves (or rejects) with
     * the result returned by the given task.
     *
     * The given task must return a Promise or directly a value.
     */


    push(task, name) {
      return __awaiter(this, void 0, void 0, function* () {
        if (this.closed) throw new this.ClosedErrorClass('AwaitQueue closed');
        if (typeof task !== 'function') throw new TypeError('given task is not a function');

        if (!task.name && name) {
          try {
            Object.defineProperty(task, 'name', {
              value: name
            });
          } catch (error) {}
        }

        return new Promise((resolve, reject) => {
          const pendingTask = {
            task,
            name,
            resolve,
            reject,
            stopped: false
          }; // Append task to the queue.

          this.pendingTasks.push(pendingTask); // And run it if this is the only task in the queue.

          if (this.pendingTasks.length === 1) this.next();
        });
      });
    }
    /**
     * Make ongoing pending tasks reject with the given StoppedErrorClass error.
     * The AwaitQueue instance is still usable for future tasks added via push()
     * method.
     */


    stop() {
      if (this.closed) return;

      for (const pendingTask of this.pendingTasks) {
        pendingTask.stopped = true;
        pendingTask.reject(new this.StoppedErrorClass('AwaitQueue stopped'));
      } // Enpty the pending tasks array.


      this.pendingTasks.length = 0;
    }

    dump() {
      return this.pendingTasks.map(pendingTask => {
        return {
          task: pendingTask.task,
          name: pendingTask.name,
          stopped: pendingTask.stopped
        };
      });
    }

    next() {
      return __awaiter(this, void 0, void 0, function* () {
        // Take the first pending task.
        const pendingTask = this.pendingTasks[0];
        if (!pendingTask) return; // Execute it.

        yield this.executeTask(pendingTask); // Remove the first pending task (the completed one) from the queue.

        this.pendingTasks.shift(); // And continue.

        this.next();
      });
    }

    executeTask(pendingTask) {
      return __awaiter(this, void 0, void 0, function* () {
        // If the task is stopped, ignore it.
        if (pendingTask.stopped) return;

        try {
          const result = yield pendingTask.task(); // If the task is stopped, ignore it.

          if (pendingTask.stopped) return; // Resolve the task with the returned result (if any).

          pendingTask.resolve(result);
        } catch (error) {
          // If the task is stopped, ignore it.
          if (pendingTask.stopped) return; // Reject the task with its own error.

          pendingTask.reject(error);
        }
      });
    }

  }

  exports.AwaitQueue = AwaitQueue;
});

var domain; // This constructor is used to store event handlers. Instantiating this is
// faster than explicitly calling `Object.create(null)` to get a "clean" empty
// object (tested with v8 v4.9).

function EventHandlers() {}

EventHandlers.prototype = Object.create(null);

function EventEmitter() {
  EventEmitter.init.call(this);
}
// require('events') === require('events').EventEmitter

EventEmitter.EventEmitter = EventEmitter;
EventEmitter.usingDomains = false;
EventEmitter.prototype.domain = undefined;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined; // By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.

EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function () {
  this.domain = null;

  if (EventEmitter.usingDomains) {
    // if there is an active domain, then attach to it.
    if (domain.active ) ;
  }

  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
    this._events = new EventHandlers();
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}; // Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.


EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n)) throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
}; // These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.


function emitNone(handler, isFn, self) {
  if (isFn) handler.call(self);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);

    for (var i = 0; i < len; ++i) listeners[i].call(self);
  }
}

function emitOne(handler, isFn, self, arg1) {
  if (isFn) handler.call(self, arg1);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);

    for (var i = 0; i < len; ++i) listeners[i].call(self, arg1);
  }
}

function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn) handler.call(self, arg1, arg2);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);

    for (var i = 0; i < len; ++i) listeners[i].call(self, arg1, arg2);
  }
}

function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn) handler.call(self, arg1, arg2, arg3);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);

    for (var i = 0; i < len; ++i) listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn) handler.apply(self, args);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);

    for (var i = 0; i < len; ++i) listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events, domain;
  var doError = type === 'error';
  events = this._events;
  if (events) doError = doError && events.error == null;else if (!doError) return false;
  domain = this.domain; // If there is no 'error' event listener then throw.

  if (doError) {
    er = arguments[1];

    if (domain) {
      if (!er) er = new Error('Uncaught, unspecified "error" event');
      er.domainEmitter = this;
      er.domain = domain;
      er.domainThrown = false;
      domain.emit('error', er);
    } else if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }

    return false;
  }

  handler = events[type];
  if (!handler) return false;
  var isFn = typeof handler === 'function';
  len = arguments.length;

  switch (len) {
    // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;

    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;

    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;

    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
    // slower

    default:
      args = new Array(len - 1);

      for (i = 1; i < len; i++) args[i - 1] = arguments[i];

      emitMany(handler, isFn, this, args);
  }
  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;
  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
  events = target._events;

  if (!events) {
    events = target._events = new EventHandlers();
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type, listener.listener ? listener.listener : listener); // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object

      events = target._events;
    }

    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] = prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    } // Check for listener leak


    if (!existing.warned) {
      m = $getMaxListeners(target);

      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' + existing.length + ' ' + type + ' listeners added. ' + 'Use emitter.setMaxListeners() to increase limit');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        emitWarning(w);
      }
    }
  }

  return target;
}

function emitWarning(e) {
  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener = function prependListener(type, listener) {
  return _addListener(this, type, listener, true);
};

function _onceWrap(target, type, listener) {
  var fired = false;

  function g() {
    target.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(target, arguments);
    }
  }

  g.listener = listener;
  return g;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
  this.prependListener(type, _onceWrap(this, type, listener));
  return this;
}; // emits a 'removeListener' event iff the listener was removed


EventEmitter.prototype.removeListener = function removeListener(type, listener) {
  var list, events, position, i, originalListener;
  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
  events = this._events;
  if (!events) return this;
  list = events[type];
  if (!list) return this;

  if (list === listener || list.listener && list.listener === listener) {
    if (--this._eventsCount === 0) this._events = new EventHandlers();else {
      delete events[type];
      if (events.removeListener) this.emit('removeListener', type, list.listener || listener);
    }
  } else if (typeof list !== 'function') {
    position = -1;

    for (i = list.length; i-- > 0;) {
      if (list[i] === listener || list[i].listener && list[i].listener === listener) {
        originalListener = list[i].listener;
        position = i;
        break;
      }
    }

    if (position < 0) return this;

    if (list.length === 1) {
      list[0] = undefined;

      if (--this._eventsCount === 0) {
        this._events = new EventHandlers();
        return this;
      } else {
        delete events[type];
      }
    } else {
      spliceOne(list, position);
    }

    if (events.removeListener) this.emit('removeListener', type, originalListener || listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
  var listeners, events;
  events = this._events;
  if (!events) return this; // not listening for removeListener, no need to emit

  if (!events.removeListener) {
    if (arguments.length === 0) {
      this._events = new EventHandlers();
      this._eventsCount = 0;
    } else if (events[type]) {
      if (--this._eventsCount === 0) this._events = new EventHandlers();else delete events[type];
    }

    return this;
  } // emit removeListener for all listeners on all events


  if (arguments.length === 0) {
    var keys = Object.keys(events);

    for (var i = 0, key; i < keys.length; ++i) {
      key = keys[i];
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }

    this.removeAllListeners('removeListener');
    this._events = new EventHandlers();
    this._eventsCount = 0;
    return this;
  }

  listeners = events[type];

  if (typeof listeners === 'function') {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    do {
      this.removeListener(type, listeners[listeners.length - 1]);
    } while (listeners[0]);
  }

  return this;
};

EventEmitter.prototype.listeners = function listeners(type) {
  var evlistener;
  var ret;
  var events = this._events;
  if (!events) ret = [];else {
    evlistener = events[type];
    if (!evlistener) ret = [];else if (typeof evlistener === 'function') ret = [evlistener.listener || evlistener];else ret = unwrapListeners(evlistener);
  }
  return ret;
};

EventEmitter.listenerCount = function (emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;

function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
}; // About 1.5x faster than the two-arg version of Array#splice().


function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) list[i] = list[k];

  list.pop();
}

function arrayClone(arr, i) {
  var copy = new Array(i);

  while (i--) copy[i] = arr[i];

  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);

  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }

  return ret;
}

var EnhancedEventEmitter_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('EnhancedEventEmitter');

  class EnhancedEventEmitter extends EventEmitter.EventEmitter {
    constructor() {
      super();
      this.setMaxListeners(Infinity);
    }

    safeEmit(event, ...args) {
      const numListeners = this.listenerCount(event);

      try {
        return this.emit(event, ...args);
      } catch (error) {
        logger.error('safeEmit() | event listener threw an error [event:%s]:%o', event, error);
        return Boolean(numListeners);
      }
    }

    async safeEmitAsPromise(event, ...args) {
      return new Promise((resolve, reject) => this.safeEmit(event, ...args, resolve, reject));
    }

  }

  exports.EnhancedEventEmitter = EnhancedEventEmitter;
});

var Producer_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('Producer');

  class Producer extends EnhancedEventEmitter_1.EnhancedEventEmitter {
    /**
     * @emits transportclose
     * @emits trackended
     * @emits @replacetrack - (track: MediaStreamTrack | null)
     * @emits @setmaxspatiallayer - (spatialLayer: string)
     * @emits @setrtpencodingparameters - (params: any)
     * @emits @getstats
     * @emits @close
     */
    constructor({
      id,
      localId,
      rtpSender,
      track,
      rtpParameters,
      stopTracks,
      disableTrackOnPause,
      zeroRtpOnPause,
      appData
    }) {
      super(); // Closed flag.

      this._closed = false;
      logger.debug('constructor()');
      this._id = id;
      this._localId = localId;
      this._rtpSender = rtpSender;
      this._track = track;
      this._kind = track.kind;
      this._rtpParameters = rtpParameters;
      this._paused = disableTrackOnPause ? !track.enabled : false;
      this._maxSpatialLayer = undefined;
      this._stopTracks = stopTracks;
      this._disableTrackOnPause = disableTrackOnPause;
      this._zeroRtpOnPause = zeroRtpOnPause;
      this._appData = appData;
      this._onTrackEnded = this._onTrackEnded.bind(this); // NOTE: Minor issue. If zeroRtpOnPause is true, we cannot emit the
      // '@replacetrack' event here, so RTCRtpSender.track won't be null.

      this._handleTrack();
    }
    /**
     * Producer id.
     */


    get id() {
      return this._id;
    }
    /**
     * Local id.
     */


    get localId() {
      return this._localId;
    }
    /**
     * Whether the Producer is closed.
     */


    get closed() {
      return this._closed;
    }
    /**
     * Media kind.
     */


    get kind() {
      return this._kind;
    }
    /**
     * Associated RTCRtpSender.
     */


    get rtpSender() {
      return this._rtpSender;
    }
    /**
     * The associated track.
     */


    get track() {
      return this._track;
    }
    /**
     * RTP parameters.
     */


    get rtpParameters() {
      return this._rtpParameters;
    }
    /**
     * Whether the Producer is paused.
     */


    get paused() {
      return this._paused;
    }
    /**
     * Max spatial layer.
     *
     * @type {Number | undefined}
     */


    get maxSpatialLayer() {
      return this._maxSpatialLayer;
    }
    /**
     * App custom data.
     */


    get appData() {
      return this._appData;
    }
    /**
     * Invalid setter.
     */


    set appData(appData) {
      throw new Error('cannot override appData object');
    }
    /**
     * Closes the Producer.
     */


    close() {
      if (this._closed) return;
      logger.debug('close()');
      this._closed = true;

      this._destroyTrack();

      this.emit('@close');
    }
    /**
     * Transport was closed.
     */


    transportClosed() {
      if (this._closed) return;
      logger.debug('transportClosed()');
      this._closed = true;

      this._destroyTrack();

      this.safeEmit('transportclose');
    }
    /**
     * Get associated RTCRtpSender stats.
     */


    async getStats() {
      if (this._closed) throw new errors.InvalidStateError('closed');
      return this.safeEmitAsPromise('@getstats');
    }
    /**
     * Pauses sending media.
     */


    pause() {
      logger.debug('pause()');

      if (this._closed) {
        logger.error('pause() | Producer closed');
        return;
      }

      this._paused = true;

      if (this._track && this._disableTrackOnPause) {
        this._track.enabled = false;
      }

      if (this._zeroRtpOnPause) {
        this.safeEmitAsPromise('@replacetrack', null).catch(() => {});
      }
    }
    /**
     * Resumes sending media.
     */


    resume() {
      logger.debug('resume()');

      if (this._closed) {
        logger.error('resume() | Producer closed');
        return;
      }

      this._paused = false;

      if (this._track && this._disableTrackOnPause) {
        this._track.enabled = true;
      }

      if (this._zeroRtpOnPause) {
        this.safeEmitAsPromise('@replacetrack', this._track).catch(() => {});
      }
    }
    /**
     * Replaces the current track with a new one or null.
     */


    async replaceTrack({
      track
    }) {
      logger.debug('replaceTrack() [track:%o]', track);

      if (this._closed) {
        // This must be done here. Otherwise there is no chance to stop the given
        // track.
        if (track && this._stopTracks) {
          try {
            track.stop();
          } catch (error) {}
        }

        throw new errors.InvalidStateError('closed');
      } else if (track && track.readyState === 'ended') {
        throw new errors.InvalidStateError('track ended');
      } // Do nothing if this is the same track as the current handled one.


      if (track === this._track) {
        logger.debug('replaceTrack() | same track, ignored');
        return;
      }

      if (!this._zeroRtpOnPause || !this._paused) {
        await this.safeEmitAsPromise('@replacetrack', track);
      } // Destroy the previous track.


      this._destroyTrack(); // Set the new track.


      this._track = track; // If this Producer was paused/resumed and the state of the new
      // track does not match, fix it.

      if (this._track && this._disableTrackOnPause) {
        if (!this._paused) this._track.enabled = true;else if (this._paused) this._track.enabled = false;
      } // Handle the effective track.


      this._handleTrack();
    }
    /**
     * Sets the video max spatial layer to be sent.
     */


    async setMaxSpatialLayer(spatialLayer) {
      if (this._closed) throw new errors.InvalidStateError('closed');else if (this._kind !== 'video') throw new errors.UnsupportedError('not a video Producer');else if (typeof spatialLayer !== 'number') throw new TypeError('invalid spatialLayer');
      if (spatialLayer === this._maxSpatialLayer) return;
      await this.safeEmitAsPromise('@setmaxspatiallayer', spatialLayer);
      this._maxSpatialLayer = spatialLayer;
    }
    /**
     * Sets the DSCP value.
     */


    async setRtpEncodingParameters(params) {
      if (this._closed) throw new errors.InvalidStateError('closed');else if (typeof params !== 'object') throw new TypeError('invalid params');
      await this.safeEmitAsPromise('@setrtpencodingparameters', params);
    }

    _onTrackEnded() {
      logger.debug('track "ended" event');
      this.safeEmit('trackended');
    }

    _handleTrack() {
      if (!this._track) return;

      this._track.addEventListener('ended', this._onTrackEnded);
    }

    _destroyTrack() {
      if (!this._track) return;

      try {
        this._track.removeEventListener('ended', this._onTrackEnded); // Just stop the track unless the app set stopTracks: false.


        if (this._stopTracks) this._track.stop();
      } catch (error) {}
    }

  }

  exports.Producer = Producer;
});

var Consumer_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('Consumer');

  class Consumer extends EnhancedEventEmitter_1.EnhancedEventEmitter {
    /**
     * @emits transportclose
     * @emits trackended
     * @emits @getstats
     * @emits @close
     */
    constructor({
      id,
      localId,
      producerId,
      rtpReceiver,
      track,
      rtpParameters,
      appData
    }) {
      super(); // Closed flag.

      this._closed = false;
      logger.debug('constructor()');
      this._id = id;
      this._localId = localId;
      this._producerId = producerId;
      this._rtpReceiver = rtpReceiver;
      this._track = track;
      this._rtpParameters = rtpParameters;
      this._paused = !track.enabled;
      this._appData = appData;
      this._onTrackEnded = this._onTrackEnded.bind(this);

      this._handleTrack();
    }
    /**
     * Consumer id.
     */


    get id() {
      return this._id;
    }
    /**
     * Local id.
     */


    get localId() {
      return this._localId;
    }
    /**
     * Associated Producer id.
     */


    get producerId() {
      return this._producerId;
    }
    /**
     * Whether the Consumer is closed.
     */


    get closed() {
      return this._closed;
    }
    /**
     * Media kind.
     */


    get kind() {
      return this._track.kind;
    }
    /**
     * Associated RTCRtpReceiver.
     */


    get rtpReceiver() {
      return this._rtpReceiver;
    }
    /**
     * The associated track.
     */


    get track() {
      return this._track;
    }
    /**
     * RTP parameters.
     */


    get rtpParameters() {
      return this._rtpParameters;
    }
    /**
     * Whether the Consumer is paused.
     */


    get paused() {
      return this._paused;
    }
    /**
     * App custom data.
     */


    get appData() {
      return this._appData;
    }
    /**
     * Invalid setter.
     */


    set appData(appData) {
      throw new Error('cannot override appData object');
    }
    /**
     * Closes the Consumer.
     */


    close() {
      if (this._closed) return;
      logger.debug('close()');
      this._closed = true;

      this._destroyTrack();

      this.emit('@close');
    }
    /**
     * Transport was closed.
     */


    transportClosed() {
      if (this._closed) return;
      logger.debug('transportClosed()');
      this._closed = true;

      this._destroyTrack();

      this.safeEmit('transportclose');
    }
    /**
     * Get associated RTCRtpReceiver stats.
     */


    async getStats() {
      if (this._closed) throw new errors.InvalidStateError('closed');
      return this.safeEmitAsPromise('@getstats');
    }
    /**
     * Pauses receiving media.
     */


    pause() {
      logger.debug('pause()');

      if (this._closed) {
        logger.error('pause() | Consumer closed');
        return;
      }

      this._paused = true;
      this._track.enabled = false;
    }
    /**
     * Resumes receiving media.
     */


    resume() {
      logger.debug('resume()');

      if (this._closed) {
        logger.error('resume() | Consumer closed');
        return;
      }

      this._paused = false;
      this._track.enabled = true;
    }

    _onTrackEnded() {
      logger.debug('track "ended" event');
      this.safeEmit('trackended');
    }

    _handleTrack() {
      this._track.addEventListener('ended', this._onTrackEnded);
    }

    _destroyTrack() {
      try {
        this._track.removeEventListener('ended', this._onTrackEnded);

        this._track.stop();
      } catch (error) {}
    }

  }

  exports.Consumer = Consumer;
});

var DataProducer_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('DataProducer');

  class DataProducer extends EnhancedEventEmitter_1.EnhancedEventEmitter {
    /**
     * @emits transportclose
     * @emits open
     * @emits error - (error: Error)
     * @emits close
     * @emits bufferedamountlow
     * @emits @close
     */
    constructor({
      id,
      dataChannel,
      sctpStreamParameters,
      appData
    }) {
      super(); // Closed flag.

      this._closed = false;
      logger.debug('constructor()');
      this._id = id;
      this._dataChannel = dataChannel;
      this._sctpStreamParameters = sctpStreamParameters;
      this._appData = appData;

      this._handleDataChannel();
    }
    /**
     * DataProducer id.
     */


    get id() {
      return this._id;
    }
    /**
     * Whether the DataProducer is closed.
     */


    get closed() {
      return this._closed;
    }
    /**
     * SCTP stream parameters.
     */


    get sctpStreamParameters() {
      return this._sctpStreamParameters;
    }
    /**
     * DataChannel readyState.
     */


    get readyState() {
      return this._dataChannel.readyState;
    }
    /**
     * DataChannel label.
     */


    get label() {
      return this._dataChannel.label;
    }
    /**
     * DataChannel protocol.
     */


    get protocol() {
      return this._dataChannel.protocol;
    }
    /**
     * DataChannel bufferedAmount.
     */


    get bufferedAmount() {
      return this._dataChannel.bufferedAmount;
    }
    /**
     * DataChannel bufferedAmountLowThreshold.
     */


    get bufferedAmountLowThreshold() {
      return this._dataChannel.bufferedAmountLowThreshold;
    }
    /**
     * Set DataChannel bufferedAmountLowThreshold.
     */


    set bufferedAmountLowThreshold(bufferedAmountLowThreshold) {
      this._dataChannel.bufferedAmountLowThreshold = bufferedAmountLowThreshold;
    }
    /**
     * App custom data.
     */


    get appData() {
      return this._appData;
    }
    /**
     * Invalid setter.
     */


    set appData(appData) {
      throw new Error('cannot override appData object');
    }
    /**
     * Closes the DataProducer.
     */


    close() {
      if (this._closed) return;
      logger.debug('close()');
      this._closed = true;

      this._dataChannel.close();

      this.emit('@close');
    }
    /**
     * Transport was closed.
     */


    transportClosed() {
      if (this._closed) return;
      logger.debug('transportClosed()');
      this._closed = true;

      this._dataChannel.close();

      this.safeEmit('transportclose');
    }
    /**
     * Send a message.
     *
     * @param {String|Blob|ArrayBuffer|ArrayBufferView} data.
     */


    send(data) {
      logger.debug('send()');
      if (this._closed) throw new errors.InvalidStateError('closed');

      this._dataChannel.send(data);
    }

    _handleDataChannel() {
      this._dataChannel.addEventListener('open', () => {
        if (this._closed) return;
        logger.debug('DataChannel "open" event');
        this.safeEmit('open');
      });

      this._dataChannel.addEventListener('error', event => {
        if (this._closed) return;
        let {
          error
        } = event;
        if (!error) error = new Error('unknown DataChannel error');

        if (error.errorDetail === 'sctp-failure') {
          logger.error('DataChannel SCTP error [sctpCauseCode:%s]: %s', error.sctpCauseCode, error.message);
        } else {
          logger.error('DataChannel "error" event: %o', error);
        }

        this.safeEmit('error', error);
      });

      this._dataChannel.addEventListener('close', () => {
        if (this._closed) return;
        logger.warn('DataChannel "close" event');
        this._closed = true;
        this.emit('@close');
        this.safeEmit('close');
      });

      this._dataChannel.addEventListener('message', () => {
        if (this._closed) return;
        logger.warn('DataChannel "message" event in a DataProducer, message discarded');
      });

      this._dataChannel.addEventListener('bufferedamountlow', () => {
        if (this._closed) return;
        this.safeEmit('bufferedamountlow');
      });
    }

  }

  exports.DataProducer = DataProducer;
});

var DataConsumer_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('DataConsumer');

  class DataConsumer extends EnhancedEventEmitter_1.EnhancedEventEmitter {
    /**
     * @emits transportclose
     * @emits open
     * @emits error - (error: Error)
     * @emits close
     * @emits message - (message: any)
     * @emits @close
     */
    constructor({
      id,
      dataProducerId,
      dataChannel,
      sctpStreamParameters,
      appData
    }) {
      super(); // Closed flag.

      this._closed = false;
      logger.debug('constructor()');
      this._id = id;
      this._dataProducerId = dataProducerId;
      this._dataChannel = dataChannel;
      this._sctpStreamParameters = sctpStreamParameters;
      this._appData = appData;

      this._handleDataChannel();
    }
    /**
     * DataConsumer id.
     */


    get id() {
      return this._id;
    }
    /**
     * Associated DataProducer id.
     */


    get dataProducerId() {
      return this._dataProducerId;
    }
    /**
     * Whether the DataConsumer is closed.
     */


    get closed() {
      return this._closed;
    }
    /**
     * SCTP stream parameters.
     */


    get sctpStreamParameters() {
      return this._sctpStreamParameters;
    }
    /**
     * DataChannel readyState.
     */


    get readyState() {
      return this._dataChannel.readyState;
    }
    /**
     * DataChannel label.
     */


    get label() {
      return this._dataChannel.label;
    }
    /**
     * DataChannel protocol.
     */


    get protocol() {
      return this._dataChannel.protocol;
    }
    /**
     * DataChannel binaryType.
     */


    get binaryType() {
      return this._dataChannel.binaryType;
    }
    /**
     * Set DataChannel binaryType.
     */


    set binaryType(binaryType) {
      this._dataChannel.binaryType = binaryType;
    }
    /**
     * App custom data.
     */


    get appData() {
      return this._appData;
    }
    /**
     * Invalid setter.
     */


    set appData(appData) {
      throw new Error('cannot override appData object');
    }
    /**
     * Closes the DataConsumer.
     */


    close() {
      if (this._closed) return;
      logger.debug('close()');
      this._closed = true;

      this._dataChannel.close();

      this.emit('@close');
    }
    /**
     * Transport was closed.
     */


    transportClosed() {
      if (this._closed) return;
      logger.debug('transportClosed()');
      this._closed = true;

      this._dataChannel.close();

      this.safeEmit('transportclose');
    }

    _handleDataChannel() {
      this._dataChannel.addEventListener('open', () => {
        if (this._closed) return;
        logger.debug('DataChannel "open" event');
        this.safeEmit('open');
      });

      this._dataChannel.addEventListener('error', event => {
        if (this._closed) return;
        let {
          error
        } = event;
        if (!error) error = new Error('unknown DataChannel error');

        if (error.errorDetail === 'sctp-failure') {
          logger.error('DataChannel SCTP error [sctpCauseCode:%s]: %s', error.sctpCauseCode, error.message);
        } else {
          logger.error('DataChannel "error" event: %o', error);
        }

        this.safeEmit('error', error);
      });

      this._dataChannel.addEventListener('close', () => {
        if (this._closed) return;
        logger.warn('DataChannel "close" event');
        this._closed = true;
        this.emit('@close');
        this.safeEmit('close');
      });

      this._dataChannel.addEventListener('message', event => {
        if (this._closed) return;
        this.safeEmit('message', event.data);
      });
    }

  }

  exports.DataConsumer = DataConsumer;
});

var Transport_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('Transport');

  class Transport extends EnhancedEventEmitter_1.EnhancedEventEmitter {
    /**
     * @emits connect - (transportLocalParameters: any, callback: Function, errback: Function)
     * @emits connectionstatechange - (connectionState: ConnectionState)
     * @emits produce - (producerLocalParameters: any, callback: Function, errback: Function)
     * @emits producedata - (dataProducerLocalParameters: any, callback: Function, errback: Function)
     */
    constructor({
      direction,
      id,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers,
      iceTransportPolicy,
      additionalSettings,
      proprietaryConstraints,
      appData,
      handlerFactory,
      extendedRtpCapabilities,
      canProduceByKind
    }) {
      super(); // Closed flag.

      this._closed = false; // Transport connection state.

      this._connectionState = 'new'; // Map of Producers indexed by id.

      this._producers = new Map(); // Map of Consumers indexed by id.

      this._consumers = new Map(); // Map of DataProducers indexed by id.

      this._dataProducers = new Map(); // Map of DataConsumers indexed by id.

      this._dataConsumers = new Map(); // Whether the Consumer for RTP probation has been created.

      this._probatorConsumerCreated = false; // AwaitQueue instance to make async tasks happen sequentially.

      this._awaitQueue = new lib$2.AwaitQueue({
        ClosedErrorClass: errors.InvalidStateError
      });
      logger.debug('constructor() [id:%s, direction:%s]', id, direction);
      this._id = id;
      this._direction = direction;
      this._extendedRtpCapabilities = extendedRtpCapabilities;
      this._canProduceByKind = canProduceByKind;
      this._maxSctpMessageSize = sctpParameters ? sctpParameters.maxMessageSize : null; // Clone and sanitize additionalSettings.

      additionalSettings = utils.clone(additionalSettings);
      delete additionalSettings.iceServers;
      delete additionalSettings.iceTransportPolicy;
      delete additionalSettings.bundlePolicy;
      delete additionalSettings.rtcpMuxPolicy;
      delete additionalSettings.sdpSemantics;
      this._handler = handlerFactory();

      this._handler.run({
        direction,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
        iceServers,
        iceTransportPolicy,
        additionalSettings,
        proprietaryConstraints,
        extendedRtpCapabilities
      });

      this._appData = appData;

      this._handleHandler();
    }
    /**
     * Transport id.
     */


    get id() {
      return this._id;
    }
    /**
     * Whether the Transport is closed.
     */


    get closed() {
      return this._closed;
    }
    /**
     * Transport direction.
     */


    get direction() {
      return this._direction;
    }
    /**
     * RTC handler instance.
     */


    get handler() {
      return this._handler;
    }
    /**
     * Connection state.
     */


    get connectionState() {
      return this._connectionState;
    }
    /**
     * App custom data.
     */


    get appData() {
      return this._appData;
    }
    /**
     * Invalid setter.
     */


    set appData(appData) {
      throw new Error('cannot override appData object');
    }
    /**
     * Close the Transport.
     */


    close() {
      if (this._closed) return;
      logger.debug('close()');
      this._closed = true; // Close the AwaitQueue.

      this._awaitQueue.close(); // Close the handler.


      this._handler.close(); // Close all Producers.


      for (const producer of this._producers.values()) {
        producer.transportClosed();
      }

      this._producers.clear(); // Close all Consumers.


      for (const consumer of this._consumers.values()) {
        consumer.transportClosed();
      }

      this._consumers.clear(); // Close all DataProducers.


      for (const dataProducer of this._dataProducers.values()) {
        dataProducer.transportClosed();
      }

      this._dataProducers.clear(); // Close all DataConsumers.


      for (const dataConsumer of this._dataConsumers.values()) {
        dataConsumer.transportClosed();
      }

      this._dataConsumers.clear();
    }
    /**
     * Get associated Transport (RTCPeerConnection) stats.
     *
     * @returns {RTCStatsReport}
     */


    async getStats() {
      if (this._closed) throw new errors.InvalidStateError('closed');
      return this._handler.getTransportStats();
    }
    /**
     * Restart ICE connection.
     */


    async restartIce({
      iceParameters
    }) {
      logger.debug('restartIce()');
      if (this._closed) throw new errors.InvalidStateError('closed');else if (!iceParameters) throw new TypeError('missing iceParameters'); // Enqueue command.

      return this._awaitQueue.push(async () => this._handler.restartIce(iceParameters));
    }
    /**
     * Update ICE servers.
     */


    async updateIceServers({
      iceServers
    } = {}) {
      logger.debug('updateIceServers()');
      if (this._closed) throw new errors.InvalidStateError('closed');else if (!Array.isArray(iceServers)) throw new TypeError('missing iceServers'); // Enqueue command.

      return this._awaitQueue.push(async () => this._handler.updateIceServers(iceServers));
    }
    /**
     * Create a Producer.
     */


    async produce({
      track,
      encodings,
      codecOptions,
      codec,
      stopTracks = true,
      disableTrackOnPause = true,
      zeroRtpOnPause = false,
      appData = {}
    } = {}) {
      logger.debug('produce() [track:%o]', track);
      if (!track) throw new TypeError('missing track');else if (this._direction !== 'send') throw new errors.UnsupportedError('not a sending Transport');else if (!this._canProduceByKind[track.kind]) throw new errors.UnsupportedError(`cannot produce ${track.kind}`);else if (track.readyState === 'ended') throw new errors.InvalidStateError('track ended');else if (this.listenerCount('connect') === 0 && this._connectionState === 'new') throw new TypeError('no "connect" listener set into this transport');else if (this.listenerCount('produce') === 0) throw new TypeError('no "produce" listener set into this transport');else if (appData && typeof appData !== 'object') throw new TypeError('if given, appData must be an object'); // Enqueue command.

      return this._awaitQueue.push(async () => {
        let normalizedEncodings;

        if (encodings && !Array.isArray(encodings)) {
          throw TypeError('encodings must be an array');
        } else if (encodings && encodings.length === 0) {
          normalizedEncodings = undefined;
        } else if (encodings) {
          normalizedEncodings = encodings.map(encoding => {
            const normalizedEncoding = {
              active: true
            };
            if (encoding.active === false) normalizedEncoding.active = false;
            if (typeof encoding.dtx === 'boolean') normalizedEncoding.dtx = encoding.dtx;
            if (typeof encoding.scalabilityMode === 'string') normalizedEncoding.scalabilityMode = encoding.scalabilityMode;
            if (typeof encoding.scaleResolutionDownBy === 'number') normalizedEncoding.scaleResolutionDownBy = encoding.scaleResolutionDownBy;
            if (typeof encoding.maxBitrate === 'number') normalizedEncoding.maxBitrate = encoding.maxBitrate;
            if (typeof encoding.maxFramerate === 'number') normalizedEncoding.maxFramerate = encoding.maxFramerate;
            if (typeof encoding.adaptivePtime === 'boolean') normalizedEncoding.adaptivePtime = encoding.adaptivePtime;
            if (typeof encoding.priority === 'string') normalizedEncoding.priority = encoding.priority;
            if (typeof encoding.networkPriority === 'string') normalizedEncoding.networkPriority = encoding.networkPriority;
            return normalizedEncoding;
          });
        }

        const {
          localId,
          rtpParameters,
          rtpSender
        } = await this._handler.send({
          track,
          encodings: normalizedEncodings,
          codecOptions,
          codec
        });

        try {
          // This will fill rtpParameters's missing fields with default values.
          ortc.validateRtpParameters(rtpParameters);
          const {
            id
          } = await this.safeEmitAsPromise('produce', {
            kind: track.kind,
            rtpParameters,
            appData
          });
          const producer = new Producer_1.Producer({
            id,
            localId,
            rtpSender,
            track,
            rtpParameters,
            stopTracks,
            disableTrackOnPause,
            zeroRtpOnPause,
            appData
          });

          this._producers.set(producer.id, producer);

          this._handleProducer(producer);

          return producer;
        } catch (error) {
          this._handler.stopSending(localId).catch(() => {});

          throw error;
        }
      }) // This catch is needed to stop the given track if the command above
      // failed due to closed Transport.
      .catch(error => {
        if (stopTracks) {
          try {
            track.stop();
          } catch (error2) {}
        }

        throw error;
      });
    }
    /**
     * Create a Consumer to consume a remote Producer.
     */


    async consume({
      id,
      producerId,
      kind,
      rtpParameters,
      appData = {}
    }) {
      logger.debug('consume()');
      if (this._closed) throw new errors.InvalidStateError('closed');else if (this._direction !== 'recv') throw new errors.UnsupportedError('not a receiving Transport');else if (typeof id !== 'string') throw new TypeError('missing id');else if (typeof producerId !== 'string') throw new TypeError('missing producerId');else if (kind !== 'audio' && kind !== 'video') throw new TypeError(`invalid kind '${kind}'`);else if (this.listenerCount('connect') === 0 && this._connectionState === 'new') throw new TypeError('no "connect" listener set into this transport');else if (appData && typeof appData !== 'object') throw new TypeError('if given, appData must be an object'); // Enqueue command.

      return this._awaitQueue.push(async () => {
        // Ensure the device can consume it.
        const canConsume = ortc.canReceive(rtpParameters, this._extendedRtpCapabilities);
        if (!canConsume) throw new errors.UnsupportedError('cannot consume this Producer');
        const {
          localId,
          rtpReceiver,
          track
        } = await this._handler.receive({
          trackId: id,
          kind,
          rtpParameters
        });
        const consumer = new Consumer_1.Consumer({
          id,
          localId,
          producerId,
          rtpReceiver,
          track,
          rtpParameters,
          appData
        });

        this._consumers.set(consumer.id, consumer);

        this._handleConsumer(consumer); // If this is the first video Consumer and the Consumer for RTP probation
        // has not yet been created, create it now.


        if (!this._probatorConsumerCreated && kind === 'video') {
          try {
            const probatorRtpParameters = ortc.generateProbatorRtpParameters(consumer.rtpParameters);
            await this._handler.receive({
              trackId: 'probator',
              kind: 'video',
              rtpParameters: probatorRtpParameters
            });
            logger.debug('consume() | Consumer for RTP probation created');
            this._probatorConsumerCreated = true;
          } catch (error) {
            logger.error('consume() | failed to create Consumer for RTP probation:%o', error);
          }
        }

        return consumer;
      });
    }
    /**
     * Create a DataProducer
     */


    async produceData({
      ordered = true,
      maxPacketLifeTime,
      maxRetransmits,
      priority = 'low',
      label = '',
      protocol = '',
      appData = {}
    } = {}) {
      logger.debug('produceData()');
      if (this._direction !== 'send') throw new errors.UnsupportedError('not a sending Transport');else if (!this._maxSctpMessageSize) throw new errors.UnsupportedError('SCTP not enabled by remote Transport');else if (!['very-low', 'low', 'medium', 'high'].includes(priority)) throw new TypeError('wrong priority');else if (this.listenerCount('connect') === 0 && this._connectionState === 'new') throw new TypeError('no "connect" listener set into this transport');else if (this.listenerCount('producedata') === 0) throw new TypeError('no "producedata" listener set into this transport');else if (appData && typeof appData !== 'object') throw new TypeError('if given, appData must be an object');
      if (maxPacketLifeTime || maxRetransmits) ordered = false; // Enqueue command.

      return this._awaitQueue.push(async () => {
        const {
          dataChannel,
          sctpStreamParameters
        } = await this._handler.sendDataChannel({
          ordered,
          maxPacketLifeTime,
          maxRetransmits,
          priority,
          label,
          protocol
        }); // This will fill sctpStreamParameters's missing fields with default values.

        ortc.validateSctpStreamParameters(sctpStreamParameters);
        const {
          id
        } = await this.safeEmitAsPromise('producedata', {
          sctpStreamParameters,
          label,
          protocol,
          appData
        });
        const dataProducer = new DataProducer_1.DataProducer({
          id,
          dataChannel,
          sctpStreamParameters,
          appData
        });

        this._dataProducers.set(dataProducer.id, dataProducer);

        this._handleDataProducer(dataProducer);

        return dataProducer;
      });
    }
    /**
     * Create a DataConsumer
     */


    async consumeData({
      id,
      dataProducerId,
      sctpStreamParameters,
      label = '',
      protocol = '',
      appData = {}
    }) {
      logger.debug('consumeData()');
      if (this._closed) throw new errors.InvalidStateError('closed');else if (this._direction !== 'recv') throw new errors.UnsupportedError('not a receiving Transport');else if (!this._maxSctpMessageSize) throw new errors.UnsupportedError('SCTP not enabled by remote Transport');else if (typeof id !== 'string') throw new TypeError('missing id');else if (typeof dataProducerId !== 'string') throw new TypeError('missing dataProducerId');else if (this.listenerCount('connect') === 0 && this._connectionState === 'new') throw new TypeError('no "connect" listener set into this transport');else if (appData && typeof appData !== 'object') throw new TypeError('if given, appData must be an object'); // This may throw.

      ortc.validateSctpStreamParameters(sctpStreamParameters); // Enqueue command.

      return this._awaitQueue.push(async () => {
        const {
          dataChannel
        } = await this._handler.receiveDataChannel({
          sctpStreamParameters,
          label,
          protocol
        });
        const dataConsumer = new DataConsumer_1.DataConsumer({
          id,
          dataProducerId,
          dataChannel,
          sctpStreamParameters,
          appData
        });

        this._dataConsumers.set(dataConsumer.id, dataConsumer);

        this._handleDataConsumer(dataConsumer);

        return dataConsumer;
      });
    }

    _handleHandler() {
      const handler = this._handler;
      handler.on('@connect', ({
        dtlsParameters
      }, callback, errback) => {
        if (this._closed) {
          errback(new errors.InvalidStateError('closed'));
          return;
        }

        this.safeEmit('connect', {
          dtlsParameters
        }, callback, errback);
      });
      handler.on('@connectionstatechange', connectionState => {
        if (connectionState === this._connectionState) return;
        logger.debug('connection state changed to %s', connectionState);
        this._connectionState = connectionState;
        if (!this._closed) this.safeEmit('connectionstatechange', connectionState);
      });
    }

    _handleProducer(producer) {
      producer.on('@close', () => {
        this._producers.delete(producer.id);

        if (this._closed) return;

        this._awaitQueue.push(async () => this._handler.stopSending(producer.localId)).catch(error => logger.warn('producer.close() failed:%o', error));
      });
      producer.on('@replacetrack', (track, callback, errback) => {
        this._awaitQueue.push(async () => this._handler.replaceTrack(producer.localId, track)).then(callback).catch(errback);
      });
      producer.on('@setmaxspatiallayer', (spatialLayer, callback, errback) => {
        this._awaitQueue.push(async () => this._handler.setMaxSpatialLayer(producer.localId, spatialLayer)).then(callback).catch(errback);
      });
      producer.on('@setrtpencodingparameters', (params, callback, errback) => {
        this._awaitQueue.push(async () => this._handler.setRtpEncodingParameters(producer.localId, params)).then(callback).catch(errback);
      });
      producer.on('@getstats', (callback, errback) => {
        if (this._closed) return errback(new errors.InvalidStateError('closed'));

        this._handler.getSenderStats(producer.localId).then(callback).catch(errback);
      });
    }

    _handleConsumer(consumer) {
      consumer.on('@close', () => {
        this._consumers.delete(consumer.id);

        if (this._closed) return;

        this._awaitQueue.push(async () => this._handler.stopReceiving(consumer.localId)).catch(() => {});
      });
      consumer.on('@getstats', (callback, errback) => {
        if (this._closed) return errback(new errors.InvalidStateError('closed'));

        this._handler.getReceiverStats(consumer.localId).then(callback).catch(errback);
      });
    }

    _handleDataProducer(dataProducer) {
      dataProducer.on('@close', () => {
        this._dataProducers.delete(dataProducer.id);
      });
    }

    _handleDataConsumer(dataConsumer) {
      dataConsumer.on('@close', () => {
        this._dataConsumers.delete(dataConsumer.id);
      });
    }

  }

  exports.Transport = Transport;
});

var grammar_1 = createCommonjsModule(function (module) {
  var grammar = module.exports = {
    v: [{
      name: 'version',
      reg: /^(\d*)$/
    }],
    o: [{
      // o=- 20518 0 IN IP4 203.0.113.1
      // NB: sessionId will be a String in most cases because it is huge
      name: 'origin',
      reg: /^(\S*) (\d*) (\d*) (\S*) IP(\d) (\S*)/,
      names: ['username', 'sessionId', 'sessionVersion', 'netType', 'ipVer', 'address'],
      format: '%s %s %d %s IP%d %s'
    }],
    // default parsing of these only (though some of these feel outdated)
    s: [{
      name: 'name'
    }],
    i: [{
      name: 'description'
    }],
    u: [{
      name: 'uri'
    }],
    e: [{
      name: 'email'
    }],
    p: [{
      name: 'phone'
    }],
    z: [{
      name: 'timezones'
    }],
    // TODO: this one can actually be parsed properly...
    r: [{
      name: 'repeats'
    }],
    // TODO: this one can also be parsed properly
    // k: [{}], // outdated thing ignored
    t: [{
      // t=0 0
      name: 'timing',
      reg: /^(\d*) (\d*)/,
      names: ['start', 'stop'],
      format: '%d %d'
    }],
    c: [{
      // c=IN IP4 10.47.197.26
      name: 'connection',
      reg: /^IN IP(\d) (\S*)/,
      names: ['version', 'ip'],
      format: 'IN IP%d %s'
    }],
    b: [{
      // b=AS:4000
      push: 'bandwidth',
      reg: /^(TIAS|AS|CT|RR|RS):(\d*)/,
      names: ['type', 'limit'],
      format: '%s:%s'
    }],
    m: [{
      // m=video 51744 RTP/AVP 126 97 98 34 31
      // NB: special - pushes to session
      // TODO: rtp/fmtp should be filtered by the payloads found here?
      reg: /^(\w*) (\d*) ([\w/]*)(?: (.*))?/,
      names: ['type', 'port', 'protocol', 'payloads'],
      format: '%s %d %s %s'
    }],
    a: [{
      // a=rtpmap:110 opus/48000/2
      push: 'rtp',
      reg: /^rtpmap:(\d*) ([\w\-.]*)(?:\s*\/(\d*)(?:\s*\/(\S*))?)?/,
      names: ['payload', 'codec', 'rate', 'encoding'],
      format: function (o) {
        return o.encoding ? 'rtpmap:%d %s/%s/%s' : o.rate ? 'rtpmap:%d %s/%s' : 'rtpmap:%d %s';
      }
    }, {
      // a=fmtp:108 profile-level-id=24;object=23;bitrate=64000
      // a=fmtp:111 minptime=10; useinbandfec=1
      push: 'fmtp',
      reg: /^fmtp:(\d*) ([\S| ]*)/,
      names: ['payload', 'config'],
      format: 'fmtp:%d %s'
    }, {
      // a=control:streamid=0
      name: 'control',
      reg: /^control:(.*)/,
      format: 'control:%s'
    }, {
      // a=rtcp:65179 IN IP4 193.84.77.194
      name: 'rtcp',
      reg: /^rtcp:(\d*)(?: (\S*) IP(\d) (\S*))?/,
      names: ['port', 'netType', 'ipVer', 'address'],
      format: function (o) {
        return o.address != null ? 'rtcp:%d %s IP%d %s' : 'rtcp:%d';
      }
    }, {
      // a=rtcp-fb:98 trr-int 100
      push: 'rtcpFbTrrInt',
      reg: /^rtcp-fb:(\*|\d*) trr-int (\d*)/,
      names: ['payload', 'value'],
      format: 'rtcp-fb:%d trr-int %d'
    }, {
      // a=rtcp-fb:98 nack rpsi
      push: 'rtcpFb',
      reg: /^rtcp-fb:(\*|\d*) ([\w-_]*)(?: ([\w-_]*))?/,
      names: ['payload', 'type', 'subtype'],
      format: function (o) {
        return o.subtype != null ? 'rtcp-fb:%s %s %s' : 'rtcp-fb:%s %s';
      }
    }, {
      // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
      // a=extmap:1/recvonly URI-gps-string
      // a=extmap:3 urn:ietf:params:rtp-hdrext:encrypt urn:ietf:params:rtp-hdrext:smpte-tc 25@600/24
      push: 'ext',
      reg: /^extmap:(\d+)(?:\/(\w+))?(?: (urn:ietf:params:rtp-hdrext:encrypt))? (\S*)(?: (\S*))?/,
      names: ['value', 'direction', 'encrypt-uri', 'uri', 'config'],
      format: function (o) {
        return 'extmap:%d' + (o.direction ? '/%s' : '%v') + (o['encrypt-uri'] ? ' %s' : '%v') + ' %s' + (o.config ? ' %s' : '');
      }
    }, {
      // a=extmap-allow-mixed
      name: 'extmapAllowMixed',
      reg: /^(extmap-allow-mixed)/
    }, {
      // a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:PS1uQCVeeCFCanVmcjkpPywjNWhcYD0mXXtxaVBR|2^20|1:32
      push: 'crypto',
      reg: /^crypto:(\d*) ([\w_]*) (\S*)(?: (\S*))?/,
      names: ['id', 'suite', 'config', 'sessionConfig'],
      format: function (o) {
        return o.sessionConfig != null ? 'crypto:%d %s %s %s' : 'crypto:%d %s %s';
      }
    }, {
      // a=setup:actpass
      name: 'setup',
      reg: /^setup:(\w*)/,
      format: 'setup:%s'
    }, {
      // a=connection:new
      name: 'connectionType',
      reg: /^connection:(new|existing)/,
      format: 'connection:%s'
    }, {
      // a=mid:1
      name: 'mid',
      reg: /^mid:([^\s]*)/,
      format: 'mid:%s'
    }, {
      // a=msid:0c8b064d-d807-43b4-b434-f92a889d8587 98178685-d409-46e0-8e16-7ef0db0db64a
      name: 'msid',
      reg: /^msid:(.*)/,
      format: 'msid:%s'
    }, {
      // a=ptime:20
      name: 'ptime',
      reg: /^ptime:(\d*(?:\.\d*)*)/,
      format: 'ptime:%d'
    }, {
      // a=maxptime:60
      name: 'maxptime',
      reg: /^maxptime:(\d*(?:\.\d*)*)/,
      format: 'maxptime:%d'
    }, {
      // a=sendrecv
      name: 'direction',
      reg: /^(sendrecv|recvonly|sendonly|inactive)/
    }, {
      // a=ice-lite
      name: 'icelite',
      reg: /^(ice-lite)/
    }, {
      // a=ice-ufrag:F7gI
      name: 'iceUfrag',
      reg: /^ice-ufrag:(\S*)/,
      format: 'ice-ufrag:%s'
    }, {
      // a=ice-pwd:x9cml/YzichV2+XlhiMu8g
      name: 'icePwd',
      reg: /^ice-pwd:(\S*)/,
      format: 'ice-pwd:%s'
    }, {
      // a=fingerprint:SHA-1 00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33
      name: 'fingerprint',
      reg: /^fingerprint:(\S*) (\S*)/,
      names: ['type', 'hash'],
      format: 'fingerprint:%s %s'
    }, {
      // a=candidate:0 1 UDP 2113667327 203.0.113.1 54400 typ host
      // a=candidate:1162875081 1 udp 2113937151 192.168.34.75 60017 typ host generation 0 network-id 3 network-cost 10
      // a=candidate:3289912957 2 udp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 generation 0 network-id 3 network-cost 10
      // a=candidate:229815620 1 tcp 1518280447 192.168.150.19 60017 typ host tcptype active generation 0 network-id 3 network-cost 10
      // a=candidate:3289912957 2 tcp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 tcptype passive generation 0 network-id 3 network-cost 10
      push: 'candidates',
      reg: /^candidate:(\S*) (\d*) (\S*) (\d*) (\S*) (\d*) typ (\S*)(?: raddr (\S*) rport (\d*))?(?: tcptype (\S*))?(?: generation (\d*))?(?: network-id (\d*))?(?: network-cost (\d*))?/,
      names: ['foundation', 'component', 'transport', 'priority', 'ip', 'port', 'type', 'raddr', 'rport', 'tcptype', 'generation', 'network-id', 'network-cost'],
      format: function (o) {
        var str = 'candidate:%s %d %s %d %s %d typ %s';
        str += o.raddr != null ? ' raddr %s rport %d' : '%v%v'; // NB: candidate has three optional chunks, so %void middles one if it's missing

        str += o.tcptype != null ? ' tcptype %s' : '%v';

        if (o.generation != null) {
          str += ' generation %d';
        }

        str += o['network-id'] != null ? ' network-id %d' : '%v';
        str += o['network-cost'] != null ? ' network-cost %d' : '%v';
        return str;
      }
    }, {
      // a=end-of-candidates (keep after the candidates line for readability)
      name: 'endOfCandidates',
      reg: /^(end-of-candidates)/
    }, {
      // a=remote-candidates:1 203.0.113.1 54400 2 203.0.113.1 54401 ...
      name: 'remoteCandidates',
      reg: /^remote-candidates:(.*)/,
      format: 'remote-candidates:%s'
    }, {
      // a=ice-options:google-ice
      name: 'iceOptions',
      reg: /^ice-options:(\S*)/,
      format: 'ice-options:%s'
    }, {
      // a=ssrc:2566107569 cname:t9YU8M1UxTF8Y1A1
      push: 'ssrcs',
      reg: /^ssrc:(\d*) ([\w_-]*)(?::(.*))?/,
      names: ['id', 'attribute', 'value'],
      format: function (o) {
        var str = 'ssrc:%d';

        if (o.attribute != null) {
          str += ' %s';

          if (o.value != null) {
            str += ':%s';
          }
        }

        return str;
      }
    }, {
      // a=ssrc-group:FEC 1 2
      // a=ssrc-group:FEC-FR 3004364195 1080772241
      push: 'ssrcGroups',
      // token-char = %x21 / %x23-27 / %x2A-2B / %x2D-2E / %x30-39 / %x41-5A / %x5E-7E
      reg: /^ssrc-group:([\x21\x23\x24\x25\x26\x27\x2A\x2B\x2D\x2E\w]*) (.*)/,
      names: ['semantics', 'ssrcs'],
      format: 'ssrc-group:%s %s'
    }, {
      // a=msid-semantic: WMS Jvlam5X3SX1OP6pn20zWogvaKJz5Hjf9OnlV
      name: 'msidSemantic',
      reg: /^msid-semantic:\s?(\w*) (\S*)/,
      names: ['semantic', 'token'],
      format: 'msid-semantic: %s %s' // space after ':' is not accidental

    }, {
      // a=group:BUNDLE audio video
      push: 'groups',
      reg: /^group:(\w*) (.*)/,
      names: ['type', 'mids'],
      format: 'group:%s %s'
    }, {
      // a=rtcp-mux
      name: 'rtcpMux',
      reg: /^(rtcp-mux)/
    }, {
      // a=rtcp-rsize
      name: 'rtcpRsize',
      reg: /^(rtcp-rsize)/
    }, {
      // a=sctpmap:5000 webrtc-datachannel 1024
      name: 'sctpmap',
      reg: /^sctpmap:([\w_/]*) (\S*)(?: (\S*))?/,
      names: ['sctpmapNumber', 'app', 'maxMessageSize'],
      format: function (o) {
        return o.maxMessageSize != null ? 'sctpmap:%s %s %s' : 'sctpmap:%s %s';
      }
    }, {
      // a=x-google-flag:conference
      name: 'xGoogleFlag',
      reg: /^x-google-flag:([^\s]*)/,
      format: 'x-google-flag:%s'
    }, {
      // a=rid:1 send max-width=1280;max-height=720;max-fps=30;depend=0
      push: 'rids',
      reg: /^rid:([\d\w]+) (\w+)(?: ([\S| ]*))?/,
      names: ['id', 'direction', 'params'],
      format: function (o) {
        return o.params ? 'rid:%s %s %s' : 'rid:%s %s';
      }
    }, {
      // a=imageattr:97 send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320] recv [x=330,y=250]
      // a=imageattr:* send [x=800,y=640] recv *
      // a=imageattr:100 recv [x=320,y=240]
      push: 'imageattrs',
      reg: new RegExp( // a=imageattr:97
      '^imageattr:(\\d+|\\*)' + // send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320]
      '[\\s\\t]+(send|recv)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*)' + // recv [x=330,y=250]
      '(?:[\\s\\t]+(recv|send)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*))?'),
      names: ['pt', 'dir1', 'attrs1', 'dir2', 'attrs2'],
      format: function (o) {
        return 'imageattr:%s %s %s' + (o.dir2 ? ' %s %s' : '');
      }
    }, {
      // a=simulcast:send 1,2,3;~4,~5 recv 6;~7,~8
      // a=simulcast:recv 1;4,5 send 6;7
      name: 'simulcast',
      reg: new RegExp( // a=simulcast:
      '^simulcast:' + // send 1,2,3;~4,~5
      '(send|recv) ([a-zA-Z0-9\\-_~;,]+)' + // space + recv 6;~7,~8
      '(?:\\s?(send|recv) ([a-zA-Z0-9\\-_~;,]+))?' + // end
      '$'),
      names: ['dir1', 'list1', 'dir2', 'list2'],
      format: function (o) {
        return 'simulcast:%s %s' + (o.dir2 ? ' %s %s' : '');
      }
    }, {
      // old simulcast draft 03 (implemented by Firefox)
      //   https://tools.ietf.org/html/draft-ietf-mmusic-sdp-simulcast-03
      // a=simulcast: recv pt=97;98 send pt=97
      // a=simulcast: send rid=5;6;7 paused=6,7
      name: 'simulcast_03',
      reg: /^simulcast:[\s\t]+([\S+\s\t]+)$/,
      names: ['value'],
      format: 'simulcast: %s'
    }, {
      // a=framerate:25
      // a=framerate:29.97
      name: 'framerate',
      reg: /^framerate:(\d+(?:$|\.\d+))/,
      format: 'framerate:%s'
    }, {
      // RFC4570
      // a=source-filter: incl IN IP4 239.5.2.31 10.1.15.5
      name: 'sourceFilter',
      reg: /^source-filter: *(excl|incl) (\S*) (IP4|IP6|\*) (\S*) (.*)/,
      names: ['filterMode', 'netType', 'addressTypes', 'destAddress', 'srcList'],
      format: 'source-filter: %s %s %s %s %s'
    }, {
      // a=bundle-only
      name: 'bundleOnly',
      reg: /^(bundle-only)/
    }, {
      // a=label:1
      name: 'label',
      reg: /^label:(.+)/,
      format: 'label:%s'
    }, {
      // RFC version 26 for SCTP over DTLS
      // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-5
      name: 'sctpPort',
      reg: /^sctp-port:(\d+)$/,
      format: 'sctp-port:%s'
    }, {
      // RFC version 26 for SCTP over DTLS
      // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-6
      name: 'maxMessageSize',
      reg: /^max-message-size:(\d+)$/,
      format: 'max-message-size:%s'
    }, {
      // RFC7273
      // a=ts-refclk:ptp=IEEE1588-2008:39-A7-94-FF-FE-07-CB-D0:37
      push: 'tsRefClocks',
      reg: /^ts-refclk:([^\s=]*)(?:=(\S*))?/,
      names: ['clksrc', 'clksrcExt'],
      format: function (o) {
        return 'ts-refclk:%s' + (o.clksrcExt != null ? '=%s' : '');
      }
    }, {
      // RFC7273
      // a=mediaclk:direct=963214424
      name: 'mediaClk',
      reg: /^mediaclk:(?:id=(\S*))? *([^\s=]*)(?:=(\S*))?(?: *rate=(\d+)\/(\d+))?/,
      names: ['id', 'mediaClockName', 'mediaClockValue', 'rateNumerator', 'rateDenominator'],
      format: function (o) {
        var str = 'mediaclk:';
        str += o.id != null ? 'id=%s %s' : '%v%s';
        str += o.mediaClockValue != null ? '=%s' : '';
        str += o.rateNumerator != null ? ' rate=%s' : '';
        str += o.rateDenominator != null ? '/%s' : '';
        return str;
      }
    }, {
      // a=keywds:keywords
      name: 'keywords',
      reg: /^keywds:(.+)$/,
      format: 'keywds:%s'
    }, {
      // a=content:main
      name: 'content',
      reg: /^content:(.+)/,
      format: 'content:%s'
    }, // BFCP https://tools.ietf.org/html/rfc4583
    {
      // a=floorctrl:c-s
      name: 'bfcpFloorCtrl',
      reg: /^floorctrl:(c-only|s-only|c-s)/,
      format: 'floorctrl:%s'
    }, {
      // a=confid:1
      name: 'bfcpConfId',
      reg: /^confid:(\d+)/,
      format: 'confid:%s'
    }, {
      // a=userid:1
      name: 'bfcpUserId',
      reg: /^userid:(\d+)/,
      format: 'userid:%s'
    }, {
      // a=floorid:1
      name: 'bfcpFloorId',
      reg: /^floorid:(.+) (?:m-stream|mstrm):(.+)/,
      names: ['id', 'mStream'],
      format: 'floorid:%s mstrm:%s'
    }, {
      // any a= that we don't understand is kept verbatim on media.invalid
      push: 'invalid',
      names: ['value']
    }]
  }; // set sensible defaults to avoid polluting the grammar with boring details

  Object.keys(grammar).forEach(function (key) {
    var objs = grammar[key];
    objs.forEach(function (obj) {
      if (!obj.reg) {
        obj.reg = /(.*)/;
      }

      if (!obj.format) {
        obj.format = '%s';
      }
    });
  });
});

var parser$1 = createCommonjsModule(function (module, exports) {
  var toIntIfInt = function (v) {
    return String(Number(v)) === v ? Number(v) : v;
  };

  var attachProperties = function (match, location, names, rawName) {
    if (rawName && !names) {
      location[rawName] = toIntIfInt(match[1]);
    } else {
      for (var i = 0; i < names.length; i += 1) {
        if (match[i + 1] != null) {
          location[names[i]] = toIntIfInt(match[i + 1]);
        }
      }
    }
  };

  var parseReg = function (obj, location, content) {
    var needsBlank = obj.name && obj.names;

    if (obj.push && !location[obj.push]) {
      location[obj.push] = [];
    } else if (needsBlank && !location[obj.name]) {
      location[obj.name] = {};
    }

    var keyLocation = obj.push ? {} : // blank object that will be pushed
    needsBlank ? location[obj.name] : location; // otherwise, named location or root

    attachProperties(content.match(obj.reg), keyLocation, obj.names, obj.name);

    if (obj.push) {
      location[obj.push].push(keyLocation);
    }
  };

  var validLine = RegExp.prototype.test.bind(/^([a-z])=(.*)/);

  exports.parse = function (sdp) {
    var session = {},
        media = [],
        location = session; // points at where properties go under (one of the above)
    // parse lines we understand

    sdp.split(/(\r\n|\r|\n)/).filter(validLine).forEach(function (l) {
      var type = l[0];
      var content = l.slice(2);

      if (type === 'm') {
        media.push({
          rtp: [],
          fmtp: []
        });
        location = media[media.length - 1]; // point at latest media line
      }

      for (var j = 0; j < (grammar_1[type] || []).length; j += 1) {
        var obj = grammar_1[type][j];

        if (obj.reg.test(content)) {
          return parseReg(obj, location, content);
        }
      }
    });
    session.media = media; // link it up

    return session;
  };

  var paramReducer = function (acc, expr) {
    var s = expr.split(/=(.+)/, 2);

    if (s.length === 2) {
      acc[s[0]] = toIntIfInt(s[1]);
    } else if (s.length === 1 && expr.length > 1) {
      acc[s[0]] = undefined;
    }

    return acc;
  };

  exports.parseParams = function (str) {
    return str.split(/;\s?/).reduce(paramReducer, {});
  }; // For backward compatibility - alias will be removed in 3.0.0


  exports.parseFmtpConfig = exports.parseParams;

  exports.parsePayloads = function (str) {
    return str.toString().split(' ').map(Number);
  };

  exports.parseRemoteCandidates = function (str) {
    var candidates = [];
    var parts = str.split(' ').map(toIntIfInt);

    for (var i = 0; i < parts.length; i += 3) {
      candidates.push({
        component: parts[i],
        ip: parts[i + 1],
        port: parts[i + 2]
      });
    }

    return candidates;
  };

  exports.parseImageAttributes = function (str) {
    return str.split(' ').map(function (item) {
      return item.substring(1, item.length - 1).split(',').reduce(paramReducer, {});
    });
  };

  exports.parseSimulcastStreamList = function (str) {
    return str.split(';').map(function (stream) {
      return stream.split(',').map(function (format) {
        var scid,
            paused = false;

        if (format[0] !== '~') {
          scid = toIntIfInt(format);
        } else {
          scid = toIntIfInt(format.substring(1, format.length));
          paused = true;
        }

        return {
          scid: scid,
          paused: paused
        };
      });
    });
  };
});

var formatRegExp = /%[sdv%]/g;

var format = function (formatStr) {
  var i = 1;
  var args = arguments;
  var len = args.length;
  return formatStr.replace(formatRegExp, function (x) {
    if (i >= len) {
      return x; // missing argument
    }

    var arg = args[i];
    i += 1;

    switch (x) {
      case '%%':
        return '%';

      case '%s':
        return String(arg);

      case '%d':
        return Number(arg);

      case '%v':
        return '';
    }
  }); // NB: we discard excess arguments - they are typically undefined from makeLine
};

var makeLine = function (type, obj, location) {
  var str = obj.format instanceof Function ? obj.format(obj.push ? location : location[obj.name]) : obj.format;
  var args = [type + '=' + str];

  if (obj.names) {
    for (var i = 0; i < obj.names.length; i += 1) {
      var n = obj.names[i];

      if (obj.name) {
        args.push(location[obj.name][n]);
      } else {
        // for mLine and push attributes
        args.push(location[obj.names[i]]);
      }
    }
  } else {
    args.push(location[obj.name]);
  }

  return format.apply(null, args);
}; // RFC specified order
// TODO: extend this with all the rest


var defaultOuterOrder = ['v', 'o', 's', 'i', 'u', 'e', 'p', 'c', 'b', 't', 'r', 'z', 'a'];
var defaultInnerOrder = ['i', 'c', 'b', 'a'];

var writer = function (session, opts) {
  opts = opts || {}; // ensure certain properties exist

  if (session.version == null) {
    session.version = 0; // 'v=0' must be there (only defined version atm)
  }

  if (session.name == null) {
    session.name = ' '; // 's= ' must be there if no meaningful name set
  }

  session.media.forEach(function (mLine) {
    if (mLine.payloads == null) {
      mLine.payloads = '';
    }
  });
  var outerOrder = opts.outerOrder || defaultOuterOrder;
  var innerOrder = opts.innerOrder || defaultInnerOrder;
  var sdp = []; // loop through outerOrder for matching properties on session

  outerOrder.forEach(function (type) {
    grammar_1[type].forEach(function (obj) {
      if (obj.name in session && session[obj.name] != null) {
        sdp.push(makeLine(type, obj, session));
      } else if (obj.push in session && session[obj.push] != null) {
        session[obj.push].forEach(function (el) {
          sdp.push(makeLine(type, obj, el));
        });
      }
    });
  }); // then for each media line, follow the innerOrder

  session.media.forEach(function (mLine) {
    sdp.push(makeLine('m', grammar_1.m[0], mLine));
    innerOrder.forEach(function (type) {
      grammar_1[type].forEach(function (obj) {
        if (obj.name in mLine && mLine[obj.name] != null) {
          sdp.push(makeLine(type, obj, mLine));
        } else if (obj.push in mLine && mLine[obj.push] != null) {
          mLine[obj.push].forEach(function (el) {
            sdp.push(makeLine(type, obj, el));
          });
        }
      });
    });
  });
  return sdp.join('\r\n') + '\r\n';
};

var write$1 = writer;
var parse$2 = parser$1.parse;
var parseParams = parser$1.parseParams;
var parseFmtpConfig = parser$1.parseFmtpConfig; // Alias of parseParams().

var parsePayloads = parser$1.parsePayloads;
var parseRemoteCandidates = parser$1.parseRemoteCandidates;
var parseImageAttributes = parser$1.parseImageAttributes;
var parseSimulcastStreamList = parser$1.parseSimulcastStreamList;
var lib$3 = {
  write: write$1,
  parse: parse$2,
  parseParams: parseParams,
  parseFmtpConfig: parseFmtpConfig,
  parsePayloads: parsePayloads,
  parseRemoteCandidates: parseRemoteCandidates,
  parseImageAttributes: parseImageAttributes,
  parseSimulcastStreamList: parseSimulcastStreamList
};

var commonUtils = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function extractRtpCapabilities({
    sdpObject
  }) {
    // Map of RtpCodecParameters indexed by payload type.
    const codecsMap = new Map(); // Array of RtpHeaderExtensions.

    const headerExtensions = []; // Whether a m=audio/video section has been already found.

    let gotAudio = false;
    let gotVideo = false;

    for (const m of sdpObject.media) {
      const kind = m.type;

      switch (kind) {
        case 'audio':
          {
            if (gotAudio) continue;
            gotAudio = true;
            break;
          }

        case 'video':
          {
            if (gotVideo) continue;
            gotVideo = true;
            break;
          }

        default:
          {
            continue;
          }
      } // Get codecs.


      for (const rtp of m.rtp) {
        const codec = {
          kind: kind,
          mimeType: `${kind}/${rtp.codec}`,
          preferredPayloadType: rtp.payload,
          clockRate: rtp.rate,
          channels: rtp.encoding,
          parameters: {},
          rtcpFeedback: []
        };
        codecsMap.set(codec.preferredPayloadType, codec);
      } // Get codec parameters.


      for (const fmtp of m.fmtp || []) {
        const parameters = lib$3.parseParams(fmtp.config);
        const codec = codecsMap.get(fmtp.payload);
        if (!codec) continue; // Specials case to convert parameter value to string.

        if (parameters && parameters['profile-level-id']) parameters['profile-level-id'] = String(parameters['profile-level-id']);
        codec.parameters = parameters;
      } // Get RTCP feedback for each codec.


      for (const fb of m.rtcpFb || []) {
        const codec = codecsMap.get(fb.payload);
        if (!codec) continue;
        const feedback = {
          type: fb.type,
          parameter: fb.subtype
        };
        if (!feedback.parameter) delete feedback.parameter;
        codec.rtcpFeedback.push(feedback);
      } // Get RTP header extensions.


      for (const ext of m.ext || []) {
        // Ignore encrypted extensions (not yet supported in mediasoup).
        if (ext['encrypt-uri']) continue;
        const headerExtension = {
          kind: kind,
          uri: ext.uri,
          preferredId: ext.value
        };
        headerExtensions.push(headerExtension);
      }
    }

    const rtpCapabilities = {
      codecs: Array.from(codecsMap.values()),
      headerExtensions: headerExtensions
    };
    return rtpCapabilities;
  }

  exports.extractRtpCapabilities = extractRtpCapabilities;

  function extractDtlsParameters({
    sdpObject
  }) {
    const mediaObject = (sdpObject.media || []).find(m => m.iceUfrag && m.port !== 0);
    if (!mediaObject) throw new Error('no active media section found');
    const fingerprint = mediaObject.fingerprint || sdpObject.fingerprint;
    let role;

    switch (mediaObject.setup) {
      case 'active':
        role = 'client';
        break;

      case 'passive':
        role = 'server';
        break;

      case 'actpass':
        role = 'auto';
        break;
    }

    const dtlsParameters = {
      role,
      fingerprints: [{
        algorithm: fingerprint.type,
        value: fingerprint.hash
      }]
    };
    return dtlsParameters;
  }

  exports.extractDtlsParameters = extractDtlsParameters;

  function getCname({
    offerMediaObject
  }) {
    const ssrcCnameLine = (offerMediaObject.ssrcs || []).find(line => line.attribute === 'cname');
    if (!ssrcCnameLine) return '';
    return ssrcCnameLine.value;
  }

  exports.getCname = getCname;
  /**
   * Apply codec parameters in the given SDP m= section answer based on the
   * given RTP parameters of an offer.
   */

  function applyCodecParameters({
    offerRtpParameters,
    answerMediaObject
  }) {
    for (const codec of offerRtpParameters.codecs) {
      const mimeType = codec.mimeType.toLowerCase(); // Avoid parsing codec parameters for unhandled codecs.

      if (mimeType !== 'audio/opus') continue;
      const rtp = (answerMediaObject.rtp || []).find(r => r.payload === codec.payloadType);
      if (!rtp) continue; // Just in case.

      answerMediaObject.fmtp = answerMediaObject.fmtp || [];
      let fmtp = answerMediaObject.fmtp.find(f => f.payload === codec.payloadType);

      if (!fmtp) {
        fmtp = {
          payload: codec.payloadType,
          config: ''
        };
        answerMediaObject.fmtp.push(fmtp);
      }

      const parameters = lib$3.parseParams(fmtp.config);

      switch (mimeType) {
        case 'audio/opus':
          {
            const spropStereo = codec.parameters['sprop-stereo'];
            if (spropStereo !== undefined) parameters.stereo = spropStereo ? 1 : 0;
            break;
          }
      } // Write the codec fmtp.config back.


      fmtp.config = '';

      for (const key of Object.keys(parameters)) {
        if (fmtp.config) fmtp.config += ';';
        fmtp.config += `${key}=${parameters[key]}`;
      }
    }
  }

  exports.applyCodecParameters = applyCodecParameters;
});

var unifiedPlanUtils = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function getRtpEncodings({
    offerMediaObject
  }) {
    const ssrcs = new Set();

    for (const line of offerMediaObject.ssrcs || []) {
      const ssrc = line.id;
      ssrcs.add(ssrc);
    }

    if (ssrcs.size === 0) throw new Error('no a=ssrc lines found');
    const ssrcToRtxSsrc = new Map(); // First assume RTX is used.

    for (const line of offerMediaObject.ssrcGroups || []) {
      if (line.semantics !== 'FID') continue;
      let [ssrc, rtxSsrc] = line.ssrcs.split(/\s+/);
      ssrc = Number(ssrc);
      rtxSsrc = Number(rtxSsrc);

      if (ssrcs.has(ssrc)) {
        // Remove both the SSRC and RTX SSRC from the set so later we know that they
        // are already handled.
        ssrcs.delete(ssrc);
        ssrcs.delete(rtxSsrc); // Add to the map.

        ssrcToRtxSsrc.set(ssrc, rtxSsrc);
      }
    } // If the set of SSRCs is not empty it means that RTX is not being used, so take
    // media SSRCs from there.


    for (const ssrc of ssrcs) {
      // Add to the map.
      ssrcToRtxSsrc.set(ssrc, null);
    }

    const encodings = [];

    for (const [ssrc, rtxSsrc] of ssrcToRtxSsrc) {
      const encoding = {
        ssrc
      };
      if (rtxSsrc) encoding.rtx = {
        ssrc: rtxSsrc
      };
      encodings.push(encoding);
    }

    return encodings;
  }

  exports.getRtpEncodings = getRtpEncodings;
  /**
   * Adds multi-ssrc based simulcast into the given SDP media section offer.
   */

  function addLegacySimulcast({
    offerMediaObject,
    numStreams
  }) {
    if (numStreams <= 1) throw new TypeError('numStreams must be greater than 1'); // Get the SSRC.

    const ssrcMsidLine = (offerMediaObject.ssrcs || []).find(line => line.attribute === 'msid');
    if (!ssrcMsidLine) throw new Error('a=ssrc line with msid information not found');
    const [streamId, trackId] = ssrcMsidLine.value.split(' ')[0];
    const firstSsrc = ssrcMsidLine.id;
    let firstRtxSsrc; // Get the SSRC for RTX.

    (offerMediaObject.ssrcGroups || []).some(line => {
      if (line.semantics !== 'FID') return false;
      const ssrcs = line.ssrcs.split(/\s+/);

      if (Number(ssrcs[0]) === firstSsrc) {
        firstRtxSsrc = Number(ssrcs[1]);
        return true;
      } else {
        return false;
      }
    });
    const ssrcCnameLine = offerMediaObject.ssrcs.find(line => line.attribute === 'cname');
    if (!ssrcCnameLine) throw new Error('a=ssrc line with cname information not found');
    const cname = ssrcCnameLine.value;
    const ssrcs = [];
    const rtxSsrcs = [];

    for (let i = 0; i < numStreams; ++i) {
      ssrcs.push(firstSsrc + i);
      if (firstRtxSsrc) rtxSsrcs.push(firstRtxSsrc + i);
    }

    offerMediaObject.ssrcGroups = [];
    offerMediaObject.ssrcs = [];
    offerMediaObject.ssrcGroups.push({
      semantics: 'SIM',
      ssrcs: ssrcs.join(' ')
    });

    for (let i = 0; i < ssrcs.length; ++i) {
      const ssrc = ssrcs[i];
      offerMediaObject.ssrcs.push({
        id: ssrc,
        attribute: 'cname',
        value: cname
      });
      offerMediaObject.ssrcs.push({
        id: ssrc,
        attribute: 'msid',
        value: `${streamId} ${trackId}`
      });
    }

    for (let i = 0; i < rtxSsrcs.length; ++i) {
      const ssrc = ssrcs[i];
      const rtxSsrc = rtxSsrcs[i];
      offerMediaObject.ssrcs.push({
        id: rtxSsrc,
        attribute: 'cname',
        value: cname
      });
      offerMediaObject.ssrcs.push({
        id: rtxSsrc,
        attribute: 'msid',
        value: `${streamId} ${trackId}`
      });
      offerMediaObject.ssrcGroups.push({
        semantics: 'FID',
        ssrcs: `${ssrc} ${rtxSsrc}`
      });
    }
  }

  exports.addLegacySimulcast = addLegacySimulcast;
});

var HandlerInterface_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  class HandlerInterface extends EnhancedEventEmitter_1.EnhancedEventEmitter {
    /**
     * @emits @connect - (
     *     { dtlsParameters: DtlsParameters },
     *     callback: Function,
     *     errback: Function
     *   )
     * @emits @connectionstatechange - (connectionState: ConnectionState)
     */
    constructor() {
      super();
    }

  }

  exports.HandlerInterface = HandlerInterface;
});

var MediaSection_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  class MediaSection {
    constructor({
      iceParameters,
      iceCandidates,
      dtlsParameters,
      planB = false
    }) {
      this._mediaObject = {};
      this._planB = planB;

      if (iceParameters) {
        this.setIceParameters(iceParameters);
      }

      if (iceCandidates) {
        this._mediaObject.candidates = [];

        for (const candidate of iceCandidates) {
          const candidateObject = {}; // mediasoup does mandates rtcp-mux so candidates component is always
          // RTP (1).

          candidateObject.component = 1;
          candidateObject.foundation = candidate.foundation;
          candidateObject.ip = candidate.ip;
          candidateObject.port = candidate.port;
          candidateObject.priority = candidate.priority;
          candidateObject.transport = candidate.protocol;
          candidateObject.type = candidate.type;
          if (candidate.tcpType) candidateObject.tcptype = candidate.tcpType;

          this._mediaObject.candidates.push(candidateObject);
        }

        this._mediaObject.endOfCandidates = 'end-of-candidates';
        this._mediaObject.iceOptions = 'renomination';
      }

      if (dtlsParameters) {
        this.setDtlsRole(dtlsParameters.role);
      }
    }

    get mid() {
      return String(this._mediaObject.mid);
    }

    get closed() {
      return this._mediaObject.port === 0;
    }

    getObject() {
      return this._mediaObject;
    }

    setIceParameters(iceParameters) {
      this._mediaObject.iceUfrag = iceParameters.usernameFragment;
      this._mediaObject.icePwd = iceParameters.password;
    }

    disable() {
      this._mediaObject.direction = 'inactive';
      delete this._mediaObject.ext;
      delete this._mediaObject.ssrcs;
      delete this._mediaObject.ssrcGroups;
      delete this._mediaObject.simulcast;
      delete this._mediaObject.simulcast_03;
      delete this._mediaObject.rids;
    }

    close() {
      this._mediaObject.direction = 'inactive';
      this._mediaObject.port = 0;
      delete this._mediaObject.ext;
      delete this._mediaObject.ssrcs;
      delete this._mediaObject.ssrcGroups;
      delete this._mediaObject.simulcast;
      delete this._mediaObject.simulcast_03;
      delete this._mediaObject.rids;
      delete this._mediaObject.extmapAllowMixed;
    }

  }

  exports.MediaSection = MediaSection;

  class AnswerMediaSection extends MediaSection {
    constructor({
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      plainRtpParameters,
      planB = false,
      offerMediaObject,
      offerRtpParameters,
      answerRtpParameters,
      codecOptions,
      extmapAllowMixed = false
    }) {
      super({
        iceParameters,
        iceCandidates,
        dtlsParameters,
        planB
      });
      this._mediaObject.mid = String(offerMediaObject.mid);
      this._mediaObject.type = offerMediaObject.type;
      this._mediaObject.protocol = offerMediaObject.protocol;

      if (!plainRtpParameters) {
        this._mediaObject.connection = {
          ip: '127.0.0.1',
          version: 4
        };
        this._mediaObject.port = 7;
      } else {
        this._mediaObject.connection = {
          ip: plainRtpParameters.ip,
          version: plainRtpParameters.ipVersion
        };
        this._mediaObject.port = plainRtpParameters.port;
      }

      switch (offerMediaObject.type) {
        case 'audio':
        case 'video':
          {
            this._mediaObject.direction = 'recvonly';
            this._mediaObject.rtp = [];
            this._mediaObject.rtcpFb = [];
            this._mediaObject.fmtp = [];

            for (const codec of answerRtpParameters.codecs) {
              const rtp = {
                payload: codec.payloadType,
                codec: getCodecName(codec),
                rate: codec.clockRate
              };
              if (codec.channels > 1) rtp.encoding = codec.channels;

              this._mediaObject.rtp.push(rtp);

              const codecParameters = utils.clone(codec.parameters || {});

              if (codecOptions) {
                const {
                  opusStereo,
                  opusFec,
                  opusDtx,
                  opusMaxPlaybackRate,
                  opusPtime,
                  videoGoogleStartBitrate,
                  videoGoogleMaxBitrate,
                  videoGoogleMinBitrate
                } = codecOptions;
                const offerCodec = offerRtpParameters.codecs.find(c => c.payloadType === codec.payloadType);

                switch (codec.mimeType.toLowerCase()) {
                  case 'audio/opus':
                    {
                      if (opusStereo !== undefined) {
                        offerCodec.parameters['sprop-stereo'] = opusStereo ? 1 : 0;
                        codecParameters.stereo = opusStereo ? 1 : 0;
                      }

                      if (opusFec !== undefined) {
                        offerCodec.parameters.useinbandfec = opusFec ? 1 : 0;
                        codecParameters.useinbandfec = opusFec ? 1 : 0;
                      }

                      if (opusDtx !== undefined) {
                        offerCodec.parameters.usedtx = opusDtx ? 1 : 0;
                        codecParameters.usedtx = opusDtx ? 1 : 0;
                      }

                      if (opusMaxPlaybackRate !== undefined) {
                        codecParameters.maxplaybackrate = opusMaxPlaybackRate;
                      }

                      if (opusPtime !== undefined) {
                        offerCodec.parameters.ptime = opusPtime;
                        codecParameters.ptime = opusPtime;
                      }

                      break;
                    }

                  case 'video/vp8':
                  case 'video/vp9':
                  case 'video/h264':
                  case 'video/h265':
                    {
                      if (videoGoogleStartBitrate !== undefined) codecParameters['x-google-start-bitrate'] = videoGoogleStartBitrate;
                      if (videoGoogleMaxBitrate !== undefined) codecParameters['x-google-max-bitrate'] = videoGoogleMaxBitrate;
                      if (videoGoogleMinBitrate !== undefined) codecParameters['x-google-min-bitrate'] = videoGoogleMinBitrate;
                      break;
                    }
                }
              }

              const fmtp = {
                payload: codec.payloadType,
                config: ''
              };

              for (const key of Object.keys(codecParameters)) {
                if (fmtp.config) fmtp.config += ';';
                fmtp.config += `${key}=${codecParameters[key]}`;
              }

              if (fmtp.config) this._mediaObject.fmtp.push(fmtp);

              for (const fb of codec.rtcpFeedback) {
                this._mediaObject.rtcpFb.push({
                  payload: codec.payloadType,
                  type: fb.type,
                  subtype: fb.parameter
                });
              }
            }

            this._mediaObject.payloads = answerRtpParameters.codecs.map(codec => codec.payloadType).join(' ');
            this._mediaObject.ext = [];

            for (const ext of answerRtpParameters.headerExtensions) {
              // Don't add a header extension if not present in the offer.
              const found = (offerMediaObject.ext || []).some(localExt => localExt.uri === ext.uri);
              if (!found) continue;

              this._mediaObject.ext.push({
                uri: ext.uri,
                value: ext.id
              });
            } // Allow both 1 byte and 2 bytes length header extensions.


            if (extmapAllowMixed && offerMediaObject.extmapAllowMixed === 'extmap-allow-mixed') {
              this._mediaObject.extmapAllowMixed = 'extmap-allow-mixed';
            } // Simulcast.


            if (offerMediaObject.simulcast) {
              this._mediaObject.simulcast = {
                dir1: 'recv',
                list1: offerMediaObject.simulcast.list1
              };
              this._mediaObject.rids = [];

              for (const rid of offerMediaObject.rids || []) {
                if (rid.direction !== 'send') continue;

                this._mediaObject.rids.push({
                  id: rid.id,
                  direction: 'recv'
                });
              }
            } // Simulcast (draft version 03).
            else if (offerMediaObject.simulcast_03) {
                // eslint-disable-next-line camelcase
                this._mediaObject.simulcast_03 = {
                  value: offerMediaObject.simulcast_03.value.replace(/send/g, 'recv')
                };
                this._mediaObject.rids = [];

                for (const rid of offerMediaObject.rids || []) {
                  if (rid.direction !== 'send') continue;

                  this._mediaObject.rids.push({
                    id: rid.id,
                    direction: 'recv'
                  });
                }
              }

            this._mediaObject.rtcpMux = 'rtcp-mux';
            this._mediaObject.rtcpRsize = 'rtcp-rsize';
            if (this._planB && this._mediaObject.type === 'video') this._mediaObject.xGoogleFlag = 'conference';
            break;
          }

        case 'application':
          {
            // New spec.
            if (typeof offerMediaObject.sctpPort === 'number') {
              this._mediaObject.payloads = 'webrtc-datachannel';
              this._mediaObject.sctpPort = sctpParameters.port;
              this._mediaObject.maxMessageSize = sctpParameters.maxMessageSize;
            } // Old spec.
            else if (offerMediaObject.sctpmap) {
                this._mediaObject.payloads = sctpParameters.port;
                this._mediaObject.sctpmap = {
                  app: 'webrtc-datachannel',
                  sctpmapNumber: sctpParameters.port,
                  maxMessageSize: sctpParameters.maxMessageSize
                };
              }

            break;
          }
      }
    }

    setDtlsRole(role) {
      switch (role) {
        case 'client':
          this._mediaObject.setup = 'active';
          break;

        case 'server':
          this._mediaObject.setup = 'passive';
          break;

        case 'auto':
          this._mediaObject.setup = 'actpass';
          break;
      }
    }

  }

  exports.AnswerMediaSection = AnswerMediaSection;

  class OfferMediaSection extends MediaSection {
    constructor({
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      plainRtpParameters,
      planB = false,
      mid,
      kind,
      offerRtpParameters,
      streamId,
      trackId,
      oldDataChannelSpec = false
    }) {
      super({
        iceParameters,
        iceCandidates,
        dtlsParameters,
        planB
      });
      this._mediaObject.mid = String(mid);
      this._mediaObject.type = kind;

      if (!plainRtpParameters) {
        this._mediaObject.connection = {
          ip: '127.0.0.1',
          version: 4
        };
        if (!sctpParameters) this._mediaObject.protocol = 'UDP/TLS/RTP/SAVPF';else this._mediaObject.protocol = 'UDP/DTLS/SCTP';
        this._mediaObject.port = 7;
      } else {
        this._mediaObject.connection = {
          ip: plainRtpParameters.ip,
          version: plainRtpParameters.ipVersion
        };
        this._mediaObject.protocol = 'RTP/AVP';
        this._mediaObject.port = plainRtpParameters.port;
      }

      switch (kind) {
        case 'audio':
        case 'video':
          {
            this._mediaObject.direction = 'sendonly';
            this._mediaObject.rtp = [];
            this._mediaObject.rtcpFb = [];
            this._mediaObject.fmtp = [];
            if (!this._planB) this._mediaObject.msid = `${streamId || '-'} ${trackId}`;

            for (const codec of offerRtpParameters.codecs) {
              const rtp = {
                payload: codec.payloadType,
                codec: getCodecName(codec),
                rate: codec.clockRate
              };
              if (codec.channels > 1) rtp.encoding = codec.channels;

              this._mediaObject.rtp.push(rtp);

              const fmtp = {
                payload: codec.payloadType,
                config: ''
              };

              for (const key of Object.keys(codec.parameters)) {
                if (fmtp.config) fmtp.config += ';';
                fmtp.config += `${key}=${codec.parameters[key]}`;
              }

              if (fmtp.config) this._mediaObject.fmtp.push(fmtp);

              for (const fb of codec.rtcpFeedback) {
                this._mediaObject.rtcpFb.push({
                  payload: codec.payloadType,
                  type: fb.type,
                  subtype: fb.parameter
                });
              }
            }

            this._mediaObject.payloads = offerRtpParameters.codecs.map(codec => codec.payloadType).join(' ');
            this._mediaObject.ext = [];

            for (const ext of offerRtpParameters.headerExtensions) {
              this._mediaObject.ext.push({
                uri: ext.uri,
                value: ext.id
              });
            }

            this._mediaObject.rtcpMux = 'rtcp-mux';
            this._mediaObject.rtcpRsize = 'rtcp-rsize';
            const encoding = offerRtpParameters.encodings[0];
            const ssrc = encoding.ssrc;
            const rtxSsrc = encoding.rtx && encoding.rtx.ssrc ? encoding.rtx.ssrc : undefined;
            this._mediaObject.ssrcs = [];
            this._mediaObject.ssrcGroups = [];

            if (offerRtpParameters.rtcp.cname) {
              this._mediaObject.ssrcs.push({
                id: ssrc,
                attribute: 'cname',
                value: offerRtpParameters.rtcp.cname
              });
            }

            if (this._planB) {
              this._mediaObject.ssrcs.push({
                id: ssrc,
                attribute: 'msid',
                value: `${streamId || '-'} ${trackId}`
              });
            }

            if (rtxSsrc) {
              if (offerRtpParameters.rtcp.cname) {
                this._mediaObject.ssrcs.push({
                  id: rtxSsrc,
                  attribute: 'cname',
                  value: offerRtpParameters.rtcp.cname
                });
              }

              if (this._planB) {
                this._mediaObject.ssrcs.push({
                  id: rtxSsrc,
                  attribute: 'msid',
                  value: `${streamId || '-'} ${trackId}`
                });
              } // Associate original and retransmission SSRCs.


              this._mediaObject.ssrcGroups.push({
                semantics: 'FID',
                ssrcs: `${ssrc} ${rtxSsrc}`
              });
            }

            break;
          }

        case 'application':
          {
            // New spec.
            if (!oldDataChannelSpec) {
              this._mediaObject.payloads = 'webrtc-datachannel';
              this._mediaObject.sctpPort = sctpParameters.port;
              this._mediaObject.maxMessageSize = sctpParameters.maxMessageSize;
            } // Old spec.
            else {
                this._mediaObject.payloads = sctpParameters.port;
                this._mediaObject.sctpmap = {
                  app: 'webrtc-datachannel',
                  sctpmapNumber: sctpParameters.port,
                  maxMessageSize: sctpParameters.maxMessageSize
                };
              }

            break;
          }
      }
    } // eslint-disable-next-line @typescript-eslint/no-unused-vars


    setDtlsRole(role) {
      // Always 'actpass'.
      this._mediaObject.setup = 'actpass';
    }

    planBReceive({
      offerRtpParameters,
      streamId,
      trackId
    }) {
      const encoding = offerRtpParameters.encodings[0];
      const ssrc = encoding.ssrc;
      const rtxSsrc = encoding.rtx && encoding.rtx.ssrc ? encoding.rtx.ssrc : undefined;

      if (offerRtpParameters.rtcp.cname) {
        this._mediaObject.ssrcs.push({
          id: ssrc,
          attribute: 'cname',
          value: offerRtpParameters.rtcp.cname
        });
      }

      this._mediaObject.ssrcs.push({
        id: ssrc,
        attribute: 'msid',
        value: `${streamId || '-'} ${trackId}`
      });

      if (rtxSsrc) {
        if (offerRtpParameters.rtcp.cname) {
          this._mediaObject.ssrcs.push({
            id: rtxSsrc,
            attribute: 'cname',
            value: offerRtpParameters.rtcp.cname
          });
        }

        this._mediaObject.ssrcs.push({
          id: rtxSsrc,
          attribute: 'msid',
          value: `${streamId || '-'} ${trackId}`
        }); // Associate original and retransmission SSRCs.


        this._mediaObject.ssrcGroups.push({
          semantics: 'FID',
          ssrcs: `${ssrc} ${rtxSsrc}`
        });
      }
    }

    planBStopReceiving({
      offerRtpParameters
    }) {
      const encoding = offerRtpParameters.encodings[0];
      const ssrc = encoding.ssrc;
      const rtxSsrc = encoding.rtx && encoding.rtx.ssrc ? encoding.rtx.ssrc : undefined;
      this._mediaObject.ssrcs = this._mediaObject.ssrcs.filter(s => s.id !== ssrc && s.id !== rtxSsrc);

      if (rtxSsrc) {
        this._mediaObject.ssrcGroups = this._mediaObject.ssrcGroups.filter(group => group.ssrcs !== `${ssrc} ${rtxSsrc}`);
      }
    }

  }

  exports.OfferMediaSection = OfferMediaSection;

  function getCodecName(codec) {
    const MimeTypeRegex = new RegExp('^(audio|video)/(.+)', 'i');
    const mimeTypeMatch = MimeTypeRegex.exec(codec.mimeType);
    if (!mimeTypeMatch) throw new TypeError('invalid codec.mimeType');
    return mimeTypeMatch[2];
  }
});

var RemoteSdp_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('RemoteSdp');

  class RemoteSdp {
    constructor({
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      plainRtpParameters,
      planB = false
    }) {
      // MediaSection instances.
      this._mediaSections = []; // MediaSection indices indexed by MID.

      this._midToIndex = new Map();
      this._iceParameters = iceParameters;
      this._iceCandidates = iceCandidates;
      this._dtlsParameters = dtlsParameters;
      this._sctpParameters = sctpParameters;
      this._plainRtpParameters = plainRtpParameters;
      this._planB = planB;
      this._sdpObject = {
        version: 0,
        origin: {
          address: '0.0.0.0',
          ipVer: 4,
          netType: 'IN',
          sessionId: 10000,
          sessionVersion: 0,
          username: 'mediasoup-client'
        },
        name: '-',
        timing: {
          start: 0,
          stop: 0
        },
        media: []
      }; // If ICE parameters are given, add ICE-Lite indicator.

      if (iceParameters && iceParameters.iceLite) {
        this._sdpObject.icelite = 'ice-lite';
      } // If DTLS parameters are given, assume WebRTC and BUNDLE.


      if (dtlsParameters) {
        this._sdpObject.msidSemantic = {
          semantic: 'WMS',
          token: '*'
        }; // NOTE: We take the latest fingerprint.

        const numFingerprints = this._dtlsParameters.fingerprints.length;
        this._sdpObject.fingerprint = {
          type: dtlsParameters.fingerprints[numFingerprints - 1].algorithm,
          hash: dtlsParameters.fingerprints[numFingerprints - 1].value
        };
        this._sdpObject.groups = [{
          type: 'BUNDLE',
          mids: ''
        }];
      } // If there are plain RPT parameters, override SDP origin.


      if (plainRtpParameters) {
        this._sdpObject.origin.address = plainRtpParameters.ip;
        this._sdpObject.origin.ipVer = plainRtpParameters.ipVersion;
      }
    }

    updateIceParameters(iceParameters) {
      logger.debug('updateIceParameters() [iceParameters:%o]', iceParameters);
      this._iceParameters = iceParameters;
      this._sdpObject.icelite = iceParameters.iceLite ? 'ice-lite' : undefined;

      for (const mediaSection of this._mediaSections) {
        mediaSection.setIceParameters(iceParameters);
      }
    }

    updateDtlsRole(role) {
      logger.debug('updateDtlsRole() [role:%s]', role);
      this._dtlsParameters.role = role;

      for (const mediaSection of this._mediaSections) {
        mediaSection.setDtlsRole(role);
      }
    }

    getNextMediaSectionIdx() {
      // If a closed media section is found, return its index.
      for (let idx = 0; idx < this._mediaSections.length; ++idx) {
        const mediaSection = this._mediaSections[idx];
        if (mediaSection.closed) return {
          idx,
          reuseMid: mediaSection.mid
        };
      } // If no closed media section is found, return next one.


      return {
        idx: this._mediaSections.length
      };
    }

    send({
      offerMediaObject,
      reuseMid,
      offerRtpParameters,
      answerRtpParameters,
      codecOptions,
      extmapAllowMixed = false
    }) {
      const mediaSection = new MediaSection_1.AnswerMediaSection({
        iceParameters: this._iceParameters,
        iceCandidates: this._iceCandidates,
        dtlsParameters: this._dtlsParameters,
        plainRtpParameters: this._plainRtpParameters,
        planB: this._planB,
        offerMediaObject,
        offerRtpParameters,
        answerRtpParameters,
        codecOptions,
        extmapAllowMixed
      }); // Unified-Plan with closed media section replacement.

      if (reuseMid) {
        this._replaceMediaSection(mediaSection, reuseMid);
      } // Unified-Plan or Plan-B with different media kind.
      else if (!this._midToIndex.has(mediaSection.mid)) {
          this._addMediaSection(mediaSection);
        } // Plan-B with same media kind.
        else {
            this._replaceMediaSection(mediaSection);
          }
    }

    receive({
      mid,
      kind,
      offerRtpParameters,
      streamId,
      trackId
    }) {
      const idx = this._midToIndex.get(mid);

      let mediaSection;
      if (idx !== undefined) mediaSection = this._mediaSections[idx]; // Unified-Plan or different media kind.

      if (!mediaSection) {
        mediaSection = new MediaSection_1.OfferMediaSection({
          iceParameters: this._iceParameters,
          iceCandidates: this._iceCandidates,
          dtlsParameters: this._dtlsParameters,
          plainRtpParameters: this._plainRtpParameters,
          planB: this._planB,
          mid,
          kind,
          offerRtpParameters,
          streamId,
          trackId
        });

        this._addMediaSection(mediaSection);
      } // Plan-B.
      else {
          mediaSection.planBReceive({
            offerRtpParameters,
            streamId,
            trackId
          });

          this._replaceMediaSection(mediaSection);
        }
    }

    disableMediaSection(mid) {
      const idx = this._midToIndex.get(mid);

      if (idx === undefined) {
        throw new Error(`no media section found with mid '${mid}'`);
      }

      const mediaSection = this._mediaSections[idx];
      mediaSection.disable();
    }

    closeMediaSection(mid) {
      const idx = this._midToIndex.get(mid);

      if (idx === undefined) {
        throw new Error(`no media section found with mid '${mid}'`);
      }

      const mediaSection = this._mediaSections[idx]; // NOTE: Closing the first m section is a pain since it invalidates the
      // bundled transport, so let's avoid it.

      if (mid === this._firstMid) {
        logger.debug('closeMediaSection() | cannot close first media section, disabling it instead [mid:%s]', mid);
        this.disableMediaSection(mid);
        return;
      }

      mediaSection.close(); // Regenerate BUNDLE mids.

      this._regenerateBundleMids();
    }

    planBStopReceiving({
      mid,
      offerRtpParameters
    }) {
      const idx = this._midToIndex.get(mid);

      if (idx === undefined) {
        throw new Error(`no media section found with mid '${mid}'`);
      }

      const mediaSection = this._mediaSections[idx];
      mediaSection.planBStopReceiving({
        offerRtpParameters
      });

      this._replaceMediaSection(mediaSection);
    }

    sendSctpAssociation({
      offerMediaObject
    }) {
      const mediaSection = new MediaSection_1.AnswerMediaSection({
        iceParameters: this._iceParameters,
        iceCandidates: this._iceCandidates,
        dtlsParameters: this._dtlsParameters,
        sctpParameters: this._sctpParameters,
        plainRtpParameters: this._plainRtpParameters,
        offerMediaObject
      });

      this._addMediaSection(mediaSection);
    }

    receiveSctpAssociation({
      oldDataChannelSpec = false
    } = {}) {
      const mediaSection = new MediaSection_1.OfferMediaSection({
        iceParameters: this._iceParameters,
        iceCandidates: this._iceCandidates,
        dtlsParameters: this._dtlsParameters,
        sctpParameters: this._sctpParameters,
        plainRtpParameters: this._plainRtpParameters,
        mid: 'datachannel',
        kind: 'application',
        oldDataChannelSpec
      });

      this._addMediaSection(mediaSection);
    }

    getSdp() {
      // Increase SDP version.
      this._sdpObject.origin.sessionVersion++;
      return lib$3.write(this._sdpObject);
    }

    _addMediaSection(newMediaSection) {
      if (!this._firstMid) this._firstMid = newMediaSection.mid; // Add to the vector.

      this._mediaSections.push(newMediaSection); // Add to the map.


      this._midToIndex.set(newMediaSection.mid, this._mediaSections.length - 1); // Add to the SDP object.


      this._sdpObject.media.push(newMediaSection.getObject()); // Regenerate BUNDLE mids.


      this._regenerateBundleMids();
    }

    _replaceMediaSection(newMediaSection, reuseMid) {
      // Store it in the map.
      if (typeof reuseMid === 'string') {
        const idx = this._midToIndex.get(reuseMid);

        if (idx === undefined) {
          throw new Error(`no media section found for reuseMid '${reuseMid}'`);
        }

        const oldMediaSection = this._mediaSections[idx]; // Replace the index in the vector with the new media section.

        this._mediaSections[idx] = newMediaSection; // Update the map.

        this._midToIndex.delete(oldMediaSection.mid);

        this._midToIndex.set(newMediaSection.mid, idx); // Update the SDP object.


        this._sdpObject.media[idx] = newMediaSection.getObject(); // Regenerate BUNDLE mids.

        this._regenerateBundleMids();
      } else {
        const idx = this._midToIndex.get(newMediaSection.mid);

        if (idx === undefined) {
          throw new Error(`no media section found with mid '${newMediaSection.mid}'`);
        } // Replace the index in the vector with the new media section.


        this._mediaSections[idx] = newMediaSection; // Update the SDP object.

        this._sdpObject.media[idx] = newMediaSection.getObject();
      }
    }

    _regenerateBundleMids() {
      if (!this._dtlsParameters) return;
      this._sdpObject.groups[0].mids = this._mediaSections.filter(mediaSection => !mediaSection.closed).map(mediaSection => mediaSection.mid).join(' ');
    }

  }

  exports.RemoteSdp = RemoteSdp;
});

var scalabilityModes = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const ScalabilityModeRegex = new RegExp('^[LS]([1-9]\\d{0,1})T([1-9]\\d{0,1})');

  function parse(scalabilityMode) {
    const match = ScalabilityModeRegex.exec(scalabilityMode || '');

    if (match) {
      return {
        spatialLayers: Number(match[1]),
        temporalLayers: Number(match[2])
      };
    } else {
      return {
        spatialLayers: 1,
        temporalLayers: 1
      };
    }
  }

  exports.parse = parse;
});

var Chrome74_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('Chrome74');
  const SCTP_NUM_STREAMS = {
    OS: 1024,
    MIS: 1024
  };

  class Chrome74 extends HandlerInterface_1.HandlerInterface {
    constructor() {
      super(); // Map of RTCTransceivers indexed by MID.

      this._mapMidTransceiver = new Map(); // Local stream for sending.

      this._sendStream = new MediaStream(); // Whether a DataChannel m=application section has been created.

      this._hasDataChannelMediaSection = false; // Sending DataChannel id value counter. Incremented for each new DataChannel.

      this._nextSendSctpStreamId = 0; // Got transport local and remote parameters.

      this._transportReady = false;
    }
    /**
     * Creates a factory function.
     */


    static createFactory() {
      return () => new Chrome74();
    }

    get name() {
      return 'Chrome74';
    }

    close() {
      logger.debug('close()'); // Close RTCPeerConnection.

      if (this._pc) {
        try {
          this._pc.close();
        } catch (error) {}
      }
    }

    async getNativeRtpCapabilities() {
      logger.debug('getNativeRtpCapabilities()');
      const pc = new RTCPeerConnection({
        iceServers: [],
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        sdpSemantics: 'unified-plan'
      });

      try {
        pc.addTransceiver('audio');
        pc.addTransceiver('video');
        const offer = await pc.createOffer();

        try {
          pc.close();
        } catch (error) {}

        const sdpObject = lib$3.parse(offer.sdp);
        const nativeRtpCapabilities = commonUtils.extractRtpCapabilities({
          sdpObject
        });
        return nativeRtpCapabilities;
      } catch (error) {
        try {
          pc.close();
        } catch (error2) {}

        throw error;
      }
    }

    async getNativeSctpCapabilities() {
      logger.debug('getNativeSctpCapabilities()');
      return {
        numStreams: SCTP_NUM_STREAMS
      };
    }

    run({
      direction,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers,
      iceTransportPolicy,
      additionalSettings,
      proprietaryConstraints,
      extendedRtpCapabilities
    }) {
      logger.debug('run()');
      this._direction = direction;
      this._remoteSdp = new RemoteSdp_1.RemoteSdp({
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters
      });
      this._sendingRtpParametersByKind = {
        audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
      };
      this._sendingRemoteRtpParametersByKind = {
        audio: ortc.getSendingRemoteRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRemoteRtpParameters('video', extendedRtpCapabilities)
      };
      this._pc = new RTCPeerConnection({
        iceServers: iceServers || [],
        iceTransportPolicy: iceTransportPolicy || 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        sdpSemantics: 'unified-plan',
        ...additionalSettings
      }, proprietaryConstraints); // Handle RTCPeerConnection connection status.

      this._pc.addEventListener('iceconnectionstatechange', () => {
        switch (this._pc.iceConnectionState) {
          case 'checking':
            this.emit('@connectionstatechange', 'connecting');
            break;

          case 'connected':
          case 'completed':
            this.emit('@connectionstatechange', 'connected');
            break;

          case 'failed':
            this.emit('@connectionstatechange', 'failed');
            break;

          case 'disconnected':
            this.emit('@connectionstatechange', 'disconnected');
            break;

          case 'closed':
            this.emit('@connectionstatechange', 'closed');
            break;
        }
      });
    }

    async updateIceServers(iceServers) {
      logger.debug('updateIceServers()');

      const configuration = this._pc.getConfiguration();

      configuration.iceServers = iceServers;

      this._pc.setConfiguration(configuration);
    }

    async restartIce(iceParameters) {
      logger.debug('restartIce()'); // Provide the remote SDP handler with new remote ICE parameters.

      this._remoteSdp.updateIceParameters(iceParameters);

      if (!this._transportReady) return;

      if (this._direction === 'send') {
        const offer = await this._pc.createOffer({
          iceRestart: true
        });
        logger.debug('restartIce() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);
        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
      } else {
        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug('restartIce() | calling pc.setLocalDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
      }
    }

    async getTransportStats() {
      return this._pc.getStats();
    }

    async send({
      track,
      encodings,
      codecOptions,
      codec
    }) {
      this._assertSendDirection();

      logger.debug('send() [kind:%s, track.id:%s]', track.kind, track.id);

      if (encodings && encodings.length > 1) {
        encodings.forEach((encoding, idx) => {
          encoding.rid = `r${idx}`;
        });
      }

      const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind]); // This may throw.

      sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs, codec);
      const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind]); // This may throw.

      sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs, codec);

      const mediaSectionIdx = this._remoteSdp.getNextMediaSectionIdx();

      const transceiver = this._pc.addTransceiver(track, {
        direction: 'sendonly',
        streams: [this._sendStream],
        sendEncodings: encodings
      });

      let offer = await this._pc.createOffer();
      let localSdpObject = lib$3.parse(offer.sdp);
      let offerMediaObject;
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'server',
        localSdpObject
      }); // Special case for VP9 with SVC.

      let hackVp9Svc = false;
      const layers = scalabilityModes.parse((encodings || [{}])[0].scalabilityMode);

      if (encodings && encodings.length === 1 && layers.spatialLayers > 1 && sendingRtpParameters.codecs[0].mimeType.toLowerCase() === 'video/vp9') {
        logger.debug('send() | enabling legacy simulcast for VP9 SVC');
        hackVp9Svc = true;
        localSdpObject = lib$3.parse(offer.sdp);
        offerMediaObject = localSdpObject.media[mediaSectionIdx.idx];
        unifiedPlanUtils.addLegacySimulcast({
          offerMediaObject,
          numStreams: layers.spatialLayers
        });
        offer = {
          type: 'offer',
          sdp: lib$3.write(localSdpObject)
        };
      }

      logger.debug('send() | calling pc.setLocalDescription() [offer:%o]', offer);
      await this._pc.setLocalDescription(offer); // We can now get the transceiver.mid.

      const localId = transceiver.mid; // Set MID.

      sendingRtpParameters.mid = localId;
      localSdpObject = lib$3.parse(this._pc.localDescription.sdp);
      offerMediaObject = localSdpObject.media[mediaSectionIdx.idx]; // Set RTCP CNAME.

      sendingRtpParameters.rtcp.cname = commonUtils.getCname({
        offerMediaObject
      }); // Set RTP encodings by parsing the SDP offer if no encodings are given.

      if (!encodings) {
        sendingRtpParameters.encodings = unifiedPlanUtils.getRtpEncodings({
          offerMediaObject
        });
      } // Set RTP encodings by parsing the SDP offer and complete them with given
      // one if just a single encoding has been given.
      else if (encodings.length === 1) {
          let newEncodings = unifiedPlanUtils.getRtpEncodings({
            offerMediaObject
          });
          Object.assign(newEncodings[0], encodings[0]); // Hack for VP9 SVC.

          if (hackVp9Svc) newEncodings = [newEncodings[0]];
          sendingRtpParameters.encodings = newEncodings;
        } // Otherwise if more than 1 encoding are given use them verbatim.
        else {
            sendingRtpParameters.encodings = encodings;
          } // If VP8 or H264 and there is effective simulcast, add scalabilityMode to
      // each encoding.


      if (sendingRtpParameters.encodings.length > 1 && (sendingRtpParameters.codecs[0].mimeType.toLowerCase() === 'video/vp8' || sendingRtpParameters.codecs[0].mimeType.toLowerCase() === 'video/h264')) {
        for (const encoding of sendingRtpParameters.encodings) {
          encoding.scalabilityMode = 'S1T3';
        }
      }

      this._remoteSdp.send({
        offerMediaObject,
        reuseMid: mediaSectionIdx.reuseMid,
        offerRtpParameters: sendingRtpParameters,
        answerRtpParameters: sendingRemoteRtpParameters,
        codecOptions,
        extmapAllowMixed: true
      });

      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('send() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer); // Store in the map.

      this._mapMidTransceiver.set(localId, transceiver);

      return {
        localId,
        rtpParameters: sendingRtpParameters,
        rtpSender: transceiver.sender
      };
    }

    async stopSending(localId) {
      this._assertSendDirection();

      logger.debug('stopSending() [localId:%s]', localId);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      transceiver.sender.replaceTrack(null);

      this._pc.removeTrack(transceiver.sender);

      this._remoteSdp.closeMediaSection(transceiver.mid);

      const offer = await this._pc.createOffer();
      logger.debug('stopSending() | calling pc.setLocalDescription() [offer:%o]', offer);
      await this._pc.setLocalDescription(offer);
      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopSending() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer);
    }

    async replaceTrack(localId, track) {
      this._assertSendDirection();

      if (track) {
        logger.debug('replaceTrack() [localId:%s, track.id:%s]', localId, track.id);
      } else {
        logger.debug('replaceTrack() [localId:%s, no track]', localId);
      }

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      await transceiver.sender.replaceTrack(track);
    }

    async setMaxSpatialLayer(localId, spatialLayer) {
      this._assertSendDirection();

      logger.debug('setMaxSpatialLayer() [localId:%s, spatialLayer:%s]', localId, spatialLayer);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      const parameters = transceiver.sender.getParameters();
      parameters.encodings.forEach((encoding, idx) => {
        if (idx <= spatialLayer) encoding.active = true;else encoding.active = false;
      });
      await transceiver.sender.setParameters(parameters);
    }

    async setRtpEncodingParameters(localId, params) {
      this._assertSendDirection();

      logger.debug('setRtpEncodingParameters() [localId:%s, params:%o]', localId, params);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      const parameters = transceiver.sender.getParameters();
      parameters.encodings.forEach((encoding, idx) => {
        parameters.encodings[idx] = { ...encoding,
          ...params
        };
      });
      await transceiver.sender.setParameters(parameters);
    }

    async getSenderStats(localId) {
      this._assertSendDirection();

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      return transceiver.sender.getStats();
    }

    async sendDataChannel({
      ordered,
      maxPacketLifeTime,
      maxRetransmits,
      label,
      protocol,
      priority
    }) {
      this._assertSendDirection();

      const options = {
        negotiated: true,
        id: this._nextSendSctpStreamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits,
        protocol,
        priority
      };
      logger.debug('sendDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // Increase next id.


      this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS; // If this is the first DataChannel we need to create the SDP answer with
      // m=application section.

      if (!this._hasDataChannelMediaSection) {
        const offer = await this._pc.createOffer();
        const localSdpObject = lib$3.parse(offer.sdp);
        const offerMediaObject = localSdpObject.media.find(m => m.type === 'application');
        if (!this._transportReady) await this._setupTransport({
          localDtlsRole: 'server',
          localSdpObject
        });
        logger.debug('sendDataChannel() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);

        this._remoteSdp.sendSctpAssociation({
          offerMediaObject
        });

        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      const sctpStreamParameters = {
        streamId: options.id,
        ordered: options.ordered,
        maxPacketLifeTime: options.maxPacketLifeTime,
        maxRetransmits: options.maxRetransmits
      };
      return {
        dataChannel,
        sctpStreamParameters
      };
    }

    async receive({
      trackId,
      kind,
      rtpParameters
    }) {
      this._assertRecvDirection();

      logger.debug('receive() [trackId:%s, kind:%s]', trackId, kind);
      const localId = rtpParameters.mid || String(this._mapMidTransceiver.size);

      this._remoteSdp.receive({
        mid: localId,
        kind,
        offerRtpParameters: rtpParameters,
        streamId: rtpParameters.rtcp.cname,
        trackId
      });

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('receive() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      let answer = await this._pc.createAnswer();
      const localSdpObject = lib$3.parse(answer.sdp);
      const answerMediaObject = localSdpObject.media.find(m => String(m.mid) === localId); // May need to modify codec parameters in the answer based on codec
      // parameters in the offer.

      commonUtils.applyCodecParameters({
        offerRtpParameters: rtpParameters,
        answerMediaObject
      });
      answer = {
        type: 'answer',
        sdp: lib$3.write(localSdpObject)
      };
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'client',
        localSdpObject
      });
      logger.debug('receive() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);

      const transceiver = this._pc.getTransceivers().find(t => t.mid === localId);

      if (!transceiver) throw new Error('new RTCRtpTransceiver not found'); // Store in the map.

      this._mapMidTransceiver.set(localId, transceiver);

      return {
        localId,
        track: transceiver.receiver.track,
        rtpReceiver: transceiver.receiver
      };
    }

    async stopReceiving(localId) {
      this._assertRecvDirection();

      logger.debug('stopReceiving() [localId:%s]', localId);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');

      this._remoteSdp.closeMediaSection(transceiver.mid);

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopReceiving() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      const answer = await this._pc.createAnswer();
      logger.debug('stopReceiving() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);
    }

    async getReceiverStats(localId) {
      this._assertRecvDirection();

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      return transceiver.receiver.getStats();
    }

    async receiveDataChannel({
      sctpStreamParameters,
      label,
      protocol
    }) {
      this._assertRecvDirection();

      const {
        streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits
      } = sctpStreamParameters;
      const options = {
        negotiated: true,
        id: streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits,
        protocol
      };
      logger.debug('receiveDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // If this is the first DataChannel we need to create the SDP offer with
      // m=application section.


      if (!this._hasDataChannelMediaSection) {
        this._remoteSdp.receiveSctpAssociation();

        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();

        if (!this._transportReady) {
          const localSdpObject = lib$3.parse(answer.sdp);
          await this._setupTransport({
            localDtlsRole: 'client',
            localSdpObject
          });
        }

        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      return {
        dataChannel
      };
    }

    async _setupTransport({
      localDtlsRole,
      localSdpObject
    }) {
      if (!localSdpObject) localSdpObject = lib$3.parse(this._pc.localDescription.sdp); // Get our local DTLS parameters.

      const dtlsParameters = commonUtils.extractDtlsParameters({
        sdpObject: localSdpObject
      }); // Set our DTLS role.

      dtlsParameters.role = localDtlsRole; // Update the remote DTLS role in the SDP.

      this._remoteSdp.updateDtlsRole(localDtlsRole === 'client' ? 'server' : 'client'); // Need to tell the remote transport about our parameters.


      await this.safeEmitAsPromise('@connect', {
        dtlsParameters
      });
      this._transportReady = true;
    }

    _assertSendDirection() {
      if (this._direction !== 'send') {
        throw new Error('method can just be called for handlers with "send" direction');
      }
    }

    _assertRecvDirection() {
      if (this._direction !== 'recv') {
        throw new Error('method can just be called for handlers with "recv" direction');
      }
    }

  }

  exports.Chrome74 = Chrome74;
});

var Chrome70_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('Chrome70');
  const SCTP_NUM_STREAMS = {
    OS: 1024,
    MIS: 1024
  };

  class Chrome70 extends HandlerInterface_1.HandlerInterface {
    constructor() {
      super(); // Map of RTCTransceivers indexed by MID.

      this._mapMidTransceiver = new Map(); // Local stream for sending.

      this._sendStream = new MediaStream(); // Whether a DataChannel m=application section has been created.

      this._hasDataChannelMediaSection = false; // Sending DataChannel id value counter. Incremented for each new DataChannel.

      this._nextSendSctpStreamId = 0; // Got transport local and remote parameters.

      this._transportReady = false;
    }
    /**
     * Creates a factory function.
     */


    static createFactory() {
      return () => new Chrome70();
    }

    get name() {
      return 'Chrome70';
    }

    close() {
      logger.debug('close()'); // Close RTCPeerConnection.

      if (this._pc) {
        try {
          this._pc.close();
        } catch (error) {}
      }
    }

    async getNativeRtpCapabilities() {
      logger.debug('getNativeRtpCapabilities()');
      const pc = new RTCPeerConnection({
        iceServers: [],
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        sdpSemantics: 'unified-plan'
      });

      try {
        pc.addTransceiver('audio');
        pc.addTransceiver('video');
        const offer = await pc.createOffer();

        try {
          pc.close();
        } catch (error) {}

        const sdpObject = lib$3.parse(offer.sdp);
        const nativeRtpCapabilities = commonUtils.extractRtpCapabilities({
          sdpObject
        });
        return nativeRtpCapabilities;
      } catch (error) {
        try {
          pc.close();
        } catch (error2) {}

        throw error;
      }
    }

    async getNativeSctpCapabilities() {
      logger.debug('getNativeSctpCapabilities()');
      return {
        numStreams: SCTP_NUM_STREAMS
      };
    }

    run({
      direction,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers,
      iceTransportPolicy,
      additionalSettings,
      proprietaryConstraints,
      extendedRtpCapabilities
    }) {
      logger.debug('run()');
      this._direction = direction;
      this._remoteSdp = new RemoteSdp_1.RemoteSdp({
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters
      });
      this._sendingRtpParametersByKind = {
        audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
      };
      this._sendingRemoteRtpParametersByKind = {
        audio: ortc.getSendingRemoteRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRemoteRtpParameters('video', extendedRtpCapabilities)
      };
      this._pc = new RTCPeerConnection({
        iceServers: iceServers || [],
        iceTransportPolicy: iceTransportPolicy || 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        sdpSemantics: 'unified-plan',
        ...additionalSettings
      }, proprietaryConstraints); // Handle RTCPeerConnection connection status.

      this._pc.addEventListener('iceconnectionstatechange', () => {
        switch (this._pc.iceConnectionState) {
          case 'checking':
            this.emit('@connectionstatechange', 'connecting');
            break;

          case 'connected':
          case 'completed':
            this.emit('@connectionstatechange', 'connected');
            break;

          case 'failed':
            this.emit('@connectionstatechange', 'failed');
            break;

          case 'disconnected':
            this.emit('@connectionstatechange', 'disconnected');
            break;

          case 'closed':
            this.emit('@connectionstatechange', 'closed');
            break;
        }
      });
    }

    async updateIceServers(iceServers) {
      logger.debug('updateIceServers()');

      const configuration = this._pc.getConfiguration();

      configuration.iceServers = iceServers;

      this._pc.setConfiguration(configuration);
    }

    async restartIce(iceParameters) {
      logger.debug('restartIce()'); // Provide the remote SDP handler with new remote ICE parameters.

      this._remoteSdp.updateIceParameters(iceParameters);

      if (!this._transportReady) return;

      if (this._direction === 'send') {
        const offer = await this._pc.createOffer({
          iceRestart: true
        });
        logger.debug('restartIce() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);
        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
      } else {
        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug('restartIce() | calling pc.setLocalDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
      }
    }

    async getTransportStats() {
      return this._pc.getStats();
    }

    async send({
      track,
      encodings,
      codecOptions,
      codec
    }) {
      this._assertSendDirection();

      logger.debug('send() [kind:%s, track.id:%s]', track.kind, track.id);
      const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind]); // This may throw.

      sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs, codec);
      const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind]); // This may throw.

      sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs, codec);

      const mediaSectionIdx = this._remoteSdp.getNextMediaSectionIdx();

      const transceiver = this._pc.addTransceiver(track, {
        direction: 'sendonly',
        streams: [this._sendStream]
      });

      let offer = await this._pc.createOffer();
      let localSdpObject = lib$3.parse(offer.sdp);
      let offerMediaObject;
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'server',
        localSdpObject
      });

      if (encodings && encodings.length > 1) {
        logger.debug('send() | enabling legacy simulcast');
        localSdpObject = lib$3.parse(offer.sdp);
        offerMediaObject = localSdpObject.media[mediaSectionIdx.idx];
        unifiedPlanUtils.addLegacySimulcast({
          offerMediaObject,
          numStreams: encodings.length
        });
        offer = {
          type: 'offer',
          sdp: lib$3.write(localSdpObject)
        };
      } // Special case for VP9 with SVC.


      let hackVp9Svc = false;
      const layers = scalabilityModes.parse((encodings || [{}])[0].scalabilityMode);

      if (encodings && encodings.length === 1 && layers.spatialLayers > 1 && sendingRtpParameters.codecs[0].mimeType.toLowerCase() === 'video/vp9') {
        logger.debug('send() | enabling legacy simulcast for VP9 SVC');
        hackVp9Svc = true;
        localSdpObject = lib$3.parse(offer.sdp);
        offerMediaObject = localSdpObject.media[mediaSectionIdx.idx];
        unifiedPlanUtils.addLegacySimulcast({
          offerMediaObject,
          numStreams: layers.spatialLayers
        });
        offer = {
          type: 'offer',
          sdp: lib$3.write(localSdpObject)
        };
      }

      logger.debug('send() | calling pc.setLocalDescription() [offer:%o]', offer);
      await this._pc.setLocalDescription(offer); // If encodings are given, apply them now.

      if (encodings) {
        logger.debug('send() | applying given encodings');
        const parameters = transceiver.sender.getParameters();

        for (let idx = 0; idx < (parameters.encodings || []).length; ++idx) {
          const encoding = parameters.encodings[idx];
          const desiredEncoding = encodings[idx]; // Should not happen but just in case.

          if (!desiredEncoding) break;
          parameters.encodings[idx] = Object.assign(encoding, desiredEncoding);
        }

        await transceiver.sender.setParameters(parameters);
      } // We can now get the transceiver.mid.


      const localId = transceiver.mid; // Set MID.

      sendingRtpParameters.mid = localId;
      localSdpObject = lib$3.parse(this._pc.localDescription.sdp);
      offerMediaObject = localSdpObject.media[mediaSectionIdx.idx]; // Set RTCP CNAME.

      sendingRtpParameters.rtcp.cname = commonUtils.getCname({
        offerMediaObject
      }); // Set RTP encodings.

      sendingRtpParameters.encodings = unifiedPlanUtils.getRtpEncodings({
        offerMediaObject
      }); // Complete encodings with given values.

      if (encodings) {
        for (let idx = 0; idx < sendingRtpParameters.encodings.length; ++idx) {
          if (encodings[idx]) Object.assign(sendingRtpParameters.encodings[idx], encodings[idx]);
        }
      } // Hack for VP9 SVC.


      if (hackVp9Svc) {
        sendingRtpParameters.encodings = [sendingRtpParameters.encodings[0]];
      } // If VP8 or H264 and there is effective simulcast, add scalabilityMode to
      // each encoding.


      if (sendingRtpParameters.encodings.length > 1 && (sendingRtpParameters.codecs[0].mimeType.toLowerCase() === 'video/vp8' || sendingRtpParameters.codecs[0].mimeType.toLowerCase() === 'video/h264')) {
        for (const encoding of sendingRtpParameters.encodings) {
          encoding.scalabilityMode = 'S1T3';
        }
      }

      this._remoteSdp.send({
        offerMediaObject,
        reuseMid: mediaSectionIdx.reuseMid,
        offerRtpParameters: sendingRtpParameters,
        answerRtpParameters: sendingRemoteRtpParameters,
        codecOptions
      });

      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('send() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer); // Store in the map.

      this._mapMidTransceiver.set(localId, transceiver);

      return {
        localId,
        rtpParameters: sendingRtpParameters,
        rtpSender: transceiver.sender
      };
    }

    async stopSending(localId) {
      this._assertSendDirection();

      logger.debug('stopSending() [localId:%s]', localId);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      transceiver.sender.replaceTrack(null);

      this._pc.removeTrack(transceiver.sender);

      this._remoteSdp.closeMediaSection(transceiver.mid);

      const offer = await this._pc.createOffer();
      logger.debug('stopSending() | calling pc.setLocalDescription() [offer:%o]', offer);
      await this._pc.setLocalDescription(offer);
      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopSending() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer);
    }

    async replaceTrack(localId, track) {
      this._assertSendDirection();

      if (track) {
        logger.debug('replaceTrack() [localId:%s, track.id:%s]', localId, track.id);
      } else {
        logger.debug('replaceTrack() [localId:%s, no track]', localId);
      }

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      await transceiver.sender.replaceTrack(track);
    }

    async setMaxSpatialLayer(localId, spatialLayer) {
      this._assertSendDirection();

      logger.debug('setMaxSpatialLayer() [localId:%s, spatialLayer:%s]', localId, spatialLayer);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      const parameters = transceiver.sender.getParameters();
      parameters.encodings.forEach((encoding, idx) => {
        if (idx <= spatialLayer) encoding.active = true;else encoding.active = false;
      });
      await transceiver.sender.setParameters(parameters);
    }

    async setRtpEncodingParameters(localId, params) {
      this._assertSendDirection();

      logger.debug('setRtpEncodingParameters() [localId:%s, params:%o]', localId, params);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      const parameters = transceiver.sender.getParameters();
      parameters.encodings.forEach((encoding, idx) => {
        parameters.encodings[idx] = { ...encoding,
          ...params
        };
      });
      await transceiver.sender.setParameters(parameters);
    }

    async getSenderStats(localId) {
      this._assertSendDirection();

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      return transceiver.sender.getStats();
    }

    async sendDataChannel({
      ordered,
      maxPacketLifeTime,
      maxRetransmits,
      label,
      protocol,
      priority
    }) {
      this._assertSendDirection();

      const options = {
        negotiated: true,
        id: this._nextSendSctpStreamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmitTime: maxPacketLifeTime,
        maxRetransmits,
        protocol,
        priority
      };
      logger.debug('sendDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // Increase next id.


      this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS; // If this is the first DataChannel we need to create the SDP answer with
      // m=application section.

      if (!this._hasDataChannelMediaSection) {
        const offer = await this._pc.createOffer();
        const localSdpObject = lib$3.parse(offer.sdp);
        const offerMediaObject = localSdpObject.media.find(m => m.type === 'application');
        if (!this._transportReady) await this._setupTransport({
          localDtlsRole: 'server',
          localSdpObject
        });
        logger.debug('sendDataChannel() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);

        this._remoteSdp.sendSctpAssociation({
          offerMediaObject
        });

        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      const sctpStreamParameters = {
        streamId: options.id,
        ordered: options.ordered,
        maxPacketLifeTime: options.maxPacketLifeTime,
        maxRetransmits: options.maxRetransmits
      };
      return {
        dataChannel,
        sctpStreamParameters
      };
    }

    async receive({
      trackId,
      kind,
      rtpParameters
    }) {
      this._assertRecvDirection();

      logger.debug('receive() [trackId:%s, kind:%s]', trackId, kind);
      const localId = rtpParameters.mid || String(this._mapMidTransceiver.size);

      this._remoteSdp.receive({
        mid: localId,
        kind,
        offerRtpParameters: rtpParameters,
        streamId: rtpParameters.rtcp.cname,
        trackId
      });

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('receive() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      let answer = await this._pc.createAnswer();
      const localSdpObject = lib$3.parse(answer.sdp);
      const answerMediaObject = localSdpObject.media.find(m => String(m.mid) === localId); // May need to modify codec parameters in the answer based on codec
      // parameters in the offer.

      commonUtils.applyCodecParameters({
        offerRtpParameters: rtpParameters,
        answerMediaObject
      });
      answer = {
        type: 'answer',
        sdp: lib$3.write(localSdpObject)
      };
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'client',
        localSdpObject
      });
      logger.debug('receive() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);

      const transceiver = this._pc.getTransceivers().find(t => t.mid === localId);

      if (!transceiver) throw new Error('new RTCRtpTransceiver not found'); // Store in the map.

      this._mapMidTransceiver.set(localId, transceiver);

      return {
        localId,
        track: transceiver.receiver.track,
        rtpReceiver: transceiver.receiver
      };
    }

    async stopReceiving(localId) {
      this._assertRecvDirection();

      logger.debug('stopReceiving() [localId:%s]', localId);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');

      this._remoteSdp.closeMediaSection(transceiver.mid);

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopReceiving() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      const answer = await this._pc.createAnswer();
      logger.debug('stopReceiving() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);
    }

    async getReceiverStats(localId) {
      this._assertRecvDirection();

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      return transceiver.receiver.getStats();
    }

    async receiveDataChannel({
      sctpStreamParameters,
      label,
      protocol
    }) {
      this._assertRecvDirection();

      const {
        streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits
      } = sctpStreamParameters;
      const options = {
        negotiated: true,
        id: streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmitTime: maxPacketLifeTime,
        maxRetransmits,
        protocol
      };
      logger.debug('receiveDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // If this is the first DataChannel we need to create the SDP offer with
      // m=application section.


      if (!this._hasDataChannelMediaSection) {
        this._remoteSdp.receiveSctpAssociation();

        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();

        if (!this._transportReady) {
          const localSdpObject = lib$3.parse(answer.sdp);
          await this._setupTransport({
            localDtlsRole: 'client',
            localSdpObject
          });
        }

        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      return {
        dataChannel
      };
    }

    async _setupTransport({
      localDtlsRole,
      localSdpObject
    }) {
      if (!localSdpObject) localSdpObject = lib$3.parse(this._pc.localDescription.sdp); // Get our local DTLS parameters.

      const dtlsParameters = commonUtils.extractDtlsParameters({
        sdpObject: localSdpObject
      }); // Set our DTLS role.

      dtlsParameters.role = localDtlsRole; // Update the remote DTLS role in the SDP.

      this._remoteSdp.updateDtlsRole(localDtlsRole === 'client' ? 'server' : 'client'); // Need to tell the remote transport about our parameters.


      await this.safeEmitAsPromise('@connect', {
        dtlsParameters
      });
      this._transportReady = true;
    }

    _assertSendDirection() {
      if (this._direction !== 'send') {
        throw new Error('method can just be called for handlers with "send" direction');
      }
    }

    _assertRecvDirection() {
      if (this._direction !== 'recv') {
        throw new Error('method can just be called for handlers with "recv" direction');
      }
    }

  }

  exports.Chrome70 = Chrome70;
});

var planBUtils = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function getRtpEncodings({
    offerMediaObject,
    track
  }) {
    const ssrcs = new Set();

    for (const line of offerMediaObject.ssrcs || []) {
      if (line.attribute !== 'msid') continue;
      const trackId = line.value.split(' ')[1];

      if (trackId === track.id) {
        const ssrc = line.id;
        ssrcs.add(ssrc);
      }
    }

    if (ssrcs.size === 0) throw new Error(`a=ssrc line with msid information not found [track.id:${track.id}]`);
    const ssrcToRtxSsrc = new Map(); // First assume RTX is used.

    for (const line of offerMediaObject.ssrcGroups || []) {
      if (line.semantics !== 'FID') continue;
      let [ssrc, rtxSsrc] = line.ssrcs.split(/\s+/);
      ssrc = Number(ssrc);
      rtxSsrc = Number(rtxSsrc);

      if (ssrcs.has(ssrc)) {
        // Remove both the SSRC and RTX SSRC from the set so later we know that they
        // are already handled.
        ssrcs.delete(ssrc);
        ssrcs.delete(rtxSsrc); // Add to the map.

        ssrcToRtxSsrc.set(ssrc, rtxSsrc);
      }
    } // If the set of SSRCs is not empty it means that RTX is not being used, so take
    // media SSRCs from there.


    for (const ssrc of ssrcs) {
      // Add to the map.
      ssrcToRtxSsrc.set(ssrc, null);
    }

    const encodings = [];

    for (const [ssrc, rtxSsrc] of ssrcToRtxSsrc) {
      const encoding = {
        ssrc
      };
      if (rtxSsrc) encoding.rtx = {
        ssrc: rtxSsrc
      };
      encodings.push(encoding);
    }

    return encodings;
  }

  exports.getRtpEncodings = getRtpEncodings;
  /**
   * Adds multi-ssrc based simulcast into the given SDP media section offer.
   */

  function addLegacySimulcast({
    offerMediaObject,
    track,
    numStreams
  }) {
    if (numStreams <= 1) throw new TypeError('numStreams must be greater than 1');
    let firstSsrc;
    let firstRtxSsrc;
    let streamId; // Get the SSRC.

    const ssrcMsidLine = (offerMediaObject.ssrcs || []).find(line => {
      if (line.attribute !== 'msid') return false;
      const trackId = line.value.split(' ')[1];

      if (trackId === track.id) {
        firstSsrc = line.id;
        streamId = line.value.split(' ')[0];
        return true;
      } else {
        return false;
      }
    });
    if (!ssrcMsidLine) throw new Error(`a=ssrc line with msid information not found [track.id:${track.id}]`); // Get the SSRC for RTX.

    (offerMediaObject.ssrcGroups || []).some(line => {
      if (line.semantics !== 'FID') return false;
      const ssrcs = line.ssrcs.split(/\s+/);

      if (Number(ssrcs[0]) === firstSsrc) {
        firstRtxSsrc = Number(ssrcs[1]);
        return true;
      } else {
        return false;
      }
    });
    const ssrcCnameLine = offerMediaObject.ssrcs.find(line => line.attribute === 'cname' && line.id === firstSsrc);
    if (!ssrcCnameLine) throw new Error(`a=ssrc line with cname information not found [track.id:${track.id}]`);
    const cname = ssrcCnameLine.value;
    const ssrcs = [];
    const rtxSsrcs = [];

    for (let i = 0; i < numStreams; ++i) {
      ssrcs.push(firstSsrc + i);
      if (firstRtxSsrc) rtxSsrcs.push(firstRtxSsrc + i);
    }

    offerMediaObject.ssrcGroups = offerMediaObject.ssrcGroups || [];
    offerMediaObject.ssrcs = offerMediaObject.ssrcs || [];
    offerMediaObject.ssrcGroups.push({
      semantics: 'SIM',
      ssrcs: ssrcs.join(' ')
    });

    for (let i = 0; i < ssrcs.length; ++i) {
      const ssrc = ssrcs[i];
      offerMediaObject.ssrcs.push({
        id: ssrc,
        attribute: 'cname',
        value: cname
      });
      offerMediaObject.ssrcs.push({
        id: ssrc,
        attribute: 'msid',
        value: `${streamId} ${track.id}`
      });
    }

    for (let i = 0; i < rtxSsrcs.length; ++i) {
      const ssrc = ssrcs[i];
      const rtxSsrc = rtxSsrcs[i];
      offerMediaObject.ssrcs.push({
        id: rtxSsrc,
        attribute: 'cname',
        value: cname
      });
      offerMediaObject.ssrcs.push({
        id: rtxSsrc,
        attribute: 'msid',
        value: `${streamId} ${track.id}`
      });
      offerMediaObject.ssrcGroups.push({
        semantics: 'FID',
        ssrcs: `${ssrc} ${rtxSsrc}`
      });
    }
  }

  exports.addLegacySimulcast = addLegacySimulcast;
});

var Chrome67_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('Chrome67');
  const SCTP_NUM_STREAMS = {
    OS: 1024,
    MIS: 1024
  };

  class Chrome67 extends HandlerInterface_1.HandlerInterface {
    constructor() {
      super(); // Local stream for sending.

      this._sendStream = new MediaStream(); // Map of RTCRtpSender indexed by localId.

      this._mapSendLocalIdRtpSender = new Map(); // Next sending localId.

      this._nextSendLocalId = 0; // Map of MID, RTP parameters and RTCRtpReceiver indexed by local id.
      // Value is an Object with mid, rtpParameters and rtpReceiver.

      this._mapRecvLocalIdInfo = new Map(); // Whether a DataChannel m=application section has been created.

      this._hasDataChannelMediaSection = false; // Sending DataChannel id value counter. Incremented for each new DataChannel.

      this._nextSendSctpStreamId = 0; // Got transport local and remote parameters.

      this._transportReady = false;
    }
    /**
     * Creates a factory function.
     */


    static createFactory() {
      return () => new Chrome67();
    }

    get name() {
      return 'Chrome67';
    }

    close() {
      logger.debug('close()'); // Close RTCPeerConnection.

      if (this._pc) {
        try {
          this._pc.close();
        } catch (error) {}
      }
    }

    async getNativeRtpCapabilities() {
      logger.debug('getNativeRtpCapabilities()');
      const pc = new RTCPeerConnection({
        iceServers: [],
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        sdpSemantics: 'plan-b'
      });

      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });

        try {
          pc.close();
        } catch (error) {}

        const sdpObject = lib$3.parse(offer.sdp);
        const nativeRtpCapabilities = commonUtils.extractRtpCapabilities({
          sdpObject
        });
        return nativeRtpCapabilities;
      } catch (error) {
        try {
          pc.close();
        } catch (error2) {}

        throw error;
      }
    }

    async getNativeSctpCapabilities() {
      logger.debug('getNativeSctpCapabilities()');
      return {
        numStreams: SCTP_NUM_STREAMS
      };
    }

    run({
      direction,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers,
      iceTransportPolicy,
      additionalSettings,
      proprietaryConstraints,
      extendedRtpCapabilities
    }) {
      logger.debug('run()');
      this._direction = direction;
      this._remoteSdp = new RemoteSdp_1.RemoteSdp({
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
        planB: true
      });
      this._sendingRtpParametersByKind = {
        audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
      };
      this._sendingRemoteRtpParametersByKind = {
        audio: ortc.getSendingRemoteRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRemoteRtpParameters('video', extendedRtpCapabilities)
      };
      this._pc = new RTCPeerConnection({
        iceServers: iceServers || [],
        iceTransportPolicy: iceTransportPolicy || 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        sdpSemantics: 'plan-b',
        ...additionalSettings
      }, proprietaryConstraints); // Handle RTCPeerConnection connection status.

      this._pc.addEventListener('iceconnectionstatechange', () => {
        switch (this._pc.iceConnectionState) {
          case 'checking':
            this.emit('@connectionstatechange', 'connecting');
            break;

          case 'connected':
          case 'completed':
            this.emit('@connectionstatechange', 'connected');
            break;

          case 'failed':
            this.emit('@connectionstatechange', 'failed');
            break;

          case 'disconnected':
            this.emit('@connectionstatechange', 'disconnected');
            break;

          case 'closed':
            this.emit('@connectionstatechange', 'closed');
            break;
        }
      });
    }

    async updateIceServers(iceServers) {
      logger.debug('updateIceServers()');

      const configuration = this._pc.getConfiguration();

      configuration.iceServers = iceServers;

      this._pc.setConfiguration(configuration);
    }

    async restartIce(iceParameters) {
      logger.debug('restartIce()'); // Provide the remote SDP handler with new remote ICE parameters.

      this._remoteSdp.updateIceParameters(iceParameters);

      if (!this._transportReady) return;

      if (this._direction === 'send') {
        const offer = await this._pc.createOffer({
          iceRestart: true
        });
        logger.debug('restartIce() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);
        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
      } else {
        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug('restartIce() | calling pc.setLocalDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
      }
    }

    async getTransportStats() {
      return this._pc.getStats();
    }

    async send({
      track,
      encodings,
      codecOptions,
      codec
    }) {
      this._assertSendDirection();

      logger.debug('send() [kind:%s, track.id:%s]', track.kind, track.id);

      if (codec) {
        logger.warn('send() | codec selection is not available in %s handler', this.name);
      }

      this._sendStream.addTrack(track);

      this._pc.addTrack(track, this._sendStream);

      let offer = await this._pc.createOffer();
      let localSdpObject = lib$3.parse(offer.sdp);
      let offerMediaObject;
      const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind]);
      sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs);
      const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind]);
      sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs);
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'server',
        localSdpObject
      });

      if (track.kind === 'video' && encodings && encodings.length > 1) {
        logger.debug('send() | enabling simulcast');
        localSdpObject = lib$3.parse(offer.sdp);
        offerMediaObject = localSdpObject.media.find(m => m.type === 'video');
        planBUtils.addLegacySimulcast({
          offerMediaObject,
          track,
          numStreams: encodings.length
        });
        offer = {
          type: 'offer',
          sdp: lib$3.write(localSdpObject)
        };
      }

      logger.debug('send() | calling pc.setLocalDescription() [offer:%o]', offer);
      await this._pc.setLocalDescription(offer);
      localSdpObject = lib$3.parse(this._pc.localDescription.sdp);
      offerMediaObject = localSdpObject.media.find(m => m.type === track.kind); // Set RTCP CNAME.

      sendingRtpParameters.rtcp.cname = commonUtils.getCname({
        offerMediaObject
      }); // Set RTP encodings.

      sendingRtpParameters.encodings = planBUtils.getRtpEncodings({
        offerMediaObject,
        track
      }); // Complete encodings with given values.

      if (encodings) {
        for (let idx = 0; idx < sendingRtpParameters.encodings.length; ++idx) {
          if (encodings[idx]) Object.assign(sendingRtpParameters.encodings[idx], encodings[idx]);
        }
      } // If VP8 and there is effective simulcast, add scalabilityMode to each
      // encoding.


      if (sendingRtpParameters.encodings.length > 1 && sendingRtpParameters.codecs[0].mimeType.toLowerCase() === 'video/vp8') {
        for (const encoding of sendingRtpParameters.encodings) {
          encoding.scalabilityMode = 'S1T3';
        }
      }

      this._remoteSdp.send({
        offerMediaObject,
        offerRtpParameters: sendingRtpParameters,
        answerRtpParameters: sendingRemoteRtpParameters,
        codecOptions
      });

      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('send() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer);
      const localId = String(this._nextSendLocalId);
      this._nextSendLocalId++;

      const rtpSender = this._pc.getSenders().find(s => s.track === track); // Insert into the map.


      this._mapSendLocalIdRtpSender.set(localId, rtpSender);

      return {
        localId: localId,
        rtpParameters: sendingRtpParameters,
        rtpSender
      };
    }

    async stopSending(localId) {
      this._assertSendDirection();

      logger.debug('stopSending() [localId:%s]', localId);

      const rtpSender = this._mapSendLocalIdRtpSender.get(localId);

      if (!rtpSender) throw new Error('associated RTCRtpSender not found');

      this._pc.removeTrack(rtpSender);

      if (rtpSender.track) this._sendStream.removeTrack(rtpSender.track);

      this._mapSendLocalIdRtpSender.delete(localId);

      const offer = await this._pc.createOffer();
      logger.debug('stopSending() | calling pc.setLocalDescription() [offer:%o]', offer);

      try {
        await this._pc.setLocalDescription(offer);
      } catch (error) {
        // NOTE: If there are no sending tracks, setLocalDescription() will fail with
        // "Failed to create channels". If so, ignore it.
        if (this._sendStream.getTracks().length === 0) {
          logger.warn('stopSending() | ignoring expected error due no sending tracks: %s', error.toString());
          return;
        }

        throw error;
      }

      if (this._pc.signalingState === 'stable') return;
      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopSending() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer);
    }

    async replaceTrack(localId, track) {
      this._assertSendDirection();

      if (track) {
        logger.debug('replaceTrack() [localId:%s, track.id:%s]', localId, track.id);
      } else {
        logger.debug('replaceTrack() [localId:%s, no track]', localId);
      }

      const rtpSender = this._mapSendLocalIdRtpSender.get(localId);

      if (!rtpSender) throw new Error('associated RTCRtpSender not found');
      const oldTrack = rtpSender.track;
      await rtpSender.replaceTrack(track); // Remove the old track from the local stream.

      if (oldTrack) this._sendStream.removeTrack(oldTrack); // Add the new track to the local stream.

      if (track) this._sendStream.addTrack(track);
    }

    async setMaxSpatialLayer(localId, spatialLayer) {
      this._assertSendDirection();

      logger.debug('setMaxSpatialLayer() [localId:%s, spatialLayer:%s]', localId, spatialLayer);

      const rtpSender = this._mapSendLocalIdRtpSender.get(localId);

      if (!rtpSender) throw new Error('associated RTCRtpSender not found');
      const parameters = rtpSender.getParameters();
      parameters.encodings.forEach((encoding, idx) => {
        if (idx <= spatialLayer) encoding.active = true;else encoding.active = false;
      });
      await rtpSender.setParameters(parameters);
    }

    async setRtpEncodingParameters(localId, params) {
      this._assertSendDirection();

      logger.debug('setRtpEncodingParameters() [localId:%s, params:%o]', localId, params);

      const rtpSender = this._mapSendLocalIdRtpSender.get(localId);

      if (!rtpSender) throw new Error('associated RTCRtpSender not found');
      const parameters = rtpSender.getParameters();
      parameters.encodings.forEach((encoding, idx) => {
        parameters.encodings[idx] = { ...encoding,
          ...params
        };
      });
      await rtpSender.setParameters(parameters);
    }

    async getSenderStats(localId) {
      this._assertSendDirection();

      const rtpSender = this._mapSendLocalIdRtpSender.get(localId);

      if (!rtpSender) throw new Error('associated RTCRtpSender not found');
      return rtpSender.getStats();
    }

    async sendDataChannel({
      ordered,
      maxPacketLifeTime,
      maxRetransmits,
      label,
      protocol,
      priority
    }) {
      this._assertSendDirection();

      const options = {
        negotiated: true,
        id: this._nextSendSctpStreamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmitTime: maxPacketLifeTime,
        maxRetransmits,
        protocol,
        priority
      };
      logger.debug('sendDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // Increase next id.


      this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS; // If this is the first DataChannel we need to create the SDP answer with
      // m=application section.

      if (!this._hasDataChannelMediaSection) {
        const offer = await this._pc.createOffer();
        const localSdpObject = lib$3.parse(offer.sdp);
        const offerMediaObject = localSdpObject.media.find(m => m.type === 'application');
        if (!this._transportReady) await this._setupTransport({
          localDtlsRole: 'server',
          localSdpObject
        });
        logger.debug('sendDataChannel() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);

        this._remoteSdp.sendSctpAssociation({
          offerMediaObject
        });

        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      const sctpStreamParameters = {
        streamId: options.id,
        ordered: options.ordered,
        maxPacketLifeTime: options.maxPacketLifeTime,
        maxRetransmits: options.maxRetransmits
      };
      return {
        dataChannel,
        sctpStreamParameters
      };
    }

    async receive({
      trackId,
      kind,
      rtpParameters
    }) {
      this._assertRecvDirection();

      logger.debug('receive() [trackId:%s, kind:%s]', trackId, kind);
      const localId = trackId;
      const mid = kind;

      this._remoteSdp.receive({
        mid,
        kind,
        offerRtpParameters: rtpParameters,
        streamId: rtpParameters.rtcp.cname,
        trackId
      });

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('receive() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      let answer = await this._pc.createAnswer();
      const localSdpObject = lib$3.parse(answer.sdp);
      const answerMediaObject = localSdpObject.media.find(m => String(m.mid) === mid); // May need to modify codec parameters in the answer based on codec
      // parameters in the offer.

      commonUtils.applyCodecParameters({
        offerRtpParameters: rtpParameters,
        answerMediaObject
      });
      answer = {
        type: 'answer',
        sdp: lib$3.write(localSdpObject)
      };
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'client',
        localSdpObject
      });
      logger.debug('receive() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);

      const rtpReceiver = this._pc.getReceivers().find(r => r.track && r.track.id === localId);

      if (!rtpReceiver) throw new Error('new RTCRtpReceiver not'); // Insert into the map.

      this._mapRecvLocalIdInfo.set(localId, {
        mid,
        rtpParameters,
        rtpReceiver
      });

      return {
        localId,
        track: rtpReceiver.track,
        rtpReceiver
      };
    }

    async stopReceiving(localId) {
      this._assertRecvDirection();

      logger.debug('stopReceiving() [localId:%s]', localId);
      const {
        mid,
        rtpParameters
      } = this._mapRecvLocalIdInfo.get(localId) || {}; // Remove from the map.

      this._mapRecvLocalIdInfo.delete(localId);

      this._remoteSdp.planBStopReceiving({
        mid: mid,
        offerRtpParameters: rtpParameters
      });

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopReceiving() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      const answer = await this._pc.createAnswer();
      logger.debug('stopReceiving() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);
    }

    async getReceiverStats(localId) {
      this._assertRecvDirection();

      const {
        rtpReceiver
      } = this._mapRecvLocalIdInfo.get(localId) || {};
      if (!rtpReceiver) throw new Error('associated RTCRtpReceiver not found');
      return rtpReceiver.getStats();
    }

    async receiveDataChannel({
      sctpStreamParameters,
      label,
      protocol
    }) {
      this._assertRecvDirection();

      const {
        streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits
      } = sctpStreamParameters;
      const options = {
        negotiated: true,
        id: streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmitTime: maxPacketLifeTime,
        maxRetransmits,
        protocol
      };
      logger.debug('receiveDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // If this is the first DataChannel we need to create the SDP offer with
      // m=application section.


      if (!this._hasDataChannelMediaSection) {
        this._remoteSdp.receiveSctpAssociation({
          oldDataChannelSpec: true
        });

        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();

        if (!this._transportReady) {
          const localSdpObject = lib$3.parse(answer.sdp);
          await this._setupTransport({
            localDtlsRole: 'client',
            localSdpObject
          });
        }

        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      return {
        dataChannel
      };
    }

    async _setupTransport({
      localDtlsRole,
      localSdpObject
    }) {
      if (!localSdpObject) localSdpObject = lib$3.parse(this._pc.localDescription.sdp); // Get our local DTLS parameters.

      const dtlsParameters = commonUtils.extractDtlsParameters({
        sdpObject: localSdpObject
      }); // Set our DTLS role.

      dtlsParameters.role = localDtlsRole; // Update the remote DTLS role in the SDP.

      this._remoteSdp.updateDtlsRole(localDtlsRole === 'client' ? 'server' : 'client'); // Need to tell the remote transport about our parameters.


      await this.safeEmitAsPromise('@connect', {
        dtlsParameters
      });
      this._transportReady = true;
    }

    _assertSendDirection() {
      if (this._direction !== 'send') {
        throw new Error('method can just be called for handlers with "send" direction');
      }
    }

    _assertRecvDirection() {
      if (this._direction !== 'recv') {
        throw new Error('method can just be called for handlers with "recv" direction');
      }
    }

  }

  exports.Chrome67 = Chrome67;
});

var Chrome55_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('Chrome55');
  const SCTP_NUM_STREAMS = {
    OS: 1024,
    MIS: 1024
  };

  class Chrome55 extends HandlerInterface_1.HandlerInterface {
    constructor() {
      super(); // Local stream for sending.

      this._sendStream = new MediaStream(); // Map of sending MediaStreamTracks indexed by localId.

      this._mapSendLocalIdTrack = new Map(); // Next sending localId.

      this._nextSendLocalId = 0; // Map of MID, RTP parameters and RTCRtpReceiver indexed by local id.
      // Value is an Object with mid, rtpParameters and rtpReceiver.

      this._mapRecvLocalIdInfo = new Map(); // Whether a DataChannel m=application section has been created.

      this._hasDataChannelMediaSection = false; // Sending DataChannel id value counter. Incremented for each new DataChannel.

      this._nextSendSctpStreamId = 0; // Got transport local and remote parameters.

      this._transportReady = false;
    }
    /**
     * Creates a factory function.
     */


    static createFactory() {
      return () => new Chrome55();
    }

    get name() {
      return 'Chrome55';
    }

    close() {
      logger.debug('close()'); // Close RTCPeerConnection.

      if (this._pc) {
        try {
          this._pc.close();
        } catch (error) {}
      }
    }

    async getNativeRtpCapabilities() {
      logger.debug('getNativeRtpCapabilities()');
      const pc = new RTCPeerConnection({
        iceServers: [],
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        sdpSemantics: 'plan-b'
      });

      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });

        try {
          pc.close();
        } catch (error) {}

        const sdpObject = lib$3.parse(offer.sdp);
        const nativeRtpCapabilities = commonUtils.extractRtpCapabilities({
          sdpObject
        });
        return nativeRtpCapabilities;
      } catch (error) {
        try {
          pc.close();
        } catch (error2) {}

        throw error;
      }
    }

    async getNativeSctpCapabilities() {
      logger.debug('getNativeSctpCapabilities()');
      return {
        numStreams: SCTP_NUM_STREAMS
      };
    }

    run({
      direction,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers,
      iceTransportPolicy,
      additionalSettings,
      proprietaryConstraints,
      extendedRtpCapabilities
    }) {
      logger.debug('run()');
      this._direction = direction;
      this._remoteSdp = new RemoteSdp_1.RemoteSdp({
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
        planB: true
      });
      this._sendingRtpParametersByKind = {
        audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
      };
      this._sendingRemoteRtpParametersByKind = {
        audio: ortc.getSendingRemoteRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRemoteRtpParameters('video', extendedRtpCapabilities)
      };
      this._pc = new RTCPeerConnection({
        iceServers: iceServers || [],
        iceTransportPolicy: iceTransportPolicy || 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        sdpSemantics: 'plan-b',
        ...additionalSettings
      }, proprietaryConstraints); // Handle RTCPeerConnection connection status.

      this._pc.addEventListener('iceconnectionstatechange', () => {
        switch (this._pc.iceConnectionState) {
          case 'checking':
            this.emit('@connectionstatechange', 'connecting');
            break;

          case 'connected':
          case 'completed':
            this.emit('@connectionstatechange', 'connected');
            break;

          case 'failed':
            this.emit('@connectionstatechange', 'failed');
            break;

          case 'disconnected':
            this.emit('@connectionstatechange', 'disconnected');
            break;

          case 'closed':
            this.emit('@connectionstatechange', 'closed');
            break;
        }
      });
    }

    async updateIceServers(iceServers) {
      logger.debug('updateIceServers()');

      const configuration = this._pc.getConfiguration();

      configuration.iceServers = iceServers;

      this._pc.setConfiguration(configuration);
    }

    async restartIce(iceParameters) {
      logger.debug('restartIce()'); // Provide the remote SDP handler with new remote ICE parameters.

      this._remoteSdp.updateIceParameters(iceParameters);

      if (!this._transportReady) return;

      if (this._direction === 'send') {
        const offer = await this._pc.createOffer({
          iceRestart: true
        });
        logger.debug('restartIce() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);
        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
      } else {
        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug('restartIce() | calling pc.setLocalDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
      }
    }

    async getTransportStats() {
      return this._pc.getStats();
    }

    async send({
      track,
      encodings,
      codecOptions,
      codec
    }) {
      this._assertSendDirection();

      logger.debug('send() [kind:%s, track.id:%s]', track.kind, track.id);

      if (codec) {
        logger.warn('send() | codec selection is not available in %s handler', this.name);
      }

      this._sendStream.addTrack(track);

      this._pc.addStream(this._sendStream);

      let offer = await this._pc.createOffer();
      let localSdpObject = lib$3.parse(offer.sdp);
      let offerMediaObject;
      const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind]);
      sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs);
      const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind]);
      sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs);
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'server',
        localSdpObject
      });

      if (track.kind === 'video' && encodings && encodings.length > 1) {
        logger.debug('send() | enabling simulcast');
        localSdpObject = lib$3.parse(offer.sdp);
        offerMediaObject = localSdpObject.media.find(m => m.type === 'video');
        planBUtils.addLegacySimulcast({
          offerMediaObject,
          track,
          numStreams: encodings.length
        });
        offer = {
          type: 'offer',
          sdp: lib$3.write(localSdpObject)
        };
      }

      logger.debug('send() | calling pc.setLocalDescription() [offer:%o]', offer);
      await this._pc.setLocalDescription(offer);
      localSdpObject = lib$3.parse(this._pc.localDescription.sdp);
      offerMediaObject = localSdpObject.media.find(m => m.type === track.kind); // Set RTCP CNAME.

      sendingRtpParameters.rtcp.cname = commonUtils.getCname({
        offerMediaObject
      }); // Set RTP encodings.

      sendingRtpParameters.encodings = planBUtils.getRtpEncodings({
        offerMediaObject,
        track
      }); // Complete encodings with given values.

      if (encodings) {
        for (let idx = 0; idx < sendingRtpParameters.encodings.length; ++idx) {
          if (encodings[idx]) Object.assign(sendingRtpParameters.encodings[idx], encodings[idx]);
        }
      } // If VP8 and there is effective simulcast, add scalabilityMode to each
      // encoding.


      if (sendingRtpParameters.encodings.length > 1 && sendingRtpParameters.codecs[0].mimeType.toLowerCase() === 'video/vp8') {
        for (const encoding of sendingRtpParameters.encodings) {
          encoding.scalabilityMode = 'S1T3';
        }
      }

      this._remoteSdp.send({
        offerMediaObject,
        offerRtpParameters: sendingRtpParameters,
        answerRtpParameters: sendingRemoteRtpParameters,
        codecOptions
      });

      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('send() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer);
      const localId = String(this._nextSendLocalId);
      this._nextSendLocalId++; // Insert into the map.

      this._mapSendLocalIdTrack.set(localId, track);

      return {
        localId: localId,
        rtpParameters: sendingRtpParameters
      };
    }

    async stopSending(localId) {
      this._assertSendDirection();

      logger.debug('stopSending() [localId:%s]', localId);

      const track = this._mapSendLocalIdTrack.get(localId);

      if (!track) throw new Error('track not found');

      this._mapSendLocalIdTrack.delete(localId);

      this._sendStream.removeTrack(track);

      this._pc.addStream(this._sendStream);

      const offer = await this._pc.createOffer();
      logger.debug('stopSending() | calling pc.setLocalDescription() [offer:%o]', offer);

      try {
        await this._pc.setLocalDescription(offer);
      } catch (error) {
        // NOTE: If there are no sending tracks, setLocalDescription() will fail with
        // "Failed to create channels". If so, ignore it.
        if (this._sendStream.getTracks().length === 0) {
          logger.warn('stopSending() | ignoring expected error due no sending tracks: %s', error.toString());
          return;
        }

        throw error;
      }

      if (this._pc.signalingState === 'stable') return;
      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopSending() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer);
    }

    async replaceTrack( // eslint-disable-next-line @typescript-eslint/no-unused-vars
    localId, track) {
      throw new errors.UnsupportedError('not implemented');
    } // eslint-disable-next-line @typescript-eslint/no-unused-vars


    async setMaxSpatialLayer(localId, spatialLayer) {
      throw new errors.UnsupportedError(' not implemented');
    } // eslint-disable-next-line @typescript-eslint/no-unused-vars


    async setRtpEncodingParameters(localId, params) {
      throw new errors.UnsupportedError('not supported');
    } // eslint-disable-next-line @typescript-eslint/no-unused-vars


    async getSenderStats(localId) {
      throw new errors.UnsupportedError('not implemented');
    }

    async sendDataChannel({
      ordered,
      maxPacketLifeTime,
      maxRetransmits,
      label,
      protocol,
      priority
    }) {
      this._assertSendDirection();

      const options = {
        negotiated: true,
        id: this._nextSendSctpStreamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmitTime: maxPacketLifeTime,
        maxRetransmits,
        protocol,
        priority
      };
      logger.debug('sendDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // Increase next id.


      this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS; // If this is the first DataChannel we need to create the SDP answer with
      // m=application section.

      if (!this._hasDataChannelMediaSection) {
        const offer = await this._pc.createOffer();
        const localSdpObject = lib$3.parse(offer.sdp);
        const offerMediaObject = localSdpObject.media.find(m => m.type === 'application');
        if (!this._transportReady) await this._setupTransport({
          localDtlsRole: 'server',
          localSdpObject
        });
        logger.debug('sendDataChannel() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);

        this._remoteSdp.sendSctpAssociation({
          offerMediaObject
        });

        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      const sctpStreamParameters = {
        streamId: options.id,
        ordered: options.ordered,
        maxPacketLifeTime: options.maxPacketLifeTime,
        maxRetransmits: options.maxRetransmits
      };
      return {
        dataChannel,
        sctpStreamParameters
      };
    }

    async receive({
      trackId,
      kind,
      rtpParameters
    }) {
      this._assertRecvDirection();

      logger.debug('receive() [trackId:%s, kind:%s]', trackId, kind);
      const localId = trackId;
      const mid = kind;
      const streamId = rtpParameters.rtcp.cname;

      this._remoteSdp.receive({
        mid,
        kind,
        offerRtpParameters: rtpParameters,
        streamId,
        trackId
      });

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('receive() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      let answer = await this._pc.createAnswer();
      const localSdpObject = lib$3.parse(answer.sdp);
      const answerMediaObject = localSdpObject.media.find(m => String(m.mid) === mid); // May need to modify codec parameters in the answer based on codec
      // parameters in the offer.

      commonUtils.applyCodecParameters({
        offerRtpParameters: rtpParameters,
        answerMediaObject
      });
      answer = {
        type: 'answer',
        sdp: lib$3.write(localSdpObject)
      };
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'client',
        localSdpObject
      });
      logger.debug('receive() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);

      const stream = this._pc.getRemoteStreams().find(s => s.id === streamId);

      const track = stream.getTrackById(localId);
      if (!track) throw new Error('remote track not found'); // Insert into the map.

      this._mapRecvLocalIdInfo.set(localId, {
        mid,
        rtpParameters
      });

      return {
        localId,
        track
      };
    }

    async stopReceiving(localId) {
      this._assertRecvDirection();

      logger.debug('stopReceiving() [localId:%s]', localId);
      const {
        mid,
        rtpParameters
      } = this._mapRecvLocalIdInfo.get(localId) || {}; // Remove from the map.

      this._mapRecvLocalIdInfo.delete(localId);

      this._remoteSdp.planBStopReceiving({
        mid: mid,
        offerRtpParameters: rtpParameters
      });

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopReceiving() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      const answer = await this._pc.createAnswer();
      logger.debug('stopReceiving() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);
    } // eslint-disable-next-line @typescript-eslint/no-unused-vars


    async getReceiverStats(localId) {
      throw new errors.UnsupportedError('not implemented');
    }

    async receiveDataChannel({
      sctpStreamParameters,
      label,
      protocol
    }) {
      this._assertRecvDirection();

      const {
        streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits
      } = sctpStreamParameters;
      const options = {
        negotiated: true,
        id: streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmitTime: maxPacketLifeTime,
        maxRetransmits,
        protocol
      };
      logger.debug('receiveDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // If this is the first DataChannel we need to create the SDP offer with
      // m=application section.


      if (!this._hasDataChannelMediaSection) {
        this._remoteSdp.receiveSctpAssociation({
          oldDataChannelSpec: true
        });

        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();

        if (!this._transportReady) {
          const localSdpObject = lib$3.parse(answer.sdp);
          await this._setupTransport({
            localDtlsRole: 'client',
            localSdpObject
          });
        }

        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      return {
        dataChannel
      };
    }

    async _setupTransport({
      localDtlsRole,
      localSdpObject
    }) {
      if (!localSdpObject) localSdpObject = lib$3.parse(this._pc.localDescription.sdp); // Get our local DTLS parameters.

      const dtlsParameters = commonUtils.extractDtlsParameters({
        sdpObject: localSdpObject
      }); // Set our DTLS role.

      dtlsParameters.role = localDtlsRole; // Update the remote DTLS role in the SDP.

      this._remoteSdp.updateDtlsRole(localDtlsRole === 'client' ? 'server' : 'client'); // Need to tell the remote transport about our parameters.


      await this.safeEmitAsPromise('@connect', {
        dtlsParameters
      });
      this._transportReady = true;
    }

    _assertSendDirection() {
      if (this._direction !== 'send') {
        throw new Error('method can just be called for handlers with "send" direction');
      }
    }

    _assertRecvDirection() {
      if (this._direction !== 'recv') {
        throw new Error('method can just be called for handlers with "recv" direction');
      }
    }

  }

  exports.Chrome55 = Chrome55;
});

var Firefox60_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('Firefox60');
  const SCTP_NUM_STREAMS = {
    OS: 16,
    MIS: 2048
  };

  class Firefox60 extends HandlerInterface_1.HandlerInterface {
    constructor() {
      super(); // Map of RTCTransceivers indexed by MID.

      this._mapMidTransceiver = new Map(); // Local stream for sending.

      this._sendStream = new MediaStream(); // Whether a DataChannel m=application section has been created.

      this._hasDataChannelMediaSection = false; // Sending DataChannel id value counter. Incremented for each new DataChannel.

      this._nextSendSctpStreamId = 0; // Got transport local and remote parameters.

      this._transportReady = false;
    }
    /**
     * Creates a factory function.
     */


    static createFactory() {
      return () => new Firefox60();
    }

    get name() {
      return 'Firefox60';
    }

    close() {
      logger.debug('close()'); // Close RTCPeerConnection.

      if (this._pc) {
        try {
          this._pc.close();
        } catch (error) {}
      }
    }

    async getNativeRtpCapabilities() {
      logger.debug('getNativeRtpCapabilities()');
      const pc = new RTCPeerConnection({
        iceServers: [],
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      }); // NOTE: We need to add a real video track to get the RID extension mapping.

      const canvas = document.createElement('canvas'); // NOTE: Otherwise Firefox fails in next line.

      canvas.getContext('2d');
      const fakeStream = canvas.captureStream();
      const fakeVideoTrack = fakeStream.getVideoTracks()[0];

      try {
        pc.addTransceiver('audio', {
          direction: 'sendrecv'
        });
        const videoTransceiver = pc.addTransceiver(fakeVideoTrack, {
          direction: 'sendrecv'
        });
        const parameters = videoTransceiver.sender.getParameters();
        const encodings = [{
          rid: 'r0',
          maxBitrate: 100000
        }, {
          rid: 'r1',
          maxBitrate: 500000
        }];
        parameters.encodings = encodings;
        await videoTransceiver.sender.setParameters(parameters);
        const offer = await pc.createOffer();

        try {
          canvas.remove();
        } catch (error) {}

        try {
          fakeVideoTrack.stop();
        } catch (error) {}

        try {
          pc.close();
        } catch (error) {}

        const sdpObject = lib$3.parse(offer.sdp);
        const nativeRtpCapabilities = commonUtils.extractRtpCapabilities({
          sdpObject
        });
        return nativeRtpCapabilities;
      } catch (error) {
        try {
          canvas.remove();
        } catch (error2) {}

        try {
          fakeVideoTrack.stop();
        } catch (error2) {}

        try {
          pc.close();
        } catch (error2) {}

        throw error;
      }
    }

    async getNativeSctpCapabilities() {
      logger.debug('getNativeSctpCapabilities()');
      return {
        numStreams: SCTP_NUM_STREAMS
      };
    }

    run({
      direction,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers,
      iceTransportPolicy,
      additionalSettings,
      proprietaryConstraints,
      extendedRtpCapabilities
    }) {
      logger.debug('run()');
      this._direction = direction;
      this._remoteSdp = new RemoteSdp_1.RemoteSdp({
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters
      });
      this._sendingRtpParametersByKind = {
        audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
      };
      this._sendingRemoteRtpParametersByKind = {
        audio: ortc.getSendingRemoteRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRemoteRtpParameters('video', extendedRtpCapabilities)
      };
      this._pc = new RTCPeerConnection({
        iceServers: iceServers || [],
        iceTransportPolicy: iceTransportPolicy || 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        ...additionalSettings
      }, proprietaryConstraints); // Handle RTCPeerConnection connection status.

      this._pc.addEventListener('iceconnectionstatechange', () => {
        switch (this._pc.iceConnectionState) {
          case 'checking':
            this.emit('@connectionstatechange', 'connecting');
            break;

          case 'connected':
          case 'completed':
            this.emit('@connectionstatechange', 'connected');
            break;

          case 'failed':
            this.emit('@connectionstatechange', 'failed');
            break;

          case 'disconnected':
            this.emit('@connectionstatechange', 'disconnected');
            break;

          case 'closed':
            this.emit('@connectionstatechange', 'closed');
            break;
        }
      });
    } // eslint-disable-next-line @typescript-eslint/no-unused-vars


    async updateIceServers(iceServers) {
      // NOTE: Firefox does not implement pc.setConfiguration().
      throw new errors.UnsupportedError('not supported');
    }

    async restartIce(iceParameters) {
      logger.debug('restartIce()'); // Provide the remote SDP handler with new remote ICE parameters.

      this._remoteSdp.updateIceParameters(iceParameters);

      if (!this._transportReady) return;

      if (this._direction === 'send') {
        const offer = await this._pc.createOffer({
          iceRestart: true
        });
        logger.debug('restartIce() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);
        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
      } else {
        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug('restartIce() | calling pc.setLocalDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
      }
    }

    async getTransportStats() {
      return this._pc.getStats();
    }

    async send({
      track,
      encodings,
      codecOptions,
      codec
    }) {
      this._assertSendDirection();

      logger.debug('send() [kind:%s, track.id:%s]', track.kind, track.id);
      let reverseEncodings;

      if (encodings && encodings.length > 1) {
        encodings.forEach((encoding, idx) => {
          encoding.rid = `r${idx}`;
        }); // Clone the encodings and reverse them because Firefox likes them
        // from high to low.

        reverseEncodings = utils.clone(encodings).reverse();
      }

      const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind]); // This may throw.

      sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs, codec);
      const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind]); // This may throw.

      sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs, codec); // NOTE: Firefox fails sometimes to properly anticipate the closed media
      // section that it should use, so don't reuse closed media sections.
      //   https://github.com/versatica/mediasoup-client/issues/104
      //
      // const mediaSectionIdx = this._remoteSdp!.getNextMediaSectionIdx();

      const transceiver = this._pc.addTransceiver(track, {
        direction: 'sendonly',
        streams: [this._sendStream]
      }); // NOTE: This is not spec compliants. Encodings should be given in addTransceiver
      // second argument, but Firefox does not support it.


      if (reverseEncodings) {
        const parameters = transceiver.sender.getParameters();
        parameters.encodings = reverseEncodings;
        await transceiver.sender.setParameters(parameters);
      }

      const offer = await this._pc.createOffer();
      let localSdpObject = lib$3.parse(offer.sdp); // In Firefox use DTLS role client even if we are the "offerer" since
      // Firefox does not respect ICE-Lite.

      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'client',
        localSdpObject
      });
      logger.debug('send() | calling pc.setLocalDescription() [offer:%o]', offer);
      await this._pc.setLocalDescription(offer); // We can now get the transceiver.mid.

      const localId = transceiver.mid; // Set MID.

      sendingRtpParameters.mid = localId;
      localSdpObject = lib$3.parse(this._pc.localDescription.sdp);
      const offerMediaObject = localSdpObject.media[localSdpObject.media.length - 1]; // Set RTCP CNAME.

      sendingRtpParameters.rtcp.cname = commonUtils.getCname({
        offerMediaObject
      }); // Set RTP encodings by parsing the SDP offer if no encodings are given.

      if (!encodings) {
        sendingRtpParameters.encodings = unifiedPlanUtils.getRtpEncodings({
          offerMediaObject
        });
      } // Set RTP encodings by parsing the SDP offer and complete them with given
      // one if just a single encoding has been given.
      else if (encodings.length === 1) {
          const newEncodings = unifiedPlanUtils.getRtpEncodings({
            offerMediaObject
          });
          Object.assign(newEncodings[0], encodings[0]);
          sendingRtpParameters.encodings = newEncodings;
        } // Otherwise if more than 1 encoding are given use them verbatim.
        else {
            sendingRtpParameters.encodings = encodings;
          } // If VP8 or H264 and there is effective simulcast, add scalabilityMode to
      // each encoding.


      if (sendingRtpParameters.encodings.length > 1 && (sendingRtpParameters.codecs[0].mimeType.toLowerCase() === 'video/vp8' || sendingRtpParameters.codecs[0].mimeType.toLowerCase() === 'video/h264')) {
        for (const encoding of sendingRtpParameters.encodings) {
          encoding.scalabilityMode = 'S1T3';
        }
      }

      this._remoteSdp.send({
        offerMediaObject,
        offerRtpParameters: sendingRtpParameters,
        answerRtpParameters: sendingRemoteRtpParameters,
        codecOptions,
        extmapAllowMixed: true
      });

      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('send() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer); // Store in the map.

      this._mapMidTransceiver.set(localId, transceiver);

      return {
        localId,
        rtpParameters: sendingRtpParameters,
        rtpSender: transceiver.sender
      };
    }

    async stopSending(localId) {
      logger.debug('stopSending() [localId:%s]', localId);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated transceiver not found');
      transceiver.sender.replaceTrack(null);

      this._pc.removeTrack(transceiver.sender); // NOTE: Cannot use closeMediaSection() due to the the note above in send()
      // method.
      // this._remoteSdp!.closeMediaSection(transceiver.mid);


      this._remoteSdp.disableMediaSection(transceiver.mid);

      const offer = await this._pc.createOffer();
      logger.debug('stopSending() | calling pc.setLocalDescription() [offer:%o]', offer);
      await this._pc.setLocalDescription(offer);
      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopSending() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer);
    }

    async replaceTrack(localId, track) {
      this._assertSendDirection();

      if (track) {
        logger.debug('replaceTrack() [localId:%s, track.id:%s]', localId, track.id);
      } else {
        logger.debug('replaceTrack() [localId:%s, no track]', localId);
      }

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      await transceiver.sender.replaceTrack(track);
    }

    async setMaxSpatialLayer(localId, spatialLayer) {
      this._assertSendDirection();

      logger.debug('setMaxSpatialLayer() [localId:%s, spatialLayer:%s]', localId, spatialLayer);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated transceiver not found');
      const parameters = transceiver.sender.getParameters(); // NOTE: We require encodings given from low to high, however Firefox
      // requires them in reverse order, so do magic here.

      spatialLayer = parameters.encodings.length - 1 - spatialLayer;
      parameters.encodings.forEach((encoding, idx) => {
        if (idx >= spatialLayer) encoding.active = true;else encoding.active = false;
      });
      await transceiver.sender.setParameters(parameters);
    }

    async setRtpEncodingParameters(localId, params) {
      this._assertSendDirection();

      logger.debug('setRtpEncodingParameters() [localId:%s, params:%o]', localId, params);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      const parameters = transceiver.sender.getParameters();
      parameters.encodings.forEach((encoding, idx) => {
        parameters.encodings[idx] = { ...encoding,
          ...params
        };
      });
      await transceiver.sender.setParameters(parameters);
    }

    async getSenderStats(localId) {
      this._assertSendDirection();

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      return transceiver.sender.getStats();
    }

    async sendDataChannel({
      ordered,
      maxPacketLifeTime,
      maxRetransmits,
      label,
      protocol,
      priority
    }) {
      this._assertSendDirection();

      const options = {
        negotiated: true,
        id: this._nextSendSctpStreamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits,
        protocol,
        priority
      };
      logger.debug('sendDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // Increase next id.


      this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS; // If this is the first DataChannel we need to create the SDP answer with
      // m=application section.

      if (!this._hasDataChannelMediaSection) {
        const offer = await this._pc.createOffer();
        const localSdpObject = lib$3.parse(offer.sdp);
        const offerMediaObject = localSdpObject.media.find(m => m.type === 'application');
        if (!this._transportReady) await this._setupTransport({
          localDtlsRole: 'server',
          localSdpObject
        });
        logger.debug('sendDataChannel() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);

        this._remoteSdp.sendSctpAssociation({
          offerMediaObject
        });

        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      const sctpStreamParameters = {
        streamId: options.id,
        ordered: options.ordered,
        maxPacketLifeTime: options.maxPacketLifeTime,
        maxRetransmits: options.maxRetransmits
      };
      return {
        dataChannel,
        sctpStreamParameters
      };
    }

    async receive({
      trackId,
      kind,
      rtpParameters
    }) {
      this._assertRecvDirection();

      logger.debug('receive() [trackId:%s, kind:%s]', trackId, kind);
      const localId = rtpParameters.mid || String(this._mapMidTransceiver.size);

      this._remoteSdp.receive({
        mid: localId,
        kind,
        offerRtpParameters: rtpParameters,
        streamId: rtpParameters.rtcp.cname,
        trackId
      });

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('receive() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      let answer = await this._pc.createAnswer();
      const localSdpObject = lib$3.parse(answer.sdp);
      const answerMediaObject = localSdpObject.media.find(m => String(m.mid) === localId); // May need to modify codec parameters in the answer based on codec
      // parameters in the offer.

      commonUtils.applyCodecParameters({
        offerRtpParameters: rtpParameters,
        answerMediaObject
      });
      answer = {
        type: 'answer',
        sdp: lib$3.write(localSdpObject)
      };
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'client',
        localSdpObject
      });
      logger.debug('receive() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);

      const transceiver = this._pc.getTransceivers().find(t => t.mid === localId);

      if (!transceiver) throw new Error('new RTCRtpTransceiver not found'); // Store in the map.

      this._mapMidTransceiver.set(localId, transceiver);

      return {
        localId,
        track: transceiver.receiver.track,
        rtpReceiver: transceiver.receiver
      };
    }

    async stopReceiving(localId) {
      this._assertRecvDirection();

      logger.debug('stopReceiving() [localId:%s]', localId);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');

      this._remoteSdp.closeMediaSection(transceiver.mid);

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopReceiving() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      const answer = await this._pc.createAnswer();
      logger.debug('stopReceiving() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);
    }

    async getReceiverStats(localId) {
      this._assertRecvDirection();

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      return transceiver.receiver.getStats();
    }

    async receiveDataChannel({
      sctpStreamParameters,
      label,
      protocol
    }) {
      this._assertRecvDirection();

      const {
        streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits
      } = sctpStreamParameters;
      const options = {
        negotiated: true,
        id: streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits,
        protocol
      };
      logger.debug('receiveDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // If this is the first DataChannel we need to create the SDP offer with
      // m=application section.


      if (!this._hasDataChannelMediaSection) {
        this._remoteSdp.receiveSctpAssociation();

        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();

        if (!this._transportReady) {
          const localSdpObject = lib$3.parse(answer.sdp);
          await this._setupTransport({
            localDtlsRole: 'client',
            localSdpObject
          });
        }

        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      return {
        dataChannel
      };
    }

    async _setupTransport({
      localDtlsRole,
      localSdpObject
    }) {
      if (!localSdpObject) localSdpObject = lib$3.parse(this._pc.localDescription.sdp); // Get our local DTLS parameters.

      const dtlsParameters = commonUtils.extractDtlsParameters({
        sdpObject: localSdpObject
      }); // Set our DTLS role.

      dtlsParameters.role = localDtlsRole; // Update the remote DTLS role in the SDP.

      this._remoteSdp.updateDtlsRole(localDtlsRole === 'client' ? 'server' : 'client'); // Need to tell the remote transport about our parameters.


      await this.safeEmitAsPromise('@connect', {
        dtlsParameters
      });
      this._transportReady = true;
    }

    _assertSendDirection() {
      if (this._direction !== 'send') {
        throw new Error('method can just be called for handlers with "send" direction');
      }
    }

    _assertRecvDirection() {
      if (this._direction !== 'recv') {
        throw new Error('method can just be called for handlers with "recv" direction');
      }
    }

  }

  exports.Firefox60 = Firefox60;
});

var Safari12_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('Safari12');
  const SCTP_NUM_STREAMS = {
    OS: 1024,
    MIS: 1024
  };

  class Safari12 extends HandlerInterface_1.HandlerInterface {
    constructor() {
      super(); // Map of RTCTransceivers indexed by MID.

      this._mapMidTransceiver = new Map(); // Local stream for sending.

      this._sendStream = new MediaStream(); // Whether a DataChannel m=application section has been created.

      this._hasDataChannelMediaSection = false; // Sending DataChannel id value counter. Incremented for each new DataChannel.

      this._nextSendSctpStreamId = 0; // Got transport local and remote parameters.

      this._transportReady = false;
    }
    /**
     * Creates a factory function.
     */


    static createFactory() {
      return () => new Safari12();
    }

    get name() {
      return 'Safari12';
    }

    close() {
      logger.debug('close()'); // Close RTCPeerConnection.

      if (this._pc) {
        try {
          this._pc.close();
        } catch (error) {}
      }
    }

    async getNativeRtpCapabilities() {
      logger.debug('getNativeRtpCapabilities()');
      const pc = new RTCPeerConnection({
        iceServers: [],
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      });

      try {
        pc.addTransceiver('audio');
        pc.addTransceiver('video');
        const offer = await pc.createOffer();

        try {
          pc.close();
        } catch (error) {}

        const sdpObject = lib$3.parse(offer.sdp);
        const nativeRtpCapabilities = commonUtils.extractRtpCapabilities({
          sdpObject
        });
        return nativeRtpCapabilities;
      } catch (error) {
        try {
          pc.close();
        } catch (error2) {}

        throw error;
      }
    }

    async getNativeSctpCapabilities() {
      logger.debug('getNativeSctpCapabilities()');
      return {
        numStreams: SCTP_NUM_STREAMS
      };
    }

    run({
      direction,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers,
      iceTransportPolicy,
      additionalSettings,
      proprietaryConstraints,
      extendedRtpCapabilities
    }) {
      logger.debug('run()');
      this._direction = direction;
      this._remoteSdp = new RemoteSdp_1.RemoteSdp({
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters
      });
      this._sendingRtpParametersByKind = {
        audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
      };
      this._sendingRemoteRtpParametersByKind = {
        audio: ortc.getSendingRemoteRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRemoteRtpParameters('video', extendedRtpCapabilities)
      };
      this._pc = new RTCPeerConnection({
        iceServers: iceServers || [],
        iceTransportPolicy: iceTransportPolicy || 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        ...additionalSettings
      }, proprietaryConstraints); // Handle RTCPeerConnection connection status.

      this._pc.addEventListener('iceconnectionstatechange', () => {
        switch (this._pc.iceConnectionState) {
          case 'checking':
            this.emit('@connectionstatechange', 'connecting');
            break;

          case 'connected':
          case 'completed':
            this.emit('@connectionstatechange', 'connected');
            break;

          case 'failed':
            this.emit('@connectionstatechange', 'failed');
            break;

          case 'disconnected':
            this.emit('@connectionstatechange', 'disconnected');
            break;

          case 'closed':
            this.emit('@connectionstatechange', 'closed');
            break;
        }
      });
    }

    async updateIceServers(iceServers) {
      logger.debug('updateIceServers()');

      const configuration = this._pc.getConfiguration();

      configuration.iceServers = iceServers;

      this._pc.setConfiguration(configuration);
    }

    async restartIce(iceParameters) {
      logger.debug('restartIce()'); // Provide the remote SDP handler with new remote ICE parameters.

      this._remoteSdp.updateIceParameters(iceParameters);

      if (!this._transportReady) return;

      if (this._direction === 'send') {
        const offer = await this._pc.createOffer({
          iceRestart: true
        });
        logger.debug('restartIce() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);
        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
      } else {
        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug('restartIce() | calling pc.setLocalDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
      }
    }

    async getTransportStats() {
      return this._pc.getStats();
    }

    async send({
      track,
      encodings,
      codecOptions,
      codec
    }) {
      this._assertSendDirection();

      logger.debug('send() [kind:%s, track.id:%s]', track.kind, track.id);
      const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind]); // This may throw.

      sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs, codec);
      const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind]); // This may throw.

      sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs, codec);

      const mediaSectionIdx = this._remoteSdp.getNextMediaSectionIdx();

      const transceiver = this._pc.addTransceiver(track, {
        direction: 'sendonly',
        streams: [this._sendStream]
      });

      let offer = await this._pc.createOffer();
      let localSdpObject = lib$3.parse(offer.sdp);
      let offerMediaObject;
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'server',
        localSdpObject
      });

      if (encodings && encodings.length > 1) {
        logger.debug('send() | enabling legacy simulcast');
        localSdpObject = lib$3.parse(offer.sdp);
        offerMediaObject = localSdpObject.media[mediaSectionIdx.idx];
        unifiedPlanUtils.addLegacySimulcast({
          offerMediaObject,
          numStreams: encodings.length
        });
        offer = {
          type: 'offer',
          sdp: lib$3.write(localSdpObject)
        };
      }

      logger.debug('send() | calling pc.setLocalDescription() [offer:%o]', offer);
      await this._pc.setLocalDescription(offer); // We can now get the transceiver.mid.

      const localId = transceiver.mid; // Set MID.

      sendingRtpParameters.mid = localId;
      localSdpObject = lib$3.parse(this._pc.localDescription.sdp);
      offerMediaObject = localSdpObject.media[mediaSectionIdx.idx]; // Set RTCP CNAME.

      sendingRtpParameters.rtcp.cname = commonUtils.getCname({
        offerMediaObject
      }); // Set RTP encodings.

      sendingRtpParameters.encodings = unifiedPlanUtils.getRtpEncodings({
        offerMediaObject
      }); // Complete encodings with given values.

      if (encodings) {
        for (let idx = 0; idx < sendingRtpParameters.encodings.length; ++idx) {
          if (encodings[idx]) Object.assign(sendingRtpParameters.encodings[idx], encodings[idx]);
        }
      } // If VP8 or H264 and there is effective simulcast, add scalabilityMode to
      // each encoding.


      if (sendingRtpParameters.encodings.length > 1 && (sendingRtpParameters.codecs[0].mimeType.toLowerCase() === 'video/vp8' || sendingRtpParameters.codecs[0].mimeType.toLowerCase() === 'video/h264')) {
        for (const encoding of sendingRtpParameters.encodings) {
          encoding.scalabilityMode = 'S1T3';
        }
      }

      this._remoteSdp.send({
        offerMediaObject,
        reuseMid: mediaSectionIdx.reuseMid,
        offerRtpParameters: sendingRtpParameters,
        answerRtpParameters: sendingRemoteRtpParameters,
        codecOptions
      });

      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('send() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer); // Store in the map.

      this._mapMidTransceiver.set(localId, transceiver);

      return {
        localId,
        rtpParameters: sendingRtpParameters,
        rtpSender: transceiver.sender
      };
    }

    async stopSending(localId) {
      this._assertSendDirection();

      logger.debug('stopSending() [localId:%s]', localId);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      transceiver.sender.replaceTrack(null);

      this._pc.removeTrack(transceiver.sender);

      this._remoteSdp.closeMediaSection(transceiver.mid);

      const offer = await this._pc.createOffer();
      logger.debug('stopSending() | calling pc.setLocalDescription() [offer:%o]', offer);
      await this._pc.setLocalDescription(offer);
      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopSending() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer);
    }

    async replaceTrack(localId, track) {
      this._assertSendDirection();

      if (track) {
        logger.debug('replaceTrack() [localId:%s, track.id:%s]', localId, track.id);
      } else {
        logger.debug('replaceTrack() [localId:%s, no track]', localId);
      }

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      await transceiver.sender.replaceTrack(track);
    }

    async setMaxSpatialLayer(localId, spatialLayer) {
      this._assertSendDirection();

      logger.debug('setMaxSpatialLayer() [localId:%s, spatialLayer:%s]', localId, spatialLayer);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      const parameters = transceiver.sender.getParameters();
      parameters.encodings.forEach((encoding, idx) => {
        if (idx <= spatialLayer) encoding.active = true;else encoding.active = false;
      });
      await transceiver.sender.setParameters(parameters);
    }

    async setRtpEncodingParameters(localId, params) {
      this._assertSendDirection();

      logger.debug('setRtpEncodingParameters() [localId:%s, params:%o]', localId, params);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      const parameters = transceiver.sender.getParameters();
      parameters.encodings.forEach((encoding, idx) => {
        parameters.encodings[idx] = { ...encoding,
          ...params
        };
      });
      await transceiver.sender.setParameters(parameters);
    }

    async getSenderStats(localId) {
      this._assertSendDirection();

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      return transceiver.sender.getStats();
    }

    async sendDataChannel({
      ordered,
      maxPacketLifeTime,
      maxRetransmits,
      label,
      protocol,
      priority
    }) {
      this._assertSendDirection();

      const options = {
        negotiated: true,
        id: this._nextSendSctpStreamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits,
        protocol,
        priority
      };
      logger.debug('sendDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // Increase next id.


      this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS; // If this is the first DataChannel we need to create the SDP answer with
      // m=application section.

      if (!this._hasDataChannelMediaSection) {
        const offer = await this._pc.createOffer();
        const localSdpObject = lib$3.parse(offer.sdp);
        const offerMediaObject = localSdpObject.media.find(m => m.type === 'application');
        if (!this._transportReady) await this._setupTransport({
          localDtlsRole: 'server',
          localSdpObject
        });
        logger.debug('sendDataChannel() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);

        this._remoteSdp.sendSctpAssociation({
          offerMediaObject
        });

        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      const sctpStreamParameters = {
        streamId: options.id,
        ordered: options.ordered,
        maxPacketLifeTime: options.maxPacketLifeTime,
        maxRetransmits: options.maxRetransmits
      };
      return {
        dataChannel,
        sctpStreamParameters
      };
    }

    async receive({
      trackId,
      kind,
      rtpParameters
    }) {
      this._assertRecvDirection();

      logger.debug('receive() [trackId:%s, kind:%s]', trackId, kind);
      const localId = rtpParameters.mid || String(this._mapMidTransceiver.size);

      this._remoteSdp.receive({
        mid: localId,
        kind,
        offerRtpParameters: rtpParameters,
        streamId: rtpParameters.rtcp.cname,
        trackId
      });

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('receive() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      let answer = await this._pc.createAnswer();
      const localSdpObject = lib$3.parse(answer.sdp);
      const answerMediaObject = localSdpObject.media.find(m => String(m.mid) === localId); // May need to modify codec parameters in the answer based on codec
      // parameters in the offer.

      commonUtils.applyCodecParameters({
        offerRtpParameters: rtpParameters,
        answerMediaObject
      });
      answer = {
        type: 'answer',
        sdp: lib$3.write(localSdpObject)
      };
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'client',
        localSdpObject
      });
      logger.debug('receive() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);

      const transceiver = this._pc.getTransceivers().find(t => t.mid === localId);

      if (!transceiver) throw new Error('new RTCRtpTransceiver not found'); // Store in the map.

      this._mapMidTransceiver.set(localId, transceiver);

      return {
        localId,
        track: transceiver.receiver.track,
        rtpReceiver: transceiver.receiver
      };
    }

    async stopReceiving(localId) {
      this._assertRecvDirection();

      logger.debug('stopReceiving() [localId:%s]', localId);

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');

      this._remoteSdp.closeMediaSection(transceiver.mid);

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopReceiving() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      const answer = await this._pc.createAnswer();
      logger.debug('stopReceiving() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);
    }

    async getReceiverStats(localId) {
      this._assertRecvDirection();

      const transceiver = this._mapMidTransceiver.get(localId);

      if (!transceiver) throw new Error('associated RTCRtpTransceiver not found');
      return transceiver.receiver.getStats();
    }

    async receiveDataChannel({
      sctpStreamParameters,
      label,
      protocol
    }) {
      this._assertRecvDirection();

      const {
        streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits
      } = sctpStreamParameters;
      const options = {
        negotiated: true,
        id: streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits,
        protocol
      };
      logger.debug('receiveDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // If this is the first DataChannel we need to create the SDP offer with
      // m=application section.


      if (!this._hasDataChannelMediaSection) {
        this._remoteSdp.receiveSctpAssociation();

        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();

        if (!this._transportReady) {
          const localSdpObject = lib$3.parse(answer.sdp);
          await this._setupTransport({
            localDtlsRole: 'client',
            localSdpObject
          });
        }

        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      return {
        dataChannel
      };
    }

    async _setupTransport({
      localDtlsRole,
      localSdpObject
    }) {
      if (!localSdpObject) localSdpObject = lib$3.parse(this._pc.localDescription.sdp); // Get our local DTLS parameters.

      const dtlsParameters = commonUtils.extractDtlsParameters({
        sdpObject: localSdpObject
      }); // Set our DTLS role.

      dtlsParameters.role = localDtlsRole; // Update the remote DTLS role in the SDP.

      this._remoteSdp.updateDtlsRole(localDtlsRole === 'client' ? 'server' : 'client'); // Need to tell the remote transport about our parameters.


      await this.safeEmitAsPromise('@connect', {
        dtlsParameters
      });
      this._transportReady = true;
    }

    _assertSendDirection() {
      if (this._direction !== 'send') {
        throw new Error('method can just be called for handlers with "send" direction');
      }
    }

    _assertRecvDirection() {
      if (this._direction !== 'recv') {
        throw new Error('method can just be called for handlers with "recv" direction');
      }
    }

  }

  exports.Safari12 = Safari12;
});

var Safari11_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('Safari11');
  const SCTP_NUM_STREAMS = {
    OS: 1024,
    MIS: 1024
  };

  class Safari11 extends HandlerInterface_1.HandlerInterface {
    constructor() {
      super(); // Local stream for sending.

      this._sendStream = new MediaStream(); // Map of RTCRtpSender indexed by localId.

      this._mapSendLocalIdRtpSender = new Map(); // Next sending localId.

      this._nextSendLocalId = 0; // Map of MID, RTP parameters and RTCRtpReceiver indexed by local id.
      // Value is an Object with mid, rtpParameters and rtpReceiver.

      this._mapRecvLocalIdInfo = new Map(); // Whether a DataChannel m=application section has been created.

      this._hasDataChannelMediaSection = false; // Sending DataChannel id value counter. Incremented for each new DataChannel.

      this._nextSendSctpStreamId = 0; // Got transport local and remote parameters.

      this._transportReady = false;
    }
    /**
     * Creates a factory function.
     */


    static createFactory() {
      return () => new Safari11();
    }

    get name() {
      return 'Safari11';
    }

    close() {
      logger.debug('close()'); // Close RTCPeerConnection.

      if (this._pc) {
        try {
          this._pc.close();
        } catch (error) {}
      }
    }

    async getNativeRtpCapabilities() {
      logger.debug('getNativeRtpCapabilities()');
      const pc = new RTCPeerConnection({
        iceServers: [],
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        sdpSemantics: 'plan-b'
      });

      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });

        try {
          pc.close();
        } catch (error) {}

        const sdpObject = lib$3.parse(offer.sdp);
        const nativeRtpCapabilities = commonUtils.extractRtpCapabilities({
          sdpObject
        });
        return nativeRtpCapabilities;
      } catch (error) {
        try {
          pc.close();
        } catch (error2) {}

        throw error;
      }
    }

    async getNativeSctpCapabilities() {
      logger.debug('getNativeSctpCapabilities()');
      return {
        numStreams: SCTP_NUM_STREAMS
      };
    }

    run({
      direction,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers,
      iceTransportPolicy,
      additionalSettings,
      proprietaryConstraints,
      extendedRtpCapabilities
    }) {
      logger.debug('run()');
      this._direction = direction;
      this._remoteSdp = new RemoteSdp_1.RemoteSdp({
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
        planB: true
      });
      this._sendingRtpParametersByKind = {
        audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
      };
      this._sendingRemoteRtpParametersByKind = {
        audio: ortc.getSendingRemoteRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRemoteRtpParameters('video', extendedRtpCapabilities)
      };
      this._pc = new RTCPeerConnection({
        iceServers: iceServers || [],
        iceTransportPolicy: iceTransportPolicy || 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        ...additionalSettings
      }, proprietaryConstraints); // Handle RTCPeerConnection connection status.

      this._pc.addEventListener('iceconnectionstatechange', () => {
        switch (this._pc.iceConnectionState) {
          case 'checking':
            this.emit('@connectionstatechange', 'connecting');
            break;

          case 'connected':
          case 'completed':
            this.emit('@connectionstatechange', 'connected');
            break;

          case 'failed':
            this.emit('@connectionstatechange', 'failed');
            break;

          case 'disconnected':
            this.emit('@connectionstatechange', 'disconnected');
            break;

          case 'closed':
            this.emit('@connectionstatechange', 'closed');
            break;
        }
      });
    }

    async updateIceServers(iceServers) {
      logger.debug('updateIceServers()');

      const configuration = this._pc.getConfiguration();

      configuration.iceServers = iceServers;

      this._pc.setConfiguration(configuration);
    }

    async restartIce(iceParameters) {
      logger.debug('restartIce()'); // Provide the remote SDP handler with new remote ICE parameters.

      this._remoteSdp.updateIceParameters(iceParameters);

      if (!this._transportReady) return;

      if (this._direction === 'send') {
        const offer = await this._pc.createOffer({
          iceRestart: true
        });
        logger.debug('restartIce() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);
        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
      } else {
        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug('restartIce() | calling pc.setLocalDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
      }
    }

    async getTransportStats() {
      return this._pc.getStats();
    }

    async send({
      track,
      encodings,
      codecOptions,
      codec
    }) {
      this._assertSendDirection();

      logger.debug('send() [kind:%s, track.id:%s]', track.kind, track.id);

      if (codec) {
        logger.warn('send() | codec selection is not available in %s handler', this.name);
      }

      this._sendStream.addTrack(track);

      this._pc.addTrack(track, this._sendStream);

      let offer = await this._pc.createOffer();
      let localSdpObject = lib$3.parse(offer.sdp);
      let offerMediaObject;
      const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind]);
      sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs);
      const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind]);
      sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs);
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'server',
        localSdpObject
      });

      if (track.kind === 'video' && encodings && encodings.length > 1) {
        logger.debug('send() | enabling simulcast');
        localSdpObject = lib$3.parse(offer.sdp);
        offerMediaObject = localSdpObject.media.find(m => m.type === 'video');
        planBUtils.addLegacySimulcast({
          offerMediaObject,
          track,
          numStreams: encodings.length
        });
        offer = {
          type: 'offer',
          sdp: lib$3.write(localSdpObject)
        };
      }

      logger.debug('send() | calling pc.setLocalDescription() [offer:%o]', offer);
      await this._pc.setLocalDescription(offer);
      localSdpObject = lib$3.parse(this._pc.localDescription.sdp);
      offerMediaObject = localSdpObject.media.find(m => m.type === track.kind); // Set RTCP CNAME.

      sendingRtpParameters.rtcp.cname = commonUtils.getCname({
        offerMediaObject
      }); // Set RTP encodings.

      sendingRtpParameters.encodings = planBUtils.getRtpEncodings({
        offerMediaObject,
        track
      }); // Complete encodings with given values.

      if (encodings) {
        for (let idx = 0; idx < sendingRtpParameters.encodings.length; ++idx) {
          if (encodings[idx]) Object.assign(sendingRtpParameters.encodings[idx], encodings[idx]);
        }
      } // If VP8 and there is effective simulcast, add scalabilityMode to each
      // encoding.


      if (sendingRtpParameters.encodings.length > 1 && sendingRtpParameters.codecs[0].mimeType.toLowerCase() === 'video/vp8') {
        for (const encoding of sendingRtpParameters.encodings) {
          encoding.scalabilityMode = 'S1T3';
        }
      }

      this._remoteSdp.send({
        offerMediaObject,
        offerRtpParameters: sendingRtpParameters,
        answerRtpParameters: sendingRemoteRtpParameters,
        codecOptions
      });

      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('send() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer);
      const localId = String(this._nextSendLocalId);
      this._nextSendLocalId++;

      const rtpSender = this._pc.getSenders().find(s => s.track === track); // Insert into the map.


      this._mapSendLocalIdRtpSender.set(localId, rtpSender);

      return {
        localId: localId,
        rtpParameters: sendingRtpParameters,
        rtpSender
      };
    }

    async stopSending(localId) {
      this._assertSendDirection();

      const rtpSender = this._mapSendLocalIdRtpSender.get(localId);

      if (!rtpSender) throw new Error('associated RTCRtpSender not found');
      if (rtpSender.track) this._sendStream.removeTrack(rtpSender.track);

      this._mapSendLocalIdRtpSender.delete(localId);

      const offer = await this._pc.createOffer();
      logger.debug('stopSending() | calling pc.setLocalDescription() [offer:%o]', offer);

      try {
        await this._pc.setLocalDescription(offer);
      } catch (error) {
        // NOTE: If there are no sending tracks, setLocalDescription() will fail with
        // "Failed to create channels". If so, ignore it.
        if (this._sendStream.getTracks().length === 0) {
          logger.warn('stopSending() | ignoring expected error due no sending tracks: %s', error.toString());
          return;
        }

        throw error;
      }

      if (this._pc.signalingState === 'stable') return;
      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopSending() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer);
    }

    async replaceTrack(localId, track) {
      this._assertSendDirection();

      if (track) {
        logger.debug('replaceTrack() [localId:%s, track.id:%s]', localId, track.id);
      } else {
        logger.debug('replaceTrack() [localId:%s, no track]', localId);
      }

      const rtpSender = this._mapSendLocalIdRtpSender.get(localId);

      if (!rtpSender) throw new Error('associated RTCRtpSender not found');
      const oldTrack = rtpSender.track;
      await rtpSender.replaceTrack(track); // Remove the old track from the local stream.

      if (oldTrack) this._sendStream.removeTrack(oldTrack); // Add the new track to the local stream.

      if (track) this._sendStream.addTrack(track);
    }

    async setMaxSpatialLayer(localId, spatialLayer) {
      this._assertSendDirection();

      logger.debug('setMaxSpatialLayer() [localId:%s, spatialLayer:%s]', localId, spatialLayer);

      const rtpSender = this._mapSendLocalIdRtpSender.get(localId);

      if (!rtpSender) throw new Error('associated RTCRtpSender not found');
      const parameters = rtpSender.getParameters();
      parameters.encodings.forEach((encoding, idx) => {
        if (idx <= spatialLayer) encoding.active = true;else encoding.active = false;
      });
      await rtpSender.setParameters(parameters);
    }

    async setRtpEncodingParameters(localId, params) {
      this._assertSendDirection();

      logger.debug('setRtpEncodingParameters() [localId:%s, params:%o]', localId, params);

      const rtpSender = this._mapSendLocalIdRtpSender.get(localId);

      if (!rtpSender) throw new Error('associated RTCRtpSender not found');
      const parameters = rtpSender.getParameters();
      parameters.encodings.forEach((encoding, idx) => {
        parameters.encodings[idx] = { ...encoding,
          ...params
        };
      });
      await rtpSender.setParameters(parameters);
    }

    async getSenderStats(localId) {
      this._assertSendDirection();

      const rtpSender = this._mapSendLocalIdRtpSender.get(localId);

      if (!rtpSender) throw new Error('associated RTCRtpSender not found');
      return rtpSender.getStats();
    }

    async sendDataChannel({
      ordered,
      maxPacketLifeTime,
      maxRetransmits,
      label,
      protocol,
      priority
    }) {
      this._assertSendDirection();

      const options = {
        negotiated: true,
        id: this._nextSendSctpStreamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits,
        protocol,
        priority
      };
      logger.debug('sendDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // Increase next id.


      this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS; // If this is the first DataChannel we need to create the SDP answer with
      // m=application section.

      if (!this._hasDataChannelMediaSection) {
        const offer = await this._pc.createOffer();
        const localSdpObject = lib$3.parse(offer.sdp);
        const offerMediaObject = localSdpObject.media.find(m => m.type === 'application');
        if (!this._transportReady) await this._setupTransport({
          localDtlsRole: 'server',
          localSdpObject
        });
        logger.debug('sendDataChannel() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);

        this._remoteSdp.sendSctpAssociation({
          offerMediaObject
        });

        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      const sctpStreamParameters = {
        streamId: options.id,
        ordered: options.ordered,
        maxPacketLifeTime: options.maxPacketLifeTime,
        maxRetransmits: options.maxRetransmits
      };
      return {
        dataChannel,
        sctpStreamParameters
      };
    }

    async receive({
      trackId,
      kind,
      rtpParameters
    }) {
      this._assertRecvDirection();

      logger.debug('receive() [trackId:%s, kind:%s]', trackId, kind);
      const localId = trackId;
      const mid = kind;

      this._remoteSdp.receive({
        mid,
        kind,
        offerRtpParameters: rtpParameters,
        streamId: rtpParameters.rtcp.cname,
        trackId
      });

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('receive() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      let answer = await this._pc.createAnswer();
      const localSdpObject = lib$3.parse(answer.sdp);
      const answerMediaObject = localSdpObject.media.find(m => String(m.mid) === mid); // May need to modify codec parameters in the answer based on codec
      // parameters in the offer.

      commonUtils.applyCodecParameters({
        offerRtpParameters: rtpParameters,
        answerMediaObject
      });
      answer = {
        type: 'answer',
        sdp: lib$3.write(localSdpObject)
      };
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'client',
        localSdpObject
      });
      logger.debug('receive() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);

      const rtpReceiver = this._pc.getReceivers().find(r => r.track && r.track.id === localId);

      if (!rtpReceiver) throw new Error('new RTCRtpReceiver not'); // Insert into the map.

      this._mapRecvLocalIdInfo.set(localId, {
        mid,
        rtpParameters,
        rtpReceiver
      });

      return {
        localId,
        track: rtpReceiver.track,
        rtpReceiver
      };
    }

    async stopReceiving(localId) {
      this._assertRecvDirection();

      logger.debug('stopReceiving() [localId:%s]', localId);
      const {
        mid,
        rtpParameters
      } = this._mapRecvLocalIdInfo.get(localId) || {}; // Remove from the map.

      this._mapRecvLocalIdInfo.delete(localId);

      this._remoteSdp.planBStopReceiving({
        mid: mid,
        offerRtpParameters: rtpParameters
      });

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopReceiving() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      const answer = await this._pc.createAnswer();
      logger.debug('stopReceiving() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);
    }

    async getReceiverStats(localId) {
      this._assertRecvDirection();

      const {
        rtpReceiver
      } = this._mapRecvLocalIdInfo.get(localId) || {};
      if (!rtpReceiver) throw new Error('associated RTCRtpReceiver not found');
      return rtpReceiver.getStats();
    }

    async receiveDataChannel({
      sctpStreamParameters,
      label,
      protocol
    }) {
      this._assertRecvDirection();

      const {
        streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits
      } = sctpStreamParameters;
      const options = {
        negotiated: true,
        id: streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits,
        protocol
      };
      logger.debug('receiveDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // If this is the first DataChannel we need to create the SDP offer with
      // m=application section.


      if (!this._hasDataChannelMediaSection) {
        this._remoteSdp.receiveSctpAssociation({
          oldDataChannelSpec: true
        });

        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();

        if (!this._transportReady) {
          const localSdpObject = lib$3.parse(answer.sdp);
          await this._setupTransport({
            localDtlsRole: 'client',
            localSdpObject
          });
        }

        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      return {
        dataChannel
      };
    }

    async _setupTransport({
      localDtlsRole,
      localSdpObject
    }) {
      if (!localSdpObject) localSdpObject = lib$3.parse(this._pc.localDescription.sdp); // Get our local DTLS parameters.

      const dtlsParameters = commonUtils.extractDtlsParameters({
        sdpObject: localSdpObject
      }); // Set our DTLS role.

      dtlsParameters.role = localDtlsRole; // Update the remote DTLS role in the SDP.

      this._remoteSdp.updateDtlsRole(localDtlsRole === 'client' ? 'server' : 'client'); // Need to tell the remote transport about our parameters.


      await this.safeEmitAsPromise('@connect', {
        dtlsParameters
      });
      this._transportReady = true;
    }

    _assertSendDirection() {
      if (this._direction !== 'send') {
        throw new Error('method can just be called for handlers with "send" direction');
      }
    }

    _assertRecvDirection() {
      if (this._direction !== 'recv') {
        throw new Error('method can just be called for handlers with "recv" direction');
      }
    }

  }

  exports.Safari11 = Safari11;
});

var edgeUtils = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /**
   * Normalize ORTC based Edge's RTCRtpReceiver.getCapabilities() to produce a full
   * compliant ORTC RTCRtpCapabilities.
   */

  function getCapabilities() {
    const nativeCaps = RTCRtpReceiver.getCapabilities();
    const caps = utils.clone(nativeCaps);

    for (const codec of caps.codecs) {
      // Rename numChannels to channels.
      codec.channels = codec.numChannels;
      delete codec.numChannels; // Add mimeType.

      codec.mimeType = codec.mimeType || `${codec.kind}/${codec.name}`; // NOTE: Edge sets some numeric parameters as string rather than number. Fix them.

      if (codec.parameters) {
        const parameters = codec.parameters;
        if (parameters.apt) parameters.apt = Number(parameters.apt);
        if (parameters['packetization-mode']) parameters['packetization-mode'] = Number(parameters['packetization-mode']);
      } // Delete emty parameter String in rtcpFeedback.


      for (const feedback of codec.rtcpFeedback || []) {
        if (!feedback.parameter) feedback.parameter = '';
      }
    }

    return caps;
  }

  exports.getCapabilities = getCapabilities;
  /**
   * Generate RTCRtpParameters as ORTC based Edge likes.
   */

  function mangleRtpParameters(rtpParameters) {
    const params = utils.clone(rtpParameters); // Rename mid to muxId.

    if (params.mid) {
      params.muxId = params.mid;
      delete params.mid;
    }

    for (const codec of params.codecs) {
      // Rename channels to numChannels.
      if (codec.channels) {
        codec.numChannels = codec.channels;
        delete codec.channels;
      } // Add codec.name (requried by Edge).


      if (codec.mimeType && !codec.name) codec.name = codec.mimeType.split('/')[1]; // Remove mimeType.

      delete codec.mimeType;
    }

    return params;
  }

  exports.mangleRtpParameters = mangleRtpParameters;
});

var Edge11_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('Edge11');

  class Edge11 extends HandlerInterface_1.HandlerInterface {
    constructor() {
      super(); // Map of RTCRtpSenders indexed by id.

      this._rtpSenders = new Map(); // Map of RTCRtpReceivers indexed by id.

      this._rtpReceivers = new Map(); // Next localId for sending tracks.

      this._nextSendLocalId = 0; // Got transport local and remote parameters.

      this._transportReady = false;
    }
    /**
     * Creates a factory function.
     */


    static createFactory() {
      return () => new Edge11();
    }

    get name() {
      return 'Edge11';
    }

    close() {
      logger.debug('close()'); // Close the ICE gatherer.
      // NOTE: Not yet implemented by Edge.

      try {
        this._iceGatherer.close();
      } catch (error) {} // Close the ICE transport.


      try {
        this._iceTransport.stop();
      } catch (error) {} // Close the DTLS transport.


      try {
        this._dtlsTransport.stop();
      } catch (error) {} // Close RTCRtpSenders.


      for (const rtpSender of this._rtpSenders.values()) {
        try {
          rtpSender.stop();
        } catch (error) {}
      } // Close RTCRtpReceivers.


      for (const rtpReceiver of this._rtpReceivers.values()) {
        try {
          rtpReceiver.stop();
        } catch (error) {}
      }
    }

    async getNativeRtpCapabilities() {
      logger.debug('getNativeRtpCapabilities()');
      return edgeUtils.getCapabilities();
    }

    async getNativeSctpCapabilities() {
      logger.debug('getNativeSctpCapabilities()');
      return {
        numStreams: {
          OS: 0,
          MIS: 0
        }
      };
    }

    run({
      direction,
      // eslint-disable-line @typescript-eslint/no-unused-vars
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      // eslint-disable-line @typescript-eslint/no-unused-vars
      iceServers,
      iceTransportPolicy,
      additionalSettings,
      // eslint-disable-line @typescript-eslint/no-unused-vars
      proprietaryConstraints,
      // eslint-disable-line @typescript-eslint/no-unused-vars
      extendedRtpCapabilities
    }) {
      logger.debug('run()');
      this._sendingRtpParametersByKind = {
        audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
      };
      this._remoteIceParameters = iceParameters;
      this._remoteIceCandidates = iceCandidates;
      this._remoteDtlsParameters = dtlsParameters;
      this._cname = `CNAME-${utils.generateRandomNumber()}`;

      this._setIceGatherer({
        iceServers,
        iceTransportPolicy
      });

      this._setIceTransport();

      this._setDtlsTransport();
    } // eslint-disable-next-line @typescript-eslint/no-unused-vars


    async updateIceServers(iceServers) {
      // NOTE: Edge 11 does not implement iceGatherer.gater().
      throw new errors.UnsupportedError('not supported');
    }

    async restartIce(iceParameters) {
      logger.debug('restartIce()');
      this._remoteIceParameters = iceParameters;
      if (!this._transportReady) return;
      logger.debug('restartIce() | calling iceTransport.start()');

      this._iceTransport.start(this._iceGatherer, iceParameters, 'controlling');

      for (const candidate of this._remoteIceCandidates) {
        this._iceTransport.addRemoteCandidate(candidate);
      }

      this._iceTransport.addRemoteCandidate({});
    }

    async getTransportStats() {
      return this._iceTransport.getStats();
    }

    async send( // eslint-disable-next-line @typescript-eslint/no-unused-vars
    {
      track,
      encodings,
      codecOptions,
      codec
    }) {
      logger.debug('send() [kind:%s, track.id:%s]', track.kind, track.id);
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'server'
      });
      logger.debug('send() | calling new RTCRtpSender()');
      const rtpSender = new RTCRtpSender(track, this._dtlsTransport);
      const rtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind]);
      rtpParameters.codecs = ortc.reduceCodecs(rtpParameters.codecs, codec);
      const useRtx = rtpParameters.codecs.some(_codec => /.+\/rtx$/i.test(_codec.mimeType));
      if (!encodings) encodings = [{}];

      for (const encoding of encodings) {
        encoding.ssrc = utils.generateRandomNumber();
        if (useRtx) encoding.rtx = {
          ssrc: utils.generateRandomNumber()
        };
      }

      rtpParameters.encodings = encodings; // Fill RTCRtpParameters.rtcp.

      rtpParameters.rtcp = {
        cname: this._cname,
        reducedSize: true,
        mux: true
      }; // NOTE: Convert our standard RTCRtpParameters into those that Edge
      // expects.

      const edgeRtpParameters = edgeUtils.mangleRtpParameters(rtpParameters);
      logger.debug('send() | calling rtpSender.send() [params:%o]', edgeRtpParameters);
      await rtpSender.send(edgeRtpParameters);
      const localId = String(this._nextSendLocalId);
      this._nextSendLocalId++; // Store it.

      this._rtpSenders.set(localId, rtpSender);

      return {
        localId,
        rtpParameters,
        rtpSender
      };
    }

    async stopSending(localId) {
      logger.debug('stopSending() [localId:%s]', localId);

      const rtpSender = this._rtpSenders.get(localId);

      if (!rtpSender) throw new Error('RTCRtpSender not found');

      this._rtpSenders.delete(localId);

      try {
        logger.debug('stopSending() | calling rtpSender.stop()');
        rtpSender.stop();
      } catch (error) {
        logger.warn('stopSending() | rtpSender.stop() failed:%o', error);
        throw error;
      }
    }

    async replaceTrack(localId, track) {
      if (track) {
        logger.debug('replaceTrack() [localId:%s, track.id:%s]', localId, track.id);
      } else {
        logger.debug('replaceTrack() [localId:%s, no track]', localId);
      }

      const rtpSender = this._rtpSenders.get(localId);

      if (!rtpSender) throw new Error('RTCRtpSender not found');
      rtpSender.setTrack(track);
    }

    async setMaxSpatialLayer(localId, spatialLayer) {
      logger.debug('setMaxSpatialLayer() [localId:%s, spatialLayer:%s]', localId, spatialLayer);

      const rtpSender = this._rtpSenders.get(localId);

      if (!rtpSender) throw new Error('RTCRtpSender not found');
      const parameters = rtpSender.getParameters();
      parameters.encodings.forEach((encoding, idx) => {
        if (idx <= spatialLayer) encoding.active = true;else encoding.active = false;
      });
      await rtpSender.setParameters(parameters);
    }

    async setRtpEncodingParameters(localId, params) {
      logger.debug('setRtpEncodingParameters() [localId:%s, params:%o]', localId, params);

      const rtpSender = this._rtpSenders.get(localId);

      if (!rtpSender) throw new Error('RTCRtpSender not found');
      const parameters = rtpSender.getParameters();
      parameters.encodings.forEach((encoding, idx) => {
        parameters.encodings[idx] = { ...encoding,
          ...params
        };
      });
      await rtpSender.setParameters(parameters);
    }

    async getSenderStats(localId) {
      const rtpSender = this._rtpSenders.get(localId);

      if (!rtpSender) throw new Error('RTCRtpSender not found');
      return rtpSender.getStats();
    }

    async sendDataChannel( // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options) {
      throw new errors.UnsupportedError('not implemented');
    }

    async receive({
      trackId,
      kind,
      rtpParameters
    }) {
      logger.debug('receive() [trackId:%s, kind:%s]', trackId, kind);
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'server'
      });
      logger.debug('receive() | calling new RTCRtpReceiver()');
      const rtpReceiver = new RTCRtpReceiver(this._dtlsTransport, kind);
      rtpReceiver.addEventListener('error', event => {
        logger.error('rtpReceiver "error" event [event:%o]', event);
      }); // NOTE: Convert our standard RTCRtpParameters into those that Edge
      // expects.

      const edgeRtpParameters = edgeUtils.mangleRtpParameters(rtpParameters);
      logger.debug('receive() | calling rtpReceiver.receive() [params:%o]', edgeRtpParameters);
      await rtpReceiver.receive(edgeRtpParameters);
      const localId = trackId; // Store it.

      this._rtpReceivers.set(localId, rtpReceiver);

      return {
        localId,
        track: rtpReceiver.track,
        rtpReceiver
      };
    }

    async stopReceiving(localId) {
      logger.debug('stopReceiving() [localId:%s]', localId);

      const rtpReceiver = this._rtpReceivers.get(localId);

      if (!rtpReceiver) throw new Error('RTCRtpReceiver not found');

      this._rtpReceivers.delete(localId);

      try {
        logger.debug('stopReceiving() | calling rtpReceiver.stop()');
        rtpReceiver.stop();
      } catch (error) {
        logger.warn('stopReceiving() | rtpReceiver.stop() failed:%o', error);
      }
    }

    async getReceiverStats(localId) {
      const rtpReceiver = this._rtpReceivers.get(localId);

      if (!rtpReceiver) throw new Error('RTCRtpReceiver not found');
      return rtpReceiver.getStats();
    }

    async receiveDataChannel( // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options) {
      throw new errors.UnsupportedError('not implemented');
    }

    _setIceGatherer({
      iceServers,
      iceTransportPolicy
    }) {
      const iceGatherer = new RTCIceGatherer({
        iceServers: iceServers || [],
        gatherPolicy: iceTransportPolicy || 'all'
      });
      iceGatherer.addEventListener('error', event => {
        logger.error('iceGatherer "error" event [event:%o]', event);
      }); // NOTE: Not yet implemented by Edge, which starts gathering automatically.

      try {
        iceGatherer.gather();
      } catch (error) {
        logger.debug('_setIceGatherer() | iceGatherer.gather() failed: %s', error.toString());
      }

      this._iceGatherer = iceGatherer;
    }

    _setIceTransport() {
      const iceTransport = new RTCIceTransport(this._iceGatherer); // NOTE: Not yet implemented by Edge.

      iceTransport.addEventListener('statechange', () => {
        switch (iceTransport.state) {
          case 'checking':
            this.emit('@connectionstatechange', 'connecting');
            break;

          case 'connected':
          case 'completed':
            this.emit('@connectionstatechange', 'connected');
            break;

          case 'failed':
            this.emit('@connectionstatechange', 'failed');
            break;

          case 'disconnected':
            this.emit('@connectionstatechange', 'disconnected');
            break;

          case 'closed':
            this.emit('@connectionstatechange', 'closed');
            break;
        }
      }); // NOTE: Not standard, but implemented by Edge.

      iceTransport.addEventListener('icestatechange', () => {
        switch (iceTransport.state) {
          case 'checking':
            this.emit('@connectionstatechange', 'connecting');
            break;

          case 'connected':
          case 'completed':
            this.emit('@connectionstatechange', 'connected');
            break;

          case 'failed':
            this.emit('@connectionstatechange', 'failed');
            break;

          case 'disconnected':
            this.emit('@connectionstatechange', 'disconnected');
            break;

          case 'closed':
            this.emit('@connectionstatechange', 'closed');
            break;
        }
      });
      iceTransport.addEventListener('candidatepairchange', event => {
        logger.debug('iceTransport "candidatepairchange" event [pair:%o]', event.pair);
      });
      this._iceTransport = iceTransport;
    }

    _setDtlsTransport() {
      const dtlsTransport = new RTCDtlsTransport(this._iceTransport); // NOTE: Not yet implemented by Edge.

      dtlsTransport.addEventListener('statechange', () => {
        logger.debug('dtlsTransport "statechange" event [state:%s]', dtlsTransport.state);
      }); // NOTE: Not standard, but implemented by Edge.

      dtlsTransport.addEventListener('dtlsstatechange', () => {
        logger.debug('dtlsTransport "dtlsstatechange" event [state:%s]', dtlsTransport.state);
        if (dtlsTransport.state === 'closed') this.emit('@connectionstatechange', 'closed');
      });
      dtlsTransport.addEventListener('error', event => {
        logger.error('dtlsTransport "error" event [event:%o]', event);
      });
      this._dtlsTransport = dtlsTransport;
    }

    async _setupTransport({
      localDtlsRole
    }) {
      logger.debug('_setupTransport()'); // Get our local DTLS parameters.

      const dtlsParameters = this._dtlsTransport.getLocalParameters();

      dtlsParameters.role = localDtlsRole; // Need to tell the remote transport about our parameters.

      await this.safeEmitAsPromise('@connect', {
        dtlsParameters
      }); // Start the RTCIceTransport.

      this._iceTransport.start(this._iceGatherer, this._remoteIceParameters, 'controlling'); // Add remote ICE candidates.


      for (const candidate of this._remoteIceCandidates) {
        this._iceTransport.addRemoteCandidate(candidate);
      } // Also signal a 'complete' candidate as per spec.
      // NOTE: It should be {complete: true} but Edge prefers {}.
      // NOTE: If we don't signal end of candidates, the Edge RTCIceTransport
      // won't enter the 'completed' state.


      this._iceTransport.addRemoteCandidate({}); // NOTE: Edge does not like SHA less than 256.


      this._remoteDtlsParameters.fingerprints = this._remoteDtlsParameters.fingerprints.filter(fingerprint => {
        return fingerprint.algorithm === 'sha-256' || fingerprint.algorithm === 'sha-384' || fingerprint.algorithm === 'sha-512';
      }); // Start the RTCDtlsTransport.

      this._dtlsTransport.start(this._remoteDtlsParameters);

      this._transportReady = true;
    }

  }

  exports.Edge11 = Edge11;
});

var ReactNative_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('ReactNative');
  const SCTP_NUM_STREAMS = {
    OS: 1024,
    MIS: 1024
  };

  class ReactNative extends HandlerInterface_1.HandlerInterface {
    constructor() {
      super(); // Local stream for sending.

      this._sendStream = new MediaStream(); // Map of sending MediaStreamTracks indexed by localId.

      this._mapSendLocalIdTrack = new Map(); // Next sending localId.

      this._nextSendLocalId = 0; // Map of MID, RTP parameters and RTCRtpReceiver indexed by local id.
      // Value is an Object with mid, rtpParameters and rtpReceiver.

      this._mapRecvLocalIdInfo = new Map(); // Whether a DataChannel m=application section has been created.

      this._hasDataChannelMediaSection = false; // Sending DataChannel id value counter. Incremented for each new DataChannel.

      this._nextSendSctpStreamId = 0; // Got transport local and remote parameters.

      this._transportReady = false;
    }
    /**
     * Creates a factory function.
     */


    static createFactory() {
      return () => new ReactNative();
    }

    get name() {
      return 'ReactNative';
    }

    close() {
      logger.debug('close()'); // Close RTCPeerConnection.

      if (this._pc) {
        try {
          this._pc.close();
        } catch (error) {}
      }
    }

    async getNativeRtpCapabilities() {
      logger.debug('getNativeRtpCapabilities()');
      const pc = new RTCPeerConnection({
        iceServers: [],
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        sdpSemantics: 'plan-b'
      });

      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });

        try {
          pc.close();
        } catch (error) {}

        const sdpObject = lib$3.parse(offer.sdp);
        const nativeRtpCapabilities = commonUtils.extractRtpCapabilities({
          sdpObject
        });
        return nativeRtpCapabilities;
      } catch (error) {
        try {
          pc.close();
        } catch (error2) {}

        throw error;
      }
    }

    async getNativeSctpCapabilities() {
      logger.debug('getNativeSctpCapabilities()');
      return {
        numStreams: SCTP_NUM_STREAMS
      };
    }

    run({
      direction,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers,
      iceTransportPolicy,
      additionalSettings,
      proprietaryConstraints,
      extendedRtpCapabilities
    }) {
      logger.debug('run()');
      this._direction = direction;
      this._remoteSdp = new RemoteSdp_1.RemoteSdp({
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
        planB: true
      });
      this._sendingRtpParametersByKind = {
        audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
      };
      this._sendingRemoteRtpParametersByKind = {
        audio: ortc.getSendingRemoteRtpParameters('audio', extendedRtpCapabilities),
        video: ortc.getSendingRemoteRtpParameters('video', extendedRtpCapabilities)
      };
      this._pc = new RTCPeerConnection({
        iceServers: iceServers || [],
        iceTransportPolicy: iceTransportPolicy || 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        sdpSemantics: 'plan-b',
        ...additionalSettings
      }, proprietaryConstraints); // Handle RTCPeerConnection connection status.

      this._pc.addEventListener('iceconnectionstatechange', () => {
        switch (this._pc.iceConnectionState) {
          case 'checking':
            this.emit('@connectionstatechange', 'connecting');
            break;

          case 'connected':
          case 'completed':
            this.emit('@connectionstatechange', 'connected');
            break;

          case 'failed':
            this.emit('@connectionstatechange', 'failed');
            break;

          case 'disconnected':
            this.emit('@connectionstatechange', 'disconnected');
            break;

          case 'closed':
            this.emit('@connectionstatechange', 'closed');
            break;
        }
      });
    }

    async updateIceServers(iceServers) {
      logger.debug('updateIceServers()');

      const configuration = this._pc.getConfiguration();

      configuration.iceServers = iceServers;

      this._pc.setConfiguration(configuration);
    }

    async restartIce(iceParameters) {
      logger.debug('restartIce()'); // Provide the remote SDP handler with new remote ICE parameters.

      this._remoteSdp.updateIceParameters(iceParameters);

      if (!this._transportReady) return;

      if (this._direction === 'send') {
        const offer = await this._pc.createOffer({
          iceRestart: true
        });
        logger.debug('restartIce() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);
        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
      } else {
        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('restartIce() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug('restartIce() | calling pc.setLocalDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
      }
    }

    async getTransportStats() {
      return this._pc.getStats();
    }

    async send({
      track,
      encodings,
      codecOptions,
      codec
    }) {
      this._assertSendDirection();

      logger.debug('send() [kind:%s, track.id:%s]', track.kind, track.id);

      if (codec) {
        logger.warn('send() | codec selection is not available in %s handler', this.name);
      }

      this._sendStream.addTrack(track);

      this._pc.addStream(this._sendStream);

      let offer = await this._pc.createOffer();
      let localSdpObject = lib$3.parse(offer.sdp);
      let offerMediaObject;
      const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind]);
      sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs);
      const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind]);
      sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs);
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'server',
        localSdpObject
      });

      if (track.kind === 'video' && encodings && encodings.length > 1) {
        logger.debug('send() | enabling simulcast');
        localSdpObject = lib$3.parse(offer.sdp);
        offerMediaObject = localSdpObject.media.find(m => m.type === 'video');
        planBUtils.addLegacySimulcast({
          offerMediaObject,
          track,
          numStreams: encodings.length
        });
        offer = {
          type: 'offer',
          sdp: lib$3.write(localSdpObject)
        };
      }

      logger.debug('send() | calling pc.setLocalDescription() [offer:%o]', offer);
      await this._pc.setLocalDescription(offer);
      localSdpObject = lib$3.parse(this._pc.localDescription.sdp);
      offerMediaObject = localSdpObject.media.find(m => m.type === track.kind); // Set RTCP CNAME.

      sendingRtpParameters.rtcp.cname = commonUtils.getCname({
        offerMediaObject
      }); // Set RTP encodings.

      sendingRtpParameters.encodings = planBUtils.getRtpEncodings({
        offerMediaObject,
        track
      }); // Complete encodings with given values.

      if (encodings) {
        for (let idx = 0; idx < sendingRtpParameters.encodings.length; ++idx) {
          if (encodings[idx]) Object.assign(sendingRtpParameters.encodings[idx], encodings[idx]);
        }
      } // If VP8 or H264 and there is effective simulcast, add scalabilityMode to
      // each encoding.


      if (sendingRtpParameters.encodings.length > 1 && (sendingRtpParameters.codecs[0].mimeType.toLowerCase() === 'video/vp8' || sendingRtpParameters.codecs[0].mimeType.toLowerCase() === 'video/h264')) {
        for (const encoding of sendingRtpParameters.encodings) {
          encoding.scalabilityMode = 'S1T3';
        }
      }

      this._remoteSdp.send({
        offerMediaObject,
        offerRtpParameters: sendingRtpParameters,
        answerRtpParameters: sendingRemoteRtpParameters,
        codecOptions
      });

      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('send() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer);
      const localId = String(this._nextSendLocalId);
      this._nextSendLocalId++; // Insert into the map.

      this._mapSendLocalIdTrack.set(localId, track);

      return {
        localId: localId,
        rtpParameters: sendingRtpParameters
      };
    }

    async stopSending(localId) {
      this._assertSendDirection();

      logger.debug('stopSending() [localId:%s]', localId);

      const track = this._mapSendLocalIdTrack.get(localId);

      if (!track) throw new Error('track not found');

      this._mapSendLocalIdTrack.delete(localId);

      this._sendStream.removeTrack(track);

      this._pc.addStream(this._sendStream);

      const offer = await this._pc.createOffer();
      logger.debug('stopSending() | calling pc.setLocalDescription() [offer:%o]', offer);

      try {
        await this._pc.setLocalDescription(offer);
      } catch (error) {
        // NOTE: If there are no sending tracks, setLocalDescription() will fail with
        // "Failed to create channels". If so, ignore it.
        if (this._sendStream.getTracks().length === 0) {
          logger.warn('stopSending() | ignoring expected error due no sending tracks: %s', error.toString());
          return;
        }

        throw error;
      }

      if (this._pc.signalingState === 'stable') return;
      const answer = {
        type: 'answer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopSending() | calling pc.setRemoteDescription() [answer:%o]', answer);
      await this._pc.setRemoteDescription(answer);
    }

    async replaceTrack( // eslint-disable-next-line @typescript-eslint/no-unused-vars
    localId, track) {
      throw new errors.UnsupportedError('not implemented');
    } // eslint-disable-next-line @typescript-eslint/no-unused-vars


    async setMaxSpatialLayer(localId, spatialLayer) {
      throw new errors.UnsupportedError('not implemented');
    } // eslint-disable-next-line @typescript-eslint/no-unused-vars


    async setRtpEncodingParameters(localId, params) {
      throw new errors.UnsupportedError('not implemented');
    } // eslint-disable-next-line @typescript-eslint/no-unused-vars


    async getSenderStats(localId) {
      throw new errors.UnsupportedError('not implemented');
    }

    async sendDataChannel({
      ordered,
      maxPacketLifeTime,
      maxRetransmits,
      label,
      protocol,
      priority
    }) {
      this._assertSendDirection();

      const options = {
        negotiated: true,
        id: this._nextSendSctpStreamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmitTime: maxPacketLifeTime,
        maxRetransmits,
        protocol,
        priority
      };
      logger.debug('sendDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // Increase next id.


      this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS; // If this is the first DataChannel we need to create the SDP answer with
      // m=application section.

      if (!this._hasDataChannelMediaSection) {
        const offer = await this._pc.createOffer();
        const localSdpObject = lib$3.parse(offer.sdp);
        const offerMediaObject = localSdpObject.media.find(m => m.type === 'application');
        if (!this._transportReady) await this._setupTransport({
          localDtlsRole: 'server',
          localSdpObject
        });
        logger.debug('sendDataChannel() | calling pc.setLocalDescription() [offer:%o]', offer);
        await this._pc.setLocalDescription(offer);

        this._remoteSdp.sendSctpAssociation({
          offerMediaObject
        });

        const answer = {
          type: 'answer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setRemoteDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      const sctpStreamParameters = {
        streamId: options.id,
        ordered: options.ordered,
        maxPacketLifeTime: options.maxPacketLifeTime,
        maxRetransmits: options.maxRetransmits
      };
      return {
        dataChannel,
        sctpStreamParameters
      };
    }

    async receive({
      trackId,
      kind,
      rtpParameters
    }) {
      this._assertRecvDirection();

      logger.debug('receive() [trackId:%s, kind:%s]', trackId, kind);
      const localId = trackId;
      const mid = kind;
      let streamId = rtpParameters.rtcp.cname; // NOTE: In React-Native we cannot reuse the same remote MediaStream for new
      // remote tracks. This is because react-native-webrtc does not react on new
      // tracks generated within already existing streams, so force the streamId
      // to be different.

      logger.debug('receive() | forcing a random remote streamId to avoid well known bug in react-native-webrtc');
      streamId += `-hack-${utils.generateRandomNumber()}`;

      this._remoteSdp.receive({
        mid,
        kind,
        offerRtpParameters: rtpParameters,
        streamId,
        trackId
      });

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('receive() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      let answer = await this._pc.createAnswer();
      const localSdpObject = lib$3.parse(answer.sdp);
      const answerMediaObject = localSdpObject.media.find(m => String(m.mid) === mid); // May need to modify codec parameters in the answer based on codec
      // parameters in the offer.

      commonUtils.applyCodecParameters({
        offerRtpParameters: rtpParameters,
        answerMediaObject
      });
      answer = {
        type: 'answer',
        sdp: lib$3.write(localSdpObject)
      };
      if (!this._transportReady) await this._setupTransport({
        localDtlsRole: 'client',
        localSdpObject
      });
      logger.debug('receive() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);

      const stream = this._pc.getRemoteStreams().find(s => s.id === streamId);

      const track = stream.getTrackById(localId);
      if (!track) throw new Error('remote track not found'); // Insert into the map.

      this._mapRecvLocalIdInfo.set(localId, {
        mid,
        rtpParameters
      });

      return {
        localId,
        track
      };
    }

    async stopReceiving(localId) {
      this._assertRecvDirection();

      logger.debug('stopReceiving() [localId:%s]', localId);
      const {
        mid,
        rtpParameters
      } = this._mapRecvLocalIdInfo.get(localId) || {}; // Remove from the map.

      this._mapRecvLocalIdInfo.delete(localId);

      this._remoteSdp.planBStopReceiving({
        mid: mid,
        offerRtpParameters: rtpParameters
      });

      const offer = {
        type: 'offer',
        sdp: this._remoteSdp.getSdp()
      };
      logger.debug('stopReceiving() | calling pc.setRemoteDescription() [offer:%o]', offer);
      await this._pc.setRemoteDescription(offer);
      const answer = await this._pc.createAnswer();
      logger.debug('stopReceiving() | calling pc.setLocalDescription() [answer:%o]', answer);
      await this._pc.setLocalDescription(answer);
    } // eslint-disable-next-line @typescript-eslint/no-unused-vars


    async getReceiverStats(localId) {
      throw new errors.UnsupportedError('not implemented');
    }

    async receiveDataChannel({
      sctpStreamParameters,
      label,
      protocol
    }) {
      this._assertRecvDirection();

      const {
        streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmits
      } = sctpStreamParameters;
      const options = {
        negotiated: true,
        id: streamId,
        ordered,
        maxPacketLifeTime,
        maxRetransmitTime: maxPacketLifeTime,
        maxRetransmits,
        protocol
      };
      logger.debug('receiveDataChannel() [options:%o]', options);

      const dataChannel = this._pc.createDataChannel(label, options); // If this is the first DataChannel we need to create the SDP offer with
      // m=application section.


      if (!this._hasDataChannelMediaSection) {
        this._remoteSdp.receiveSctpAssociation({
          oldDataChannelSpec: true
        });

        const offer = {
          type: 'offer',
          sdp: this._remoteSdp.getSdp()
        };
        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]', offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();

        if (!this._transportReady) {
          const localSdpObject = lib$3.parse(answer.sdp);
          await this._setupTransport({
            localDtlsRole: 'client',
            localSdpObject
          });
        }

        logger.debug('receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]', answer);
        await this._pc.setLocalDescription(answer);
        this._hasDataChannelMediaSection = true;
      }

      return {
        dataChannel
      };
    }

    async _setupTransport({
      localDtlsRole,
      localSdpObject
    }) {
      if (!localSdpObject) localSdpObject = lib$3.parse(this._pc.localDescription.sdp); // Get our local DTLS parameters.

      const dtlsParameters = commonUtils.extractDtlsParameters({
        sdpObject: localSdpObject
      }); // Set our DTLS role.

      dtlsParameters.role = localDtlsRole; // Update the remote DTLS role in the SDP.

      this._remoteSdp.updateDtlsRole(localDtlsRole === 'client' ? 'server' : 'client'); // Need to tell the remote transport about our parameters.


      await this.safeEmitAsPromise('@connect', {
        dtlsParameters
      });
      this._transportReady = true;
    }

    _assertSendDirection() {
      if (this._direction !== 'send') {
        throw new Error('method can just be called for handlers with "send" direction');
      }
    }

    _assertRecvDirection() {
      if (this._direction !== 'recv') {
        throw new Error('method can just be called for handlers with "recv" direction');
      }
    }

  }

  exports.ReactNative = ReactNative;
});

var Device_1 = createCommonjsModule(function (module, exports) {
  /* global RTCRtpTransceiver */

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const logger = new Logger_1.Logger('Device');

  function detectDevice() {
    // React-Native.
    // NOTE: react-native-webrtc >= 1.75.0 is required.
    if (typeof navigator === 'object' && navigator.product === 'ReactNative') {
      if (typeof RTCPeerConnection === 'undefined') {
        logger.warn('this._detectDevice() | unsupported ReactNative without RTCPeerConnection');
        return undefined;
      }

      logger.debug('this._detectDevice() | ReactNative handler chosen');
      return 'ReactNative';
    } // Browser.
    else if (typeof navigator === 'object' && typeof navigator.userAgent === 'string') {
        const ua = navigator.userAgent;
        const browser = es5.getParser(ua);
        const engine = browser.getEngine(); // Chrome and Chromium.

        if (browser.satisfies({
          chrome: '>=74',
          chromium: '>=74'
        })) {
          return 'Chrome74';
        } else if (browser.satisfies({
          chrome: '>=70',
          chromium: '>=70'
        })) {
          return 'Chrome70';
        } else if (browser.satisfies({
          chrome: '>=67',
          chromium: '>=67'
        })) {
          return 'Chrome67';
        } else if (browser.satisfies({
          chrome: '>=55',
          chromium: '>=55'
        })) {
          return 'Chrome55';
        } // Firefox.
        else if (browser.satisfies({
            firefox: '>=60'
          })) {
            return 'Firefox60';
          } // Safari with Unified-Plan support enabled.
          else if (browser.satisfies({
              safari: '>=12.0'
            }) && typeof RTCRtpTransceiver !== 'undefined' && RTCRtpTransceiver.prototype.hasOwnProperty('currentDirection')) {
              return 'Safari12';
            } // Safari with Plab-B support.
            else if (browser.satisfies({
                safari: '>=11'
              })) {
                return 'Safari11';
              } // Old Edge with ORTC support.
              else if (browser.satisfies({
                  'microsoft edge': '>=11'
                }) && browser.satisfies({
                  'microsoft edge': '<=18'
                })) {
                  return 'Edge11';
                } // Best effort for Chromium based browsers.
                else if (engine.name && engine.name.toLowerCase() === 'blink') {
                    const match = ua.match(/(?:(?:Chrome|Chromium))[ /](\w+)/i);

                    if (match) {
                      const version = Number(match[1]);

                      if (version >= 74) {
                        return 'Chrome74';
                      } else if (version >= 70) {
                        return 'Chrome70';
                      } else if (version >= 67) {
                        return 'Chrome67';
                      } else {
                        return 'Chrome55';
                      }
                    } else {
                      return 'Chrome74';
                    }
                  } // Unsupported browser.
                  else {
                      logger.warn('this._detectDevice() | browser not supported [name:%s, version:%s]', browser.getBrowserName(), browser.getBrowserVersion());
                      return undefined;
                    }
      } // Unknown device.
      else {
          logger.warn('this._detectDevice() | unknown device');
          return undefined;
        }
  }

  exports.detectDevice = detectDevice;

  class Device {
    /**
     * Create a new Device to connect to mediasoup server.
     *
     * @throws {UnsupportedError} if device is not supported.
     */
    constructor({
      handlerName,
      handlerFactory,
      Handler
    } = {}) {
      // Loaded flag.
      this._loaded = false;
      logger.debug('constructor()'); // Handle deprecated option.

      if (Handler) {
        logger.warn('constructor() | Handler option is DEPRECATED, use handlerName or handlerFactory instead');
        if (typeof Handler === 'string') handlerName = Handler;else throw new TypeError('non string Handler option no longer supported, use handlerFactory instead');
      }

      if (handlerName && handlerFactory) {
        throw new TypeError('just one of handlerName or handlerInterface can be given');
      }

      if (handlerFactory) {
        this._handlerFactory = handlerFactory;
      } else {
        if (handlerName) {
          logger.debug('constructor() | handler given: %s', handlerName);
        } else {
          handlerName = detectDevice();
          if (handlerName) logger.debug('constructor() | detected handler: %s', handlerName);else throw new errors.UnsupportedError('device not supported');
        }

        switch (handlerName) {
          case 'Chrome74':
            this._handlerFactory = Chrome74_1.Chrome74.createFactory();
            break;

          case 'Chrome70':
            this._handlerFactory = Chrome70_1.Chrome70.createFactory();
            break;

          case 'Chrome67':
            this._handlerFactory = Chrome67_1.Chrome67.createFactory();
            break;

          case 'Chrome55':
            this._handlerFactory = Chrome55_1.Chrome55.createFactory();
            break;

          case 'Firefox60':
            this._handlerFactory = Firefox60_1.Firefox60.createFactory();
            break;

          case 'Safari12':
            this._handlerFactory = Safari12_1.Safari12.createFactory();
            break;

          case 'Safari11':
            this._handlerFactory = Safari11_1.Safari11.createFactory();
            break;

          case 'Edge11':
            this._handlerFactory = Edge11_1.Edge11.createFactory();
            break;

          case 'ReactNative':
            this._handlerFactory = ReactNative_1.ReactNative.createFactory();
            break;

          default:
            throw new TypeError(`unknown handlerName "${handlerName}"`);
        }
      } // Create a temporal handler to get its name.


      const handler = this._handlerFactory();

      this._handlerName = handler.name;
      handler.close();
      this._extendedRtpCapabilities = undefined;
      this._recvRtpCapabilities = undefined;
      this._canProduceByKind = {
        audio: false,
        video: false
      };
      this._sctpCapabilities = undefined;
    }
    /**
     * The RTC handler name.
     */


    get handlerName() {
      return this._handlerName;
    }
    /**
     * Whether the Device is loaded.
     */


    get loaded() {
      return this._loaded;
    }
    /**
     * RTP capabilities of the Device for receiving media.
     *
     * @throws {InvalidStateError} if not loaded.
     */


    get rtpCapabilities() {
      if (!this._loaded) throw new errors.InvalidStateError('not loaded');
      return this._recvRtpCapabilities;
    }
    /**
     * SCTP capabilities of the Device.
     *
     * @throws {InvalidStateError} if not loaded.
     */


    get sctpCapabilities() {
      if (!this._loaded) throw new errors.InvalidStateError('not loaded');
      return this._sctpCapabilities;
    }
    /**
     * Initialize the Device.
     */


    async load({
      routerRtpCapabilities
    }) {
      logger.debug('load() [routerRtpCapabilities:%o]', routerRtpCapabilities); // Temporal handler to get its capabilities.

      let handler;

      try {
        if (this._loaded) throw new errors.InvalidStateError('already loaded'); // This may throw.

        ortc.validateRtpCapabilities(routerRtpCapabilities);
        handler = this._handlerFactory();
        const nativeRtpCapabilities = await handler.getNativeRtpCapabilities();
        logger.debug('load() | got native RTP capabilities:%o', nativeRtpCapabilities); // This may throw.

        ortc.validateRtpCapabilities(nativeRtpCapabilities); // Get extended RTP capabilities.

        this._extendedRtpCapabilities = ortc.getExtendedRtpCapabilities(nativeRtpCapabilities, routerRtpCapabilities);
        logger.debug('load() | got extended RTP capabilities:%o', this._extendedRtpCapabilities); // Check whether we can produce audio/video.

        this._canProduceByKind.audio = ortc.canSend('audio', this._extendedRtpCapabilities);
        this._canProduceByKind.video = ortc.canSend('video', this._extendedRtpCapabilities); // Generate our receiving RTP capabilities for receiving media.

        this._recvRtpCapabilities = ortc.getRecvRtpCapabilities(this._extendedRtpCapabilities); // This may throw.

        ortc.validateRtpCapabilities(this._recvRtpCapabilities);
        logger.debug('load() | got receiving RTP capabilities:%o', this._recvRtpCapabilities); // Generate our SCTP capabilities.

        this._sctpCapabilities = await handler.getNativeSctpCapabilities();
        logger.debug('load() | got native SCTP capabilities:%o', this._sctpCapabilities); // This may throw.

        ortc.validateSctpCapabilities(this._sctpCapabilities);
        logger.debug('load() succeeded');
        this._loaded = true;
        handler.close();
      } catch (error) {
        if (handler) handler.close();
        throw error;
      }
    }
    /**
     * Whether we can produce audio/video.
     *
     * @throws {InvalidStateError} if not loaded.
     * @throws {TypeError} if wrong arguments.
     */


    canProduce(kind) {
      if (!this._loaded) throw new errors.InvalidStateError('not loaded');else if (kind !== 'audio' && kind !== 'video') throw new TypeError(`invalid kind "${kind}"`);
      return this._canProduceByKind[kind];
    }
    /**
     * Creates a Transport for sending media.
     *
     * @throws {InvalidStateError} if not loaded.
     * @throws {TypeError} if wrong arguments.
     */


    createSendTransport({
      id,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers,
      iceTransportPolicy,
      additionalSettings,
      proprietaryConstraints,
      appData = {}
    }) {
      logger.debug('createSendTransport()');
      return this._createTransport({
        direction: 'send',
        id: id,
        iceParameters: iceParameters,
        iceCandidates: iceCandidates,
        dtlsParameters: dtlsParameters,
        sctpParameters: sctpParameters,
        iceServers: iceServers,
        iceTransportPolicy: iceTransportPolicy,
        additionalSettings: additionalSettings,
        proprietaryConstraints: proprietaryConstraints,
        appData: appData
      });
    }
    /**
     * Creates a Transport for receiving media.
     *
     * @throws {InvalidStateError} if not loaded.
     * @throws {TypeError} if wrong arguments.
     */


    createRecvTransport({
      id,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers,
      iceTransportPolicy,
      additionalSettings,
      proprietaryConstraints,
      appData = {}
    }) {
      logger.debug('createRecvTransport()');
      return this._createTransport({
        direction: 'recv',
        id: id,
        iceParameters: iceParameters,
        iceCandidates: iceCandidates,
        dtlsParameters: dtlsParameters,
        sctpParameters: sctpParameters,
        iceServers: iceServers,
        iceTransportPolicy: iceTransportPolicy,
        additionalSettings: additionalSettings,
        proprietaryConstraints: proprietaryConstraints,
        appData: appData
      });
    }

    _createTransport({
      direction,
      id,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers,
      iceTransportPolicy,
      additionalSettings,
      proprietaryConstraints,
      appData = {}
    }) {
      if (!this._loaded) throw new errors.InvalidStateError('not loaded');else if (typeof id !== 'string') throw new TypeError('missing id');else if (typeof iceParameters !== 'object') throw new TypeError('missing iceParameters');else if (!Array.isArray(iceCandidates)) throw new TypeError('missing iceCandidates');else if (typeof dtlsParameters !== 'object') throw new TypeError('missing dtlsParameters');else if (sctpParameters && typeof sctpParameters !== 'object') throw new TypeError('wrong sctpParameters');else if (appData && typeof appData !== 'object') throw new TypeError('if given, appData must be an object'); // Create a new Transport.

      const transport = new Transport_1.Transport({
        direction,
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
        iceServers,
        iceTransportPolicy,
        additionalSettings,
        proprietaryConstraints,
        appData,
        handlerFactory: this._handlerFactory,
        extendedRtpCapabilities: this._extendedRtpCapabilities,
        canProduceByKind: this._canProduceByKind
      });
      return transport;
    }

  }

  exports.Device = Device;
});

var types = createCommonjsModule(function (module, exports) {

  function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
  }

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  __export(Device_1);

  __export(Transport_1);

  __export(Producer_1);

  __export(Consumer_1);

  __export(DataProducer_1);

  __export(DataConsumer_1);

  __export(HandlerInterface_1);

  __export(errors);
});

var lib$4 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Device = Device_1.Device;
  exports.detectDevice = Device_1.detectDevice;
  exports.types = types;
  /**
   * Expose mediasoup-client version.
   */

  exports.version = '3.6.12';
  /**
   * Expose parseScalabilityMode() function.
   */

  exports.parseScalabilityMode = scalabilityModes.parse;
});

function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(r => setTimeout(() => r(), ms));
    });
}

var SocketWebRTCMessageTypes;
(function (SocketWebRTCMessageTypes) {
    SocketWebRTCMessageTypes["Heartbeat"] = "h";
    SocketWebRTCMessageTypes["Connect"] = "connect";
    SocketWebRTCMessageTypes["Disconnect"] = "disconnect";
    SocketWebRTCMessageTypes["ConnectionError"] = "connect_error";
    SocketWebRTCMessageTypes["ConnectTimeout"] = "connect_timeout";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["ClientConnected"] = 0] = "ClientConnected";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["ClientDisconnected"] = 1] = "ClientDisconnected";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["Initialization"] = 3] = "Initialization";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["Synchronization"] = 5] = "Synchronization";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["JoinWorld"] = 7] = "JoinWorld";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["LeaveWorld"] = 8] = "LeaveWorld";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["WebRTCTransportCreate"] = 9] = "WebRTCTransportCreate";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["WebRTCTransportConnect"] = 10] = "WebRTCTransportConnect";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["WebRTCTransportClose"] = 11] = "WebRTCTransportClose";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["WebRTCSendTrack"] = 12] = "WebRTCSendTrack";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["WebRTCReceiveTrack"] = 13] = "WebRTCReceiveTrack";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["WebRTCPauseConsumer"] = 14] = "WebRTCPauseConsumer";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["WebRTCResumeConsumer"] = 15] = "WebRTCResumeConsumer";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["WebRTCCloseConsumer"] = 16] = "WebRTCCloseConsumer";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["WebRTCPauseProducer"] = 17] = "WebRTCPauseProducer";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["WebRTCResumeProducer"] = 18] = "WebRTCResumeProducer";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["WebRTCCloseProducer"] = 19] = "WebRTCCloseProducer";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["WebRTCMuteOtherProducer"] = 20] = "WebRTCMuteOtherProducer";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["WebRTCUnmuteOtherProducer"] = 21] = "WebRTCUnmuteOtherProducer";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["WebRTCConsumerSetLayers"] = 22] = "WebRTCConsumerSetLayers";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["ReliableMessage"] = 23] = "ReliableMessage";
    SocketWebRTCMessageTypes[SocketWebRTCMessageTypes["UnreliableMessage"] = 24] = "UnreliableMessage";
})(SocketWebRTCMessageTypes || (SocketWebRTCMessageTypes = {}));
var SocketWebRTCMessageTypes$1 = SocketWebRTCMessageTypes;

const Device = lib$4.Device;
class SocketWebRTCClientTransport {
    constructor() {
        this.supportsMediaStreams = true;
        this.lastPollSyncData = {};
        this.heartbeatInterval = 2000;
        this.pollingTickRate = 1000;
        this.socket = {};
    }
    sendAllReliableMessages() {
        while (!MessageQueue.instance.outgoingReliableQueue.empty) {
            this.socket.emit(SocketWebRTCMessageTypes$1.ReliableMessage.toString(), MessageQueue.instance.outgoingReliableQueue.pop);
        }
    }
    // Adds support for Promise to socket.io-client
    promisedRequest(socket) {
        return function request(type, data = {}) {
            return new Promise(resolve => {
                socket.emit(type, data, resolve);
                console.log("Emitting data: ");
                console.log(data);
            });
        };
    }
    initialize(address = "https://127.0.0.1", port = 3001) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Initializing client transport");
            this.mediasoupDevice = new Device();
            this.socket = lib$1(`${address}:${port}`);
            this.request = this.promisedRequest(this.socket);
            console.log(this.socket);
            //@ts-ignore
            // window.screenshare = await this.startScreenshare
            // only join  after we user has interacted with DOM (to ensure that media elements play)
            if (MediaStreamComponent.instance.initialized)
                return;
            MediaStreamComponent.instance.initialized = true;
            console.log(`Initializing socket.io...,`);
            this.socket.on("connect", () => __awaiter(this, void 0, void 0, function* () {
                console.log("Connected!");
                setInterval(() => {
                    console.log("Heartbeat");
                    this.socket.emit(SocketWebRTCMessageTypes$1.Heartbeat);
                }, this.heartbeatInterval);
                // use sendBeacon to tell the server we're disconnecting when
                // the page unloads
                window.addEventListener("unload", () => __awaiter(this, void 0, void 0, function* () {
                    this.socket.emit(SocketWebRTCMessageTypes$1.LeaveWorld.toString());
                }));
                this.socket.on(SocketWebRTCMessageTypes$1.Initialization.toString(), (_id, _ids) => __awaiter(this, void 0, void 0, function* () {
                    console.log("Initiaslization response");
                    NetworkSystem.instance.initializeClient(_id, _ids);
                    yield this.joinWorld();
                    console.log("About to send camera streams");
                    yield this.sendCameraStreams();
                    console.log("about to init sockets");
                }));
                this.socket.on(SocketWebRTCMessageTypes$1.ClientConnected.toString(), (_id) => NetworkSystem.instance.addClient(_id));
                this.socket.on(SocketWebRTCMessageTypes$1.ClientDisconnected.toString(), (_id) => NetworkSystem.instance.removeClient(_id));
                this.socket.on(SocketWebRTCMessageTypes$1.ReliableMessage.toString(), (message) => {
                    MessageQueue.instance.incomingReliableQueue.add(message);
                });
                this.socket.emit(SocketWebRTCMessageTypes$1.Initialization.toString());
            }));
        });
    }
    //= =//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
    // Mediasoup Code:
    //= =//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
    // meeting control actions
    joinWorld() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.joined)
                return;
            this.joined = true;
            console.log("Joining world");
            // signal that we're a new peer and initialize our
            // mediasoup-client device, if this is our first time connecting
            const resp = yield this.request(SocketWebRTCMessageTypes$1.JoinWorld.toString());
            console.log("Awaiting response to join world");
            const { routerRtpCapabilities } = resp;
            console.log("Loading mediasoup");
            if (!this.mediasoupDevice.loaded)
                yield this.mediasoupDevice.load({ routerRtpCapabilities });
            console.log("Polling");
            this.pollAndUpdate(); // start this polling loop
            console.log("Joined world");
        });
    }
    sendCameraStreams() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("send camera streams");
            // create a transport for outgoing media, if we don't already have one
            if (!this.sendTransport)
                this.sendTransport = yield this.createTransport("send");
            if (!MediaStreamComponent.instance.mediaStream)
                return;
            // start sending video. the transport logic will initiate a
            // signaling conversation with the server to set up an outbound rtp
            // stream for the camera video track. our createTransport() function
            // includes logic to tell the server to start the stream in a paused
            // state, if the checkbox in our UI is unchecked. so as soon as we
            // have a client-side camVideoProducer object, we need to set it to
            // paused as appropriate, too.
            MediaStreamComponent.instance.camVideoProducer = yield this.sendTransport.produce({
                track: MediaStreamComponent.instance.mediaStream.getVideoTracks()[0],
                encodings: CAM_VIDEO_SIMULCAST_ENCODINGS,
                appData: { mediaTag: "cam-video" }
            });
            if (MediaStreamComponent.instance.videoPaused)
                yield MediaStreamComponent.instance.camVideoProducer.pause();
            // same thing for audio, but we can use our already-created
            MediaStreamComponent.instance.camAudioProducer = yield this.sendTransport.produce({
                track: MediaStreamComponent.instance.mediaStream.getAudioTracks()[0],
                appData: { mediaTag: "cam-audio" }
            });
            if (MediaStreamComponent.instance.audioPaused)
                MediaStreamComponent.instance.camAudioProducer.pause();
        });
    }
    startScreenshare() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("start screen share");
            // make sure we've joined the  and that we have a sending
            // transport
            yield this.joinWorld();
            if (!this.sendTransport)
                this.sendTransport = yield this.createTransport("send");
            // get a screen share track
            // @ts-ignore
            this.localScreen = yield navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });
            // create a producer for video
            MediaStreamComponent.instance.screenVideoProducer = yield this.sendTransport.produce({
                track: MediaStreamComponent.instance.localScreen.getVideoTracks()[0],
                encodings: {},
                appData: { mediaTag: "screen-video" }
            });
            // create a producer for audio, if we have it
            if (MediaStreamComponent.instance.localScreen.getAudioTracks().length) {
                MediaStreamComponent.instance.screenAudioProducer = yield this.sendTransport.produce({
                    track: MediaStreamComponent.instance.localScreen.getAudioTracks()[0],
                    appData: { mediaTag: "screen-audio" }
                });
            }
            // handler for screen share stopped event (triggered by the
            // browser's built-in screen sharing ui)
            MediaStreamComponent.instance.screenVideoProducer.track.onended = () => __awaiter(this, void 0, void 0, function* () {
                console.log("screen share stopped");
                yield MediaStreamComponent.instance.screenVideoProducer.pause();
                const { error } = yield this.request(SocketWebRTCMessageTypes$1.WebRTCCloseProducer.toString(), {
                    producerId: MediaStreamComponent.instance.screenVideoProducer.id
                });
                yield MediaStreamComponent.instance.screenVideoProducer.close();
                MediaStreamComponent.instance.screenVideoProducer = null;
                if (error) {
                    console.error(error);
                }
                if (MediaStreamComponent.instance.screenAudioProducer) {
                    const { error: screenAudioProducerError } = yield this.request(SocketWebRTCMessageTypes$1.WebRTCCloseProducer.toString(), {
                        producerId: MediaStreamComponent.instance.screenAudioProducer.id
                    });
                    yield MediaStreamComponent.instance.screenAudioProducer.close();
                    MediaStreamComponent.instance.screenAudioProducer = null;
                    if (screenAudioProducerError) {
                        console.error(screenAudioProducerError);
                    }
                }
            });
            return true;
        });
    }
    stopSendingMediaStreams() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(MediaStreamComponent.instance.mediaStream && MediaStreamComponent.instance.localScreen))
                return false;
            if (!this.sendTransport)
                return false;
            console.log("stop sending media streams");
            const { error } = yield this.request(SocketWebRTCMessageTypes$1.WebRTCTransportClose.toString(), {
                transportId: this.sendTransport.id
            });
            if (error)
                console.error(error);
            // closing the sendTransport closes all associated producers. when
            // the camVideoProducer and camAudioProducer are closed,
            // mediasoup-client stops the local cam tracks, so we don't need to
            // do anything except set all our local variables to null.
            yield this.sendTransport.close();
            this.sendTransport = null;
            MediaStreamComponent.instance.camVideoProducer = null;
            MediaStreamComponent.instance.camAudioProducer = null;
            MediaStreamComponent.instance.screenVideoProducer = null;
            MediaStreamComponent.instance.screenAudioProducer = null;
            MediaStreamComponent.instance.mediaStream = null;
            MediaStreamComponent.instance.localScreen = null;
            return true;
        });
    }
    leave() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.joined)
                return false;
            console.log("leave ");
            // stop polling
            clearInterval(this.pollingInterval);
            // close everything on the server-side (transports, producers, consumers)
            const { error } = yield this.request(SocketWebRTCMessageTypes$1.LeaveWorld.toString());
            if (error) {
                console.error(error);
            }
            // closing the transports closes all producers and consumers. we
            // don't need to do anything beyond closing the transports, except
            // to set all our local variables to their initial states
            if (this.recvTransport)
                yield this.recvTransport.close();
            if (this.sendTransport)
                yield this.sendTransport.close();
            this.recvTransport = null;
            this.sendTransport = null;
            MediaStreamComponent.instance.camVideoProducer = null;
            MediaStreamComponent.instance.camAudioProducer = null;
            MediaStreamComponent.instance.screenVideoProducer = null;
            MediaStreamComponent.instance.screenAudioProducer = null;
            MediaStreamComponent.instance.mediaStream = null;
            MediaStreamComponent.instance.localScreen = null;
            this.lastPollSyncData = {};
            MediaStreamComponent.instance.consumers = [];
            this.joined = false;
            return true;
        });
    }
    subscribeToTrack(peerId, mediaTag) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("subscribe to track", peerId, mediaTag);
            // create a receive transport if we don't already have one
            if (!this.recvTransport)
                this.recvTransport = yield this.createTransport("recv");
            // if we do already have a consumer, we shouldn't have called this
            // method
            let consumer = MediaStreamComponent.instance.consumers.find(c => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag);
            if (consumer)
                return console.error("already have consumer for track", peerId, mediaTag);
            // ask the server to create a server-side consumer object and send
            // us back the info we need to create a client-side consumer
            const consumerParameters = yield this.request(SocketWebRTCMessageTypes$1.WebRTCReceiveTrack.toString(), {
                mediaTag,
                mediaPeerId: peerId,
                rtpCapabilities: this.mediasoupDevice.rtpCapabilities
            });
            consumer = yield this.recvTransport.consume(Object.assign(Object.assign({}, consumerParameters), { appData: { peerId, mediaTag } }));
            // the server-side consumer will be started in paused state. wait
            // until we're connected, then send a resume request to the server
            // to get our first keyframe and start displaying video
            while (this.recvTransport.connectionState !== "connected")
                yield sleep(100);
            // okay, we're ready. let's ask the peer to send us media
            yield this.resumeConsumer(consumer);
            // keep track of all our consumers
            MediaStreamComponent.instance.consumers.push(consumer);
            // ui
            yield MediaStreamControlSystem.instance.addVideoAudio(consumer, peerId);
        });
    }
    unsubscribeFromTrack(peerId, mediaTag) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("unsubscribe from track", peerId, mediaTag);
            const consumer = MediaStreamComponent.instance.consumers.find(c => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag);
            if (!consumer)
                return;
            yield this.closeConsumer(consumer);
        });
    }
    pauseConsumer(consumer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!consumer)
                return;
            console.log("pause consumer", consumer.appData.peerId, consumer.appData.mediaTag);
            yield this.request(SocketWebRTCMessageTypes$1.WebRTCPauseConsumer.toString(), { consumerId: consumer.id });
            yield consumer.pause();
        });
    }
    resumeConsumer(consumer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!consumer)
                return;
            console.log("resume consumer", consumer.appData.peerId, consumer.appData.mediaTag);
            yield this.request(SocketWebRTCMessageTypes$1.WebRTCResumeConsumer.toString(), { consumerId: consumer.id });
            yield consumer.resume();
        });
    }
    pauseProducer(producer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!producer)
                return;
            console.log("pause producer", producer.appData.mediaTag);
            yield this.request(SocketWebRTCMessageTypes$1.WebRTCPauseProducer.toString(), { producerId: producer.id });
            yield producer.pause();
        });
    }
    resumeProducer(producer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!producer)
                return;
            console.log("resume producer", producer.appData.mediaTag);
            yield this.request(SocketWebRTCMessageTypes$1.WebRTCResumeProducer.toString(), { producerId: producer.id });
            yield producer.resume();
        });
    }
    closeConsumer(consumer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!consumer)
                return;
            console.log("closing consumer", consumer.appData.peerId, consumer.appData.mediaTag);
            // tell the server we're closing this consumer. (the server-side
            // consumer may have been closed already, but that's okay.)
            yield this.request(SocketWebRTCMessageTypes$1.WebRTCTransportClose.toString(), { consumerId: consumer.id });
            yield consumer.close();
            MediaStreamComponent.instance.consumers = MediaStreamComponent.instance.consumers.filter(c => c !== consumer);
            MediaStreamControlSystem.instance.removeVideoAudio(consumer);
        });
    }
    // utility function to create a transport and hook up signaling logic
    // appropriate to the transport's direction
    createTransport(direction) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`create ${direction} transport`);
            // ask the server to create a server-side transport object and send
            // us back the info we need to create a client-side transport
            let transport;
            const { transportOptions } = yield this.request(SocketWebRTCMessageTypes$1.WebRTCTransportCreate.toString(), { direction });
            console.log("transport options", transportOptions);
            if (direction === "recv") {
                transport = yield this.mediasoupDevice.createRecvTransport(transportOptions);
            }
            else if (direction === "send") {
                console.log("transport options:");
                console.log(transportOptions);
                transport = yield this.mediasoupDevice.createSendTransport(transportOptions);
            }
            else {
                throw new Error(`bad transport 'direction': ${direction}`);
            }
            // mediasoup-client will emit a connect event when media needs to
            // start flowing for the first time. send dtlsParameters to the
            // server, then call callback() on success or errback() on failure.
            transport.on("connect", ({ dtlsParameters }, callback, errback) => __awaiter(this, void 0, void 0, function* () {
                console.log("transport connect event", direction);
                const { error } = yield this.request(SocketWebRTCMessageTypes$1.WebRTCTransportConnect.toString(), {
                    transportId: transportOptions.id,
                    dtlsParameters
                });
                if (error) {
                    console.error("error connecting transport", direction, error);
                    errback();
                    return;
                }
                callback();
            }));
            if (direction === "send") {
                // sending transports will emit a produce event when a new track
                // needs to be set up to start sending. the producer's appData is
                // passed as a parameter
                transport.on("produce", ({ kind, rtpParameters, appData }, callback, errback) => __awaiter(this, void 0, void 0, function* () {
                    console.log("transport produce event", appData.mediaTag);
                    // we may want to start out paused (if the checkboxes in the ui
                    // aren't checked, for each media type. not very clean code, here
                    // but, you know, this isn't a real application.)
                    let paused = false;
                    if (appData.mediaTag === "cam-video")
                        paused = MediaStreamComponent.instance.videoPaused;
                    else if (appData.mediaTag === "cam-audio")
                        paused = MediaStreamComponent.instance.audioPaused;
                    // tell the server what it needs to know from us in order to set
                    // up a server-side producer object, and get back a
                    // producer.id. call callback() on success or errback() on
                    // failure.
                    const { error, id } = yield this.request(SocketWebRTCMessageTypes$1.WebRTCSendTrack.toString(), {
                        transportId: transportOptions.id,
                        kind,
                        rtpParameters,
                        paused,
                        appData
                    });
                    if (error) {
                        console.error("error setting up server-side producer", error);
                        errback();
                        return;
                    }
                    callback({ id });
                }));
            }
            // any time a transport transitions to closed,
            // failed, or disconnected, leave the  and reset
            transport.on("connectionstatechange", (state) => __awaiter(this, void 0, void 0, function* () {
                console.log(`transport ${transport.id} connectionstatechange ${state}`);
                // for this simple sample code, assume that transports being
                // closed is an error (we never close these transports except when
                // we leave the )
                if (state === "closed" || state === "failed" || state === "disconnected") {
                    console.log("transport closed ... leaving the  and resetting");
                    alert("Your connection failed.  Please restart the page");
                }
            }));
            return transport;
        });
    }
    // polling/update logic
    pollAndUpdate() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Polling server for current peers array!");
            setTimeout(this.pollAndUpdate, this.pollingTickRate);
            console.log("sending sync request");
            if (this.request === undefined)
                return;
            const { peers } = yield this.request(SocketWebRTCMessageTypes$1.Synchronization.toString());
            const localConnectionId = NetworkSystem.instance.getLocalConnectionId();
            if (peers[localConnectionId] === undefined)
                console.log("Server doesn't think you're connected!");
            // decide if we need to update tracks list and video/audio
            // elements. build list of peers, sorted by join time, removing last
            // seen time and stats, so we can easily do a deep-equals
            // comparison. compare this list with the cached list from last
            // poll.
            // auto-subscribe to their feeds:
            const closestPeers = NetworkSystem.instance.getClosestPeers();
            for (const id in peers) {
                // for each peer...
                if (id !== localConnectionId) {
                    // if it isnt me...
                    if (closestPeers !== undefined && closestPeers.includes(id)) {
                        // and if it is close enough in the 3d space...
                        for (const [mediaTag, _] of Object.entries(peers[id].media)) {
                            // for each of the peer's producers...
                            console.log(id + " | " + mediaTag);
                            if (((_a = MediaStreamComponent.instance.consumers) === null || _a === void 0 ? void 0 : _a.find(c => c.appData.peerId === id && c.appData.mediaTag === mediaTag)) !== null)
                                return;
                            // that we don't already have consumers for...
                            console.log(`auto subscribing to track that ${id} has added`);
                            yield this.subscribeToTrack(id, mediaTag);
                        }
                    }
                }
            }
            // if a peer has gone away, we need to close all consumers we have
            // for that peer and remove video and audio elements
            for (const id in this.lastPollSyncData) {
                if (!peers[id]) {
                    console.log(`Peer ${id} has exited`);
                    if (MediaStreamComponent.instance.consumers.length === 0)
                        return console.log("Consumers length is 0");
                    MediaStreamComponent.instance.consumers.forEach(consumer => {
                        if (consumer.appData.peerId === id) {
                            this.closeConsumer(consumer);
                        }
                    });
                }
            }
            // if a peer has stopped sending media that we are consuming, we
            // need to close the consumer and remove video and audio elements
            if (MediaStreamComponent.instance.consumers == undefined || MediaStreamComponent.instance.consumers.length === 0)
                return console.log("Consumers length is 0");
            MediaStreamComponent.instance.consumers.forEach(consumer => {
                const { peerId, mediaTag } = consumer.appData;
                if (!peers[peerId]) {
                    console.log(`Peer ${peerId} has stopped transmitting ${mediaTag}`);
                    this.closeConsumer(consumer);
                }
                else if (!peers[peerId].media[mediaTag]) {
                    console.log(`Peer ${peerId} has stopped transmitting ${mediaTag}`);
                    this.closeConsumer(consumer);
                }
            });
            // push through the paused state to new sync list
            this.lastPollSyncData = peers;
        });
    }
}

const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

class Subscription extends BehaviorComponent {
}

class SubscriptionSystem extends System {
    constructor() {
        super(...arguments);
        // TODO: Make this a generic behavior and move to common
        this.callBehaviorsForHook = (entity, args, delta) => {
            this.subscription = entity.getComponent(Subscription);
            if (this.subscription.map[args.phase] !== undefined) {
                this.subscription.map[args.phase].forEach((value) => {
                    value.behavior(entity, value.args ? value.args : null, delta);
                });
            }
        };
    }
    execute(delta, time) {
        var _a, _b, _c, _d;
        (_a = this.queries.subscriptions.added) === null || _a === void 0 ? void 0 : _a.forEach(entity => {
            this.callBehaviorsForHook(entity, { phase: "onAdded" }, delta);
        });
        (_b = this.queries.subscriptions.changed) === null || _b === void 0 ? void 0 : _b.forEach(entity => {
            this.callBehaviorsForHook(entity, { phase: "onChanged" }, delta);
        });
        (_c = this.queries.subscriptions.results) === null || _c === void 0 ? void 0 : _c.forEach(entity => {
            this.callBehaviorsForHook(entity, { phase: "onUpdate" }, delta);
            this.callBehaviorsForHook(entity, { phase: "onLateUpdate" }, delta);
        });
        (_d = this.queries.subscriptions.removed) === null || _d === void 0 ? void 0 : _d.forEach(entity => {
            this.callBehaviorsForHook(entity, { phase: "onRemoved" }, delta);
        });
    }
}
SubscriptionSystem.queries = {
    subscriptions: {
        components: [Subscription],
        listen: {
            added: true,
            changed: true,
            removed: true
        }
    }
};

const DefaultSubscriptionSchema = {
    onUpdate: [
        {
            behavior: updatePosition
        }
    ]
};

const DEFAULT_OPTIONS = {
    debug: false,
    withTransform: false
};
function initializeInputSystems(world, options = DEFAULT_OPTIONS) {
    if (options.debug)
        console.log("Initializing input systems...");
    if (!isBrowser) {
        console.error("Couldn't initialize input, are you in a browser?");
        return null;
    }
    if (options.debug) {
        console.log("Registering input systems with the following options:");
        console.log(options);
    }
    world
        .registerSystem(InputSystem)
        .registerSystem(StateSystem)
        .registerSystem(SubscriptionSystem)
        .registerSystem(TransformComponentSystem);
    world
        .registerComponent(Input)
        .registerComponent(State)
        .registerComponent(Actor)
        .registerComponent(Subscription)
        .registerComponent(TransformComponent);
    if (options.withTransform)
        world.registerComponent(Transform);
    return world;
}
function initializeActor(entity, options, withTransform = false) {
    entity
        .addComponent(Input)
        .addComponent(State)
        .addComponent(Actor)
        .addComponent(Subscription)
        .addComponent(TransformComponent);
    // .addComponent(Transform)
    if (withTransform)
        entity.addComponent(Transform);
    // Custom Action Map
    if (options.inputMap) {
        console.log("Using input map:");
        console.log(options.inputMap);
        entity.getMutableComponent(Input).map = options.inputMap;
    }
    else {
        console.log("No input map provided, defaulting to default input");
        entity.getMutableComponent(Input).map = DefaultInputMap;
    }
    // Custom Action Map
    if (options.stateMap) {
        console.log("Using input map:");
        console.log(options.stateMap);
        entity.getMutableComponent(State).map = options.stateMap;
    }
    else {
        console.log("No state map provided, defaulting to default state");
        entity.getMutableComponent(State).map = DefaultStateSchema;
    }
    // Custom Subscription Map
    if (options.subscriptionMap) {
        console.log("Using subscription map:");
        console.log(options.subscriptionMap);
        entity.getMutableComponent(Subscription).map = options.subscriptionMap;
    }
    else {
        console.log("No subscription map provided, defaulting to default subscriptions");
        entity.getMutableComponent(Subscription).map = DefaultSubscriptionSchema;
    }
    return entity;
}
function initializeNetworking(world, transport) {
    world.registerSystem(NetworkSystem).registerComponent(NetworkClient);
    if (transport.supportsMediaStreams)
        world.registerSystem(MediaStreamControlSystem);
    const networkSystem = world.getSystem(NetworkSystem);
    networkSystem.initializeSession(world, transport);
}

export { CAM_VIDEO_SIMULCAST_ENCODINGS, DefaultInput, DefaultInputMap, DefaultStateGroups, DefaultStateSchema, DefaultStateTypes, GamepadButtons, InputType, MediaStreamControlSystem, MouseButtons, NetworkObjectAssemblage, NetworkSystem, SocketWebRTCClientTransport, StateType, Thumbsticks, TransformComponent, VIDEO_CONSTRAINTS, addState, decelerate, handleGamepadAxis, handleGamepadConnected, handleGamepadDisconnected, handleGamepads, handleInput, handleKey, handleMouseButton, handleMouseMovement, hasState, initializeActor, initializeInputSystems, initializeNetworking, jump, jumping, localMediaConstraints, move, removeState, rotateAround, setTouchHandler, toggleState, updatePosition };
//# sourceMappingURL=armada.js.map