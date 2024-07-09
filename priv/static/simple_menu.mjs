// build/dev/javascript/prelude.mjs
var CustomType = class {
  withFields(fields) {
    let properties = Object.keys(this).map(
      (label) => label in fields ? fields[label] : this[label]
    );
    return new this.constructor(...properties);
  }
};
var List = class {
  static fromArray(array3, tail) {
    let t = tail || new Empty();
    for (let i2 = array3.length - 1; i2 >= 0; --i2) {
      t = new NonEmpty(array3[i2], t);
    }
    return t;
  }
  [Symbol.iterator]() {
    return new ListIterator(this);
  }
  toArray() {
    return [...this];
  }
  // @internal
  atLeastLength(desired) {
    for (let _ of this) {
      if (desired <= 0)
        return true;
      desired--;
    }
    return desired <= 0;
  }
  // @internal
  hasLength(desired) {
    for (let _ of this) {
      if (desired <= 0)
        return false;
      desired--;
    }
    return desired === 0;
  }
  countLength() {
    let length2 = 0;
    for (let _ of this)
      length2++;
    return length2;
  }
};
function prepend(element2, tail) {
  return new NonEmpty(element2, tail);
}
function toList(elements, tail) {
  return List.fromArray(elements, tail);
}
var ListIterator = class {
  #current;
  constructor(current) {
    this.#current = current;
  }
  next() {
    if (this.#current instanceof Empty) {
      return { done: true };
    } else {
      let { head, tail } = this.#current;
      this.#current = tail;
      return { value: head, done: false };
    }
  }
};
var Empty = class extends List {
};
var NonEmpty = class extends List {
  constructor(head, tail) {
    super();
    this.head = head;
    this.tail = tail;
  }
};
var BitArray = class _BitArray {
  constructor(buffer) {
    if (!(buffer instanceof Uint8Array)) {
      throw "BitArray can only be constructed from a Uint8Array";
    }
    this.buffer = buffer;
  }
  // @internal
  get length() {
    return this.buffer.length;
  }
  // @internal
  byteAt(index2) {
    return this.buffer[index2];
  }
  // @internal
  floatAt(index2) {
    return byteArrayToFloat(this.buffer.slice(index2, index2 + 8));
  }
  // @internal
  intFromSlice(start4, end) {
    return byteArrayToInt(this.buffer.slice(start4, end));
  }
  // @internal
  binaryFromSlice(start4, end) {
    return new _BitArray(this.buffer.slice(start4, end));
  }
  // @internal
  sliceAfter(index2) {
    return new _BitArray(this.buffer.slice(index2));
  }
};
function byteArrayToInt(byteArray) {
  byteArray = byteArray.reverse();
  let value3 = 0;
  for (let i2 = byteArray.length - 1; i2 >= 0; i2--) {
    value3 = value3 * 256 + byteArray[i2];
  }
  return value3;
}
function byteArrayToFloat(byteArray) {
  return new Float64Array(byteArray.reverse().buffer)[0];
}
var Result = class _Result extends CustomType {
  // @internal
  static isResult(data) {
    return data instanceof _Result;
  }
};
var Ok = class extends Result {
  constructor(value3) {
    super();
    this[0] = value3;
  }
  // @internal
  isOk() {
    return true;
  }
};
var Error = class extends Result {
  constructor(detail) {
    super();
    this[0] = detail;
  }
  // @internal
  isOk() {
    return false;
  }
};
function isEqual(x, y) {
  let values = [x, y];
  while (values.length) {
    let a2 = values.pop();
    let b2 = values.pop();
    if (a2 === b2)
      continue;
    if (!isObject(a2) || !isObject(b2))
      return false;
    let unequal = !structurallyCompatibleObjects(a2, b2) || unequalDates(a2, b2) || unequalBuffers(a2, b2) || unequalArrays(a2, b2) || unequalMaps(a2, b2) || unequalSets(a2, b2) || unequalRegExps(a2, b2);
    if (unequal)
      return false;
    const proto = Object.getPrototypeOf(a2);
    if (proto !== null && typeof proto.equals === "function") {
      try {
        if (a2.equals(b2))
          continue;
        else
          return false;
      } catch {
      }
    }
    let [keys2, get2] = getters(a2);
    for (let k of keys2(a2)) {
      values.push(get2(a2, k), get2(b2, k));
    }
  }
  return true;
}
function getters(object3) {
  if (object3 instanceof Map) {
    return [(x) => x.keys(), (x, y) => x.get(y)];
  } else {
    let extra = object3 instanceof globalThis.Error ? ["message"] : [];
    return [(x) => [...extra, ...Object.keys(x)], (x, y) => x[y]];
  }
}
function unequalDates(a2, b2) {
  return a2 instanceof Date && (a2 > b2 || a2 < b2);
}
function unequalBuffers(a2, b2) {
  return a2.buffer instanceof ArrayBuffer && a2.BYTES_PER_ELEMENT && !(a2.byteLength === b2.byteLength && a2.every((n, i2) => n === b2[i2]));
}
function unequalArrays(a2, b2) {
  return Array.isArray(a2) && a2.length !== b2.length;
}
function unequalMaps(a2, b2) {
  return a2 instanceof Map && a2.size !== b2.size;
}
function unequalSets(a2, b2) {
  return a2 instanceof Set && (a2.size != b2.size || [...a2].some((e) => !b2.has(e)));
}
function unequalRegExps(a2, b2) {
  return a2 instanceof RegExp && (a2.source !== b2.source || a2.flags !== b2.flags);
}
function isObject(a2) {
  return typeof a2 === "object" && a2 !== null;
}
function structurallyCompatibleObjects(a2, b2) {
  if (typeof a2 !== "object" && typeof b2 !== "object" && (!a2 || !b2))
    return false;
  let nonstructural = [Promise, WeakSet, WeakMap, Function];
  if (nonstructural.some((c) => a2 instanceof c))
    return false;
  return a2.constructor === b2.constructor;
}
function makeError(variant, module, line, fn, message, extra) {
  let error = new globalThis.Error(message);
  error.gleam_error = variant;
  error.module = module;
  error.line = line;
  error.fn = fn;
  for (let k in extra)
    error[k] = extra[k];
  return error;
}

// build/dev/javascript/gleam_stdlib/gleam/option.mjs
var Some = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var None = class extends CustomType {
};
function to_result(option, e) {
  if (option instanceof Some) {
    let a2 = option[0];
    return new Ok(a2);
  } else {
    return new Error(e);
  }
}

// build/dev/javascript/gleam_stdlib/gleam/int.mjs
function to_string2(x) {
  return to_string(x);
}
function to_float(x) {
  return identity(x);
}

// build/dev/javascript/gleam_stdlib/gleam/list.mjs
function do_reverse(loop$remaining, loop$accumulator) {
  while (true) {
    let remaining = loop$remaining;
    let accumulator = loop$accumulator;
    if (remaining.hasLength(0)) {
      return accumulator;
    } else {
      let item = remaining.head;
      let rest$1 = remaining.tail;
      loop$remaining = rest$1;
      loop$accumulator = prepend(item, accumulator);
    }
  }
}
function reverse(xs) {
  return do_reverse(xs, toList([]));
}
function do_filter(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list.head;
      let xs = list.tail;
      let new_acc = (() => {
        let $ = fun(x);
        if ($) {
          return prepend(x, acc);
        } else {
          return acc;
        }
      })();
      loop$list = xs;
      loop$fun = fun;
      loop$acc = new_acc;
    }
  }
}
function filter(list, predicate) {
  return do_filter(list, predicate, toList([]));
}
function do_map(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list.head;
      let xs = list.tail;
      loop$list = xs;
      loop$fun = fun;
      loop$acc = prepend(fun(x), acc);
    }
  }
}
function map(list, fun) {
  return do_map(list, fun, toList([]));
}
function fold(loop$list, loop$initial, loop$fun) {
  while (true) {
    let list = loop$list;
    let initial = loop$initial;
    let fun = loop$fun;
    if (list.hasLength(0)) {
      return initial;
    } else {
      let x = list.head;
      let rest$1 = list.tail;
      loop$list = rest$1;
      loop$initial = fun(initial, x);
      loop$fun = fun;
    }
  }
}

