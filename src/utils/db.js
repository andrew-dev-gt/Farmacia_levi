import localforage from 'localforage';

export const inventoryDB = localforage.createInstance({
  name: "FarmaciaLevyDB",
  storeName: "inventory"
});

export const transfersDB = localforage.createInstance({
  name: "FarmaciaLevyDB",
  storeName: "transfers"
});

export const suppliersDB = localforage.createInstance({
  name: "FarmaciaLevyDB",
  storeName: "suppliers"
});

export const purchasesDB = localforage.createInstance({
  name: "FarmaciaLevyDB",
  storeName: "purchases"
});

export const salesDB = localforage.createInstance({
  name: "FarmaciaLevyDB",
  storeName: "sales"
});

// Mock initial data setup.
const initialInventory = [
  {
    id: '7501000000010',
    name: 'Acetaminofén 500mg (Caja 100 tabs)',
    description: 'Analgésico y antipirético de primera línea para dolor leve a moderado.',
    category: 'Analgésicos',
    price: 35.50,
    lot: 'L-2023-A1',
    expiryDates: {
      'Sucursal Centro': '2026-10-15',
      'Salida de Tejutla': '2026-12-01'
    },
    stock: {
      'Sucursal Centro': 120,
      'Salida de Tejutla': 50
    }
  },
  {
    id: '7501000000020',
    name: 'Ibuprofeno 400mg (Caja 20 tabs)',
    description: 'Antiinflamatorio no esteroideo (AINE) para inflamación y dolor articular.',
    category: 'Antiinflamatorios',
    price: 45.00,
    lot: 'L-2024-B2',
    expiryDates: {
      'Sucursal Centro': '2025-05-20',
      'Salida de Tejutla': '2025-08-15'
    },
    stock: {
      'Sucursal Centro': 5, // Low stock example
      'Salida de Tejutla': 30
    }
  },
  {
    id: '7501000000030',
    name: 'Amoxicilina 500mg Cápsulas',
    description: 'Antibiótico de amplio espectro para infecciones bacterianas.',
    category: 'Antibióticos',
    price: 120.00,
    lot: 'L-2024-X4',
    expiryDates: {
      'Sucursal Centro': '2026-06-10', // Near expiry example
      'Salida de Tejutla': '2027-01-14'
    },
    stock: {
      'Sucursal Centro': 45,
      'Salida de Tejutla': 0 // Out of stock example
    }
  },
  {
    id: '7501000000040',
    name: 'Vitamina C + Zinc Efervescente',
    description: 'Suplemento vitamínico diario para refuerzo al sistema inmunológico.',
    category: 'Suplementos',
    price: 65.00,
    lot: 'L-2025-Z9',
    expiryDates: {
      'Sucursal Centro': '2028-01-01',
      'Salida de Tejutla': '2027-11-20'
    },
    stock: {
      'Sucursal Centro': 80,
      'Salida de Tejutla': 100
    }
  },
  {
    id: '7501000000050',
    name: 'Loratadina 10mg (Caja 10 tabs)',
    description: 'Antihistamínico no sedante de segunda generación para alergias.',
    category: 'Antialérgicos',
    price: 25.50,
    lot: 'L-2024-C3',
    expiryDates: {
      'Sucursal Centro': '2027-03-10',
      'Salida de Tejutla': '2026-09-05'
    },
    stock: {
      'Sucursal Centro': 200,
      'Salida de Tejutla': 25
    }
  },
  {
    id: '7501000000060',
    name: 'Omeprazol 20mg Cápsulas',
    description: 'Inhibidor de la bomba de protones para reflujo gástrico y úlceras.',
    category: 'Gastrointestinal',
    price: 55.00,
    lot: 'L-2023-F6',
    expiryDates: {
      'Sucursal Centro': '2026-11-30',
      'Salida de Tejutla': '2026-12-15'
    },
    stock: {
      'Sucursal Centro': 60,
      'Salida de Tejutla': 40
    }
  },
  {
    id: '7501000000070',
    name: 'Salbutamol Inhalador 100mcg',
    description: 'Aerosol broncodilatador de rescate para alivio inmediato crónico.',
    category: 'Respiratorio',
    price: 85.00,
    lot: 'L-2025-P2',
    expiryDates: {
      'Sucursal Centro': '2028-05-12',
      'Salida de Tejutla': '2028-06-20'
    },
    stock: {
      'Sucursal Centro': 0, // out of stock centro
      'Salida de Tejutla': 15 
    }
  },
  {
    id: '7501000000080',
    name: 'Diclofenaco Gel 1% 50g',
    description: 'Analgésico tópico para dolores musculares y articulares localizados.',
    category: 'Analgésicos',
    price: 32.00,
    lot: 'L-2024-D1',
    expiryDates: { 'Sucursal Centro': '2027-02-15', 'Salida de Tejutla': '2026-11-20' },
    stock: { 'Sucursal Centro': 40, 'Salida de Tejutla': 12 }
  },
  {
    id: '7501000000090',
    name: 'Lágrimas Artificiales 15ml',
    description: 'Solución oftálmica lubricante para alivio de ojo seco.',
    category: 'Oftálmicos',
    price: 48.50,
    lot: 'L-2023-O5',
    expiryDates: { 'Sucursal Centro': '2026-08-30', 'Salida de Tejutla': '2025-05-10' },
    stock: { 'Sucursal Centro': 0, 'Salida de Tejutla': 55 }
  },
  {
    id: '7501000000100',
    name: 'Jarabe Antitusivo Adulto 120ml',
    description: 'Supresor de la tos seca y expectorante.',
    category: 'Respiratorio',
    price: 55.00,
    lot: 'L-2024-R9',
    expiryDates: { 'Sucursal Centro': '2028-04-12', 'Salida de Tejutla': '2028-09-01' },
    stock: { 'Sucursal Centro': 75, 'Salida de Tejutla': 20 }
  },
  {
    id: '7501000000110',
    name: 'Ketorolaco 10mg (Caja 10 tabs)',
    description: 'Analgésico potente para manejo del dolor agudo moderado a severo.',
    category: 'Analgésicos',
    price: 40.00,
    lot: 'L-2025-K3',
    expiryDates: { 'Sucursal Centro': '2027-06-30', 'Salida de Tejutla': '2026-12-10' },
    stock: { 'Sucursal Centro': 110, 'Salida de Tejutla': 35 }
  },
  {
    id: '7501000000120',
    name: 'Ceftriaxona Inyectable 1g',
    description: 'Antibiótico cefalosporínico de amplio espectro, administración intramuscular/intravenosa.',
    category: 'Antibióticos',
    price: 150.00,
    lot: 'L-2024-INJ1',
    expiryDates: { 'Sucursal Centro': '2026-09-17', 'Salida de Tejutla': '2027-02-28' },
    stock: { 'Sucursal Centro': 30, 'Salida de Tejutla': 5 }
  },
  {
    id: '7501000000130',
    name: 'Complejo B (Caja 30 Grageas)',
    description: 'Suplemento neurotrópico para deficiencias de vitaminas B1, B6 y B12.',
    category: 'Suplementos',
    price: 85.50,
    lot: 'L-2025-V2',
    expiryDates: { 'Sucursal Centro': '2028-11-05', 'Salida de Tejutla': '2028-11-05' },
    stock: { 'Sucursal Centro': 150, 'Salida de Tejutla': 150 }
  },
  {
    id: '7501000000140',
    name: 'Alcohol en Gel 70% 500ml',
    description: 'Antiséptico tópico para desinfección de manos sin enjuague.',
    category: 'Material Médico',
    price: 28.00,
    lot: 'L-2023-M8',
    expiryDates: { 'Sucursal Centro': '2029-01-01', 'Salida de Tejutla': '2029-01-01' },
    stock: { 'Sucursal Centro': 20, 'Salida de Tejutla': 90 }
  },
  {
    id: '7501000000150',
    name: 'Mascarillas Quirúrgicas (Caja 50)',
    description: 'Cubrebocas desechable de tres capas con ajuste nasal.',
    category: 'Material Médico',
    price: 45.00,
    lot: 'L-2023-MQ2',
    expiryDates: { 'Sucursal Centro': '2030-12-31', 'Salida de Tejutla': '2030-12-31' },
    stock: { 'Sucursal Centro': 15, 'Salida de Tejutla': 0 }
  },
  {
    id: '7501000000160',
    name: 'Termómetro Digital Infrarrojo',
    description: 'Dispositivo de medición corporal sin contacto.',
    category: 'Equipo Médico',
    price: 250.00,
    lot: 'L-2022-T7',
    expiryDates: { 'Sucursal Centro': '', 'Salida de Tejutla': '' },
    stock: { 'Sucursal Centro': 3, 'Salida de Tejutla': 1 }
  },
  {
    id: '7501000000170',
    name: 'Clotrimazol Crema 1%',
    description: 'Antimicótico de amplio espectro para infecciones por hongos.',
    category: 'Dermatología',
    price: 38.00,
    lot: 'L-2024-C5',
    expiryDates: { 'Sucursal Centro': '2027-08-14', 'Salida de Tejutla': '2026-03-22' },
    stock: { 'Sucursal Centro': 45, 'Salida de Tejutla': 22 }
  },
  {
    id: '7501000000180',
    name: 'Losartán 50mg (Caja 30 tabs)',
    description: 'Antihipertensivo para el control de la presión arterial.',
    category: 'Cardiovascular',
    price: 110.00,
    lot: 'L-2025-CV1',
    expiryDates: { 'Sucursal Centro': '2028-02-10', 'Salida de Tejutla': '2027-11-30' },
    stock: { 'Sucursal Centro': 200, 'Salida de Tejutla': 80 }
  },
  {
    id: '7501000000190',
    name: 'Metformina 850mg (Caja 30 tabs)',
    description: 'Hipoglucemiante oral para control de la diabetes mellitus tipo 2.',
    category: 'Metabólico',
    price: 95.00,
    lot: 'L-2024-M9',
    expiryDates: { 'Sucursal Centro': '2027-04-25', 'Salida de Tejutla': '2026-10-10' },
    stock: { 'Sucursal Centro': 0, 'Salida de Tejutla': 30 }
  },
  {
    id: '7501000000200',
    name: 'Jeringas Desechables 3ml (Caja 100)',
    description: 'Jeringas estériles con aguja 21G para administración de medicamentos.',
    category: 'Material Médico',
    price: 75.00,
    lot: 'L-2023-J4',
    expiryDates: { 'Sucursal Centro': '2029-06-30', 'Salida de Tejutla': '2029-06-30' },
    stock: { 'Sucursal Centro': 8, 'Salida de Tejutla': 2 }
  },
  {
    id: '7501000000210',
    name: 'Suero Oral Rehidratante (250ml)',
    description: 'Solución con electrolitos para prevención de la deshidratación.',
    category: 'Gastrointestinal',
    price: 18.50,
    lot: 'L-2025-S1',
    expiryDates: { 'Sucursal Centro': '2026-12-01', 'Salida de Tejutla': '2026-08-15' },
    stock: { 'Sucursal Centro': 150, 'Salida de Tejutla': 0 }
  },
  {
    id: '7501000000220',
    name: 'Bismuto Suspensión 120ml',
    description: 'Antidiarreico y aliviador de síntomas estomacales como acidez cróncia.',
    category: 'Gastrointestinal',
    price: 42.00,
    lot: 'L-2024-B5',
    expiryDates: { 'Sucursal Centro': '2027-03-31', 'Salida de Tejutla': '2026-09-01' },
    stock: { 'Sucursal Centro': 65, 'Salida de Tejutla': 40 }
  }
];

