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

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // 🔄 Load products
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
        newProduct._id = editingProduct._id;
        await saveProduct(newProduct);
        setEditingProduct(null);
      } else {
        await saveProduct(newProduct);
      }

      await refreshProducts();
      setFormData({
        name: "",
        price: "",
        stockQuantity: "",
        unit: "piece",
        tagNo: "",
      });
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

  // ✅ Pagination logic
  const sortedProducts = products.sort((a, b) => {
    if (a.stockQuantity === 0) return -1;
    if (b.stockQuantity === 0) return 1;
    if (a.stockQuantity <= 5 && b.stockQuantity > 5) return -1;
    if (b.stockQuantity <= 5 && a.stockQuantity > 5) return 1;
    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirst, indexOfLast);

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
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
                <option value="litre">Litre</option>
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
          <>
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
                  {currentProducts.map((product) => {
                    let rowClass = "";
                    let statusLabel = "";

                    if (product.stockQuantity === 0) {
                      rowClass = "out-of-stock";
                      statusLabel = "Out of Stock";
                    } else if (product.stockQuantity <= 5) {
                      rowClass = "low-stock";
                      statusLabel = "Low Stock";
                    }

                    return (
                      <tr
                        key={product._id}
                        className={`product-row ${rowClass}`}>
                        <td className="product-name">{product.name}</td>
                        <td className="product-tag">
                          {product.tagNo || "N/A"}
                        </td>
                        <td className="product-price">
                          ₹{Number(product.price).toFixed(2)}
                        </td>
                        <td className="product-quantity">
                          {getUnitDisplay(product.stockQuantity, product.unit)}
                          {statusLabel && (
                            <span className={`status-badge ${rowClass}`}>
                              {statusLabel}
                            </span>
                          )}
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
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ✅ Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  disabled={currentPage === 1}
                  onClick={() => goToPage(1)}>
                  ⏮ First
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}>
                  ◀ Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={currentPage === i + 1 ? "active-page" : ""}
                    onClick={() => goToPage(i + 1)}>
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}>
                  Next ▶
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(totalPages)}>
                  Last ⏭
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Inventory;