// build/dev/javascript/gleam_stdlib/gleam/result.mjs
function map2(result, fun) {
  if (result.isOk()) {
    let x = result[0];
    return new Ok(fun(x));
  } else {
    let e = result[0];
    return new Error(e);
  }
}
function map_error(result, fun) {
  if (result.isOk()) {
    let x = result[0];
    return new Ok(x);
  } else {
    let error = result[0];
    return new Error(fun(error));
  }
}
function try$(result, fun) {
  if (result.isOk()) {
    let x = result[0];
    return fun(x);
  } else {
    let e = result[0];
    return new Error(e);
  }
}

// build/dev/javascript/gleam_stdlib/gleam/string_builder.mjs
function from_strings(strings) {
  return concat(strings);
}
function to_string3(builder) {
  return identity(builder);
}

// build/dev/javascript/gleam_stdlib/gleam/dynamic.mjs
var DecodeError = class extends CustomType {
  constructor(expected, found, path) {
    super();
    this.expected = expected;
    this.found = found;
    this.path = path;
  }
};
function from(a2) {
  return identity(a2);
}
function classify(data) {
  return classify_dynamic(data);
}
function int(data) {
  return decode_int(data);
}
function any(decoders) {
  return (data) => {
    if (decoders.hasLength(0)) {
      return new Error(
        toList([new DecodeError("another type", classify(data), toList([]))])
      );
    } else {
      let decoder = decoders.head;
      let decoders$1 = decoders.tail;
      let $ = decoder(data);
      if ($.isOk()) {
        let decoded = $[0];
        return new Ok(decoded);
      } else {
        return any(decoders$1)(data);
      }
    }
  };
}
function push_path(error, name) {
  let name$1 = from(name);
  let decoder = any(
    toList([string, (x) => {
      return map2(int(x), to_string2);
    }])
  );
  let name$2 = (() => {
    let $ = decoder(name$1);
    if ($.isOk()) {
      let name$22 = $[0];
      return name$22;
    } else {
      let _pipe = toList(["<", classify(name$1), ">"]);
      let _pipe$1 = from_strings(_pipe);
      return to_string3(_pipe$1);
    }
  })();
  return error.withFields({ path: prepend(name$2, error.path) });
}
function map_errors(result, f) {
  return map_error(
    result,
    (_capture) => {
      return map(_capture, f);
    }
  );
}
function string(data) {
  return decode_string(data);
}
function field(name, inner_type) {
  return (value3) => {
    let missing_field_error = new DecodeError("field", "nothing", toList([]));
    return try$(
      decode_field(value3, name),
      (maybe_inner) => {
        let _pipe = maybe_inner;
        let _pipe$1 = to_result(_pipe, toList([missing_field_error]));
        let _pipe$2 = try$(_pipe$1, inner_type);
        return map_errors(
          _pipe$2,
          (_capture) => {
            return push_path(_capture, name);
          }
        );
      }
    );
  };
}

