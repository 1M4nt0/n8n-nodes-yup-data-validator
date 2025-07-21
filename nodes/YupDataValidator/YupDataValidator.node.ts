import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { buildYup } from 'schema-to-yup';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

const DEFAULT_SCHEMA = `{
  "type": "object"
}`;

class YupDataValidator implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Yup Data Validator',
		name: 'yupDataValidator',
		group: ['transform'],
		version: 1,
		icon: { light: 'file:logo_light.svg', dark: 'file:logo_dark.svg' },
		description: 'Yup Data Validator Node',
		defaults: {
			name: 'Yup Data Validator',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Validations',
				name: 'validations',
				placeholder: 'Add Validation Rule',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'validation',
						displayName: 'Validation',
						values: [
							{
								displayName: 'Field Value',
								name: 'fieldValue',
								type: 'json',
								default: '{}',
								description: 'Drag a field from the left or insert the whole JSON item',
								placeholder: '{{$json}}',
								required: true,
							},
							{
								displayName: 'Validation Schema',
								name: 'validationSchema',
								type: 'json',
								default: DEFAULT_SCHEMA,
								description: 'The JSON Schema to validate the data against',
								required: true,
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const item = items[itemIndex];
			try {
				const validationsConfig = this.getNodeParameter('validations', itemIndex, {}) as {
					validation?: Array<{ fieldValue: string; validationSchema: string }>;
				};

				if (validationsConfig.validation) {
					for (const validation of validationsConfig.validation) {
						const { fieldValue, validationSchema } = validation;

						if (!fieldValue || !validationSchema) {
							continue;
						}

						const schema = buildYup(JSON.parse(validationSchema));

						schema.validateSync(fieldValue, { abortEarly: false, strict: true });
					}
				}

				returnData.push(item);
			} catch (error) {
				if (this.continueOnFail()) {
					const errorData: INodeExecutionData = {
						json: {
							...item.json,
							error: error.message,
						},
						pairedItem: {
							item: itemIndex,
						},
					};
					returnData.push(errorData);
					continue;
				}

				if (error.context) {
					error.context.itemIndex = itemIndex;
					throw error;
				}
				throw new NodeOperationError(this.getNode(), error, {
					itemIndex,
				});
			}
		}

		return [returnData];
	}
}

export { YupDataValidator };
