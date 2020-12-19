/**
 * @since 3.0.0
 */

import { Endomorphism, flow, pipe } from './function'
import { Functor, Functor1, Functor2, Functor3 } from './Functor'
import { HKT, Kind, Kind2, Kind3, URIS, URIS2, URIS3 } from './HKT'
import { Monad, Monad1, Monad2, Monad3 } from './Monad'
import { State } from './State'

/**
 * @since 3.0.0
 */
export interface StateT<M, S, A> {
  (s: S): HKT<M, readonly [A, S]>
}

/**
 * @since 3.0.0
 */
export interface StateT1<M extends URIS, S, A> {
  (s: S): Kind<M, readonly [A, S]>
}

/**
 * @since 3.0.0
 */
export interface StateT2<M extends URIS2, S, E, A> {
  (s: S): Kind2<M, E, readonly [A, S]>
}

/**
 * @since 3.0.0
 */
export interface StateT3<M extends URIS3, S, R, E, A> {
  (s: S): Kind3<M, R, E, readonly [A, S]>
}

/**
 * @since 3.0.0
 */
export function of_<M extends URIS3>(M: Monad3<M>): <A, S, R, E>(a: A) => StateT3<M, S, R, E, A>
export function of_<M extends URIS2>(M: Monad2<M>): <A, S, E>(a: A) => StateT2<M, S, E, A>
export function of_<M extends URIS>(M: Monad1<M>): <A, S>(a: A) => StateT1<M, S, A>
export function of_<M>(M: Monad<M>): <A, S>(a: A) => StateT<M, S, A>
export function of_<M>(M: Monad<M>): <A, S>(a: A) => StateT<M, S, A> {
  return (a) => (s) => M.of([a, s])
}

/**
 * @since 3.0.0
 */
export function map_<F extends URIS3>(
  F: Functor3<F>
): <A, B>(f: (a: A) => B) => <S, R, E>(fa: StateT3<F, S, R, E, A>) => StateT3<F, S, R, E, B>
export function map_<F extends URIS2>(
  F: Functor2<F>
): <A, B>(f: (a: A) => B) => <S, E>(fa: StateT2<F, S, E, A>) => StateT2<F, S, E, B>
export function map_<F extends URIS>(
  F: Functor1<F>
): <A, B>(f: (a: A) => B) => <S>(fa: StateT1<F, S, A>) => StateT1<F, S, B>
export function map_<F>(F: Functor<F>): <A, B>(f: (a: A) => B) => <S>(fa: StateT<F, S, A>) => StateT<F, S, B>
export function map_<F>(F: Functor<F>): <A, B>(f: (a: A) => B) => <S>(fa: StateT<F, S, A>) => StateT<F, S, B> {
  return (f) => (fa) =>
    flow(
      fa,
      F.map(([a, s1]) => [f(a), s1])
    )
}

/**
 * @since 3.0.0
 */
export function ap_<M extends URIS3>(
  M: Monad3<M>
): <S, R, E, A>(fa: StateT3<M, S, R, E, A>) => <B>(fab: StateT3<M, S, R, E, (a: A) => B>) => StateT3<M, S, R, E, B>
export function ap_<M extends URIS2>(
  M: Monad2<M>
): <S, E, A>(fa: StateT2<M, S, E, A>) => <B>(fab: StateT2<M, S, E, (a: A) => B>) => StateT2<M, S, E, B>
export function ap_<M extends URIS>(
  M: Monad1<M>
): <S, A>(fa: StateT1<M, S, A>) => <B>(fab: StateT1<M, S, (a: A) => B>) => StateT1<M, S, B>
export function ap_<M>(
  M: Monad<M>
): <S, A>(fa: StateT<M, S, A>) => <B>(fab: StateT<M, S, (a: A) => B>) => StateT<M, S, B>
export function ap_<M>(
  M: Monad<M>
): <S, A>(fa: StateT<M, S, A>) => <B>(fab: StateT<M, S, (a: A) => B>) => StateT<M, S, B> {
  return (fa) => (fab) => (s) =>
    pipe(
      fab(s),
      M.chain(([f, s]) =>
        pipe(
          fa(s),
          M.map(([a, s]) => [f(a), s])
        )
      )
    )
}

