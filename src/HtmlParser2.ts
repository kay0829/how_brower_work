// 출처: https://github.com/elrion018/karl

import {
    CommonNode, CommonToken,
    EachElement, EachNode,
    createNode } from "./dom";
import { NODE_TYPES, TOKEN_STATUS, ATTRIBUTE_NAME } from "./constants/index";
import { throwError, numberCharacters, lowerAlphabet, upperAlphabet } from "./utils/index";

interface IHtmlParser {
    htmlCharacters: string;
    curPos: number;
    curTokenStatus: string;
}

export default class HtmlParser {
    htmlCharacters: string;
    curPos: number;
    curTokenStatus: string;

    constructor(htmlCharacters: string, curPos = 0, curTokenStatus = '') {
        this.htmlCharacters = htmlCharacters;
        this.curPos = curPos;
        this.curTokenStatus = curTokenStatus;
    }

    /**
     * HTML 파싱을 위해 호출하는 메서드
     * @returns {
	 *   nodeName: "DOCUMENT_NODE", nodeType: 0, value: null,
     *   childNodes: [
     *     {
     *       nodeName: "ELEMENT_NODE", nodeType: 1, value: null, tagName: "html",
     *       children: [ ... ]
     *     }
     *   ]
     * }
    */
    parse(): CommonNode | EachNode | EachElement {
        // ""와 ''을 동시에 사용하는 경우가 있으므로 ""으로 통일 시킴
        this.htmlCharacters.replaceAll("'", "\"");
        const nodes = this.parseNodes();

        return createNode({
            depth: 0,
            nodeName: NODE_TYPES.DOCUMENT.nodeName,
            nodeType: NODE_TYPES.DOCUMENT.nodeType,
            innerHTML: '',
            value: null,
            childNodes: nodes,
        })
    }

    /**
     * 자식 노드를 파싱하는 메서드
     * HtmlCharacters의 끝에 도달하거나 '</' 문자열(부모 태그가 닫힘을 의미)을 만나기 전까지
     * parseNode()로 노드를 파싱하고 자식 노드에 추가한다.
     * @param {void}
     * @returns {Array<EachNode | EachElement>}
    */
    parseNodes(): Array<EachNode | EachElement> {
        console.log("parseNodes() 함수 호출됨");
        let nodes = [];

        while (true) {
            const isEndOfDocument = this.isEndOfDocument();
            const isEndTag = this.getCurChar() === "<" && this.getNextChar() === "/";

            if (isEndOfDocument || isEndTag) {
                break;
            }

            nodes.push(this.parseNode());
            console.log("node", nodes);
        }

        return nodes;
    }

    /**
     * 현재 위치의 문자가 시작태그인 "<"와 일치하는지 여부로 분기하여
     * EachElement 또는 EachNode 중 파싱할 대상을 정하는 메서드
    */
    parseNode(): EachNode | EachElement {
        console.log("parseNode() 함수 호출됨");
        const curChar = this.getCurChar();

        if (curChar === "<") {
            console.log("parseEachElement() 함수 호출됨");
            return this.parseEachElement();
        }

        console.log("parseEachNode() 함수 호출됨");
        return this.parseEachNode();
    }

    parseEachNode(): EachNode {
        const nodeType = NODE_TYPES.TEXT.nodeType;
        const nodeName = NODE_TYPES.TEXT.nodeName;
        let curChar = this.getCurChar();
        let nodeValue = '';

        while(true) {
            nodeValue += curChar;

            curChar = this.increasePosAndGetChar();
            if (curChar === "<") {
                break;
            }
        }

        return createNode({ depth: 0, nodeName, nodeType, innerHTML: '', value: null, childNodes: [], nodeValue });
    }

    parseEachElement(): EachElement {
        const nodeType = NODE_TYPES.ELEMENT.nodeType;
        const nodeName = NODE_TYPES.ELEMENT.nodeName;

        if (this.getCurChar() !== "<") throwError("시작 태그가 '<'로 시작하지 않습니다. Element에 해당하는 Node가 아닙니다.");

        const tagName = this.parseTagName();
        console.log("tagName", tagName);

        if (tagName === "") throwError("시작 태그의 이름이 없습니다.");

        const {attributes, value} = this.parseAttributes();

        if (this.getCurChar() !== ">") throwError("시작 태그 '>'로 끝나지 않습니다. Element에 해당하는 Node가 아닙니다.");

        this.increasePosAndGetChar();
        const childNodes = this.parseNodes();
        const children = childNodes;

        if (this.getCurChar() === "/") {
            //
        }
        if (this.getCurChar() === ">") {
            // throwError(this.increasePosAndGetChar() === "<", "종료 태그가 '<'로 시작하지 않습니다. Element에 해당하는 Node가 아닙니다.");
            // throwError(this.increasePosAndGetChar() === "/", "종료 태그가 '/'로 시작하지 않습니다. Element에 해당하는 Node가 아닙니다.");
            // throwError(
            //     this.parseTagName() === tagName,
            //     "There is no tag name in closing tag"
            //   );
            //   throwError(this.getCurChar() === ">", "character is not >");
        }

        return createNode({ depth: 0, nodeName, nodeType, innerHTML: '', value, childNodes, tagName, attributes, children });
    }

