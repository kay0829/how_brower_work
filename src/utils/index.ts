/**
 * 각 함수마다 연속된 숫자, 소문자, 대문자 배열을 만드는 메서드
 * @returns {Array<string>} 예)['a', 'b', 'c', ..., 'z']
*/
export const numberCharacters: Array<string> = range(
    "0".charCodeAt(0),
    "9".charCodeAt(0),
).map((x) => String.fromCharCode(x));

export const upperAlphabet: Array<string> = range(
    "A".charCodeAt(0),
    "Z".charCodeAt(0),
).map((x) => String.fromCharCode(x));

export const lowerAlphabet: Array<string> = range(
    "a".charCodeAt(0),
    "z".charCodeAt(0),
).map((x) => String.fromCharCode(x));

/**
 * 입력받은 시작 숫자부터 끝 숫자까지 연속된 배열 만드는 메서드
 * @param {number} start 예) 97
 * @param {number} end 예) 122
 * @returns {Array<number>} 예)[97, 98, 99, ..., 122]
*/
export function range(
    start: number,
    stop: number,
): Array<number> {
    if (stop > start) {
        return Array.from({length: stop - start + 1}, (_, i: number) => i + start);
    }

    return [];
}

/**
 * 파라미터로 받은 문자열이 숫자 또는 대문자/소문자 알파벳인지 여부를 반환하는 메서드
*/
export function isNumOrAlphabet(str: string) {
    return (lowerAlphabet.indexOf(str) !== -1 ||
    upperAlphabet.indexOf(str) !== -1 ||
    numberCharacters.indexOf(str) !== -1);
}

/**
 * 에러를 내는 메서드
 * @param {string} message 예) "에러가 발생했습니다."
*/
export function throwError(message: string) {
    throw new Error(message);
}