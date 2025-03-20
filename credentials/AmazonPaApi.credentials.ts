import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AmazonPaApi implements ICredentialType {
	name = 'amazonPaApi';
	displayName = 'Amazon PA API';
	documentationUrl = 'https://webservices.amazon.com/paapi5/documentation/';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Key',
			name: 'accessKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The access key from your Amazon PA API credentials',
		},
		{
			displayName: 'Secret Key',
			name: 'secretKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The secret key from your Amazon PA API credentials',
		},
		{
			displayName: 'Partner Tag',
			name: 'partnerTag',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Amazon Associate tracking ID (e.g., mystore-20)',
		},
		{
			displayName: 'Marketplace',
			name: 'marketplace',
			type: 'options',
			options: [
				{
					name: 'Australia',
					value: 'www.amazon.com.au',
				},
				{
					name: 'Brazil',
					value: 'www.amazon.com.br',
				},
				{
					name: 'Canada',
					value: 'www.amazon.ca',
				},
				{
					name: 'France',
					value: 'www.amazon.fr',
				},
				{
					name: 'Germany',
					value: 'www.amazon.de',
				},
				{
					name: 'India',
					value: 'www.amazon.in',
				},
				{
					name: 'Italy',
					value: 'www.amazon.it',
				},
				{
					name: 'Japan',
					value: 'www.amazon.co.jp',
				},
				{
					name: 'Mexico',
					value: 'www.amazon.com.mx',
				},
				{
					name: 'Netherlands',
					value: 'www.amazon.nl',
				},
				{
					name: 'Singapore',
					value: 'www.amazon.sg',
				},
				{
					name: 'Spain',
					value: 'www.amazon.es',
				},
				{
					name: 'Sweden',
					value: 'www.amazon.se',
				},
				{
					name: 'Turkey',
					value: 'www.amazon.com.tr',
				},
				{
					name: 'United Arab Emirates',
					value: 'www.amazon.ae',
				},
				{
					name: 'United Kingdom',
					value: 'www.amazon.co.uk',
				},
				{
					name: 'United States',
					value: 'www.amazon.com',
				},
			],
			default: 'www.amazon.com',
			required: true,
			description: 'The Amazon marketplace to use',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.marketplace}}',
			url: '/paapi5/getitems',
			method: 'POST',
			body: {
				ItemIds: ['B08N5KWB9H'],
				PartnerTag: '={{$credentials.partnerTag}}',
				PartnerType: 'Associates',
				Marketplace: '={{$credentials.marketplace}}',
				Resources: ['ItemInfo.Title'],
			},
			headers: {
				'Content-Type': 'application/json',
				'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
			},
		},
	};
}
