"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  QrCode,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  Search,
  Tag,
  Check,
  Percent,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import type { SelectOption, Product, Category, Discount, ProductVariant } from "@/types";

export interface CreateOrderModalProps {
  isOpen: boolean;
  outletOptions: SelectOption[];
  tableOptions: SelectOption[];
  customerOptions: SelectOption[];
  paymentMethodOptions: SelectOption[];
  products: Product[];
  categories?: Category[];
  discounts?: Discount[];
  activeShiftId?: string | null;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
}

interface CartItem {
  id: string; // unique cart entry key
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  notes?: string;
}

export function CreateOrderModal({
  isOpen,
  outletOptions,
  tableOptions,
  customerOptions,
  paymentMethodOptions,
  products,
  categories = [],
  discounts = [],
  activeShiftId,
  onClose,
  onSubmit,
}: CreateOrderModalProps) {
  // Order header configuration
  const [outletId, setOutletId] = useState("");
  const [tableId, setTableId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKE_AWAY" | "DELIVERY">("DINE_IN");
  const [guestName, setGuestName] = useState("");

  // Product catalog state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Promo / Discount state
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Variant selector modal for products with multiple variants
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);
  const [modalSelectedVariant, setModalSelectedVariant] = useState<ProductVariant | null>(null);
  const [modalItemQty, setModalItemQty] = useState(1);
  const [modalItemNote, setModalItemNote] = useState("");

  // Payment checkout states
  const [isInstantPay, setIsInstantPay] = useState(true);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [tenderedAmount, setTenderedAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Initialize outlet and default payment method
  useEffect(() => {
    if (outletOptions.length > 0 && !outletId) {
      setOutletId(outletOptions[0].value);
    }
  }, [outletOptions, outletId]);

  useEffect(() => {
    if (paymentMethodOptions.length > 0 && !paymentMethodId) {
      setPaymentMethodId(paymentMethodOptions[0].value);
    }
  }, [paymentMethodOptions, paymentMethodId]);

  // Reset states on modal close
  useEffect(() => {
    if (!isOpen) {
      setCart([]);
      setAppliedDiscount(null);
      setPromoCodeInput("");
      setPromoError(null);
      setSearchQuery("");
      setSelectedCategoryId("ALL");
      setVariantModalProduct(null);
      setGuestName("");
      setTableId("");
    }
  }, [isOpen]);

  // Filter products by search & category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        searchQuery === "" ||
        p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.productCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategoryId === "ALL" || p.categoryId === selectedCategoryId;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategoryId]);

  if (!isOpen) return null;

  // Add product directly or open variant popup
  const handleProductCardClick = (product: Product) => {
    const variants = product.variants || [];
    if (variants.length > 1) {
      setVariantModalProduct(product);
      setModalSelectedVariant(variants[0]);
      setModalItemQty(1);
      setModalItemNote("");
    } else {
      const singleVariant = variants[0];
      const variantId = singleVariant ? singleVariant.variantId : undefined;
      const variantName = singleVariant ? singleVariant.variantName : undefined;
      const price = singleVariant ? Number(singleVariant.sellingPrice) : Number(product.sellingPrice);

      addItemToCart({
        productId: product.productId,
        variantId,
        name: product.productName,
        variantName,
        price,
        quantity: 1,
        imageUrl: product.imageUrl,
      });
    }
  };

  const addItemToCart = (item: Omit<CartItem, "id">) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (c) =>
          c.productId === item.productId &&
          c.variantId === item.variantId &&
          (c.notes || "") === (item.notes || "")
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + item.quantity,
        };
        return next;
      }

      return [
        ...prev,
        {
          ...item,
          id: `${item.productId}_${item.variantId || "default"}_${Date.now()}`,
        },
      ];
    });
  };

  const handleConfirmVariantModal = () => {
    if (!variantModalProduct) return;
    const price = modalSelectedVariant
      ? Number(modalSelectedVariant.sellingPrice)
      : Number(variantModalProduct.sellingPrice);

    addItemToCart({
      productId: variantModalProduct.productId,
      variantId: modalSelectedVariant?.variantId,
      name: variantModalProduct.productName,
      variantName: modalSelectedVariant?.variantName,
      price,
      quantity: modalItemQty,
      imageUrl: variantModalProduct.imageUrl,
      notes: modalItemNote.trim() || undefined,
    });

    setVariantModalProduct(null);
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
    setAppliedDiscount(null);
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedDiscount) {
    const discVal = Number(appliedDiscount.discountValue);
    const minPur = Number(appliedDiscount.minPurchase || 0);

    if (subtotal >= minPur) {
      if (appliedDiscount.discountType === "PERCENTAGE" || appliedDiscount.discountType === "PERCENT") {
        discountAmount = (subtotal * discVal) / 100;
        if (appliedDiscount.maxDiscount && Number(appliedDiscount.maxDiscount) > 0) {
          discountAmount = Math.min(discountAmount, Number(appliedDiscount.maxDiscount));
        }
      } else {
        discountAmount = discVal;
      }
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * 0.10; // 10% PB1 resto
  const serviceCharge = orderType === "DINE_IN" ? taxableAmount * 0.05 : 0; // 5% service charge for dine-in
  const grandTotal = Math.round(taxableAmount + tax + serviceCharge);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const changeAmount = Math.max(0, (tenderedAmount || 0) - grandTotal);

  // Apply promo code handler
  const handleApplyPromo = () => {
    setPromoError(null);
    const cleanCode = promoCodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    const found = discounts.find(
      (d) => d.discountCode.toUpperCase() === cleanCode && d.isActive === "Y"
    );

    if (!found) {
      setPromoError("Kode promo tidak ditemukan atau sudah tidak aktif");
      return;
    }

    if (Number(found.minPurchase || 0) > subtotal) {
      setPromoError(`Minimal belanja Rp ${Number(found.minPurchase).toLocaleString("id-ID")}`);
      return;
    }

    setAppliedDiscount(found);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outletId) return;
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const payload: any = {
        outletId,
        shiftId: activeShiftId || undefined,
        orderType,
        tableId: orderType === "DINE_IN" && tableId ? tableId : undefined,
        customerId: customerId || undefined,
        guestName: guestName.trim() || undefined,
        discountId: appliedDiscount ? appliedDiscount.discountId : undefined,
        items: cart.map((c) => ({
          productId: c.productId,
          variantId: c.variantId,
          quantity: c.quantity,
          notes: c.notes,
        })),
      };

      if (isInstantPay && paymentMethodId) {
        payload.payments = [
          {
            paymentMethodId,
            amount: grandTotal,
            tenderedAmount: tenderedAmount > 0 ? tenderedAmount : grandTotal,
          },
        ];
      }

      await onSubmit(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Quick cash preset amounts
  const quickCashPresets = [
    { label: "Uang Pas", amount: grandTotal },
    { label: "50rb", amount: 50000 },
    { label: "100rb", amount: 100000 },
    { label: "200rb", amount: 200000 },
  ].filter((p) => p.amount >= grandTotal || p.label === "Uang Pas");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[94vh] flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-galaxy-border dark:bg-galaxy-card text-slate-800 dark:text-slate-100 overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-6 py-3.5 dark:border-galaxy-border/80 bg-slate-50/60 dark:bg-galaxy-sidebar/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20 shadow-xs">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                  Kasir POS & Keranjang Belanja
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-50 text-primary-600 border border-primary-200 dark:bg-primary-950/50 dark:text-primary-300 dark:border-primary-800">
                  Galaxy Style
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih menu belanjaan customer, sesuaikan varian, dan selesaikan transaksi
              </p>
            </div>
          </div>

          {/* Quick Header Configs */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Order Type Toggle */}
            <div className="flex items-center rounded-lg bg-slate-200/70 dark:bg-galaxy-input p-0.5">
              <button
                type="button"
                onClick={() => setOrderType("DINE_IN")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  orderType === "DINE_IN"
                    ? "bg-white text-primary-600 shadow-xs dark:bg-primary-500 dark:text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <UtensilsCrossed className="h-3.5 w-3.5" />
                <span>Dine-In</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType("TAKE_AWAY")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  orderType === "TAKE_AWAY"
                    ? "bg-white text-primary-600 shadow-xs dark:bg-primary-500 dark:text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Take Away</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType("DELIVERY")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  orderType === "DELIVERY"
                    ? "bg-white text-primary-600 shadow-xs dark:bg-primary-500 dark:text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Delivery</span>
              </button>
            </div>

            {/* Outlet Selector */}
            <div className="w-36">
              <SearchableSelect
                size="sm"
                options={outletOptions}
                value={outletId}
                onChange={setOutletId}
                placeholder="Pilih Outlet..."
              />
            </div>

            {/* Table or Guest Name */}
            {orderType === "DINE_IN" ? (
              <div className="w-32">
                <SearchableSelect
                  size="sm"
                  options={tableOptions}
                  value={tableId}
                  onChange={setTableId}
                  placeholder="Pilih Meja..."
                  clearable
                />
              </div>
            ) : (
              <div className="w-32">
                <input
                  type="text"
                  placeholder="Nama Pelanggan..."
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="h-8 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs dark:border-galaxy-border dark:bg-galaxy-input"
                />
              </div>
            )}

            {/* Customer CRM */}
            <div className="w-36">
              <SearchableSelect
                size="sm"
                options={customerOptions}
                value={customerId}
                onChange={setCustomerId}
                placeholder="Member CRM..."
                clearable
              />
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 dark:hover:bg-galaxy-hover dark:hover:text-slate-200 transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content: 2-Column Split */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Visual Product Catalog (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-galaxy-border/80 bg-slate-50/30 dark:bg-galaxy-card/40 overflow-hidden">
            {/* Search and Category Filter Toolbar */}
            <div className="p-4 border-b border-slate-200/70 dark:border-galaxy-border/70 space-y-3 bg-white/70 dark:bg-galaxy-card/70 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari menu, makanan, minuman, atau scan barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200/90 bg-white pl-9 pr-8 text-xs placeholder:text-slate-400 focus:border-primary-500 focus:outline-hidden dark:border-galaxy-border dark:bg-galaxy-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId("ALL")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategoryId === "ALL"
                      ? "bg-primary-500 text-white shadow-xs font-semibold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-galaxy-input dark:text-slate-300 dark:hover:bg-galaxy-hover"
                  }`}
                >
                  Semua ({products.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.categoryId}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.categoryId)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategoryId === cat.categoryId
                        ? "bg-primary-500 text-white shadow-xs font-semibold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-galaxy-input dark:text-slate-300 dark:hover:bg-galaxy-hover"
                    }`}
                  >
                    {cat.categoryName}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400">
                  <ShoppingBag className="h-12 w-12 stroke-[1.2] mb-2 opacity-50" />
                  <p className="text-sm font-medium">Produk tidak ditemukan</p>
                  <p className="text-xs text-slate-500 mt-1">Coba kata kunci atau kategori lain</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {filteredProducts.map((p) => {
                    const variantsCount = (p.variants || []).length;
                    const minPrice = Number(p.sellingPrice);

                    return (
                      <div
                        key={p.productId}
                        onClick={() => handleProductCardClick(p)}
                        className="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-400 hover:shadow-md dark:border-galaxy-border/80 dark:bg-galaxy-card dark:hover:border-primary-500 cursor-pointer overflow-hidden"
                      >
                        <div>
                          {/* Image Box */}
                          <div className="relative aspect-4/3 w-full rounded-lg bg-slate-100 dark:bg-galaxy-thead overflow-hidden mb-2.5 flex items-center justify-center border border-slate-100 dark:border-galaxy-border/50">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.productName}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-slate-400">
                                <ShoppingBag className="h-8 w-8 stroke-[1.4] opacity-40 group-hover:scale-110 transition-transform" />
                              </div>
                            )}

                            {variantsCount > 1 && (
                              <span className="absolute bottom-1.5 right-1.5 rounded-md bg-slate-900/80 backdrop-blur-xs px-1.5 py-0.5 text-[10px] font-medium text-white">
                                {variantsCount} Varian
                              </span>
                            )}
                          </div>

                          {/* Product Info */}
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight">
                            {p.productName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                            {p.productCode}
                          </span>
                        </div>

                        {/* Price & Add Indicator */}
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-galaxy-border/50">
                          <span className="text-xs font-bold font-mono text-primary-600 dark:text-primary-400">
                            Rp {minPrice.toLocaleString("id-ID")}
                          </span>
                          <div className="h-6 w-6 rounded-md bg-primary-50 dark:bg-primary-950/60 text-primary-500 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors">
                            <Plus className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Velzon Shopping Cart & Order Summary (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col bg-white dark:bg-galaxy-card overflow-hidden">
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-3.5 dark:border-galaxy-border/80 shrink-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
                  Keranjang Belanja
                </h4>
                <span className="rounded-full bg-primary-100 dark:bg-primary-950 px-2 py-0.5 text-xs font-semibold text-primary-700 dark:text-primary-300">
                  {totalItemsCount} item
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 font-medium"
                >
                  Kosongkan
                </button>
              )}
            </div>

            {/* Cart Items List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                  <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-galaxy-thead flex items-center justify-center mb-2">
                    <ShoppingCart className="h-7 w-7 stroke-[1.3] text-slate-400" />
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Keranjang Belanja Masih Kosong
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Klik produk di katalog sebelah kiri untuk menambahkan
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="relative rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-galaxy-border/70 dark:bg-galaxy-card/60 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar Thumbnail */}
                      <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-galaxy-thead border border-slate-200/60 dark:border-galaxy-border/50 shrink-0 overflow-hidden flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="h-5 w-5 text-slate-400" />
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {item.name}
                          </h5>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {item.variantName && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-galaxy-input dark:text-slate-300">
                            {item.variantName}
                          </span>
                        )}

                        {item.notes && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 italic mt-0.5">
                            "{item.notes}"
                          </p>
                        )}

                        {/* Quantity Stepper & Price Row */}
                        <div className="mt-2.5 flex items-center justify-between">
                          {/* Velzon Input-Step */}
                          <div className="flex items-center rounded-md border border-slate-200 dark:border-galaxy-border bg-slate-50 dark:bg-galaxy-input overflow-hidden h-7">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(item.id, -1)}
                              className="px-2 h-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-galaxy-hover flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2.5 text-xs font-mono font-semibold text-slate-800 dark:text-slate-100">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(item.id, 1)}
                              className="px-2 h-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-galaxy-hover flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">
                              @ Rp {item.price.toLocaleString("id-ID")}
                            </span>
                            <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                              Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Velzon Promo Code Box */}
            <div className="border-t border-dashed border-slate-200/80 px-4 py-3 dark:border-galaxy-border/80 bg-slate-50/50 dark:bg-galaxy-thead/40 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-primary-500" />
                  <span>Punya kode promo / kupon?</span>
                </span>
                {appliedDiscount && (
                  <button
                    type="button"
                    onClick={() => setAppliedDiscount(null)}
                    className="text-[11px] text-rose-500 hover:underline"
                  >
                    Hapus Promo
                  </button>
                )}
              </div>

              {!appliedDiscount ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kode promo (misal: DISC10)..."
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="h-8 flex-1 rounded-md border border-slate-200/90 bg-white px-2.5 text-xs uppercase font-mono placeholder:normal-case dark:border-galaxy-border dark:bg-galaxy-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyPromo}
                      disabled={!promoCodeInput.trim() || cart.length === 0}
                      className="h-8 px-3 text-xs"
                    >
                      Terapkan
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-[11px] text-rose-500 font-medium">{promoError}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                        {appliedDiscount.discountCode}
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 ml-1.5">
                        ({appliedDiscount.discountName})
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    -Rp {Math.round(discountAmount).toLocaleString("id-ID")}
                  </span>
                </div>
              )}
            </div>

            {/* Velzon Order Summary Section */}
            <div className="border-t border-slate-200/80 px-4 py-3 dark:border-galaxy-border/80 bg-white dark:bg-galaxy-card shrink-0 space-y-2">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Sub Total :</span>
                  <span className="font-mono">Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Diskon Promo :</span>
                    <span className="font-mono font-semibold">
                      -Rp {Math.round(discountAmount).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Pajak Restoran (10%) :</span>
                  <span className="font-mono">Rp {Math.round(tax).toLocaleString("id-ID")}</span>
                </div>

                {orderType === "DINE_IN" && (
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Biaya Layanan (5%) :</span>
                    <span className="font-mono">
                      Rp {Math.round(serviceCharge).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-galaxy-border/80 text-sm font-bold text-slate-900 dark:text-white">
                  <span>Total Tagihan :</span>
                  <span className="text-base font-mono text-primary-600 dark:text-primary-400">
                    Rp {grandTotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Integrated Checkout Options */}
              <div className="pt-2 border-t border-slate-100 dark:border-galaxy-border/60 space-y-2">
                {/* Checkout Mode Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                    Mode Penyelesaian :
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setIsInstantPay(true)}
                      className={`px-2 py-0.5 rounded font-medium ${
                        isInstantPay
                          ? "bg-primary-500 text-white font-semibold"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                      }`}
                    >
                      Bayar Lunas
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInstantPay(false)}
                      className={`px-2 py-0.5 rounded font-medium ${
                        !isInstantPay
                          ? "bg-amber-500 text-white font-semibold"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                      }`}
                    >
                      Open Bill (Nanti)
                    </button>
                  </div>
                </div>

                {isInstantPay && (
                  <div className="space-y-2 rounded-lg bg-slate-50 dark:bg-galaxy-thead/60 p-2.5 border border-slate-200/60 dark:border-galaxy-border/50 text-xs">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                        Pilih Metode Pembayaran
                      </label>
                      <SearchableSelect
                        size="sm"
                        options={paymentMethodOptions}
                        value={paymentMethodId}
                        onChange={setPaymentMethodId}
                        placeholder="Pilih Metode Bayar..."
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span className="font-semibold">Uang Diterima (Tendered)</span>
                        {tenderedAmount > 0 && (
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            Kembali: Rp {changeAmount.toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        placeholder={`Rp ${grandTotal.toLocaleString("id-ID")}`}
                        value={tenderedAmount || ""}
                        onChange={(e) => setTenderedAmount(Number(e.target.value))}
                        className="h-8 w-full rounded-md border border-slate-300 bg-white px-2.5 font-mono text-xs dark:border-galaxy-border dark:bg-galaxy-input"
                      />

                      {/* Quick Cash Presets */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {quickCashPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setTenderedAmount(preset.amount)}
                            className="px-2 py-0.5 rounded bg-white dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border text-[10px] font-mono text-slate-700 dark:text-slate-200 hover:border-primary-400 transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Big Final Action Button */}
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleFormSubmit}
                  disabled={cart.length === 0 || loading || (isInstantPay && !paymentMethodId)}
                  className="w-full h-10 shadow-galaxy-cyan text-xs font-semibold gap-2 mt-1"
                >
                  {loading ? (
                    "Memproses Pesanan..."
                  ) : isInstantPay ? (
                    <>
                      <span>Bayar & Cetak Struk</span>
                      <span className="font-mono">(Rp {grandTotal.toLocaleString("id-ID")})</span>
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </>
                  ) : (
                    <>
                      <span>Simpan Pesanan Meja (Open Bill)</span>
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Variant & Notes Modal Popup */}
      {variantModalProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-galaxy-border dark:bg-galaxy-card text-slate-800 dark:text-slate-100 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
                  {variantModalProduct.productName}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Pilih varian & catatan pesanan</p>
              </div>
              <button
                type="button"
                onClick={() => setVariantModalProduct(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Variant Options */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pilihan Varian
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(variantModalProduct.variants || []).map((v) => {
                  const isSelected = modalSelectedVariant?.variantId === v.variantId;
                  return (
                    <button
                      key={v.variantId}
                      type="button"
                      onClick={() => setModalSelectedVariant(v)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        isSelected
                          ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-300 ring-1 ring-primary-500"
                          : "border-slate-200 dark:border-galaxy-border hover:bg-slate-50 dark:hover:bg-galaxy-hover"
                      }`}
                    >
                      <div className="font-semibold">{v.variantName}</div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        Rp {Number(v.sellingPrice).toLocaleString("id-ID")}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Item Qty */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jumlah (Qty)
              </label>
              <div className="flex items-center rounded-md border border-slate-200 dark:border-galaxy-border bg-slate-50 dark:bg-galaxy-input overflow-hidden h-8">
                <button
                  type="button"
                  onClick={() => setModalItemQty(Math.max(1, modalItemQty - 1))}
                  className="px-2.5 h-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-galaxy-hover"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="px-3 text-xs font-mono font-semibold">{modalItemQty}</span>
                <button
                  type="button"
                  onClick={() => setModalItemQty(modalItemQty + 1)}
                  className="px-2.5 h-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-galaxy-hover"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Catatan Dapur / Pesanan
              </label>
              <input
                type="text"
                placeholder="Contoh: Less ice, less sugar, pisah kuah..."
                value={modalItemNote}
                onChange={(e) => setModalItemNote(e.target.value)}
                className="h-8 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs dark:border-galaxy-border dark:bg-galaxy-input"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVariantModalProduct(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmVariantModal}
                className="shadow-galaxy-cyan"
              >
                Tambah ke Keranjang
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
