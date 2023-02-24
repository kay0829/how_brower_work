import HtmlParser from "./HtmlParser";
const html = '\n<html>\n  <body>\n    <h1 id="hello" class="a b">Title</h1><h2>SubTitle</h2>\n  </body>\n</html>';

const htmlParser = new HtmlParser(html);
const parsedHtml = htmlParser.parse();

console.log("parsedHtml", parsedHtml);