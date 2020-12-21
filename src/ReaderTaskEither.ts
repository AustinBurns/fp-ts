/**
 * @since 3.0.0
 */
import { Alt3, Alt3C } from './Alt'
import { Applicative3, Applicative3C } from './Applicative'
import { apFirst_, Apply1, Apply3, apSecond_, apS_, apT_ } from './Apply'
import { Bifunctor3 } from './Bifunctor'
import * as E from './Either'
import {
  alt_,
  ap_,
  bimap_,
  chain_,
  fold_,
  getOrElse_,
  leftF_,
  left_,
  mapLeft_,
  map_,
  orElse_,
  rightF_,
  right_,
  swap_
} from './EitherT'
import { flow, identity, Lazy, pipe, Predicate, Refinement, tuple } from './function'
import { bindTo_, Functor3 } from './Functor'
import { IO } from './IO'
import { IOEither } from './IOEither'
import { bind_, chainFirst_, Monad3 } from './Monad'
import { MonadIO3 } from './MonadIO'
import { MonadTask3 } from './MonadTask'
import { MonadThrow3 } from './MonadThrow'
import { Monoid } from './Monoid'
import { Option } from './Option'
import { Pointed3 } from './Pointed'
import * as R from './Reader'
import { ReaderEither } from './ReaderEither'
import * as RT from './ReaderTask'
import { Semigroup } from './Semigroup'
import * as T from './Task'
import * as TE from './TaskEither'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

import Either = E.Either
import Task = T.Task
import TaskEither = TE.TaskEither
import Reader = R.Reader
import ReaderTask = RT.ReaderTask

/**
 * @category model
 * @since 3.0.0
 */
