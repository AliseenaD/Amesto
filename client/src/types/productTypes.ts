// Define interface of variants
export interface Variants {
    id: string;
    color: string;
    price: string;
    quantity: number;
}

// Provide the product structure
export interface Product {
    id: string;
    type: string;
    brand: string;
    model: string;
    variants: Variants[]
    storage: number;
}

export interface CartItem {
    product: Product;
    quantity: number;
    variant: Variants;
    id: string;
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

// Props for individual edit product
export interface IndividualProps {
    product: Product;
}

// Props for search bar
export interface SearchBarProps {
    products: Product[]
}

// Cart product type
export interface CartProduct {
    product: Variants;
}

// Props for cart list
export interface CartListType {
    products: CartItem[];
    updateCartItem: (cartId: number, newQuantity: number) => Promise<void>;
    deleteCartItem: (cartId: number) => Promise<void>;
    orderCart: () => Promise<void>;
    totalCost: number;
}

// Type for a complete order
export interface Order {
    id: number;
    items: OrderItem[];
    order_date: string;
    order_status: string;
    total_price: string;
    user: number;
    order_email: string;
}

// Type for an item in the order
export interface OrderItem {
    id: number;
    product: Product;
    quantity: number;
    variant: Variants;
}