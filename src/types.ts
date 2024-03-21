export type Experiments = {
	allocations: Allocation[];
	exclusions: string[];
	confirmations: Confirmation[];
}

export interface Allocation {
	cid: string;
	eid: string;
	excluded: boolean;
	group_id: string;
	ordinal: number;
	uid: string;
}

export interface Confirmation {
	cid: string;
	timestamp: number;
}

export interface Evolv {
	client: {
		getDisplayName: (type: string, id: string) => Promise<string>;
		on: (event: string, callback: () => void) => void;
	};
	context: {
		get: (key: string) => Experiments;
		remoteContext: RemoteContext;
	}
}

export interface InitData {
	remoteContext: RemoteContext;
	envID: string;
	uid: string;
	blockExecution?: BlockExecution;
	previewCid: string | null;
	stage: Stage | undefined;
	snippetIsDisabled: boolean;
}

export enum Stage {
	Staging = '-stg',
	Production = '',
	Development = 'development'
}

export type BlockExecution = string | null;

export type RemoteContext = {
	experiments?: Experiments;
	experimentNames?: any;
	events?: any;
}

export type Candidate = {
	ordinal: number;
	id: string;
}
