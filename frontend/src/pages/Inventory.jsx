// src/pages/Inventory.js
import React, { useState, useEffect } from "react";
import { getProducts, saveProduct, deleteProduct } from "../api/index";
import "./Inventory.css";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stockQuantity: "",
    unit: "piece",
    tagNo: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);

  // 🔄 Helper function to load products
  const refreshProducts = async () => {
    try {
      const loadedProducts = await getProducts();
      const productsWithUnits = (loadedProducts || []).map((product) => ({
        ...product,
        unit: product.unit || "piece",
        tagNo: product.tagNo || "",
      }));
      setProducts(productsWithUnits);
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
    }
  };

  // Load products on mount
  useEffect(() => {
    refreshProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newProduct = {
      ...formData,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity, 10),
      unit: formData.unit || "piece",
      tagNo: formData.tagNo || "",
    };

    try {
      if (editingProduct) {
        // Update existing product
        newProduct._id = editingProduct._id; // use _id from backend
        await saveProduct(newProduct);
        setEditingProduct(null);
      } else {
        // Add new product
        await saveProduct(newProduct);
      }

      await refreshProducts(); // refresh after save

      setFormData({
        name: "",
        price: "",
        stockQuantity: "",
        unit: "piece",
        tagNo: "",
      }); // reset form
    } catch (err) {
      console.error("Failed to save product:", err);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      stockQuantity: product.stockQuantity,
      unit: product.unit || "piece",
      tagNo: product.tagNo || "",
    });
    setEditingProduct(product);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        await refreshProducts();
      } catch (err) {
        console.error("Failed to delete product:", err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      price: "",
      stockQuantity: "",
      unit: "piece",
      tagNo: "",
    });
  };

  const getUnitDisplay = (quantity, unit) => {
    const safeUnit = unit || "piece";
    switch (safeUnit) {
      case "kg":
        return `${quantity} kg`;
      case "gram":
        return `${quantity} g`;
      case "pack":
        return `${quantity} pack${quantity !== 1 ? "s" : ""}`;
      case "piece":
      default:
        return `${quantity} pc${quantity !== 1 ? "s" : ""}`;
    }
  };

  const formatUnitName = (unit) => {
    const safeUnit = unit || "piece";
    return safeUnit.charAt(0).toUpperCase() + safeUnit.slice(1);
  };

  return (
    <div className="inventory-container">
      <h1>Manage Products</h1>

      {/* Product Form */}
      <div className="product-form">
        <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Product Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Tag Number (Unique ID)"
              value={formData.tagNo}
              onChange={(e) =>
                setFormData({ ...formData, tagNo: e.target.value })
              }
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="number"
                placeholder="Price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <input
                type="number"
                placeholder="Quantity"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, stockQuantity: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="unit-select">
                <option value="piece">Piece</option>
                <option value="kg">Kilogram</option>
                <option value="gram">Gram</option>
                <option value="pack">Pack</option>
              </select>
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-primary">
              {editingProduct ? "Update Product" : "Add Product"}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Product List */}
      <div className="product-list">
        <h2>Product List ({products.length} items)</h2>
        {products.length === 0 ? (
          <p className="no-products">
            No products found. Add your first product above.
          </p>
        ) : (
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Tag Number</th>
                  <th>Price</th>
                  <th>Stock Quantity</th>
                  <th>Unit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="product-row">
                    <td className="product-name">{product.name}</td>
                    <td className="product-tag">{product.tagNo || "N/A"}</td>
                    <td className="product-price">
                      ₹{Number(product.price).toFixed(2)}
                    </td>
                    <td className="product-quantity">
                      {getUnitDisplay(product.stockQuantity, product.unit)}
                    </td>
                    <td className="product-unit">
                      {formatUnitName(product.unit)}
                    </td>
                    <td className="product-actions">
                      <button
                        onClick={() => handleEdit(product)}
                        className="btn-edit">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="btn-delete">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
