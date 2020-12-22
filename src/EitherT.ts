/**
 * @since 3.0.0
 */
import { Apply, Apply1, Apply2 } from './Apply'
import * as E from './Either'
import { flow, Lazy } from './function'
import { Functor, Functor1, Functor2, map_ as map__ } from './Functor'
import { HKT, Kind, Kind2, URIS, URIS2 } from './HKT'
import { Monad, Monad1, Monad2 } from './Monad'
import { Pointed2, Pointed1, Pointed } from './Pointed'

import Either = E.Either

/**
 * @since 3.0.0
 */
export function right_<M extends URIS2>(M: Pointed2<M>): <A, FE, E = never>(a: A) => Kind2<M, FE, Either<E, A>>
export function right_<M extends URIS>(M: Pointed1<M>): <A, E = never>(a: A) => Kind<M, Either<E, A>>
export function right_<M>(M: Pointed<M>): <A, E = never>(a: A) => HKT<M, Either<E, A>>
export function right_<M>(M: Pointed<M>): <A, E = never>(a: A) => HKT<M, Either<E, A>> {
  return flow(E.right, M.of)
}

/**
 * @since 3.0.0
 */
export function left_<M extends URIS2>(M: Pointed2<M>): <E, FE, A = never>(e: E) => Kind2<M, FE, Either<E, A>>
export function left_<M extends URIS>(M: Pointed1<M>): <E, A = never>(e: E) => Kind<M, Either<E, A>>
export function left_<M>(M: Pointed<M>): <E, A = never>(e: E) => HKT<M, Either<E, A>>
export function left_<M>(M: Pointed<M>): <E, A = never>(e: E) => HKT<M, Either<E, A>> {
  return flow(E.left, M.of)
}

/**
 * @since 3.0.0
 */
export function rightF_<F extends URIS2>(
  F: Functor2<F>
): <FE, A, E = never>(fa: Kind2<F, FE, A>) => Kind2<F, FE, Either<E, A>>
export function rightF_<F extends URIS>(F: Functor1<F>): <A, E = never>(fa: Kind<F, A>) => Kind<F, Either<E, A>>
export function rightF_<F>(F: Functor<F>): <A, E = never>(fa: HKT<F, A>) => HKT<F, Either<E, A>>
export function rightF_<F>(F: Functor<F>): <A, E = never>(fa: HKT<F, A>) => HKT<F, Either<E, A>> {
  return F.map(E.right)
}

/**
 * @since 3.0.0
 */
export function leftF_<F extends URIS2>(
  F: Functor2<F>
): <FE, E, A = never>(fe: Kind2<F, FE, E>) => Kind2<F, FE, Either<E, A>>
export function leftF_<F extends URIS>(F: Functor1<F>): <E, A = never>(fe: Kind<F, E>) => Kind<F, Either<E, A>>
export function leftF_<F>(F: Functor<F>): <E, A = never>(fe: HKT<F, E>) => HKT<F, Either<E, A>>
export function leftF_<F>(F: Functor<F>): <E, A = never>(fe: HKT<F, E>) => HKT<F, Either<E, A>> {
  return F.map(E.left)
}

/**
 * @since 3.0.0
 */
export function map_<F extends URIS2>(
  F: Functor2<F>
): <A, B>(f: (a: A) => B) => <FE, E>(fa: Kind2<F, FE, Either<E, A>>) => Kind2<F, FE, Either<E, B>>
export function map_<F extends URIS>(
  F: Functor1<F>
): <A, B>(f: (a: A) => B) => <E>(fa: Kind<F, Either<E, A>>) => Kind<F, Either<E, B>>
export function map_<F>(F: Functor<F>): <A, B>(f: (a: A) => B) => <E>(fa: HKT<F, Either<E, A>>) => HKT<F, Either<E, B>>
export function map_<F>(
  F: Functor<F>
): <A, B>(f: (a: A) => B) => <E>(fa: HKT<F, Either<E, A>>) => HKT<F, Either<E, B>> {
  return map__(F, E.Functor)
}

/**
 * @since 3.0.0
 */