/**
 * @since 3.0.0
 */
export function chain_<M extends URIS3>(
  M: Monad3<M>
): <A, S, R, E, B>(f: (a: A) => StateT3<M, S, R, E, B>) => (ma: StateT3<M, S, R, E, A>) => StateT3<M, S, R, E, B>
export function chain_<M extends URIS2>(
  M: Monad2<M>
): <A, S, E, B>(f: (a: A) => StateT2<M, S, E, B>) => (ma: StateT2<M, S, E, A>) => StateT2<M, S, E, B>
export function chain_<M extends URIS>(
  M: Monad1<M>
): <A, S, B>(f: (a: A) => StateT1<M, S, B>) => (ma: StateT1<M, S, A>) => StateT1<M, S, B>
export function chain_<M>(
  M: Monad<M>
): <A, S, B>(f: (a: A) => StateT<M, S, B>) => (ma: StateT<M, S, A>) => StateT<M, S, B>
export function chain_<M>(
  M: Monad<M>
): <A, S, B>(f: (a: A) => StateT<M, S, B>) => (ma: StateT<M, S, A>) => StateT<M, S, B> {
  return (f) => (ma) => (s) =>
    pipe(
      ma(s),
      M.chain(([a, s1]) => f(a)(s1))
    )
}

/**
 * @since 3.0.0
 */
export function get_<M extends URIS3>(M: Monad3<M>): <S, R, E>() => StateT3<M, S, R, E, S>
export function get_<M extends URIS2>(M: Monad2<M>): <S, E>() => StateT2<M, S, E, S>
export function get_<M extends URIS>(M: Monad1<M>): <S>() => StateT1<M, S, S>
export function get_<M>(M: Monad<M>): <S>() => StateT<M, S, S>
export function get_<M>(M: Monad<M>): <S>() => StateT<M, S, S> {
  return () => (s) => M.of([s, s])
}

/**
 * @since 3.0.0
 */
export function put_<M extends URIS3>(M: Monad3<M>): <S, R, E>(s: S) => StateT3<M, S, R, E, void>
export function put_<M extends URIS2>(M: Monad2<M>): <S, E>(s: S) => StateT2<M, S, E, void>
export function put_<M extends URIS>(M: Monad1<M>): <S>(s: S) => StateT1<M, S, void>
export function put_<M>(M: Monad<M>): <S>(s: S) => StateT<M, S, void>
export function put_<M>(M: Monad<M>): <S>(s: S) => StateT<M, S, void> {
  return (s) => () => M.of([undefined, s])
}

/**
 * @since 3.0.0
 */
export function modify_<M extends URIS3>(M: Monad3<M>): <S, R, E>(f: Endomorphism<S>) => StateT3<M, S, R, E, void>
export function modify_<M extends URIS2>(M: Monad2<M>): <S, E>(f: Endomorphism<S>) => StateT2<M, S, E, void>
export function modify_<M extends URIS>(M: Monad1<M>): <S>(f: Endomorphism<S>) => StateT1<M, S, void>
export function modify_<M>(M: Monad<M>): <S>(f: Endomorphism<S>) => StateT<M, S, void>
export function modify_<M>(M: Monad<M>): <S>(f: Endomorphism<S>) => StateT<M, S, void> {
  return (f) => (s) => M.of([undefined, f(s)])
}

/**
 * @since 3.0.0
 */
export function gets_<M extends URIS3>(M: Monad3<M>): <S, A, R, E>(f: (s: S) => A) => StateT3<M, S, R, E, A>
export function gets_<M extends URIS2>(M: Monad2<M>): <S, A, E>(f: (s: S) => A) => StateT2<M, S, E, A>
export function gets_<M extends URIS>(M: Monad1<M>): <S, A>(f: (s: S) => A) => StateT1<M, S, A>
export function gets_<M>(M: Monad<M>): <S, A>(f: (s: S) => A) => StateT<M, S, A>
export function gets_<M>(M: Monad<M>): <S, A>(f: (s: S) => A) => StateT<M, S, A> {
  return (f) => (s) => M.of([f(s), s])
}

