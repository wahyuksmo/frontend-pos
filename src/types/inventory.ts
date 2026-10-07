export interface StockItem {
  stockId: string;
  warehouseId: string;
  productId: string;
  variantId?: string | null;
  quantity: string | number;
  reservedQuantity: string | number;
  minStock: string | number;
  maxStock: string | number;
  warehouse: {
    warehouseId: string;
    warehouseCode: string;
    warehouseName: string;
  };
  product: {
    productId: string;
    productCode: string;
    productName: string;
    sku?: string | null;
    barcode?: string | null;
    costPrice: string | number;
    sellingPrice: string | number;
    unit?: {
      unitCode: string;
      unitName: string;
    };
  };
  variant?: {
    variantId: string;
    variantCode: string;
    variantName: string;
  } | null;
}

export interface StockMovementItem {
  movementId: string;
  warehouseId: string;
  productId: string;
  variantId?: string | null;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'SALE_DEDUCT' | 'VOID_RESTOCK';
  referenceType: 'ORDER' | 'ADJUSTMENT' | 'TRANSFER' | 'MANUAL' | 'VOID';
  referenceId?: string | null;
  referenceNumber?: string | null;
  quantity: string | number;
  balanceBefore: string | number;
  balanceAfter: string | number;
  notes?: string | null;
  createdAt: string;
  warehouse: {
    warehouseId: string;
    warehouseCode: string;
    warehouseName: string;
  };
  product: {
    productId: string;
    productCode: string;
    productName: string;
    unit?: {
      unitCode: string;
      unitName: string;
    };
  };
  variant?: {
    variantId: string;
    variantCode: string;
    variantName: string;
  } | null;
}

export interface StockAdjustmentRow {
  adjustmentItemId: string;
  adjustmentId: string;
  productId: string;
  variantId?: string | null;
  systemQuantity: string | number;
  actualQuantity: string | number;
  differenceQuantity: string | number;
  notes?: string | null;
  product: {
    productId: string;
    productCode: string;
    productName: string;
    unit?: {
      unitCode: string;
      unitName: string;
    };
  };
  variant?: {
    variantId: string;
    variantName: string;
  } | null;
}

export interface StockAdjustmentItem {
  adjustmentId: string;
  adjustmentNumber: string;
  warehouseId: string;
  adjustmentDate: string;
  reason: string;
  status: 'DRAFT' | 'APPROVED' | 'REJECTED';
  notes?: string | null;
  createdAt: string;
  warehouse: {
    warehouseId: string;
    warehouseCode: string;
    warehouseName: string;
  };
  _count?: {
    items: number;
  };
  items?: StockAdjustmentRow[];
}

export interface StockTransferRow {
  transferItemId: string;
  transferId: string;
  productId: string;
  variantId?: string | null;
  quantity: string | number;
  receivedQuantity: string | number;
  notes?: string | null;
  product: {
    productId: string;
    productCode: string;
    productName: string;
    unit?: {
      unitCode: string;
      unitName: string;
    };
  };
  variant?: {
    variantId: string;
    variantName: string;
  } | null;
}

export interface StockTransferItem {
  transferId: string;
  transferNumber: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  transferDate: string;
  status: 'PENDING' | 'APPROVED' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';
  notes?: string | null;
  createdAt: string;
  fromWarehouse: {
    warehouseCode: string;
    warehouseName: string;
  };
  toWarehouse: {
    warehouseCode: string;
    warehouseName: string;
  };
  _count?: {
    items: number;
  };
  items?: StockTransferRow[];
}
