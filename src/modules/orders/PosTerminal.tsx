"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  Tag,
  Check,
  Percent,
  Clock,
  Store,
  User as UserIcon,
  X,
  Receipt,
  Maximize2,
  Minimize2,
  FileText,
  Barcode,
  Layers,
  Sparkles,
  Coffee,
  Utensils,
  Pizza,
  Cake,
  Sandwich,
  Flame,
  LayoutGrid,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import { ordersService } from "@/services";
import { QrisPaymentModal } from "./QrisPaymentModal";
import { getImageUrl } from "@/lib/image";
import type {
  SelectOption,
  Product,
  Category,
  Discount,
  ProductVariant,
} from "@/types";

export interface PosTerminalProps {
  outletOptions: SelectOption[];
  tableOptions: SelectOption[];
  customerOptions: SelectOption[];
  paymentMethodOptions: SelectOption[];
  products: Product[];
  categories: Category[];
  discounts: Discount[];
  activeShiftId: string | null;
  onRefreshData?: () => void;
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

// Category Icon Mapper Helper
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes("makan") || name.includes("food") || name.includes("dish")) {
    return Utensils;
  }
  if (name.includes("minum") || name.includes("drink") || name.includes("kopi") || name.includes("coffee") || name.includes("tea")) {
    return Coffee;
  }
  if (name.includes("snack") || name.includes("camil") || name.includes("roti") || name.includes("bread")) {
    return Sandwich;
  }
  if (name.includes("dessert") || name.includes("kue") || name.includes("cake") || name.includes("sweet")) {
    return Cake;
  }
  if (name.includes("pizza") || name.includes("fast")) {
    return Pizza;
  }
  if (name.includes("paket") || name.includes("combo") || name.includes("promo") || name.includes("hot")) {
    return Flame;
  }
  return Layers;
};

// Web Audio API Cashier Synthesizer Beep (Zero external dependencies, zero latency)
const playBeepSound = (type: "add" | "remove" | "error" = "add", enabled = true) => {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "add") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === "remove") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } else if (type === "error") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch {
    // Audio context may be silenced before user gesture
  }
};

