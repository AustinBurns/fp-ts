/**
 * The `Ord` type class represents types which support comparisons with a _total order_.
 *
 * Instances should satisfy the laws of total orderings:
 *
 * 1. Reflexivity: `S.compare(a)(a) <= 0`
 * 2. Antisymmetry: if `S.compare(b)(a) <= 0` and `S.compare(a)(b) <= 0` then `a <-> b`
 * 3. Transitivity: if `S.compare(b)(a) <= 0` and `S.compare(c)(b) <= 0` then `S.compare(c)(a) <= 0`
 *
 * @since 3.0.0
 */
import { Contravariant1 } from './Contravariant'
import { Eq, eqStrict } from './Eq'
import { Monoid } from './Monoid'
import { monoidOrdering, Ordering } from './Ordering'
import { Endomorphism, flow, pipe, Predicate } from './function'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category type classes
 * @since 3.0.0
 */
export interface Ord<A> extends Eq<A> {
  readonly compare: (second: A) => (first: A) => Ordering
}

// default compare for primitive types
const compare = (second: string | number | boolean) => (first: string | number | boolean): Ordering =>
  first < second ? -1 : first > second ? 1 : 0

/**
 * @category instances
 * @since 3.0.0
 */
export const ordString: Ord<string> = {
  equals: eqStrict.equals,
  compare
}

/**
 * @category instances
 * @since 3.0.0
 */
export const ordNumber: Ord<number> = {
  equals: eqStrict.equals,
  compare
}

/**
 * @category instances
 * @since 3.0.0
 */
export const ordBoolean: Ord<boolean> = {
  equals: eqStrict.equals,
  compare
}

/**
 * Test whether one value is _strictly less than_ another
 *
 * @since 3.0.0
 */
export const lt = <A>(O: Ord<A>) => (second: A) => (first: A): boolean => O.compare(second)(first) === -1

/**
 * Test whether one value is _strictly greater than_ another
 *
 * @since 3.0.0
 */
export const gt = <A>(O: Ord<A>) => (second: A) => (first: A): boolean => O.compare(second)(first) === 1

/**
 * Test whether one value is _non-strictly less than_ another
 *
 * @since 3.0.0
 */
export const leq = <A>(O: Ord<A>) => (second: A) => (first: A): boolean => O.compare(second)(first) !== 1

/**
 * Test whether one value is _non-strictly greater than_ another
 *
 * @since 3.0.0
 */
export const geq = <A>(O: Ord<A>) => (second: A) => (first: A): boolean => O.compare(second)(first) !== -1

/**
 * Take the minimum of two values. If they are considered equal, the first argument is chosen
 *
 * @since 3.0.0
 */
export const min = <A>(O: Ord<A>) => (second: A) => (first: A): A => (O.compare(second)(first) === 1 ? second : first)

/**
 * Take the maximum of two values. If they are considered equal, the first argument is chosen
 *
 * @since 3.0.0
 */
export const max = <A>(O: Ord<A>) => (second: A) => (first: A): A => (O.compare(second)(first) === -1 ? second : first)

/**
 * Clamp a value between a minimum and a maximum
 *
 * @since 3.0.0
 */
export function clamp<A>(O: Ord<A>): (low: A, hi: A) => Endomorphism<A> {
  const minO = min(O)
  const maxO = max(O)
  return (low, hi) => flow(minO(hi), maxO(low))
}

/**
 * Test whether a value is between a minimum and a maximum (inclusive)
 *
 * @since 3.0.0
 */
export function between<A>(O: Ord<A>): (low: A, hi: A) => Predicate<A> {
  const ltO = lt(O)
  const gtO = gt(O)
  return (low, hi) => (a) => (ltO(low)(a) || gtO(hi)(a) ? false : true)
}

/**
 * @category constructors
 * @since 3.0.0
 */
export function fromCompare<A>(compare: Ord<A>['compare']): Ord<A> {
  const optimizedCompare: Ord<A>['compare'] = (second) => {
    const f = compare(second)
    return (first): Ordering => (first === second ? 0 : f(first))
  }
  return {
    equals: (second) => {
      const f = optimizedCompare(second)
      return (first) => f(first) === 0
    },
    compare: optimizedCompare
  }
}

