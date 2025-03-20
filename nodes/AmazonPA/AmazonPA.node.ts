import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    IDataObject,
    INodeInputConfiguration,
    NodeConnectionType,
    INodeOutputConfiguration,
} from 'n8n-workflow';

import * as amazonPaapi from 'amazon-paapi';

export class AmazonPA implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Amazon PA API',
        name: 'amazonPA',
        icon: 'file:amazon.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Interact with Amazon Product Advertising API 5.0 (PAAPI)',
        defaults: {
            name: 'Amazon PA API',
            color: '#FF9900',
        },
        inputs: ['main'] as (NodeConnectionType | INodeInputConfiguration)[],
        outputs: ['main'] as (NodeConnectionType | INodeOutputConfiguration)[],
        credentials: [
            {
                name: 'amazonPaApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                    {
                        name: 'Search Items',
                        value: 'searchItems',
                        description: 'Search for items on Amazon',
                    },
                    {
                        name: 'Get Items',
                        value: 'getItems',
                        description: 'Get item information by ASIN',
                    },
                    {
                        name: 'Get Browse Nodes',
                        value: 'getBrowseNodes',
                        description: 'Get browse node information',
                    },
                    {
                        name: 'Get Variations',
                        value: 'getVariations',
                        description: 'Get variations for a parent ASIN',
                    },
                ],
                default: 'searchItems',
            },
            {
                displayName: 'Partner Tag',
                name: 'partnerTag',
                type: 'string',
                default: '',
                description: 'Amazon Partner Tag (overrides default if set)',
            },
            {
                displayName: 'Item IDs (for Get Items)',
                name: 'itemIds',
                type: 'string',
                displayOptions: {
                    show: {
                        operation: ['getItems'],
                    },
                },
                default: '',
                description: 'Comma-separated list of ASINs for items',
            },
            {
                displayName: 'ASIN (for Get Variations)',
                name: 'variationAsin',
                type: 'string',
                displayOptions: {
                    show: {
                        operation: ['getVariations'],
                    },
                },
                default: '',
                description: 'Parent ASIN to get variations for',
            },
            {
                displayName: 'Keywords (for Search Items)',
                name: 'keywords',
                type: 'string',
                displayOptions: {
                    show: {
                        operation: ['searchItems'],
                    },
                },
                default: '',
                description: 'Keywords to search for items on Amazon',
            },
            {
                displayName: 'Search Index (for Search Items)',
                name: 'searchIndex',
                type: 'options',
                displayOptions: {
                    show: {
                        operation: ['searchItems'],
                    },
                },
                options: [
                    { name: 'All', value: 'All' },
                    { name: 'Apparel', value: 'Apparel' },
                    { name: 'Automotive', value: 'Automotive' },
                    { name: 'Baby', value: 'Baby' },
                    { name: 'Beauty', value: 'Beauty' },
                    { name: 'Books', value: 'Books' },
                    { name: 'Electronics', value: 'Electronics' },
                    { name: 'HomeAndKitchen', value: 'HomeAndKitchen' },
                    { name: 'Music', value: 'Music' },
                    { name: 'SportsAndOutdoors', value: 'SportsAndOutdoors' },
                    { name: 'VideoGames', value: 'VideoGames' },
                ],
                default: 'All',
                description: 'Product category to search in',
            },
            {
                displayName: 'Browse Node IDs (for Get Browse Nodes)',
                name: 'browseNodeIds',
                type: 'string',
                displayOptions: {
                    show: {
                        operation: ['getBrowseNodes'],
                    },
                },
                default: '',
                description: 'Comma-separated list of Browse Node IDs',
            },
            {
                displayName: 'Resources',
                name: 'resources',
                type: 'multiOptions',
                options: [
                    { name: 'BrowseNodeInfo.BrowseNodes', value: 'BrowseNodeInfo.BrowseNodes' },
                    { name: 'BrowseNodeInfo.WebsiteSalesRank', value: 'BrowseNodeInfo.WebsiteSalesRank' },
                    { name: 'Images.Primary.Small', value: 'Images.Primary.Small' },
                    { name: 'Images.Primary.Medium', value: 'Images.Primary.Medium' },
                    { name: 'Images.Primary.Large', value: 'Images.Primary.Large' },
                    { name: 'Images.Variants.Small', value: 'Images.Variants.Small' },
                    { name: 'Images.Variants.Medium', value: 'Images.Variants.Medium' },
                    { name: 'Images.Variants.Large', value: 'Images.Variants.Large' },
                    { name: 'ItemInfo.ByLineInfo', value: 'ItemInfo.ByLineInfo' },
                    { name: 'ItemInfo.ContentInfo', value: 'ItemInfo.ContentInfo' },
                    { name: 'ItemInfo.ContentRating', value: 'ItemInfo.ContentRating' },
                    { name: 'ItemInfo.Classifications', value: 'ItemInfo.Classifications' },
                    { name: 'ItemInfo.ExternalIds', value: 'ItemInfo.ExternalIds' },
                    { name: 'ItemInfo.Features', value: 'ItemInfo.Features' },
                    { name: 'ItemInfo.ManufactureInfo', value: 'ItemInfo.ManufactureInfo' },
                    { name: 'ItemInfo.ProductInfo', value: 'ItemInfo.ProductInfo' },
                    { name: 'ItemInfo.TechnicalInfo', value: 'ItemInfo.TechnicalInfo' },
                    { name: 'ItemInfo.Title', value: 'ItemInfo.Title' },
                    { name: 'ItemInfo.TradeInInfo', value: 'ItemInfo.TradeInInfo' },
                    { name: 'Offers.Listings.Availability.MaxOrderQuantity', value: 'Offers.Listings.Availability.MaxOrderQuantity' },
                    { name: 'Offers.Listings.Availability.Message', value: 'Offers.Listings.Availability.Message' },
                    { name: 'Offers.Listings.Availability.MinOrderQuantity', value: 'Offers.Listings.Availability.MinOrderQuantity' },
                    { name: 'Offers.Listings.Availability.Type', value: 'Offers.Listings.Availability.Type' },
                    { name: 'Offers.Listings.Condition', value: 'Offers.Listings.Condition' },
                    { name: 'Offers.Listings.Condition.SubCondition', value: 'Offers.Listings.Condition.SubCondition' },
                    { name: 'Offers.Listings.DeliveryInfo.IsAmazonFulfilled', value: 'Offers.Listings.DeliveryInfo.IsAmazonFulfilled' },
                    { name: 'Offers.Listings.DeliveryInfo.IsFreeShippingEligible', value: 'Offers.Listings.DeliveryInfo.IsFreeShippingEligible' },
                    { name: 'Offers.Listings.DeliveryInfo.IsPrimeEligible', value: 'Offers.Listings.DeliveryInfo.IsPrimeEligible' },
                    { name: 'Offers.Listings.MerchantInfo', value: 'Offers.Listings.MerchantInfo' },
                    { name: 'Offers.Listings.Price', value: 'Offers.Listings.Price' },
                    { name: 'Offers.Listings.ProgramEligibility.IsPrimeExclusive', value: 'Offers.Listings.ProgramEligibility.IsPrimeExclusive' },
                    { name: 'Offers.Listings.ProgramEligibility.IsPrimePantry', value: 'Offers.Listings.ProgramEligibility.IsPrimePantry' },
                    { name: 'Offers.Listings.Promotions', value: 'Offers.Listings.Promotions' },
                    { name: 'Offers.Listings.SavingBasis', value: 'Offers.Listings.SavingBasis' },
                    { name: 'Offers.Summaries.HighestPrice', value: 'Offers.Summaries.HighestPrice' },
                    { name: 'Offers.Summaries.LowestPrice', value: 'Offers.Summaries.LowestPrice' },
                    { name: 'Offers.Summaries.OfferCount', value: 'Offers.Summaries.OfferCount' },
                    // New OffersV2 resources
                    { name: 'OffersV2.Listings.DeliveryInfo.IsPrimeEligible', value: 'OffersV2.Listings.DeliveryInfo.IsPrimeEligible' },
                    { name: 'OffersV2.Listings.Price', value: 'OffersV2.Listings.Price' },
                    { name: 'OffersV2.Listings.SavingBasis', value: 'OffersV2.Listings.SavingBasis' },
                ],
                default: [
                    'ItemInfo.Title',
                    'Offers.Listings.Price',
                    'Images.Primary.Medium',
                ],
                description: 'Resources to include in the response',
            },
            {
                displayName: 'Use OffersV2',
                name: 'useOffersV2',
                type: 'boolean',
                default: false,
                description: 'Whether to use the newer OffersV2 resource (requires API v1.2.2+)',
            },
            {
                displayName: 'Additional Options',
                name: 'additionalOptions',
                type: 'collection',
                placeholder: 'Add Option',
                default: {},
                options: [
                    {
                        displayName: 'Language of Preference',
                        name: 'languageOfPreference',
                        type: 'options',
                        options: [
                            { name: 'Default', value: '' },
                            { name: 'English', value: 'en_US' },
                            { name: 'Spanish', value: 'es_US' },
                            { name: 'French', value: 'fr_CA' },
                            { name: 'German', value: 'de_DE' },
                            { name: 'Italian', value: 'it_IT' },
                            { name: 'Japanese', value: 'ja_JP' },
                        ],
                        default: '',
                        description: 'Preferred language for item information',
                    },
                    {
                        displayName: 'Sort By (for Search Items)',
                        name: 'sortBy',
                        type: 'options',
                        displayOptions: {
                            show: {
                                '/operation': ['searchItems'],
                            },
                        },
                        options: [
                            { name: 'Relevance', value: 'Relevance' },
                            { name: 'Price: Low to High', value: 'PriceLowToHigh' },
                            { name: 'Price: High to Low', value: 'PriceHighToLow' },
                            { name: 'Average Customer Review', value: 'AvgCustomerReviews' },
                            { name: 'Newest Arrivals', value: 'NewestArrivals' },
                            { name: 'Featured', value: 'Featured' },
                        ],
                        default: 'Relevance',
                        description: 'How to sort search results',
                    },
                    {
                        displayName: 'Item Page (for Search Items)',
                        name: 'itemPage',
                        type: 'number',
                        displayOptions: {
                            show: {
                                '/operation': ['searchItems'],
                            },
                        },
                        default: 1,
                        description: 'Page number of results (1-10)',
                        typeOptions: {
                            minValue: 1,
                            maxValue: 10,
                        },
                    },
                    {
                        displayName: 'Item Count (for Search Items)',
                        name: 'itemCount',
                        type: 'number',
                        displayOptions: {
                            show: {
                                '/operation': ['searchItems'],
                            },
                        },
                        default: 10,
                        description: 'Number of items per page (1-10)',
                        typeOptions: {
                            minValue: 1,
                            maxValue: 10,
                        },
                    },
                    {
                        displayName: 'Merchant (for Search Items)',
                        name: 'merchant',
                        type: 'options',
                        displayOptions: {
                            show: {
                                '/operation': ['searchItems'],
                            },
                        },
                        options: [
                            { name: 'All', value: 'All' },
                            { name: 'Amazon', value: 'Amazon' },
                        ],
                        default: 'All',
                        description: 'Filter by merchant type',
                    },
                    {
                        displayName: 'Condition (for Search Items)',
                        name: 'condition',
                        type: 'options',
                        displayOptions: {
                            show: {
                                '/operation': ['searchItems'],
                            },
                        },
                        options: [
                            { name: 'Any', value: 'Any' },
                            { name: 'New', value: 'New' },
                            { name: 'Used', value: 'Used' },
                            { name: 'Collectible', value: 'Collectible' },
                            { name: 'Refurbished', value: 'Refurbished' },
                        ],
                        default: 'Any',
                        description: 'Filter by item condition',
                    },
                    {
                        displayName: 'Min Price (for Search Items)',
                        name: 'minPrice',
                        type: 'number',
                        displayOptions: {
                            show: {
                                '/operation': ['searchItems'],
                            },
                        },
                        default: 0,
                        description: 'Minimum price filter (in marketplace currency)',
                        typeOptions: {
                            minValue: 0,
                        },
                    },
                    {
                        displayName: 'Max Price (for Search Items)',
                        name: 'maxPrice',
                        type: 'number',
                        displayOptions: {
                            show: {
                                '/operation': ['searchItems'],
                            },
                        },
                        default: 0,
                        description: 'Maximum price filter (0 = no maximum, in marketplace currency)',
                        typeOptions: {
                            minValue: 0,
                        },
                    },
                    {
                        displayName: 'Min Reviews (for Search Items)',
                        name: 'minReviewsRating',
                        type: 'number',
                        displayOptions: {
                            show: {
                                '/operation': ['searchItems'],
                            },
                        },
                        default: 0,
                        description: 'Minimum customer review rating (1-5)',
                        typeOptions: {
                            minValue: 0,
                            maxValue: 5,
                        },
                    },
                ],
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        // Retrieve credentials
        const credentials = await this.getCredentials('amazonPaApi');
        
        // Get partnerTag either from the input or from the credentials
        const partnerTag = this.getNodeParameter('partnerTag', 0, '') as string || credentials.partnerTag as string;
        
        // Ensure PartnerTag exists
        if (!partnerTag) {
            throw new Error('PartnerTag is required but was not provided in both the request and credentials.');
        }

        const commonParameters: amazonPaapi.CommonParameters = {
            AccessKey: credentials.accessKey as string,
            SecretKey: credentials.secretKey as string,
            PartnerTag: partnerTag,
            Marketplace: credentials.marketplace as string,
            PartnerType: 'Associates',
        };

        // Loop through each item
        for (let i = 0; i < items.length; i++) {
            let responseData;
            const requestParameters: Record<string, unknown> = {};

            try {
                const operation = this.getNodeParameter('operation', i) as string;
                const resources = this.getNodeParameter('resources', i, []) as string[];
                
                // Add any additional parameters
                const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as {
                    languageOfPreference?: string;
                    sortBy?: string;
                    itemPage?: number;
                    itemCount?: number;
                    merchant?: string;
                    condition?: string;
                    minPrice?: number;
                    maxPrice?: number;
                    minReviewsRating?: number;
                };

                // Add language preference if specified
                if (additionalOptions.languageOfPreference) {
                    requestParameters.LanguageOfPreference = additionalOptions.languageOfPreference;
                }

                // Set resources for all operations
                requestParameters.Resources = resources;

                // Check if we should use OffersV2
                const useOffersV2 = this.getNodeParameter('useOffersV2', i, false) as boolean;
                
                // Update resources to use OffersV2 if selected
                if (useOffersV2) {
                    // Replace any Offers resources with OffersV2
                    requestParameters.Resources = (requestParameters.Resources as string[]).map((resource: string) => {
                        if (resource.startsWith('Offers.')) {
                            return resource.replace('Offers.', 'OffersV2.');
                        }
                        return resource;
                    });
                }

                if (operation === 'getItems') {
                    // Handling Get Items request
                    const itemIds = this.getNodeParameter('itemIds', i) as string | null;

                    if (itemIds) {
                        requestParameters.ItemIds = itemIds.includes(',') ? itemIds.split(',').map(id => id.trim()) : [itemIds.trim()];
                    } else {
                        throw new Error('Item IDs are required but were not provided.');
                    }
                    
                    const getItemsParams: amazonPaapi.GetItemsParameters = {
                        ItemIds: requestParameters.ItemIds as string[],
                        Resources: requestParameters.Resources as string[],
                    };
                    
                    if (requestParameters.LanguageOfPreference) {
                        getItemsParams.LanguageOfPreference = requestParameters.LanguageOfPreference as string;
                    }
                    
                    responseData = await amazonPaapi.GetItems(commonParameters, getItemsParams);
                } else if (operation === 'searchItems') {
                    // Handling Search Items request
                    const keywords = this.getNodeParameter('keywords', i) as string;
                    const searchIndex = this.getNodeParameter('searchIndex', i, 'All') as string;
                    
                    requestParameters.Keywords = keywords;
                    requestParameters.SearchIndex = searchIndex;
                    
                    // Add optional search parameters
                    if (additionalOptions.sortBy) {
                        requestParameters.SortBy = additionalOptions.sortBy;
                    }
                    
                    if (additionalOptions.itemPage) {
                        requestParameters.ItemPage = additionalOptions.itemPage;
                    }
                    
                    if (additionalOptions.itemCount) {
                        requestParameters.ItemCount = additionalOptions.itemCount;
                    }
                    
                    if (additionalOptions.merchant) {
                        requestParameters.Merchant = additionalOptions.merchant;
                    }
                    
                    if (additionalOptions.condition) {
                        requestParameters.Condition = additionalOptions.condition;
                    }
                    
                    // Add min/max price if specified
                    if ((additionalOptions.minPrice ?? 0) > 0 || (additionalOptions.maxPrice ?? 0) > 0) {
                        requestParameters.MinPrice = (additionalOptions.minPrice ?? 0) > 0 ? additionalOptions.minPrice : undefined;
                        requestParameters.MaxPrice = (additionalOptions.maxPrice ?? 0) > 0 ? additionalOptions.maxPrice : undefined;
                    }
                    
                    // Add min review rating if specified
                    if ((additionalOptions.minReviewsRating ?? 0) > 0) {
                        requestParameters.MinReviewsRating = additionalOptions.minReviewsRating;
                    }
                    
                    const searchItemsParams: amazonPaapi.SearchItemsParameters = {
                        Keywords: keywords,
                        Resources: requestParameters.Resources as string[],
                        SearchIndex: searchIndex,
                    };
                    
                    // Add optional parameters
                    if (requestParameters.LanguageOfPreference) {
                        searchItemsParams.LanguageOfPreference = requestParameters.LanguageOfPreference as string;
                    }
                    
                    if (requestParameters.SortBy) {
                        searchItemsParams.SortBy = requestParameters.SortBy as string;
                    }
                    
                    if (requestParameters.ItemPage) {
                        searchItemsParams.ItemPage = requestParameters.ItemPage as number;
                    }
                    
                    if (requestParameters.ItemCount) {
                        searchItemsParams.ItemCount = requestParameters.ItemCount as number;
                    }
                    
                    if (requestParameters.Merchant) {
                        searchItemsParams.Merchant = requestParameters.Merchant as string;
                    }
                    
                    if (requestParameters.Condition) {
                        searchItemsParams.Condition = requestParameters.Condition as string;
                    }
                    
                    if (requestParameters.MinPrice) {
                        searchItemsParams.MinPrice = requestParameters.MinPrice as number;
                    }
                    
                    if (requestParameters.MaxPrice) {
                        searchItemsParams.MaxPrice = requestParameters.MaxPrice as number;
                    }
                    
                    if (requestParameters.MinReviewsRating) {
                        searchItemsParams.MinReviewsRating = requestParameters.MinReviewsRating as number;
                    }
                    
                    responseData = await amazonPaapi.SearchItems(commonParameters, searchItemsParams);
                } else if (operation === 'getBrowseNodes') {
                    // Handling Get Browse Nodes request
                    const browseNodeIds = this.getNodeParameter('browseNodeIds', i) as string | null;

                    if (browseNodeIds) {
                        requestParameters.BrowseNodeIds = browseNodeIds.includes(',') ? browseNodeIds.split(',').map(id => id.trim()) : [browseNodeIds.trim()];
                    } else {
                        throw new Error('Browse Node IDs are required but were not provided.');
                    }
                    
                    const getBrowseNodesParams: amazonPaapi.GetBrowseNodesParameters = {
                        BrowseNodeIds: requestParameters.BrowseNodeIds as string[],
                        Resources: requestParameters.Resources as string[],
                    };
                    
                    if (requestParameters.LanguageOfPreference) {
                        getBrowseNodesParams.LanguageOfPreference = requestParameters.LanguageOfPreference as string;
                    }
                    
                    responseData = await amazonPaapi.GetBrowseNodes(commonParameters, getBrowseNodesParams);
                } else if (operation === 'getVariations') {
                    // Handling Get Variations request
                    const variationAsin = this.getNodeParameter('variationAsin', i) as string;
                    
                    if (!variationAsin) {
                        throw new Error('ASIN is required for Get Variations operation.');
                    }
                    
                    requestParameters.ASIN = variationAsin;
                    
                    const getVariationsParams: amazonPaapi.GetVariationsParameters = {
                        ASIN: variationAsin,
                        Resources: requestParameters.Resources as string[],
                    };
                    
                    if (requestParameters.LanguageOfPreference) {
                        getVariationsParams.LanguageOfPreference = requestParameters.LanguageOfPreference as string;
                    }
                    
                    responseData = await amazonPaapi.GetVariations(commonParameters, getVariationsParams);
                }

                // Process the response data to make it more user-friendly
                let processedData: IDataObject = {};
                
                // Check if we have error elements in the response
                if (responseData?.Errors) {
                    console.error('Amazon PA API Error:', JSON.stringify(responseData.Errors, null, 2));
                    
                    // Create a user-friendly error message for the output
                    const errorMessages = responseData.Errors.map((error: { Code: string; Message: string }) => 
                        `Code: ${error.Code}, Message: ${error.Message}`
                    ).join('; ');
                    
                    processedData = {
                        success: false,
                        errors: responseData.Errors,
                        errorMessage: errorMessages,
                        originalResponse: responseData,
                    };
                } else {
                    // Add a success flag for easier checking
                    processedData = {
                        success: true,
                        ...(responseData as IDataObject),
                    };
                }

                // Add response to returnData
                returnData.push({ json: processedData });

            } catch (error) {
                console.error('Amazon PA API Request Error:', error);
                
                // Create a structured error response
                const errorResponse = {
                    success: false,
                    errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
                    errorDetail: error instanceof Error ? error.stack : undefined,
                };
                
                returnData.push({ json: errorResponse });
            }
        }

        // Return the processed data
        return [returnData];
    }
}
