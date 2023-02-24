// 출처: https://github.com/elrion018/karl

// import { EachNode } from "./dom";
// import { throwError, numberCharacters, lowerAlphabet, upperAlphabet } from "./utils";

// interface IHtmlParser {
//     htmlCharacters: string;
//     curPos: number;
// }

// interface IAttribute {
//     name?: string;
//     value?: string;
//   }

// type TisMeetTheThreshold = (char: string) => boolean;

// export default class HtmlParser {
//     htmlCharacters: string;
//     curPos: number;

//     constructor(htmlCharacters: string, curPos: number) {
//         this.htmlCharacters = htmlCharacters;
//         this.curPos = curPos;
//     }

//     /**
//      * HTML 파싱을 위해 호출하는 메서드
//      * @param {void}
//      * @returns {EachNode} 
//      * EachNode {
// 	 *   children: [...],
// 	 *   nodeDetail: EachElement { tagName: 'div', attributes: { id : 'main', class: 'test' } }
//      * }
//     */
//     parse(): EachNode {
//         const nodes = this.parseNodes();

//         if (nodes.length === 1) {
//             return nodes.pop();
//         }

//         return createElement("html", {}, nodes);
//     }

//     /**
//      * 자식 노드를 파싱하는 메서드
//      * HtmlCharacters의 끝에 도달하거나 '</' 문자열(부모 태그가 닫힘을 의미)을 만나기 전까지
//      * parseNode()로 노드를 파싱하고 자식 노드에 추가한다.
//      * @param {void}
//      * @returns {Array<EachNode>}
//     */
//     parseNodes(): Array<EachNode> {
//         let nodes = [];

//         while (true) {
//             this.consumeWhiteSpace();

//             if (this.isEndOfDocument() || this.isStartWith("</")) {
//                 break;
//             }

//             nodes.push(this.parseNode());
//         }

//         return nodes;
//     }

//     /**
//      * 단일 노드를 파싱하는 메서드
//      * @param {void}
//      * @returns {EachNode}
//     */
//     parseNode(): EachNode {
//         if (this.getCharacter() === "<") {
//             return this.parseElement();
//         }

//         return this.parseText();
//     }

//     /**
//      * 태그 이름, 속성, 자식 노드를 파싱하여 Element 노드를 만드는 메서드
//      * @param {void}
//      * @returns {EachNode} 
//      * EachNode {
// 	 *   children: [...],
// 	 *   nodeDetail: EachElement { tagName: 'div', attributes: { id : 'main', class: 'test' } }
//      * }
//     */
//     parseElement(): EachNode {
//         throwError(this.consumeCharacter() === "<", "character is not <");
      
//         const tagName = this.parseName();
//         const attributes = this.parseAttributes();
      
//         throwError(this.consumeCharacter() === ">", "character is not >");
      
//         const children = this.parseNodes();
      
//         throwError(this.consumeCharacter() === "<", "character is not <");
//         throwError(this.consumeCharacter() === "/", "character is not /");
//         throwError(
//           this.parseName() === tagName,
//           "There is no tag name in closing tag"
//         );
//         throwError(this.consumeCharacter() === ">", "character is not >");
      
//         return createElement(tagName, attributes, children);
//     }

//     // 태그의 이름을 파싱하는 메소드
// // 현재 소비하는 문자가 numberCharacters, lowerAlphabet, upperAlphabet 내 요소에 해당하면
// // 계속 소비하는 consumeWhile 메소드의 결과값을 반환한다. 즉 이름을 반환한다.
// // numberCharacters 는 숫자 문자('1', '2' ...), lowerAlphabet는 알파벳 소문자('a', 'b' ...)
// // upperAlphabet는 알파벳 대문자 ('A', 'B', ...) 를 요소로 갖는다.
// parseName(): string {
//     return this.consumeWhile(function (character: string): boolean {
//       if (
//         numberCharacters.indexOf(character) !== -1 ||
//         lowerAlphabet.indexOf(character) !== -1 ||
//         upperAlphabet.indexOf(character) !== -1
//       )
//         return true;
  
//       return false;
//     });
//   }
  
//   // 속성들을 파싱하는 메소드
//   // '>' 문자를 만날 때까지(태그의 닫힘을 의미)
//   // 단일 속성을 파싱하는 parseAttr 메소드를 계속 실행하여 엳은 name과 value를
//   // attributes 객체에 추가합니다. 그리고 마지막에 attributes 객체를 반환합니다.
//   parseAttributes() {
//     let attributes = {};
  
//     while (true) {
//       this.consumeWhiteSpace();
  
//       if (this.getCharacter() === ">") break;
  
