import { Provider, FinalExecutionOutcome, NodeStatusResult, BlockId, BlockResult, ChunkId, ChunkResult } from './provider';
import { Network } from '../utils/network';
import { ConnectionInfo } from '../utils/web';
import { SignedTransaction } from '../transaction';
export declare class TypedError extends Error {
    type: string;
    constructor(message?: string, type?: string);
}
export declare class JsonRpcProvider extends Provider {
    readonly connection: ConnectionInfo;
    constructor(url?: string, network?: Network);
    getNetwork(): Promise<Network>;
    status(): Promise<NodeStatusResult>;
    sendTransaction(signedTransaction: SignedTransaction): Promise<FinalExecutionOutcome>;
    txStatus(txHash: Uint8Array, accountId: string): Promise<FinalExecutionOutcome>;
    query(path: string, data: string): Promise<any>;
    block(blockId: BlockId): Promise<BlockResult>;
    chunk(chunkId: ChunkId): Promise<ChunkResult>;
    private sendJsonRpc;
}
