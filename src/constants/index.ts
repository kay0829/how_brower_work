/**
 * HTML 문자열을 DOM 트리로 파싱한 결과값을 나타내기 위한 임의로 정한
 * 프로젝트를 위한 Node 타입입니다.
 */
export const NODE_TYPES = {
    DOCUMENT: { nodeType: 0, nodeName: "DOCUMENT_NODE" },
    ELEMENT: { nodeType: 1, nodeName: "ELEMENT_NODE" },
    TEXT: { nodeType: 2, nodeName: "TEXT_NODE" },
}

export const ATTRIBUTE_NAME = {
    CLASS: "class",
    ID: "id",
    VALUE: "value",
}

/**
 * HTML 문자열을 토큰화하는 과정의 상태를 나타내는 상수입니다.
 */
export const TOKEN_STATUS = {
	OPEN_START_TAG: "OPEN_START_TAG",
    CLOSE_START_TAG: "CLOSE_START_TAG",
	OPEN_END_TAG: "OPEN_END_TAG",
    CLOSE_END_TAG: "CLOSE_END_TAG",
	OPEN_TEXT: "OPEN_TEXT",
    CLOSE_TEXT: "CLOSE_TEXT",
}

export const TOKEN_NAME = {
    START_TAG: "START_TAG",
    END_TAG: "END_TAG",
    TEXT: "TEXT",
}