// build/dev/javascript/gleam_stdlib/dict.mjs
var referenceMap = /* @__PURE__ */ new WeakMap();
var tempDataView = new DataView(new ArrayBuffer(8));
var referenceUID = 0;
function hashByReference(o) {
  const known = referenceMap.get(o);
  if (known !== void 0) {
    return known;
  }
  const hash = referenceUID++;
  if (referenceUID === 2147483647) {
    referenceUID = 0;
  }
  referenceMap.set(o, hash);
  return hash;
}
function hashMerge(a2, b2) {
  return a2 ^ b2 + 2654435769 + (a2 << 6) + (a2 >> 2) | 0;
}
function hashString(s) {
  let hash = 0;
  const len = s.length;
  for (let i2 = 0; i2 < len; i2++) {
    hash = Math.imul(31, hash) + s.charCodeAt(i2) | 0;
  }
  return hash;
}
function hashNumber(n) {
  tempDataView.setFloat64(0, n);
  const i2 = tempDataView.getInt32(0);
  const j = tempDataView.getInt32(4);
  return Math.imul(73244475, i2 >> 16 ^ i2) ^ j;
}
function hashBigInt(n) {
  return hashString(n.toString());
}
function hashObject(o) {
  const proto = Object.getPrototypeOf(o);
  if (proto !== null && typeof proto.hashCode === "function") {
    try {
      const code = o.hashCode(o);
      if (typeof code === "number") {
        return code;
      }
    } catch {
    }
  }
  if (o instanceof Promise || o instanceof WeakSet || o instanceof WeakMap) {
    return hashByReference(o);
  }
  if (o instanceof Date) {
    return hashNumber(o.getTime());
  }
  let h = 0;
  if (o instanceof ArrayBuffer) {
    o = new Uint8Array(o);
  }
  if (Array.isArray(o) || o instanceof Uint8Array) {
    for (let i2 = 0; i2 < o.length; i2++) {
      h = Math.imul(31, h) + getHash(o[i2]) | 0;
    }
  } else if (o instanceof Set) {
    o.forEach((v) => {
      h = h + getHash(v) | 0;
    });
  } else if (o instanceof Map) {
    o.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
  } else {
    const keys2 = Object.keys(o);
    for (let i2 = 0; i2 < keys2.length; i2++) {
      const k = keys2[i2];
      const v = o[k];
      h = h + hashMerge(getHash(v), hashString(k)) | 0;
    }
  }
  return h;
}
function getHash(u) {
  if (u === null)
    return 1108378658;
  if (u === void 0)
    return 1108378659;
  if (u === true)
    return 1108378657;
  if (u === false)
    return 1108378656;
  switch (typeof u) {
    case "number":
      return hashNumber(u);
    case "string":
      return hashString(u);
    case "bigint":
      return hashBigInt(u);
    case "object":
      return hashObject(u);
    case "symbol":
      return hashByReference(u);
    case "function":
      return hashByReference(u);
    default:
      return 0;
  }
}
var SHIFT = 5;
var BUCKET_SIZE = Math.pow(2, SHIFT);
var MASK = BUCKET_SIZE - 1;
var MAX_INDEX_NODE = BUCKET_SIZE / 2;
var MIN_ARRAY_NODE = BUCKET_SIZE / 4;
var ENTRY = 0;
var ARRAY_NODE = 1;
var INDEX_NODE = 2;
var COLLISION_NODE = 3;
var EMPTY = {
  type: INDEX_NODE,
  bitmap: 0,
  array: []
};
function mask(hash, shift) {
  return hash >>> shift & MASK;
}
function bitpos(hash, shift) {
  return 1 << mask(hash, shift);
}
function bitcount(x) {
  x -= x >> 1 & 1431655765;
  x = (x & 858993459) + (x >> 2 & 858993459);
  x = x + (x >> 4) & 252645135;
  x += x >> 8;
  x += x >> 16;
  return x & 127;
}
function index(bitmap, bit) {
  return bitcount(bitmap & bit - 1);
}
function cloneAndSet(arr, at, val) {
  const len = arr.length;
  const out = new Array(len);
  for (let i2 = 0; i2 < len; ++i2) {
    out[i2] = arr[i2];
  }
  out[at] = val;
  return out;
}
function spliceIn(arr, at, val) {
  const len = arr.length;
  const out = new Array(len + 1);
  let i2 = 0;
  let g = 0;
  while (i2 < at) {
    out[g++] = arr[i2++];
  }
  out[g++] = val;
  while (i2 < len) {
    out[g++] = arr[i2++];
  }
  return out;
}
function spliceOut(arr, at) {
  const len = arr.length;
  const out = new Array(len - 1);
  let i2 = 0;
  let g = 0;
  while (i2 < at) {
    out[g++] = arr[i2++];
  }
  ++i2;
  while (i2 < len) {
    out[g++] = arr[i2++];
  }
  return out;
}
function createNode(shift, key1, val1, key2hash, key2, val2) {
  const key1hash = getHash(key1);
  if (key1hash === key2hash) {
    return {
      type: COLLISION_NODE,
      hash: key1hash,
      array: [
        { type: ENTRY, k: key1, v: val1 },
        { type: ENTRY, k: key2, v: val2 }
      ]
    };
  }
  const addedLeaf = { val: false };
  return assoc(
    assocIndex(EMPTY, shift, key1hash, key1, val1, addedLeaf),
    shift,
    key2hash,
    key2,
    val2,
    addedLeaf
  );
}
function assoc(root2, shift, hash, key, val, addedLeaf) {
  switch (root2.type) {
    case ARRAY_NODE:
      return assocArray(root2, shift, hash, key, val, addedLeaf);
    case INDEX_NODE:
      return assocIndex(root2, shift, hash, key, val, addedLeaf);
    case COLLISION_NODE:
      return assocCollision(root2, shift, hash, key, val, addedLeaf);
  }
}
function assocArray(root2, shift, hash, key, val, addedLeaf) {
  const idx = mask(hash, shift);
  const node = root2.array[idx];
  if (node === void 0) {
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root2.size + 1,
      array: cloneAndSet(root2.array, idx, { type: ENTRY, k: key, v: val })
    };
  }
  if (node.type === ENTRY) {
    if (isEqual(key, node.k)) {
      if (val === node.v) {
        return root2;
      }
      return {
        type: ARRAY_NODE,
        size: root2.size,
        array: cloneAndSet(root2.array, idx, {
          type: ENTRY,
          k: key,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root2.size,
      array: cloneAndSet(
        root2.array,
        idx,
        createNode(shift + SHIFT, node.k, node.v, hash, key, val)
      )
    };
  }
  const n = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
  if (n === node) {
    return root2;
  }
  return {
    type: ARRAY_NODE,
    size: root2.size,
    array: cloneAndSet(root2.array, idx, n)
  };
}
function assocIndex(root2, shift, hash, key, val, addedLeaf) {
  const bit = bitpos(hash, shift);
  const idx = index(root2.bitmap, bit);
  if ((root2.bitmap & bit) !== 0) {
    const node = root2.array[idx];
    if (node.type !== ENTRY) {
      const n = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
      if (n === node) {
        return root2;
      }
      return {
        type: INDEX_NODE,
        bitmap: root2.bitmap,
        array: cloneAndSet(root2.array, idx, n)
      };
    }
    const nodeKey = node.k;
    if (isEqual(key, nodeKey)) {
      if (val === node.v) {
        return root2;
      }
      return {
        type: INDEX_NODE,
        bitmap: root2.bitmap,
        array: cloneAndSet(root2.array, idx, {
          type: ENTRY,
          k: key,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: INDEX_NODE,
      bitmap: root2.bitmap,
      array: cloneAndSet(
        root2.array,
        idx,
        createNode(shift + SHIFT, nodeKey, node.v, hash, key, val)
      )
    };
  } else {
    const n = root2.array.length;
    if (n >= MAX_INDEX_NODE) {
      const nodes = new Array(32);
      const jdx = mask(hash, shift);
      nodes[jdx] = assocIndex(EMPTY, shift + SHIFT, hash, key, val, addedLeaf);
      let j = 0;
      let bitmap = root2.bitmap;
      for (let i2 = 0; i2 < 32; i2++) {
        if ((bitmap & 1) !== 0) {
          const node = root2.array[j++];
          nodes[i2] = node;
        }
        bitmap = bitmap >>> 1;
      }
      return {
        type: ARRAY_NODE,
        size: n + 1,
        array: nodes
      };
    } else {
      const newArray = spliceIn(root2.array, idx, {
        type: ENTRY,
        k: key,
        v: val
      });
      addedLeaf.val = true;
      return {
        type: INDEX_NODE,
        bitmap: root2.bitmap | bit,
        array: newArray
      };
    }
  }
}
function assocCollision(root2, shift, hash, key, val, addedLeaf) {
  if (hash === root2.hash) {
    const idx = collisionIndexOf(root2, key);
    if (idx !== -1) {
      const entry = root2.array[idx];
      if (entry.v === val) {
        return root2;
      }
      return {
        type: COLLISION_NODE,
        hash,
        array: cloneAndSet(root2.array, idx, { type: ENTRY, k: key, v: val })
      };
    }
    const size = root2.array.length;
    addedLeaf.val = true;
    return {
      type: COLLISION_NODE,
      hash,
      array: cloneAndSet(root2.array, size, { type: ENTRY, k: key, v: val })
    };
  }
  return assoc(
    {
      type: INDEX_NODE,
      bitmap: bitpos(root2.hash, shift),
      array: [root2]
    },
    shift,
    hash,
    key,
    val,
    addedLeaf
  );
}
function collisionIndexOf(root2, key) {
  const size = root2.array.length;
  for (let i2 = 0; i2 < size; i2++) {
    if (isEqual(key, root2.array[i2].k)) {
      return i2;
    }
  }
  return -1;
}
function find(root2, shift, hash, key) {
  switch (root2.type) {
    case ARRAY_NODE:
      return findArray(root2, shift, hash, key);
    case INDEX_NODE:
      return findIndex(root2, shift, hash, key);
    case COLLISION_NODE:
      return findCollision(root2, key);
  }
}
function findArray(root2, shift, hash, key) {
  const idx = mask(hash, shift);
  const node = root2.array[idx];
  if (node === void 0) {
    return void 0;
  }
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return void 0;
}
function findIndex(root2, shift, hash, key) {
  const bit = bitpos(hash, shift);
  if ((root2.bitmap & bit) === 0) {
    return void 0;
  }
  const idx = index(root2.bitmap, bit);
  const node = root2.array[idx];
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return void 0;
}
function findCollision(root2, key) {
  const idx = collisionIndexOf(root2, key);
  if (idx < 0) {
    return void 0;
  }
  return root2.array[idx];
}
function without(root2, shift, hash, key) {
  switch (root2.type) {
    case ARRAY_NODE:
      return withoutArray(root2, shift, hash, key);
    case INDEX_NODE:
      return withoutIndex(root2, shift, hash, key);
    case COLLISION_NODE:
      return withoutCollision(root2, key);
  }
}
function withoutArray(root2, shift, hash, key) {
  const idx = mask(hash, shift);
  const node = root2.array[idx];
  if (node === void 0) {
    return root2;
  }
  let n = void 0;
  if (node.type === ENTRY) {
    if (!isEqual(node.k, key)) {
      return root2;
    }
  } else {
    n = without(node, shift + SHIFT, hash, key);
    if (n === node) {
      return root2;
    }
  }
  if (n === void 0) {
    if (root2.size <= MIN_ARRAY_NODE) {
      const arr = root2.array;
      const out = new Array(root2.size - 1);
      let i2 = 0;
      let j = 0;
      let bitmap = 0;
      while (i2 < idx) {
        const nv = arr[i2];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i2;
          ++j;
        }
        ++i2;
      }
      ++i2;
      while (i2 < arr.length) {
        const nv = arr[i2];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i2;
          ++j;
        }
        ++i2;
      }
      return {
        type: INDEX_NODE,
        bitmap,
        array: out
      };
    }
    return {
      type: ARRAY_NODE,
      size: root2.size - 1,
      array: cloneAndSet(root2.array, idx, n)
    };
  }
  return {
    type: ARRAY_NODE,
    size: root2.size,
    array: cloneAndSet(root2.array, idx, n)
  };
}
function withoutIndex(root2, shift, hash, key) {
  const bit = bitpos(hash, shift);
  if ((root2.bitmap & bit) === 0) {
    return root2;
  }
  const idx = index(root2.bitmap, bit);
  const node = root2.array[idx];
  if (node.type !== ENTRY) {
    const n = without(node, shift + SHIFT, hash, key);
    if (n === node) {
      return root2;
    }
    if (n !== void 0) {
      return {
        type: INDEX_NODE,
        bitmap: root2.bitmap,
        array: cloneAndSet(root2.array, idx, n)
      };
    }
    if (root2.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root2.bitmap ^ bit,
      array: spliceOut(root2.array, idx)
    };
  }
  if (isEqual(key, node.k)) {
    if (root2.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root2.bitmap ^ bit,
      array: spliceOut(root2.array, idx)
    };
  }
  return root2;
}
function withoutCollision(root2, key) {
  const idx = collisionIndexOf(root2, key);
  if (idx < 0) {
    return root2;
  }
  if (root2.array.length === 1) {
    return void 0;
  }
  return {
    type: COLLISION_NODE,
    hash: root2.hash,
    array: spliceOut(root2.array, idx)
  };
}
function forEach(root2, fn) {
  if (root2 === void 0) {
    return;
  }
  const items = root2.array;
  const size = items.length;
  for (let i2 = 0; i2 < size; i2++) {
    const item = items[i2];
    if (item === void 0) {
      continue;
    }
    if (item.type === ENTRY) {
      fn(item.v, item.k);
      continue;
    }
    forEach(item, fn);
  }
}
var Dict = class _Dict {
  /**
   * @template V
   * @param {Record<string,V>} o
   * @returns {Dict<string,V>}
   */
  static fromObject(o) {
    const keys2 = Object.keys(o);
    let m = _Dict.new();
    for (let i2 = 0; i2 < keys2.length; i2++) {
      const k = keys2[i2];
      m = m.set(k, o[k]);
    }
    return m;
  }
  /**
   * @template K,V
   * @param {Map<K,V>} o
   * @returns {Dict<K,V>}
   */
  static fromMap(o) {
    let m = _Dict.new();
    o.forEach((v, k) => {
      m = m.set(k, v);
    });
    return m;
  }
  static new() {
    return new _Dict(void 0, 0);
  }
  /**
   * @param {undefined | Node<K,V>} root
   * @param {number} size
   */
  constructor(root2, size) {
    this.root = root2;
    this.size = size;
  }
  /**
   * @template NotFound
   * @param {K} key
   * @param {NotFound} notFound
   * @returns {NotFound | V}
   */
  get(key, notFound) {
    if (this.root === void 0) {
      return notFound;
    }
    const found = find(this.root, 0, getHash(key), key);
    if (found === void 0) {
      return notFound;
    }
    return found.v;
  }
  /**
   * @param {K} key
   * @param {V} val
   * @returns {Dict<K,V>}
   */
  set(key, val) {
    const addedLeaf = { val: false };
    const root2 = this.root === void 0 ? EMPTY : this.root;
    const newRoot = assoc(root2, 0, getHash(key), key, val, addedLeaf);
    if (newRoot === this.root) {
      return this;
    }
    return new _Dict(newRoot, addedLeaf.val ? this.size + 1 : this.size);
  }
  /**
   * @param {K} key
   * @returns {Dict<K,V>}
   */
  delete(key) {
    if (this.root === void 0) {
      return this;
    }
    const newRoot = without(this.root, 0, getHash(key), key);
    if (newRoot === this.root) {
      return this;
    }
    if (newRoot === void 0) {
      return _Dict.new();
    }
    return new _Dict(newRoot, this.size - 1);
  }
  /**
   * @param {K} key
   * @returns {boolean}
   */
  has(key) {
    if (this.root === void 0) {
      return false;
    }
    return find(this.root, 0, getHash(key), key) !== void 0;
  }
  /**
   * @returns {[K,V][]}
   */
  entries() {
    if (this.root === void 0) {
      return [];
    }
    const result = [];
    this.forEach((v, k) => result.push([k, v]));
    return result;
  }
  /**
   *
   * @param {(val:V,key:K)=>void} fn
   */
  forEach(fn) {
    forEach(this.root, fn);
  }
  hashCode() {
    let h = 0;
    this.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
    return h;
  }
  /**
   * @param {unknown} o
   * @returns {boolean}
   */
  equals(o) {
    if (!(o instanceof _Dict) || this.size !== o.size) {
      return false;
    }
    let equal = true;
    this.forEach((v, k) => {
      equal = equal && isEqual(o.get(k, !v), v);
    });
    return equal;
  }
};

// build/dev/javascript/gleam_stdlib/gleam_stdlib.mjs
var Nil = void 0;
var NOT_FOUND = {};
function identity(x) {
  return x;
}
function to_string(term) {
  return term.toString();
}
function float_to_string(float3) {
  const string3 = float3.toString();
  if (string3.indexOf(".") >= 0) {
    return string3;
  } else {
    return string3 + ".0";
  }
}
function concat(xs) {
  let result = "";
  for (const x of xs) {
    result = result + x;
  }
  return result;
}
var unicode_whitespaces = [
  " ",
  // Space
  "	",
  // Horizontal tab
  "\n",
  // Line feed
  "\v",
  // Vertical tab
  "\f",
  // Form feed
  "\r",
  // Carriage return
  "\x85",
  // Next line
  "\u2028",
  // Line separator
  "\u2029"
  // Paragraph separator
].join();
var left_trim_regex = new RegExp(`^([${unicode_whitespaces}]*)`, "g");
var right_trim_regex = new RegExp(`([${unicode_whitespaces}]*)$`, "g");
function console_log(term) {
  console.log(term);
}
function map_get(map4, key) {
  const value3 = map4.get(key, NOT_FOUND);
  if (value3 === NOT_FOUND) {
    return new Error(Nil);
  }
  return new Ok(value3);
}
function classify_dynamic(data) {
  if (typeof data === "string") {
    return "String";
  } else if (typeof data === "boolean") {
    return "Bool";
  } else if (data instanceof Result) {
    return "Result";
  } else if (data instanceof List) {
    return "List";
  } else if (data instanceof BitArray) {
    return "BitArray";
  } else if (data instanceof Dict) {
    return "Dict";
  } else if (Number.isInteger(data)) {
    return "Int";
  } else if (Array.isArray(data)) {
    return `Tuple of ${data.length} elements`;
  } else if (typeof data === "number") {
    return "Float";
  } else if (data === null) {
    return "Null";
  } else if (data === void 0) {
    return "Nil";
  } else {
    const type = typeof data;
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
function decoder_error(expected, got) {
  return decoder_error_no_classify(expected, classify_dynamic(got));
}
function decoder_error_no_classify(expected, got) {
  return new Error(
    List.fromArray([new DecodeError(expected, got, List.fromArray([]))])
  );
}
function decode_string(data) {
  return typeof data === "string" ? new Ok(data) : decoder_error("String", data);
}
function decode_int(data) {
  return Number.isInteger(data) ? new Ok(data) : decoder_error("Int", data);
}
function decode_field(value3, name) {
  const not_a_map_error = () => decoder_error("Dict", value3);
  if (value3 instanceof Dict || value3 instanceof WeakMap || value3 instanceof Map) {
    const entry = map_get(value3, name);
    return new Ok(entry.isOk() ? new Some(entry[0]) : new None());
  } else if (value3 === null) {
    return not_a_map_error();
  } else if (Object.getPrototypeOf(value3) == Object.prototype) {
    return try_get_field(value3, name, () => new Ok(new None()));
  } else {
    return try_get_field(value3, name, not_a_map_error);
  }
}
function try_get_field(value3, field2, or_else) {
  try {
    return field2 in value3 ? new Ok(new Some(value3[field2])) : or_else();
  } catch {
    return or_else();
  }
}

// build/dev/javascript/gleam_stdlib/gleam/float.mjs
function to_string4(x) {
  return float_to_string(x);
}

// build/dev/javascript/gleam_stdlib/gleam/io.mjs
function println(string3) {
  return console_log(string3);
}

// build/dev/javascript/gleam_stdlib/gleam/bool.mjs
function guard(requirement, consequence, alternative) {
  if (requirement) {
    return consequence;
  } else {
    return alternative();
  }
}

// build/dev/javascript/lustre/lustre/effect.mjs
var Effect = class extends CustomType {
  constructor(all) {
    super();
    this.all = all;
  }
};
function none() {
  return new Effect(toList([]));
}

// build/dev/javascript/lustre/lustre/internals/vdom.mjs
var Text = class extends CustomType {
  constructor(content) {
    super();
    this.content = content;
  }
};
var Element = class extends CustomType {
  constructor(key, namespace, tag, attrs, children, self_closing, void$) {
    super();
    this.key = key;
    this.namespace = namespace;
    this.tag = tag;
    this.attrs = attrs;
    this.children = children;
    this.self_closing = self_closing;
    this.void = void$;
  }
};
var Attribute = class extends CustomType {
  constructor(x0, x1, as_property) {
    super();
    this[0] = x0;
    this[1] = x1;
    this.as_property = as_property;
  }
};
var Event = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};

// build/dev/javascript/lustre/lustre/attribute.mjs
function attribute(name, value3) {
  return new Attribute(name, from(value3), false);
}
function property(name, value3) {
  return new Attribute(name, from(value3), true);
}
function on(name, handler) {
  return new Event("on" + name, handler);
}
function style(properties) {
  return attribute(
    "style",
    fold(
      properties,
      "",
      (styles, _use1) => {
        let name$1 = _use1[0];
        let value$1 = _use1[1];
        return styles + name$1 + ":" + value$1 + ";";
      }
    )
  );
}
function id(name) {
  return attribute("id", name);
}
function type_(name) {
  return attribute("type", name);
}
function value(val) {
  return attribute("value", val);
}
function checked(is_checked) {
  return property("checked", is_checked);
}
function href(uri) {
  return attribute("href", uri);
}

// build/dev/javascript/lustre/lustre/element.mjs
function element(tag, attrs, children) {
  if (tag === "area") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "base") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "br") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "col") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "embed") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "hr") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "img") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "input") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "link") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "meta") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "param") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "source") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "track") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "wbr") {
    return new Element("", "", tag, attrs, toList([]), false, true);
  } else {
    return new Element("", "", tag, attrs, children, false, false);
  }
}
function text(content) {
  return new Text(content);
}

