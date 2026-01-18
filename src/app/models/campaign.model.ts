export interface Campaign {
    id: number;
    template?: CampaignTemplate;
    businessId: number;
    title: string;
    subtitle: string;
    description: string;
    imageUrl: string;
    promoType: string | null;
    promoValue: string | null;
    promotionReward?: PromotionReward | null;
    startDate: string;
    endDate: string;
    status: string;
    callToAction: string;
    channels: string[];
    segmentation: string;
    isAutomatic: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CampaignTemplate {
    id: number;
    name: string;
    category: string;
    defaultTitle: string;
    defaultSubtitle: string;
    defaultDescription: string;
    defaultImageUrl: string;
    defaultPromoType: string;
    active: boolean;
}

export interface PromotionReward {
    id: number;
    campaignId: number;
    rewardType: string;
    numericValue?: number | null;
    productId?: number | null;
    buyQuantity?: number | null;
    freeQuantity?: number | null;
    customConfig?: any;
    description?: string | null;
    minPurchaseAmount?: number | null;
    usageLimit?: number | null;
    usageCount?: number | null;
    createdAt?: string;
    updatedAt?: string;
}
