import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

export class CurrentTime implements INodeType {
  description: INodeTypeDescription = {
		displayName: 'Current Time',
		name: 'currentTime',
		version: 1,
		defaults: {
			name: 'Current Time',
		},
		icon: 'file:clock.svg',
		group: ['transform'],
		description: 'Returns the current time',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [NodeConnectionType.Main],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [],
    properties: [],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData = [];
		const time = new Date().toISOString();

		for (let i = 0; i < items.length; i++) {
			returnData.push({
				json: { time },
			});
		}

    return [returnData];
  }
}
