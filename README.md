# n8n-nodes-yup-data-validator

This is an n8n community node. It lets you use [Yup](https://github.com/jquense/yup) for data validation in your n8n workflows.

Yup is a JavaScript schema builder for value parsing and validation.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

This node provides a `validate` operation that allows you to define a set of validation rules against your input data.

## Compatibility

This node was developed against n8n version 1.x.

## Usage

This node is designed to validate incoming data against a Yup schema. You can configure multiple validation rules.

For each validation rule, you need to provide:

*   **Field Value**: The value from your input data that you want to validate. You can use n8n expressions here.
*   **Validation Schema**: A Yup validation schema string. The `yup` object is available for you to build your schema.

**Example:**

If you have an input item like:

```json
{
  "name": "John Doe",
  "email": "invalid-email"
}
```

You could set up two validation rules:

1.  **Field Value**: `{{ $json.name }}`
    **Validation Schema**: `yup.string().min(3).required()`
2.  **Field Value**: `{{ $json.email }}`
    **Validation Schema**: `yup.string().email().required()`

If the validation fails for an item, the node will either stop the workflow and throw an error, or if "Continue on Fail" is enabled, it will output an item with an `error` property containing the validation error message.

## Resources

*   [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
*   [Yup Documentation](https://github.com/jquense/yup)