export function ap_<F extends URIS2>(
  F: Apply2<F>
): <FE, E, A>(
  fa: Kind2<F, FE, Either<E, A>>
) => <B>(fab: Kind2<F, FE, Either<E, (a: A) => B>>) => Kind2<F, FE, Either<E, B>>
export function ap_<F extends URIS>(
  F: Apply1<F>
): <E, A>(fa: Kind<F, Either<E, A>>) => <B>(fab: Kind<F, Either<E, (a: A) => B>>) => Kind<F, Either<E, B>>
export function ap_<F>(
  F: Apply<F>
): <E, A>(fa: HKT<F, Either<E, A>>) => <B>(fab: HKT<F, Either<E, (a: A) => B>>) => HKT<F, Either<E, B>>
export function ap_<F>(
  F: Apply<F>
): <E, A>(fa: HKT<F, Either<E, A>>) => <B>(fab: HKT<F, Either<E, (a: A) => B>>) => HKT<F, Either<E, B>> {
  return <E, A>(fa: HKT<F, Either<E, A>>): (<B>(fab: HKT<F, Either<E, (a: A) => B>>) => HKT<F, Either<E, B>>) =>
    flow(
      F.map((gab) => (ga: Either<E, A>) => E.ap(ga)(gab)),
      F.ap(fa)
    )
}

/**
 * @since 3.0.0
 */
export function chain_<M extends URIS2>(
  M: Monad2<M>
): <A, ME, E, B>(
  f: (a: A) => Kind2<M, ME, Either<E, B>>
) => (ma: Kind2<M, ME, Either<E, A>>) => Kind2<M, ME, Either<E, B>>
export function chain_<M extends URIS>(
  M: Monad1<M>
): <A, E, B>(f: (a: A) => Kind<M, Either<E, B>>) => (ma: Kind<M, Either<E, A>>) => Kind<M, Either<E, B>>
export function chain_<M>(
  M: Monad<M>
): <A, E, B>(f: (a: A) => HKT<M, Either<E, B>>) => (ma: HKT<M, Either<E, A>>) => HKT<M, Either<E, B>>
export function chain_<M>(
  M: Monad<M>
): <A, E, B>(f: (a: A) => HKT<M, Either<E, B>>) => (ma: HKT<M, Either<E, A>>) => HKT<M, Either<E, B>> {
  const left = left_(M)
  return (f) => M.chain(E.fold(left, f))
}

/**
 * @since 3.0.0
 */
export function alt_<M extends URIS2>(
  M: Monad2<M>
): <ME, E, A>(
  second: Lazy<Kind2<M, ME, Either<E, A>>>
) => (first: Kind2<M, ME, Either<E, A>>) => Kind2<M, ME, Either<E, A>>
export function alt_<M extends URIS>(
  M: Monad1<M>
): <E, A>(second: Lazy<Kind<M, Either<E, A>>>) => (first: Kind<M, Either<E, A>>) => Kind<M, Either<E, A>>
export function alt_<M>(
  M: Monad<M>
): <E, A>(second: Lazy<HKT<M, Either<E, A>>>) => (first: HKT<M, Either<E, A>>) => HKT<M, Either<E, A>>
export function alt_<M>(
  M: Monad<M>
): <E, A>(second: Lazy<HKT<M, Either<E, A>>>) => (first: HKT<M, Either<E, A>>) => HKT<M, Either<E, A>> {
  const right = right_(M)
  return (second) => M.chain((e) => (E.isLeft(e) ? second() : right(e.right)))
}

/**
 * @since 3.0.0
 */
export function bimap_<F extends URIS2>(
  F: Functor2<F>
): <E, G, A, B>(f: (e: E) => G, g: (a: A) => B) => <FE>(fea: Kind2<F, FE, Either<E, A>>) => Kind2<F, FE, Either<G, B>>
export function bimap_<F extends URIS>(
  F: Functor1<F>
): <E, G, A, B>(f: (e: E) => G, g: (a: A) => B) => (fea: Kind<F, Either<E, A>>) => Kind<F, Either<G, B>>
export function bimap_<F>(
  F: Functor<F>
): <E, G, A, B>(f: (e: E) => G, g: (a: A) => B) => (fea: HKT<F, Either<E, A>>) => HKT<F, Either<G, B>>
export function bimap_<F>(
  F: Functor<F>
): <E, G, A, B>(f: (e: E) => G, g: (a: A) => B) => (fea: HKT<F, Either<E, A>>) => HKT<F, Either<G, B>> {
  return flow(E.bimap, F.map)
}

/**
 * @since 3.0.0
 */
export function mapLeft_<F extends URIS2>(
  F: Functor2<F>
): <E, G>(f: (e: E) => G) => <FE, A>(fea: Kind2<F, FE, Either<E, A>>) => Kind2<F, FE, Either<G, A>>
export function mapLeft_<F extends URIS>(
  F: Functor1<F>
): <E, G>(f: (e: E) => G) => <A>(fea: Kind<F, Either<E, A>>) => Kind<F, Either<G, A>>
export function mapLeft_<F>(
  F: Functor<F>
): <E, G>(f: (e: E) => G) => <A>(fea: HKT<F, Either<E, A>>) => HKT<F, Either<G, A>>
export function mapLeft_<F>(
  F: Functor<F>
): <E, G>(f: (e: E) => G) => <A>(fea: HKT<F, Either<E, A>>) => HKT<F, Either<G, A>> {
  return (f) => F.map(E.mapLeft(f))
}

