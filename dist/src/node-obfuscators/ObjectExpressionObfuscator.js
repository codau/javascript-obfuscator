"use strict";
const escodegen = require('escodegen');
const estraverse = require('estraverse');
const NodeType_1 = require("../enums/NodeType");
const NodeObfuscator_1 = require('./NodeObfuscator');
const NodeUtils_1 = require("../NodeUtils");
const Utils_1 = require('../Utils');
class ObjectExpressionObfuscator extends NodeObfuscator_1.NodeObfuscator {
    obfuscateNode(objectExpressionNode) {
        objectExpressionNode.properties.forEach((property) => {
            estraverse.replace(property.key, {
                leave: (node, parentNode) => {
                    if (NodeUtils_1.NodeUtils.isLiteralNode(node)) {
                        this.literalNodeController(node);
                        return;
                    }
                    if (NodeUtils_1.NodeUtils.isIdentifierNode(node)) {
                        this.identifierNodeController(node);
                    }
                }
            });
        });
    }
    literalNodeController(node) {
        switch (typeof node.value) {
            case 'string':
                if (node['x-verbatim-property']) {
                    break;
                }
                node['x-verbatim-property'] = {
                    content: Utils_1.Utils.stringToUnicode(node.value),
                    precedence: escodegen.Precedence.Primary
                };
                break;
            default:
                break;
        }
    }
    identifierNodeController(node) {
        let nodeValue = node.name, literalNode = {
            raw: `'${nodeValue}'`,
            'x-verbatim-property': {
                content: Utils_1.Utils.stringToUnicode(nodeValue),
                precedence: escodegen.Precedence.Primary
            },
            type: NodeType_1.NodeType.Literal,
            value: nodeValue
        };
        delete node.name;
        Object.assign(node, literalNode);
    }
}
exports.ObjectExpressionObfuscator = ObjectExpressionObfuscator;
