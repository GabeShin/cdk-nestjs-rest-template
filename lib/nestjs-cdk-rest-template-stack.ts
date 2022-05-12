import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import {
	AssetCode,
	Function,
	LayerVersion,
	Runtime,
} from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class NestjsCdkRestTemplateStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const dependenciesLayer = new LayerVersion(this, "DependenciesLayer", {
			code: new AssetCode("modules/test_api/node_modules"),
			compatibleRuntimes: [Runtime.NODEJS_14_X, Runtime.NODEJS_16_X],
		});

		const testLambda = new Function(this, "TestHandler", {
			runtime: Runtime.NODEJS_16_X,
			code: new AssetCode("modules/test_api/dist"),
			handler: "index.handler",
			layers: [dependenciesLayer],
			environment: {
				NODE_PATH: "$NODE_PATH:/opt",
			},
		});

		new LambdaRestApi(this, "TestEndpoint", {
			handler: testLambda,
		});

		// The code that defines your stack goes here

		// example resource
		// const queue = new sqs.Queue(this, 'NestjsCdkRestTemplateQueue', {
		//   visibilityTimeout: cdk.Duration.seconds(300)
		// });
	}
}