export function PosTerminal({
  outletOptions,
  tableOptions,
  customerOptions,
  paymentMethodOptions,
  products,
  categories,
  discounts,
  activeShiftId,
  onRefreshData,
}: PosTerminalProps) {
  // Order configuration
  const [outletId, setOutletId] = useState("");
  const [tableId, setTableId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKE_AWAY" | "DELIVERY">("DINE_IN");

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");

  // Audio Beep Toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartAnimationTrigger, setCartAnimationTrigger] = useState(false);

  // Promo / Discount
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Variant & Notes Slide-Over Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);
  const [drawerSelectedVariant, setDrawerSelectedVariant] = useState<ProductVariant | null>(null);
  const [drawerQty, setDrawerQty] = useState(1);
  const [drawerNote, setDrawerNote] = useState("");

  // Payment Checkout
  const [isInstantPay, setIsInstantPay] = useState(true);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [tenderedAmount, setTenderedAmount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [qrisModalData, setQrisModalData] = useState<{
    isOpen: boolean;
    orderId: string;
    orderNumber: string;
    amount: number;
    outletName?: string;
    customerName?: string;
  }>({
    isOpen: false,
    orderId: "",
    orderNumber: "",
    amount: 0,
  });

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Clock
  const [currentTime, setCurrentTime] = useState<string>("");

  // Search input ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Set default outlet & payment method
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

  // Background Barcode Scanner Listener
  useEffect(() => {
    let buffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      // Barcode hardware sends rapid characters terminated with Enter
      if (e.key === "Enter") {
        if (buffer.length >= 2) {
          const barcode = buffer.trim();
          const match = products.find(
            (p) =>
              p.productCode.toLowerCase() === barcode.toLowerCase() ||
              (p.variants && p.variants.some((v) => (v as any).sku?.toLowerCase() === barcode.toLowerCase()))
          );

          if (match) {
            handleProductClick(match);
            playBeepSound("add", soundEnabled);
            buffer = "";
            if (isInputFocused) {
              (target as HTMLInputElement).blur();
            }
            return;
          }
        }
        buffer = "";
      } else if (e.key.length === 1) {
        if (timeDiff > 120 && !isInputFocused) {
          buffer = e.key;
        } else {
          buffer += e.key;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [products, soundEnabled]);

  // Trigger Cart bounce animation on change
  const triggerCartBounce = () => {
    setCartAnimationTrigger(true);
    setTimeout(() => setCartAnimationTrigger(false), 300);
  };

  // Filter products
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

  // Count item in cart for quick visual badge
  const getProductCartCount = (productId: string) => {
    return cart
      .filter((c) => c.productId === productId)
      .reduce((sum, c) => sum + c.quantity, 0);
  };

  // Product click handling: open drawer if variants exist or direct add
  const handleProductClick = (product: Product) => {
    const variants = product.variants || [];
    if (variants.length > 1) {
      openVariantDrawer(product);
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

      playBeepSound("add", soundEnabled);
      triggerCartBounce();
    }
  };

  const openVariantDrawer = (product: Product) => {
    setDrawerProduct(product);
    const variants = product.variants || [];
    setDrawerSelectedVariant(variants[0] || null);
    setDrawerQty(1);
    setDrawerNote("");
    setIsDrawerOpen(true);
  };

  const closeVariantDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerProduct(null);
  };

  const handleConfirmDrawer = () => {
    if (!drawerProduct) return;
    const price = drawerSelectedVariant
      ? Number(drawerSelectedVariant.sellingPrice)
      : Number(drawerProduct.sellingPrice);

    addItemToCart({
      productId: drawerProduct.productId,
      variantId: drawerSelectedVariant?.variantId,
      name: drawerProduct.productName,
      variantName: drawerSelectedVariant?.variantName,
      price,
      quantity: drawerQty,
      imageUrl: drawerProduct.imageUrl,
      notes: drawerNote.trim() || undefined,
    });

    playBeepSound("add", soundEnabled);
    triggerCartBounce();
    closeVariantDrawer();
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
          id: `${item.productId}_${item.variantId || "default"}_${Date.now()}_${Math.random()}`,
        },
      ];
    });
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    if (delta > 0) {
      playBeepSound("add", soundEnabled);
    } else {
      playBeepSound("remove", soundEnabled);
    }
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

  const handleUpdateProductDirectQty = (productId: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const existing = cart.find((c) => c.productId === productId);
    if (!existing && delta > 0) {
      const p = products.find((prod) => prod.productId === productId);
      if (p) handleProductClick(p);
      return;
    }
    if (existing) {
      handleUpdateCartQty(existing.id, delta);
    }
  };

  const handleRemoveFromCart = (id: string) => {
    playBeepSound("remove", soundEnabled);
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    playBeepSound("remove", soundEnabled);
    setCart([]);
    setAppliedDiscount(null);
    setPromoCodeInput("");
    setPromoError(null);
    setIsMobileCartOpen(false);
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
  const tax = taxableAmount * 0.1; // 10% PB1 resto
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
      setPromoError("Kode promo tidak valid atau tidak aktif");
      playBeepSound("error", soundEnabled);
      return;
    }

    if (Number(found.minPurchase || 0) > subtotal) {
      setPromoError(`Min. belanja Rp ${Number(found.minPurchase).toLocaleString("id-ID")}`);
      playBeepSound("error", soundEnabled);
      return;
    }

    setAppliedDiscount(found);
    playBeepSound("add", soundEnabled);
  };

  // Quick cash preset amounts
  const quickCashPresets = [
    { label: "Uang Pas", amount: grandTotal },
    { label: "50rb", amount: 50000 },
    { label: "100rb", amount: 100000 },
    { label: "200rb", amount: 200000 },
    { label: "500rb", amount: 500000 },
  ].filter((p) => p.amount >= grandTotal || p.label === "Uang Pas");

  // Handle Checkout Submit
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outletId) {
      showErrorAlert("Outlet Diperlukan", "Pilih outlet kasir terlebih dahulu.");
      return;
    }
    if (cart.length === 0) {
      showErrorAlert("Keranjang Kosong", "Pilih minimal 1 menu untuk dipesan.");
      return;
    }

    if (isInstantPay && !paymentMethodId) {
      showErrorAlert("Metode Bayar Diperlukan", "Pilih metode pembayaran transaksi.");
      return;
    }

    setSubmitting(true);
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

      const selectedPaymentMethod = paymentMethodOptions.find((pm) => pm.value === paymentMethodId);
      const isQris = isInstantPay && (selectedPaymentMethod?.label.toUpperCase().includes("QRIS") || false);

      if (isQris) {
        const created = await ordersService.create(payload);
        const newOrder = created.data;
        const outletName = outletOptions.find((o) => o.value === outletId)?.label;
        const customerName = customerOptions.find((c) => c.value === customerId)?.label;

        setQrisModalData({
          isOpen: true,
          orderId: newOrder.orderId,
          orderNumber: newOrder.orderNumber,
          amount: grandTotal,
          outletName,
          customerName,
        });

        handleClearCart();
        setGuestName("");
        setTableId("");
        setTenderedAmount(0);
        return;
      }

      if (isInstantPay && paymentMethodId) {
        payload.payments = [
          {
            paymentMethodId,
            amount: grandTotal,
            tenderedAmount: tenderedAmount > 0 ? tenderedAmount : grandTotal,
          },
        ];
      }

      await ordersService.create(payload);

      showSuccessAlert(
        "Pesanan Berhasil Disimpan",
        isInstantPay
          ? `Pembayaran Rp ${grandTotal.toLocaleString("id-ID")} lunas.${
              changeAmount > 0 ? ` Kembalian: Rp ${changeAmount.toLocaleString("id-ID")}` : ""
            }`
          : "Pesanan terbuka (Open Order) berhasil dicatat."
      );

      // Reset cart and stay on page for next customer order
      handleClearCart();
      setGuestName("");
      setTableId("");
      setTenderedAmount(0);
      onRefreshData?.();
    } catch (err: any) {
      showErrorAlert("Gagal Menyimpan Pesanan", err.message || "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQrisSuccess = useCallback((_data: any) => {
    setQrisModalData((prev) => ({ ...prev, isOpen: false }));
    onRefreshData?.();
  }, [onRefreshData]);

  const handleQrisClose = useCallback(() => {
    setQrisModalData((prev) => ({ ...prev, isOpen: false }));
    onRefreshData?.();
  }, [onRefreshData]);

  const renderCartContent = (isMobile: boolean = false) => (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Customer & Guest Name Input */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-galaxy-border/80 bg-slate-50/50 dark:bg-galaxy-header/50 space-y-2.5 shrink-0">
        {!isMobile && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 transition-transform ${
                  cartAnimationTrigger ? "scale-125" : "scale-100"
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-heading font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Pesanan Kasir
                </h3>
                <span className="text-2xs text-slate-500 dark:text-galaxy-muted">
                  {totalItemsCount} item dipilih
                </span>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="text-2xs text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-heading font-medium cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Kosongkan</span>
              </button>
            )}
          </div>
        )}

        {/* Customer & Guest Name Input */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-2xs text-slate-500 dark:text-galaxy-muted block mb-1 font-heading font-medium">
              Pelanggan
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-500 cursor-pointer truncate transition-colors"
            >
              <option value="">Walk-in / Tamu Umum</option>
              {customerOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-2xs text-slate-500 dark:text-galaxy-muted block mb-1 font-heading font-medium">
              Nama Tamu / Order
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="cth: Meja 4 / Rudi"
              className="w-full bg-slate-50 dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-galaxy-muted focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Cart Item List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 scrollbar-thin">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-galaxy-muted p-6 text-center">
            <ShoppingCart className="h-10 w-10 text-slate-300 dark:text-galaxy-border mb-2 stroke-1" />
            <p className="text-xs font-heading font-semibold text-slate-600 dark:text-slate-300">
              Keranjang Masih Kosong
            </p>
            <p className="text-2xs text-slate-400 dark:text-galaxy-muted mt-0.5">
              Tap menu di katalog atau scan barcode untuk menambah
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200/80 dark:border-galaxy-border/70 bg-slate-50/70 dark:bg-galaxy-input/40 hover:border-slate-300 dark:hover:border-galaxy-border transition-colors"
            >
              <div className="flex-1 min-w-0 pr-1">
                <h5 className="text-xs font-heading font-medium text-slate-800 dark:text-slate-100 truncate">
                  {item.name}
                </h5>
                {item.variantName && (
                  <span className="text-2xs font-medium text-primary-600 dark:text-primary-400 block truncate">
                    {item.variantName}
                  </span>
                )}
                {item.notes && (
                  <span className="text-2xs text-amber-600 dark:text-amber-400 italic block truncate">
                    "{item.notes}"
                  </span>
                )}
                <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 block mt-0.5">
                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                </span>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-galaxy-card border border-slate-200 dark:border-galaxy-border rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => handleUpdateCartQty(item.id, -1)}
                  className="h-6 w-6 rounded-md hover:bg-slate-100 dark:hover:bg-galaxy-hover text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 min-w-[20px] text-center font-mono">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateCartQty(item.id, 1)}
                  className="h-6 w-6 rounded-md hover:bg-slate-100 dark:hover:bg-galaxy-hover text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveFromCart(item.id)}
                  className="h-6 w-6 rounded-md hover:bg-rose-50 text-rose-500 dark:hover:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center ml-0.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Cost Breakdown & Promo */}
      <div
        className={`p-3.5 border-t border-slate-200/80 dark:border-galaxy-border/80 bg-slate-50/50 dark:bg-galaxy-thead/40 space-y-2.5 shrink-0 ${
          isMobile
            ? "pb-[max(2rem,calc(env(safe-area-inset-bottom)+1.5rem))]"
            : "pb-[max(0.875rem,calc(env(safe-area-inset-bottom)+0.5rem))]"
        }`}
      >
        {/* Promo Code Input */}
        <div className="space-y-1">
          {appliedDiscount ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
              <div className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                <span className="font-heading font-semibold">{appliedDiscount.discountCode}</span>
                <span className="text-2xs font-mono">
                  (-Rp {Math.round(discountAmount).toLocaleString("id-ID")})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAppliedDiscount(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-1.5">
              <input
                type="text"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                placeholder="Kode promo / voucher..."
                className="flex-1 bg-white dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 uppercase placeholder:text-slate-400 dark:placeholder:text-galaxy-muted focus:outline-none focus:border-primary-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-galaxy-input dark:hover:bg-galaxy-hover border border-slate-200 dark:border-galaxy-border text-xs font-heading font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Terapkan
              </button>
            </div>
          )}
          {promoError && <p className="text-2xs text-rose-500 dark:text-rose-400">{promoError}</p>}
        </div>

        {/* Subtotal, Tax, Total */}
        <div className="space-y-1 text-xs text-slate-500 dark:text-galaxy-muted pt-1">
          <div className="flex justify-between">
            <span>Subtotal ({totalItemsCount} item)</span>
            <span className="text-slate-800 dark:text-slate-200 font-mono">
              Rp {subtotal.toLocaleString("id-ID")}
            </span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Diskon Promo</span>
              <span className="font-mono">-Rp {Math.round(discountAmount).toLocaleString("id-ID")}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>PB1 Resto (10%)</span>
            <span className="text-slate-800 dark:text-slate-200 font-mono">
              Rp {Math.round(tax).toLocaleString("id-ID")}
            </span>
          </div>
          {orderType === "DINE_IN" && serviceCharge > 0 && (
            <div className="flex justify-between">
              <span>Service (5%)</span>
              <span className="text-slate-800 dark:text-slate-200 font-mono">
                Rp {Math.round(serviceCharge).toLocaleString("id-ID")}
              </span>
            </div>
          )}
          <div className="flex justify-between items-baseline text-sm font-heading font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200/80 dark:border-galaxy-border/80">
            <span>Total Tagihan</span>
            <span className="text-base font-mono font-bold text-primary-600 dark:text-primary-400">
              Rp {grandTotal.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Instant Checkout / Open Order Toggle */}
        <div className="pt-2 border-t border-slate-200/80 dark:border-galaxy-border/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 dark:text-slate-300 font-heading font-medium">
              Bayar Sekarang
            </span>
            <button
              type="button"
              onClick={() => setIsInstantPay(!isInstantPay)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                isInstantPay ? "bg-primary-500 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* Instant Pay Details */}
          {isInstantPay && (
            <div className="space-y-2 pt-1 text-xs">
              {/* Payment Method Pills */}
              <div className="grid grid-cols-2 gap-1.5">
                {paymentMethodOptions.map((pm) => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setPaymentMethodId(pm.value)}
                    className={`px-2 py-1.5 rounded-lg border text-left truncate transition-colors text-2xs font-heading cursor-pointer ${
                      paymentMethodId === pm.value
                        ? "bg-primary-500/10 border-primary-500 text-primary-700 dark:text-primary-300 font-semibold shadow-galaxy-cyan"
                        : "bg-white dark:bg-galaxy-input border-slate-200 dark:border-galaxy-border text-slate-600 dark:text-galaxy-muted hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>

              {/* Cash Quick Buttons & Tendered Amount */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  {quickCashPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setTenderedAmount(preset.amount)}
                      className={`px-2.5 py-1 rounded-md text-2xs font-mono font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        tenderedAmount === preset.amount
                          ? "bg-primary-500 text-white shadow-galaxy-cyan"
                          : "bg-slate-100 hover:bg-slate-200/80 dark:bg-galaxy-input dark:hover:bg-galaxy-hover text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-galaxy-border"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-galaxy-muted text-xs">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={tenderedAmount || ""}
                      onChange={(e) => setTenderedAmount(Number(e.target.value))}
                      placeholder="Nominal Bayar..."
                      className="w-full bg-white dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-galaxy-muted focus:outline-none focus:border-primary-500 font-mono transition-colors"
                    />
                  </div>
                  {tenderedAmount > grandTotal && (
                    <div className="text-right">
                      <span className="text-2xs text-slate-500 dark:text-galaxy-muted block">
                        Kembalian
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        Rp {changeAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit CTA Button */}
          <button
            type="button"
            disabled={submitting || cart.length === 0}
            onClick={handleCheckoutSubmit}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading font-semibold text-xs flex items-center justify-center gap-2 shadow-galaxy-cyan active:scale-[0.99] transition-all cursor-pointer"
          >
            {submitting ? (
              <span>Menyimpan Pesanan...</span>
            ) : (
              <>
                <Receipt className="h-4 w-4" />
                <span>
                  {isInstantPay
                    ? `Bayar Lunas (Rp ${grandTotal.toLocaleString("id-ID")})`
                    : `Simpan Pesanan Terbuka`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-slate-100 text-slate-800 dark:bg-galaxy-body dark:text-galaxy-text font-sans select-none transition-colors">
      {/* 1. TOP HEADER BAR */}
      <header className="h-[54px] sm:h-[60px] border-b border-slate-200/80 bg-white/95 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-3 shrink-0 shadow-xs z-30 dark:border-galaxy-border/80 dark:bg-galaxy-header/95 backdrop-blur-md">
        {/* Left: Navigation, Brand, Outlet & Shift Status */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/orders"
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:border-galaxy-border dark:bg-galaxy-card dark:text-galaxy-muted dark:hover:bg-galaxy-hover dark:hover:text-slate-100 text-xs font-heading font-medium transition-colors shrink-0"
            title="Kembali ke Riwayat Order"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden md:inline">Riwayat Order</span>
          </Link>

          {/* POS Terminal Badge */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <span className="text-xs uppercase font-bold text-primary-600 dark:text-primary-400 font-heading tracking-wider bg-primary-500/10 dark:bg-primary-400/15 border border-primary-500/20 dark:border-primary-400/25 px-2 py-0.5 rounded">
              POS Terminal
            </span>
          </div>

          {/* Outlet Selector */}
          <div className="flex items-center gap-1 text-xs min-w-0">
            <Store className="h-3.5 w-3.5 text-primary-500 dark:text-primary-400 shrink-0" />
            <select
              value={outletId}
              onChange={(e) => setOutletId(e.target.value)}
              className="max-w-[125px] sm:max-w-[170px] bg-slate-50 dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 cursor-pointer truncate transition-colors"
            >
              {outletOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{activeShiftId ? "Shift Aktif" : "Shift Reguler"}</span>
          </div>
        </div>

        {/* Center: Order Type Switcher & Table (Desktop only) */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Order Type Tabs */}
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-galaxy-input p-1 border border-slate-200/80 dark:border-galaxy-border/80">
            <button
              type="button"
              onClick={() => setOrderType("DINE_IN")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-heading font-medium transition-colors cursor-pointer ${
                orderType === "DINE_IN"
                  ? "bg-primary-500 text-white font-semibold shadow-galaxy-cyan"
                  : "text-slate-600 dark:text-galaxy-muted hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <UtensilsCrossed className="h-3.5 w-3.5" />
              <span>Dine-In</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType("TAKE_AWAY")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-heading font-medium transition-colors cursor-pointer ${
                orderType === "TAKE_AWAY"
                  ? "bg-primary-500 text-white font-semibold shadow-galaxy-cyan"
                  : "text-slate-600 dark:text-galaxy-muted hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Take Away</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType("DELIVERY")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-heading font-medium transition-colors cursor-pointer ${
                orderType === "DELIVERY"
                  ? "bg-primary-500 text-white font-semibold shadow-galaxy-cyan"
                  : "text-slate-600 dark:text-galaxy-muted hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Delivery</span>
            </button>
          </div>

          {/* Table Selector (if Dine-In) */}
          {orderType === "DINE_IN" && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-galaxy-muted hidden xl:inline">Meja:</span>
              <select
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="bg-slate-50 dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                <option value="">-- Pilih Meja --</option>
                {tableOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Cart Button (Mobile), Sound Beep, Digital Clock, Theme Toggle & Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Cart Button */}
          <button
            type="button"
            onClick={() => setIsMobileCartOpen(true)}
            className="lg:hidden relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-primary-500/30 bg-primary-500/10 text-primary-600 dark:text-primary-400 font-heading font-semibold text-xs transition-colors cursor-pointer"
            title="Buka Keranjang Pesanan"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="font-mono text-xs">{totalItemsCount}</span>
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse" />
            )}
          </button>

          {/* Beep Audio Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Suara Beep Kasir: Aktif" : "Suara Beep Kasir: Senyap"}
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
              soundEnabled
                ? "border-primary-500/30 bg-primary-500/10 text-primary-600 dark:text-primary-400"
                : "border-slate-200 bg-white text-slate-400 dark:border-galaxy-border dark:bg-galaxy-card"
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Live Clock */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-galaxy-card border border-slate-200 dark:border-galaxy-border text-xs text-slate-700 dark:text-galaxy-text font-mono">
            <Clock className="h-3.5 w-3.5 text-primary-500 dark:text-primary-400" />
            <span>{currentTime || "--:--:--"}</span>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            className="hidden sm:flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-galaxy-border dark:bg-galaxy-card dark:text-slate-300 dark:hover:bg-galaxy-hover dark:hover:text-white cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* 2. MAIN 3-COLUMN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMN 1: VERTICAL CATEGORY RAIL (Desktop only: lg:flex) */}
        <aside className="hidden lg:flex w-[88px] sm:w-[96px] border-r border-slate-200/80 dark:border-galaxy-border/80 bg-white dark:bg-galaxy-card flex-col shrink-0 overflow-y-auto scrollbar-thin select-none">
          <div className="p-2 space-y-1.5">
            {/* All Categories Button */}
            <button
              type="button"
              onClick={() => setSelectedCategoryId("ALL")}
              className={`w-full flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all ${
                selectedCategoryId === "ALL"
                  ? "bg-primary-500 text-white font-semibold shadow-galaxy-cyan scale-[1.02]"
                  : "text-slate-600 hover:bg-slate-100 dark:text-galaxy-muted dark:hover:bg-galaxy-hover hover:text-slate-900 dark:hover:text-slate-100 border border-transparent"
              }`}
            >
              <LayoutGrid className="h-5 w-5 mb-1" />
              <span className="text-[11px] font-heading font-medium leading-tight text-center">
                Semua
              </span>
              <span
                className={`text-[9px] font-mono mt-0.5 px-1.5 rounded-full ${
                  selectedCategoryId === "ALL"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/70 text-slate-600 dark:bg-galaxy-input dark:text-galaxy-muted"
                }`}
              >
                {products.length}
              </span>
            </button>

            <div className="h-px bg-slate-200/60 dark:bg-galaxy-border/60 mx-1" />

            {/* Category Items List */}
            {categories.map((cat) => {
              const IconComp = getCategoryIcon(cat.categoryName);
              const isSelected = selectedCategoryId === cat.categoryId;
              const count = products.filter((p) => p.categoryId === cat.categoryId).length;

              return (
                <button
                  key={cat.categoryId}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.categoryId)}
                  className={`w-full flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all ${
                    isSelected
                      ? "bg-primary-500 text-white font-semibold shadow-galaxy-cyan scale-[1.02]"
                      : "text-slate-600 hover:bg-slate-100 dark:text-galaxy-muted dark:hover:bg-galaxy-hover hover:text-slate-900 dark:hover:text-slate-100 border border-transparent"
                  }`}
                >
                  <IconComp className="h-5 w-5 mb-1 shrink-0" />
                  <span className="text-[11px] font-heading font-medium leading-tight text-center line-clamp-2">
                    {cat.categoryName}
                  </span>
                  <span
                    className={`text-[9px] font-mono mt-0.5 px-1.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-200/70 text-slate-600 dark:bg-galaxy-input dark:text-galaxy-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* COLUMN 2: CENTER MENU CATALOG (~FLEX-1) */}
        <section className="flex-1 flex flex-col min-w-0 border-r border-slate-200/80 dark:border-galaxy-border/80 bg-slate-50/50 dark:bg-galaxy-body/40">
          {/* Search Header Bar with Barcode Scanner Indicator */}
          <div className="p-3.5 border-b border-slate-200/80 dark:border-galaxy-border/80 bg-white dark:bg-galaxy-card flex items-center gap-3 shrink-0 shadow-2xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-galaxy-muted pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu, SKU, atau scan barcode produk..."
                className="w-full bg-slate-50 dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border rounded-xl pl-9 pr-24 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-galaxy-muted focus:outline-none focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-2xs text-slate-400 dark:text-galaxy-muted">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-galaxy-card px-1.5 py-0.5 rounded text-[10px] font-mono">
                    <Barcode className="h-3 w-3 text-primary-500" />
                    <span>Auto-Scan</span>
                  </div>
                )}
              </div>
            </div>

            {/* Active Category Title Banner */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border text-xs font-heading font-medium text-slate-700 dark:text-slate-200 shrink-0">
              <span>
                {selectedCategoryId === "ALL"
                  ? "Semua Menu"
                  : categories.find((c) => c.categoryId === selectedCategoryId)?.categoryName || "Kategori"}
              </span>
              <span className="font-mono text-primary-600 dark:text-primary-400 font-bold">
                ({filteredProducts.length})
              </span>
            </div>
          </div>

          {/* MOBILE HORIZONTAL CATEGORY BAR (lg:hidden) */}
          <div className="flex lg:hidden overflow-x-auto gap-1.5 px-3.5 py-2 bg-white dark:bg-galaxy-card border-b border-slate-200/80 dark:border-galaxy-border/80 shrink-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategoryId("ALL")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                selectedCategoryId === "ALL"
                  ? "bg-primary-500 text-white font-semibold shadow-galaxy-cyan"
                  : "bg-slate-100 text-slate-600 dark:bg-galaxy-input dark:text-galaxy-muted hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Semua</span>
              <span className="font-mono text-[10px] opacity-80">({products.length})</span>
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.categoryId;
              const count = products.filter((p) => p.categoryId === cat.categoryId).length;
              const IconComp = getCategoryIcon(cat.categoryName);
              return (
                <button
                  key={cat.categoryId}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.categoryId)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-primary-500 text-white font-semibold shadow-galaxy-cyan"
                      : "bg-slate-100 text-slate-600 dark:bg-galaxy-input dark:text-galaxy-muted hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <IconComp className="h-3.5 w-3.5" />
                  <span>{cat.categoryName}</span>
                  <span className="font-mono text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Product Cards Grid */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-28 lg:pb-4 scrollbar-thin">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-galaxy-muted p-8 text-center">
                <UtensilsCrossed className="h-12 w-12 text-slate-300 dark:text-galaxy-border mb-3" />
                <p className="text-sm font-heading font-medium text-slate-600 dark:text-slate-300">
                  Tidak ada menu yang sesuai
                </p>
                <p className="text-xs text-slate-400 dark:text-galaxy-muted mt-1">
                  Coba kata kunci pencarian atau kategori lain
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3.5">
                {filteredProducts.map((product) => {
                  const variants = product.variants || [];
                  const hasMultipleVariants = variants.length > 1;
                  const displayPrice =
                    variants.length > 0
                      ? Math.min(...variants.map((v) => Number(v.sellingPrice || 0)))
                      : Number(product.sellingPrice || 0);
                  const cartQty = getProductCartCount(product.productId);

                  const outletStocks = (product.stocks || []).filter(
                    (s) => !outletId || !s.warehouse?.outletId || s.warehouse.outletId === outletId
                  );
                  const fgStock = outletStocks.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
                  const hasRecipe = ((product._count as any)?.recipesAsProduct ?? 0) > 0;

                  return (
                    <div
                      key={product.productId}
                      onClick={() => handleProductClick(product)}
                      className={`group relative flex flex-col justify-between rounded-xl border bg-white dark:bg-galaxy-card p-2.5 sm:p-3 transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98] ${
                        cartQty > 0
                          ? "border-primary-500/80 ring-1 ring-primary-500/20 dark:border-primary-400"
                          : "border-slate-200/80 dark:border-galaxy-border/80 hover:border-primary-400 dark:hover:border-primary-400 hover:shadow-galaxy-glow"
                      }`}
                    >
                      {/* Product Thumbnail Placeholder or Image */}
                      <div className="relative w-full aspect-square rounded-lg bg-slate-100 dark:bg-galaxy-input border border-slate-200/60 dark:border-galaxy-border/60 overflow-hidden mb-2 sm:mb-2.5 flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={getImageUrl(product.imageUrl)}
                            alt={product.productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <UtensilsCrossed className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400 dark:text-galaxy-border group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors" />
                        )}

                        {/* Top-Left: Already in cart badge */}
                        {cartQty > 0 && (
                          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-2xs font-mono font-bold bg-primary-500 text-white shadow-galaxy-cyan z-10 animate-in fade-in zoom-in duration-200">
                            {cartQty}x
                          </div>
                        )}

                        {/* Top-Right: Variant count badge */}
                        {hasMultipleVariants && (
                          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-2xs font-heading font-semibold bg-white/95 dark:bg-galaxy-card/95 text-primary-600 dark:text-primary-400 border border-primary-500/25 shadow-2xs">
                            {variants.length} Varian
                          </div>
                        )}

                        {/* Bottom-Right: Stock / MTO Indicator */}
                        {fgStock > 0 ? (
                          <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-2xs font-mono font-bold bg-emerald-600/90 text-white shadow-xs backdrop-blur-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                            {fgStock}
                          </div>
                        ) : hasRecipe ? (
                          <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-2xs font-sans font-medium bg-amber-600/85 text-white shadow-xs backdrop-blur-xs">
                            Resep
                          </div>
                        ) : product.isInventoryTracked === "Y" ? (
                          <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-2xs font-mono font-medium bg-slate-700/80 text-slate-200 shadow-xs backdrop-blur-xs">
                            0
                          </div>
                        ) : null}
                      </div>

                      {/* Product Info */}
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-2xs font-mono text-slate-400 dark:text-galaxy-muted block truncate mb-0.5">
                          {product.productCode}
                        </span>
                        <h4 className="text-xs font-heading font-medium text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {product.productName}
                        </h4>
                      </div>

                      {/* Price & Action Footer */}
                      <div className="mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-slate-100 dark:border-galaxy-borderSubtle flex items-center justify-between gap-1">
                        <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 truncate">
                          Rp {displayPrice.toLocaleString("id-ID")}
                        </span>

                        {/* Mini Stepper on Card if Item in Cart (Fast Touch Action) */}
                        {cartQty > 0 && !hasMultipleVariants ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-0.5 sm:gap-1 bg-slate-100 dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border rounded-lg p-0.5 shrink-0"
                          >
                            <button
                              type="button"
                              onClick={(e) => handleUpdateProductDirectQty(product.productId, -1, e)}
                              className="h-5 w-5 rounded hover:bg-slate-200 dark:hover:bg-galaxy-hover text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-2xs font-mono font-bold px-0.5 sm:px-1 text-slate-800 dark:text-slate-100">
                              {cartQty}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleUpdateProductDirectQty(product.productId, 1, e)}
                              className="h-5 w-5 rounded hover:bg-slate-200 dark:hover:bg-galaxy-hover text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-lg bg-slate-100 dark:bg-galaxy-input group-hover:bg-primary-500 group-hover:text-white text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors shrink-0">
                            <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* COLUMN 3: RIGHT INTEGRATED CART & CHECKOUT (Desktop only: lg:flex) */}
        <aside className="w-[380px] xl:w-[400px] 2xl:w-[440px] hidden lg:flex flex-col border-l border-slate-200/80 dark:border-galaxy-border/80 bg-white dark:bg-galaxy-card shrink-0 shadow-lg lg:shadow-none">
          {renderCartContent(false)}
        </aside>
      </div>

      {/* 4. MOBILE FLOATING CART SUMMARY BAR (< lg) */}
      {cart.length > 0 && !isMobileCartOpen && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-galaxy-card/95 backdrop-blur-md border-t border-slate-200 dark:border-galaxy-border px-4 py-2.5 pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))] shadow-2xl flex items-center justify-between gap-3 lg:hidden animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative p-2 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 shrink-0">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-primary-500 text-white font-mono text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {totalItemsCount}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 dark:text-galaxy-muted uppercase font-heading font-medium tracking-wider block">
                Total Pesanan
              </span>
              <span className="text-sm font-mono font-bold text-primary-600 dark:text-primary-400 block truncate">
                Rp {grandTotal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileCartOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-heading font-semibold text-xs flex items-center gap-1.5 shadow-galaxy-cyan shrink-0 active:scale-95 transition-all cursor-pointer"
          >
            <span>Bayar / Pesanan</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 5. MOBILE FULL CART MODAL / BOTTOM SHEET (< lg) */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden overflow-hidden">
          <div
            onClick={() => setIsMobileCartOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-h-[92dvh] h-[92dvh] bg-white dark:bg-galaxy-card rounded-t-2xl flex flex-col shadow-2xl z-10 overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-3.5 border-b border-slate-200/80 dark:border-galaxy-border/80 flex items-center justify-between bg-slate-50/80 dark:bg-galaxy-header/80 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-heading font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Pesanan Kasir ({totalItemsCount} item)
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="text-2xs text-rose-500 hover:text-rose-600 dark:text-rose-400 font-heading font-medium px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
                  >
                    Kosongkan
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileCartOpen(false)}
                  className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-galaxy-input dark:hover:bg-galaxy-hover text-slate-500 dark:text-galaxy-muted flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mobile Order Type selector */}
            <div className="p-3 border-b border-slate-200/80 dark:border-galaxy-border/80 bg-white dark:bg-galaxy-card space-y-2 shrink-0">
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-galaxy-input p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setOrderType("DINE_IN")}
                  className={`py-1 text-2xs font-heading font-semibold rounded transition-colors text-center cursor-pointer ${
                    orderType === "DINE_IN" ? "bg-primary-500 text-white shadow-xs" : "text-slate-600 dark:text-galaxy-muted"
                  }`}
                >
                  Dine-In
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("TAKE_AWAY")}
                  className={`py-1 text-2xs font-heading font-semibold rounded transition-colors text-center cursor-pointer ${
                    orderType === "TAKE_AWAY" ? "bg-primary-500 text-white shadow-xs" : "text-slate-600 dark:text-galaxy-muted"
                  }`}
                >
                  Take Away
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("DELIVERY")}
                  className={`py-1 text-2xs font-heading font-semibold rounded transition-colors text-center cursor-pointer ${
                    orderType === "DELIVERY" ? "bg-primary-500 text-white shadow-xs" : "text-slate-600 dark:text-galaxy-muted"
                  }`}
                >
                  Delivery
                </button>
              </div>
              {orderType === "DINE_IN" && (
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-slate-500 dark:text-galaxy-muted shrink-0 font-medium">Pilih Meja:</span>
                  <select
                    value={tableId}
                    onChange={(e) => setTableId(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="">-- Pilih Meja --</option>
                    {tableOptions.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Cart content */}
            {renderCartContent(true)}
          </div>
        </div>
      )}

      {/* 3. SLIDE-OVER DRAWER: VARIANT & NOTES */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop Overlay */}
          <div
            onClick={closeVariantDrawer}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Slide Drawer Content */}
          <div className="relative w-full max-w-md bg-white dark:bg-galaxy-card border-l border-slate-200/80 dark:border-galaxy-border/80 text-slate-800 dark:text-slate-100 h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-200/80 dark:border-galaxy-border/80 flex items-center justify-between bg-slate-50/50 dark:bg-galaxy-header/50 shrink-0">
              <div>
                <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-slate-100">
                  Sesuaikan Menu
                </h3>
                <p className="text-xs text-slate-500 dark:text-galaxy-muted">
                  {drawerProduct?.productName}
                </p>
              </div>
              <button
                type="button"
                onClick={closeVariantDrawer}
                className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-galaxy-input dark:hover:bg-galaxy-hover text-slate-500 dark:text-galaxy-muted hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
              {/* Product Preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-galaxy-input/40 border border-slate-200/80 dark:border-galaxy-border/80">
                <div className="h-14 w-14 rounded-lg bg-slate-100 dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border flex items-center justify-center shrink-0 overflow-hidden">
                  {drawerProduct?.imageUrl ? (
                    <img
                      src={getImageUrl(drawerProduct.imageUrl)}
                      alt={drawerProduct.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UtensilsCrossed className="h-6 w-6 text-slate-400 dark:text-galaxy-muted" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-heading font-bold text-slate-800 dark:text-slate-100">
                    {drawerProduct?.productName}
                  </h4>
                  <span className="text-2xs font-mono text-primary-600 dark:text-primary-400">
                    {drawerProduct?.productCode}
                  </span>
                </div>
              </div>

              {/* Variants Selector */}
              {drawerProduct?.variants && drawerProduct.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-heading font-semibold text-slate-700 dark:text-slate-200 block">
                    Pilih Varian Menu
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {drawerProduct.variants.map((variant) => {
                      const isSelected =
                        drawerSelectedVariant?.variantId === variant.variantId;
                      const varStocks = (drawerProduct.stocks || []).filter(
                        (s) => (!outletId || !s.warehouse?.outletId || s.warehouse.outletId === outletId) && s.variantId === variant.variantId
                      );
                      const varFgStock = varStocks.reduce((sum, s) => sum + Number(s.quantity || 0), 0);

                      return (
                        <div
                          key={variant.variantId}
                          onClick={() => setDrawerSelectedVariant(variant)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary-500/10 border-primary-500 text-primary-700 dark:text-primary-300 shadow-galaxy-cyan"
                              : "bg-slate-50/50 dark:bg-galaxy-input/40 border-slate-200 dark:border-galaxy-border text-slate-700 dark:text-galaxy-muted hover:border-slate-300 dark:hover:border-galaxy-border"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? "border-primary-500 bg-primary-500 text-white"
                                  : "border-slate-300 dark:border-slate-600"
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-medium">{variant.variantName}</span>
                            {varFgStock > 0 && (
                              <span className="px-1.5 py-0.5 rounded text-2xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Ready: {varFgStock}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold font-mono text-primary-600 dark:text-primary-400">
                            Rp {Number(variant.sellingPrice).toLocaleString("id-ID")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-semibold text-slate-700 dark:text-slate-200 block">
                  Jumlah Pesanan
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border rounded-xl p-1">
                    <button
                      type="button"
                      disabled={drawerQty <= 1}
                      onClick={() => setDrawerQty(Math.max(1, drawerQty - 1))}
                      className="h-8 w-8 rounded-lg bg-white dark:bg-galaxy-card hover:bg-slate-100 dark:hover:bg-galaxy-hover disabled:opacity-40 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 min-w-[32px] text-center font-mono">
                      {drawerQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDrawerQty(drawerQty + 1)}
                      className="h-8 w-8 rounded-lg bg-white dark:bg-galaxy-card hover:bg-slate-100 dark:hover:bg-galaxy-hover text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-galaxy-muted">
                    Subtotal:{" "}
                    <strong className="text-primary-600 dark:text-primary-400 font-mono">
                      Rp{" "}
                      {(
                        (drawerSelectedVariant
                          ? Number(drawerSelectedVariant.sellingPrice)
                          : Number(drawerProduct?.sellingPrice || 0)) * drawerQty
                      ).toLocaleString("id-ID")}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Notes Input */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-semibold text-slate-700 dark:text-slate-200 block">
                  Catatan Menu (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={drawerNote}
                  onChange={(e) => setDrawerNote(e.target.value)}
                  placeholder="Contoh: Sedikit es, tanpa gula, sambal dipisah..."
                  className="w-full bg-slate-50 dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-galaxy-muted focus:outline-none focus:border-primary-500 resize-none transition-colors"
                />
              </div>
            </div>

            {/* Drawer Footer CTA */}
            <div className="p-4 border-t border-slate-200/80 dark:border-galaxy-border/80 bg-slate-50/50 dark:bg-galaxy-header/50 pb-[max(1.75rem,calc(env(safe-area-inset-bottom)+1.25rem))] shrink-0">
              <button
                type="button"
                onClick={handleConfirmDrawer}
                className="w-full py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-heading font-semibold text-xs flex items-center justify-center gap-2 shadow-galaxy-cyan transition-all cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Tambahkan ke Keranjang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic QRIS Payment Gateway Modal */}
      <QrisPaymentModal
        isOpen={qrisModalData.isOpen}
        onClose={handleQrisClose}
        orderId={qrisModalData.orderId}
        orderNumber={qrisModalData.orderNumber}
        amount={qrisModalData.amount}
        outletName={qrisModalData.outletName}
        customerName={qrisModalData.customerName}
        onSuccess={handleQrisSuccess}
      />
    </div>
  );
}
