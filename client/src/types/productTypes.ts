// Define interface of variants
export interface Variants {
    _id: string;
    productId: string;
    color: string;
    price: number;
    quantity: number;
}

// Provide the product structure
export interface Product {
    _id: string;
    type: string;
    brand: string;
    model: string;
    variants: Variants[]
    storage: number;
}

// Dictionary type for speakers and phones
export type ProductDictionary = {
    [name: string]: Product[];
}

// Dictionary type for speakers and phones
export type PhoneBrandDictionary = {
    [brand: string]: ProductDictionary
}

// Props for card scroll
export interface CardScrollProps {
    title: string;
    products: Array<Product>;
    displayStorage?: boolean;
}

// Props for search bar
export interface SearchBarProps {
    products: Product[]
}

export interface CartProduct {
    product: Variants;
}