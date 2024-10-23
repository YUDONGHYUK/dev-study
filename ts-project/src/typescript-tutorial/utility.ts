/**
 * 배열의 첫번째 요소의 타입을 추출하는 유틸리티 타입
 */
type Head<T extends any[]> = T extends [infer A, ...any[]] ? A : undefined;

type Head1 = Head<[1, 2, 3, 4]>; // 1
type Head2 = Head<[1]>; // 1
type Head3 = Head<[]>; // undefined

/**
 * 두 개의 Generic 타입이 같은 값인지 판단하는 유틸리티 타입(같으면 1, 다르면 0)
 */
type Equal<A, B> = A extends B ? (B extends A ? 1 : 0) : 0;

type Equal1 = Equal<1, 0>; // 0
type Equal2 = Equal<1, 1>; // 1

const Pass = 1;
const Fail = 0;

/**
 * 두 개의 제네릭 타입이 같은지 비교하는 함수
 * @param params : 비교의 결과를 params로 받는다.
 */
declare function check<A, B>(params: Equal<Equal<A, B>, typeof Pass>): void;

check<Head<[1, 2, 3, 4]>, 1>(Pass);
check<Head<[]>, undefined>(Pass);
check<Head<[4, 2, 3]>, 4>(Pass);

/**
 * 배열 T의 길이를 가져오는 유틸리티 타입
 */
type Length<T extends any[]> = T['length'];

check<Length<[1, 2, 3]>, 3>(Pass);

/**
 * 배열 T가 비어있는지 확인하는 유틸리티 타입(비어 있으면: false, 비어있지 않으면: true)
 */
type HasTail<T extends any[]> = Length<T> extends 0 ? false : true;

check<HasTail<[1, 2, 3]>, true>(Pass);
check<HasTail<[3]>, true>(Pass);
check<HasTail<[]>, false>(Pass);

/**
 * 배열 T의 첫번째 요소를 제외한 나머지 부분을 추출하는 유틸리티 타입
 */
type Tail<T extends any[]> = T extends [any, ...infer A] ? A : [];

check<Tail<[1, 2, 3, 4, 5]>, [2, 3, 4, 5]>(Pass);
check<Tail<[4, 5]>, [5]>(Pass);
check<Tail<[4]>, []>(Pass);
check<Tail<[]>, []>(Pass);

/**
 * 배열 T의 마지막 요소의 타입을 추출하는 유틸리티 타입
 */
type Last<T extends any[]> = T extends [...any[], infer A] ? A : undefined;

check<Last<[1, 2, 3, 4]>, 4>(Pass);
check<Last<[1]>, 1>(Pass);
check<Last<[]>, undefined>(Pass);
check<Last<[2]>, undefined>(Fail);

/**
 * 배열 T의 앞부분에 새로운 요소 E를 추가하는 유틸리티 타입
 */
type Prepend<T extends any[], E> = [E, ...T];

check<Prepend<[], 1>, [1]>(Pass);
check<Prepend<[3, 4, 5], 2>, [2, 3, 4, 5]>(Pass);

/**
 * 배열 T의 앞쪽에서 N개의 요소를 제거하고, 남은 배열을 반환하는 유틸리티 타입
 * Tip: const a = { '0': '1' as const }['0'] -> '1'
 */
type Drop<N, T extends any[], P extends any[] = []> = {
  '0': T;
  '1': Drop<N, Tail<T>, Prepend<P, Head<T>>>;
}[Length<P> extends N ? '0' : '1'];

check<Drop<3, [1, 2, 3, 4, 5, 6]>, [4, 5, 6]>(Pass);
check<Drop<0, [1, 2, 3, 4, 5, 6]>, [1, 2, 3, 4, 5, 6]>(Pass);
check<Drop<7, [1, 2, 3, 4, 5, 6]>, []>(Pass);
check<Drop<6, [1, 2, 3, 4, 5, 6]>, []>(Pass);

/**
 * 배열 T의 요소를 역순으로 배치하는 유틸리티 타입
 */