// build/dev/javascript/lustre/lustre/internals/runtime.mjs
var Debug = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Dispatch = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Shutdown = class extends CustomType {
};
var ForceModel = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};

// build/dev/javascript/lustre/vdom.ffi.mjs
function morph(prev, next, dispatch, isComponent = false) {
  let out;
  let stack = [{ prev, next, parent: prev.parentNode }];
  while (stack.length) {
    let { prev: prev2, next: next2, parent } = stack.pop();
    if (next2.subtree !== void 0)
      next2 = next2.subtree();
    if (next2.content !== void 0) {
      if (!prev2) {
        const created = document.createTextNode(next2.content);
        parent.appendChild(created);
        out ??= created;
      } else if (prev2.nodeType === Node.TEXT_NODE) {
        if (prev2.textContent !== next2.content)
          prev2.textContent = next2.content;
        out ??= prev2;
      } else {
        const created = document.createTextNode(next2.content);
        parent.replaceChild(created, prev2);
        out ??= created;
      }
    } else if (next2.tag !== void 0) {
      const created = createElementNode({
        prev: prev2,
        next: next2,
        dispatch,
        stack,
        isComponent
      });
      if (!prev2) {
        parent.appendChild(created);
      } else if (prev2 !== created) {
        parent.replaceChild(created, prev2);
      }
      out ??= created;
    } else if (next2.elements !== void 0) {
      iterateElement(next2, (fragmentElement) => {
        stack.unshift({ prev: prev2, next: fragmentElement, parent });
        prev2 = prev2?.nextSibling;
      });
    } else if (next2.subtree !== void 0) {
      stack.push({ prev: prev2, next: next2, parent });
    }
  }
  return out;
}
function createElementNode({ prev, next, dispatch, stack }) {
  const namespace = next.namespace || "http://www.w3.org/1999/xhtml";
  const canMorph = prev && prev.nodeType === Node.ELEMENT_NODE && prev.localName === next.tag && prev.namespaceURI === (next.namespace || "http://www.w3.org/1999/xhtml");
  const el2 = canMorph ? prev : namespace ? document.createElementNS(namespace, next.tag) : document.createElement(next.tag);
  let handlersForEl;
  if (!registeredHandlers.has(el2)) {
    const emptyHandlers = /* @__PURE__ */ new Map();
    registeredHandlers.set(el2, emptyHandlers);
    handlersForEl = emptyHandlers;
  } else {
    handlersForEl = registeredHandlers.get(el2);
  }
  const prevHandlers = canMorph ? new Set(handlersForEl.keys()) : null;
  const prevAttributes = canMorph ? new Set(Array.from(prev.attributes, (a2) => a2.name)) : null;
  let className = null;
  let style2 = null;
  let innerHTML = null;
  for (const attr of next.attrs) {
    const name = attr[0];
    const value3 = attr[1];
    if (attr.as_property) {
      if (el2[name] !== value3)
        el2[name] = value3;
      if (canMorph)
        prevAttributes.delete(name);
    } else if (name.startsWith("on")) {
      const eventName = name.slice(2);
      const callback = dispatch(value3);
      if (!handlersForEl.has(eventName)) {
        el2.addEventListener(eventName, lustreGenericEventHandler);
      }
      handlersForEl.set(eventName, callback);
      if (canMorph)
        prevHandlers.delete(eventName);
    } else if (name.startsWith("data-lustre-on-")) {
      const eventName = name.slice(15);
      const callback = dispatch(lustreServerEventHandler);
      if (!handlersForEl.has(eventName)) {
        el2.addEventListener(eventName, lustreGenericEventHandler);
      }
      handlersForEl.set(eventName, callback);
      el2.setAttribute(name, value3);
    } else if (name === "class") {
      className = className === null ? value3 : className + " " + value3;
    } else if (name === "style") {
      style2 = style2 === null ? value3 : style2 + value3;
    } else if (name === "dangerous-unescaped-html") {
      innerHTML = value3;
    } else {
      if (el2.getAttribute(name) !== value3)
        el2.setAttribute(name, value3);
      if (name === "value" || name === "selected")
        el2[name] = value3;
      if (canMorph)
        prevAttributes.delete(name);
    }
  }
  if (className !== null) {
    el2.setAttribute("class", className);
    if (canMorph)
      prevAttributes.delete("class");
  }
  if (style2 !== null) {
    el2.setAttribute("style", style2);
    if (canMorph)
      prevAttributes.delete("style");
  }
  if (canMorph) {
    for (const attr of prevAttributes) {
      el2.removeAttribute(attr);
    }
    for (const eventName of prevHandlers) {
      handlersForEl.delete(eventName);
      el2.removeEventListener(eventName, lustreGenericEventHandler);
    }
  }
  if (next.key !== void 0 && next.key !== "") {
    el2.setAttribute("data-lustre-key", next.key);
  } else if (innerHTML !== null) {
    el2.innerHTML = innerHTML;
    return el2;
  }
  let prevChild = el2.firstChild;
  let seenKeys = null;
  let keyedChildren = null;
  let incomingKeyedChildren = null;
  let firstChild = next.children[Symbol.iterator]().next().value;
  if (canMorph && firstChild !== void 0 && // Explicit checks are more verbose but truthy checks force a bunch of comparisons
  // we don't care about: it's never gonna be a number etc.
  firstChild.key !== void 0 && firstChild.key !== "") {
    seenKeys = /* @__PURE__ */ new Set();
    keyedChildren = getKeyedChildren(prev);
    incomingKeyedChildren = getKeyedChildren(next);
  }
  for (const child of next.children) {
    iterateElement(child, (currElement) => {
      if (currElement.key !== void 0 && seenKeys !== null) {
        prevChild = diffKeyedChild(
          prevChild,
          currElement,
          el2,
          stack,
          incomingKeyedChildren,
          keyedChildren,
          seenKeys
        );
      } else {
        stack.unshift({ prev: prevChild, next: currElement, parent: el2 });
        prevChild = prevChild?.nextSibling;
      }
    });
  }
  while (prevChild) {
    const next2 = prevChild.nextSibling;
    el2.removeChild(prevChild);
    prevChild = next2;
  }
  return el2;
}
var registeredHandlers = /* @__PURE__ */ new WeakMap();
function lustreGenericEventHandler(event2) {
  const target = event2.currentTarget;
  if (!registeredHandlers.has(target)) {
    target.removeEventListener(event2.type, lustreGenericEventHandler);
    return;
  }
  const handlersForEventTarget = registeredHandlers.get(target);
  if (!handlersForEventTarget.has(event2.type)) {
    target.removeEventListener(event2.type, lustreGenericEventHandler);
    return;
  }
  handlersForEventTarget.get(event2.type)(event2);
}
function lustreServerEventHandler(event2) {
  const el2 = event2.currentTarget;
  const tag = el2.getAttribute(`data-lustre-on-${event2.type}`);
  const data = JSON.parse(el2.getAttribute("data-lustre-data") || "{}");
  const include = JSON.parse(el2.getAttribute("data-lustre-include") || "[]");
  switch (event2.type) {
    case "input":
    case "change":
      include.push("target.value");
      break;
  }
  return {
    tag,
    data: include.reduce(
      (data2, property2) => {
        const path = property2.split(".");
        for (let i2 = 0, o = data2, e = event2; i2 < path.length; i2++) {
          if (i2 === path.length - 1) {
            o[path[i2]] = e[path[i2]];
          } else {
            o[path[i2]] ??= {};
            e = e[path[i2]];
            o = o[path[i2]];
          }
        }
        return data2;
      },
      { data }
    )
  };
}
function getKeyedChildren(el2) {
  const keyedChildren = /* @__PURE__ */ new Map();
  if (el2) {
    for (const child of el2.children) {
      iterateElement(child, (currElement) => {
        const key = currElement?.key || currElement?.getAttribute?.("data-lustre-key");
        if (key)
          keyedChildren.set(key, currElement);
      });
    }
  }
  return keyedChildren;
}
function diffKeyedChild(prevChild, child, el2, stack, incomingKeyedChildren, keyedChildren, seenKeys) {
  while (prevChild && !incomingKeyedChildren.has(prevChild.getAttribute("data-lustre-key"))) {
    const nextChild = prevChild.nextSibling;
    el2.removeChild(prevChild);
    prevChild = nextChild;
  }
  if (keyedChildren.size === 0) {
    iterateElement(child, (currChild) => {
      stack.unshift({ prev: prevChild, next: currChild, parent: el2 });
      prevChild = prevChild?.nextSibling;
    });
    return prevChild;
  }
  if (seenKeys.has(child.key)) {
    console.warn(`Duplicate key found in Lustre vnode: ${child.key}`);
    stack.unshift({ prev: null, next: child, parent: el2 });
    return prevChild;
  }
  seenKeys.add(child.key);
  const keyedChild = keyedChildren.get(child.key);
  if (!keyedChild && !prevChild) {
    stack.unshift({ prev: null, next: child, parent: el2 });
    return prevChild;
  }
  if (!keyedChild && prevChild !== null) {
    const placeholder = document.createTextNode("");
    el2.insertBefore(placeholder, prevChild);
    stack.unshift({ prev: placeholder, next: child, parent: el2 });
    return prevChild;
  }
  if (!keyedChild || keyedChild === prevChild) {
    stack.unshift({ prev: prevChild, next: child, parent: el2 });
    prevChild = prevChild?.nextSibling;
    return prevChild;
  }
  el2.insertBefore(keyedChild, prevChild);
  stack.unshift({ prev: keyedChild, next: child, parent: el2 });
  return prevChild;
}
function iterateElement(element2, processElement) {
  if (element2.elements !== void 0) {
    for (const currElement of element2.elements) {
      processElement(currElement);
    }
  } else {
    processElement(element2);
  }
}

