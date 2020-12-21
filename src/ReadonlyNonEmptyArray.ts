/**
 * Data structure which represents readonly non-empty arrays.
 *
 * @since 3.0.0
 */
import { Alt1 } from './Alt'
import { Applicative1 } from './Applicative'
import { Apply1, apS_, apT_ } from './Apply'
import { Comonad1 } from './Comonad'
import { Eq } from './Eq'
import { Extend1 } from './Extend'
import { Foldable1 } from './Foldable'
import { FoldableWithIndex1 } from './FoldableWithIndex'
import { Endomorphism, Lazy, Predicate, Refinement, tuple } from './function'
import { bindTo_, Functor1 } from './Functor'
import { FunctorWithIndex1 } from './FunctorWithIndex'
import { bind_, Monad1 } from './Monad'
import { none, Option, some } from './Option'
import { Ord } from './Ord'
import { Pointed1 } from './Pointed'
import * as RA from './ReadonlyArray'
import { ReadonlyRecord } from './ReadonlyRecord'
import { getJoinSemigroup, getMeetSemigroup, Semigroup } from './Semigroup'
import { Show } from './Show'
import { Traversable1 } from './Traversable'
import { TraversableWithIndex1 } from './TraversableWithIndex'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 3.0.0
 */
export type ReadonlyNonEmptyArray<A> = ReadonlyArray<A> & {
  readonly 0: A
}

/**
 * Append an element to the front of an array, creating a new non empty array
 *
 * @example
 * import { cons } from 'fp-ts/ReadonlyNonEmptyArray'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe([2, 3, 4], cons(1)), [1, 2, 3, 4])
 *
 * @category constructors
 * @since 3.0.0
 */
export const cons: <A>(head: A) => (tail: ReadonlyArray<A>) => ReadonlyNonEmptyArray<A> = RA.cons

/**
 * Append an element to the end of an array, creating a new non empty array
 *
 * @example
 * import { snoc } from 'fp-ts/ReadonlyNonEmptyArray'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe([1, 2, 3], snoc(4)), [1, 2, 3, 4])
 *
 * @category constructors
 * @since 3.0.0
 */
export const snoc: <A>(end: A) => (init: ReadonlyArray<A>) => ReadonlyNonEmptyArray<A> = RA.snoc

/**
 * Builds a `ReadonlyNonEmptyArray` from an array returning `none` if `as` is an empty array.
 *
 * @category constructors
 * @since 3.0.0
 */
export const fromReadonlyArray = <A>(as: ReadonlyArray<A>): Option<ReadonlyNonEmptyArray<A>> =>
  RA.isNonEmpty(as) ? some(as) : none

/**
 * @category constructors
 * @since 3.0.0
 */
// tslint:disable-next-line: readonly-array
export const fromArray = <A>(as: Array<A>): Option<ReadonlyNonEmptyArray<A>> => fromReadonlyArray(RA.fromArray(as))

/**
 * Produces a couple of the first element of the array, and a new array of the remaining elements, if any
 *
 * @example
 * import { uncons } from 'fp-ts/ReadonlyNonEmptyArray'
 *
 * assert.deepStrictEqual(uncons([1, 2, 3, 4]), [1, [2, 3, 4]])
 *
 * @category destructors
 * @since 3.0.0
 */
export const uncons = <A>(nea: ReadonlyNonEmptyArray<A>): readonly [A, ReadonlyArray<A>] => [nea[0], nea.slice(1)]

/**
 * Produces a couple of a copy of the array without its last element, and that last element
 *
 * @example
 * import { unsnoc } from 'fp-ts/ReadonlyNonEmptyArray'
 *
 * assert.deepStrictEqual(unsnoc([1, 2, 3, 4]), [[1, 2, 3], 4])
 *
 * @category destructors
 * @since 3.0.0
 */
export const unsnoc = <A>(nea: ReadonlyNonEmptyArray<A>): readonly [ReadonlyArray<A>, A] => {
  const len = nea.length - 1
  return [nea.slice(0, len), nea[len]]
}

