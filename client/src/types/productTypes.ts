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
    picture: string;
    created_at: string;
    max_price: number;
}

export interface CartItem {
    product: Product;
    quantity: number;
    variant: Variants;
    id: string;
}

// Allow modal to know the cart context
export type CartContextType = {
    cartCount: number;
    incrementCart: () => void;
    decrementCart: () => void;
    updateCartCount: (count: number) => void;
    refreshCartCount: () => Promise<void>;
};

// News item structure
export interface NewsItem {
    id: number;
    text: string;
    picture: string;
    date_created: string;
}

// Brand types
export interface BrandType {
    id: number;
    name: string;
    product_type: string;
}

// Paginated response interface
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// News card props
export interface NewsCardProps {
    newsItem: NewsItem;
}

// Props for news card scroll - updated to use paginated response
export interface NewsScrollProps {
    title: string;
    news: PaginatedResponse<NewsItem>;
    navigateFunction: () => void;
    navigateTitle: string;
}

// Props for product grid in admin page
export interface ProductGridProps {
    title: string;
    products: Product[];
}

// Props for card scroll
export interface CardScrollProps {
    title: string;
    products: PaginatedResponse<Product>;
    displayStorage?: boolean;
    displayNew?: boolean;
    navigateFunction: () => void;
    navigateTitle: string;
}

// Props for product card
export interface ProductCardProps {
    product: Product;
    displayStorage?: boolean;
    displayColor?: boolean;
}

// Props for preview cards for products
export interface CardPreviewProps {
    product: Product;
    displayStorage?: boolean;
    displayNew?: boolean;
}

// Props for individual edit product
export interface IndividualProps {
    product: Product;
    fetchProducts: () => Promise<void>;
}

// Props for search bar
export interface SearchBarProps {
    products: Product[]
    displayStorage: boolean;
}

// Cart product type
export interface CartProduct {
    product: Variants;
}

// Props for cart product
export interface CartProductType {
    product: CartItem;
    updateCartItem: (cartId: number, newQuantity: number) => Promise<void>;
    deleteCartItem: (cartId: number) => Promise<void>;
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
    total_price: number;
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

// Profile type
export interface User {
    auth0_id: string;
    email: string;
    id: number;
    order_history: Order[]
    role: string;
    shopping_cart: CartItem[];
    date_joined: string;
}

// Personal info props
export interface ProfileProps {
    profile: User;
}

// Order props
export interface OrderProps {
    orders: Order[];
}