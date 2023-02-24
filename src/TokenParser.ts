import { ICommonToken } from "./dom";
import { TOKEN_STATUS, ATTRIBUTE_NAME, TOKEN_NAME } from "./constants/index";
import { throwError, isNumOrAlphabet } from "./utils/index";

export default class TokenParser {
    private htmlCharacters: string;
    private curPos: number;
    private curDepth: number;
    private curToken: ICommonToken;
    private tokens: Array<ICommonToken>;

    constructor(htmlCharacters: string) {
        this.htmlCharacters = htmlCharacters;
        this.curPos = 0;
        this.curDepth = 0;
        this.curToken = {tokenStatus: '', tokenName: '', tagName: '', attribute: '', text: '', depth: 0};
        this.tokens = [];
    }

    /**
     * =====================================================
     * TokenParser 클래스의 get, set 함수
    */
    getHtmlCharacers(): string {
        return this.htmlCharacters;
    }

    getCurPos(): number {
        return this.curPos;
    }

    getCurDepth(): number {
        return this.curDepth;
    }

    getNewToken(): ICommonToken {
        return { tokenStatus: '', tokenName: '', tagName: '', attribute: '', text: '', depth: 0 };
    }

    getCurToken(): ICommonToken {
        return this.curToken;
    }

    getTokens(): Array<ICommonToken> {
        return this.tokens;
    }

    private setHtmlCharacters(htmlCharacters: string): void {
        this.htmlCharacters = htmlCharacters;
    }

    private setCurPos(pos: number): void {
        this.curPos = pos;
    }

    private setCurDepth(curDepth: number): void {
        this.curDepth = curDepth;
    }

    private setTokens(tokens: Array<ICommonToken>): void {
        this.tokens = tokens;
    }

    private setCurToken(curToken: ICommonToken): void {
        this.curToken = curToken;
    }

    /**
     * =====================================================
     * 토큰 생성을 위한 메서드들
    */
    parse(): Array<ICommonToken> {
        // ""와 ''을 동시에 사용하는 경우가 있으므로 ""으로 통일 시킴
        let htmlCharacters = this.getHtmlCharacers();
        htmlCharacters.replaceAll("'", "\"");
        this.setHtmlCharacters(htmlCharacters);


        while(true) {
            if (this.isEndOfDocument()) {
                break;
            }

            const createdToken = this.createToken();
            const issuedToken = this.issueToken(createdToken);

            let tokens = this.getTokens();
            tokens.push(issuedToken);
            this.setTokens(tokens);
        }

        return this.tokens;
    }

    /**
     * 다음 세 토큰 중 하나를 생성하는 메서드
     * 1. 시작 태그 토큰 / 2. 종료 태그 토큰 / 3. 텍스트 토큰
    */
    private createToken(): ICommonToken {
        const curChar = this.getCurChar();
        const nextChar = this.getNextChar();
        let curDepth = this.getCurDepth();

        let curToken = this.getNewToken();

        if (curChar === "<") {
            // 1. 시작 태그 토큰
            // 1 - 1. 시작 태그열림 상태: "<" 다음 알파벳 또는 숫자가 오는 경우
            // → 시작 태그 토큰 생성 및 Depth + 1 { tokenStatus: "OPEN_START_TAG", depth: curDepth + 1... }
            if (isNumOrAlphabet(nextChar)) {
                curToken = {
                    ...curToken,
                    tokenName: TOKEN_NAME.START_TAG,
                    tokenStatus: TOKEN_STATUS.OPEN_START_TAG,
                    depth: curDepth,
                };

                this.setCurDepth(curDepth + 1);
            }

            if (nextChar === ">") {
                throwError("시작 태그의 이름이 없습니다.");
            }

            // 2. 종료 태그 토큰
            // 2 - 1. 종료 태그열림 상태: "<" 다음 "/"가 오는 경우
            // → 종료 태그 토큰 생성 { tokenStatus: "OPEN_CLOSE_TAG", ... }
            // Depth - 1
            if (nextChar === "/") {
                this.increasePosAndGetChar();

                this.setCurDepth(curDepth - 1);
                curDepth = this.getCurDepth();

                curToken = {
                    ...curToken,
                    tokenName: TOKEN_NAME.END_TAG,
                    tokenStatus: TOKEN_STATUS.OPEN_END_TAG,
                    depth: curDepth,
                };
            }

            if (nextChar === " ") {
                throwError("태그 이름에 공백이 있습니다.");
            }
        } else {
            // 3. 텍스트 토큰
            curToken = {
                ...curToken,
                tokenName: TOKEN_NAME.TEXT, 
                tokenStatus: TOKEN_STATUS.OPEN_TEXT,
                depth: curDepth
            };
        }

        this.setCurToken(curToken);
        return curToken;
    }

