export type YesNoFlag = "Y" | "N";

export interface UserGroup {
  usergroupId: string;
  usergroupCode: string;
  usergroupName: string;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  _count?: {
    users?: number;
    permissions?: number;
  };
}

export interface User {
  userId: string;
  usergroupId: string | null;
  username: string;
  fullname: string;
  email: string | null;
  phone: string | null;
  isActive: YesNoFlag;
  isLocked: YesNoFlag;
  needResetPassword?: YesNoFlag;
  passwordExp?: string | null;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  usergroup?: UserGroup | null;
}

export interface Menu {
  menuId: string;
  pid: string | null;
  menuName: string;
  menuTitle: string;
  menuIcon: string | null;
  menuUrl: string | null;
  menuPosition: number;
  objectCode?: string;
  createdAt?: string;
  createdBy?: string | null;
  updateAt?: string;
  updatedBy?: string | null;
  parent?: Menu | null;
  children?: Menu[];
}

export interface UserPermission {
  userpermissionId: string;
  usergroupId: string;
  menuId: string;
  createPerm: YesNoFlag;
  readPerm: YesNoFlag;
  updatePerm: YesNoFlag;
  deletePerm: YesNoFlag;
  exportPerm: YesNoFlag;
  importPerm: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string | null;
  menu?: Menu;
  usergroup?: UserGroup;
}

export interface PasswordPolicy {
  passwordPolicyId: string;
  code: string;
  value: string;
  message: string;
  objectCode?: string;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string | null;
}

export interface SystemSetting {
  settingId: string;
  settingKey: string;
  settingValue: string;
  valueType: string;
  description?: string | null;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
}