/**
 * @category instances
 * @since 3.0.0
 */
export const getShow: <A>(S: Show<A>) => Show<ReadonlyNonEmptyArray<A>> = RA.getShow

/**
 * @since 3.0.0
 */
export const head = <A>(nea: ReadonlyNonEmptyArray<A>): A => nea[0]

/**
 * @since 3.0.0
 */
export const tail = <A>(nea: ReadonlyNonEmptyArray<A>): ReadonlyArray<A> => nea.slice(1)

/**
 * @category combinators
 * @since 3.0.0
 */
export const reverse: <A>(nea: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<A> = RA.reverse as any

/**
 * @since 3.0.0
 */
export function min<A>(O: Ord<A>): (nea: ReadonlyNonEmptyArray<A>) => A {
  const S = getMeetSemigroup(O)
  return (nea) => nea.reduce((a, acc) => S.concat(acc)(a))
}

/**
 * @since 3.0.0
 */
export function max<A>(O: Ord<A>): (nea: ReadonlyNonEmptyArray<A>) => A {
  const S = getJoinSemigroup(O)
  return (nea) => nea.reduce((a, acc) => S.concat(acc)(a))
}

/**
 * Builds a `Semigroup` instance for `ReadonlyNonEmptyArray`
 *
 * @category instances
 * @since 3.0.0
 */
export const getSemigroup = <A = never>(): Semigroup<ReadonlyNonEmptyArray<A>> => ({
  concat: (second) => (first) => concat(first, second)
})

/**
 * @category instances
 * @since 3.0.0
 */
export const getEq: <A>(E: Eq<A>) => Eq<ReadonlyNonEmptyArray<A>> = RA.getEq

/**
 * Group equal, consecutive elements of an array into non empty arrays.
 *
 * @example
 * import { group } from 'fp-ts/ReadonlyNonEmptyArray'
 * import { ordNumber } from 'fp-ts/Ord'
 *
 * assert.deepStrictEqual(group(ordNumber)([1, 2, 1, 1]), [
 *   [1],
 *   [2],
 *   [1, 1]
 * ])
 *
 * @category combinators
 * @since 3.0.0
 */
export function group<B>(
  E: Eq<B>
): {
  <A extends B>(as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<ReadonlyNonEmptyArray<A>>
  <A extends B>(as: ReadonlyArray<A>): ReadonlyArray<ReadonlyNonEmptyArray<A>>
}
export function group<A>(E: Eq<A>): (as: ReadonlyArray<A>) => ReadonlyArray<ReadonlyNonEmptyArray<A>> {
  return (as) => {
    const len = as.length
    if (len === 0) {
      return RA.empty
    }
    // tslint:disable-next-line: readonly-array
    const out: Array<ReadonlyNonEmptyArray<A>> = []
    let head: A = as[0]
    // tslint:disable-next-line: readonly-array
    let nea: [A, ...Array<A>] = [head]
    for (let i = 1; i < len; i++) {
      const x = as[i]
      if (E.equals(head)(x)) {
        nea.push(x)
      } else {
        out.push(nea)
        head = x
        nea = [head]
      }
    }
    out.push(nea)
    return out
  }
}

/**
 * Sort and then group the elements of an array into non empty arrays.
 *
 * @example
 * import { groupSort } from 'fp-ts/ReadonlyNonEmptyArray'
 * import { ordNumber } from 'fp-ts/Ord'
 *
 * assert.deepStrictEqual(groupSort(ordNumber)([1, 2, 1, 1]), [[1, 1, 1], [2]])
 *
 * @category combinators
 * @since 3.0.0
 */
export function groupSort<B>(
  O: Ord<B>
): {
  <A extends B>(as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<ReadonlyNonEmptyArray<A>>
  <A extends B>(as: ReadonlyArray<A>): ReadonlyArray<ReadonlyNonEmptyArray<A>>
}
export function groupSort<A>(O: Ord<A>): (as: ReadonlyArray<A>) => ReadonlyArray<ReadonlyNonEmptyArray<A>> {
  const sortO = RA.sort(O)
  const groupO = group(O)
  return (as) => groupO(sortO(as))
}

/**
 * Splits an array into sub-non-empty-arrays stored in an object, based on the result of calling a `string`-returning
 * function on each element, and grouping the results according to values returned
 *
 * @example
 * import { groupBy } from 'fp-ts/ReadonlyNonEmptyArray'
 *
 * assert.deepStrictEqual(groupBy((s: string) => String(s.length))(['foo', 'bar', 'foobar']), {
 *   '3': ['foo', 'bar'],
 *   '6': ['foobar']
 * })
 *
 * @category constructors
 * @since 3.0.0
 */
export const groupBy = <A>(f: (a: A) => string) => (
  as: ReadonlyArray<A>
): ReadonlyRecord<string, ReadonlyNonEmptyArray<A>> => {
  // tslint:disable-next-line: readonly-array
  const out: Record<string, [A, ...Array<A>]> = {}
  for (const a of as) {
    const k = f(a)
    if (out.hasOwnProperty(k)) {
      out[k].push(a)
    } else {
      out[k] = [a]
    }
  }
  return out
}

/**
 * @since 3.0.0
 */
export const last = <A>(nea: ReadonlyNonEmptyArray<A>): A => nea[nea.length - 1]

/**
 * Get all but the last element of a non empty array, creating a new array.
 *
 * @example
 * import { init } from 'fp-ts/ReadonlyNonEmptyArray'
 *
 * assert.deepStrictEqual(init([1, 2, 3]), [1, 2])
 * assert.deepStrictEqual(init([1]), [])
 *
 * @since 3.0.0
 */
export const init = <A>(nea: ReadonlyNonEmptyArray<A>): ReadonlyArray<A> => nea.slice(0, -1)

/**
 * @category combinators
 * @since 3.0.0
 */
export const sort: <B>(
  O: Ord<B>
) => <A extends B>(nea: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<A> = RA.sort as any

/**
 * @since 3.0.0
 */
export const insertAt: <A>(
  i: number,
  a: A
) => (nea: ReadonlyNonEmptyArray<A>) => Option<ReadonlyNonEmptyArray<A>> = RA.insertAt as any

/**
 * @since 3.0.0
 */
export const updateAt: <A>(
  i: number,
  a: A
) => (nea: ReadonlyNonEmptyArray<A>) => Option<ReadonlyNonEmptyArray<A>> = RA.updateAt as any

/**
 * @since 3.0.0
 */
export const modifyAt: <A>(
  i: number,
  f: Endomorphism<A>
) => (nea: ReadonlyNonEmptyArray<A>) => Option<ReadonlyNonEmptyArray<A>> = RA.modifyAt as any

/**
 * @since 3.0.0
 */
export function filter<A, B extends A>(
  refinement: Refinement<A, B>
): (nea: ReadonlyNonEmptyArray<A>) => Option<ReadonlyNonEmptyArray<A>>
export function filter<A>(predicate: Predicate<A>): (nea: ReadonlyNonEmptyArray<A>) => Option<ReadonlyNonEmptyArray<A>>
export function filter<A>(
  predicate: Predicate<A>
): (nea: ReadonlyNonEmptyArray<A>) => Option<ReadonlyNonEmptyArray<A>> {
  return filterWithIndex((_, a) => predicate(a))
}

/**
 * @since 3.0.0
 */
export const filterWithIndex = <A>(predicate: (i: number, a: A) => boolean) => (
  nea: ReadonlyNonEmptyArray<A>
): Option<ReadonlyNonEmptyArray<A>> => fromReadonlyArray(nea.filter((a, i) => predicate(i, a)))

/**
 * @category constructors
 * @since 3.0.0
 */
export function concat<A>(fx: ReadonlyArray<A>, fy: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<A>
export function concat<A>(fx: ReadonlyNonEmptyArray<A>, fy: ReadonlyArray<A>): ReadonlyNonEmptyArray<A>
export function concat<A>(fx: ReadonlyArray<A>, fy: ReadonlyArray<A>): ReadonlyArray<A> {
  return fx.concat(fy)
}

/**
 * @since 3.0.0
 */
export const fold = <A>(S: Semigroup<A>) => (fa: ReadonlyNonEmptyArray<A>): A => fa.reduce((a, acc) => S.concat(acc)(a))

/**
 * @category combinators
 * @since 3.0.0
 */
export const zipWith: <A, B, C>(
  bs: ReadonlyNonEmptyArray<B>,
  f: (a: A, b: B) => C
) => (as: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<C> = RA.zipWith as any

/**
 * @category combinators
 * @since 3.0.0
 */
export const zip: <B>(
  bs: ReadonlyNonEmptyArray<B>
) => <A>(as: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<readonly [A, B]> = RA.zip as any

/**
 * @since 3.0.0
 */
export const unzip: <A, B>(
  as: ReadonlyNonEmptyArray<readonly [A, B]>
) => readonly [ReadonlyNonEmptyArray<A>, ReadonlyNonEmptyArray<B>] = RA.unzip as any

/**
 * Prepend an element to every member of an array
 *
 * @example
 * import { prependToAll } from 'fp-ts/ReadonlyNonEmptyArray'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe([1, 2, 3, 4], prependToAll(9)), [9, 1, 9, 2, 9, 3, 9, 4])
 *
 * @category combinators
 * @since 3.0.0
 */
export const prependToAll: <A>(
  a: A
) => (as: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<A> = RA.prependToAll as any

/**
 * Places an element in between members of an array
 *
 * @example
 * import { intersperse } from 'fp-ts/ReadonlyNonEmptyArray'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe([1, 2, 3, 4], intersperse(9)), [1, 9, 2, 9, 3, 9, 4])
 *
 * @category combinators
 * @since 3.0.0
 */
export const intersperse: <A>(
  a: A
) => (as: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<A> = RA.intersperse as any

/**
 * @category FoldableWithIndex
 * @since 3.0.0
 */
export const foldMapWithIndex = <S>(S: Semigroup<S>) => <A>(f: (i: number, a: A) => S) => (
  fa: ReadonlyNonEmptyArray<A>
) => fa.slice(1).reduce((s, a, i) => S.concat(f(i + 1, a))(s), f(0, fa[0]))

/**
 * @category Foldable
 * @since 3.0.0
 */
export const foldMap = <S>(S: Semigroup<S>) => <A>(f: (a: A) => S) => (fa: ReadonlyNonEmptyArray<A>) =>
  fa.slice(1).reduce((s, a) => S.concat(f(a))(s), f(fa[0]))

/**
 * Less strict version of [`alt`](#alt).
 *
 * @category Alt
 * @since 3.0.0
 */
export const altW: <B>(
  second: Lazy<ReadonlyNonEmptyArray<B>>
) => <A>(first: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<A | B> = RA.altW as any

/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 3.0.0
 */
export const alt: Alt1<URI>['alt'] = RA.alt as any

/**
 * @category Apply
 * @since 3.0.0
 */
export const ap: Apply1<URI>['ap'] = RA.ap as any

/**
 * Wrap a value into the type constructor.
 *
 * @category Applicative
 * @since 3.0.0
 */
export const of: Pointed1<URI>['of'] = RA.of as any

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 3.0.0
 */
export const chain: Monad1<URI>['chain'] = RA.chain as any

/**
 * Derivable from `Extend`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const duplicate: <A>(
  ma: ReadonlyNonEmptyArray<A>
) => ReadonlyNonEmptyArray<ReadonlyNonEmptyArray<A>> = RA.duplicate as any

/**
 * @category Extend
 * @since 3.0.0
 */
export const extend: Extend1<URI>['extend'] = RA.extend as any

/**
 * Derivable from `Monad`.
 *
 * @category derivable combinators
 * @since 3.0.0
 */
export const flatten: <A>(
  mma: ReadonlyNonEmptyArray<ReadonlyNonEmptyArray<A>>
) => ReadonlyNonEmptyArray<A> = RA.flatten as any

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 3.0.0
 */
export const map: Functor1<URI>['map'] = RA.map as any

/**
 * @category FunctorWithIndex
 * @since 3.0.0
 */
export const mapWithIndex: FunctorWithIndex1<URI, number>['mapWithIndex'] = RA.mapWithIndex as any

/**
 * @category Foldable
 * @since 3.0.0
 */
export const reduce: Foldable1<URI>['reduce'] = RA.reduce

/**
 * @category FoldableWithIndex
 * @since 3.0.0
 */
export const reduceWithIndex: FoldableWithIndex1<URI, number>['reduceWithIndex'] = RA.reduceWithIndex

/**
 * @category Foldable
 * @since 3.0.0
 */
export const reduceRight: Foldable1<URI>['reduceRight'] = RA.reduceRight

/**
 * @category FoldableWithIndex
 * @since 3.0.0
 */
export const reduceRightWithIndex: FoldableWithIndex1<URI, number>['reduceRightWithIndex'] = RA.reduceRightWithIndex

/**
 * @since 3.0.0
 */
export const traverse: Traversable1<URI>['traverse'] = RA.traverse as any

/**
 * @since 3.0.0
 */
export const sequence: Traversable1<URI>['sequence'] = RA.sequence as any

/**
 * @since 3.0.0
 */
export const traverseWithIndex: TraversableWithIndex1<URI, number>['traverseWithIndex'] = RA.traverseWithIndex as any

/**
 * @since 3.0.0
 */
export const extract: Comonad1<URI>['extract'] = head

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
export const URI = 'ReadonlyNonEmptyArray'

/**
 * @category instances
 * @since 3.0.0
 */
export type URI = typeof URI

declare module './HKT' {
  interface URItoKind<A> {
    readonly [URI]: ReadonlyNonEmptyArray<A>
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
export const FunctorWithIndex: FunctorWithIndex1<URI, number> = {
  URI,
  map,
  mapWithIndex
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
export const apFirst: <B>(
  second: ReadonlyNonEmptyArray<B>
) => <A>(first: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<A> = RA.apFirst as any

/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * Derivable from `Apply`.
 *
 * @category derivable combinators
 * @since 3.0.0
 */
export const apSecond: <B>(
  second: ReadonlyNonEmptyArray<B>
) => <A>(first: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<B> = RA.apSecond as any

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
export const chainFirst: <A, B>(
  f: (a: A) => ReadonlyNonEmptyArray<B>
) => (first: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<A> = RA.chainFirst as any

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
export const FoldableWithIndex: FoldableWithIndex1<URI, number> = {
  URI,
  reduceWithIndex,
  foldMapWithIndex,
  reduceRightWithIndex
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
export const TraversableWithIndex: TraversableWithIndex1<URI, number> = {
  URI,
  traverseWithIndex
}

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
export const Do: ReadonlyNonEmptyArray<{}> = of({})

/**
 * @since 3.0.0
 */
export const bindTo: <N extends string>(
  name: N
) => <A>(fa: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<{ [K in N]: A }> =
  /*#__PURE__*/
  bindTo_(Functor)

/**
 * @since 3.0.0
 */
export const bind: <N extends string, A, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => ReadonlyNonEmptyArray<B>
) => (fa: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<{ [K in N | keyof A]: K extends keyof A ? A[K] : B }> =
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
  fb: ReadonlyNonEmptyArray<B>
) => (fa: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<{ [K in N | keyof A]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/
  apS_(Applicative)

// -------------------------------------------------------------------------------------
// pipeable sequence T
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const ApT: ReadonlyNonEmptyArray<readonly []> = of([])

/**
 * @since 3.0.0
 */
export const tupled: <A>(a: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<readonly [A]> = map(tuple)

/**
 * @since 3.0.0
 */
export const apT: <B>(
  fb: ReadonlyNonEmptyArray<B>
) => <A extends ReadonlyArray<unknown>>(fas: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<readonly [...A, B]> =
  /*#__PURE__*/
  apT_(Applicative)