/**
 * @since 3.0.0
 */
export function fromState_<M extends URIS3>(M: Monad3<M>): <S, A, R, E>(sa: State<S, A>) => StateT3<M, S, R, E, A>
export function fromState_<M extends URIS2>(M: Monad2<M>): <S, A, E>(sa: State<S, A>) => StateT2<M, S, E, A>
export function fromState_<M extends URIS>(M: Monad1<M>): <S, A>(sa: State<S, A>) => StateT1<M, S, A>
export function fromState_<M>(M: Monad<M>): <S, A>(sa: State<S, A>) => StateT<M, S, A>
export function fromState_<M>(M: Monad<M>): <S, A>(sa: State<S, A>) => StateT<M, S, A> {
  return (sa) => (s) => M.of(sa(s))
}

/**
 * @since 3.0.0
 */
export function fromF_<F extends URIS3>(F: Functor3<F>): <R, E, A, S>(ma: Kind3<F, R, E, A>) => StateT3<F, S, R, E, A>
export function fromF_<F extends URIS2>(F: Functor2<F>): <E, A, S>(ma: Kind2<F, E, A>) => StateT2<F, S, E, A>
export function fromF_<F extends URIS>(F: Functor1<F>): <A, S>(ma: Kind<F, A>) => StateT<F, S, A>
export function fromF_<F>(F: Functor<F>): <A, S>(ma: HKT<F, A>) => StateT<F, S, A>
export function fromF_<F>(F: Functor<F>): <A, S>(ma: HKT<F, A>) => StateT<F, S, A> {
  return (ma) => (s) =>
    pipe(
      ma,
      F.map((a) => [a, s])
    )
}

/**
 * @since 3.0.0
 */
export function evaluate_<F extends URIS3>(
  F: Functor3<F>
): <S>(s: S) => <R, E, A>(ma: StateT3<F, S, R, E, A>) => Kind3<F, R, E, A>
export function evaluate_<F extends URIS2>(
  F: Functor2<F>
): <S>(s: S) => <E, A>(ma: StateT2<F, S, E, A>) => Kind2<F, E, A>
export function evaluate_<F extends URIS>(F: Functor1<F>): <S>(s: S) => <A>(ma: StateT1<F, S, A>) => Kind<F, A>
export function evaluate_<F>(F: Functor<F>): <S>(s: S) => <A>(ma: StateT<F, S, A>) => HKT<F, A>
export function evaluate_<F>(F: Functor<F>): <S>(s: S) => <A>(ma: StateT<F, S, A>) => HKT<F, A> {
  return (s) => (ma) =>
    pipe(
      ma(s),
      F.map(([a]) => a)
    )
}

/**
 * @since 3.0.0
 */
export function execute_<F extends URIS3>(
  F: Functor3<F>
): <S>(s: S) => <R, E, A>(ma: StateT3<F, S, R, E, A>) => Kind3<F, R, E, S>
export function execute_<F extends URIS2>(
  F: Functor2<F>
): <S>(s: S) => <E, A>(ma: StateT2<F, S, E, A>) => Kind2<F, E, S>
export function execute_<F extends URIS>(F: Functor1<F>): <S>(s: S) => <A>(ma: StateT1<F, S, A>) => Kind<F, S>
export function execute_<F>(F: Functor<F>): <S>(s: S) => <A>(ma: StateT<F, S, A>) => HKT<F, S>
export function execute_<F>(F: Functor<F>): <S>(s: S) => <A>(ma: StateT<F, S, A>) => HKT<F, S> {
  return (s) => (ma) =>
    pipe(
      ma(s),
      F.map(([_, s]) => s)
    )
}
