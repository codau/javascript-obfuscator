"use strict";
const JSFuck_1 = require("../enums/JSFuck");
const NodeUtils_1 = require("../NodeUtils");
const Utils_1 = require('../Utils');
class NodeObfuscator {
    constructor(nodes, options = {}) {
        this.nodes = nodes;
        this.options = options;
    }
    isReservedName(name) {
        return this.options['reservedNames'].some((reservedName) => {
            return reservedName === name;
        });
    }
    replaceNodeIdentifierByNewValue(node, parentNode, namesMap) {
        if (NodeUtils_1.NodeUtils.isIdentifierNode(node) && namesMap.has(node.name)) {
            const parentNodeIsAPropertyNode = (NodeUtils_1.NodeUtils.isPropertyNode(parentNode) &&
                parentNode.key === node), parentNodeIsAMemberExpressionNode = (NodeUtils_1.NodeUtils.isMemberExpressionNode(parentNode) &&
                parentNode.computed === false &&
                parentNode.property === node);
            if (parentNodeIsAPropertyNode || parentNodeIsAMemberExpressionNode) {
                return;
            }
            node.name = namesMap.get(node.name);
        }
    }
    replaceLiteralBooleanByJSFuck(nodeValue) {
        return nodeValue ? JSFuck_1.JSFuck.True : JSFuck_1.JSFuck.False;
    }
    replaceLiteralNumberByHexadecimalValue(nodeValue) {
        const prefix = '0x';
        if (!Utils_1.Utils.isInteger(nodeValue)) {
            return String(nodeValue);
        }
        return `${prefix}${Utils_1.Utils.decToHex(nodeValue)}`;
    }
    replaceLiteralValueByUnicodeValue(nodeValue) {
        let value = nodeValue;
        if (this.options['encodeUnicodeLiterals']) {
            value = new Buffer(encodeURI(value)).toString('base64');
        }
        value = Utils_1.Utils.stringToUnicode(value);
        if (!this.options['unicodeArray']) {
            return value;
        }
        return this.replaceLiteralValueByUnicodeArrayCall(value);
    }
    replaceLiteralValueByUnicodeArrayCall(value) {
        let unicodeArrayNode = this.nodes.get('unicodeArrayNode'), unicodeArray = unicodeArrayNode.getNodeData(), sameIndex = unicodeArray.indexOf(value), index, hexadecimalIndex;
        if (sameIndex >= 0) {
            index = sameIndex;
        }
        else {
            index = unicodeArray.length;
            unicodeArrayNode.updateNodeData(value);
        }
        hexadecimalIndex = this.replaceLiteralNumberByHexadecimalValue(index);
        if (this.options['wrapUnicodeArrayCalls']) {
            return `${this.nodes.get('unicodeArrayCallsWrapper').getNodeIdentifier()}('${hexadecimalIndex}')`;
        }
        return `${unicodeArrayNode.getNodeIdentifier()}[${hexadecimalIndex}]`;
    }
}
exports.NodeObfuscator = NodeObfuscator;
