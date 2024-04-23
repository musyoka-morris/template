import {Reducer, useEffect, useReducer} from "react";

type Listener<T> = (state: T, previousState: T) => void;

type Atom<T> = Readonly<{
  isEqual: (a: T, b: T) => boolean
  initial: T
}>;


type AnyValue = any
type AnyAtom = Atom<AnyValue>
type AnyListener = Listener<AnyValue>

type Store = {
  get: <Value>(atom: Atom<Value>) => Value
  set: <Value>(atom: Atom<Value>, value: Value) => void
  sub: (atom: AnyAtom, listener: AnyListener) => () => void
}

/**
 * Create a new store. Each store is an independent, isolated universe of atom
 * states.
 *
 * Jotai atoms are not themselves state containers. When you read or write an
 * atom, that state is stored in a store. You can think of a Store like a
 * multi-layered map from atoms to states, like this:
 *
 * ```
 * // Conceptually, a Store is a map from atoms to states.
 * // The real type is a bit different.
 * type Store = Map<VersionObject, Map<Atom, AtomState>>
 * ```
 *
 * @returns A store.
 */
const createStore = (): Store => {
  const atomStateMap = new WeakMap<AnyAtom, AnyValue>();
  const listenersMap = new WeakMap<AnyAtom, Set<AnyListener>>();

  function getAtomState<Value>(atom: Atom<Value>) {
    return atomStateMap.get(atom) as Value;
  }

  function setAtomValue<Value>(atom: Atom<Value>, value: Value) {
    const prevAtomState = getAtomState(atom)!;
    if (atom.isEqual(prevAtomState, value))
      return;

    atomStateMap.set(atom, value);

    const listeners = listenersMap.get(atom);
    if (listeners)
      listeners.forEach(listener => listener(value, prevAtomState));
  }

  function subscribeAtom<Value>(atom: Atom<Value>, listener: Listener<Value>) {
    const listeners = listenersMap.get(atom) || new Set();
    listeners.add(listener);
    listenersMap.set(atom, listeners);


    return () => {
      listeners.delete(listener);
      if (listeners.size === 0)
        listenersMap.delete(atom);
    }
  }

  return {
    get: getAtomState,
    set: setAtomValue,
    sub: subscribeAtom,
  };
}

const store = createStore();

export default function atom<T>(initial: T, shallow = false): Atom<T> {
  const atom = {
    isEqual: shallow ? shallowEqual : Object.is,
    initial
  } as const;

  store.set(atom, initial);

  return atom;
}

export function useAtom<T>(atom: Atom<T>): T {
  const [state, dispatch] =
    useReducer<Reducer<T, T>, undefined>(
      (_, next) => next,
      undefined,
      () => store.get(atom)
    );
  useEffect(() => store.sub(atom, dispatch), [atom]);
  return state;
}

export const RESET = Symbol();

type SetStateAction<S> = S | ((prevState: S) => S);

function isAction<S>(value: SetStateAction<S>): value is (prevState: S) => S {
  return typeof value === "function";
}

export function setAtom(atom: Atom<any>, value: typeof RESET): void;
export function setAtom<T>(atom: Atom<T>, value: SetStateAction<T>): void;
export function setAtom<T>(atom: Atom<T>, value: SetStateAction<T> | typeof RESET) {
  let newValue: T;
  if (value === RESET) newValue = atom.initial;
  else if (isAction(value)) newValue = value(store.get(atom));
  else newValue = value;

  store.set(atom, newValue);
}

export function getAtom<T>(atom: Atom<T>): T {
  return store.get(atom);
}

export function subAtom<T>(atom: Atom<T>, listener: Listener<T>) {
  return store.sub(atom, listener);
}

// https://github.com/pmndrs/zustand/blob/main/src/vanilla/shallow.ts
function shallowEqual<T>(objA: T, objB: T) {
  if (Object.is(objA, objB)) {
    return true
  }
  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false
  }

  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false

    for (const [key, value] of objA) {
      if (!Object.is(value, objB.get(key))) {
        return false
      }
    }
    return true
  }

  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false

    for (const value of objA) {
      if (!objB.has(value)) {
        return false
      }
    }
    return true
  }

  const keysA = Object.keys(objA)
  if (keysA.length !== Object.keys(objB).length) {
    return false
  }
  for (const keyA of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keyA as string) ||
      !Object.is(objA[keyA as keyof T], objB[keyA as keyof T])
    ) {
      return false
    }
  }
  return true
}