    /**
     * 다음 세 토큰 중 하나를 발급하는 메서드
     * 1. 시작 태그 토큰 / 2. 종료 태그 토큰 / 3. 텍스트 토큰
    */
    private issueToken(curToken: ICommonToken): ICommonToken {
        if (curToken.tokenStatus === TOKEN_STATUS.OPEN_START_TAG) {
            const tagName = this.parseTagName();
            const attributes = this.parseAttributes();

            this.increasePosAndGetChar();

            curToken = {
                ...curToken,
                tokenStatus: TOKEN_STATUS.CLOSE_START_TAG,
                tagName,
                attribute: attributes,
                text: `<${tagName}>`
            };
        }

        if (curToken.tokenStatus === TOKEN_STATUS.OPEN_END_TAG) {
            const tagName = this.parseTagName();

            this.increasePosAndGetChar();

            curToken = {
                ...curToken,
                tokenStatus: TOKEN_STATUS.CLOSE_END_TAG,
                tagName,
                text: `</${tagName}>`
            };
        }

        if (curToken.tokenStatus === TOKEN_STATUS.OPEN_TEXT) {
            const text = this.parseText();

            curToken = {
                ...curToken,
                tokenStatus: TOKEN_STATUS.CLOSE_TEXT,
                text
            };
        }

        this.setCurToken(curToken);
        return curToken;
    }

    /**
     * =====================================================
     * 엘리먼트(Element) 속성(properties)을 반환하는 메서드들
    */
    /**
     * 태그 이름을 반환하는 메서드
     * "<"를 만날 때 함수가 시작되며, a-z에 해당하지 않는 문자(" " 또는 ">" 또는 "/")를 만났을 때 tagName을 반환하며 함수가 종료된다.
    */
    private parseTagName(): string {
        let curChar = this.increasePosAndGetChar();;
        let tagName = '';

        while(true) {
            tagName += curChar;

            curChar = this.increasePosAndGetChar();

            if (!isNumOrAlphabet(curChar)) {
                break;
            }
        }

        return tagName;
    }

    /**
     * 태그 내에 작성된 속성(id, class, value ...)를 반환하는 메서드
     * ">" 또는 "/"를 만나기 전까지의 문자열을 분석하여 string를 반환하며 함수가 종료된다.
     * # → id / . → class / @ → value
     * @returns {string} "#a.b.c@d"
    */
    private parseAttributes(): string {
        let curChar = this.getCurChar();
        let attrChars = '';

        let attributes = '';

        // 이미 현재 문자열이 ">"일 경우 빈 문자열들을 담은 string 반환
        if (curChar === ">") {
            return '';
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
                attributes += `@${attrValue}`;
            }
        }


        return attributes;
    }

    /**
     * 텍스트 스트링을 반환하는 메서드
     * 태그의 상태가 TEXT일 때 함수가 시작되며, "<"를 만났을 때 text 반환하며 함수가 종료된다.
    */
    private parseText(): string {
        let curChar = this.getCurChar();
        let text = '';

        while(true) {
            text += curChar;

            curChar = this.increasePosAndGetChar();

            if (curChar === "<") {
                break;
            }
        }

        return text;
    }

    /**
     * =====================================================
     * 원하는 위치의 문자를 반환하거나 위치(curPos)를 변화시키는 메서드들
    */
    /**
     * 현재 위치(curPos = current position)의 문자를 반환하는 메서드
    */
    private getCurChar(): string {
        const curPos = this.getCurPos();
        const htmlCharacters = this.getHtmlCharacers();

        return htmlCharacters[curPos];
    }

    /**
     * 다음 위치(curPos + 1)의 문자를 반환하는 메서드
    */
    private getNextChar(): string {
        const curPos = this.getCurPos();
        const htmlCharacters = this.getHtmlCharacers();

        return htmlCharacters[curPos + 1];
    }

    /**
     * 문자열을 순회하는 for문을 완전히 실행하지 않기 위해 Generator 함수 사용
     * @param {string} htmlCharacters
     * @param {number} curPos
     * @returns {Iterator}
    */
    private makeHtmlIterator = function* (htmlCharacters = '', curPos = 0 ): Generator {
        for (let i = curPos; i < htmlCharacters.length; i++) {
            yield [i, htmlCharacters[i]];
        }
    }

    /**
     * 위치를 + 1하고 문자를 반환하는 메서드
    */
    private increasePosAndGetChar(): string {
        if (this.isEndOfDocument()) {
            return '';
        }

        const htmlCharacters = this.getHtmlCharacers();
        const curPos = this.getCurPos();
        const nextPos = curPos + 1;

        this.setCurPos(nextPos);
        const htmlIterator = this.makeHtmlIterator(htmlCharacters, nextPos);
        const [pos, curChar] = htmlIterator.next().value;

        return curChar;
    }

    /**
     * 다음 문자 중 공백, ">", "/"가 아닌 문자를 반환하는 메서드
    */
    private getNextNecessaryChar(): string {
        let curChar = '';
        while (true) {
            curChar = this.increasePosAndGetChar();
            if (curChar !== " " && curChar !== ">" && curChar !== "/") {
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
    private isEndOfDocument(): boolean {
        const curPos = this.getCurPos();
        const htmlCharacters = this.getHtmlCharacers();

        return curPos >= htmlCharacters.length - 1;
    }
}