    /**
     * =====================================================
     * EachElement 속성(properties)을 반환하는 메서드들
    */
    /**
     * 태그 이름을 반환하는 메서드
     * "<"를 만날 때 함수가 시작되며, a-z에 해당하지 않는 문자(" " 또는 ">" 또는 "/")를 만났을 때 tagName을 반환하며 함수가 종료된다.
    */
    parseTagName(): string {
        console.log("parseTagName() 함수 호출됨");
        let curChar = '';
        let tagName = '';

        while(true) {
            curChar = this.increasePosAndGetChar();

            if (lowerAlphabet.indexOf(curChar) === -1 &&
                upperAlphabet.indexOf(curChar) === -1 &&
                numberCharacters.indexOf(curChar) === -1
            ) {
                break;
            }

            tagName += curChar;
        }

        return tagName;
    }

    /**
     * 태그 내에 작성된 속성(id, class, value ...)를 반환하는 메서드
     * ">" 또는 "/"를 만나기 전까지의 문자열을 분석하여 attributes와 value를 반환하며 함수가 종료된다.
    */
    parseAttributes(): {attributes: string, value: string} {
        console.log("parseAttributes() 함수 호출됨");
        let curChar = this.getCurChar();
        let attrChars = '';

        let attributes = '';
        let value = '';

        // 이미 현재 문자열이 ">"일 경우 빈 문자열들을 담은 object 반환
        if (curChar === ">") {
            return {attributes, value};
        }

        // ">"를 만나기 전까지의 문자열 추출
        // 예) attrChars = " id="a" class="b c" value="d" "
        while(true) {
            curChar = this.increasePosAndGetChar();

            if (curChar === ">" || curChar === "/") {
                break;
            }

            attrChars += curChar;
        }

        // ">"를 만나기 전까지의 문자열에서 "를 기준으로 구분지어 배열 생성
        // attrCharsArray = [' id=', 'a', ' class=', 'b c', 'value=', 'd', ' ' ]
        const attrCharsArray = attrChars.split('"');
        console.log("attrCharsArray", attrCharsArray);
        
        // 홀수번째 값은 속성의 이름에 해당하며 반드시 "="를 포함해야 하며 빈 문자열일 경우 무시한다.
        // 그리고 짝수번째 값은 속성의 값에 해당하며 " "를 기준으로 분리할 수 있다.
        for (let i = 0; i < attrCharsArray.length - 1; i += 2) {
            let attrName = attrCharsArray[i].trim();
            let attrValue = attrCharsArray[i + 1];

            if (attrName.length === 0) {
                break;
            }

            if (attrName.search("=") === -1) throwError("태그 속성 이름과 값 사이에 문자열(=)이 없습니다.");
                    
            if (attrName.search(ATTRIBUTE_NAME.ID) >= 0) {
                attrValue.split(" ").forEach(v => {
                    attributes += `#${v}`;
                });
            }

            if (attrName.search(ATTRIBUTE_NAME.CLASS) >= 0) {
                attrValue.split(" ").forEach(v => {
                    attributes += `.${v}`;
                });
            }

            if (attrName.search(ATTRIBUTE_NAME.VALUE) >= 0) {
                value = attrValue;
            }
        }


        return {attributes, value};
    }

    /**
     * =====================================================
     * 원하는 위치의 문자를 반환하거나 위치(curPos)를 변화시키는 메서드들
    */
    /**
     * 현재 위치(curPos = current position)의 문자를 반환하는 메서드
    */
    getCurChar(): string {
        return this.htmlCharacters[this.curPos];
    }

    /**
     * 다음 위치(curPos + 1)의 문자를 반환하는 메서드
    */
    getNextChar(): string {
        return this.htmlCharacters[this.curPos + 1];
    }

    /**
     * 문자열을 순회하는 for문을 완전히 실행하지 않기 위해 Generator 함수 사용
     * @param {string} htmlCharacters
     * @param {number} curPos
     * @returns {Iterator}
    */
    makeHtmlIterator = function* (htmlCharacters = '', curPos = 0 ): Generator {
        for (let i = curPos; i < htmlCharacters.length; i++) {
            yield [i, htmlCharacters[i]];
        }
    }

    /**
     * 위치를 + 1하고 문자를 반환하는 메서드
    */
    increasePosAndGetChar(): string {
        this.curPos += 1;
        // const htmlIterator = this.makeHtmlIterator(this.htmlCharacters, this.curPos);
        // const [curPos, curChar] = htmlIterator.next().value;
        
        console.log("curPos", this.curPos, this.htmlCharacters[this.curPos]);

        return this.htmlCharacters[this.curPos];
    }

    getNextCharNotWhiteSpace(): string {
        let curChar = '';
        while (true) {
            curChar = this.increasePosAndGetChar();
            if (curChar !== " ") {
                break;
            }
        }

        return curChar;
    }

    /**
     * =====================================================
     * 자주 사용하는 조건을 확인하는 메서드들
    */
    /**
     * html 문서 끝까지 확인했는지 여부를 반환하는 메서드
    */
    isEndOfDocument(): boolean {
        return this.curPos >= this.htmlCharacters.length - 1;
    }
}