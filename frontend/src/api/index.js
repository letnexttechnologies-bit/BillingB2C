// src/api/index.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // This will include "/api"
});

// =================== PRODUCTS ===================
export const getProducts = async () => {
  const res = await API.get("/products");
  return res.data;
};

export const saveProduct = async (product) => {
  if (product._id) {
    const res = await API.put(`/products/${product._id}`, product);
    return res.data;
  } else {
    const res = await API.post("/products", product);
    return res.data;
  }
};

export const addProduct = async (data) => {
  const res = await API.post("/products", data);
  return res.data;
};

export const updateProduct = async (id, data) => {
  const res = await API.put(`/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id) => {
  await API.delete(`/products/${id}`);
};

// =================== INVOICES ===================
export const getInvoices = async () => {
  const res = await API.get("/invoices");
  return res.data;
};

export const saveInvoice = async (invoice) => {
  const res = await API.post("/invoices", invoice);
  return res.data;
};

export const getInvoiceById = async (id) => {
  const res = await API.get(`/invoices/${id}`);
  return res.data;
};

// =================== CUSTOMERS ===================
export const getCustomers = async () => {
  const res = await API.get("/customers");
  return res.data;
};

export const saveCustomer = async (customer) => {
  const res = await API.post("/customers", customer);
  return res.data;
};

export const getCustomerByMobile = async (mobile) => {
  const res = await API.get(`/customers/mobile/${mobile}`);
  return res.data;
};

export default API;
