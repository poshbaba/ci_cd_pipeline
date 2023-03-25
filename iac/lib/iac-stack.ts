import * as cdk from 'aws-cdk-lib';
import * as cdk from '@aws-cdk/core';
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { aws_eks as eks } from "aws-cdk-lib"
import { aws_iam as iam } from "aws-cdk-lib"
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class IacStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    new eks.Cluster(this, 'PoshEKS', {
      version: eks.KubernetesVersion.V1_24,
    }
    )
  }
}
    // Add EKS Cluster
    const cluster = new eks.Cluster(this, 'PoshEKS', {
      version: eks.KubernetesVersion.V1_24,
      defaultCapacity: 0,
    });      
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'set -o xtrace',
      `/etc/eks/bootstrap.sh ${cluster.clusterName}`,
    );
    // Ref UserData to Launch Template
    const launchTemplate = new ec2.CfnLaunchTemplate(this, 'poshbaba-LT', {
      launchTemplateData: {
        imageId: 'ami-0f1a908c3e0b400cf', // custom AMI
        instanceType: 't2.micro',
        minSize: 2,
        maxSize: 5,
        diskSize: 20,
        userData: cdk.Fn.base64(userData.render()),
     },
    });
    cluster.addNodegroupCapacity('poshbaba-ng', {
      launchTemplateSpec: {
        id: launchTemplate.ref,
        version: launchTemplate.attrLatestVersionNumber,
     },
    });