// build/dev/javascript/lustre/client-runtime.ffi.mjs
var LustreClientApplication2 = class _LustreClientApplication {
  #root = null;
  #queue = [];
  #effects = [];
  #didUpdate = false;
  #isComponent = false;
  #model = null;
  #update = null;
  #view = null;
  static start(flags, selector, init3, update2, view2) {
    if (!is_browser())
      return new Error(new NotABrowser());
    const root2 = selector instanceof HTMLElement ? selector : document.querySelector(selector);
    if (!root2)
      return new Error(new ElementNotFound(selector));
    const app = new _LustreClientApplication(init3(flags), update2, view2, root2);
    return new Ok((msg) => app.send(msg));
  }
  constructor([model, effects], update2, view2, root2 = document.body, isComponent = false) {
    this.#model = model;
    this.#update = update2;
    this.#view = view2;
    this.#root = root2;
    this.#effects = effects.all.toArray();
    this.#didUpdate = true;
    this.#isComponent = isComponent;
    window.requestAnimationFrame(() => this.#tick());
  }
  send(action) {
    switch (true) {
      case action instanceof Dispatch: {
        this.#queue.push(action[0]);
        this.#tick();
        return;
      }
      case action instanceof Shutdown: {
        this.#shutdown();
        return;
      }
      case action instanceof Debug: {
        this.#debug(action[0]);
        return;
      }
      default:
        return;
    }
  }
  emit(event2, data) {
    this.#root.dispatchEvent(
      new CustomEvent(event2, {
        bubbles: true,
        detail: data,
        composed: true
      })
    );
  }
  #tick() {
    this.#flush_queue();
    if (this.#didUpdate) {
      const vdom = this.#view(this.#model);
      const dispatch = (handler) => (e) => {
        const result = handler(e);
        if (result instanceof Ok) {
          this.send(new Dispatch(result[0]));
        }
      };
      this.#didUpdate = false;
      this.#root = morph(this.#root, vdom, dispatch, this.#isComponent);
    }
  }
  #flush_queue(iterations = 0) {
    while (this.#queue.length) {
      const [next, effects] = this.#update(this.#model, this.#queue.shift());
      this.#didUpdate ||= this.#model !== next;
      this.#model = next;
      this.#effects = this.#effects.concat(effects.all.toArray());
    }
    while (this.#effects.length) {
      this.#effects.shift()(
        (msg) => this.send(new Dispatch(msg)),
        (event2, data) => this.emit(event2, data)
      );
    }
    if (this.#queue.length) {
      if (iterations < 5) {
        this.#flush_queue(++iterations);
      } else {
        window.requestAnimationFrame(() => this.#tick());
      }
    }
  }
  #debug(action) {
    switch (true) {
      case action instanceof ForceModel: {
        const vdom = this.#view(action[0]);
        const dispatch = (handler) => (e) => {
          const result = handler(e);
          if (result instanceof Ok) {
            this.send(new Dispatch(result[0]));
          }
        };
        this.#queue = [];
        this.#effects = [];
        this.#didUpdate = false;
        this.#root = morph(this.#root, vdom, dispatch, this.#isComponent);
      }
    }
  }
  #shutdown() {
    this.#root.remove();
    this.#root = null;
    this.#model = null;
    this.#queue = [];
    this.#effects = [];
    this.#didUpdate = false;
    this.#update = () => {
    };
    this.#view = () => {
    };
  }
};
var start = (app, selector, flags) => LustreClientApplication2.start(
  flags,
  selector,
  app.init,
  app.update,
  app.view
);
var is_browser = () => globalThis.window && window.document;

