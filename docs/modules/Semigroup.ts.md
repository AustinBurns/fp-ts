---
title: Semigroup.ts
nav_order: 67
parent: Modules
---

## Semigroup overview

If a type `A` can form a `Semigroup` it has an **associative** binary operation.

```ts
interface Semigroup<A> {
  readonly concat: (second: A) => (first: A) => A
}
```

Associativity means the following equality must hold for any choice of `x`, `y`, and `z`.

```ts
pipe(x, concat(pipe(y, concat(z)))) = pipe(x, concat(y), concat(z))
```

Added in v3.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [instances](#instances)
  - [getDualSemigroup](#getdualsemigroup)
  - [getFirstSemigroup](#getfirstsemigroup)
  - [getFunctionSemigroup](#getfunctionsemigroup)
  - [getIntercalateSemigroup](#getintercalatesemigroup)
  - [getJoinSemigroup](#getjoinsemigroup)
  - [getLastSemigroup](#getlastsemigroup)
  - [getMeetSemigroup](#getmeetsemigroup)
  - [getObjectSemigroup](#getobjectsemigroup)
  - [getStructSemigroup](#getstructsemigroup)
  - [getTupleSemigroup](#gettuplesemigroup)
  - [semigroupAll](#semigroupall)
  - [semigroupAny](#semigroupany)
  - [semigroupProduct](#semigroupproduct)
  - [semigroupString](#semigroupstring)
  - [semigroupSum](#semigroupsum)
  - [semigroupVoid](#semigroupvoid)
- [type classes](#type-classes)
  - [Semigroup (interface)](#semigroup-interface)
- [utils](#utils)
  - [fold](#fold)

---

# instances

## getDualSemigroup

The dual of a `Semigroup`, obtained by swapping the arguments of `concat`.

**Signature**

```ts
export declare function getDualSemigroup<A>(S: Semigroup<A>): Semigroup<A>
```

**Example**

```ts
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(pipe('a', S.getDualSemigroup(S.semigroupString).concat('b')), 'ba')
```

Added in v3.0.0

## getFirstSemigroup

Always return the first argument.

**Signature**

```ts
export declare function getFirstSemigroup<A = never>(): Semigroup<A>
```

**Example**

```ts
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(pipe(1, S.getFirstSemigroup<number>().concat(2)), 1)
```

Added in v3.0.0

## getFunctionSemigroup

Unary functions form a semigroup as long as you can provide a semigroup for the codomain.

**Signature**

```ts
export declare function getFunctionSemigroup<S>(S: Semigroup<S>): <A = never>() => Semigroup<(a: A) => S>
```

**Example**

```ts
import { Predicate, pipe } from 'fp-ts/function'
import * as S from 'fp-ts/Semigroup'

const f: Predicate<number> = (n) => n <= 2
const g: Predicate<number> = (n) => n >= 0

const S1 = S.getFunctionSemigroup(S.semigroupAll)<number>()

assert.deepStrictEqual(pipe(f, S1.concat(g))(1), true)
assert.deepStrictEqual(pipe(f, S1.concat(g))(3), false)

const S2 = S.getFunctionSemigroup(S.semigroupAny)<number>()

assert.deepStrictEqual(pipe(f, S2.concat(g))(1), true)
assert.deepStrictEqual(pipe(f, S2.concat(g))(3), true)
```

Added in v3.0.0

## getIntercalateSemigroup

You can glue items between and stay associative.

**Signature**

```ts
export declare function getIntercalateSemigroup<A>(a: A): Endomorphism<Semigroup<A>>
```

**Example**

```ts
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

const S1 = S.getIntercalateSemigroup(' ')(S.semigroupString)

assert.strictEqual(pipe('a', S1.concat('b')), 'a b')
assert.strictEqual(pipe('a', S1.concat('b'), S1.concat('c')), 'a b c')
```

Added in v3.0.0

## getJoinSemigroup

Get a semigroup where `concat` will return the maximum, based on the provided order.

**Signature**

```ts
export declare function getJoinSemigroup<A>(O: Ord<A>): Semigroup<A>
```

**Example**

```ts
import * as O from 'fp-ts/Ord'
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

const S1 = S.getJoinSemigroup(O.ordNumber)

assert.deepStrictEqual(pipe(1, S1.concat(2)), 2)
```

Added in v3.0.0

## getLastSemigroup

Always return the last argument.

**Signature**

```ts
export declare function getLastSemigroup<A = never>(): Semigroup<A>
```

**Example**

```ts
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(pipe(1, S.getLastSemigroup<number>().concat(2)), 2)
```

Added in v3.0.0

## getMeetSemigroup

Get a semigroup where `concat` will return the minimum, based on the provided order.

**Signature**

```ts
export declare function getMeetSemigroup<A>(O: Ord<A>): Semigroup<A>
```

**Example**

```ts
import * as O from 'fp-ts/Ord'
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

const S1 = S.getMeetSemigroup(O.ordNumber)

assert.deepStrictEqual(pipe(1, S1.concat(2)), 1)
```

Added in v3.0.0

## getObjectSemigroup

Return a semigroup for objects, preserving their type.

**Signature**

```ts
export declare function getObjectSemigroup<A extends object = never>(): Semigroup<A>
```

**Example**

```ts
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

interface Person {
  name: string
  age: number
}

const S1 = S.getObjectSemigroup<Person>()
assert.deepStrictEqual(pipe({ name: 'name', age: 23 }, S1.concat({ name: 'name', age: 24 })), { name: 'name', age: 24 })
```

Added in v3.0.0

## getStructSemigroup

Given a struct of semigroups returns a semigroup for the struct.

**Signature**

```ts
export declare function getStructSemigroup<O extends ReadonlyRecord<string, any>>(
  semigroups: { [K in keyof O]: Semigroup<O[K]> }
): Semigroup<O>
```

**Example**

```ts
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

interface Point {
  readonly x: number
  readonly y: number
}

const semigroupPoint = S.getStructSemigroup<Point>({
  x: S.semigroupSum,
  y: S.semigroupSum,
})

assert.deepStrictEqual(pipe({ x: 1, y: 2 }, semigroupPoint.concat({ x: 3, y: 4 })), { x: 4, y: 6 })
```

Added in v3.0.0

## getTupleSemigroup

Given a tuple of semigroups returns a semigroup for the tuple.

**Signature**

```ts
export declare function getTupleSemigroup<T extends ReadonlyArray<Semigroup<any>>>(
  ...semigroups: T
): Semigroup<{ [K in keyof T]: T[K] extends Semigroup<infer A> ? A : never }>
```

**Example**

```ts
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

const S1 = S.getTupleSemigroup(S.semigroupString, S.semigroupSum)
assert.deepStrictEqual(pipe(['a', 1], S1.concat(['b', 2])), ['ab', 3])

const S2 = S.getTupleSemigroup(S.semigroupString, S.semigroupSum, S.semigroupAll)
assert.deepStrictEqual(pipe(['a', 1, true], S2.concat(['b', 2, false])), ['ab', 3, false])
```

Added in v3.0.0

## semigroupAll

`boolean` semigroup under conjunction.

**Signature**

```ts
export declare const semigroupAll: Semigroup<boolean>
```

**Example**

```ts
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(pipe(true, S.semigroupAll.concat(true)), true)
assert.deepStrictEqual(pipe(true, S.semigroupAll.concat(false)), false)
```

Added in v3.0.0

## semigroupAny

`boolean` semigroup under disjunction.

**Signature**

```ts
export declare const semigroupAny: Semigroup<boolean>
```

**Example**

```ts
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(pipe(true, S.semigroupAny.concat(true)), true)
assert.deepStrictEqual(pipe(true, S.semigroupAny.concat(false)), true)
assert.deepStrictEqual(pipe(false, S.semigroupAny.concat(false)), false)
```

Added in v3.0.0

## semigroupProduct

`number` semigroup under multiplication.

**Signature**

```ts
export declare const semigroupProduct: Semigroup<number>
```

**Example**

```ts
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(pipe(2, S.semigroupProduct.concat(3)), 6)
```

Added in v3.0.0

## semigroupString

`string` semigroup under concatenation.

**Signature**

```ts
export declare const semigroupString: Semigroup<string>
```

**Example**

```ts
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(pipe('a', S.semigroupString.concat('b')), 'ab')
```

Added in v3.0.0

## semigroupSum

`number` semigroup under addition.

**Signature**

```ts
export declare const semigroupSum: Semigroup<number>
```

**Example**

```ts
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(pipe(2, S.semigroupSum.concat(3)), 5)
```

Added in v3.0.0

## semigroupVoid

**Signature**

```ts
export declare const semigroupVoid: Semigroup<void>
```

Added in v3.0.0

# type classes

## Semigroup (interface)

**Signature**

```ts
export interface Semigroup<A> extends Magma<A> {}
```

Added in v3.0.0

# utils

## fold

Given a sequence of `as`, concat them and return the total.

If `as` is empty, return the provided `startWith` value.

**Signature**

```ts
export declare const fold: <A>(S: Semigroup<A>) => (startWith: A) => (as: readonly A[]) => A
```

**Example**

```ts
import * as S from 'fp-ts/Semigroup'

const sum = S.fold(S.semigroupSum)(0)

assert.deepStrictEqual(sum([1, 2, 3]), 6)
assert.deepStrictEqual(sum([]), 0)
```

Added in v3.0.0
