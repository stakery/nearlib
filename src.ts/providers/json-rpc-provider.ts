'use strict';

import {
  Provider, FinalExecutionOutcome, NodeStatusResult, BlockId,
  BlockResult, ChunkId, ChunkResult, adaptTransactionResult
} from './provider';
import { Network } from '../utils/network';
import { ConnectionInfo, fetchJson } from '../utils/web';
import { base_encode } from '../utils/serialize';
import { SignedTransaction } from '../transaction';

/// Keep ids unique across all connections.
let _nextId = 123;

export class TypedError extends Error {
    type: string;
    constructor(message?: string, type?: string) {
        super(message);
        this.type = type || 'UntypedError';
    }
}

export class JsonRpcProvider extends Provider {
    readonly connection: ConnectionInfo;

    constructor(url?: string, network?: Network) {
        super();
        // TODO: resolve network to url...

        this.connection = { url };
    }

    async getNetwork(): Promise<Network> {
        return {
            name: 'test',
            chainId: 'test'
        };
    }

    async status(): Promise<NodeStatusResult> {
        return this.sendJsonRpc('status', []);
    }

    async sendTransaction(signedTransaction: SignedTransaction): Promise<FinalExecutionOutcome> {
        const bytes = signedTransaction.encode();
        return this.sendJsonRpc('broadcast_tx_commit', [Buffer.from(bytes).toString('base64')]).then(adaptTransactionResult);
    }

    async txStatus(txHash: Uint8Array, accountId: string): Promise<FinalExecutionOutcome> {
        return this.sendJsonRpc('tx', [base_encode(txHash), accountId]).then(adaptTransactionResult);
    }

    async query(path: string, data: string): Promise<any> {
        const result = await this.sendJsonRpc('query', [path, data]);
        if (result && result.error) {
            throw new Error(`Quering ${path} failed: ${result.error}.\n${JSON.stringify(result, null, 2)}`);
        }
        return result;
    }

    async block(blockId: BlockId): Promise<BlockResult> {
        return this.sendJsonRpc('block', [blockId]);
    }

    async chunk(chunkId: ChunkId): Promise<ChunkResult> {
        return this.sendJsonRpc('chunk', [chunkId]);
    }

    private async sendJsonRpc(method: string, params: any[]): Promise<any> {
        const request = {
            method,
            params,
            id: (_nextId++),
            jsonrpc: '2.0'
        };
        const response = await fetchJson(this.connection, JSON.stringify(request));
        if (response.error) {
            if (typeof response.error.data === 'object') {
                throw new TypedError(response.error.data.error_message, response.error.data.error_type);
            } else {
                const errorMessage = `[${response.error.code}] ${response.error.message}: ${response.error.data}`;
                if (errorMessage === '[-32000] Server error: send_tx_commit has timed out.') {
                    throw new TypedError('send_tx_commit has timed out.', 'TimeoutError');
                } else {
                    throw new TypedError(errorMessage);
                }
            }
        }
        return response.result;
    }
}
