---
title: StateT.ts
nav_order: 73
parent: Modules
---

## StateT overview

Added in v3.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [StateT (interface)](#statet-interface)
  - [StateT1 (interface)](#statet1-interface)
  - [StateT2 (interface)](#statet2-interface)
  - [StateT3 (interface)](#statet3-interface)
  - [ap\_](#ap_)
  - [chain\_](#chain_)
  - [evaluate\_](#evaluate_)
  - [execute\_](#execute_)
  - [fromF\_](#fromf_)
  - [fromState\_](#fromstate_)
  - [get\_](#get_)
  - [gets\_](#gets_)
  - [map\_](#map_)
  - [modify\_](#modify_)
  - [of\_](#of_)
  - [put\_](#put_)

---

# utils

## StateT (interface)

**Signature**

```ts
export interface StateT<M, S, A> {
  (s: S): HKT<M, readonly [A, S]>
}
```

Added in v3.0.0

## StateT1 (interface)

**Signature**

```ts
export interface StateT1<M extends URIS, S, A> {
  (s: S): Kind<M, readonly [A, S]>
}
```

Added in v3.0.0

## StateT2 (interface)

**Signature**

```ts
export interface StateT2<M extends URIS2, S, E, A> {
  (s: S): Kind2<M, E, readonly [A, S]>
}
```

Added in v3.0.0

## StateT3 (interface)

**Signature**

```ts
export interface StateT3<M extends URIS3, S, R, E, A> {
  (s: S): Kind3<M, R, E, readonly [A, S]>
}
```

Added in v3.0.0

## ap\_

**Signature**

```ts
export declare function ap_<M extends URIS3>(
  M: Monad3<M>
): <S, R, E, A>(fa: StateT3<M, S, R, E, A>) => <B>(fab: StateT3<M, S, R, E, (a: A) => B>) => StateT3<M, S, R, E, B>
export declare function ap_<M extends URIS2>(
  M: Monad2<M>
): <S, E, A>(fa: StateT2<M, S, E, A>) => <B>(fab: StateT2<M, S, E, (a: A) => B>) => StateT2<M, S, E, B>
export declare function ap_<M extends URIS>(
  M: Monad1<M>
): <S, A>(fa: StateT1<M, S, A>) => <B>(fab: StateT1<M, S, (a: A) => B>) => StateT1<M, S, B>
export declare function ap_<M>(
  M: Monad<M>
): <S, A>(fa: StateT<M, S, A>) => <B>(fab: StateT<M, S, (a: A) => B>) => StateT<M, S, B>
```

Added in v3.0.0

## chain\_

**Signature**

```ts
export declare function chain_<M extends URIS3>(
  M: Monad3<M>
): <A, S, R, E, B>(f: (a: A) => StateT3<M, S, R, E, B>) => (ma: StateT3<M, S, R, E, A>) => StateT3<M, S, R, E, B>
export declare function chain_<M extends URIS2>(
  M: Monad2<M>
): <A, S, E, B>(f: (a: A) => StateT2<M, S, E, B>) => (ma: StateT2<M, S, E, A>) => StateT2<M, S, E, B>
export declare function chain_<M extends URIS>(
  M: Monad1<M>
): <A, S, B>(f: (a: A) => StateT1<M, S, B>) => (ma: StateT1<M, S, A>) => StateT1<M, S, B>
export declare function chain_<M>(
  M: Monad<M>
): <A, S, B>(f: (a: A) => StateT<M, S, B>) => (ma: StateT<M, S, A>) => StateT<M, S, B>
```

Added in v3.0.0

## evaluate\_

**Signature**

```ts
export declare function evaluate_<F extends URIS3>(
  F: Functor3<F>
): <S>(s: S) => <R, E, A>(ma: StateT3<F, S, R, E, A>) => Kind3<F, R, E, A>
export declare function evaluate_<F extends URIS2>(
  F: Functor2<F>
): <S>(s: S) => <E, A>(ma: StateT2<F, S, E, A>) => Kind2<F, E, A>
export declare function evaluate_<F extends URIS>(F: Functor1<F>): <S>(s: S) => <A>(ma: StateT1<F, S, A>) => Kind<F, A>
export declare function evaluate_<F>(F: Functor<F>): <S>(s: S) => <A>(ma: StateT<F, S, A>) => HKT<F, A>
```

Added in v3.0.0

## execute\_

**Signature**

```ts
export declare function execute_<F extends URIS3>(
  F: Functor3<F>
): <S>(s: S) => <R, E, A>(ma: StateT3<F, S, R, E, A>) => Kind3<F, R, E, S>
export declare function execute_<F extends URIS2>(
  F: Functor2<F>
): <S>(s: S) => <E, A>(ma: StateT2<F, S, E, A>) => Kind2<F, E, S>
export declare function execute_<F extends URIS>(F: Functor1<F>): <S>(s: S) => <A>(ma: StateT1<F, S, A>) => Kind<F, S>
export declare function execute_<F>(F: Functor<F>): <S>(s: S) => <A>(ma: StateT<F, S, A>) => HKT<F, S>
```

Added in v3.0.0

## fromF\_

**Signature**

```ts
export declare function fromF_<F extends URIS3>(
  F: Functor3<F>
): <R, E, A, S>(ma: Kind3<F, R, E, A>) => StateT3<F, S, R, E, A>
export declare function fromF_<F extends URIS2>(F: Functor2<F>): <E, A, S>(ma: Kind2<F, E, A>) => StateT2<F, S, E, A>
export declare function fromF_<F extends URIS>(F: Functor1<F>): <A, S>(ma: Kind<F, A>) => StateT<F, S, A>
export declare function fromF_<F>(F: Functor<F>): <A, S>(ma: HKT<F, A>) => StateT<F, S, A>
```

Added in v3.0.0

## fromState\_

**Signature**

```ts
export declare function fromState_<M extends URIS3>(
  M: Monad3<M>
): <S, A, R, E>(sa: State<S, A>) => StateT3<M, S, R, E, A>
export declare function fromState_<M extends URIS2>(M: Monad2<M>): <S, A, E>(sa: State<S, A>) => StateT2<M, S, E, A>
export declare function fromState_<M extends URIS>(M: Monad1<M>): <S, A>(sa: State<S, A>) => StateT1<M, S, A>
export declare function fromState_<M>(M: Monad<M>): <S, A>(sa: State<S, A>) => StateT<M, S, A>
```

Added in v3.0.0

## get\_

**Signature**

```ts
export declare function get_<M extends URIS3>(M: Monad3<M>): <S, R, E>() => StateT3<M, S, R, E, S>
export declare function get_<M extends URIS2>(M: Monad2<M>): <S, E>() => StateT2<M, S, E, S>
export declare function get_<M extends URIS>(M: Monad1<M>): <S>() => StateT1<M, S, S>
export declare function get_<M>(M: Monad<M>): <S>() => StateT<M, S, S>
```

Added in v3.0.0

## gets\_

**Signature**

```ts
export declare function gets_<M extends URIS3>(M: Monad3<M>): <S, A, R, E>(f: (s: S) => A) => StateT3<M, S, R, E, A>
export declare function gets_<M extends URIS2>(M: Monad2<M>): <S, A, E>(f: (s: S) => A) => StateT2<M, S, E, A>
export declare function gets_<M extends URIS>(M: Monad1<M>): <S, A>(f: (s: S) => A) => StateT1<M, S, A>
export declare function gets_<M>(M: Monad<M>): <S, A>(f: (s: S) => A) => StateT<M, S, A>
```

Added in v3.0.0

## map\_

**Signature**

```ts
export declare function map_<F extends URIS3>(
  F: Functor3<F>
): <A, B>(f: (a: A) => B) => <S, R, E>(fa: StateT3<F, S, R, E, A>) => StateT3<F, S, R, E, B>
export declare function map_<F extends URIS2>(
  F: Functor2<F>
): <A, B>(f: (a: A) => B) => <S, E>(fa: StateT2<F, S, E, A>) => StateT2<F, S, E, B>
export declare function map_<F extends URIS>(
  F: Functor1<F>
): <A, B>(f: (a: A) => B) => <S>(fa: StateT1<F, S, A>) => StateT1<F, S, B>
export declare function map_<F>(F: Functor<F>): <A, B>(f: (a: A) => B) => <S>(fa: StateT<F, S, A>) => StateT<F, S, B>
```

Added in v3.0.0

## modify\_

**Signature**

```ts
export declare function modify_<M extends URIS3>(
  M: Monad3<M>
): <S, R, E>(f: Endomorphism<S>) => StateT3<M, S, R, E, void>
export declare function modify_<M extends URIS2>(M: Monad2<M>): <S, E>(f: Endomorphism<S>) => StateT2<M, S, E, void>
export declare function modify_<M extends URIS>(M: Monad1<M>): <S>(f: Endomorphism<S>) => StateT1<M, S, void>
export declare function modify_<M>(M: Monad<M>): <S>(f: Endomorphism<S>) => StateT<M, S, void>
```

Added in v3.0.0

## of\_

**Signature**

```ts
export declare function of_<M extends URIS3>(M: Monad3<M>): <A, S, R, E>(a: A) => StateT3<M, S, R, E, A>
export declare function of_<M extends URIS2>(M: Monad2<M>): <A, S, E>(a: A) => StateT2<M, S, E, A>
export declare function of_<M extends URIS>(M: Monad1<M>): <A, S>(a: A) => StateT1<M, S, A>
export declare function of_<M>(M: Monad<M>): <A, S>(a: A) => StateT<M, S, A>
```

Added in v3.0.0

## put\_

**Signature**

```ts
export declare function put_<M extends URIS3>(M: Monad3<M>): <S, R, E>(s: S) => StateT3<M, S, R, E, void>
export declare function put_<M extends URIS2>(M: Monad2<M>): <S, E>(s: S) => StateT2<M, S, E, void>
export declare function put_<M extends URIS>(M: Monad1<M>): <S>(s: S) => StateT1<M, S, void>
export declare function put_<M>(M: Monad<M>): <S>(s: S) => StateT<M, S, void>
```

Added in v3.0.0
