export type OfflineSaleStatus = "pending_sync" | "syncing" | "synced" | "failed";

export type OfflineSaleItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type OfflineSaleRecord = {
  localId: string;
  businessId: string;
  branchId: string;
  cashierId: string;
  customerId?: string;
  customerName: string;
  invoiceNumber?: string;
  localInvoiceNumber: string;
  items: OfflineSaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paid: number;
  due: number;
  paymentMethod: string;
  saleType: string;
  status: OfflineSaleStatus;
  createdAt: string;
  updatedAt: string;
  syncAttempts: number;
  lastError?: string;
  deviceId: string;
};

const DB_NAME = "biashara-cloud-pos";
const DB_VERSION = 1;
const SALES_STORE = "offline_sales";
const DEVICE_ID_KEY = "biashara.deviceId";
const SIMULATE_OFFLINE_KEY = "biashara.simulateOfflineMode";
export const OFFLINE_MODE_EVENT = "biashara-offline-mode-change";
export const OFFLINE_SALES_EVENT = "biashara-offline-sales-change";

function browserReady() {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

function openOfflineDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!browserReady()) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SALES_STORE)) {
        const store = db.createObjectStore(SALES_STORE, { keyPath: "localId" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open offline sales database."));
  });
}

function storeRequest<T>(mode: IDBTransactionMode, handler: (store: IDBObjectStore) => IDBRequest<T>) {
  return openOfflineDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(SALES_STORE, mode);
        const store = transaction.objectStore(SALES_STORE);
        const request = handler(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Offline sales database request failed."));
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => {
          db.close();
          reject(transaction.error ?? new Error("Offline sales database transaction failed."));
        };
      }),
  );
}

export function getOfflineDeviceId() {
  if (typeof window === "undefined") return "server-render";
  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const randomPart = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const deviceId = `biashara-device-${randomPart}`;
  window.localStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

export function getSimulateOfflineMode() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SIMULATE_OFFLINE_KEY) === "true";
}

export function setSimulateOfflineMode(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SIMULATE_OFFLINE_KEY, String(enabled));
  window.dispatchEvent(new CustomEvent(OFFLINE_MODE_EVENT, { detail: { enabled } }));
}

export function makeLocalInvoiceNumber() {
  const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `OFF-${timestamp}-${suffix}`;
}

export function makeOfflineSaleId() {
  return crypto.randomUUID ? crypto.randomUUID() : `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function saveOfflineSale(sale: OfflineSaleRecord) {
  await storeRequest("readwrite", (store) => store.put(sale));
  window.dispatchEvent(new CustomEvent(OFFLINE_SALES_EVENT));
  return sale;
}

export async function getOfflineSales() {
  const sales = await storeRequest<OfflineSaleRecord[]>("readonly", (store) => store.getAll());
  return sales.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOfflineSalesSummary() {
  const sales = await getOfflineSales();
  return {
    pending: sales.filter((sale) => sale.status === "pending_sync" || sale.status === "syncing").length,
    synced: sales.filter((sale) => sale.status === "synced").length,
    failed: sales.filter((sale) => sale.status === "failed").length,
    lastSyncAttempt: sales.find((sale) => sale.syncAttempts > 0)?.updatedAt,
    total: sales.length,
  };
}

export async function updateOfflineSaleStatus(localId: string, status: OfflineSaleStatus, lastError?: string) {
  const sale = await storeRequest<OfflineSaleRecord | undefined>("readonly", (store) => store.get(localId));
  if (!sale) return undefined;
  const updated: OfflineSaleRecord = {
    ...sale,
    status,
    lastError,
    syncAttempts: status === "syncing" || status === "failed" ? sale.syncAttempts + 1 : sale.syncAttempts,
    updatedAt: new Date().toISOString(),
  };
  await saveOfflineSale(updated);
  return updated;
}

export async function deleteOfflineSale(localId: string) {
  await storeRequest("readwrite", (store) => store.delete(localId));
  window.dispatchEvent(new CustomEvent(OFFLINE_SALES_EVENT));
}
