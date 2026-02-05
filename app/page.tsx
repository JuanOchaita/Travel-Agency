'use client';

import { useState, useEffect } from 'react';

interface Activity {
  id: number;
  name: string;
  price: number;
}

export default function Home() {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    startDate: '',
    endDate: '',
    adults: 1,
    minors: 0,
    flightType: 'Económico',
    rooms: 1,
    hotelStars: '3',
    restaurantStars: '3',
    transportStars: '3',
  });

  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [pricingData, setPricingData] = useState<any>(null);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [activitySearch, setActivitySearch] = useState('');
  const [showActivityModal, setShowActivityModal] = useState(false);

  const flightTypes = ['Económico', 'Ejecutivo', 'Primera Clase'];
  const stars = ['3', '4', '5'];

  useEffect(() => {
    // Cargar datos de precios
    fetch('/api/pricing')
      .then(res => res.json())
      .then(data => {
        setPricingData(data);
      })
      .catch(err => console.error('Error loading pricing:', err));
  }, []);

  useEffect(() => {
    // Calcular noches
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(diffDays);
    }
  }, [formData.startDate, formData.endDate]);

  useEffect(() => {
    // Calcular precio total
    if (pricingData && nights > 0) {
      const totalPeople = formData.adults + formData.minors;
      
      // Precio base del destino
      const destPrice = pricingData.destinations?.[formData.destination]?.basePrice || 0;
      
      // Multiplicador de tipo de vuelo
      const flightMultiplier = pricingData.flightTypes?.[formData.flightType]?.multiplier || 1;
      
      // Precio de vuelo total
      const flightPrice = destPrice * flightMultiplier * totalPeople;
      
      // Precio de hotel
      const hotelPrice = (pricingData.hotels?.[formData.hotelStars]?.pricePerNight || 0) * nights * formData.rooms;
      
      // Precio de restaurantes
      const restaurantPrice = (pricingData.restaurants?.[formData.restaurantStars]?.pricePerDay || 0) * nights * totalPeople;
      
      // Precio de transporte
      const transportPrice = (pricingData.transport?.[formData.transportStars]?.pricePerDay || 0) * nights;
      
      // Precio de actividades seleccionadas
      const activitiesPrice = selectedActivities.reduce((sum, activity) => sum + activity.price, 0);
      
      const total = flightPrice + hotelPrice + restaurantPrice + transportPrice + activitiesPrice;
      setTotalPrice(total);
    }
  }, [formData, nights, pricingData, selectedActivities]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'adults' || name === 'minors' || name === 'rooms' ? parseInt(value) || 0 : value
    }));
  };

  const toggleActivity = (activity: Activity) => {
    setSelectedActivities(prev => {
      const exists = prev.find(a => a.id === activity.id);
      if (exists) {
        return prev.filter(a => a.id !== activity.id);
      } else {
        return [...prev, activity];
      }
    });
  };

  const removeActivity = (activityId: number) => {
    setSelectedActivities(prev => prev.filter(a => a.id !== activityId));
  };

  const filteredActivities = pricingData?.activities?.filter((activity: Activity) =>
    activity.name.toLowerCase().includes(activitySearch.toLowerCase())
  ) || [];

  const countries = pricingData?.origins ? Object.keys(pricingData.origins) : [];
  const destinations = pricingData?.destinations ? Object.keys(pricingData.destinations) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-center">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-600">
              ✈️ TravelQuote
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            Cotiza tu Viaje Perfecto
          </h1>

          <form className="space-y-4 sm:space-y-6">
            {/* Origen y Destino */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origen
                </label>
                <select
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  required
                >
                  <option value="">Selecciona origen</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destino
                </label>
                <select
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  required
                >
                  <option value="">Selecciona destino</option>
                  {destinations.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Noches
                </label>
                <input
                  type="number"
                  value={nights}
                  readOnly
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Personas */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adultos
                </label>
                <input
                  type="number"
                  name="adults"
                  min="1"
                  value={formData.adults}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menores
                </label>
                <input
                  type="number"
                  name="minors"
                  min="0"
                  value={formData.minors}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {/* Tipo de vuelo y habitaciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Vuelo
                </label>
                <select
                  name="flightType"
                  value={formData.flightType}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  required
                >
                  {flightTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Habitaciones
                </label>
                <input
                  type="number"
                  name="rooms"
                  min="1"
                  value={formData.rooms}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {/* Estrellas de servicios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel (Estrellas)
                </label>
                <select
                  name="hotelStars"
                  value={formData.hotelStars}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  required
                >
                  {stars.map(star => (
                    <option key={star} value={star}>{'⭐'.repeat(parseInt(star))}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurantes (Estrellas)
                </label>
                <select
                  name="restaurantStars"
                  value={formData.restaurantStars}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  required
                >
                  {stars.map(star => (
                    <option key={star} value={star}>{'⭐'.repeat(parseInt(star))}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transporte (Estrellas)
              </label>
              <select
                name="transportStars"
                value={formData.transportStars}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                required
              >
                {stars.map(star => (
                  <option key={star} value={star}>{'⭐'.repeat(parseInt(star))}</option>
                ))}
              </select>
            </div>

            {/* Actividades */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actividades
              </label>
              <button
                type="button"
                onClick={() => setShowActivityModal(true)}
                className="w-full px-3 sm:px-4 py-2 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 hover:bg-indigo-50 transition text-sm sm:text-base font-medium"
              >
                + Agregar Actividades
              </button>
              
              {selectedActivities.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedActivities.map(activity => (
                    <div key={activity.id} className="flex items-center justify-between bg-indigo-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-sm sm:text-base">{activity.name}</span>
                        <span className="text-indigo-600 ml-2 text-sm sm:text-base">${activity.price}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeActivity(activity.id)}
                        className="text-red-500 hover:text-red-700 ml-2 text-xl"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Precio Total */}
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
              <div className="bg-indigo-50 rounded-lg p-4 sm:p-6 text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                  Precio Total Estimado
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-indigo-600">
                  ${totalPrice.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  IVA incluido
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center sm:text-left">
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contacto</h3>
              <p className="text-sm sm:text-base text-gray-400">+502 1234-5678</p>
              <p className="text-sm sm:text-base text-gray-400">Guatemala City, GT</p>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Correo</h3>
              <p className="text-sm sm:text-base text-gray-400">info@travelquote.com</p>
              <p className="text-sm sm:text-base text-gray-400">soporte@travelquote.com</p>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Redes Sociales</h3>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 text-sm sm:text-base">
                <a href="#" className="text-gray-400 hover:text-white transition">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white transition">Instagram</a>
                <a href="#" className="text-gray-400 hover:text-white transition">Twitter</a>
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800 text-center text-sm sm:text-base text-gray-400">
            <p>&copy; 2026 TravelQuote. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modal de Actividades */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Seleccionar Actividades</h2>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl"
              >
                ×
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar actividades..."
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
            />

            <div className="space-y-2 sm:space-y-3">
              {filteredActivities.map((activity: Activity) => {
                const isSelected = selectedActivities.some(a => a.id === activity.id);
                return (
                  <div
                    key={activity.id}
                    onClick={() => toggleActivity(activity)}
                    className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600"
                        />
                        <span className="font-medium text-sm sm:text-base">{activity.name}</span>
                      </div>
                      <span className="text-indigo-600 font-semibold text-sm sm:text-base ml-2">
                        ${activity.price}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowActivityModal(false)}
              className="w-full mt-4 sm:mt-6 bg-indigo-600 text-white py-2 sm:py-3 rounded-lg hover:bg-indigo-700 transition font-semibold text-sm sm:text-base"
            >
              Confirmar Selección ({selectedActivities.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
