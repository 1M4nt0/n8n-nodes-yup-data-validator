import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import * as yup from 'yup';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

class YupValidation implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Yup Validation',
		name: 'yupValidation',
		group: ['transform'],
		version: 1,
		description: 'Yup Validation Node',
		defaults: {
			name: 'Yup Validation',
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
								type: 'string',
								default: '',
								description: 'The key of the field to validate from the input data',
							},
							{
								displayName: 'Validation Schema',
								name: 'validationSchema',
								type: 'string',
								default: 'string().required()',
								description:
									'The Yup validation schema, DO NOT include "yup." (e.g., string().required())',
								noDataExpression: true,
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

						const schemaBuilder = new Function('yup', `return yup.${validationSchema}`);
						const schema = schemaBuilder(yup);

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

export { YupValidation };
