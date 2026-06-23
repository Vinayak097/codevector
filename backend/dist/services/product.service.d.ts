interface GetProductsParams {
    limit: number;
    category?: string;
    cursorUpdatedAt?: string;
    cursorId?: number;
}
export declare function getProductsService({ limit, category, cursorUpdatedAt, cursorId, }: GetProductsParams): Promise<{
    products: any[];
    nextCursor: {
        updatedAt: any;
        id: any;
    } | null;
}>;
export {};
//# sourceMappingURL=product.service.d.ts.map