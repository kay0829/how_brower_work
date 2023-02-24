import { NODE_TYPES } from "./constants/index";

/**
 * 기본 Node 정의
*/
export interface ICommonNode {
    depth: number;
    nodeName: string;
    nodeType: number;
    innerHTML: string;
    value: string | null;
    childNodes: Array<IEachNode | IEachElement>;
    nodeValue?: string;
    tagName?: string;
    attributes?: string;
    children?: Array<IEachNode | IEachElement>;
}

export class CommonNode {
    depth: number;
    nodeName: string;
    nodeType: number;
    innerHTML: string;
    value: string | null;
    childNodes: Array<IEachNode | IEachElement>;
    nodeValue?: string;
    tagName?: string;
    attributes?: string;
    children?: Array<IEachNode | IEachElement>;

    constructor({ depth, nodeName, nodeType, innerHTML, value, childNodes }: ICommonNode) {
        this.depth = depth;
        this.nodeName = nodeName;
        this.nodeType = nodeType;
        this.innerHTML = innerHTML;
        this.value = value;
        this.childNodes = childNodes;
    }
}

/**
 * 각각의 Node 속성 정의
*/
export interface IEachNode extends ICommonNode {}

export class EachNode extends CommonNode {
    constructor({ depth, nodeName, nodeType, innerHTML, value, childNodes, nodeValue }: IEachNode) {
        super({ depth, nodeName, nodeType, innerHTML, value, childNodes, nodeValue });
        this.nodeValue = nodeValue;
    }
}


/**
 * 각각의 Element 속성 정의
*/

export interface IEachElement extends ICommonNode {}

export class EachElement extends CommonNode {

    constructor({ depth, nodeName, nodeType, innerHTML, value, childNodes, tagName, attributes, children }: IEachElement) {
        super({ depth, nodeName, nodeType, innerHTML, value, childNodes, tagName, attributes, children });
        this.tagName = tagName;
        this.attributes = attributes;
        this.children = children;
    }
}


/**
 * 파싱한 Node를 생성하는 함수
*/
export function createNode({
    depth, nodeName, nodeType, innerHTML, value, childNodes, nodeValue, tagName, attributes, children
}: ICommonNode): CommonNode | EachNode | EachElement {

    if (nodeType === NODE_TYPES.DOCUMENT.nodeType) {
        return new CommonNode({ depth, nodeName, nodeType, innerHTML, value, childNodes });
    }
    
    if (nodeType === NODE_TYPES.ELEMENT.nodeType) {
        return new EachElement({ depth, nodeName, nodeType, innerHTML, value, childNodes, tagName, attributes, children });
    }

    return new EachNode({ depth, nodeName, nodeType, innerHTML, value, childNodes, nodeValue });
}

/**
 * "문자 -> 토큰" 과정 시 토큰 정의
*/
export interface ICommonToken {
    tokenStatus: string;
    tokenName: string;
    tagName: string;
    attribute: string;
    text: string;
    depth: number;
}


export class CommonToken {
	tokenStatus: string;
    tokenName: string;
    tagName: string;
    attribute: string;
    text: string;
    depth: number;

    constructor({ tokenStatus, tokenName, tagName, attribute, text, depth }: ICommonToken) {
        this.tokenStatus = tokenStatus;
        this.tokenName = tokenName;
        this.tagName = tagName;
        this.attribute = attribute;
        this.text = text;
        this.depth = depth;
    }
}