/**
 * @since 3.0.0
 */
import { Either } from './Either'
import { Monoid } from './Monoid'
import { Ord } from './Ord'
import { Semigroup } from './Semigroup'
import { Eq, fromEquals } from './Eq'
import { Predicate, not, Refinement, identity } from './function'
import { Separated } from './Compactable'
import { Option } from './Option'
import { Show } from './Show'

/**
 * @category constructors
 * @since 3.0.0
 */
export const fromSet = <A>(s: Set<A>): ReadonlySet<A> => new Set(s)

/**
 * @category destructors
 * @since 3.0.0
 */
export const toSet = <A>(s: ReadonlySet<A>): Set<A> => new Set(s)

/**
 * @category instances
 * @since 3.0.0
 */
export const getShow = <A>(S: Show<A>): Show<ReadonlySet<A>> => ({
  show: (s) => {
    let elements = ''
    s.forEach((a) => {
      elements += S.show(a) + ', '
    })
    if (elements !== '') {
      elements = elements.substring(0, elements.length - 2)
    }
    return `new Set([${elements}])`
  }
})

/**
 * @since 3.0.0
 */
export const empty: ReadonlySet<never> = new Set()

/**
 * @category destructors
 * @since 3.0.0
 */
export const toReadonlyArray = <A>(O: Ord<A>) => (set: ReadonlySet<A>): ReadonlyArray<A> => {
  // tslint:disable-next-line: readonly-array
  const out: Array<A> = []
  set.forEach((e) => out.push(e))
  return out.sort((first, second) => O.compare(second)(first))
}

/**
 * @category instances
 * @since 3.0.0
 */
export const getEq = <A>(E: Eq<A>): Eq<ReadonlySet<A>> => {
  const subsetE = isSubset(E)
  return fromEquals((second) => (first) => subsetE(first)(second) && subsetE(second)(first))
}

interface Next<A> {
  readonly done?: boolean
  readonly value: A
}

/**
 * @since 3.0.0
 */
export const some = <A>(predicate: Predicate<A>) => (set: ReadonlySet<A>): boolean => {
  const values = set.values()
  let e: Next<A>
  let found = false
  // tslint:disable-next-line: strict-boolean-expressions
  while (!found && !(e = values.next()).done) {
    found = predicate(e.value)
  }
  return found
}

/**
 * Projects a Set through a function
 *
 * @category combinators
 * @since 3.0.0
 */
export const map = <B>(E: Eq<B>): (<A>(f: (x: A) => B) => (set: ReadonlySet<A>) => ReadonlySet<B>) => {
  const elemE = elem(E)
  return (f) => (set) => {
    const r = new Set<B>()
    set.forEach((e) => {
      const v = f(e)
      if (!elemE(v)(r)) {
        r.add(v)
      }
    })
    return r
  }
}

/**
 * @since 3.0.0
 */
export const every = <A>(predicate: Predicate<A>): ((set: ReadonlySet<A>) => boolean) => not(some(not(predicate)))

/**
 * @category combinators
 * @since 3.0.0
 */
export const chain = <B>(E: Eq<B>): (<A>(f: (x: A) => ReadonlySet<B>) => (set: ReadonlySet<A>) => ReadonlySet<B>) => {
  const elemE = elem(E)
  return (f) => (set) => {
    const r = new Set<B>()
    set.forEach((e) => {
      f(e).forEach((e) => {
        if (!elemE(e)(r)) {
          r.add(e)
        }
      })
    })
    return r
  }
}

/**
 * `true` if and only if every element in the first set is an element of the second set
 *
 * @since 3.0.0
 */