//       const { name, value } = this.parseAttr();
//       // attributes[name] = value;
//     }
  
//     return attributes;
//   }
  
//   // 단일 속성을 파싱하는 메소드
//   // name="value" 형식의 문자열을 파싱한다.
//   // assert 문으로 위의 형식이 강요됩니다.
//   // '='을 구분자로 삼아 name과 value를 파싱한다.
//   // name, value를 담은 객체를 반환한다.
//   parseAttr(): IAttribute {
//     const name = this.parseName();
  
//     throwError(
//       this.consumeCharacter() === "=",
//       "there is no '=' between attribute name and attribute value"
//     );
  
//     const value = this.parseAttrValue();
  
//     return { name, value };
//   }
  
//   // 단일 속성의 value를 파싱하는 메소드
//   // assert문으로 "value" 형식이 강요됩니다.
//   parseAttrValue() {
//     const quote = this.consumeCharacter();
  
//     throwError(quote === '"', "open quote error");
  
//     const value = this.consumeWhile(function (character: string): boolean {
//       if (character !== quote) return true;
  
//       return false;
//     });
  
//     throwError(this.consumeCharacter() === quote, "close quote error");
  
//     return value;
//   }

//     /**
//      * Text 노드를 만드는 메서드
//      * Start tag(<)를 만날 때 지금까지 소비한 문자열로 Text 노드를 만들고 반환
//      * @param {void}
//      * @returns {EachNode}
//     */
//     parseText(): EachNode {
//         const isNotStartTag = (character: string): boolean => character !== "<";
//         const str = this.consumeWhile(isNotStartTag);
//         return createText(str);
//     }

//     /**
//      * 문자열을 순회하는 for문을 완전히 실행하지 않기 위해 Generator 함수 사용
//      * @param {string} htmlCharacters
//      * @param {number} curPos
//      * @returns {Iterator}
//     */
//     makeHtmlIterator = function* (htmlCharacters = '', curPos = 0 ): Generator {
//         for (let i = curPos; i < htmlCharacters.length; i++) {
//             yield [i, htmlCharacters[i]];
//         }
//     }

//     /**
//      * 문자를 소비하는 메서드
//      * Iterator의 next()를 통해 curPos(currentPosition)의 문자를 얻고 반환
//      * @param {void}
//      * @returns {string}
//     */
//     consumeCharacter(): string {
//         const htmlIterator = this.makeHtmlIterator(this.htmlCharacters, this.curPos);
//         const [curPos, curChar] = htmlIterator.next().value;
//         this.curPos += 1;

//         return curChar;
//     }

//     /**
//      * 파싱 과정에서 연속된 공백을 모두 소비하는 메서드
//      * @param {void}
//      * @returns {void}
//     */
//     consumeWhiteSpace(): void {
//         const isWhiteSpace = (char: string): boolean => char === " ";
//         this.consumeWhile(isWhiteSpace);
//     }

//     /**
//      * Html 문서의 끝이 아니고 전달받은 파라미터 조건에 부합할 경우 지금까지 소비된 문자를 반환하는 메서드
//      * @param {isMeetTheThreshold} isMeetTheThreshold 정의된 조건에 부합하는지 체크하는 함수
//      * @returns {string} 
//     */
//     consumeWhile(isMeetTheThreshold: TisMeetTheThreshold): string {
//         let result = "";
//         const isEndOfDocument = this.isEndOfDocument();

//         while (!isEndOfDocument && isMeetTheThreshold(this.getCharacter())) {
//             result += this.consumeCharacter();
//         }

//         return result;
//     }

//     /**
//      * curPos(currentPosition)에 해당하는 character를 return 하는 메서드
//      * @param {void} 
//      * @returns {string} character 하나
//     */
//     getCharacter(): string {
//         return this.htmlCharacters[this.curPos];
//     }

//     /**
//      * curPos(currentPosition)부터 시작하는 문자열들이 파라미터 문자열로 시작하는지 확인하는 메서드
//      * @param {string} str 태그 문자열과 같이 체크하고 싶은 문자열
//      * @returns {boolean}
//     */
//     isStartWith(str: string): boolean {
//         const strArray = Array.from(str);
//         let curPos = this.curPos;

//         const isSameWithStr = (char: string) => this.htmlCharacters[curPos++] === char;

//         return strArray.every(isSameWithStr);
//     }

//     /**
//      * curPos(currentPosition)이 htmlCharacters의 길이보다 큰지 확인하는 메서드
//      * @param {void}
//      * @returns {boolean}
//     */
//     isEndOfDocument(): boolean {
//         return this.curPos >= this.htmlCharacters.length;
//     }
// }