/**
 * Returns a `Monoid` such that:
 *
 * - its `concat(ord1, ord2)` operation will order first by `ord1`, and then by `ord2`
 * - its `empty` value is an `Ord` that always considers compared elements equal
 *
 * @example
 * import { sort } from 'fp-ts/ReadonlyArray'
 * import { contramap, getDualOrd, getMonoid, ordBoolean, ordNumber, ordString } from 'fp-ts/Ord'
 * import { pipe } from 'fp-ts/function'
 * import { fold } from 'fp-ts/Monoid'
 *
 * interface User {
 *   id: number
 *   name: string
 *   age: number
 *   rememberMe: boolean
 * }
 *
 * const byName = pipe(
 *   ordString,
 *   contramap((p: User) => p.name)
 * )
 *
 * const byAge = pipe(
 *   ordNumber,
 *   contramap((p: User) => p.age)
 * )
 *
 * const byRememberMe = pipe(
 *   ordBoolean,
 *   contramap((p: User) => p.rememberMe)
 * )
 *
 * const M = getMonoid<User>()
 *
 * const users: Array<User> = [
 *   { id: 1, name: 'Guido', age: 47, rememberMe: false },
 *   { id: 2, name: 'Guido', age: 46, rememberMe: true },
 *   { id: 3, name: 'Giulio', age: 44, rememberMe: false },
 *   { id: 4, name: 'Giulio', age: 44, rememberMe: true }
 * ]
 *
 * // sort by name, then by age, then by `rememberMe`
 * const O1 = fold(M)([byName, byAge, byRememberMe])
 * assert.deepStrictEqual(sort(O1)(users), [
 *   { id: 3, name: 'Giulio', age: 44, rememberMe: false },
 *   { id: 4, name: 'Giulio', age: 44, rememberMe: true },
 *   { id: 2, name: 'Guido', age: 46, rememberMe: true },
 *   { id: 1, name: 'Guido', age: 47, rememberMe: false }
 * ])
 *
 * // now `rememberMe = true` first, then by name, then by age
 * const O2 = fold(M)([getDualOrd(byRememberMe), byName, byAge])
 * assert.deepStrictEqual(sort(O2)(users), [
 *   { id: 4, name: 'Giulio', age: 44, rememberMe: true },
 *   { id: 2, name: 'Guido', age: 46, rememberMe: true },
 *   { id: 3, name: 'Giulio', age: 44, rememberMe: false },
 *   { id: 1, name: 'Guido', age: 47, rememberMe: false }
 * ])
 *
 * @category instances
 * @since 3.0.0
 */
export function getMonoid<A = never>(): Monoid<Ord<A>> {
  return {
    concat: (y) => (x) =>
      fromCompare((second) => {
        const fx = x.compare(second)
        const fy = y.compare(second)
        return (first) => monoidOrdering.concat(fy(first))(fx(first))
      }),
    empty: fromCompare(() => () => 0)
  }
}

/**
 * Given a tuple of `Ord`s returns an `Ord` for the tuple
 *
 * @example
 * import * as O from 'fp-ts/Ord'
 * import { pipe } from 'fp-ts/function'
 *
 * const O1 = O.getTupleOrd(O.ordString, O.ordNumber, O.ordBoolean)
 * assert.strictEqual(pipe(['a', 1, true], O1.compare(['b', 2, true])), -1)
 * assert.strictEqual(pipe(['a', 1, true], O1.compare(['a', 2, true])), -1)
 * assert.strictEqual(pipe(['a', 1, true], O1.compare(['a', 1, false])), 1)
 *
 * @category instances
 * @since 3.0.0
 */
export function getTupleOrd<T extends ReadonlyArray<Ord<any>>>(
  ...ords: T
): Ord<{ [K in keyof T]: T[K] extends Ord<infer A> ? A : never }> {
  const len = ords.length
  return fromCompare((second) => (first) => {
    let i = 0
    for (; i < len - 1; i++) {
      const r = ords[i].compare(second[i])(first[i])
      if (r !== 0) {
        return r
      }
    }
    return ords[i].compare(second[i])(first[i])
  })
}

/**
 * @category combinators
 * @since 3.0.0
 */
export const getDualOrd = <A>(O: Ord<A>): Ord<A> => fromCompare((second) => (first) => O.compare(first)(second))

/**
 * @category Contravariant
 * @since 3.0.0
 */
export const contramap: Contravariant1<URI>['contramap'] = (f) => (fa) =>
  fromCompare((second) => (first) => fa.compare(f(second))(f(first)))

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
export const URI = 'Ord'

/**
 * @category instances
 * @since 3.0.0
 */
export type URI = typeof URI

declare module './HKT' {
  interface URItoKind<A> {
    readonly [URI]: Ord<A>
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export const ordDate: Ord<Date> =
  /*#__PURE__*/
  pipe(
    ordNumber,
    contramap((date) => date.valueOf())
  )

/**
 * @category instances
 * @since 3.0.0
 */
export const Contravariant: Contravariant1<URI> = {
  URI,
  contramap
}
