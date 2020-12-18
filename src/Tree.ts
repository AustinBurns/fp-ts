/**
 * Multi-way trees (aka rose trees) and forests, where a forest is
 *
 * ```ts
 * type Forest<A> = Array<Tree<A>>
 * ```
 *
 * @since 3.0.0
 */
import { Applicative as ApplicativeHKT, Applicative1 } from './Applicative'
import { apFirst_, apSecond_, apS_, apT_ } from './Apply'
import { Comonad1 } from './Comonad'
import { Eq, fromEquals } from './Eq'
import { Extend1 } from './Extend'
import { Foldable1 } from './Foldable'
import { identity, pipe, tuple } from './function'
import { bindTo_, Functor1 } from './Functor'
import { HKT } from './HKT'
import { bind_, chainFirst_, Monad1 } from './Monad'
import { Monoid } from './Monoid'
import * as A from './ReadonlyArray'
import { Show } from './Show'
import { Traversable1 } from './Traversable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 3.0.0
 */
export type Forest<A> = ReadonlyArray<Tree<A>>

/**
 * @category model
 * @since 3.0.0
 */
export interface Tree<A> {
  readonly value: A
  readonly forest: Forest<A>
}

/**
 * @category constructors
 * @since 3.0.0
 */
export function make<A>(value: A, forest: Forest<A> = A.empty): Tree<A> {
  return {
    value,
    forest
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export function getShow<A>(S: Show<A>): Show<Tree<A>> {
  const show = (t: Tree<A>): string => {
    return t.forest === A.empty || t.forest.length === 0
      ? `make(${S.show(t.value)})`
      : `make(${S.show(t.value)}, [${t.forest.map(show).join(', ')}])`
  }
  return {
    show
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export function getEq<A>(E: Eq<A>): Eq<Tree<A>> {
  let SA: Eq<ReadonlyArray<Tree<A>>>
  const R: Eq<Tree<A>> = fromEquals((second) => (first) =>
    E.equals(second.value)(first.value) && SA.equals(second.forest)(first.forest)
  )
  SA = A.getEq(R)
  return R
}

const draw = (indentation: string, forest: Forest<string>): string => {
  let r: string = ''
  const len = forest.length
  let tree: Tree<string>
  for (let i = 0; i < len; i++) {
    tree = forest[i]
    const isLast = i === len - 1
    r += indentation + (isLast ? '└' : '├') + '─ ' + tree.value
    r += draw(indentation + (len > 1 && !isLast ? '│  ' : '   '), tree.forest)
  }
  return r
}

/**
 * Neat 2-dimensional drawing of a forest
 *
 * @since 3.0.0
 */
export function drawForest(forest: Forest<string>): string {
  return draw('\n', forest)
}

/**
 * Neat 2-dimensional drawing of a tree
 *
 * @example
 * import { make, drawTree } from 'fp-ts/Tree'
 *
 * const fa = make('a', [
 *   make('b'),
 *   make('c'),
 *   make('d', [make('e'), make('f')])
 * ])
 *
 * assert.strictEqual(drawTree(fa), `a
 * ├─ b
 * ├─ c
 * └─ d
 *    ├─ e
 *    └─ f`)
 *
 *
 * @since 3.0.0
 */
export function drawTree(tree: Tree<string>): string {
  return tree.value + drawForest(tree.forest)
}

/**
 * Build a tree from a seed value
 *
 * @category constructors
 * @since 3.0.0
 */
export function unfoldTree<A, B>(b: B, f: (b: B) => readonly [A, ReadonlyArray<B>]): Tree<A> {
  const [a, bs] = f(b)
  return { value: a, forest: unfoldForest(bs, f) }
}

/**
 * Build a tree from a seed value
 *
 * @category constructors
 * @since 3.0.0
 */
export function unfoldForest<A, B>(bs: ReadonlyArray<B>, f: (b: B) => readonly [A, ReadonlyArray<B>]): Forest<A> {
  return bs.map((b) => unfoldTree(b, f))
}

/**
 * @since 3.0.0
 */
export const elem = <A>(E: Eq<A>) => (a: A): ((fa: Tree<A>) => boolean) => {
  const predicate = E.equals(a)
  const go = (fa: Tree<A>): boolean => predicate(fa.value) || fa.forest.some(go)
  return go
}

/**
 * Fold a tree into a "summary" value in depth-first order.
 *
 * For each node in the tree, apply `f` to the `value` and the result of applying `f` to each `forest`.
 *
 * This is also known as the catamorphism on trees.
 *
 * @example
 * import { fold, make } from 'fp-ts/Tree'
 * import { pipe } from 'fp-ts/function'
 *
 * const t = make(1, [make(2), make(3)])
 *
 * const sum = (as: ReadonlyArray<number>) => as.reduce((a, acc) => a + acc, 0)
 *
 * // Sum the values in a tree:
 * assert.deepStrictEqual(pipe(t, fold((a, bs) => a + sum(bs))), 6)
 *
 * // Find the maximum value in the tree:
 * assert.deepStrictEqual(pipe(t, fold((a, bs) => bs.reduce((b, acc) => Math.max(b, acc), a))), 3)
 *
 * // Count the number of leaves in the tree:
 * assert.deepStrictEqual(pipe(t, fold((_, bs) => (bs.length === 0 ? 1 : sum(bs)))), 2)
 *
 * @category destructors
 * @since 3.0.0
 */
export function fold<A, B>(f: (a: A, bs: ReadonlyArray<B>) => B): (tree: Tree<A>) => B {
  const go = (tree: Tree<A>): B => f(tree.value, tree.forest.map(go))
  return go
}

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 3.0.0
 */
export const ap: Applicative1<URI>['ap'] = (fa) => chain((f) => pipe(fa, map(f)))

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 3.0.0
 */
export const chain: Monad1<URI>['chain'] = <A, B>(f: (a: A) => Tree<B>) => (ma: Tree<A>) => {
  const { value, forest } = f(ma.value)
  const concat = A.getMonoid<Tree<B>>().concat
  return {
    value,
    forest: concat(ma.forest.map(chain(f)))(forest)
  }
}

/**
 * @category Extend
 * @since 3.0.0
 */
export const extend: Extend1<URI>['extend'] = (f) => (wa) => ({
  value: f(wa),
  forest: wa.forest.map(extend(f))
})

/**
 * Derivable from `Extend`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const duplicate: <A>(wa: Tree<A>) => Tree<Tree<A>> =
  /*#__PURE__*/
  extend(identity)

/**
 * Derivable from `Monad`.
 *
 * @category derivable combinators
 * @since 3.0.0
 */
export const flatten: <A>(mma: Tree<Tree<A>>) => Tree<A> =
  /*#__PURE__*/
  chain(identity)

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 3.0.0
 */
export const map: <A, B>(f: (a: A) => B) => (fa: Tree<A>) => Tree<B> = (f) => (fa) => ({
  value: f(fa.value),
  forest: fa.forest.map(map(f))
})

/**
 * @category Foldable
 * @since 3.0.0
 */
export const reduce = <A, B>(b: B, f: (b: B, a: A) => B) => (fa: Tree<A>): B => {
  let r: B = f(b, fa.value)
  const len = fa.forest.length
  for (let i = 0; i < len; i++) {
    r = pipe(fa.forest[i], reduce(r, f))
  }
  return r
}

/**
 * @category Foldable
 * @since 3.0.0
 */
export const foldMap: <M>(M: Monoid<M>) => <A>(f: (a: A) => M) => (fa: Tree<A>) => M = (M) => (f) =>
  reduce(M.empty, (acc, a) => M.concat(f(a))(acc))

/**
 * @category Foldable
 * @since 3.0.0
 */
export const reduceRight = <A, B>(b: B, f: (a: A, b: B) => B) => (fa: Tree<A>): B => {
  let r: B = b
  const len = fa.forest.length
  for (let i = len - 1; i >= 0; i--) {
    r = pipe(fa.forest[i], reduceRight(r, f))
  }
  return f(fa.value, r)
}

/**
 * @category Extract
 * @since 3.0.0
 */
export const extract: <A>(wa: Tree<A>) => A = (wa) => wa.value

/**
 * @since 3.0.0
 */
export const traverse: Traversable1<URI>['traverse'] = <F>(
  F: ApplicativeHKT<F>
): (<A, B>(f: (a: A) => HKT<F, B>) => (ta: Tree<A>) => HKT<F, Tree<B>>) => {
  const traverseF = A.traverse(F)
  const out = <A, B>(f: (a: A) => HKT<F, B>) => (ta: Tree<A>): HKT<F, Tree<B>> =>
    pipe(
      f(ta.value),
      F.map((value: B) => (forest: Forest<B>) => ({
        value,
        forest
      })),
      F.ap(pipe(ta.forest, traverseF(out(f))))
    )
  return out
}

/**
 * @since 3.0.0
 */
export const sequence: Traversable1<URI>['sequence'] = <F>(
  F: ApplicativeHKT<F>
): (<A>(ta: Tree<HKT<F, A>>) => HKT<F, Tree<A>>) => traverse(F)(identity)

/**
 * Wrap a value into the type constructor.
 *
 * @category Applicative
 * @since 3.0.0
 */
export const of: Applicative1<URI>['of'] = (a) => ({
  value: a,
  forest: A.empty
})

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
export const URI = 'Tree'

/**
 * @category instances
 * @since 3.0.0
 */
export type URI = typeof URI

declare module './HKT' {
  interface URItoKind<A> {
    readonly [URI]: Tree<A>
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
export const apFirst: <B>(second: Tree<B>) => <A>(first: Tree<A>) => Tree<A> =
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
export const apSecond: <B>(second: Tree<B>) => <A>(first: Tree<A>) => Tree<B> =
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
export const chainFirst: <A, B>(f: (a: A) => Tree<B>) => (first: Tree<A>) => Tree<A> =
  /*#__PURE__*/
  chainFirst_(Monad)

/**
 * @category instances
 * @since 3.0.0
 */
export const Foldable: Foldable1<URI> = {
  URI,
  reduce,
  foldMap,
  reduceRight
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Traversable: Traversable1<URI> = {
  URI,
  map,
  traverse,
  sequence
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Comonad: Comonad1<URI> = {
  URI,
  map,
  extend,
  extract
}

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const Do: Tree<{}> = of({})

/**
 * @since 3.0.0
 */
export const bindTo: <N extends string>(name: N) => <A>(fa: Tree<A>) => Tree<{ [K in N]: A }> =
  /*#__PURE__*/
  bindTo_(Functor)

/**
 * @since 3.0.0
 */
export const bind: <N extends string, A, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => Tree<B>
) => (fa: Tree<A>) => Tree<{ [K in N | keyof A]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/
  bind_(Monad)

// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const apS: <N extends string, A, B>(
  name: Exclude<N, keyof A>,
  fb: Tree<B>
) => (fa: Tree<A>) => Tree<{ [K in N | keyof A]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/
  apS_(Applicative)

// -------------------------------------------------------------------------------------
// pipeable sequence T
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const ApT: Tree<readonly []> = of([])

/**
 * @since 3.0.0
 */
export const tupled: <A>(a: Tree<A>) => Tree<readonly [A]> = map(tuple)

/**
 * @since 3.0.0
 */
export const apT: <B>(fb: Tree<B>) => <A extends ReadonlyArray<unknown>>(fas: Tree<A>) => Tree<readonly [...A, B]> =
  /*#__PURE__*/
  apT_(Applicative)
