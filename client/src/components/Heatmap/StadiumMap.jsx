import React, { useState, useEffect, useRef } from 'react';
import { Wrapper } from "@googlemaps/react-wrapper";
import { listenToStadiumState } from '../../firebase';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';

const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
];

const MapComponent = ({ zones, mode }) => {
  const ref = useRef(null);
  const [map, setMap] = useState();

  useEffect(() => {
    if (ref.current && !map) {
      try {
        const newMap = new window.google.maps.Map(ref.current, {
          center: { lat: 36.0909, lng: -115.1833 },
          zoom: 17,
          styles: mapStyles,
          disableDefaultUI: true,
          mapTypeId: 'satellite'
        });
        setMap(newMap);
      } catch (err) {
        console.error("Map initialization failed:", err);
      }
    }
  }, [ref, map]);

  useEffect(() => {
    if (!map || !zones) return;
    const zoneCoords = {
      north: { lat: 36.0915, lng: -115.1833 },
      south: { lat: 36.0903, lng: -115.1833 },
      east: { lat: 36.0909, lng: -115.1825 },
      west: { lat: 36.0909, lng: -115.1841 }
    };

    const markers = Object.entries(zoneCoords).map(([key, pos]) => {
      const occupancy = zones[key]?.occupancy || 50;
      const color = occupancy > 90 ? '#ff0000' : occupancy > 70 ? '#ffae00' : '#00f2ff';
      return new window.google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.35,
        map,
        center: pos,
        radius: 30,
      });
    });

    return () => markers.forEach(m => m.setMap(null));
  }, [map, zones, mode]);

  return <div ref={ref} className="w-full h-full rounded-2xl" />;
};

const StadiumMap = ({ mode, highlightZone }) => {
  const [zones, setZones] = useState({
    north: { occupancy: 85, status: 'busy' },
    south: { occupancy: 45, status: 'normal' },
    east: { occupancy: 92, status: 'critical' },
    west: { occupancy: 30, status: 'quiet' }
  });
  const [useFallbackMap, setUseFallbackMap] = useState(false);

  useEffect(() => {
    // Attempt Firestore (GCP)
    const unsubscribe = listenToStadiumState((data) => {
      if (data) setZones(data);
    });
    
    // Also keep Socket.io as a local dev fallback
    const socket = io('/');
    socket.on('stadium-update', (data) => setZones(data));

    return () => {
      unsubscribe();
      socket.disconnect();
    };
  }, []);

  const apiKey = ""; // Insert Map Key Here

  return (
    <section className="glass-panel flex-1 rounded-2xl relative overflow-hidden group h-full flex flex-col p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
           <h1 className="headline text-[24px] font-black tracking-tighter text-on-surface">LIVE STADIUM HUD</h1>
           <p className="text-[10px] text-primary-dim uppercase tracking-widest font-bold">Fused Satellite + AI Heatmap</p>
        </div>
        <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded text-[10px] font-bold text-primary uppercase">GCP Active</div>
      </div>

      <div className="flex-1 relative rounded-xl overflow-hidden border border-white/5 bg-[#0e0e14]">
        {!apiKey ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=36.0909,-115.1833&zoom=16&size=600x400&maptype=satellite&key=')] bg-cover opacity-60">
             <div className="glass-panel-dark p-6 rounded-2xl border border-primary/30 backdrop-blur-xl">
                <span className="material-symbols-outlined text-primary text-4xl mb-2">map</span>
                <h3 className="text-white font-bold mb-1 uppercase tracking-widest text-sm">Satellite Feed Standby</h3>
                <p className="text-[10px] text-on-surface-variant max-w-[200px]">Waiting for Google Maps API Key deployment. HUD active with local simulation.</p>
             </div>
          </div>
        ) : (
          <Wrapper apiKey={apiKey} version="beta" libraries={["places"]}>
             <MapComponent zones={zones} mode={mode} />
          </Wrapper>
        )}
        
        {/* Futursitic HUD Overlay */}
        <div className="absolute top-4 left-4 p-3 glass-panel-dark rounded-lg pointer-events-none border border-primary/20 z-20">
           <div className="text-[9px] text-primary font-bold uppercase mb-1">Global Occupancy</div>
           <div className="text-xl font-bold text-white tracking-widest">78%</div>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mt-4">
         {Object.entries(zones).map(([name, data]) => (
           <div key={name} className="p-2 bg-surface/40 rounded border border-white/5">
              <div className="text-[8px] uppercase text-on-surface-variant font-bold">{name}</div>
              <div className={`text-[12px] font-bold ${data.occupancy > 90 ? 'text-secondary' : 'text-primary'}`}>
                {data.occupancy}%
              </div>
           </div>
         ))}
      </div>
    </section>
  );
};

export default StadiumMap;
