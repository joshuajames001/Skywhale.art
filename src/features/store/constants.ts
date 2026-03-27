export const STRIPE_PRICES = {
    ONE_TIME: {
        starter:          { priceId: 'price_1TFL4uB4Ulijcmb0SrJOWGvO', energy: 1000 },
        writer:           { priceId: 'price_1TFL4yB4Ulijcmb0odLKefpp', energy: 3000 },
        master_wordsmith: { priceId: 'price_1TFL51B4Ulijcmb0u0wDGGlR', energy: 7500 },
    },
    SUBSCRIPTION: {
        sub_start:    { monthly: 'price_1TFL57B4Ulijcmb0vwfItDDc', yearly: 'price_1TFL59B4Ulijcmb0tK4TfF4p', energy: 1600 },
        sub_advanced: { monthly: 'price_1TFL5DB4Ulijcmb0MmnjSghZ', yearly: 'price_1TFL5FB4Ulijcmb05c5mLn5a', energy: 4000 },
        sub_expert:   { monthly: 'price_1TFL5JB4Ulijcmb0dEvHlb2R', yearly: 'price_1TFL5MB4Ulijcmb0TNxzSkiT', energy: 9000 },
        sub_master:   { monthly: 'price_1TFL5RB4Ulijcmb0JpMKtr3Z', yearly: 'price_1TFL5TB4Ulijcmb0WGeTWKqY', energy: 21000 },
    },
} as const;
