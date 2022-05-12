import { App, Stack, StackProps } from "aws-cdk-lib";
import {
	CfnDataSource,
	CfnGraphQLApi,
	CfnGraphQLSchema,
	CfnResolver,
} from "aws-cdk-lib/aws-appsync";
import { CfnRole } from "aws-cdk-lib/aws-iam";
import {
	AssetCode,
	Function,
	LayerVersion,
	Runtime,
} from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as fs from "fs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class NestjsCdkRestTemplateStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const dependenciesLayer = new LayerVersion(this, "DependenciesLayer", {
			code: new AssetCode("modules/nestjs-graphql-template/node_modules"),
			compatibleRuntimes: [Runtime.NODEJS_14_X, Runtime.NODEJS_16_X],
		});

		const role = new CfnRole(this, "TestRole", {
			assumeRolePolicyDocument: "",
			managedPolicyArns: '",',
		});

		const testLambda = new Function(this, "TestHandler", {
			runtime: Runtime.NODEJS_16_X,
			code: new AssetCode("modules/nestjs-graphql-template/dist"),
			handler: "index.handler",
			role: role,
			layers: [dependenciesLayer],
			environment: {
				NODE_PATH: "$NODE_PATH:/opt",
			},
		});

		const api = new CfnGraphQLApi(this, "TestApi", {
			name: "TestApi",
			authenticationType: "API_KEY",
		});

		const schemafile = fs.readFileSync(
			"modules/nestjs-graphql-template/schema.graphql"
		);

		const schema = new CfnGraphQLSchema(this, "MyGraphqlSchema", {
			apiId: api.attrApiId,
			definition: schemafile.toString(),
		});

		const dataSource = new CfnDataSource(this, "TestDataSource", {
			apiId: api.attrApiId,
			name: "TestDataSource",
			type: "AWS_LAMBDA",
			lambdaConfig: {
				lambdaFunctionArn: testLambda.functionArn,
			},
		});

		const testResolver = new CfnResolver(this, "TestResolver", {
			apiId: api.attrApiId,
			typeName: "Query",
			fieldName: "test",
			dataSourceName: dataSource.name,
		});
		testResolver.addDependsOn(schema);

		// The code that defines your stack goes here

		// example resource
		// const queue = new sqs.Queue(this, 'NestjsCdkRestTemplateQueue', {
		//   visibilityTimeout: cdk.Duration.seconds(300)
		// });
	}
}

// const app = new App();
// new NestjsCdkRestTemplateStack(app, "myCdkStack", {
// 	stackName: "myCdkStack",
// 	env: {
// 		region: "ap-northeast-2",
// 		account: "492134762507",
// 	},
// });
