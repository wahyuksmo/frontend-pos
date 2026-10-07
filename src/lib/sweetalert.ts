import Swal, { SweetAlertOptions, SweetAlertResult } from "sweetalert2";

/**
 * Helper to determine if current theme is dark
 */
const isDarkMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
};

/**
 * Base SweetAlert options customized for Velzon Galaxy & Mint Teal Rebranding
 */
const getBaseOptions = () => {
  const dark = isDarkMode();

  return {
    background: dark ? "#111c24" : "#ffffff",
    color: dark ? "#d2dce3" : "#1c262b",
    backdrop: `rgba(11, 19, 25, 0.75)`,
    buttonsStyling: false,
    customClass: {
      popup: "galaxy-swal-popup rounded-lg border border-slate-200 dark:border-galaxy-border shadow-2xl p-6 font-sans",
      title: "font-heading text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2",
      htmlContainer: "text-xs text-slate-600 dark:text-slate-300 leading-relaxed",
      confirmButton:
        "inline-flex items-center justify-center font-bold px-4 py-2 text-xs rounded bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:text-slate-950 dark:hover:bg-primary-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer mx-1.5 transition-all select-none",
      cancelButton:
        "inline-flex items-center justify-center font-medium px-4 py-2 text-xs rounded bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700/80 dark:text-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer mx-1.5 transition-all select-none",
      denyButton:
        "inline-flex items-center justify-center font-semibold px-4 py-2 text-xs rounded bg-rose-600 text-white hover:bg-rose-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer mx-1.5 transition-all select-none",
      actions: "mt-5 flex items-center justify-center gap-2",
    },
  };
};

/**
 * Display SweetAlert Success Dialog (Non-toast)
 */
export const showSuccessAlert = async (
  title: string = "Berhasil!",
  text: string = "Operasi berhasil diselesaikan.",
  confirmButtonText: string = "OK, Lanjutkan"
): Promise<SweetAlertResult> => {
  return Swal.fire({
    ...getBaseOptions(),
    icon: "success",
    title,
    text,
    confirmButtonText,
    showConfirmButton: true,
  } as SweetAlertOptions);
};

/**
 * Display SweetAlert Error Dialog (Non-toast)
 */
export const showErrorAlert = async (
  title: string = "Terjadi Kesalahan!",
  text: string = "Gagal memproses data. Silakan periksa kembali.",
  confirmButtonText: string = "Tutup"
): Promise<SweetAlertResult> => {
  return Swal.fire({
    ...getBaseOptions(),
    icon: "error",
    title,
    text,
    confirmButtonText,
    showConfirmButton: true,
  } as SweetAlertOptions);
};

/**
 * Display SweetAlert Warning Dialog (Non-toast)
 */
export const showWarningAlert = async (
  title: string = "Peringatan",
  text: string = "Harap perhatikan informasi ini dengan teliti.",
  confirmButtonText: string = "Mengerti"
): Promise<SweetAlertResult> => {
  return Swal.fire({
    ...getBaseOptions(),
    icon: "warning",
    title,
    text,
    confirmButtonText,
    showConfirmButton: true,
  } as SweetAlertOptions);
};

/**
 * Display SweetAlert Confirmation Dialog (Non-toast)
 */
export interface ConfirmDialogOptions {
  title?: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const showConfirmDialog = async (
  optionsOrTitle: ConfirmDialogOptions | string = "Apakah Anda yakin?",
  textArg?: string,
  confirmButtonTextArg?: string
): Promise<SweetAlertResult> => {
  let title = "Apakah Anda yakin?";
  let text = "Tindakan ini tidak dapat dibatalkan.";
  let confirmText = "Ya, Lanjutkan";
  let cancelText = "Batal";
  let isDanger = false;

  if (typeof optionsOrTitle === "string") {
    if (textArg) {
      title = optionsOrTitle;
      text = textArg;
    } else {
      text = optionsOrTitle;
    }
    if (confirmButtonTextArg) confirmText = confirmButtonTextArg;
  } else {
    title = optionsOrTitle.title || title;
    text = optionsOrTitle.text || text;
    confirmText = optionsOrTitle.confirmText || confirmText;
    cancelText = optionsOrTitle.cancelText || cancelText;
    isDanger = optionsOrTitle.isDanger || false;
  }

  const base = getBaseOptions();

  return Swal.fire({
    ...base,
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    customClass: {
      ...base.customClass,
      confirmButton: isDanger
        ? "inline-flex items-center justify-center font-bold px-4 py-2 text-xs rounded bg-rose-500 text-white hover:bg-rose-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer mx-1.5 transition-all select-none"
        : base.customClass?.confirmButton,
    },
  } as SweetAlertOptions);
};

/**
 * Display SweetAlert Loading Dialog with Spinner
 */
export const showLoadingAlert = (
  title: string = "Sedang Memproses...",
  text: string = "Mohon tunggu sebentar selagi sistem memproses data."
) => {
  Swal.fire({
    ...getBaseOptions(),
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  } as SweetAlertOptions);
};

/**
 * Close any active SweetAlert Dialog
 */
export const closeAlert = () => {
  Swal.close();
};

export default Swal;
