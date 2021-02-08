import * as E from '../src/Either'
import { pipe } from '../src/function'
import * as O from '../src/Option'
import * as R from '../src/Reader'
import * as _ from '../src/ReaderEither'
import * as S from '../src/string'
import * as U from './util'
import * as Sep from '../src/Separated'

describe('ReaderEither', () => {
  describe('pipeables', () => {
    it('map', () => {
      U.deepStrictEqual(pipe(_.right(1), _.map(U.double))({}), E.right(2))
    })

    it('alt', () => {
      const assertAlt = (
        a: _.ReaderEither<null, string, number>,
        b: _.ReaderEither<null, string, number>,
        expected: E.Either<string, number>
      ) => {
        U.deepStrictEqual(
          pipe(
            a,
            _.alt(() => b)
          )(null),
          expected
        )
      }
      assertAlt(_.right(1), _.right(2), E.right(1))
      assertAlt(_.right(1), _.left('b'), E.right(1))
      assertAlt(_.left('a'), _.right(2), E.right(2))
      assertAlt(_.left('a'), _.left('b'), E.left('b'))
    })

    it('ap', () => {
      U.deepStrictEqual(pipe(_.right(U.double), _.ap(_.right(1)))({}), E.right(2))
    })

    it('apFirst', () => {
      U.deepStrictEqual(pipe(_.right('a'), _.apFirst(_.right('b')))({}), E.right('a'))
    })

    it('apSecond', () => {
      U.deepStrictEqual(pipe(_.right('a'), _.apSecond(_.right('b')))({}), E.right('b'))
    })

    it('chainFirst', () => {
      const f = (n: number) => _.right(n * 2)
      U.deepStrictEqual(pipe(_.right(1), _.chainFirst(f))({}), E.right(1))
    })

    it('chainFirstW', () => {
      const f = (n: number): _.ReaderEither<unknown, boolean, number> => _.right(n * 2)
      U.deepStrictEqual(pipe(_.right<number, unknown, string>(1), _.chainFirstW(f))({}), E.right(1))
    })

    it('flatten', () => {
      U.deepStrictEqual(pipe(_.right(_.right('a')), _.flatten)({}), E.right('a'))
    })

    it('mapLeft', () => {
      const len = (s: string) => s.length
      U.deepStrictEqual(pipe(_.right(1), _.mapLeft(len))({}), E.right(1))
      U.deepStrictEqual(pipe(_.left('aa'), _.mapLeft(len))({}), E.left(2))
    })

    it('bimap', () => {
      const len = (s: string) => s.length
      U.deepStrictEqual(pipe(_.right(1), _.bimap(len, U.double))({}), E.right(2))
      U.deepStrictEqual(pipe(_.left('aaa'), _.bimap(len, U.double))({}), E.left(3))
    })

    it('fromOption', () => {
      U.deepStrictEqual(
        pipe(
          O.none,
          _.fromOption(() => 'none')
        )({}),
        E.left('none')
      )
      U.deepStrictEqual(
        pipe(
          O.some(1),
          _.fromOption(() => 'none')
        )({}),
        E.right(1)
      )
    })

    it('fromPredicate', () => {
      const f = _.fromPredicate((n: number) => n >= 2)
      U.deepStrictEqual(f(3)({}), E.right(3))
      U.deepStrictEqual(f(1)({}), E.left(1))
    })

    it('filterOrElse', () => {
      const e1 = pipe(
        _.right(12),
        _.filterOrElse(
          (n) => n > 10,
          () => 'a'
        )
      )({})
      U.deepStrictEqual(e1, E.right(12))
      const e2 = pipe(
        _.right(7),
        _.filterOrElse(
          (n) => n > 10,
          () => 'a'
        )
      )({})
      U.deepStrictEqual(e2, E.left('a'))
    })
  })

  it('match', () => {
    const match = _.match(
      (s: string) => R.of(s.length),
      (n: number) => R.of(n * 2)
    )
    U.deepStrictEqual(match(_.right(1))({}), 2)
    U.deepStrictEqual(match(_.left('aaa'))({}), 3)
  })

  it('getOrElse', () => {
    const getOrElse = _.getOrElse((s: string) => R.of(s.length))
    U.deepStrictEqual(getOrElse(_.right(1))({}), 1)
    U.deepStrictEqual(getOrElse(_.left('aaa'))({}), 3)
  })

  it('orElse', () => {
    const orElse = _.orElse((s: string) => (s.length > 2 ? _.right(1) : _.left(2)))
    U.deepStrictEqual(orElse(_.right(1))({}), E.right(1))
  })

  it('ask', () => {
    U.deepStrictEqual(_.ask()({}), E.right({}))
  })

  it('asks', () => {
    U.deepStrictEqual(_.asks((r: { readonly a: number }) => r.a)({ a: 1 }), E.right(1))
  })

  it('getApplicativeReaderValidation', () => {
    const A = _.getApplicativeReaderValidation(S.Monoid)
    const tuple = <A>(a: A) => <B>(b: B): readonly [A, B] => [a, b]
    U.deepStrictEqual(pipe(_.left('a'), A.map(tuple), A.ap(_.left('b')))(null), E.left('ab'))
  })

  it('getAltReaderValidation', () => {
    const A = _.getAltReaderValidation(S.Monoid)
    U.deepStrictEqual(
      pipe(
        _.left('a'),
        A.alt(() => _.left('b'))
      )(null),
      E.left('ab')
    )
  })

  it('chainEitherK', () => {
    const f = (s: string) => (s.length === 1 ? E.right(s.length) : E.left('b'))
    U.deepStrictEqual(pipe(_.right('a'), _.chainEitherK(f))({}), E.right(1))
    U.deepStrictEqual(pipe(_.right('aa'), _.chainEitherK(f))({}), E.left('b'))
  })

  it('do notation', () => {
    U.deepStrictEqual(
      pipe(
        _.right<number, void, string>(1),
        _.bindTo('a'),
        _.bind('b', () => _.right('b'))
      )(undefined),
      E.right({ a: 1, b: 'b' })
    )
  })

  it('apS', () => {
    U.deepStrictEqual(
      pipe(_.right<number, void, string>(1), _.bindTo('a'), _.apS('b', _.right('b')))(undefined),
      E.right({ a: 1, b: 'b' })
    )
  })

  it('apT', () => {
    U.deepStrictEqual(
      pipe(_.right<number, {}, string>(1), _.tupled, _.apT(_.right('b')))({}),
      E.right([1, 'b'] as const)
    )
  })

  it('sequenceReadonlyArray', () => {
    U.deepStrictEqual(pipe([_.right(1), _.right(2)], _.sequenceReadonlyArray)(undefined), E.right([1, 2]))
    U.deepStrictEqual(pipe([_.right(1), _.left('a')], _.sequenceReadonlyArray)(undefined), E.left('a'))
  })

  it('getCompactable', () => {
    const C = _.getCompactable(S.Monoid)
    U.deepStrictEqual(C.compact(_.of(O.some('a')))({}), E.right('a'))
  })

  it('getFilterable', () => {
    const F = _.getFilterable(S.Monoid)
    const fa: _.ReaderEither<unknown, string, string> = _.of('a')
    U.deepStrictEqual(
      pipe(
        fa,
        F.filter((s) => s.length > 0)
      )({}),
      E.right('a')
    )
    U.deepStrictEqual(
      pipe(
        fa,
        F.filterMap((s) => (s.length > 0 ? O.some(s.length) : O.none))
      )({}),
      E.right(1)
    )
    const s1 = pipe(
      fa,
      F.partition((s) => s.length > 0)
    )
    U.deepStrictEqual(Sep.left(s1)({}), E.left(''))
    U.deepStrictEqual(Sep.right(s1)({}), E.right('a'))
    const s2 = pipe(
      fa,
      F.partitionMap((s) => (s.length > 0 ? E.right(s.length) : E.left(s)))
    )
    U.deepStrictEqual(Sep.left(s2)({}), E.left(''))
    U.deepStrictEqual(Sep.right(s2)({}), E.right(1))
  })
})
