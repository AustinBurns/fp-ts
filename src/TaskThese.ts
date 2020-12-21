/**
 * @since 3.0.0
 */
import { Applicative2C } from './Applicative'
import { Apply1 } from './Apply'
import { Bifunctor2 } from './Bifunctor'
import * as E from './Either'
import { FromEither2, fromOption_, fromPredicate_ } from './FromEither'
import { FromIO2 } from './FromIO'
import { FromTask2 } from './FromTask'
import { flow } from './function'
import { Functor2 } from './Functor'
import { IO } from './IO'
import { IOEither } from './IOEither'
import { Monad2C } from './Monad'
import { Pointed2 } from './Pointed'
import { Semigroup } from './Semigroup'
import * as T from './Task'
import * as TH from './These'
import {
  ap_,
  bimap_,
  both_,
  chain_,
  fold_,
  leftF_,
  left_,
  mapLeft_,
  map_,
  rightF_,
  right_,
  swap_,
  toTuple_
} from './TheseT'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

import These = TH.These
import Task = T.Task

/**
 * @category model
 * @since 3.0.0
 */
export interface TaskThese<E, A> extends Task<These<E, A>> {}

/**
 * @category constructors
 * @since 3.0.0
 */
export const left: <E, A = never>(e: E) => TaskThese<E, A> =
  /*#__PURE__*/
  left_(T.Pointed)

/**
 * @category constructors
 * @since 3.0.0
 */
export const right: <A, E = never>(a: A) => TaskThese<E, A> =
  /*#__PURE__*/
  right_(T.Pointed)

/**
 * @category constructors
 * @since 3.0.0
 */
export const both: <E, A>(e: E, a: A) => TaskThese<E, A> =
  /*#__PURE__*/
  both_(T.Pointed)

/**
 * @category constructors
 * @since 3.0.0
 */
export const rightTask: <A, E = never>(ma: Task<A>) => TaskThese<E, A> =
  /*#__PURE__*/
  rightF_(T.Functor)

/**
 * @category constructors
 * @since 3.0.0
 */
export const leftTask: <E, A = never>(me: Task<E>) => TaskThese<E, A> =
  /*#__PURE__*/
  leftF_(T.Functor)

/**
 * @category constructors
 * @since 3.0.0
 */
export const rightIO: <A, E = never>(ma: IO<A>) => TaskThese<E, A> =
  /*#__PURE__*/
  flow(T.fromIO, rightTask)

/**
 * @category constructors
 * @since 3.0.0
 */
export const leftIO: <E, A = never>(me: IO<E>) => TaskThese<E, A> =
  /*#__PURE__*/
  flow(T.fromIO, leftTask)

/**
 * @category constructors
 * @since 3.0.0
 */
export const fromIOEither: <E, A>(fa: IOEither<E, A>) => TaskThese<E, A> =
  /*#__PURE__*/
  T.fromIO

/**
 * @category constructors
 * @since 3.0.0
 */
export const fromEither: FromEither2<URI>['fromEither'] =
  /*#__PURE__*/
  E.fold(left, (a) => right(a))

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 3.0.0
 */
export const fold =
  /*#__PURE__*/
  fold_(T.Monad)

/**
 * @category destructors
 * @since 3.0.0
 */
export const toTuple =
  /*#__PURE__*/
  toTuple_(T.Functor)

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 3.0.0
 */
export const swap =
  /*#__PURE__*/
  swap_(T.Functor)

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 3.0.0
 */
export const map: Functor2<URI>['map'] =
  /*#__PURE__*/
  map_(T.Functor)

/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 3.0.0
 */
export const bimap: Bifunctor2<URI>['bimap'] =
  /*#__PURE__*/
  bimap_(T.Functor)

/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 3.0.0
 */
export const mapLeft: Bifunctor2<URI>['mapLeft'] =
  /*#__PURE__*/
  mapLeft_(T.Functor)

/**
 * Wrap a value into the type constructor.
 *
 * Equivalent to [`right`](#right).
 *
 * @category Applicative
 * @since 3.0.0
 */
export const of: Pointed2<URI>['of'] = right

/**
 * @category MonadIO
 * @since 3.0.0
 */
export const fromIO: FromIO2<URI>['fromIO'] = rightIO

/**
 * @category MonadIO
 * @since 3.0.0
 */
export const fromTask: FromTask2<URI>['fromTask'] = rightTask

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
export const URI = 'TaskThese'

/**
 * @category instances
 * @since 3.0.0
 */
export type URI = typeof URI

declare module './HKT' {
  interface URItoKind2<E, A> {
    readonly [URI]: TaskThese<E, A>
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export function getSemigroup<E, A>(SE: Semigroup<E>, SA: Semigroup<A>): Semigroup<TaskThese<E, A>> {
  return T.getSemigroup(TH.getSemigroup(SE, SA))
}

/**
 * @category instances
 * @since 3.0.0
 */
export function getApplicative<E>(A: Apply1<T.URI>, S: Semigroup<E>): Applicative2C<URI, E> {
  return {
    URI,
    map,
    ap: ap_(A, S),
    of
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export function getMonad<E>(S: Semigroup<E>): Monad2C<URI, E> {
  return {
    URI,
    map,
    of,
    chain: chain_(T.Monad, S)
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Functor: Functor2<URI> = {
  URI,
  map
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Pointed: Pointed2<URI> = {
  URI,
  map,
  of
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Bifunctor: Bifunctor2<URI> = {
  URI,
  bimap,
  mapLeft
}

/**
 * @category instances
 * @since 3.0.0
 */
export const FromEither: FromEither2<URI> = {
  URI,
  fromEither
}

/**
 * Derivable from `FromEither`.
 *
 * @category constructors
 * @since 3.0.0
 */
export const fromOption =
  /*#__PURE__*/
  fromOption_(FromEither)

/**
 * Derivable from `FromEither`.
 *
 * @category constructors
 * @since 3.0.0
 */
export const fromPredicate =
  /*#__PURE__*/
  fromPredicate_(FromEither)

/**
 * @category instances
 * @since 3.0.0
 */
export const FromIO: FromIO2<URI> = {
  URI,
  fromIO
}

/**
 * @category instances
 * @since 3.0.0
 */
export const FromTask: FromTask2<URI> = {
  URI,
  fromIO,
  fromTask
}
