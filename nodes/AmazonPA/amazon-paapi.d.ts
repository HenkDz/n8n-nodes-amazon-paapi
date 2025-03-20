declare module 'amazon-paapi' {
    interface CommonParameters {
        AccessKey: string;
        SecretKey: string;
        PartnerTag: string;
        Marketplace: string;
        PartnerType: string;
    }

    interface GetItemsParameters {
        ItemIds: string[];
        Resources?: string[];
        LanguageOfPreference?: string;
    }

    interface SearchItemsParameters {
        Keywords: string;
        SearchIndex?: string;
        Resources?: string[];
        ItemCount?: number;
        ItemPage?: number;
        SortBy?: string;
        Merchant?: string;
        Condition?: string;
        MinPrice?: number;
        MaxPrice?: number;
        MinReviewsRating?: number;
        LanguageOfPreference?: string;
    }

    interface GetBrowseNodesParameters {
        BrowseNodeIds: string[];
        Resources?: string[];
        LanguageOfPreference?: string;
    }

    interface GetVariationsParameters {
        ASIN: string;
        Resources?: string[];
        LanguageOfPreference?: string;
    }

    interface ApiError {
        Code: string;
        Message: string;
    }

    interface ApiResponse {
        ItemsResult?: Record<string, unknown>;
        SearchResult?: Record<string, unknown>;
        BrowseNodesResult?: Record<string, unknown>;
        VariationsResult?: Record<string, unknown>;
        Errors?: ApiError[];
        [key: string]: unknown;
    }

    export function GetItems(
        commonParameters: CommonParameters, 
        getItemsParameters: GetItemsParameters
    ): Promise<ApiResponse>;

    export function SearchItems(
        commonParameters: CommonParameters, 
        searchItemsParameters: SearchItemsParameters
    ): Promise<ApiResponse>;

    export function GetBrowseNodes(
        commonParameters: CommonParameters, 
        getBrowseNodesParameters: GetBrowseNodesParameters
    ): Promise<ApiResponse>;

    export function GetVariations(
        commonParameters: CommonParameters, 
        getVariationsParameters: GetVariationsParameters
    ): Promise<ApiResponse>;
}

