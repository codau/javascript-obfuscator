import * as esprima from 'esprima';
import { JavaScriptObfuscator } from '../../JavaScriptObfuscator';

import { INode } from "../../interfaces/nodes/INode";

import { TBlockScopeNode } from "../../types/TBlockScopeNode";

import { AppendState } from "../../enums/AppendState";

import { NO_CUSTOM_NODES_PRESET } from "../../preset-options/NoCustomNodesPreset";

import { Node } from '../Node';
import { NodeUtils } from "../../NodeUtils";
import { Utils } from "../../Utils";

export class UnicodeArrayDecodeNode extends Node {
    /**
     * @type {AppendState}
     */
    protected appendState: AppendState = AppendState.AfterObfuscation;

    /**
     * @type {string[]}
     */
    private unicodeArray: string[];

    /**
     * @type {string}
     */
    private unicodeArrayName: string;

    /**
     * @param unicodeArrayName
     * @param unicodeArray
     */
    constructor (
        unicodeArrayName: string,
        unicodeArray: string[]
    ) {
        super();

        this.unicodeArrayName = unicodeArrayName;
        this.unicodeArray = unicodeArray;

        this.node = this.getNodeStructure();
    }

    /**
     * @param blockScopeNode
     */
    public appendNode (blockScopeNode: TBlockScopeNode): void {
        NodeUtils.insertNodeAtIndex(blockScopeNode.body, this.getNode(), 1);
    }

    /**
     * @returns {INode}
     */
    public getNode (): INode {
        if (!this.unicodeArray.length) {
            return;
        }

        return super.getNode();
    }

    /**
     * @returns {INode}
     */
    protected getNodeStructure (): INode {
        const indexVariableName: string = Utils.getRandomVariableName(),
            tempArrayName: string = Utils.getRandomVariableName();

        let node: INode = esprima.parse(`
            (function () {
                ${JavaScriptObfuscator.obfuscate(`
                    (function () {
                        var object = []['filter']['constructor']('return this')();
                        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            
                        object.atob || (
                            object.atob = function(input) {
                                var str = String(input).replace(/=+$/, '');
                                for (
                                    var bc = 0, bs, buffer, idx = 0, output = '';
                                    buffer = str.charAt(idx++);
                                    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                                        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
                                ) {
                                    buffer = chars.indexOf(buffer);
                                }
                            return output;
                        });
                    })();
                `, NO_CUSTOM_NODES_PRESET)}
              
                var ${tempArrayName} = [];
                
                for (var ${indexVariableName} in ${this.unicodeArrayName}) {
                    ${tempArrayName}[${Utils.stringToUnicode('push')}](decodeURI(atob(${this.unicodeArrayName}[${indexVariableName}])));
                }
                
                ${this.unicodeArrayName} = ${tempArrayName};
            })();
        `);

        NodeUtils.addXVerbatimPropertyToLiterals(node);

        return NodeUtils.getBlockScopeNodeByIndex(node);
    }
}
