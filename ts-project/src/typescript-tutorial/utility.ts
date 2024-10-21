/**
 * 배열의 첫번째 요소의 타입을 추출하는 유틸리티 함수
 */
type Head<T extends any[]> = T extends [infer A, ...any[]] ? A : undefined;

type Head1 = Head<[1, 2, 3, 4]>; // 1
type Head2 = Head<[1]>; // 1
type Head3 = Head<[]>; // undefined

/**
 * 두 개의 Generic 타입이 같은 값인지 판단하는 유틸리티 함수(같으면 1, 다르면 0)
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
