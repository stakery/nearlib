import { Network } from '../utils/network';
import { SignedTransaction } from '../transaction';
export interface SyncInfo {
    latest_block_hash: string;
    latest_block_height: number;
    latest_block_time: string;
    latest_state_root: string;
    syncing: boolean;
}
export interface NodeStatusResult {
    chain_id: string;
    rpc_addr: string;
    sync_info: SyncInfo;
    validators: string[];
}
export declare type BlockHash = string;
export declare type BlockHeight = number;
export declare type BlockId = BlockHash | BlockHeight;
export declare enum ExecutionStatusBasic {
    Unknown = "Unknown",
    Pending = "Pending",
    Failure = "Failure"
}
export interface ExecutionStatus {
    SuccessValue?: string;
    SuccessReceiptId?: string;
    Failure?: ExecutionError;
}
export declare enum FinalExecutionStatusBasic {
    NotStarted = "NotStarted",
    Started = "Started",
    Failure = "Failure"
}
export interface ExecutionError {
    error_message: string;
    error_type: string;
}
export interface FinalExecutionStatus {
    SuccessValue?: string;
    Failure?: ExecutionError;
}
export interface ExecutionOutcomeWithId {
    id: string;
    outcome: ExecutionOutcome;
}
export interface ExecutionOutcome {
    status: ExecutionStatus | ExecutionStatusBasic;
    logs: string[];
    receipt_ids: string[];
    gas_burnt: number;
}
export interface FinalExecutionOutcome {
    status: FinalExecutionStatus | FinalExecutionStatusBasic;
    transaction: ExecutionOutcomeWithId;
    receipts: ExecutionOutcomeWithId[];
}
export interface TotalWeight {
    num: number;
}
export interface BlockHeader {
    approval_mask: string;
    approval_sigs: string;
    hash: string;
    height: number;
    prev_hash: string;
    prev_state_root: string;
    timestamp: number;
    total_weight: TotalWeight;
    tx_root: string;
}
export declare type ChunkHash = string;
export declare type ShardId = number;
export declare type BlockShardId = [BlockId, ShardId];
export declare type ChunkId = ChunkHash | BlockShardId;
export interface ChunkHeader {
    balance_burnt: string;
    chunk_hash: ChunkHash;
    encoded_length: number;
    encoded_merkle_root: string;
    gas_limit: number;
    gas_used: number;
    height_created: number;
    height_included: number;
    outgoing_receipts_root: string;
    prev_block_hash: string;
    prev_state_num_parts: number;
    prev_state_root_hash: string;
    rent_paid: string;
    shard_id: number;
    signature: string;
    tx_root: string;
    validator_proposals: any[];
    validator_reward: string;
}
export interface ChunkResult {
    header: ChunkHeader;
    receipts: any[];
    transactions: Transaction[];
}
export interface Transaction {
    hash: string;
    public_key: string;
    signature: string;
    body: any;
}
interface LegacyTransactionLog {
    hash: string;
    result: LegacyTransactionResult;
}
interface LegacyTransactionResult {
    status: LegacyTransactionStatus;
    logs: string[];
    receipts: string[];
    result?: string;
}
declare enum LegacyFinalTransactionStatus {
    Unknown = "Unknown",
    Started = "Started",
    Failed = "Failed",
    Completed = "Completed"
}
declare enum LegacyTransactionStatus {
    Unknown = "Unknown",
    Completed = "Completed",
    Failed = "Failed"
}
interface LegacyFinalTransactionResult {
    status: LegacyFinalTransactionStatus;
    transactions: LegacyTransactionLog[];
}
export interface BlockResult {
    header: BlockHeader;
    transactions: Transaction[];
}
export declare function adaptTransactionResult(txResult: FinalExecutionOutcome | LegacyFinalTransactionResult): FinalExecutionOutcome;
export declare abstract class Provider {
    abstract getNetwork(): Promise<Network>;
    abstract status(): Promise<NodeStatusResult>;
    abstract sendTransaction(signedTransaction: SignedTransaction): Promise<FinalExecutionOutcome>;
    abstract txStatus(txHash: Uint8Array, accountId: string): Promise<FinalExecutionOutcome>;
    abstract query(path: string, data: string): Promise<any>;
    abstract block(blockId: BlockId): Promise<BlockResult>;
    abstract chunk(chunkId: ChunkId): Promise<ChunkResult>;
}
export declare function getTransactionLastResult(txResult: FinalExecutionOutcome): any;
export {};
