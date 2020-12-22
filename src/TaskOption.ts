/**
 * @since 3.0.0
 */
import * as T from './Task'
import * as O from './Option'

import Task = T.Task
import Option = O.Option
import { Functor1 } from './Functor'
import * as OT from './OptionT'
import { Pointed1 } from './Pointed'
import { identity, Lazy, pipe } from './function'
import { apFirst_, Apply1, apSecond_ } from './Apply'
import { Applicative1 } from './Applicative'
import { chainFirst_, Monad1 } from './Monad'
import { Alt1 } from './Alt'
import { Alternative1 } from './Alternative'
import { FromTask1 } from './FromTask'
import { IO } from './IO'
import { FromIO1 } from './FromIO'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 3.0.0
 */
export interface TaskOption<A> extends Task<Option<A>> {}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const some: <A>(a: A) => TaskOption<A> =
  /*#__PURE__*/
  OT.some_(T.Pointed)

/**
 * @since 3.0.0
 */
export const of: Pointed1<URI>['of'] = some

/**
 * @since 3.0.0
 */
export const none: TaskOption<never> =
  /*#__PURE__*/
  OT.none_(T.Pointed)

/**
 * @since 3.0.0
 */
export const fromOption: <A>(ma: Option<A>) => TaskOption<A> = T.of

/**
 * @since 3.0.0
 */
export const fromIO = <A>(ma: IO<A>): TaskOption<A> => fromTask(T.fromIO(ma))

/**
 * @since 3.0.0
 */
export const fromTask =
  /*#__PURE__*/
  OT.fromF_(T.Functor)

/**
 * @since 3.0.0
 */
export const fromNullable =
  /*#__PURE__*/
  OT.fromNullable_(T.Pointed)

/**
 * @since 3.0.0
 */
export const fromPredicate =
  /*#__PURE__*/
  OT.fromPredicate_(T.Functor)

/**
 * @since 3.0.0
 */
export const fromEither =
  /*#__PURE__*/
  OT.fromEither_(T.Pointed)

/**
 * @category constructors
 * @since 3.0.0
 */
export const tryCatch: <A>(f: Lazy<Promise<A>>) => TaskOption<A> = (f) => () =>
  f().then(
    (a) => O.some(a),
    () => O.none
  )

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 3.0.0
 */
export const map: Functor1<URI>['map'] =
  /*#__PURE__*/
  OT.map_(T.Functor)

/**
 * @category Apply
 * @since 3.0.0
 */
export const ap: Apply1<URI>['ap'] =
  /*#__PURE__*/
  OT.ap_(T.ApplicativePar)

/**
 * @category Monad
 * @since 3.0.0
 */
export const chain: Monad1<URI>['chain'] =
  /*#__PURE__*/
  OT.chain_(T.Monad)

/**
 * Derivable from `Monad`.
 *
 * @category derivable combinators
 * @since 3.0.0
 */
export const flatten: <A>(mma: TaskOption<TaskOption<A>>) => TaskOption<A> =
  /*#__PURE__*/
  chain(identity)

/**
 * @category Alt
 * @since 3.0.0
 */
export const alt: Alt1<URI>['alt'] =
  /*#__PURE__*/
  OT.alt_(T.Monad)

/**
 * Less strict version of [`alt`](#alt).
 *
 * @category Alt
 * @since 3.0.0
 */
export const altW: <B>(second: Lazy<TaskOption<B>>) => <A>(first: TaskOption<A>) => TaskOption<A | B> = alt as any

/**
 * @category Alternative
 * @since 3.0.0
 */
export const zero: Alternative1<URI>['zero'] = () => none

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 3.0.0
 */
export const fold =
  /*#__PURE__*/
  OT.fold_(T.Monad)

/**
 * @category destructors
 * @since 3.0.0
 */
export const getOrElse =
  /*#__PURE__*/
  OT.getOrElse_(T.Monad)

/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 3.0.0
 */
export const getOrElseW: <B>(onNone: Lazy<Task<B>>) => <A>(ma: Option<A>) => A | B = getOrElse as any

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 0.1.10
 */
export const fromOptionK: <A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => O.Option<B>
) => (...a: A) => TaskOption<B> = (f) => (...a) => fromOption(f(...a))

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
const URI = 'TaskOption'

/**
 * @category instances
 * @since 3.0.0
 */
export type URI = typeof URI

declare module './HKT' {
  interface URItoKind<A> {
    readonly [URI]: TaskOption<A>
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Funtor: Functor1<URI> = {
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
export const ApplicativePar: Applicative1<URI> = {
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
export const apFirst =
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
export const apSecond =
  /*#__PURE__*/
  apSecond_(ApplicativePar)

/**
 * @category instances
 * @since 3.0.0
 */
export const ApplicativeSeq: Applicative1<URI> = {
  URI,
  map,
  ap: (fa) => chain((f) => pipe(fa, map(f))),
  of
}

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
export const chainFirst =
  /*#__PURE__*/
  chainFirst_(Monad)

/**
 * @category instances
 * @since 3.0.0
 */
export const Alt: Alt1<URI> = {
  URI,
  map,
  alt
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Alternative: Alternative1<URI> = {
  URI,
  map,
  alt,
  zero
}

/**
 * @category instances
 * @since 3.0.0
 */
export const FromIO: FromIO1<URI> = {
  URI,
  fromIO
}

/**
 * @category instances
 * @since 3.0.0
 */
export const FromTask: FromTask1<URI> = {
  URI,
  fromIO,
  fromTask
}