/**
 * @since 3.0.0
 */
export function fold_<M extends URIS2>(
  M: Monad2<M>
): <E, ME, R, A>(
  onLeft: (e: E) => Kind2<M, ME, R>,
  onRight: (a: A) => Kind2<M, ME, R>
) => (ma: Kind2<M, ME, Either<E, A>>) => Kind2<M, ME, R>
export function fold_<M extends URIS>(
  M: Monad1<M>
): <E, R, A>(onLeft: (e: E) => Kind<M, R>, onRight: (a: A) => Kind<M, R>) => (ma: Kind<M, Either<E, A>>) => Kind<M, R>
export function fold_<M>(
  M: Monad<M>
): <E, R, A>(onLeft: (e: E) => HKT<M, R>, onRight: (a: A) => HKT<M, R>) => (ma: HKT<M, Either<E, A>>) => HKT<M, R>
export function fold_<M>(
  M: Monad<M>
): <E, R, A>(onLeft: (e: E) => HKT<M, R>, onRight: (a: A) => HKT<M, R>) => (ma: HKT<M, Either<E, A>>) => HKT<M, R> {
  return (onLeft, onRight) => M.chain(E.fold(onLeft, onRight))
}

/**
 * @since 3.0.0
 */
export function getOrElse_<M extends URIS2>(
  M: Monad2<M>
): <E, ME, A>(onLeft: (e: E) => Kind2<M, ME, A>) => (ma: Kind2<M, ME, Either<E, A>>) => Kind2<M, ME, A>
export function getOrElse_<M extends URIS>(
  M: Monad1<M>
): <E, A>(onLeft: (e: E) => Kind<M, A>) => (ma: Kind<M, Either<E, A>>) => Kind<M, A>
export function getOrElse_<M>(
  M: Monad<M>
): <E, A>(onLeft: (e: E) => HKT<M, A>) => (ma: HKT<M, Either<E, A>>) => HKT<M, A>
export function getOrElse_<M>(
  M: Monad<M>
): <E, A>(onLeft: (e: E) => HKT<M, A>) => (ma: HKT<M, Either<E, A>>) => HKT<M, A> {
  return (onLeft) => M.chain(E.fold(onLeft, M.of))
}

/**
 * @since 3.0.0
 */
export function orElse_<M extends URIS2>(
  M: Monad2<M>
): <E1, ME, E2, A>(
  onLeft: (e: E1) => Kind2<M, ME, Either<E2, A>>
) => (ma: Kind2<M, ME, Either<E1, A>>) => Kind2<M, ME, Either<E2, A>>
export function orElse_<M extends URIS>(
  M: Monad1<M>
): <E1, E2, A>(onLeft: (e: E1) => Kind<M, Either<E2, A>>) => (ma: Kind<M, Either<E1, A>>) => Kind<M, Either<E2, A>>
export function orElse_<M>(
  M: Monad<M>
): <E1, E2, A>(onLeft: (e: E1) => HKT<M, Either<E2, A>>) => (ma: HKT<M, Either<E1, A>>) => HKT<M, Either<E2, A>>
export function orElse_<M>(
  M: Monad<M>
): <E1, E2, A>(onLeft: (e: E1) => HKT<M, Either<E2, A>>) => (ma: HKT<M, Either<E1, A>>) => HKT<M, Either<E2, A>> {
  const right = right_(M)
  return (onLeft) => M.chain(E.fold(onLeft, right))
}

/**
 * @since 3.0.0
 */
export function swap_<F extends URIS2>(
  F: Functor2<F>
): <FE, E, A>(ma: Kind2<F, FE, Either<E, A>>) => Kind2<F, FE, Either<A, E>>
export function swap_<F extends URIS>(F: Functor1<F>): <E, A>(ma: Kind<F, Either<E, A>>) => Kind<F, Either<A, E>>
export function swap_<F>(F: Functor<F>): <E, A>(ma: HKT<F, Either<E, A>>) => HKT<F, Either<A, E>>
export function swap_<F>(F: Functor<F>): <E, A>(ma: HKT<F, Either<E, A>>) => HKT<F, Either<A, E>> {
  return F.map(E.swap)
}
