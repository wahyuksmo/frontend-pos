import { apiClient } from "./api-client";
import { ApiResponse } from "@/types";

export interface QueryReportParams {
  startDate?: string;
  endDate?: string;
  outletId?: string;
  channelId?: string;
  paymentStatus?: string;
  limit?: number;
}

export interface DashboardMetricsData {
  summary: {
    totalRevenue: number;
    totalCogs: number;
    grossProfit: number;
    profitMarginPercent: number;
    totalOrdersCount: number;
    totalItemsCount: number;
    averageOrderValue: number;
    totalDiscount: number;
    totalTax: number;
  };
  salesTrend: Array<{
    date: string;
    revenue: number;
    cogs: number;
    ordersCount: number;
  }>;
  paymentBreakdown: Array<{
    name: string;
    amount: number;
    count: number;
  }>;
  topProducts: Array<{
    code: string;
    name: string;
    qty: number;
    revenue: number;
    cost: number;
    profit: number;
    marginPercent: number;
  }>;
  recentOrders: Array<{
    orderId: string;
    orderNumber: string;
    invoiceNumber: string | null;
    orderedAt: string;
    orderType: string;
    orderStatus: string;
    paymentStatus: string;
    totalAmount: number;
    guestName: string | null;
  }>;
}

export interface SalesReportOrderRow {
  orderId: string;
  orderNumber: string;
  invoiceNumber: string | null;
  date: string;
  time: string;
  orderedAt: string;
  outletName: string;
  channelName: string;
  cashierName: string;
  orderType: string;
  orderStatus: string;
  paymentStatus: string;
  subtotal: number;
  discountAmount: number;
  surchargeAmount: number;
  taxAmount: number;
  totalAmount: number;
  totalCost: number;
  grossProfit: number;
  profitMarginPercent: number;
  paymentMethods: string;
  itemsCount: number;
}

export interface SalesReportData {
  summary: {
    totalOrdersCount: number;
    totalSubtotal: number;
    totalDiscount: number;
    totalSurcharge: number;
    totalTax: number;
    totalRevenue: number;
    totalCogs: number;
    grossProfit: number;
    profitMarginPercent: number;
  };
  orders: SalesReportOrderRow[];
}

export interface ProductPerformanceData {
  summary: {
    totalUniqueProducts: number;
    grandTotalQty: number;
    grandTotalRevenue: number;
    grandTotalCost: number;
    grandTotalProfit: number;
  };
  products: Array<{
    productId: string;
    productCode: string;
    productName: string;
    categoryName: string;
    unitName: string;
    quantitySold: number;
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    profitMarginPercent: number;
    revenueSharePercent: number;
  }>;
}

export interface ShiftAuditData {
  totalShifts: number;
  shifts: Array<{
    shiftId: string;
    shiftCode: string;
    outletName: string;
    registerName: string;
    cashierName: string;
    openedAt: string;
    closedAt: string | null;
    status: string;
    openingCash: number;
    totalCashIn: number;
    totalCashOut: number;
    totalSalesAmount: number;
    totalOrdersCount: number;
    expectedCash: number;
    actualCash: number | null;
    cashDifference: number | null;
    hasDiscrepancy: boolean;
    closingNotes: string | null;
  }>;
}

export interface PaymentMethodReportData {
  summary: {
    totalTransactions: number;
    grandTotalAmount: number;
  };
  paymentMethods: Array<{
    methodId: string;
    methodCode: string;
    methodName: string;
    methodType: string;
    transactionCount: number;
    totalAmount: number;
    sharePercent: number;
  }>;
}

export const reportsService = {
  getDashboardMetrics: async (params?: QueryReportParams): Promise<ApiResponse<DashboardMetricsData>> => {
    return apiClient.get<ApiResponse<DashboardMetricsData>>("/reports/dashboard", { params });
  },

  getSalesReport: async (params?: QueryReportParams): Promise<ApiResponse<SalesReportData>> => {
    return apiClient.get<ApiResponse<SalesReportData>>("/reports/sales", { params });
  },

  getProductPerformanceReport: async (params?: QueryReportParams): Promise<ApiResponse<ProductPerformanceData>> => {
    return apiClient.get<ApiResponse<ProductPerformanceData>>("/reports/products", { params });
  },

  getShiftAuditReport: async (params?: QueryReportParams): Promise<ApiResponse<ShiftAuditData>> => {
    return apiClient.get<ApiResponse<ShiftAuditData>>("/reports/shifts", { params });
  },

  getPaymentMethodReport: async (params?: QueryReportParams): Promise<ApiResponse<PaymentMethodReportData>> => {
    return apiClient.get<ApiResponse<PaymentMethodReportData>>("/reports/payments", { params });
  },
};
