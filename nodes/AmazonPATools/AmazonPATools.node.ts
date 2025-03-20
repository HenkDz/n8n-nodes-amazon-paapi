import {
    ICredentialDataDecryptedObject,
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeConnectionType,
} from 'n8n-workflow';

import * as amazonPaapi from 'amazon-paapi';

interface AmazonPaApiCredentials extends ICredentialDataDecryptedObject {
    accessKey: string;
    secretKey: string;
    partnerTag: string;
    marketplace: string;
}

interface AmazonPaApiSearchResponse {
    SearchResult?: {
        Items?: Array<{
            ItemInfo?: {
                Title?: { DisplayValue?: string };
                Features?: { DisplayValues?: string[] };
            };
            ASIN?: string;
            Offers?: {
                Listings?: Array<{
                    Price?: { DisplayAmount?: string };
                }>;
            };
            Images?: {
                Primary?: {
                    Medium?: { URL?: string };
                };
            };
            CustomerReviews?: {
                StarRating?: { DisplayValue?: string };
                Count?: number;
            };
        }>;
    };
}

interface AmazonPaApiItemResponse {
    ItemsResult?: {
        Items?: Array<{
            ItemInfo?: {
                Title?: { DisplayValue?: string };
                Features?: { DisplayValues?: string[] };
                ByLineInfo?: {
                    Brand?: { DisplayValue?: string };
                };
                ProductInfo?: {
                    ProductDescription?: { DisplayValue?: string };
                };
            };
            ASIN?: string;
            Offers?: {
                Listings?: Array<{
                    Price?: { DisplayAmount?: string };
                }>;
            };
            Images?: {
                Primary?: {
                    Medium?: { URL?: string };
                };
            };
            CustomerReviews?: {
                StarRating?: { DisplayValue?: string };
                Count?: number;
            };
        }>;
    };
}

export class AmazonPATools implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Amazon Product Search',
        name: 'amazonPATools',
        icon: 'file:amazon.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Search for products on Amazon and get their details',
        defaults: {
            name: 'Amazon Product Search',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [
            {
                name: 'amazonPaApi',
                required: true,
            },
        ],
        usableAsTool: true, // This makes it available as an agent tool
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Search Products',
                        value: 'searchProducts',
                        description: 'Search for products on Amazon using keywords and get their details including prices, titles, and URLs',
                        action: 'Search for products and get their details',
                    },
                    {
                        name: 'Get Product Details',
                        value: 'getProductDetails',
                        description: 'Get detailed information about specific products using their ASIN (Amazon Standard Identification Number)',
                        action: 'Get detailed product information',
                    },
                ],
                default: 'searchProducts',
            },
            {
                displayName: 'Search Keywords',
                name: 'keywords',
                type: 'string',
                default: '',
                description: 'The keywords to search for products on Amazon',
                displayOptions: {
                    show: {
                        operation: ['searchProducts'],
                    },
                },
            },
            {
                displayName: 'Product ASIN',
                name: 'asin',
                type: 'string',
                default: '',
                description: 'The Amazon Standard Identification Number (ASIN) of the product',
                displayOptions: {
                    show: {
                        operation: ['getProductDetails'],
                    },
                },
            },
            {
                displayName: 'Include Fields',
                name: 'includeFields',
                type: 'multiOptions',
                options: [
                    { name: 'Title', value: 'ItemInfo.Title' },
                    { name: 'Features', value: 'ItemInfo.Features' },
                    { name: 'Price', value: 'Offers.Listings.Price' },
                    { name: 'Images', value: 'Images.Primary.Medium' },
                    { name: 'Rating', value: 'CustomerReviews.StarRating' },
                    { name: 'Review Count', value: 'CustomerReviews.Count' },
                    { name: 'Brand', value: 'ItemInfo.ByLineInfo.Brand' },
                    { name: 'Product Description', value: 'ItemInfo.ProductInfo.ProductDescription' },
                ],
                default: ['ItemInfo.Title', 'Offers.Listings.Price', 'Images.Primary.Medium'],
                description: 'The fields to include in the response',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const returnData: INodeExecutionData[] = [];
        const operation = this.getNodeParameter('operation', 0, '') as string;
        const includeFields = this.getNodeParameter('includeFields', 0, []) as string[];

        try {
            // Get credentials
            const credentials = await this.getCredentials('amazonPaApi') as unknown as AmazonPaApiCredentials;
            
            const commonParameters = {
                AccessKey: credentials.accessKey,
                SecretKey: credentials.secretKey,
                PartnerTag: credentials.partnerTag,
                Marketplace: credentials.marketplace,
                PartnerType: 'Associates',
                Resources: includeFields,
            };

            if (operation === 'searchProducts') {
                const keywords = this.getNodeParameter('keywords', 0, '') as string;

                const searchItemsParams: amazonPaapi.SearchItemsParameters = {
                    Keywords: keywords,
                    Resources: includeFields,
                    SearchIndex: 'All',
                    ItemCount: 10,
                };

                const responseData = await amazonPaapi.SearchItems(commonParameters, searchItemsParams) as AmazonPaApiSearchResponse;

                if (responseData?.SearchResult?.Items) {
                    returnData.push({
                        json: {
                            success: true,
                            operation: 'searchProducts',
                            results: responseData.SearchResult.Items.map((item) => ({
                                title: item.ItemInfo?.Title?.DisplayValue,
                                asin: item.ASIN,
                                url: `https://${credentials.marketplace}/dp/${item.ASIN}`,
                                price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount,
                                imageUrl: item.Images?.Primary?.Medium?.URL,
                                rating: item.CustomerReviews?.StarRating?.DisplayValue,
                                reviewCount: item.CustomerReviews?.Count,
                                features: item.ItemInfo?.Features?.DisplayValues,
                            })),
                        },
                    });
                }
            } else if (operation === 'getProductDetails') {
                const asin = this.getNodeParameter('asin', 0, '') as string;

                const getItemsParams: amazonPaapi.GetItemsParameters = {
                    ItemIds: [asin],
                    Resources: includeFields,
                };

                const responseData = await amazonPaapi.GetItems(commonParameters, getItemsParams) as AmazonPaApiItemResponse;

                if (responseData?.ItemsResult?.Items?.[0]) {
                    const item = responseData.ItemsResult.Items[0];
                    returnData.push({
                        json: {
                            success: true,
                            operation: 'getProductDetails',
                            product: {
                                title: item.ItemInfo?.Title?.DisplayValue,
                                asin: item.ASIN,
                                url: `https://${credentials.marketplace}/dp/${item.ASIN}`,
                                price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount,
                                imageUrl: item.Images?.Primary?.Medium?.URL,
                                rating: item.CustomerReviews?.StarRating?.DisplayValue,
                                reviewCount: item.CustomerReviews?.Count,
                                features: item.ItemInfo?.Features?.DisplayValues,
                                brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue,
                                description: item.ItemInfo?.ProductInfo?.ProductDescription?.DisplayValue,
                            },
                        },
                    });
                }
            }
        } catch (error) {
            returnData.push({
                json: {
                    success: false,
                    error: error instanceof Error ? error.message : 'An unknown error occurred',
                    operation,
                },
            });
        }

        return [returnData];
    }
} 