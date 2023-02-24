import {
    ICommonToken, IEachNode, IEachElement, ICommonNode,
    createNode
} from "./dom";
import { NODE_TYPES, TOKEN_NAME } from "./constants/index";
import { throwError } from "./utils/index";

export default class NodeParser {
    private tokens: Array<ICommonToken>;

    constructor(tokens: Array<ICommonToken>) {
        this.tokens = tokens;
    }

    /**
     * =====================================================
     * NodeParser 클래스의 get, set 함수
    */
    getTokens(): Array<ICommonToken> {
        return this.tokens;
    }

    parse(): ICommonNode | IEachNode | IEachElement {
        const nodeType = NODE_TYPES.DOCUMENT.nodeType;
        const nodeName = NODE_TYPES.DOCUMENT.nodeName;
        const tokens = this.getTokens();
        let innerHTML = '';

        tokens.forEach(v => {
            innerHTML += v.text;
        })

        const nodes = this.parseNodes(tokens);

        return createNode({
            depth: 0,
            nodeName,
            nodeType,
            innerHTML,
            value: null,
            childNodes: nodes,
        })
    }

    /**
     * =====================================================
     * 자식 노드를 파싱하는 메서드
    */
    private parseNodes(tokens: Array<ICommonToken>): Array<IEachNode | IEachElement> {
        if (tokens.length === 0) {
            return [];
        }
        const nodes: Array<IEachNode | IEachElement> = [];

        const curDepth = tokens[0].depth;

        const curDepthTokens = tokens.filter(v => v.depth === curDepth);
        this.checkIsElementNameSame(curDepthTokens);
        const filteredCurDepthTokens = curDepthTokens.filter(v => v.tokenName !== TOKEN_NAME.END_TAG);
        
        filteredCurDepthTokens.forEach(v => {
            const parsedNode = this.parseNode(v);
            nodes.push(parsedNode);
        });

        return nodes;
    }

    /**
     * EachElement 또는 EachNode 중 파싱할 대상을 정하는 메서드
    */
    private parseNode(token: ICommonToken): IEachNode | IEachElement {
        if (token.tokenName === TOKEN_NAME.TEXT) {
            return this.parseEachNode(token);
            
        }

        return this.parseEachElement(token);
    }

    /**
     * EachNode를 파싱하는 메서드
    */
    private parseEachNode(token: ICommonToken): IEachNode {
        const nodeType = NODE_TYPES.TEXT.nodeType;
        const nodeName = NODE_TYPES.TEXT.nodeName;

        return createNode({
            depth: token.depth,
            nodeName,
            nodeType,
            innerHTML: '',
            value: null,
            childNodes: [],
            nodeValue: token.text,
        });
    }

    /**
     * EachElement를 파싱하는 메서드
    */
    private parseEachElement(token: ICommonToken): IEachElement {
        const nodeType = NODE_TYPES.ELEMENT.nodeType;
        const nodeName = NODE_TYPES.ELEMENT.nodeName;

        const innerHTML = this.getInnerHTML(token);
        const childsDepthTokens = this.getChildTokens(token);
        const childNodes = this.parseNodes(childsDepthTokens);
        const children = childNodes.filter(v => v.nodeType === NODE_TYPES.ELEMENT.nodeType);

        return createNode({
            depth: token.depth,
            nodeName,
            nodeType,
            innerHTML,
            value: null,
            childNodes,
            tagName: token.tagName,
            attributes: token.attribute,
            children,
        });
    }

    /**
     * =====================================================
     * 시작 태그 이름과 종료 태그 사이 자식 토큰을 반환하는 메서드
    */
    private getChildTokens(token: ICommonToken): Array<ICommonToken> {
        const tokens = this.getTokens();
        const startTagIndex = tokens.findIndex(v => v.depth === token.depth && v.tagName === token.tagName && v.tokenName === TOKEN_NAME.START_TAG);
        const endTagIndex = tokens.findIndex(v => v.depth === token.depth && v.tagName === token.tagName && v.tokenName === TOKEN_NAME.END_TAG);
        const childsDepthTokens = tokens.slice(startTagIndex + 1, endTagIndex);

        return childsDepthTokens;
    }

    /**
     * =====================================================
     * 시작 태그 이름과 종료 태그 사이 html 스트링을 반환하는 메서드
    */
    private getInnerHTML(token: ICommonToken): string {
        const tokens = this.getTokens();
        const startTagIndex = tokens.findIndex(v => v.depth === token.depth && v.tagName === token.tagName && v.tokenName === TOKEN_NAME.START_TAG);
        const endTagIndex = tokens.findIndex(v => v.depth === token.depth && v.tagName === token.tagName && v.tokenName === TOKEN_NAME.END_TAG);

        let innerHTML = '';

        for (let i = startTagIndex + 1; i < endTagIndex; i++) {
            innerHTML += tokens[i].text;
        }

        return innerHTML;
    }

    /**
     * =====================================================
     * 시작 태그 이름과 종료 태그 이름이 동일한지 확인하고 아니라면 에러를 내는 메서드
    */
    private checkIsElementNameSame(curDepthTokens: Array<ICommonToken>): void {
        for (let i = 0; i < curDepthTokens.length; i++) {
            if (curDepthTokens[i].tokenName === TOKEN_NAME.START_TAG) {
                if (curDepthTokens[i].tagName !== curDepthTokens[i + 1].tagName) {
                    throwError("시작 태그와 종료 태그의 이름이 동일하지 않습니다.");
                } else {
                    i++;
                }
            }
        }
    }
}