type Reverse<T extends any[], P extends any[] = []> = {
  '0': P;
  '1': Reverse<Tail<T>, Prepend<P, Head<T>>>;
}[Length<T> extends 0 ? '0' : '1'];

check<Reverse<[1, 2, 3, 4, 5, 6]>, [6, 5, 4, 3, 2, 1]>(Pass);

/**
 * 두 배열 A, B를 하나의 배열로 합치는 유틸리티 타입
 */
type Concat<A extends any[], B extends any[]> = [...A, ...B];

check<Concat<[1, 2, 3], [4, 5, 6]>, [1, 2, 3, 4, 5, 6]>(Pass);

/**
 * 배열 A의 끝에 요소 B를 추가하는 유틸리티 타입
 * 다른 방법: type Append<A extends any[], B> = [...A, B];
 */
type Append<A extends any[], B> = Concat<A, [B]>;

check<Append<[1, 2, 3], 4>, [1, 2, 3, 4]>(Pass);

/**
 * 배열 A의 각 요소를 특정 구분자(S)로 결합하는 문자열을 만들어내는 유틸리티 타입
 */
type Join<T extends any[], S extends string> = Length<T> extends 0
  ? ''
  : Length<T> extends 1
  ? `${T[0]}`
  : `${T[0]}${S}${Join<Tail<T>, S>}`;

check<Join<[1, 2, 3, 4, 5], ','>, '1,2,3,4,5'>(Pass);
check<Join<[1], ','>, '1'>(Pass);
check<Join<[], ','>, ''>(Pass);

/**
 * 문자열 T에서 문자열 A를 찾아서 문자열 B로 치환하는 유틸리티 타입
 */
type Replace<
  T extends string,
  A extends string,
  B extends string
> = T extends `${infer P1}${A}${infer P2}`
  ? Replace<`${P1}${B}${P2}`, A, B>
  : T;

check<Replace<'abcdfdfda', 'f', 'c'>, 'abcdcdcda'>(Pass);

/**
 * 문자열 T를 구분자 S로 분할하여 배열로 반환하는 유틸리티 타입
 */
type Split<
  T extends string,
  S extends string,
  P extends any[] = []
> = T extends `${infer A}${S}${infer B}`
  ? Split<B, S, Append<P, A>>
  : Append<P, T>;

check<Split<'asd,f,fd,dfasd', ','>, ['asd', 'f', 'fd', 'dfasd']>(Pass);
check<Split<'abcd', ','>, ['abcd']>(Pass);

/**
 * 배열 T를 최대 N 수준까지 평탄화 하는 유틸리티 타입
 */
type Flat<T, N extends number = 1> = {
  0: T;
  1: T extends Array<infer A> ? Flat<A, [-1, 0, 1, 2, 3, 4, 5, 6, 7][N]> : T;
}[N extends -1 ? 0 : 1];

check<Flat<[1, 2, 3, [4]], 1>, 1 | 2 | 3 | 4>(Pass);
check<Flat<[1, 2, 3, [[4]]], 1>, 1 | 2 | 3 | [4]>(Pass);
check<Flat<[1, 2, 3, [[4]]], 2>, 1 | 2 | 3 | 4>(Pass);
check<Flat<[1, 2, [3, [4]]], 1>, 1 | 2 | 3 | [4]>(Pass);
check<Flat<[1, 2, [3, [4]]], 2>, 1 | 2 | 3 | 4>(Pass);

/**
 * 배열을 지정한 깊이(n)만큼 평탄화 하는 함수
 * @param arr : 평탄화할 배열
 * @param n : 평탄화할 깊이
 */
declare function flat<T, N extends number = 1>(arr: T, n?: N): Flat<T, N>[];
const flat1 = flat([1, 2, 3]); // number[]
const flat2 = flat([1, 2, 3, [4]]); // number[]
const flat3 = flat([1, 2, 3, [[4]]]); // (number | number[])[]
const flat4 = flat([1, 2, 3, [[4]]], 2); // number[]