// build/dev/javascript/lustre/lustre.mjs
var App = class extends CustomType {
  constructor(init3, update2, view2, on_attribute_change) {
    super();
    this.init = init3;
    this.update = update2;
    this.view = view2;
    this.on_attribute_change = on_attribute_change;
  }
};
var ElementNotFound = class extends CustomType {
  constructor(selector) {
    super();
    this.selector = selector;
  }
};
var NotABrowser = class extends CustomType {
};
function application(init3, update2, view2) {
  return new App(init3, update2, view2, new None());
}
function start3(app, selector, flags) {
  return guard(
    !is_browser(),
    new Error(new NotABrowser()),
    () => {
      return start(app, selector, flags);
    }
  );
}

// build/dev/javascript/lustre/lustre/element/html.mjs
function h1(attrs, children) {
  return element("h1", attrs, children);
}
function h3(attrs, children) {
  return element("h3", attrs, children);
}
function h6(attrs, children) {
  return element("h6", attrs, children);
}
function div(attrs, children) {
  return element("div", attrs, children);
}
function hr(attrs) {
  return element("hr", attrs, toList([]));
}
function p(attrs, children) {
  return element("p", attrs, children);
}
function a(attrs, children) {
  return element("a", attrs, children);
}
function b(attrs, children) {
  return element("b", attrs, children);
}
function br(attrs) {
  return element("br", attrs, toList([]));
}
function i(attrs, children) {
  return element("i", attrs, children);
}
function button(attrs, children) {
  return element("button", attrs, children);
}
function input(attrs) {
  return element("input", attrs, toList([]));
}

// build/dev/javascript/lustre/lustre/event.mjs
function on2(name, handler) {
  return on(name, handler);
}
function on_click(msg) {
  return on2("click", (_) => {
    return new Ok(msg);
  });
}
function value2(event2) {
  let _pipe = event2;
  return field("target", field("value", string))(
    _pipe
  );
}
function on_input(msg) {
  return on2(
    "input",
    (event2) => {
      let _pipe = value2(event2);
      return map2(_pipe, msg);
    }
  );
}

