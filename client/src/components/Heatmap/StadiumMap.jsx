import React, { useState, useEffect, useRef } from 'react';
import { Wrapper } from "@googlemaps/react-wrapper";
import { listenToStadiumState } from '../../firebase';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { MapPin, Navigation, Coffee, Shield } from 'lucide-react';

const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
];

const MapComponent = ({ zones, mode, showRoute, onPlacesFound }) => {
  const ref = useRef(null);
  const [map, setMap] = useState();
  const [directionsRenderer, setDirectionsRenderer] = useState();

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center: { lat: 36.0909, lng: -115.1833 },
        zoom: 17,
        styles: mapStyles,
        disableDefaultUI: true,
        mapTypeId: 'satellite'
      });
      setMap(newMap);
      setDirectionsRenderer(new window.google.maps.DirectionsRenderer({ map: newMap, suppressMarkers: true }));
    }
  }, [ref, map]);

  // Handle Routing (GCP Routes API equivalent in JS SDK)
  useEffect(() => {
    if (!map || !showRoute) {
      if (directionsRenderer) directionsRenderer.setDirections({ routes: [] });
      return;
    }

    const ds = new window.google.maps.DirectionsService();
    ds.route({
      origin: { lat: 36.0895, lng: -115.1833 }, // Parking Lot
      destination: { lat: 36.0915, lng: -115.1833 }, // Gate 1
      travelMode: 'WALKING'
    }, (result, status) => {
      if (status === 'OK') directionsRenderer.setDirections(result);
    });
  }, [map, showRoute, directionsRenderer]);

  // Handle Places Discovery (GCP Places API)
  useEffect(() => {
    if (!map) return;
    const ps = new window.google.maps.places.PlacesService(map);
    ps.nearbySearch({
      location: { lat: 36.0909, lng: -115.1833 },
      radius: 500,
      type: ['restaurant', 'cafe']
    }, (results, status) => {
      if (status === 'OK') onPlacesFound(results.slice(0, 5));
    });
  }, [map]);

  return <div ref={ref} className="w-full h-full rounded-2xl" />;
};

const StadiumMap = ({ mode, highlightZone }) => {
  const [zones, setZones] = useState({});
  const [showRoute, setShowRoute] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  useEffect(() => {
    const unsubscribe = listenToStadiumState((data) => { if (data) setZones(data); });
    const socket = io('/');
    socket.on('stadium-update', (data) => setZones(data));
    return () => { unsubscribe(); socket.disconnect(); };
  }, []);

  const apiKey = ""; // Insert Map Key Here

  return (
    <section className="glass-panel flex-1 rounded-2xl relative overflow-hidden group h-full flex flex-col p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
           <h1 className="headline text-[24px] font-black tracking-tighter text-on-surface">LIVE STADIUM HUD</h1>
           <p className="text-[10px] text-primary-dim uppercase tracking-widest font-bold">Integrated Routes + Places Discovery</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowRoute(!showRoute)}
             className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${showRoute ? 'bg-primary text-black' : 'bg-white/5 text-white border border-white/10'}`}>
             {showRoute ? 'ROUTE ACTIVE' : 'GET DIRECTIONS'}
           </button>
        </div>
      </div>

      <div className="flex-1 relative rounded-xl overflow-hidden border border-white/5 bg-[#0e0e14]">
        {!apiKey ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
             <div className="glass-panel-dark p-6 rounded-2xl border border-primary/30 text-center">
                <MapPin className="text-primary mx-auto mb-2" />
                <h3 className="text-white text-xs font-bold uppercase">Mapping Engine Ready</h3>
                <p className="text-[9px] text-on-surface-variant">Deploy API Key to enable Satellite Routes</p>
             </div>
          </div>
        ) : null}
        
        <Wrapper apiKey={apiKey} version="beta" libraries={["places"]}>
           <MapComponent 
             zones={zones} 
             mode={mode} 
             showRoute={showRoute} 
             onPlacesFound={setNearbyPlaces} 
           />
        </Wrapper>

        {/* Real-time Places HUD */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
           {nearbyPlaces.map((place, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-shrink-0 px-3 py-2 glass-panel-dark rounded-lg border border-white/10 flex items-center gap-2"
              >
                 <Coffee size={12} className="text-primary" />
                 <div className="whitespace-nowrap">
                    <div className="text-[10px] font-bold text-white uppercase">{place.name}</div>
                    <div className="text-[8px] text-on-surface-variant">{place.rating} ★</div>
                 </div>
              </motion.div>
           ))}
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mt-4">
         {['north', 'south', 'east', 'west'].map(name => (
           <div key={name} className="p-2 bg-surface/40 rounded border border-white/5">
              <div className="text-[8px] uppercase text-on-surface-variant font-bold">{name}</div>
              <div className="text-[12px] font-bold text-primary">
                {zones[name]?.occupancy || '--'}%
              </div>
           </div>
         ))}
      </div>
    </section>
  );
};

export default StadiumMap;
