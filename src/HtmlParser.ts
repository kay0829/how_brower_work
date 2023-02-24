import TokenParser from "./TokenParser";
import NodeParser from "./NodeParser";

import { ICommonNode, IEachElement, IEachNode } from "./dom";

export default class HtmlParser {
    private htmlCharacters: string;

    constructor(htmlCharacters: string) {
        this.htmlCharacters = htmlCharacters;
    }

    parse(): ICommonNode | IEachNode | IEachElement {
        const tokenParser = new TokenParser(this.htmlCharacters);
        const parsedToken = tokenParser.parse();

        const nodeParser = new NodeParser(parsedToken);
        const parsedNode = nodeParser.parse();

        return parsedNode;
    }
}