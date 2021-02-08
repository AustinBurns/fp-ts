import { left, right } from '../src/Either'
import * as N from '../src/number'
import { identity, pipe } from '../src/function'
import * as S from '../src/string'
import * as _ from '../src/Option'
import * as RA from '../src/ReadonlyArray'
import * as T from '../src/Task'
import * as U from './util'
import { separated } from '../src/Separated'

const p = (n: number): boolean => n > 2

describe('Option', () => {
  describe('pipeables', () => {
    it('map', () => {
      U.deepStrictEqual(pipe(_.some(2), _.map(U.double)), _.some(4))
      U.deepStrictEqual(pipe(_.none, _.map(U.double)), _.none)
    })

    it('ap', () => {
      U.deepStrictEqual(pipe(_.some(U.double), _.ap(_.some(2))), _.some(4))
      U.deepStrictEqual(pipe(_.some(U.double), _.ap(_.none)), _.none)
      U.deepStrictEqual(pipe(_.none, _.ap(_.some(2))), _.none)
      U.deepStrictEqual(pipe(_.none, _.ap(_.none)), _.none)
    })

    it('apFirst', () => {
      U.deepStrictEqual(pipe(_.some('a'), _.apFirst(_.some('b'))), _.some('a'))
    })

    it('apSecond', () => {
      U.deepStrictEqual(pipe(_.some('a'), _.apSecond(_.some('b'))), _.some('b'))
    })

    it('chain', () => {
      const f = (n: number) => _.some(n * 2)
      const g = () => _.none
      U.deepStrictEqual(pipe(_.some(1), _.chain(f)), _.some(2))
      U.deepStrictEqual(pipe(_.none, _.chain(f)), _.none)
      U.deepStrictEqual(pipe(_.some(1), _.chain(g)), _.none)
      U.deepStrictEqual(pipe(_.none, _.chain(g)), _.none)
    })

    it('chainFirst', () => {
      const f = (n: number) => _.some(n * 2)
      U.deepStrictEqual(pipe(_.some(1), _.chainFirst(f)), _.some(1))
    })

    it('duplicate', () => {
      U.deepStrictEqual(pipe(_.some(1), _.duplicate), _.some(_.some(1)))
    })

    it('flatten', () => {
      U.deepStrictEqual(pipe(_.some(_.some(1)), _.flatten), _.some(1))
    })

    it('alt', () => {
      const assertAlt = (a: _.Option<number>, b: _.Option<number>, expected: _.Option<number>) => {
        U.deepStrictEqual(
          pipe(
            a,
            _.alt(() => b)
          ),
          expected
        )
      }
      assertAlt(_.some(1), _.some(2), _.some(1))
      assertAlt(_.some(1), _.none, _.some(1))
      assertAlt(_.none, _.some(2), _.some(2))
      assertAlt(_.none, _.none, _.none)
    })

    it('extend', () => {
      const f = _.getOrElse(() => 0)
      U.deepStrictEqual(pipe(_.some(2), _.extend(f)), _.some(2))
      U.deepStrictEqual(pipe(_.none, _.extend(f)), _.none)
    })

    it('reduce', () => {
      U.deepStrictEqual(
        pipe(
          _.none,
          _.reduce(2, (b, a) => b + a)
        ),
        2
      )
      U.deepStrictEqual(
        pipe(
          _.some(3),
          _.reduce(2, (b, a) => b + a)
        ),
        5
      )
    })

    it('foldMap', () => {
      U.deepStrictEqual(pipe(_.some('a'), _.foldMap(S.Monoid)(identity)), 'a')
      U.deepStrictEqual(pipe(_.none, _.foldMap(S.Monoid)(identity)), '')
    })

    it('reduceRight', () => {
      const f = (a: string, acc: string) => acc + a
      U.deepStrictEqual(pipe(_.some('a'), _.reduceRight('', f)), 'a')
      U.deepStrictEqual(pipe(_.none, _.reduceRight('', f)), '')
    })

    it('compact', () => {
      U.deepStrictEqual(_.compact(_.none), _.none)
      U.deepStrictEqual(_.compact(_.some(_.none)), _.none)
      U.deepStrictEqual(_.compact(_.some(_.some('123'))), _.some('123'))
    })

    it('separate', () => {
      U.deepStrictEqual(_.separate(_.none), separated(_.none, _.none))
      U.deepStrictEqual(_.separate(_.some(left('123'))), separated(_.some('123'), _.none))
      U.deepStrictEqual(_.separate(_.some(right('123'))), separated(_.none, _.some('123')))
    })

    it('filter', () => {
      const predicate = (a: number) => a === 2
      U.deepStrictEqual(pipe(_.none, _.filter(predicate)), _.none)
      U.deepStrictEqual(pipe(_.some(1), _.filter(predicate)), _.none)
      U.deepStrictEqual(pipe(_.some(2), _.filter(predicate)), _.some(2))
    })

    it('filterMap', () => {
      const f = (n: number) => (p(n) ? _.some(n + 1) : _.none)
      U.deepStrictEqual(pipe(_.none, _.filterMap(f)), _.none)
      U.deepStrictEqual(pipe(_.some(1), _.filterMap(f)), _.none)
      U.deepStrictEqual(pipe(_.some(3), _.filterMap(f)), _.some(4))
    })

    it('partition', () => {
      U.deepStrictEqual(pipe(_.none, _.partition(p)), separated(_.none, _.none))
      U.deepStrictEqual(pipe(_.some(1), _.partition(p)), separated(_.some(1), _.none))
      U.deepStrictEqual(pipe(_.some(3), _.partition(p)), separated(_.none, _.some(3)))
    })

    it('partitionMap', () => {
      const f = (n: number) => (p(n) ? right(n + 1) : left(n - 1))
      U.deepStrictEqual(pipe(_.none, _.partitionMap(f)), separated(_.none, _.none))
      U.deepStrictEqual(pipe(_.some(1), _.partitionMap(f)), separated(_.some(0), _.none))
      U.deepStrictEqual(pipe(_.some(3), _.partitionMap(f)), separated(_.none, _.some(4)))
    })

    it('traverse', () => {
      U.deepStrictEqual(
        pipe(
          _.some('hello'),
          _.traverse(RA.Applicative)(() => [])
        ),
        []
      )
      U.deepStrictEqual(
        pipe(
          _.some('hello'),
          _.traverse(RA.Applicative)((s) => [s.length])
        ),
        [_.some(5)]
      )
      U.deepStrictEqual(
        pipe(
          _.none,
          _.traverse(RA.Applicative)((s) => [s])
        ),
        [_.none]
      )
    })

    it('sequence', () => {
      const sequence = _.sequence(RA.Applicative)
      U.deepStrictEqual(sequence(_.some([1, 2])), [_.some(1), _.some(2)])
      U.deepStrictEqual(sequence(_.none), [_.none])
    })

    it('wither', async () => {
      const wither = _.wither(T.ApplicativePar)((n: number) => T.of(p(n) ? _.some(n + 1) : _.none))
      U.deepStrictEqual(await pipe(_.none, wither)(), _.none)
      U.deepStrictEqual(await pipe(_.some(1), wither)(), _.none)
      U.deepStrictEqual(await pipe(_.some(3), wither)(), _.some(4))
    })

    it('wilt', async () => {
      const wilt = _.wilt(T.ApplicativePar)((n: number) => T.of(p(n) ? right(n + 1) : left(n - 1)))
      U.deepStrictEqual(await pipe(_.none, wilt)(), separated(_.none, _.none))
      U.deepStrictEqual(await pipe(_.some(1), wilt)(), separated(_.some(0), _.none))
      U.deepStrictEqual(await pipe(_.some(3), wilt)(), separated(_.none, _.some(4)))
    })
  })

  describe('constructors', () => {
    it('fromEither', () => {
      U.deepStrictEqual(_.fromEither(left('a')), _.none)
      U.deepStrictEqual(_.fromEither(right(1)), _.some(1))
    })
  })

  it('zero', () => {
    U.deepStrictEqual(_.zero(), _.none)
  })

  it('match', () => {
    const f = () => 'none'
    const g = (s: string) => `some${s.length}`
    const match = _.match(f, g)
    U.deepStrictEqual(match(_.none), 'none')
    U.deepStrictEqual(match(_.some('abc')), 'some3')
  })

  it('toNullable', () => {
    U.deepStrictEqual(_.toNullable(_.none), null)
    U.deepStrictEqual(_.toNullable(_.some(1)), 1)
  })

  it('toUndefined', () => {
    U.deepStrictEqual(_.toUndefined(_.none), undefined)
    U.deepStrictEqual(_.toUndefined(_.some(1)), 1)
  })

  it('getOrElse', () => {
    U.deepStrictEqual(
      pipe(
        _.some(1),
        _.getOrElse(() => 0)
      ),
      1
    )
    U.deepStrictEqual(
      pipe(
        _.none,
        _.getOrElse(() => 0)
      ),
      0
    )
  })

  it('getEq', () => {
    const { equals } = _.getEq(N.Eq)
    U.deepStrictEqual(equals(_.none)(_.none), true)
    U.deepStrictEqual(equals(_.none)(_.some(1)), false)
    U.deepStrictEqual(equals(_.some(1))(_.none), false)
    U.deepStrictEqual(equals(_.some(2))(_.some(1)), false)
    U.deepStrictEqual(equals(_.some(1))(_.some(2)), false)
    U.deepStrictEqual(equals(_.some(2))(_.some(2)), true)
  })

  it('getOrd', () => {
    const OS = _.getOrd(S.Ord)
    U.deepStrictEqual(pipe(_.none, OS.compare(_.none)), 0)
    U.deepStrictEqual(pipe(_.some('a'), OS.compare(_.none)), 1)
    U.deepStrictEqual(pipe(_.none, OS.compare(_.some('a'))), -1)
    U.deepStrictEqual(pipe(_.some('a'), OS.compare(_.some('a'))), 0)
    U.deepStrictEqual(pipe(_.some('a'), OS.compare(_.some('b'))), -1)
    U.deepStrictEqual(pipe(_.some('b'), OS.compare(_.some('a'))), 1)
  })

  it('chainNullableK', () => {
    interface X {
      readonly a?: {
        readonly b?: {
          readonly c?: {
            readonly d: number
          }
        }
      }
    }
    const x1: X = { a: {} }
    const x2: X = { a: { b: {} } }
    const x3: X = { a: { b: { c: { d: 1 } } } }
    U.deepStrictEqual(
      pipe(
        _.fromNullable(x1.a),
        _.chainNullableK((x) => x.b),
        _.chainNullableK((x) => x.c),
        _.chainNullableK((x) => x.d)
      ),
      _.none
    )
    U.deepStrictEqual(
      pipe(
        _.fromNullable(x2.a),
        _.chainNullableK((x) => x.b),
        _.chainNullableK((x) => x.c),
        _.chainNullableK((x) => x.d)
      ),
      _.none
    )
    U.deepStrictEqual(
      pipe(
        _.fromNullable(x3.a),
        _.chainNullableK((x) => x.b),
        _.chainNullableK((x) => x.c),
        _.chainNullableK((x) => x.d)
      ),
      _.some(1)
    )
  })

  it('getMonoid', () => {
    const M = _.getMonoid(S.Semigroup)
    U.deepStrictEqual(pipe(_.none, M.concat(_.none)), _.none)
    U.deepStrictEqual(pipe(_.none, M.concat(_.some('a'))), _.some('a'))
    U.deepStrictEqual(pipe(_.some('a'), M.concat(_.none)), _.some('a'))
    U.deepStrictEqual(pipe(_.some('b'), M.concat(_.some('a'))), _.some('ba'))
    U.deepStrictEqual(pipe(_.some('a'), M.concat(_.some('b'))), _.some('ab'))
  })

  it('fromNullable', () => {
    U.deepStrictEqual(_.fromNullable(2), _.some(2))
    U.deepStrictEqual(_.fromNullable(null), _.none)
    U.deepStrictEqual(_.fromNullable(undefined), _.none)
  })

  it('fromPredicate', () => {
    const f = _.fromPredicate(p)
    U.deepStrictEqual(f(1), _.none)
    U.deepStrictEqual(f(3), _.some(3))

    type Direction = 'asc' | 'desc'
    const parseDirection = _.fromPredicate((s: string): s is Direction => s === 'asc' || s === 'desc')
    U.deepStrictEqual(parseDirection('asc'), _.some('asc'))
    U.deepStrictEqual(parseDirection('foo'), _.none)
  })

  it('getFirstMonoid', () => {
    const M = _.getFirstMonoid<number>()
    U.deepStrictEqual(pipe(_.none, M.concat(_.none)), _.none)
    U.deepStrictEqual(pipe(_.some(1), M.concat(_.none)), _.some(1))
    U.deepStrictEqual(pipe(_.none, M.concat(_.some(1))), _.some(1))
    U.deepStrictEqual(pipe(_.some(1), M.concat(_.some(2))), _.some(1))
  })

  it('getLastMonoid', () => {
    const M = _.getLastMonoid<number>()
    U.deepStrictEqual(pipe(_.none, M.concat(_.none)), _.none)
    U.deepStrictEqual(pipe(_.some(1), M.concat(_.none)), _.some(1))
    U.deepStrictEqual(pipe(_.none, M.concat(_.some(1))), _.some(1))
    U.deepStrictEqual(pipe(_.some(1), M.concat(_.some(2))), _.some(2))
  })

  it('elem', () => {
    U.deepStrictEqual(pipe(_.none, _.elem(N.Eq)(2)), false)
    U.deepStrictEqual(pipe(_.some(2), _.elem(N.Eq)(2)), true)
    U.deepStrictEqual(pipe(_.some(2), _.elem(N.Eq)(1)), false)
  })

  it('isNone', () => {
    U.deepStrictEqual(_.isNone(_.none), true)
    U.deepStrictEqual(_.isNone(_.some(1)), false)
  })

  it('isSome', () => {
    U.deepStrictEqual(_.isSome(_.none), false)
    U.deepStrictEqual(_.isSome(_.some(1)), true)
  })

  it('exists', () => {
    const predicate = (a: number) => a === 2
    U.deepStrictEqual(pipe(_.none, _.exists(predicate)), false)
    U.deepStrictEqual(pipe(_.some(1), _.exists(predicate)), false)
    U.deepStrictEqual(pipe(_.some(2), _.exists(predicate)), true)
  })

  it('tryCatch', () => {
    U.deepStrictEqual(
      _.tryCatch(() => JSON.parse('2')),
      _.some(2)
    )
    U.deepStrictEqual(
      _.tryCatch(() => JSON.parse('(')),
      _.none
    )
  })

  it('getRefinement', () => {
    const f = (s: string | number): _.Option<string> => (typeof s === 'string' ? _.some(s) : _.none)
    const isString = _.getRefinement(f)
    U.deepStrictEqual(isString('s'), true)
    U.deepStrictEqual(isString(1), false)
    type A = { readonly type: 'A' }
    type B = { readonly type: 'B' }
    type C = A | B
    const isA = _.getRefinement<C, A>((c) => (c.type === 'A' ? _.some(c) : _.none))
    U.deepStrictEqual(isA({ type: 'A' }), true)
    U.deepStrictEqual(isA({ type: 'B' }), false)
  })

  it('getShow', () => {
    const Sh = _.getShow(S.Show)
    U.deepStrictEqual(Sh.show(_.some('a')), `some("a")`)
    U.deepStrictEqual(Sh.show(_.none), `none`)
  })

  it('getLeft', () => {
    U.deepStrictEqual(_.getLeft(right(1)), _.none)
    U.deepStrictEqual(_.getLeft(left('err')), _.some('err'))
  })

  it('getRight', () => {
    U.deepStrictEqual(_.getRight(right(1)), _.some(1))
    U.deepStrictEqual(_.getRight(left('err')), _.none)
  })

  it('do notation', () => {
    U.deepStrictEqual(
      pipe(
        _.some(1),
        _.bindTo('a'),
        _.bind('b', () => _.some('b'))
      ),
      _.some({ a: 1, b: 'b' })
    )
  })

  it('apS', () => {
    U.deepStrictEqual(pipe(_.some(1), _.bindTo('a'), _.apS('b', _.some('b'))), _.some({ a: 1, b: 'b' }))
  })

  it('apT', () => {
    U.deepStrictEqual(pipe(_.some(1), _.tupled, _.apT(_.some('b'))), _.some([1, 'b'] as const))
  })

  it('fromNullableK', () => {
    const f = _.fromNullableK((n: number) => (n > 0 ? n : null))
    U.deepStrictEqual(f(1), _.some(1))
    U.deepStrictEqual(f(-1), _.none)
  })

  it('sequenceReadonlyArray', () => {
    U.deepStrictEqual(pipe([_.of(1), _.of(2)], _.sequenceReadonlyArray), _.some([1, 2]))
    U.deepStrictEqual(pipe([_.of(1), _.none], _.sequenceReadonlyArray), _.none)
  })

  it('tryCatchK', () => {
    const f = _.tryCatchK((s: string) => {
      const len = s.length
      if (len > 0) {
        return len
      }
      throw new Error('empty string')
    })
    U.deepStrictEqual(f('a'), _.some(1))
    U.deepStrictEqual(f(''), _.none)
  })
})