export interface MasterCompany {
  companyId: string;
  companyCode: string;
  companyName: string;
  taxId?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: YesNoFlag;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterBranch {
  branchId: string;
  companyId: string;
  branchCode: string;
  branchName: string;
  city?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: YesNoFlag;
  company?: MasterCompany | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterDepartment {
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  parentId?: string | null;
  description?: string | null;
  isActive: YesNoFlag;
  parent?: MasterDepartment | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterPosition {
  positionId: string;
  departmentId?: string | null;
  positionCode: string;
  positionName: string;
  description?: string | null;
  isActive: YesNoFlag;
  department?: MasterDepartment | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterJobGrade {
  gradeId: string;
  gradeCode: string;
  gradeName: string;
  levelOrder: number;
  minSalary?: number | null;
  maxSalary?: number | null;
  isActive: YesNoFlag;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterWorkLocation {
  locationId: string;
  locationCode: string;
  locationName: string;
  city?: string | null;
  address?: string | null;
  isActive: YesNoFlag;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterEmploymentStatus {
  statusId: string;
  statusCode: string;
  statusName: string;
  isActive: YesNoFlag;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterResignationReason {
  reasonId: string;
  reasonCode: string;
  reasonName: string;
  isActive: YesNoFlag;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterReligion {
  religionId: string;
  religionCode: string;
  religionName: string;
  isActive: YesNoFlag;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterMaritalStatus {
  maritalStatusId: string;
  maritalStatusCode: string;
  maritalStatusName: string;
  ptkpCode?: string | null;
  isActive: YesNoFlag;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterBank {
  bankId: string;
  bankCode: string;
  bankName: string;
  swiftCode?: string | null;
  isActive: YesNoFlag;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterEducationDegree {
  degreeId: string;
  degreeCode: string;
  degreeName: string;
  levelOrder: number;
  isActive: YesNoFlag;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterMajor {
  majorId: string;
  majorCode: string;
  majorName: string;
  isActive: YesNoFlag;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterLeaveType {
  leaveTypeId: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  defaultQuota: number;
  isPaid: YesNoFlag;
  isActive: YesNoFlag;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterWorkShift {
  shiftId: string;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  isActive: YesNoFlag;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterWorkCalendar {
  calendarId: string;
  calendarDate: string;
  year: number;
  month: number;
  dayOfWeek: number;
  isHoliday: YesNoFlag;
  isWeekend: YesNoFlag;
  holidayName?: string | null;
  description?: string | null;
  isActive: YesNoFlag;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterLookups {
  companies: MasterCompany[];
  branches: MasterBranch[];
  departments: MasterDepartment[];
  positions: MasterPosition[];
  jobGrades: MasterJobGrade[];
  workLocations: MasterWorkLocation[];
  employmentStatuses: MasterEmploymentStatus[];
  religions: MasterReligion[];
  maritalStatuses: MasterMaritalStatus[];
  banks: MasterBank[];
  educationDegrees: MasterEducationDegree[];
  majors: MasterMajor[];
  leaveTypes: MasterLeaveType[];
  workShifts: MasterWorkShift[];
}

// ==========================================
// 14 POS Master Data Interfaces
// ==========================================

export interface Outlet {
  outletId: string;
  outletCode: string;
  outletName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  taxNumber?: string | null;
  receiptHeader?: string | null;
  receiptFooter?: string | null;
  isCentral: YesNoFlag;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  _count?: {
    registers?: number;
    warehouses?: number;
    diningTables?: number;
  };
}

export interface Register {
  registerId: string;
  outletId: string;
  registerCode: string;
  registerName: string;
  macAddress?: string | null;
  ipAddress?: string | null;
  notes?: string | null;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  outlet?: {
    outletId: string;
    outletCode: string;
    outletName: string;
  };
}

export interface DiningTable {
  tableId: string;
  outletId: string;
  tableCode: string;
  tableName: string;
  section?: string | null;
  capacity: number;
  status: string;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  outlet?: {
    outletId: string;
    outletCode: string;
    outletName: string;
  };
}

export interface Warehouse {
  warehouseId: string;
  outletId?: string | null;
  warehouseCode: string;
  warehouseName: string;
  warehouseType: string;
  address?: string | null;
  isDefault: YesNoFlag;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  outlet?: {
    outletId: string;
    outletCode: string;
    outletName: string;
  } | null;
}

export interface Unit {
  unitId: string;
  unitCode: string;
  unitName: string;
  description?: string | null;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  _count?: {
    products?: number;
  };
}

export interface Category {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  parentCategoryId?: string | null;
  icon?: string | null;
  color?: string | null;
  displayOrder: number;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  parentCategory?: {
    categoryId: string;
    categoryCode: string;
    categoryName: string;
  } | null;
  _count?: {
    products?: number;
    childCategories?: number;
  };
}

export interface Brand {
  brandId: string;
  brandCode: string;
  brandName: string;
  description?: string | null;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  _count?: {
    products?: number;
  };
}

export interface Tax {
  taxId: string;
  taxCode: string;
  taxName: string;
  rate: number | string;
  isInclusive: YesNoFlag;
  description?: string | null;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  _count?: {
    products?: number;
  };
}

export interface ProductVariant {
  variantId: string;
  productId: string;
  variantCode: string;
  variantName: string;
  sku?: string | null;
  barcode?: string | null;
  costPrice: number | string;
  sellingPrice: number | string;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
}

export interface ProductOutletPrice {
  priceId: string;
  productId: string;
  variantId?: string | null;
  outletId: string;
  sellingPrice: number | string;
  isActive: YesNoFlag;
  outlet?: {
    outletId: string;
    outletCode: string;
    outletName: string;
  };
  variant?: {
    variantId: string;
    variantCode: string;
    variantName: string;
  } | null;
}

export interface ProductModifierItem {
  modifierItemId: string;
  modifierGroupId: string;
  itemName: string;
  extraPrice: number | string;
  isActive: YesNoFlag;
}

export interface ProductModifierGroup {
  modifierGroupId: string;
  productId: string;
  groupName: string;
  minSelect: number;
  maxSelect: number;
  isRequired: YesNoFlag;
  isActive: YesNoFlag;
  items?: ProductModifierItem[];
}

export interface Product {
  productId: string;
  id?: string;
  productCode: string;
  barcode?: string | null;
  sku?: string | null;
  productName: string;
  productType: string;
  categoryId?: string | null;
  brandId?: string | null;
  unitId?: string | null;
  taxId?: string | null;
  costPrice: number | string;
  sellingPrice: number | string;
  minStock: number | string;
  maxStock: number | string;
  isInventoryTracked: YesNoFlag;
  isForSale: YesNoFlag;
  imageUrl?: string | null;
  description?: string | null;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  category?: {
    categoryId: string;
    categoryCode: string;
    categoryName: string;
  } | null;
  brand?: {
    brandId: string;
    brandCode: string;
    brandName: string;
  } | null;
  unit?: {
    unitId: string;
    unitCode: string;
    unitName: string;
  } | null;
  tax?: {
    taxId: string;
    taxCode: string;
    taxName: string;
    rate: number | string;
  } | null;
  variants?: ProductVariant[];
  outletPrices?: ProductOutletPrice[];
  modifierGroups?: ProductModifierGroup[];
  stocks?: {
    warehouseId: string;
    quantity: number | string;
    variantId?: string | null;
    warehouse?: {
      outletId?: string | null;
      isDefault?: string | null;
    } | null;
  }[];
  _count?: {
    variants?: number;
    outletPrices?: number;
    modifierGroups?: number;
    recipesAsProduct?: number;
  };
}

export interface CustomerGroup {
  customerGroupId: string;
  id?: string;
  groupCode: string;
  groupName: string;
  discountPercent: number | string;
  description?: string | null;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  _count?: {
    customers?: number;
  };
}

export interface Customer {
  customerId: string;
  id?: string;
  customerGroupId?: string | null;
  customerCode: string;
  customerName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  loyaltyPoints?: number | string;
  points?: number | string;
  creditLimit: number | string;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  customerGroup?: {
    customerGroupId: string;
    groupCode: string;
    groupName: string;
    discountPercent: number | string;
  } | null;
}

export interface Supplier {
  supplierId: string;
  id?: string;
  supplierCode: string;
  supplierName: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxNumber?: string | null;
  bankName?: string | null;
  bankAccountNo?: string | null;
  bankAccount?: string | null;
  bankAccountHolder?: string | null;
  bankHolder?: string | null;
  paymentTermDays?: number;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
}

export interface PaymentMethod {
  paymentMethodId: string;
  id?: string;
  methodCode: string;
  methodName: string;
  methodType: string;
  feeType?: string;
  feeValue?: number | string;
  requiresReference?: YesNoFlag;
  requiresRef?: YesNoFlag;
  mdrPercent?: number | string;
  mdrFlat?: number | string;
  sortOrder?: number;
  displayOrder?: number;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
}

export interface Discount {
  discountId: string;
  id?: string;
  discountCode: string;
  discountName: string;
  discountType: string;
  discountValue: number | string;
  minPurchase: number | string;
  maxDiscount?: number | string | null;
  startDate?: string | null;
  endDate?: string | null;
  requiresApproval?: YesNoFlag;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
}

export interface KitchenStation {
  stationId: string;
  id?: string;
  outletId: string;
  stationCode: string;
  stationName: string;
  printerType: string;
  printerIp?: string | null;
  printerPort: number;
  isKdsEnabled: YesNoFlag;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  outlet?: Outlet;
  _count?: {
    products?: number;
    categories?: number;
  };
}

export interface Surcharge {
  surchargeId: string;
  id?: string;
  outletId?: string | null;
  surchargeCode: string;
  surchargeName: string;
  surchargeType: string;
  rateValue: number | string;
  isTaxable: YesNoFlag;
  applicableOrderType: string;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  outlet?: Outlet | null;
}

export interface SalesChannel {
  channelId: string;
  id?: string;
  channelCode: string;
  channelName: string;
  orderType: string;
  priceMarkupPercent: number | string;
  platformCommissionPercent: number | string;
  autoAcceptOrder: YesNoFlag;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
}

export interface UnitConversion {
  conversionId: string;
  id?: string;
  fromUnitId: string;
  toUnitId: string;
  multiplier: number | string;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  fromUnit?: Unit;
  toUnit?: Unit;
}

export interface Recipe {
  recipeId: string;
  id?: string;
  productId: string;
  variantId?: string | null;
  ingredientProductId: string;
  unitId: string;
  quantity: number | string;
  wastagePercent: number | string;
  costPrice: number | string;
  isActive: YesNoFlag;
  objectCode?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  product?: Product;
  variant?: ProductVariant | null;
  ingredientProduct?: Product;
  unit?: Unit;
}

export interface RecipeGrouped {
  groupKey: string;
  productId: string;
  product?: Product;
  variantId?: string | null;
  variant?: ProductVariant | null;
  isActive: YesNoFlag;
  items: Recipe[];
  totalItems: number;
  totalEstimatedCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface BulkSaveRecipeItemPayload {
  recipeId?: string;
  ingredientProductId: string;
  unitId: string;
  quantity: number;
  wastagePercent?: number;
  costPrice?: number;
  isActive?: YesNoFlag;
}

export interface BulkSaveRecipePayload {
  productId: string;
  variantId?: string | null;
  items: BulkSaveRecipeItemPayload[];
}

export interface ProductionMaterial {
  materialId: string;
  productionId: string;
  productId: string;
  variantId?: string | null;
  unitId?: string | null;
  bomQuantity: number | string;
  actualQuantity: number | string;
  costPrice: number | string;
  subtotalCost: number | string;
  notes?: string | null;
  isActive: YesNoFlag;
  product?: Product;
  variant?: ProductVariant | null;
  unit?: Unit | null;
}

export interface Production {
  productionId: string;
  productionNumber: string;
  warehouseId: string;
  productId: string;
  variantId?: string | null;
  productionDate: string;
  targetQuantity: number | string;
  actualQuantity: number | string;
  unitId?: string | null;
  status: "DRAFT" | "COMPLETED" | "CANCELLED";
  totalMaterialCost: number | string;
  costPerUnit: number | string;
  notes?: string | null;
  isActive: YesNoFlag;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  warehouse?: Warehouse;
  product?: Product;
  variant?: ProductVariant | null;
  unit?: Unit | null;
  materials?: ProductionMaterial[];
}

export interface CreateProductionMaterialPayload {
  productId: string;
  variantId?: string | null;
  unitId?: string | null;
  bomQuantity?: number;
  actualQuantity: number;
  costPrice?: number;
  notes?: string;
}

export interface CreateProductionPayload {
  warehouseId: string;
  productId: string;
  variantId?: string | null;
  unitId?: string | null;
  targetQuantity: number;
  actualQuantity: number;
  productionDate?: string;
  notes?: string;
  materials: CreateProductionMaterialPayload[];
}

export interface CalculateBomMaterialItem {
  productId: string;
  productCode: string;
  productName: string;
  variantId?: string | null;
  unitId?: string | null;
  unitCode: string;
  unitName: string;
  bomQuantity: number;
  actualQuantity: number;
  costPrice: number;
  subtotalCost: number;
}

export interface CalculateBomResponse {
  product: {
    productId: string;
    productCode: string;
    productName: string;
    unitId?: string;
    unitCode?: string;
  };
  targetQuantity: number;
  materials: CalculateBomMaterialItem[];
  totalEstimatedCost: number;
  costPerUnit: number;
}



// POS Type Aliases
export type PosOutlet = Outlet;
export type PosRegister = Register;
export type PosDiningTable = DiningTable;
export type PosWarehouse = Warehouse;
export type PosUnit = Unit;
export type PosCategory = Category;
export type PosBrand = Brand;
export type PosTax = Tax;
export type PosProduct = Product;
export type PosCustomerGroup = CustomerGroup;
export type PosCustomer = Customer;
export type PosSupplier = Supplier;
export type PosPaymentMethod = PaymentMethod;
export type PosDiscount = Discount;
export type PosKitchenStation = KitchenStation;
export type PosSurcharge = Surcharge;
export type PosSalesChannel = SalesChannel;
export type PosUnitConversion = UnitConversion;
export type PosProductRecipe = Recipe;

// --- POS Transactions & Cashier Shifts ---

export interface CashMovement {
  movementId: string;
  shiftId: string;
  movementType: "CASH_IN" | "CASH_OUT";
  amount: number | string;
  reason: string;
  recipient?: string | null;
  authorizedBy?: string | null;
  createdBy?: string | null;
  createdAt: string;
}

export interface RegisterShift {
  shiftId: string;
  shiftCode: string;
  outletId: string;
  registerId: string;
  cashierUserId: string;
  openedAt: string;
  closedAt?: string | null;
  openingCash: number | string;
  expectedCash: number | string;
  actualCash?: number | string | null;
  cashDifference?: number | string | null;
  totalSalesAmount: number | string;
  totalOrdersCount: number;
  status: "OPEN" | "CLOSED" | "AUDITED";
  closingNotes?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  outlet?: { outletId: string; outletCode: string; outletName: string };
  register?: { registerId: string; registerCode: string; registerName: string };
  cashierUser?: { userId: string; username: string; fullname: string };
  cashMovements?: CashMovement[];
  _count?: { orders?: number; cashMovements?: number };
}

export interface ShiftSummary {
  shiftId: string;
  shiftCode: string;
  status: "OPEN" | "CLOSED" | "AUDITED";
  openedAt: string;
  closedAt?: string | null;
  openingCash: number;
  totalCashSales: number;
  totalNonCashSales: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  actualCash?: number | null;
  cashDifference?: number | null;
  totalSalesAmount: number;
  totalOrdersCount: number;
  outlet?: { outletId: string; outletCode: string; outletName: string };
  register?: { registerId: string; registerCode: string; registerName: string };
  cashierUser?: { userId: string; username: string; fullname: string };
}

export interface OrderItemModifier {
  itemModifierId: string;
  orderItemId: string;
  modifierGroupId?: string | null;
  modifierItemId?: string | null;
  modifierGroupName: string;
  modifierItemName: string;
  extraPrice: number | string;
  quantity: number;
  subtotal: number | string;
}

export interface OrderItem {
  orderItemId: string;
  orderId: string;
  productId: string;
  variantId?: string | null;
  kitchenStationId?: string | null;
  itemCode: string;
  itemName: string;
  variantName?: string | null;
  quantity: number | string;
  unitPrice: number | string;
  costPrice: number | string;
  discountPercent: number | string;
  discountAmount: number | string;
  taxPercent: number | string;
  taxAmount: number | string;
  modifiersAmount: number | string;
  subtotal: number | string;
  totalAmount: number | string;
  itemStatus: string;
  isPrintedToKitchen: string;
  notes?: string | null;
  voidReason?: string | null;
  voidBy?: string | null;
  voidAt?: string | null;
  modifiers?: OrderItemModifier[];
  kitchenStation?: { stationName: string };
}

export interface OrderPayment {
  paymentId: string;
  orderId: string;
  paymentMethodId: string;
  paymentMethodCode: string;
  paymentMethodName: string;
  paymentType: string;
  amount: number | string;
  tenderedAmount: number | string;
  changeAmount: number | string;
  merchantFee?: number | string;
  referenceNumber?: string | null;
  cardLastFour?: string | null;
  cardHolderName?: string | null;
  paymentStatus: string;
  paidAt: string;
  refundedAt?: string | null;
  refundReason?: string | null;
}

export interface Order {
  orderId: string;
  orderNumber: string;
  invoiceNumber?: string | null;
  shiftId?: string | null;
  outletId: string;
  registerId?: string | null;
  channelId?: string | null;
  tableId?: string | null;
  customerId?: string | null;
  orderType: "DINE_IN" | "TAKE_AWAY" | "DELIVERY" | "DRIVE_THRU";
  orderStatus: "OPEN" | "HELD" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "VOIDED";
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";
  guestName?: string | null;
  paxCount: number;
  subtotal: number | string;
  discountAmount: number | string;
  discountId?: string | null;
  surchargeAmount: number | string;
  taxAmount: number | string;
  tipAmount: number | string;
  roundingAmount: number | string;
  totalAmount: number | string;
  paidAmount: number | string;
  changeAmount: number | string;
  loyaltyPointsEarned: number | string;
  loyaltyPointsUsed: number | string;
  orderedAt: string;
  paidAt?: string | null;
  closedAt?: string | null;
  voidedAt?: string | null;
  voidReason?: string | null;
  voidBy?: string | null;
  notes?: string | null;
  outlet?: { outletId: string; outletCode: string; outletName: string };
  register?: { registerId: string; registerCode: string; registerName: string };
  table?: { tableId: string; tableCode: string; tableName: string };
  customer?: { customerId: string; customerCode: string; customerName: string; phone?: string | null };
  channel?: { channelId: string; channelName: string };
  shift?: { shiftCode: string; cashierUser?: { fullname: string; username: string } };
  items?: OrderItem[];
  payments?: OrderPayment[];
  _count?: { items?: number };
}