export interface ReaderTaskEither<R, E, A> {
  (r: R): TaskEither<E, A>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 3.0.0
 */
export const fromTaskEither: <R, E, A>(ma: TaskEither<E, A>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  R.of

/**
 * @category constructors
 * @since 3.0.0
 */
export const left: <E, R, A = never>(e: E) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  left_(RT.Pointed)

/**
 * @category constructors
 * @since 3.0.0
 */
export const right: <A, R, E = never>(a: A) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  right_(RT.Pointed)

/**
 * @category constructors
 * @since 3.0.0
 */
export const rightTask: <A, R, E = never>(ma: Task<A>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  flow(TE.rightTask, fromTaskEither)

/**
 * @category constructors
 * @since 3.0.0
 */
export const leftTask: <E, R, A = never>(me: Task<E>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  flow(TE.leftTask, fromTaskEither)

/**
 * @category constructors
 * @since 3.0.0
 */
export const rightReader: <R, A, E = never>(ma: Reader<R, A>) => ReaderTaskEither<R, E, A> = (ma) => flow(ma, TE.right)

/**
 * @category constructors
 * @since 3.0.0
 */
export const leftReader: <R, E, A = never>(me: Reader<R, E>) => ReaderTaskEither<R, E, A> = (me) => flow(me, TE.left)

/**
 * @category constructors
 * @since 3.0.0
 */
export const rightReaderTask: <R, A, E = never>(ma: ReaderTask<R, A>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  rightF_(RT.Functor)

/**
 * @category constructors
 * @since 3.0.0
 */
export const leftReaderTask: <R, E, A = never>(me: ReaderTask<R, E>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  leftF_(RT.Functor)

/**
 * @category constructors
 * @since 3.0.0
 */
export const fromIOEither: <E, A, R>(ma: IOEither<E, A>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  flow(TE.fromIOEither, fromTaskEither)

/**
 * @category constructors
 * @since 3.0.0
 */
export const fromReaderEither = <R, E, A>(ma: ReaderEither<R, E, A>): ReaderTaskEither<R, E, A> =>
  flow(ma, TE.fromEither)

/**
 * @category constructors
 * @since 3.0.0
 */
export const rightIO: <A, R, E = never>(ma: IO<A>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  flow(TE.rightIO, fromTaskEither)

/**
 * @category constructors
 * @since 3.0.0
 */
export const leftIO: <E, R, A = never>(me: IO<E>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  flow(TE.leftIO, fromTaskEither)

/**
 * @category constructors
 * @since 3.0.0
 */
export const ask: <R, E = never>() => ReaderTaskEither<R, E, R> = () => TE.right

/**
 * @category constructors
 * @since 3.0.0
 */
export const asks: <R, A, E = never>(f: (r: R) => A) => ReaderTaskEither<R, E, A> = (f) => flow(TE.right, TE.map(f))

/**
 * Derivable from `MonadThrow`.
 *
 * @category constructors
 * @since 3.0.0
 */
export const fromEither: <E, A, R>(ma: Either<E, A>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  E.fold(left, (a) => right(a))

/**
 * Derivable from `MonadThrow`.
 *
 * @category constructors
 * @since 3.0.0
 */
export const fromOption: <E>(onNone: Lazy<E>) => <R, A>(ma: Option<A>) => ReaderTaskEither<R, E, A> = (onNone) => (
  ma
) => (ma._tag === 'None' ? left(onNone()) : right(ma.value))

/**
 * Derivable from `MonadThrow`.
 *
 * @category constructors
 * @since 3.0.0
 */
export const fromPredicate: {
  <A, B extends A, E>(refinement: Refinement<A, B>, onFalse: (a: A) => E): <U>(a: A) => ReaderTaskEither<U, E, B>
  <A, E>(predicate: Predicate<A>, onFalse: (a: A) => E): <R>(a: A) => ReaderTaskEither<R, E, A>
} = <A, E>(predicate: Predicate<A>, onFalse: (a: A) => E) => (a: A) => (predicate(a) ? right(a) : left(onFalse(a)))

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 3.0.0
 */
export const fold: <E, R, B, A>(
  onLeft: (e: E) => ReaderTask<R, B>,
  onRight: (a: A) => ReaderTask<R, B>
) => (ma: ReaderTaskEither<R, E, A>) => ReaderTask<R, B> =
  /*#__PURE__*/
  fold_(RT.Monad)

/**
 * @category destructors
 * @since 3.0.0
 */
export const getOrElse: <E, R, A>(
  onLeft: (e: E) => ReaderTask<R, A>
) => (ma: ReaderTaskEither<R, E, A>) => ReaderTask<R, A> =
  /*#__PURE__*/
  getOrElse_(RT.Monad)

/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 3.0.0
 */
export const getOrElseW: <E, R2, B>(
  onLeft: (e: E) => ReaderTask<R2, B>
) => <R1, A>(ma: ReaderTaskEither<R1, E, A>) => ReaderTask<R1 & R2, A | B> = getOrElse as any

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 3.0.0
 */
export const orElse: <E1, R, E2, A>(
  onLeft: (e: E1) => ReaderTaskEither<R, E2, A>
) => (ma: ReaderTaskEither<R, E1, A>) => ReaderTaskEither<R, E2, A> =
  /*#__PURE__*/
  orElse_(RT.Monad)

/**
 * @category combinators
 * @since 3.0.0
 */
export const swap: <R, E, A>(ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, A, E> =
  /*#__PURE__*/
  swap_(RT.Functor)

/**
 * Less strict version of [`filterOrElse`](#filterOrElse).
 *
 * @since 3.0.0
 */
export const filterOrElseW: {
  <A, B extends A, E2>(refinement: Refinement<A, B>, onFalse: (a: A) => E2): <R, E1>(
    ma: ReaderTaskEither<R, E1, A>
  ) => ReaderTaskEither<R, E1 | E2, B>
  <A, E2>(predicate: Predicate<A>, onFalse: (a: A) => E2): <R, E1>(
    ma: ReaderTaskEither<R, E1, A>
  ) => ReaderTaskEither<R, E1 | E2, A>
} = <A, E2>(
  predicate: Predicate<A>,
  onFalse: (a: A) => E2
): (<R, E1>(ma: ReaderTaskEither<R, E1, A>) => ReaderTaskEither<R, E1 | E2, A>) =>
  chainW((a) => (predicate(a) ? right(a) : left(onFalse(a))))

/**
 * Derivable from `MonadThrow`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const filterOrElse: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): <R>(
    ma: ReaderTaskEither<R, E, A>
  ) => ReaderTaskEither<R, E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): <R>(ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, A>
} = filterOrElseW

/**
 * @category combinators
 * @since 3.0.0
 */
export function fromEitherK<E, A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => Either<E, B>
): <R>(...a: A) => ReaderTaskEither<R, E, B> {
  return (...a) => fromEither(f(...a))
}

/**
 * Less strict version of [`chainEitherK`](#chainEitherK).
 *
 * @category combinators
 * @since 3.0.0
 */
export const chainEitherKW: <A, E2, B>(
  f: (a: A) => Either<E2, B>
) => <R, E1>(ma: ReaderTaskEither<R, E1, A>) => ReaderTaskEither<R, E1 | E2, B> = (f) => chainW(fromEitherK(f))

/**
 * @category combinators
 * @since 3.0.0
 */
export const chainEitherK: <E, A, B>(
  f: (a: A) => Either<E, B>
) => <R>(ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B> = chainEitherKW

/**
 * @category combinators
 * @since 3.0.0
 */
export function fromIOEitherK<E, A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => IOEither<E, B>
): <R>(...a: A) => ReaderTaskEither<R, E, B> {
  return (...a) => fromIOEither(f(...a))
}

/**
 * Less strict version of [`chainIOEitherK`](#chainIOEitherK).
 *
 * @category combinators
 * @since 3.0.0
 */
export const chainIOEitherKW: <A, E2, B>(
  f: (a: A) => IOEither<E2, B>
) => <R, E1>(ma: ReaderTaskEither<R, E1, A>) => ReaderTaskEither<R, E1 | E2, B> = (f) => chainW(fromIOEitherK(f))

/**
 * @category combinators
 * @since 3.0.0
 */
export const chainIOEitherK: <E, A, B>(
  f: (a: A) => IOEither<E, B>
) => <R>(ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B> = chainIOEitherKW

/**
 * @category combinators
 * @since 3.0.0
 */
export function fromTaskEitherK<E, A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => TaskEither<E, B>
): <R>(...a: A) => ReaderTaskEither<R, E, B> {
  return (...a) => fromTaskEither(f(...a))
}

/**
 * Less strict version of [`chainTaskEitherK`](#chainTaskEitherK).
 *
 * @category combinators
 * @since 3.0.0
 */
export const chainTaskEitherKW: <A, E2, B>(
  f: (a: A) => TaskEither<E2, B>
) => <R, E1>(ma: ReaderTaskEither<R, E1, A>) => ReaderTaskEither<R, E1 | E2, B> = (f) => chainW(fromTaskEitherK(f))

/**
 * @category combinators
 * @since 3.0.0
 */
export const chainTaskEitherK: <E, A, B>(
  f: (a: A) => TaskEither<E, B>
) => <R>(ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B> = chainTaskEitherKW

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 3.0.0
 */
export const map: Functor3<URI>['map'] =
  /*#__PURE__*/
  map_(RT.Functor)

/**
 * Map a pair of functions over the two last type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 3.0.0
 */
export const bimap: Bifunctor3<URI>['bimap'] =
  /*#__PURE__*/
  bimap_(RT.Functor)

/**
 * Map a function over the second type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 3.0.0
 */
export const mapLeft: Bifunctor3<URI>['mapLeft'] =
  /*#__PURE__*/
  mapLeft_(RT.Functor)

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 3.0.0
 */
export const ap: Apply3<URI>['ap'] =
  /*#__PURE__*/
  ap_(RT.ApplicativePar)

/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 3.0.0
 */
export const apW: <R2, E2, A>(
  fa: ReaderTaskEither<R2, E2, A>
) => <R1, E1, B>(fab: ReaderTaskEither<R1, E1, (a: A) => B>) => ReaderTaskEither<R1 & R2, E1 | E2, B> = ap as any

/**
 * Wrap a value into the type constructor.
 *
 * Equivalent to [`right`](#right).
 *
 * @category Applicative
 * @since 3.0.0
 */
export const of: Applicative3<URI>['of'] = right

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 3.0.0
 */
export const chain: Monad3<URI>['chain'] =
  /*#__PURE__*/
  chain_(RT.Monad)

/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 3.0.0
 */
export const chainW: <A, R2, E2, B>(
  f: (a: A) => ReaderTaskEither<R2, E2, B>
) => <R1, E1>(ma: ReaderTaskEither<R1, E1, A>) => ReaderTaskEither<R1 & R2, E1 | E2, B> = chain as any

/**
 * Derivable from `Monad`.
 *
 * @category derivable combinators
 * @since 3.0.0
 */
export const flatten: <R, E, A>(mma: ReaderTaskEither<R, E, ReaderTaskEither<R, E, A>>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  chain(identity)

/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 3.0.0
 */
export const alt: Alt3<URI>['alt'] =
  /*#__PURE__*/
  alt_(RT.Monad)

/**
 * Less strict version of [`alt`](#alt).
 *
 * @category Alt
 * @since 3.0.0
 */
export const altW: <R2, E2, B>(
  second: () => ReaderTaskEither<R2, E2, B>
) => <R1, E1, A>(first: ReaderTaskEither<R1, E1, A>) => ReaderTaskEither<R1 & R2, E1 | E2, A | B> = alt as any

/**
 * @category MonadIO
 * @since 3.0.0
 */
export const fromIO: MonadIO3<URI>['fromIO'] = rightIO

/**
 * @category MonadTask
 * @since 3.0.0
 */
export const fromTask: MonadTask3<URI>['fromTask'] = rightTask

/**
 * @category MonadThrow
 * @since 3.0.0
 */
export const throwError: MonadThrow3<URI>['throwError'] = left

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
export const URI = 'ReaderTaskEither'

/**
 * @category instances
 * @since 3.0.0
 */
export type URI = typeof URI

declare module './HKT' {
  interface URItoKind3<R, E, A> {
    readonly [URI]: ReaderTaskEither<R, E, A>
  }
}

/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 3.0.0
 */
export function getSemigroup<R, E, A>(S: Semigroup<A>): Semigroup<ReaderTaskEither<R, E, A>> {
  return R.getSemigroup(TE.getSemigroup(S))
}

/**
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 3.0.0
 */
export function getApplySemigroup<R, E, A>(S: Semigroup<A>): Semigroup<ReaderTaskEither<R, E, A>> {
  return R.getSemigroup(TE.getApplySemigroup(S))
}

/**
 * @category instances
 * @since 3.0.0
 */
export function getApplyMonoid<R, E, A>(M: Monoid<A>): Monoid<ReaderTaskEither<R, E, A>> {
  return {
    concat: getApplySemigroup<R, E, A>(M).concat,
    empty: right(M.empty)
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export function getApplicativeReaderTaskValidation<E>(A: Apply1<T.URI>, SE: Semigroup<E>): Applicative3C<URI, E> {
  const AV = TE.getApplicativeTaskValidation(A, SE)
  const ap = <EF, A>(
    fga: R.Reader<EF, TE.TaskEither<E, A>>
  ): (<B>(fgab: R.Reader<EF, TE.TaskEither<E, (a: A) => B>>) => R.Reader<EF, TE.TaskEither<E, B>>) =>
    flow(
      R.map((gab) => (ga: TE.TaskEither<E, A>) => pipe(gab, AV.ap(ga))),
      R.ap(fga)
    )
  return {
    URI,
    map,
    ap,
    of
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export function getAltReaderTaskValidation<E>(SE: Semigroup<E>): Alt3C<URI, E> {
  const A = TE.getAltTaskValidation(SE)
  return {
    URI,
    map,
    alt: (second) => (first) => (r) =>
      pipe(
        first(r),
        A.alt(() => second()(r))
      )
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Functor: Functor3<URI> = {
  URI,
  map
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Pointed: Pointed3<URI> = {
  URI,
  map,
  of
}

/**
 * @category instances
 * @since 3.0.0
 */
export const ApplicativePar: Applicative3<URI> = {
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
export const apFirst: <R, E, B>(
  second: ReaderTaskEither<R, E, B>
) => <A>(first: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  apFirst_(ApplicativePar)

/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * Derivable from `Apply`.
 *
 * @category derivable combinators
 * @since 3.0.0
 */
export const apSecond: <R, E, B>(
  second: ReaderTaskEither<R, E, B>
) => <A>(first: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B> =
  /*#__PURE__*/
  apSecond_(ApplicativePar)

/**
 * @category instances
 * @since 3.0.0
 */
export const ApplicativeSeq: Applicative3<URI> = {
  URI,
  map,
  ap: (fa) => chain((f) => pipe(fa, map(f))),
  of
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Monad: Monad3<URI> = {
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
export const chainFirst: <A, R, E, B>(
  f: (a: A) => ReaderTaskEither<R, E, B>
) => (first: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  chainFirst_(Monad)

/**
 * Less strict version of [`chainFirst`](#chainFirst).
 *
 * @category combinators
 * @since 3.0.0
 */
export const chainFirstW: <A, R2, E2, B>(
  f: (a: A) => ReaderTaskEither<R2, E2, B>
) => <R1, E1>(first: ReaderTaskEither<R1, E1, A>) => ReaderTaskEither<R1 & R2, E1 | E2, A> = chainFirst as any

/**
 * @category instances
 * @since 3.0.0
 */
export const MonadTask: MonadTask3<URI> = {
  URI,
  fromIO,
  fromTask
}

/**
 * @category instances
 * @since 3.0.0
 */
export const MonadThrow: MonadThrow3<URI> = {
  URI,
  throwError
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Bifunctor: Bifunctor3<URI> = {
  URI,
  bimap,
  mapLeft
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Alt: Alt3<URI> = {
  URI,
  map,
  alt
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * Make sure that a resource is cleaned up in the event of an exception (\*). The release action is called regardless of
 * whether the body action throws (\*) or returns.
 *
 * (\*) i.e. returns a `Left`
 *
 * Derivable from `MonadThrow`.
 *
 * @since 3.0.0
 */
export function bracket<R, E, A, B>(
  aquire: ReaderTaskEither<R, E, A>,
  use: (a: A) => ReaderTaskEither<R, E, B>,
  release: (a: A, e: Either<E, B>) => ReaderTaskEither<R, E, void>
): ReaderTaskEither<R, E, B> {
  return (r) =>
    TE.bracket(
      aquire(r),
      (a) => use(a)(r),
      (a, e) => release(a, e)(r)
    )
}

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const Do: ReaderTaskEither<unknown, never, {}> = of({})

/**
 * @since 3.0.0
 */
export const bindTo: <N extends string>(
  name: N
) => <R, E, A>(fa: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, { [K in N]: A }> =
  /*#__PURE__*/
  bindTo_(Functor)

/**
 * @since 3.0.0
 */
export const bind: <N extends string, A, R, E, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => ReaderTaskEither<R, E, B>
) => (fa: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, { [K in keyof A | N]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/
  bind_(Monad)

/**
 * Less strict version of [`bind`](#bind).
 *
 * @since 3.0.0
 */
export const bindW: <N extends string, A, R2, E2, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => ReaderTaskEither<R2, E2, B>
) => <R1, E1>(
  fa: ReaderTaskEither<R1, E1, A>
) => ReaderTaskEither<R1 & R2, E1 | E2, { [K in keyof A | N]: K extends keyof A ? A[K] : B }> = bind as any

// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const apS: <A, N extends string, R, E, B>(
  name: Exclude<N, keyof A>,
  fb: ReaderTaskEither<R, E, B>
) => (fa: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, { [K in keyof A | N]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/
  apS_(ApplicativePar)

/**
 * Less strict version of [`apS`](#apS).
 *
 * @since 3.0.0
 */
export const apSW: <A, N extends string, R2, E2, B>(
  name: Exclude<N, keyof A>,
  fb: ReaderTaskEither<R2, E2, B>
) => <R1, E1>(
  fa: ReaderTaskEither<R1, E1, A>
) => ReaderTaskEither<R1 & R2, E1 | E2, { [K in keyof A | N]: K extends keyof A ? A[K] : B }> = apS as any

// -------------------------------------------------------------------------------------
// pipeable sequence T
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const ApT: ReaderTaskEither<unknown, never, readonly []> = of([])

/**
 * @since 3.0.0
 */
export const tupled: <R, E, A>(a: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, readonly [A]> = map(tuple)

/**
 * @since 3.0.0
 */
export const apT: <R, E, B>(
  fb: ReaderTaskEither<R, E, B>
) => <A extends ReadonlyArray<unknown>>(fas: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, readonly [...A, B]> =
  /*#__PURE__*/
  apT_(ApplicativePar)

/**
 * Less strict version of [`apT`](#apT).
 *
 * @since 3.0.0
 */
export const apTW: <R2, E2, B>(
  fb: ReaderTaskEither<R2, E2, B>
) => <R1, E1, A extends ReadonlyArray<unknown>>(
  fas: ReaderTaskEither<R1, E1, A>
) => ReaderTaskEither<R1 & R2, E1 | E2, readonly [...A, B]> = apT as any

// -------------------------------------------------------------------------------------
// array utils
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const traverseArrayWithIndex: <R, E, A, B>(
  f: (index: number, a: A) => ReaderTaskEither<R, E, B>
) => (arr: ReadonlyArray<A>) => ReaderTaskEither<R, E, ReadonlyArray<B>> = (f) => (arr) => (r) => () =>
  Promise.all(arr.map((x, i) => f(i, x)(r)())).then(E.sequenceArray)

/**
 * @since 3.0.0
 */
export const traverseArray: <R, E, A, B>(
  f: (a: A) => ReaderTaskEither<R, E, B>
) => (arr: ReadonlyArray<A>) => ReaderTaskEither<R, E, ReadonlyArray<B>> = (f) => traverseArrayWithIndex((_, a) => f(a))

/**
 * @since 3.0.0
 */
export const sequenceArray: <R, E, A>(
  arr: ReadonlyArray<ReaderTaskEither<R, E, A>>
) => ReaderTaskEither<R, E, ReadonlyArray<A>> = traverseArray(identity)

/**
 * @since 3.0.0
 */
export const traverseSeqArrayWithIndex: <R, E, A, B>(
  f: (index: number, a: A) => ReaderTaskEither<R, E, B>
) => (arr: ReadonlyArray<A>) => ReaderTaskEither<R, E, ReadonlyArray<B>> = (f) => (arr) => (r) => async () => {
  // tslint:disable-next-line: readonly-array
  const out = []
  for (let i = 0; i < arr.length; i++) {
    const b = await f(i, arr[i])(r)()
    if (E.isLeft(b)) {
      return b
    }
    out.push(b.right)
  }

  return E.right(out)
}

/**
 * @since 3.0.0
 */
export const traverseSeqArray: <R, E, A, B>(
  f: (a: A) => ReaderTaskEither<R, E, B>
) => (arr: ReadonlyArray<A>) => ReaderTaskEither<R, E, ReadonlyArray<B>> = (f) =>
  traverseSeqArrayWithIndex((_, a) => f(a))

/**
 * @since 3.0.0
 */
export const sequenceSeqArray: <R, E, A>(
  arr: ReadonlyArray<ReaderTaskEither<R, E, A>>
) => ReaderTaskEither<R, E, ReadonlyArray<A>> = traverseSeqArray(identity)