const initialSuppliers = [
  {
    id: 'SUP001',
    companyName: 'Distribuidora Farmacéutica Nacional',
    nit: '1234567-8',
    type: 'Distribuidor',
    phone: '2222-3333',
    email: 'ventas@dfn.com.gt',
    address: 'Zona 10, Ciudad de Guatemala',
    notes: 'Proveedor principal de medicamentos genéricos.'
  },
  {
    id: 'SUP002',
    companyName: 'Laboratorios Pharma GT',
    nit: '9876543-2',
    type: 'Laboratorio',
    phone: '2444-5555',
    email: 'pedidos@pharmagt.com',
    address: 'Zona 4, Quetzaltenango',
    notes: 'Especialistas en antibióticos y antiinflamatorios.'
  },
  {
    id: 'SUP003',
    companyName: 'MediImport Internacional',
    nit: '5555666-7',
    type: 'Importador',
    phone: '2333-4444',
    email: 'info@mediimport.com',
    address: 'Zona 13, Ciudad de Guatemala',
    notes: 'Importación de equipo médico y suplementos.'
  }
];

export const initDB = async () => {
  const count = await inventoryDB.length();
  if (count === 0) {
    for (const item of initialInventory) {
      await inventoryDB.setItem(item.id, item);
    }
  }
  
  const supplierCount = await suppliersDB.length();
  if (supplierCount === 0) {
    for (const supplier of initialSuppliers) {
      await suppliersDB.setItem(supplier.id, supplier);
    }
  }
};
