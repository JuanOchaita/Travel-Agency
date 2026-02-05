import { NextResponse } from 'next/server';

// Almacenamiento en memoria (para Vercel)
let pricingDataCache: any = null;

const defaultData = {
  destinations: {
    "Guatemala": { basePrice: 500 },
    "México": { basePrice: 800 },
    "Estados Unidos": { basePrice: 1200 },
    "España": { basePrice: 1500 },
    "Francia": { basePrice: 1600 }
  },
  origins: {
    "Guatemala": true,
    "México": true,
    "Estados Unidos": true,
    "España": true,
    "Francia": true
  },
  flightTypes: {
    "Económico": { multiplier: 1.0 },
    "Ejecutivo": { multiplier: 1.5 },
    "Primera Clase": { multiplier: 2.5 }
  },
  hotels: {
    "3": { pricePerNight: 50 },
    "4": { pricePerNight: 100 },
    "5": { pricePerNight: 200 }
  },
  restaurants: {
    "3": { pricePerDay: 30 },
    "4": { pricePerDay: 60 },
    "5": { pricePerDay: 100 }
  },
  transport: {
    "3": { pricePerDay: 40 },
    "4": { pricePerDay: 80 },
    "5": { pricePerDay: 150 }
  },
  activities: [
    { id: 1, name: "City Tour", price: 50 },
    { id: 2, name: "Museo Nacional", price: 30 },
    { id: 3, name: "Tour Gastronómico", price: 80 },
    { id: 4, name: "Paseo en Barco", price: 100 },
    { id: 5, name: "Senderismo Guiado", price: 60 },
    { id: 6, name: "Clase de Cocina Local", price: 75 },
    { id: 7, name: "Tour de Compras", price: 40 },
    { id: 8, name: "Visita a Viñedos", price: 120 },
    { id: 9, name: "Avistamiento de Fauna", price: 90 },
    { id: 10, name: "Tour Nocturno", price: 70 }
  ]
};

export async function GET() {
  try {
    // Si hay datos en caché, retornarlos
    if (pricingDataCache) {
      return NextResponse.json(pricingDataCache);
    }

    // Si no hay caché, intentar leer del sistema de archivos (desarrollo local)
    if (process.env.NODE_ENV === 'development') {
      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join(process.cwd(), 'data', 'pricing.json');
      
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        pricingDataCache = data;
        return NextResponse.json(data);
      }
    }

    // Si no existe, usar datos por defecto
    pricingDataCache = defaultData;
    return NextResponse.json(defaultData);
  } catch (error) {
    console.error('Error loading pricing data:', error);
    return NextResponse.json(defaultData);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Guardar en caché
    pricingDataCache = data;
    
    // Intentar guardar en archivo (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join(process.cwd(), 'data', 'pricing.json');
      const dataDir = path.join(process.cwd(), 'data');
      
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    }
    
    return NextResponse.json({ success: true, message: 'Datos actualizados correctamente' });
  } catch (error) {
    console.error('Error updating pricing data:', error);
    return NextResponse.json({ error: 'Error al actualizar datos' }, { status: 500 });
  }
}
