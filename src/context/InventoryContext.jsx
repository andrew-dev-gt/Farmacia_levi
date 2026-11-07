import React, { createContext, useContext, useState, useEffect } from 'react';
import { inventoryDB, transfersDB, suppliersDB, purchasesDB, salesDB, initDB } from '../utils/db';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [branches, setBranches] = useState(['Sucursal Centro', 'Salida de Tejutla']);
  const [profiles, setProfiles] = useState([
    { id: '1', username: 'Super Administrador', role: 'superadmin', password: 'AND135531cd', branch: 'all' },
    { id: '2', username: 'Administrador Salida Tejutla', role: 'admin', password: 'Salida_Levy_502', branch: 'Salida de Tejutla' },
    { id: '3', username: 'Administrador Sucursal Centro', role: 'admin', password: 'Acetaminofen_Goita_502', branch: 'Sucursal Centro' },
    { id: '4', username: 'Cajero Empleado', role: 'empleado', password: 'E1', branch: 'Sucursal Centro' }
  ]);
  
  const [systemSettings, setSystemSettings] = useState({
    showOtherBranches: true,
    enableTransfers: true
  });

  const [cart, setCart] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const addToCart = (product, qty = 1) => {
     setCart(prev => {
        const existing = prev.find(item => item.product.id === product.id);
        if (existing) {
           return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
        }
        return [...prev, { product, quantity: qty }];
     });
  };

  const updateCartQuantity = (productId, qty) => {
     setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: qty } : item).filter(item => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const [currentUser, setCurrentUser] = useState(() => {
     try {
       const user = localStorage.getItem('levy_current_user');
       return user ? JSON.parse(user) : null;
     } catch(e) { return null; }
  });
  
  const [currentBranch, setCurrentBranchState] = useState(() => {
     return localStorage.getItem('levy_current_branch') || branches[0];
  });

  const setCurrentBranch = (branchStr) => {
      setCurrentBranchState(branchStr);
      localStorage.setItem('levy_current_branch', branchStr);
  };

  const login = (password) => {
     // Match explicitly against password string. Blank passwords cannot be logged into from the main screen directly for security.
     if(!password) return false;
     const match = profiles.find(p => p.password === password);
     if(match) {
        setCurrentUser(match);
        localStorage.setItem('levy_current_user', JSON.stringify(match));
        
        const landingBranch = match.role === 'superadmin' ? branches[0] : match.branch;
        setCurrentBranch(landingBranch);
        
        return true;
     }
     return false;
  };

  const logout = () => {
      setCurrentUser(null);
      localStorage.removeItem('levy_current_user');
  };

  const role = currentUser?.role || null;

  const loadData = async () => {
    setLoading(true);
    await initDB();
    const loadedProducts = [];
    await inventoryDB.iterate((value) => { 
        if (value.name && value.name.includes('(') && !value.presentation) {
            const parts = value.name.split('(');
            value.name = parts[0].trim();
            value.presentation = '(' + parts[1].trim();
            inventoryDB.setItem(value.id, value);
        }
        loadedProducts.push(value); 
    });
    setProducts(loadedProducts);
    
    const loadedTransfers = [];
    await transfersDB.iterate((value) => { loadedTransfers.push(value); });
    setTransfers(loadedTransfers);

    const loadedSuppliers = [];
    await suppliersDB.iterate((value) => { loadedSuppliers.push(value); });
    setSuppliers(loadedSuppliers);

    const loadedPurchases = [];
    await purchasesDB.iterate((value) => { loadedPurchases.push(value); });
    setPurchases(loadedPurchases);

    const loadedSales = [];
    await salesDB.iterate((value) => { loadedSales.push(value); });
    setSalesHistory(loadedSales);

    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const getProductById = async (id) => await inventoryDB.getItem(id);

  const addProduct = async (productData) => {
    productData.presentation = productData.presentation || '';
    productData.stock = productData.stock || {};
    productData.expiryDates = productData.expiryDates || {};
    branches.forEach(b => {
      productData.stock[b] = productData.stock[b] || 0;
      productData.expiryDates[b] = productData.expiryDates[b] || '';
    });
    await inventoryDB.setItem(productData.id, productData);
    await loadData();
  };

  const updateProductDetails = async (id, updatedData) => {
    await inventoryDB.setItem(id, updatedData);
    await loadData();
  };

  const deleteProduct = async (id) => {
    await inventoryDB.removeItem(id);
    await loadData();
  };

  const addBranch = async (branchName) => {
    if(!branches.includes(branchName)) {
      const newBranches = [...branches, branchName];
      setBranches(newBranches);
      const updatePromises = products.map(async (p) => {
         const newProduct = {...p};
         newProduct.stock[branchName] = 0;
         newProduct.expiryDates = newProduct.expiryDates || {};
         newProduct.expiryDates[branchName] = '';
         await inventoryDB.setItem(newProduct.id, newProduct);
      });
      await Promise.all(updatePromises);
      await loadData();
    }
  };

  const updateProfile = (id, newProfileData) => {
      const updated = profiles.map(p => p.id === id ? newProfileData : p);
      setProfiles(updated);
      if(currentUser && currentUser.id === id) {
         setCurrentUser(newProfileData);
         localStorage.setItem('levy_current_user', JSON.stringify(newProfileData));
         if(newProfileData.role !== 'superadmin' && newProfileData.branch !== currentBranch) {
             setCurrentBranch(newProfileData.branch);
         }
      }
  };

  const addProfile = (profile) => setProfiles([...profiles, profile]);

  const deleteProfile = (id) => {
      setProfiles(prev => prev.filter(p => p.id !== id));
  };

  const updateProductStock = async (id, branch, quantityChange) => {
    const product = await inventoryDB.getItem(id);
    if (product) {
      product.stock[branch] = (product.stock[branch] || 0) + quantityChange;
      await inventoryDB.setItem(id, product);
      await loadData();
    }
  };

  const requestTransfer = async (productId, fromBranch, toBranch, quantity) => {
    const product = await inventoryDB.getItem(productId);
    if (!product || product.stock[fromBranch] < quantity) return false;
    await updateProductStock(productId, fromBranch, -quantity);
    const transferRecord = {
      id: Date.now().toString(), productId, productName: product.name,
      fromBranch, toBranch, quantity, status: 'pending', timestamp: new Date().toISOString()
    };
    await transfersDB.setItem(transferRecord.id, transferRecord);
    await loadData();
    return true;
  };

  const requestBatchTransfer = async (items, fromBranch, toBranch, senderName) => {
    const results = [];
    for (const item of items) {
      const product = await inventoryDB.getItem(item.productId);
      if (!product || product.stock[fromBranch] < item.quantity) {
        results.push({ productId: item.productId, success: false, reason: 'Stock insuficiente' });
        continue;
      }
      await updateProductStock(item.productId, fromBranch, -item.quantity);
      const transferRecord = {
        id: Date.now().toString() + '-' + item.productId,
        productId: item.productId,
        productName: product.name,
        fromBranch,
        toBranch,
        quantity: item.quantity,
        status: 'pending',
        senderName: senderName || '',
        timestamp: new Date().toISOString(),
        batchId: Date.now().toString()
      };
      await transfersDB.setItem(transferRecord.id, transferRecord);
      results.push({ productId: item.productId, success: true });
    }
    await loadData();
    return results;
  };
  
  const receiveTransfer = async (transferId) => {
     const transfer = await transfersDB.getItem(transferId);
     if(transfer && transfer.status === 'pending') {
         transfer.status = 'received';
         await transfersDB.setItem(transferId, transfer);
         await updateProductStock(transfer.productId, transfer.toBranch, transfer.quantity);
         await loadData();
         return true;
     }
     return false;
  };

  // Suppliers CRUD
  const addSupplier = async (supplierData) => {
    await suppliersDB.setItem(supplierData.id, supplierData);
    await loadData();
  };

  const updateSupplier = async (id, updatedData) => {
    await suppliersDB.setItem(id, updatedData);
    await loadData();
  };

  const deleteSupplier = async (id) => {
    await suppliersDB.removeItem(id);
    await loadData();
  };

  // Purchases CRUD
  const addPurchase = async (purchaseData) => {
    await purchasesDB.setItem(purchaseData.id, purchaseData);
    // Optionally add stock
    if (purchaseData.addToStock && purchaseData.items) {
      for (const item of purchaseData.items) {
        await updateProductStock(item.productId, purchaseData.branch, item.quantity);
      }
    }
    await loadData();
  };

  // Sales
  const recordSale = async (saleData) => {
    await salesDB.setItem(saleData.id, saleData);
    await loadData();
  };

  return (
    <InventoryContext.Provider value={{
      products, transfers, branches, profiles, setProfiles,
      suppliers, purchases, salesHistory,
      systemSettings, setSystemSettings, currentUser, setCurrentUser,
      currentBranch, setCurrentBranch, role, loading, login, logout,
      getProductById, addProduct, updateProductDetails, deleteProduct,
      addBranch, addProfile, updateProfile, deleteProfile, updateProductStock,
      requestTransfer, requestBatchTransfer, receiveTransfer,
      addSupplier, updateSupplier, deleteSupplier,
      addPurchase, recordSale,
      cart, setCart, addToCart, updateCartQuantity, clearCart,
      sidebarCollapsed, setSidebarCollapsed
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