export const isSubset = <A>(E: Eq<A>): ((that: ReadonlySet<A>) => (me: ReadonlySet<A>) => boolean) => {
  const elemE = elem(E)
  return (that) => every((a) => elemE(a)(that))
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function filter<A, B extends A>(refinement: Refinement<A, B>): (set: ReadonlySet<A>) => ReadonlySet<B>
export function filter<A>(predicate: Predicate<A>): (set: ReadonlySet<A>) => ReadonlySet<A>
export function filter<A>(predicate: Predicate<A>): (set: ReadonlySet<A>) => ReadonlySet<A> {
  return (set) => {
    const values = set.values()
    let e: Next<A>
    const r = new Set<A>()
    // tslint:disable-next-line: strict-boolean-expressions
    while (!(e = values.next()).done) {
      const value = e.value
      if (predicate(value)) {
        r.add(value)
      }
    }
    return r
  }
}

/**
 * @since 3.0.0
 */
export function partition<A, B extends A>(
  refinement: Refinement<A, B>
): (set: ReadonlySet<A>) => Separated<ReadonlySet<A>, ReadonlySet<B>>
export function partition<A>(
  predicate: Predicate<A>
): (set: ReadonlySet<A>) => Separated<ReadonlySet<A>, ReadonlySet<A>>
export function partition<A>(
  predicate: Predicate<A>
): (set: ReadonlySet<A>) => Separated<ReadonlySet<A>, ReadonlySet<A>> {
  return (set) => {
    const values = set.values()
    let e: Next<A>
    const right = new Set<A>()
    const left = new Set<A>()
    // tslint:disable-next-line: strict-boolean-expressions
    while (!(e = values.next()).done) {
      const value = e.value
      if (predicate(value)) {
        right.add(value)
      } else {
        left.add(value)
      }
    }
    return { left, right }
  }
}

/**
 * Test if a value is a member of a set
 *
 * @since 3.0.0
 */
export const elem = <A>(E: Eq<A>) => (a: A): ((set: ReadonlySet<A>) => boolean) => {
  const predicate = E.equals(a)
  return (set) => {
    const values = set.values()
    let e: Next<A>
    let found = false
    // tslint:disable-next-line: strict-boolean-expressions
    while (!found && !(e = values.next()).done) {
      found = predicate(e.value)
    }
    return found
  }
}

/**
 * Form the union of two sets
 *
 * @category combinators
 * @since 3.0.0
 */
export const union = <A>(E: Eq<A>): ((second: ReadonlySet<A>) => (first: ReadonlySet<A>) => ReadonlySet<A>) => {
  const elemE = elem(E)
  return (second) => (first) => {
    if (first === empty) {
      return second
    }
    if (second === empty) {
      return first
    }
    const r = new Set(first)
    second.forEach((e) => {
      if (!elemE(e)(r)) {
        r.add(e)
      }
    })
    return r
  }
}

/**
 * The set of elements which are in both the first and second set
 *
 * @category combinators
 * @since 3.0.0
 */
export const intersection = <A>(E: Eq<A>): ((second: ReadonlySet<A>) => (first: ReadonlySet<A>) => ReadonlySet<A>) => {
  const elemE = elem(E)
  return (second) => (first) => {
    if (first === empty || second === empty) {
      return empty
    }
    const r = new Set<A>()
    first.forEach((e) => {
      if (elemE(e)(second)) {
        r.add(e)
      }
    })
    return r
  }
}

/**
 * @since 3.0.0
 */
export const partitionMap = <B, C>(EB: Eq<B>, EC: Eq<C>) => <A>(f: (a: A) => Either<B, C>) => (
  set: ReadonlySet<A>
): Separated<ReadonlySet<B>, ReadonlySet<C>> => {
  const values = set.values()
  let e: Next<A>
  const left = new Set<B>()
  const right = new Set<C>()
  const hasB = elem(EB)
  const hasC = elem(EC)
  // tslint:disable-next-line: strict-boolean-expressions
  while (!(e = values.next()).done) {
    const v = f(e.value)
    switch (v._tag) {
      case 'Left':
        if (!hasB(v.left)(left)) {
          left.add(v.left)
        }
        break
      case 'Right':
        if (!hasC(v.right)(right)) {
          right.add(v.right)
        }
        break
    }
  }
  return { left, right }
}

/**
 * Form the set difference (`x` - `y`)
 *
 * @example
 * import { difference } from 'fp-ts/ReadonlySet'
 * import { eqNumber } from 'fp-ts/Eq'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe(new Set([1, 2]), difference(eqNumber)(new Set([1, 3]))), new Set([2]))
 *
 * @category combinators
 * @since 3.0.0
 */
export const difference = <A>(E: Eq<A>): ((that: ReadonlySet<A>) => (me: ReadonlySet<A>) => ReadonlySet<A>) => {
  const elemE = elem(E)
  return (that) => filter((a: A) => !elemE(a)(that))
}

/**
 * @category instances
 * @since 3.0.0
 */
export const getUnionMonoid = <A>(E: Eq<A>): Monoid<ReadonlySet<A>> => ({
  concat: union(E),
  empty
})

/**
 * @category instances
 * @since 3.0.0
 */
export const getIntersectionSemigroup = <A>(E: Eq<A>): Semigroup<ReadonlySet<A>> => ({
  concat: intersection(E)
})

/**
 * @since 3.0.0
 */
export const reduce = <A>(O: Ord<A>): (<B>(b: B, f: (b: B, a: A) => B) => (fa: ReadonlySet<A>) => B) => {
  const toReadonlyArrayO = toReadonlyArray(O)
  return (b, f) => (fa) => toReadonlyArrayO(fa).reduce(f, b)
}

/**
 * @since 3.0.0
 */
export const foldMap = <A, M>(O: Ord<A>, M: Monoid<M>): ((f: (a: A) => M) => (fa: ReadonlySet<A>) => M) => {
  const toReadonlyArrayO = toReadonlyArray(O)
  return (f) => (fa) => toReadonlyArrayO(fa).reduce((b, a) => M.concat(f(a))(b), M.empty)
}

/**
 * Create a set with one element
 *
 * @category constructors
 * @since 3.0.0
 */
export const singleton = <A>(a: A): ReadonlySet<A> => new Set([a])

/**
 * Insert a value into a set
 *
 * @category combinators
 * @since 3.0.0
 */
export const insert = <A>(E: Eq<A>): ((a: A) => (set: ReadonlySet<A>) => ReadonlySet<A>) => {
  const elemE = elem(E)
  return (a) => (set) => {
    if (!elemE(a)(set)) {
      const r = new Set(set)
      r.add(a)
      return r
    } else {
      return set
    }
  }
}

/**
 * Delete a value from a set
 *
 * @category combinators
 * @since 3.0.0
 */
export const remove = <A>(E: Eq<A>) => (a: A): ((set: ReadonlySet<A>) => ReadonlySet<A>) => filter(not(E.equals(a)))

/**
 * Create a set from an array
 *
 * @category constructors
 * @since 3.0.0
 */
export const fromReadonlyArray = <A>(E: Eq<A>) => (as: ReadonlyArray<A>): ReadonlySet<A> => {
  const len = as.length
  const r = new Set<A>()
  const has = elem(E)
  for (let i = 0; i < len; i++) {
    const a = as[i]
    if (!has(a)(r)) {
      r.add(a)
    }
  }
  return r
}

/**
 * @category combinators
 * @since 3.0.0
 */
export const compact = <A>(E: Eq<A>): ((fa: ReadonlySet<Option<A>>) => ReadonlySet<A>) => filterMap(E)(identity)

/**
 * @since 3.0.0
 */
export const separate = <E, A>(EE: Eq<E>, EA: Eq<A>) => (
  fa: ReadonlySet<Either<E, A>>
): Separated<ReadonlySet<E>, ReadonlySet<A>> => {
  const elemEE = elem(EE)
  const elemEA = elem(EA)
  const left: Set<E> = new Set()
  const right: Set<A> = new Set()
  fa.forEach((e) => {
    switch (e._tag) {
      case 'Left':
        if (!elemEE(e.left)(left)) {
          left.add(e.left)
        }
        break
      case 'Right':
        if (!elemEA(e.right)(right)) {
          right.add(e.right)
        }
        break
    }
  })
  return { left, right }
}

/**
 * @category combinators
 * @since 3.0.0
 */
export const filterMap = <B>(E: Eq<B>): (<A>(f: (a: A) => Option<B>) => (fa: ReadonlySet<A>) => ReadonlySet<B>) => {
  const elemE = elem(E)
  return (f) => (fa) => {
    const r: Set<B> = new Set()
    fa.forEach((a) => {
      const ob = f(a)
      if (ob._tag === 'Some' && !elemE(ob.value)(r)) {
        r.add(ob.value)
      }
    })
    return r
  }
}