// build/dev/javascript/simple_menu/menu_data.mjs
var PIX = class extends CustomType {
};
var Money = class extends CustomType {
};
var Credit = class extends CustomType {
};
var Debt = class extends CustomType {
};
var Juices = class extends CustomType {
};
var Sodas = class extends CustomType {
};
var Beers = class extends CustomType {
};
var Burguers = class extends CustomType {
};
var MenuItem = class extends CustomType {
  constructor(name, ingredients, price, qtd, item_type) {
    super();
    this.name = name;
    this.ingredients = ingredients;
    this.price = price;
    this.qtd = qtd;
    this.item_type = item_type;
  }
};
function get_juices(menu_items) {
  let _pipe = menu_items;
  return filter(
    _pipe,
    (item) => {
      return isEqual(item.item_type, new Juices());
    }
  );
}
function get_beers(menu_items) {
  let _pipe = menu_items;
  return filter(
    _pipe,
    (item) => {
      return isEqual(item.item_type, new Beers());
    }
  );
}
function get_sodas(menu_items) {
  let _pipe = menu_items;
  return filter(
    _pipe,
    (item) => {
      return isEqual(item.item_type, new Sodas());
    }
  );
}
function get_burguers(menu_items) {
  let _pipe = menu_items;
  return filter(
    _pipe,
    (item) => {
      return isEqual(item.item_type, new Burguers());
    }
  );
}
function get_total_price(menu_items) {
  let _pipe = menu_items;
  return fold(
    _pipe,
    0,
    (current, item) => {
      let $ = item.qtd;
      if (item.qtd >= 1) {
        return current + to_float(item.qtd) * item.price;
      } else {
        return current;
      }
    }
  );
}
function generate_menu_items() {
  return toList([
    new MenuItem("Abacaxi 500ml", "Abacaxi", 6, 0, new Juices()),
    new MenuItem("Abacaxi 1L", "Abacaxi", 12, 0, new Juices()),
    new MenuItem(
      "Abacaxi com hortel\xE3 500ml",
      "Abacaxi com hortel\xE3",
      6,
      0,
      new Juices()
    ),
    new MenuItem(
      "Abacaxi com hortel\xE3 1L",
      "Abacaxi com hortel\xE3",
      12,
      0,
      new Juices()
    ),
    new MenuItem("Acerola 500ml", "Acerola", 6, 0, new Juices()),
    new MenuItem("Acerola 1L", "Acerola", 12, 0, new Juices()),
    new MenuItem("Maracuja 500ml", "Maracuja", 6, 0, new Juices()),
    new MenuItem("Maracuja 1L", "Maracuja", 12, 0, new Juices()),
    new MenuItem("Laranja 500ml", "Laranja", 6, 0, new Juices()),
    new MenuItem("Laranja 1L", "Laranja", 12, 0, new Juices()),
    new MenuItem("Skol", "Skol", 5, 0, new Beers()),
    new MenuItem("Brahma", "Brahma", 5, 0, new Beers()),
    new MenuItem("Antarctica", "Antarctica", 5, 0, new Beers()),
    new MenuItem("Coca-cola LATA", "Coca cola", 5, 0, new Sodas()),
    new MenuItem("Coca-cola 600ml", "Coca cola", 7, 0, new Sodas()),
    new MenuItem("Coca-cola 1L", "Coca cola", 8, 0, new Sodas()),
    new MenuItem("Coca-cola 2L", "Coca cola", 12, 0, new Sodas()),
    new MenuItem("Fanta LATA", "Fanta", 5, 0, new Sodas()),
    new MenuItem("Fanta 600ml", "Fanta", 7, 0, new Sodas()),
    new MenuItem("Fanta 2L", "Fanta", 10, 0, new Sodas()),
    new MenuItem("Sprite LATA", "Sprite", 5, 0, new Sodas()),
    new MenuItem("sprite 600ml", "Sprite", 7, 0, new Sodas()),
    new MenuItem("Sprite 2L", "Sprite", 10, 0, new Sodas()),
    new MenuItem(
      "Guaran\xE1 Antarctica LATA",
      "Guaran\xE1 Antarctica",
      5,
      0,
      new Sodas()
    ),
    new MenuItem(
      "Guaran\xE1 Antarctica 1L",
      "Guaran\xE1 Antarctica",
      6,
      0,
      new Sodas()
    ),
    new MenuItem(
      "Guaran\xE1 Antarctica 2L",
      "Guaran\xE1 Antarctica",
      10,
      0,
      new Sodas()
    ),
    new MenuItem("Vencetex 600ml", "Vencetex", 5, 0, new Sodas()),
    new MenuItem("Vencetex 1L", "Vencetex", 6, 0, new Sodas()),
    new MenuItem("Vencetex 2L", "Vencetex", 8, 0, new Sodas()),
    new MenuItem("Misto", "Presunto e queijo", 17, 0, new Burguers()),
    new MenuItem("Bauru", "Presunto, queijo e tomate", 17, 0, new Burguers()),
    new MenuItem(
      "Paulista",
      "Bife, queijo, tomate e alface",
      29,
      0,
      new Burguers()
    ),
    new MenuItem(
      "Americano",
      "Bife, presunto, queijo, ovo, tomate e alface",
      32,
      0,
      new Burguers()
    ),
    new MenuItem(
      "Calabresa egg",
      "Presunto, queijo, bacon, calabresa, ovo, tomate e alface",
      22,
      0,
      new Burguers()
    ),
    new MenuItem(
      "Hot dog simples",
      "2 salsichas, milho, batata palha, tomate e alface",
      15,
      0,
      new Burguers()
    ),
    new MenuItem(
      "Hot dog especial",
      "2 salsichas, milho, batata palha, bacon, calabresa, tomate e alface",
      17,
      0,
      new Burguers()
    ),
    new MenuItem(
      "X-Palmito",
      "Presunto, queijo, palmito, tomate e  alface",
      20,
      0,
      new Burguers()
    ),
    new MenuItem(
      "X-Burguer",
      "2 Hamb\xFArgueres, queijo e tomate",
      17,
      0,
      new Burguers()
    ),
    new MenuItem(
      "X-Salada",
      "2 Hamb\xFArgueres, queijo e tomate",
      17,
      0,
      new Burguers()
    ),
    new MenuItem(
      "X-Egg",
      "2 Hamb\xFArgueres, queijo e tomate",
      18,
      0,
      new Burguers()
    ),
    new MenuItem(
      "X-Bacon",
      "2 Hamb\xFArgueres, queijo e tomate",
      22,
      0,
      new Burguers()
    ),
    new MenuItem(
      "X-Bacon com calabresa",
      "2 Hamb\xFArgueres, queijo e tomate",
      22,
      0,
      new Burguers()
    ),
    new MenuItem(
      "X-Salame",
      "2 Hamb\xFArgueres, queijo e tomate",
      22,
      0,
      new Burguers()
    ),
    new MenuItem(
      "X-Calabresa",
      "2 Hamb\xFArgueres, queijo e tomate",
      22,
      0,
      new Burguers()
    ),
    new MenuItem(
      "X-Tudo promo\xE7\xE3o",
      "2 Hamb\xFArgueres, queijo e tomate",
      22,
      0,
      new Burguers()
    ),
    new MenuItem(
      "X-Tudo especial",
      "2 Hamb\xFArgueres, queijo e tomate",
      24,
      0,
      new Burguers()
    ),
    new MenuItem(
      "X-Tudo com bife",
      "2 Hamb\xFArgueres, queijo e tomate",
      34,
      0,
      new Burguers()
    ),
    new MenuItem(
      "X-Tudo aberto",
      "2 Hamb\xFArgueres, queijo e tomate",
      26,
      0,
      new Burguers()
    ),
    new MenuItem(
      "Americano Aberto",
      "2 Hamb\xFArgueres, queijo e tomate",
      34,
      0,
      new Burguers()
    ),
    new MenuItem(
      "X-Frango desfiado",
      "2 Hamb\xFArgueres, queijo e tomate",
      25,
      0,
      new Burguers()
    ),
    new MenuItem(
      "Hamb\xFArguer simples",
      "2 Hamb\xFArgueres, queijo e tomate",
      15,
      0,
      new Burguers()
    )
  ]);
}

