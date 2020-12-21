/**
 * ```ts
 * interface IO<A> {
 *   (): A
 * }
 * ```
 *
 * `IO<A>` represents a non-deterministic synchronous computation that can cause side effects, yields a value of
 * type `A` and **never fails**. If you want to represent a synchronous computation that may fail, please see
 * `IOEither`.
 *
 * @since 3.0.0
 */
import { Applicative1 } from './Applicative'
import { apFirst_, Apply1, apSecond_, apS_, apT_ } from './Apply'
import { constant, identity, tuple } from './function'
import { bindTo_, Functor1 } from './Functor'
import { bind_, chainFirst_, Monad1 } from './Monad'
import { FromIO1 } from './FromIO'
import { Monoid } from './Monoid'
import { Pointed1 } from './Pointed'
import { Semigroup } from './Semigroup'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 3.0.0
 */
export interface IO<A> {
  (): A
}

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 3.0.0
 */
export const map: Functor1<URI>['map'] = (f) => (fa) => () => f(fa())

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 3.0.0
 */
export const ap: Apply1<URI>['ap'] = (fa) => (fab) => () => fab()(fa())

/**
 * Wrap a value into the type constructor.
 *
 * @category Applicative
 * @since 3.0.0
 */
export const of: Pointed1<URI>['of'] = constant

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 3.0.0
 */
export const chain: Monad1<URI>['chain'] = (f) => (ma) => () => f(ma())()

/**
 * Derivable from `Monad`.
 *
 * @category derivable combinators
 * @since 3.0.0
 */
export const flatten: <A>(mma: IO<IO<A>>) => IO<A> =
  /*#__PURE__*/
  chain(identity)

/**
 * @category FromIO
 * @since 3.0.0
 */
export const fromIO: FromIO1<URI>['fromIO'] = identity

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
export const URI = 'IO'

/**
 * @category instances
 * @since 3.0.0
 */
export type URI = typeof URI

declare module './HKT' {
  interface URItoKind<A> {
    readonly [URI]: IO<A>
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export function getSemigroup<A>(S: Semigroup<A>): Semigroup<IO<A>> {
  return {
    concat: (second) => (first) => () => {
      const a1 = first()
      const a2 = second()
      return S.concat(a2)(a1)
    }
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export function getMonoid<A>(M: Monoid<A>): Monoid<IO<A>> {
  return {
    concat: getSemigroup(M).concat,
    empty: of(M.empty)
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Functor: Functor1<URI> = {
  URI,
  map
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Pointed: Pointed1<URI> = {
  URI,
  map,
  of
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Applicative: Applicative1<URI> = {
  URI,
  map,
  ap,
  of
}

/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * Derivable from `Apply`.
 *
 * @category derivable combinators
 * @since 3.0.0
 */
export const apFirst: <B>(second: IO<B>) => <A>(first: IO<A>) => IO<A> =
  /*#__PURE__*/
  apFirst_(Applicative)

/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * Derivable from `Apply`.
 *
 * @category derivable combinators
 * @since 3.0.0
 */
export const apSecond: <B>(second: IO<B>) => <A>(first: IO<A>) => IO<B> =
  /*#__PURE__*/
  apSecond_(Applicative)

/**
 * @category instances
 * @since 3.0.0
 */
export const Monad: Monad1<URI> = {
  URI,
  map,
  of,
  chain
}

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * Derivable from `Monad`.
 *
 * @category derivable combinators
 * @since 3.0.0
 */
export const chainFirst: <A, B>(f: (a: A) => IO<B>) => (first: IO<A>) => IO<A> =
  /*#__PURE__*/
  chainFirst_(Monad)

/**
 * @category instances
 * @since 3.0.0
 */
export const FromIO: FromIO1<URI> = {
  URI,
  fromIO
}

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const Do: IO<{}> = of({})

/**
 * @since 3.0.0
 */
export const bindTo: <N extends string>(name: N) => <A>(fa: IO<A>) => IO<{ [K in N]: A }> =
  /*#__PURE__*/
  bindTo_(Functor)

/**
 * @since 3.0.0
 */
export const bind: <N extends string, A, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => IO<B>
) => (fa: IO<A>) => IO<{ [K in N | keyof A]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/
  bind_(Monad)

// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const apS: <A, N extends string, B>(
  name: Exclude<N, keyof A>,
  fb: IO<B>
) => (fa: IO<A>) => IO<{ [K in N | keyof A]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/
  apS_(Applicative)

// -------------------------------------------------------------------------------------
// pipeable sequence T
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const ApT: IO<readonly []> = of([])

/**
 * @since 3.0.0
 */
export const tupled: <A>(a: IO<A>) => IO<readonly [A]> = map(tuple)

/**
 * @since 3.0.0
 */
export const apT: <B>(fb: IO<B>) => <A extends ReadonlyArray<unknown>>(fas: IO<A>) => IO<readonly [...A, B]> =
  /*#__PURE__*/
  apT_(Applicative)

// -------------------------------------------------------------------------------------
// array utils
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const traverseArrayWithIndex: <A, B>(
  f: (index: number, a: A) => IO<B>
) => (arr: ReadonlyArray<A>) => IO<ReadonlyArray<B>> = (f) => (arr) => () => arr.map((a, i) => f(i, a)())

/**
 * runs an action for every element in array, and accumulates the results IO in the array.
 *
 * this function have the same behavior of `A.traverse(IO.io)` but it's stack safe
 *
 * @example
 * import * as RA from 'fp-ts/ReadonlyArray'
 * import { traverseArray, IO } from 'fp-ts/IO'
 * import { pipe } from 'fp-ts/function'
 *
 * const logger: Array<unknown> = []
 * const log: <A>(a: A) => IO<void> = (a) => () => { logger.push(a) }
 *
 * pipe(RA.range(0, 100), traverseArray(log))()
 * assert.deepStrictEqual(logger, RA.range(0, 100))
 *
 * @since 3.0.0
 */
export const traverseArray: <A, B>(f: (a: A) => IO<B>) => (arr: ReadonlyArray<A>) => IO<ReadonlyArray<B>> = (f) =>
  traverseArrayWithIndex((_, a) => f(a))

/**
 * transform Array of IO to IO of Array
 *
 * this function have the same behavior of `A.sequence(IO.io)` but it's stack safe
 *
 * @example
 * import * as RA from 'fp-ts/ReadonlyArray'
 * import { sequenceArray, IO } from 'fp-ts/IO'
 * import { pipe } from 'fp-ts/function'
 *
 * const logger: Array<unknown> = []
 * const log: <A>(a: A) => IO<void> = (a) => () => { logger.push(a) }
 *
 * pipe(RA.range(0, 100), RA.map(log), sequenceArray)()
 * assert.deepStrictEqual(logger, RA.range(0, 100))
 *
 * @since 3.0.0
 */
export const sequenceArray: <A>(arr: ReadonlyArray<IO<A>>) => IO<ReadonlyArray<A>> = traverseArray(identity)
