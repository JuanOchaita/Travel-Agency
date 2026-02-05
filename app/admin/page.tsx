'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pricingData, setPricingData] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para agregar nuevos elementos
  const [newDestination, setNewDestination] = useState({ name: '', price: '' });
  const [newOrigin, setNewOrigin] = useState('');
  const [newFlightType, setNewFlightType] = useState({ name: '', multiplier: '' });
  const [newActivity, setNewActivity] = useState({ name: '', price: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadPricingData();
    }
  }, [status]);

  const loadPricingData = async () => {
    try {
      const res = await fetch('/api/pricing');
      const data = await res.json();
      setPricingData(data);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error al cargar datos');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const newPricingData: any = {
          destinations: {},
          origins: {},
          flightTypes: {},
          hotels: {},
          restaurants: {},
          transport: {},
          activities: []
        };

        // Leer hoja de Destinos
        if (workbook.SheetNames.includes('Destinos')) {
          const destinationsSheet = workbook.Sheets['Destinos'];
          const destinationsData = XLSX.utils.sheet_to_json(destinationsSheet);
          destinationsData.forEach((row: any) => {
            if (row.Destino && row.PrecioBase) {
              newPricingData.destinations[row.Destino] = {
                basePrice: parseFloat(row.PrecioBase) || 0
              };
            }
          });
        }

        // Leer hoja de Orígenes
        if (workbook.SheetNames.includes('Origenes')) {
          const originsSheet = workbook.Sheets['Origenes'];
          const originsData = XLSX.utils.sheet_to_json(originsSheet);
          originsData.forEach((row: any) => {
            if (row.Origen) {
              newPricingData.origins[row.Origen] = true;
            }
          });
        }

        // Leer hoja de Tipos de Vuelo
        if (workbook.SheetNames.includes('TiposVuelo')) {
          const flightsSheet = workbook.Sheets['TiposVuelo'];
          const flightsData = XLSX.utils.sheet_to_json(flightsSheet);
          flightsData.forEach((row: any) => {
            if (row.Tipo && row.Multiplicador) {
              newPricingData.flightTypes[row.Tipo] = {
                multiplier: parseFloat(row.Multiplicador) || 1
              };
            }
          });
        }

        // Leer hoja de Hoteles
        if (workbook.SheetNames.includes('Hoteles')) {
          const hotelsSheet = workbook.Sheets['Hoteles'];
          const hotelsData = XLSX.utils.sheet_to_json(hotelsSheet);
          hotelsData.forEach((row: any) => {
            if (row.Estrellas && row.PrecioPorNoche) {
              newPricingData.hotels[row.Estrellas.toString()] = {
                pricePerNight: parseFloat(row.PrecioPorNoche) || 0
              };
            }
          });
        }

        // Leer hoja de Restaurantes
        if (workbook.SheetNames.includes('Restaurantes')) {
          const restaurantsSheet = workbook.Sheets['Restaurantes'];
          const restaurantsData = XLSX.utils.sheet_to_json(restaurantsSheet);
          restaurantsData.forEach((row: any) => {
            if (row.Estrellas && row.PrecioPorDia) {
              newPricingData.restaurants[row.Estrellas.toString()] = {
                pricePerDay: parseFloat(row.PrecioPorDia) || 0
              };
            }
          });
        }

        // Leer hoja de Transporte
        if (workbook.SheetNames.includes('Transporte')) {
          const transportSheet = workbook.Sheets['Transporte'];
          const transportData = XLSX.utils.sheet_to_json(transportSheet);
          transportData.forEach((row: any) => {
            if (row.Estrellas && row.PrecioPorDia) {
              newPricingData.transport[row.Estrellas.toString()] = {
                pricePerDay: parseFloat(row.PrecioPorDia) || 0
              };
            }
          });
        }

        // Leer hoja de Actividades
        if (workbook.SheetNames.includes('Actividades')) {
          const activitiesSheet = workbook.Sheets['Actividades'];
          const activitiesData = XLSX.utils.sheet_to_json(activitiesSheet);
          activitiesData.forEach((row: any, index: number) => {
            if (row.Nombre && row.Precio) {
              newPricingData.activities.push({
                id: index + 1,
                name: row.Nombre,
                price: parseFloat(row.Precio) || 0
              });
            }
          });
        }

        setPricingData(newPricingData);
        setMessage('Archivo Excel cargado correctamente. Haz clic en "Guardar Cambios" para aplicar.');
      } catch (error) {
        console.error('Error processing Excel:', error);
        setMessage('Error al procesar el archivo Excel');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricingData),
      });

      const result = await res.json();
      if (result.success) {
        setMessage('✅ Datos guardados exitosamente');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Error al guardar datos');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setMessage('❌ Error al guardar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (category: string, key: string, field: string, value: string) => {
    setPricingData((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: {
          ...prev[category][key],
          [field]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleDeleteItem = (category: string, key: string) => {
    setPricingData((prev: any) => {
      const newData = { ...prev };
      delete newData[category][key];
      return newData;
    });
  };

  const handleAddDestination = () => {
    if (newDestination.name && newDestination.price) {
      setPricingData((prev: any) => ({
        ...prev,
        destinations: {
          ...prev.destinations,
          [newDestination.name]: { basePrice: parseFloat(newDestination.price) }
        }
      }));
      setNewDestination({ name: '', price: '' });
      setMessage('Destino agregado. Guarda los cambios.');
    }
  };

  const handleAddOrigin = () => {
    if (newOrigin) {
      setPricingData((prev: any) => ({
        ...prev,
        origins: {
          ...prev.origins,
          [newOrigin]: true
        }
      }));
      setNewOrigin('');
      setMessage('Origen agregado. Guarda los cambios.');
    }
  };

  const handleAddFlightType = () => {
    if (newFlightType.name && newFlightType.multiplier) {
      setPricingData((prev: any) => ({
        ...prev,
        flightTypes: {
          ...prev.flightTypes,
          [newFlightType.name]: { multiplier: parseFloat(newFlightType.multiplier) }
        }
      }));
      setNewFlightType({ name: '', multiplier: '' });
      setMessage('Tipo de vuelo agregado. Guarda los cambios.');
    }
  };

  const handleAddActivity = () => {
    if (newActivity.name && newActivity.price) {
      const newId = Math.max(...(pricingData.activities?.map((a: any) => a.id) || [0])) + 1;
      setPricingData((prev: any) => ({
        ...prev,
        activities: [
          ...(prev.activities || []),
          {
            id: newId,
            name: newActivity.name,
            price: parseFloat(newActivity.price)
          }
        ]
      }));
      setNewActivity({ name: '', price: '' });
      setMessage('Actividad agregada. Guarda los cambios.');
    }
  };

  const handleDeleteActivity = (id: number) => {
    setPricingData((prev: any) => ({
      ...prev,
      activities: prev.activities.filter((a: any) => a.id !== id)
    }));
  };

  const handleActivityChange = (id: number, field: string, value: string) => {
    setPricingData((prev: any) => ({
      ...prev,
      activities: prev.activities.map((a: any) => 
        a.id === id ? { ...a, [field]: field === 'price' ? parseFloat(value) || 0 : value } : a
      )
    }));
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // Hoja de Destinos
    const destinationsData = [
      { Destino: 'Guatemala', PrecioBase: 500 },
      { Destino: 'México', PrecioBase: 800 },
      { Destino: 'Estados Unidos', PrecioBase: 1200 }
    ];
    const wsDestinations = XLSX.utils.json_to_sheet(destinationsData);
    XLSX.utils.book_append_sheet(wb, wsDestinations, 'Destinos');

    // Hoja de Orígenes
    const originsData = [
      { Origen: 'Guatemala' },
      { Origen: 'México' },
      { Origen: 'Estados Unidos' }
    ];
    const wsOrigins = XLSX.utils.json_to_sheet(originsData);
    XLSX.utils.book_append_sheet(wb, wsOrigins, 'Origenes');

    // Hoja de Tipos de Vuelo
    const flightsData = [
      { Tipo: 'Económico', Multiplicador: 1.0 },
      { Tipo: 'Ejecutivo', Multiplicador: 1.5 },
      { Tipo: 'Primera Clase', Multiplicador: 2.5 }
    ];
    const wsFlights = XLSX.utils.json_to_sheet(flightsData);
    XLSX.utils.book_append_sheet(wb, wsFlights, 'TiposVuelo');

    // Hoja de Hoteles
    const hotelsData = [
      { Estrellas: 3, PrecioPorNoche: 50 },
      { Estrellas: 4, PrecioPorNoche: 100 },
      { Estrellas: 5, PrecioPorNoche: 200 }
    ];
    const wsHotels = XLSX.utils.json_to_sheet(hotelsData);
    XLSX.utils.book_append_sheet(wb, wsHotels, 'Hoteles');

    // Hoja de Restaurantes
    const restaurantsData = [
      { Estrellas: 3, PrecioPorDia: 30 },
      { Estrellas: 4, PrecioPorDia: 60 },
      { Estrellas: 5, PrecioPorDia: 100 }
    ];
    const wsRestaurants = XLSX.utils.json_to_sheet(restaurantsData);
    XLSX.utils.book_append_sheet(wb, wsRestaurants, 'Restaurantes');

    // Hoja de Transporte
    const transportData = [
      { Estrellas: 3, PrecioPorDia: 40 },
      { Estrellas: 4, PrecioPorDia: 80 },
      { Estrellas: 5, PrecioPorDia: 150 }
    ];
    const wsTransport = XLSX.utils.json_to_sheet(transportData);
    XLSX.utils.book_append_sheet(wb, wsTransport, 'Transporte');

    // Hoja de Actividades
    const activitiesData = [
      { Nombre: 'City Tour', Precio: 50 },
      { Nombre: 'Museo Nacional', Precio: 30 },
      { Nombre: 'Tour Gastronómico', Precio: 80 }
    ];
    const wsActivities = XLSX.utils.json_to_sheet(activitiesData);
    XLSX.utils.book_append_sheet(wb, wsActivities, 'Actividades');

    XLSX.writeFile(wb, 'plantilla_precios.xlsx');
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (!session || !pricingData) {
    return <div className="flex items-center justify-center h-screen">Cargando datos...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Cerrar Sesión
            </button>
          </div>

          {/* Subir archivo */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Subir Archivo Excel</h2>
            <div className="flex flex-col space-y-4">
              <button
                onClick={downloadTemplate}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                📥 Descargar Plantilla Excel
              </button>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>

          {/* Mensaje */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' : 
              message.includes('❌') ? 'bg-red-50 border border-red-200 text-red-800' :
              'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              {message}
            </div>
          )}

          {/* Destinos */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Destinos</h2>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Agregar Nuevo Destino</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre del destino"
                  value={newDestination.name}
                  onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Precio base"
                  value={newDestination.price}
                  onChange={(e) => setNewDestination({ ...newDestination, price: e.target.value })}
                  className="w-32 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={handleAddDestination}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Agregar
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(pricingData.destinations || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="p-4 border rounded-lg flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {key} - Precio Base
                    </label>
                    <input
                      type="number"
                      value={value.basePrice}
                      onChange={(e) => handleInputChange('destinations', key, 'basePrice', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteItem('destinations', key)}
                    className="text-red-500 hover:text-red-700 mt-7"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Orígenes */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Orígenes</h2>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Agregar Nuevo Origen</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre del origen"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={handleAddOrigin}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Agregar
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(pricingData.origins || {}).map((origin) => (
                <div key={origin} className="px-4 py-2 bg-indigo-100 rounded-lg flex items-center gap-2">
                  <span>{origin}</span>
                  <button
                    onClick={() => handleDeleteItem('origins', origin)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tipos de Vuelo */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Tipos de Vuelo</h2>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Agregar Nuevo Tipo de Vuelo</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre del tipo"
                  value={newFlightType.name}
                  onChange={(e) => setNewFlightType({ ...newFlightType, name: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Multiplicador"
                  value={newFlightType.multiplier}
                  onChange={(e) => setNewFlightType({ ...newFlightType, multiplier: e.target.value })}
                  className="w-32 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={handleAddFlightType}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Agregar
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(pricingData.flightTypes || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="p-4 border rounded-lg flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {key} - Multiplicador
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={value.multiplier}
                      onChange={(e) => handleInputChange('flightTypes', key, 'multiplier', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteItem('flightTypes', key)}
                    className="text-red-500 hover:text-red-700 mt-7"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Servicios (hoteles, restaurantes, transporte) */}
          {['hotels', 'restaurants', 'transport'].map(category => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold mb-4 capitalize">
                {category === 'hotels' ? 'Hoteles' : 
                 category === 'restaurants' ? 'Restaurantes' : 'Transporte'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(pricingData[category] || {}).map(([key, value]: [string, any]) => (
                  <div key={key} className="p-4 border rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {'⭐'.repeat(parseInt(key))} - Precio por {category === 'hotels' ? 'Noche' : 'Día'}
                    </label>
                    <input
                      type="number"
                      value={category === 'hotels' ? value.pricePerNight : value.pricePerDay}
                      onChange={(e) => handleInputChange(
                        category, 
                        key, 
                        category === 'hotels' ? 'pricePerNight' : 'pricePerDay', 
                        e.target.value
                      )}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Actividades */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Actividades</h2>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Agregar Nueva Actividad</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre de la actividad"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Precio"
                  value={newActivity.price}
                  onChange={(e) => setNewActivity({ ...newActivity, price: e.target.value })}
                  className="w-32 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={handleAddActivity}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Agregar
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {(pricingData.activities || []).map((activity: any) => (
                <div key={activity.id} className="p-4 border rounded-lg flex gap-2">
                  <input
                    type="text"
                    value={activity.name}
                    onChange={(e) => handleActivityChange(activity.id, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    value={activity.price}
                    onChange={(e) => handleActivityChange(activity.id, 'price', e.target.value)}
                    className="w-32 px-3 py-2 border rounded-lg"
                  />
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Botón de guardar */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '💾 Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