// build/dev/javascript/simple_menu/simple_menu.mjs
var Model = class extends CustomType {
  constructor(menu, payment, address) {
    super();
    this.menu = menu;
    this.payment = payment;
    this.address = address;
  }
};
var AddItem = class extends CustomType {
  constructor(item_name) {
    super();
    this.item_name = item_name;
  }
};
var RemoveItem = class extends CustomType {
  constructor(item_name) {
    super();
    this.item_name = item_name;
  }
};
var UpdatePayment = class extends CustomType {
  constructor(payment) {
    super();
    this.payment = payment;
  }
};
var UpdateAddress = class extends CustomType {
  constructor(addrs) {
    super();
    this.addrs = addrs;
  }
};
var SendOrder = class extends CustomType {
};
function view(model) {
  let styles = toList([
    ["width", "100vw"],
    ["height", "100vh"],
    ["padding", "2rem"]
  ]);
  let total_price = get_total_price(model.menu);
  let beers = get_beers(model.menu);
  let sodas = get_sodas(model.menu);
  let burguers = get_burguers(model.menu);
  let juices = get_juices(model.menu);
  return div(
    toList([style(styles)]),
    toList([
      h1(toList([]), toList([text("\u{1F680} Pedido r\xE1pido! \u{1F4AB}")])),
      h6(
        toList([]),
        toList([
          a(
            toList([href("#Sucos")]),
            toList([text("Sucos")])
          ),
          a(
            toList([href("#Cervejas")]),
            toList([text("Cervejas")])
          ),
          a(
            toList([href("#Refrigerantes")]),
            toList([text("Refrigerantes")])
          ),
          a(
            toList([href("#Lanches")]),
            toList([text("Lanches")])
          )
        ])
      ),
      hr(toList([])),
      h3(
        toList([id("Sucos")]),
        toList([text("\u{1F34D} Sucos \u{1F34D}")])
      ),
      div(
        toList([]),
        map(
          juices,
          (juice) => {
            return div(
              toList([]),
              toList([
                br(toList([])),
                button(
                  toList([on_click(new RemoveItem(juice.name))]),
                  toList([text("Remover")])
                ),
                text(" " + to_string2(juice.qtd) + " "),
                button(
                  toList([on_click(new AddItem(juice.name))]),
                  toList([text("Adicionar")])
                ),
                text(
                  " Pre\xE7o: R$" + to_string4(juice.price) + " - "
                ),
                b(toList([]), toList([text(juice.name)]))
              ])
            );
          }
        )
      ),
      br(toList([])),
      hr(toList([])),
      h3(
        toList([id("Cervejas")]),
        toList([text("\u{1F37A} Cervejas \u{1F37A}")])
      ),
      div(
        toList([]),
        map(
          beers,
          (beer) => {
            return div(
              toList([]),
              toList([
                br(toList([])),
                button(
                  toList([on_click(new RemoveItem(beer.name))]),
                  toList([text("Remover")])
                ),
                text(" " + to_string2(beer.qtd) + " "),
                button(
                  toList([on_click(new AddItem(beer.name))]),
                  toList([text("Adicionar")])
                ),
                text(
                  " Pre\xE7o: R$" + to_string4(beer.price) + " - "
                ),
                b(toList([]), toList([text(beer.name)]))
              ])
            );
          }
        )
      ),
      br(toList([])),
      hr(toList([])),
      h3(
        toList([id("Refrigerantes")]),
        toList([text("\u{1F964} Refrigerantes \u{1F964}")])
      ),
      div(
        toList([]),
        map(
          sodas,
          (soda) => {
            return div(
              toList([]),
              toList([
                br(toList([])),
                button(
                  toList([on_click(new RemoveItem(soda.name))]),
                  toList([text("Remover")])
                ),
                text(" " + to_string2(soda.qtd) + " "),
                button(
                  toList([on_click(new AddItem(soda.name))]),
                  toList([text("Adicionar")])
                ),
                text(
                  " Pre\xE7o: R$" + to_string4(soda.price) + " - "
                ),
                b(toList([]), toList([text(soda.name)]))
              ])
            );
          }
        )
      ),
      br(toList([])),
      hr(toList([])),
      h3(
        toList([id("Lanches")]),
        toList([text("\u{1F354} Lanches \u{1F354}")])
      ),
      div(
        toList([]),
        map(
          burguers,
          (burguer) => {
            return div(
              toList([]),
              toList([
                br(toList([])),
                button(
                  toList([on_click(new RemoveItem(burguer.name))]),
                  toList([text("Remover")])
                ),
                text(" " + to_string2(burguer.qtd) + " "),
                button(
                  toList([on_click(new AddItem(burguer.name))]),
                  toList([text("Adicionar")])
                ),
                text(
                  " Pre\xE7o: R$" + to_string4(burguer.price) + " - "
                ),
                b(toList([]), toList([text(burguer.name)])),
                text(" - Ingredientes: "),
                i(
                  toList([]),
                  toList([text(burguer.ingredients)])
                )
              ])
            );
          }
        )
      ),
      br(toList([])),
      hr(toList([])),
      h3(toList([]), toList([text("Finalizar pedido \u{1F58A}\uFE0F")])),
      div(
        toList([]),
        toList([
          p(
            toList([]),
            toList([
              text(
                "Valor total do pedido = R$" + to_string4(total_price)
              )
            ])
          ),
          p(toList([]), toList([text("Endere\xE7o da entrega:")])),
          input(
            toList([
              value(model.address),
              on_input((var0) => {
                return new UpdateAddress(var0);
              })
            ])
          ),
          p(toList([]), toList([text("Modo de pagamento:")])),
          div(
            toList([]),
            toList([
              input(
                toList([
                  type_("checkbox"),
                  value("PIX"),
                  checked(
                    isEqual(model.payment, new PIX())
                  ),
                  on_click(new UpdatePayment(new PIX()))
                ])
              ),
              text("PIX")
            ])
          ),
          div(
            toList([]),
            toList([
              input(
                toList([
                  type_("checkbox"),
                  value("Dinheiro"),
                  checked(
                    isEqual(model.payment, new Money())
                  ),
                  on_click(new UpdatePayment(new Money()))
                ])
              ),
              text("Dinheiro")
            ])
          ),
          div(
            toList([]),
            toList([
              input(
                toList([
                  type_("checkbox"),
                  value("Cart\xE3o de d\xE9bito"),
                  checked(
                    isEqual(model.payment, new Debt())
                  ),
                  on_click(new UpdatePayment(new Debt()))
                ])
              ),
              text("Cart\xE3o de d\xE9bito")
            ])
          ),
          div(
            toList([]),
            toList([
              input(
                toList([
                  type_("checkbox"),
                  value("Cart\xE3o de cr\xE9dito"),
                  checked(
                    isEqual(model.payment, new Credit())
                  ),
                  on_click(new UpdatePayment(new Credit()))
                ])
              ),
              text("Cart\xE3o de cr\xE9dito")
            ])
          ),
          br(toList([])),
          button(
            toList([on_click(new SendOrder())]),
            toList([text("Enviar pedido")])
          ),
          br(toList([])),
          br(toList([])),
          i(
            toList([]),
            toList([
              text("Criado por eduardocodigo0 - "),
              a(
                toList([href("https://github.com/eduardocodigo0/")]),
                toList([text("GitHub")])
              )
            ])
          )
        ])
      )
    ])
  );
}
function init2(_) {
  return [
    new Model(generate_menu_items(), new Money(), ""),
    none()
  ];
}
function add_item(model, item_name) {
  let new_menu_list = map(
    model.menu,
    (item) => {
      let $ = item.name === item_name;
      if ($ && item.qtd < 100) {
        return item.withFields({ qtd: item.qtd + 1 });
      } else {
        return item;
      }
    }
  );
  return model.withFields({ menu: new_menu_list });
}
function remove_item(model, item_name) {
  let new_menu_list = map(
    model.menu,
    (item) => {
      let $ = item.name === item_name;
      if ($ && item.qtd > 0) {
        return item.withFields({ qtd: item.qtd - 1 });
      } else {
        return item;
      }
    }
  );
  return model.withFields({ menu: new_menu_list });
}
function update_payment(model, payment) {
  return model.withFields({ payment });
}
function update_address(model, addr) {
  println(addr);
  return model.withFields({ address: addr });
}
function update(model, msg) {
  if (msg instanceof AddItem) {
    let item = msg.item_name;
    return [add_item(model, item), none()];
  } else if (msg instanceof RemoveItem) {
    let item = msg.item_name;
    return [remove_item(model, item), none()];
  } else if (msg instanceof UpdatePayment) {
    let method = msg.payment;
    return [update_payment(model, method), none()];
  } else if (msg instanceof UpdateAddress) {
    let addr = msg.addrs;
    return [update_address(model, addr), none()];
  } else {
    return [model, none()];
  }
}
function main() {
  let app = application(init2, update, view);
  let $ = start3(app, "#app", void 0);
  if (!$.isOk()) {
    throw makeError(
      "assignment_no_match",
      "simple_menu",
      32,
      "main",
      "Assignment pattern did not match",
      { value: $ }
    );
  }
  return void 0;
}

// build/.lustre/entry.mjs
main();
