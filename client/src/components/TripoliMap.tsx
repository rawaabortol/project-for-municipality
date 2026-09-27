import React, { useEffect, useRef, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import { Report, Cluster, Alert } from '../../utils/sampleData';
import { getRiskColor, getStatusBadge, formatDateTime } from '../../utils/helper';
import { TRIPOLI_COORDINATES, TRIPOLI_DISTRICTS } from '../../utils/APIConst';
import { useLanguage } from '../../context/LanguageContext';
import { useDismissOnBlurOrOutside } from '../utils/useDismissOnBlurOrOutside';
import {
  Filter,
  Layers,
  Navigation,
  ZoomIn,
  AlertCircle,
  MapPin,
  Activity,
  TrendingUp,
  Users,
  ShieldAlert,
  X,
  Radio,
  FileText,
  Compass,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { SkeletonMap } from './common/Skeleton';

// Base Tile Layer Configurations for Leaflet (No API Key Required)
const TILE_PROVIDERS = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abc',
    maxZoom: 19
  },
  streets: {
    name: 'Tripoli Streets',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Street Map',
    subdomains: '',
    maxZoom: 19
  },
  dark: {
    name: 'Surveillance Dark',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Dark Canvas',
    subdomains: '',
    maxZoom: 16
  },
  satellite: {
    name: 'Satellite Aerial',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Satellite View',
    subdomains: '',
    maxZoom: 18
  },
  voyager: {
    name: 'Tripoli Streets',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Street Map',
    subdomains: '',
    maxZoom: 19
  }
};

// Approximate Municipal District Coordinates and Boundaries in Greater Tripoli
const DISTRICT_BOUNDS: Record<string, { center: [number, number]; polygon: [number, number][] }> = {
  'Al-Mina': {
    center: [34.4518, 35.8198],
    polygon: [
      [34.4590, 35.8100],
      [34.4580, 35.8300],
      [34.4480, 35.8320],
      [34.4440, 35.8230],
      [34.4460, 35.8120]
    ]
  },
  'Al-Tal': {
    center: [34.4362, 35.8441],
    polygon: [
      [34.4395, 35.8410],
      [34.4395, 35.8475],
      [34.4330, 35.8480],
      [34.4325, 35.8415]
    ]
  },
  'Bab Al-Tabbaneh': {
    center: [34.4442, 35.8504],
    polygon: [
      [34.4480, 35.8460],
      [34.4475, 35.8550],
      [34.4405, 35.8540],
      [34.4410, 35.8465]
    ]
  },
  'Jabal Mohsen': {
    center: [34.4468, 35.8562],
    polygon: [
      [34.4510, 35.8540],
      [34.4505, 35.8620],
      [34.4435, 35.8610],
      [34.4435, 35.8545]
    ]
  },
  'Abu Samra': {
    center: [34.4221, 35.8482],
    polygon: [
      [34.4280, 35.8420],
      [34.4275, 35.8560],
      [34.4150, 35.8540],
      [34.4160, 35.8410]
    ]
  },
  'Al-Qobbeh': {
    center: [34.4378, 35.8612],
    polygon: [
      [34.4420, 35.8560],
      [34.4410, 35.8690],
      [34.4310, 35.8680],
      [34.4315, 35.8565]
    ]
  },
  'Dam w Farez': {
    center: [34.4285, 35.8324],
    polygon: [
      [34.4335, 35.8270],
      [34.4330, 35.8370],
      [34.4240, 35.8360],
      [34.4245, 35.8260]
    ]
  },
  'Beddawi': {
    center: [34.4612, 35.8640],
    polygon: [
      [34.4680, 35.8580],
      [34.4670, 35.8710],
      [34.4540, 35.8690],
      [34.4550, 35.8570]
    ]
  },
  'Zahrieh': {
    center: [34.4412, 35.8415],
    polygon: [
      [34.4445, 35.8375],
      [34.4440, 35.8450],
      [34.4380, 35.8445],
      [34.4385, 35.8370]
    ]
  }
};

interface TripoliMapProps {
  reports: Report[];
  clusters?: Cluster[];
  alerts?: Alert[];
  onSelectReport?: (report: Report) => void;
  selectedReportId?: string;
  isPickerMode?: boolean;
  onLocationPicked?: (coords: { lat: number; lng: number; address: string; district: string }) => void;
  heightClass?: string;
}

export const TripoliMap: React.FC<TripoliMapProps> = ({
  reports,
  clusters = [],
  alerts = [],
  onSelectReport,
  selectedReportId,
  isPickerMode = false,
  onLocationPicked,
  heightClass
}) => {
  const {
    t,
    translateCategory,
    translateDistrict,
    translateStatus,
    translateRisk,
    translateTitle,
    translateCluster,
    language,
    isRtl
  } = useLanguage();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const clustersLayerRef = useRef<L.LayerGroup | null>(null);
  const districtsLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // States
  const [isMapLoading, setIsMapLoading] = useState<boolean>(true);
  const [baseTileTheme, setBaseTileTheme] = useState<'osm' | 'streets' | 'dark' | 'satellite' | 'voyager'>('osm');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showClusters, setShowClusters] = useState<boolean>(true);
  const [showDistricts, setShowDistricts] = useState<boolean>(true);
  const [selectedDistrictAnalysis, setSelectedDistrictAnalysis] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMapLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss district drawer on blur or click outside
  const districtDrawerRef = useDismissOnBlurOrOutside<HTMLDivElement>({
    isOpen: !!selectedDistrictAnalysis,
    onDismiss: () => setSelectedDistrictAnalysis(null)
  });

  // Area Analysis Computation
  const districtReports = selectedDistrictAnalysis
    ? reports.filter(r => r.location.district.toLowerCase() === selectedDistrictAnalysis.toLowerCase())
    : [];

  const districtCriticalCount = districtReports.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH').length;
  const districtAffectedCount = districtReports.reduce((acc, r) => acc + (r.affectedCount || 0), 0);
  const districtAlerts = selectedDistrictAnalysis
    ? alerts.filter(a => a.area?.toLowerCase() === selectedDistrictAnalysis.toLowerCase() && a.status === 'ACTIVE')
    : [];

  const categoryCounts: Record<string, number> = {};
  districtReports.forEach(r => {
    categoryCounts[r.category.name] = (categoryCounts[r.category.name] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Helper to determine district from coordinates
  const estimateDistrictFromCoords = (lat: number, lng: number): string => {
    let closestDistrict = 'Al-Tal';
    let minDistance = Infinity;

    for (const [distName, data] of Object.entries(DISTRICT_BOUNDS)) {
      const dist = Math.hypot(lat - data.center[0], lng - data.center[1]);
      if (dist < minDistance) {
        minDistance = dist;
        closestDistrict = distName;
      }
    }

    if (minDistance > 0.05) {
      if (lat > 34.455) return 'Beddawi';
      if (lng < 35.83) return 'Al-Mina';
      if (lat < 34.43) return 'Abu Samra';
    }

    return closestDistrict;
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // If map already exists on this container, clean it up before creating new instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [TRIPOLI_COORDINATES.lat, TRIPOLI_COORDINATES.lng],
      zoom: TRIPOLI_COORDINATES.zoom || 13,
      zoomControl: false,
      attributionControl: false
    });

    // Custom positioned zoom control
    L.control.zoom({
      position: isRtl ? 'bottomleft' : 'bottomright'
    }).addTo(map);

    // Initial tile layer
    const provider = TILE_PROVIDERS[baseTileTheme] || TILE_PROVIDERS.osm;
    const tileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      subdomains: provider.subdomains || 'abc',
      maxZoom: provider.maxZoom || 19,
      errorTileUrl: 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Groups for layers
    const districtsGroup = L.layerGroup().addTo(map);
    const clustersGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);

    districtsLayerRef.current = districtsGroup;
    clustersLayerRef.current = clustersGroup;
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Handle Location Picker Mode
    if (isPickerMode) {
      // Default pin in Tripoli center or picked
      const initialPinIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div style="
            background: linear-gradient(135deg, #0d9488, #10b981);
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid #ffffff;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="transform: rotate(45deg); width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const pickerMarker = L.marker([TRIPOLI_COORDINATES.lat, TRIPOLI_COORDINATES.lng], {
        icon: initialPinIcon,
        draggable: true
      }).addTo(map);

      pickerMarkerRef.current = pickerMarker;

      const notifyCoords = (lat: number, lng: number) => {
        const district = estimateDistrictFromCoords(lat, lng);
        if (onLocationPicked) {
          onLocationPicked({
            lat: Number(lat.toFixed(5)),
            lng: Number(lng.toFixed(5)),
            address: `Pinpoint in ${district}, Greater Tripoli`,
            district
          });
        }
      };

      pickerMarker.on('dragend', () => {
        const { lat, lng } = pickerMarker.getLatLng();
        notifyCoords(lat, lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        pickerMarker.setLatLng([lat, lng]);
        notifyCoords(lat, lng);
      });
    } else {
      map.on('click', () => {
        setSelectedDistrictAnalysis(null);
      });
    }

    // Leaflet resize observer to keep tiles aligned
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isPickerMode, isRtl]);

  // 2. Switch Leaflet Tile Layer when baseTileTheme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const provider = TILE_PROVIDERS[baseTileTheme] || TILE_PROVIDERS.osm;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      subdomains: provider.subdomains || 'abc',
      maxZoom: provider.maxZoom || 19,
      errorTileUrl: 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [baseTileTheme]);

  // 3. Render Municipal District Boundaries & Zones
  useEffect(() => {
    if (!districtsLayerRef.current || !mapInstanceRef.current) return;
    districtsLayerRef.current.clearLayers();

    if (!showDistricts) return;

    Object.entries(DISTRICT_BOUNDS).forEach(([districtName, data]) => {
      const isSelected = selectedDistrictAnalysis === districtName;

      // Count critical reports in this district to color polygon
      const critReports = reports.filter(
        r => r.location.district.toLowerCase() === districtName.toLowerCase() &&
        (r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH')
      ).length;

      const strokeColor = isSelected ? '#14b8a6' : critReports > 2 ? '#f43f5e' : '#0284c7';
      const fillColor = isSelected ? '#14b8a6' : critReports > 2 ? '#f43f5e' : '#0284c7';
      const fillOpacity = isSelected ? 0.35 : critReports > 2 ? 0.18 : 0.08;

      const polygon = L.polygon(data.polygon, {
        color: strokeColor,
        weight: isSelected ? 2.5 : 1.5,
        opacity: 0.8,
        fillColor,
        fillOpacity,
        dashArray: isSelected ? undefined : '4, 4',
        // In the report form's location picker, clicks must reach the map to move the pin
        interactive: !isPickerMode
      });

      if (isPickerMode) {
        districtsLayerRef.current?.addLayer(polygon);
        return;
      }

      // Tooltip on district
      polygon.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px; font-weight: 700; color: #f8fafc;">
          ${translateDistrict(districtName)}
        </div>`,
        { sticky: true, className: 'leaflet-district-tooltip' }
      );

      polygon.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedDistrictAnalysis(prev => prev === districtName ? null : districtName);
        mapInstanceRef.current?.flyTo(data.center, 15, { duration: 0.8 });
      });

      polygon.on('mouseover', () => {
        polygon.setStyle({
          weight: 2.5,
          fillOpacity: 0.28,
          color: '#2dd4bf'
        });
      });

      polygon.on('mouseout', () => {
        if (selectedDistrictAnalysis !== districtName) {
          polygon.setStyle({
            weight: 1.5,
            fillOpacity,
            color: strokeColor
          });
        }
      });

      districtsLayerRef.current?.addLayer(polygon);
    });
  }, [reports, showDistricts, selectedDistrictAnalysis, language, isPickerMode]);

  // 4. Render Incident Markers & Outbreak Cluster Circles
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !clustersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    clustersLayerRef.current.clearLayers();

    // A. Cluster Outbreak Circles
    if (showClusters && clusters.length > 0) {
      clusters.forEach(cls => {
        const isCrit = cls.riskLevel === 'CRITICAL';
        const circle = L.circle([cls.centroid.lat, cls.centroid.lng], {
          radius: cls.radiusMeters || 750,
          color: isCrit ? '#f43f5e' : '#f97316',
          fillColor: isCrit ? '#f43f5e' : '#ea580c',
          fillOpacity: isCrit ? 0.22 : 0.14,
          weight: 2,
          dashArray: '6, 6'
        });

        const localizedClusterCategory = translateCluster(cls.categoryName);
        const localizedClusterDistrict = translateDistrict(cls.district);

        const clusterPopup = `
          <div style="font-family: ${isRtl ? "'Cairo', sans-serif" : "system-ui, sans-serif"}; font-size: 11px; width: 220px; direction: ${isRtl ? 'rtl' : 'ltr'}; text-align: ${isRtl ? 'right' : 'left'};">
            <div style="display: flex; align-items: center; gap: 6px; font-weight: 800; color: #f43f5e; margin-bottom: 3px;">
              <span>⚠️</span>
              <span>${language === 'ar' ? 'بؤرة ترصد وبائي نشطة' : 'ACTIVE SURVEILLANCE CLUSTER'}</span>
            </div>
            <div style="font-weight: 800; color: #ffffff; font-size: 13px; margin-bottom: 4px;">${localizedClusterCategory}</div>
            <div style="background: rgba(30, 41, 59, 0.8); padding: 8px; border-radius: 8px; border: 1px solid rgba(71, 85, 105, 0.6); color: #cbd5e1; line-height: 1.6;">
              <div><strong>${language === 'ar' ? 'المنطقة:' : 'Area:'}</strong> ${localizedClusterDistrict}</div>
              <div><strong>${language === 'ar' ? 'البلاغات المرتبطة:' : 'Incidents:'}</strong> ${cls.reportCount} ${language === 'ar' ? 'حالات مسجلة' : 'logged cases'}</div>
              <div><strong>${language === 'ar' ? 'المتضررين التقديري:' : 'Est. Affected:'}</strong> ~${cls.totalAffected} ${t('citizens')}</div>
              <div><strong>${language === 'ar' ? 'درجة الخطورة:' : 'Risk Tier:'}</strong> <span style="color: ${isCrit ? '#f43f5e' : '#fb923c'}; font-weight: 700;">${cls.riskLevel}</span></div>
            </div>
          </div>
        `;
        circle.bindPopup(clusterPopup);
        clustersLayerRef.current?.addLayer(circle);
      });
    }

    // B. Incident Markers
    const filteredReports = reports.filter(r => {
      if (!r.location?.lat || !r.location?.lng) return false;
      if (selectedRisk !== 'ALL' && r.riskLevel !== selectedRisk) return false;
      if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
      if (selectedCategory !== 'ALL' && r.category.name !== selectedCategory) return false;
      return true;
    });

    filteredReports.forEach(rep => {
      const colors = getRiskColor(rep.riskLevel);
      const isSelected = selectedReportId === rep.id;
      const isCritical = rep.riskLevel === 'CRITICAL';

      // Custom Leaflet DivIcon
      const markerHtml = `
        <div class="${isCritical ? 'leaflet-pulsing-marker' : ''}" style="
          background-color: ${colors.pinColor};
          width: ${isSelected ? '26px' : '20px'};
          height: ${isSelected ? '26px' : '20px'};
          border-radius: 50%;
          border: ${isSelected ? '3px solid #2dd4bf' : '2px solid #ffffff'};
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          ${
            isSelected
              ? '<div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>'
              : isCritical
              ? '<div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>'
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: `custom-health-pin-${rep.id}`,
        html: markerHtml,
        iconSize: [isSelected ? 26 : 20, isSelected ? 26 : 20],
        iconAnchor: [isSelected ? 13 : 10, isSelected ? 13 : 10]
      });

      const marker = L.marker([rep.location.lat, rep.location.lng], { icon: customIcon });

      const localizedTitle = translateTitle(rep.title, rep.category.name, rep.location.district);
      const localizedCategory = translateCategory(rep.category.name);
      const localizedDistrict = translateDistrict(rep.location.district);
      const localizedRisk = translateRisk(rep.riskLevel);
      const localizedStatus = translateStatus(rep.status);

      // Dark-themed Leaflet Popup
      const popupHtml = `
        <div style="font-family: ${isRtl ? "'Cairo', sans-serif" : "system-ui, sans-serif"}; font-size: 12px; width: 240px; direction: ${isRtl ? 'rtl' : 'ltr'}; text-align: ${isRtl ? 'right' : 'left'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-family: monospace; font-weight: 700; color: #2dd4bf; font-size: 11px;">#${rep.reportNumber}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: ${colors.pinColor}; color: white;">
              ${localizedRisk} (${rep.riskScore}/100)
            </span>
          </div>
          <div style="font-weight: 700; color: #ffffff; margin-bottom: 4px; font-size: 13px; line-height: 1.3;">${localizedTitle}</div>
          <div style="color: #94a3b8; font-size: 10px; margin-bottom: 6px;">
            📍 ${localizedDistrict} • ${formatDateTime(rep.incidentDate)}
          </div>
          <div style="background: rgba(30, 41, 59, 0.85); padding: 7px 9px; border-radius: 8px; border: 1px solid rgba(51, 65, 85, 0.7); margin-bottom: 8px; font-size: 11px; color: #e2e8f0; line-height: 1.5;">
            <div><strong>${language === 'ar' ? 'الفئة:' : 'Category:'}</strong> <span style="color: #2dd4bf;">${localizedCategory}</span></div>
            <div><strong>${language === 'ar' ? 'المتضررين التقديري:' : 'Affected:'}</strong> ~${rep.affectedCount} ${t('people')}</div>
            <div><strong>${language === 'ar' ? 'الحالة الراهنة:' : 'Status:'}</strong> ${localizedStatus}</div>
          </div>
          <button id="leaflet-btn-inspect-${rep.id}" style="
            width: 100%;
            background: linear-gradient(135deg, #0d9488, #10b981);
            color: white;
            border: none;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 700;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(13, 148, 136, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          ">
            <span>${t('inspectManage')}</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`leaflet-btn-inspect-${rep.id}`);
        if (btn && onSelectReport) {
          btn.onclick = (e) => {
            e.stopPropagation();
            onSelectReport(rep);
          };
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [reports, clusters, selectedRisk, selectedStatus, selectedCategory, showClusters, selectedReportId, onSelectReport, language, isRtl]);

  // Leaflet controls helpers
  const handleRecenter = () => {
    mapInstanceRef.current?.flyTo([TRIPOLI_COORDINATES.lat, TRIPOLI_COORDINATES.lng], TRIPOLI_COORDINATES.zoom || 13, {
      duration: 1.2
    });
  };

  const handleSelectDistrict = (districtName: string) => {
    const data = DISTRICT_BOUNDS[districtName];
    if (data && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(data.center, 15, { duration: 1 });
      setSelectedDistrictAnalysis(prev => prev === districtName ? null : districtName);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  // Resize Leaflet after entering/leaving fullscreen; Escape exits fullscreen
  useEffect(() => {
    const timer = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 50);
    if (!isFullscreen) return () => clearTimeout(timer);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isFullscreen]);

  const categories = Array.from(new Set(reports.map(r => r.category.name)));

  const effectiveHeight = heightClass || (isPickerMode ? 'h-64 sm:h-72' : 'h-[460px] sm:h-[540px] lg:h-[600px]');

  return (
    <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-[70] rounded-none h-full' : `relative ${effectiveHeight} rounded-2xl`} overflow-hidden border border-slate-700 shadow-2xl bg-slate-950 flex flex-col transition-all duration-300`}>
      {/* Top Filter and Controls Bar */}
      <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 py-2.5 z-10 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          {/* Leaflet Attribution badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30 text-[10px] font-bold">
            <Radio className="w-3 h-3 text-teal-400 animate-pulse" />
            <span>Leaflet GIS</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            {t('filters')}
          </div>

          {/* Risk Level Filter */}
          <select
            value={selectedRisk}
            onChange={e => setSelectedRisk(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-teal-500 text-xs"
          >
            <option value="ALL">{t('allRisks')}</option>
            <option value="CRITICAL">{translateRisk('CRITICAL')} (76-100)</option>
            <option value="HIGH">{translateRisk('HIGH')} (51-75)</option>
            <option value="MEDIUM">{translateRisk('MEDIUM')} (26-50)</option>
            <option value="LOW">{translateRisk('LOW')} (0-25)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-teal-500 text-xs"
          >
            <option value="ALL">{t('allStatuses')}</option>
            <option value="SUBMITTED">{translateStatus('SUBMITTED')}</option>
            <option value="UNDER_REVIEW">{translateStatus('UNDER_REVIEW')}</option>
            <option value="VERIFIED">{translateStatus('VERIFIED')}</option>
            <option value="IN_INVESTIGATION">{translateStatus('IN_INVESTIGATION')}</option>
            <option value="RESOLVED">{translateStatus('RESOLVED')}</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-teal-500 max-w-[160px] text-xs"
          >
            <option value="ALL">{t('allCategories')}</option>
            {categories.map(c => (
              <option key={c} value={c}>{translateCategory(c)}</option>
            ))}
          </select>

          {/* Cluster Layer Toggle */}
          <button
            onClick={() => setShowClusters(!showClusters)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-semibold ${
              showClusters
                ? 'bg-rose-950/50 border-rose-600/70 text-rose-300 shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{t('clustersToggle')} ({clusters.length})</span>
          </button>

          {/* Municipal Sectors Polygon Toggle */}
          <button
            onClick={() => setShowDistricts(!showDistricts)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-semibold ${
              showDistricts
                ? 'bg-teal-950/50 border-teal-600/70 text-teal-300 shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'أحياء طرابلس' : 'Districts'}</span>
          </button>
        </div>

        {/* Right Tools: Tile Switcher, Recenter & Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Base Tile Selector */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setBaseTileTheme('osm')}
              title={language === 'ar' ? 'خريطة الشوارع المفتوحة' : 'OpenStreetMap Standard'}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                baseTileTheme === 'osm' ? 'bg-teal-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              OSM
            </button>
            <button
              onClick={() => setBaseTileTheme('streets')}
              title={language === 'ar' ? 'خريطة شوارع طرابلس' : 'Tripoli Streets'}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                baseTileTheme === 'streets' || baseTileTheme === 'voyager' ? 'bg-teal-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? 'شوارع' : 'Streets'}
            </button>
            <button
              onClick={() => setBaseTileTheme('dark')}
              title={language === 'ar' ? 'النمط الليلي' : 'Night Surveillance Dark'}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                baseTileTheme === 'dark' ? 'bg-teal-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? 'داكن' : 'Dark'}
            </button>
            <button
              onClick={() => setBaseTileTheme('satellite')}
              title={language === 'ar' ? 'صور الأقمار الصناعية' : 'Satellite Imagery'}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                baseTileTheme === 'satellite' ? 'bg-teal-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? 'أقمار' : 'Satellite'}
            </button>
          </div>

          {/* Recenter Tripoli */}
          <button
            onClick={handleRecenter}
            title={language === 'ar' ? 'إعادة ضبط الخريطة إلى وسط طرابلس' : 'Recenter on Greater Tripoli'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <Compass className="w-4 h-4 text-teal-400" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sub-bar: District Teleport & Quick Analytics */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto text-[11px] z-10">
        <span className="text-slate-400 font-bold text-[10px] uppercase shrink-0">
          {language === 'ar' ? 'انتقال سريع:' : 'Quick Focus:'}
        </span>
        {Object.keys(DISTRICT_BOUNDS).map(distName => (
          <button
            key={distName}
            onClick={() => handleSelectDistrict(distName)}
            className={`px-2 py-0.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
              selectedDistrictAnalysis === distName
                ? 'bg-teal-600 text-white shadow'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {translateDistrict(distName)}
          </button>
        ))}
      </div>

      {/* Leaflet Map Root Container */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className={`absolute bottom-16 ${isRtl ? 'left-4' : 'right-4'} z-[75] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/95 hover:bg-slate-800 border border-teal-500/60 text-teal-200 text-xs font-bold shadow-2xl transition-colors`}
          title={language === 'ar' ? 'الخروج من ملء الشاشة (Esc)' : 'Exit fullscreen (Esc)'}
        >
          <Minimize2 className="w-4 h-4" />
          <span>{language === 'ar' ? 'تصغير الخريطة' : 'Exit Fullscreen'}</span>
        </button>
      )}

      <div ref={mapContainerRef} className="flex-1 w-full h-full relative z-0">
        {isMapLoading && (
          <div className="absolute inset-0 z-30 pointer-events-none">
            <SkeletonMap height="h-full" className="rounded-none border-0" />
          </div>
        )}
      </div>

      {/* Area Public Health Deep Profile Drawer */}
      {selectedDistrictAnalysis && createPortal(
        <div
          ref={districtDrawerRef}
          tabIndex={-1}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setSelectedDistrictAnalysis(null);
            }
          }}
          className={`fixed top-20 max-h-[calc(100vh-6rem)] inset-x-3 sm:inset-x-auto ${
            isRtl ? 'sm:left-4' : 'sm:right-4'
          } z-[80] w-auto sm:w-96 max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-4 text-slate-100 animate-in fade-in zoom-in-95 overflow-y-auto space-y-3.5 focus:outline-none`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  {translateDistrict(selectedDistrictAnalysis)}
                </h3>
                <p className="text-[10px] text-teal-400 font-mono">
                  {language === 'ar' ? 'الملف الصحي والبيئي للمنطقة' : 'District Public Health Profile'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedDistrictAnalysis(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Key District Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'إجمالي البلاغات' : 'Total Reports'}</span>
              <span className="text-lg font-bold text-white font-mono">{districtReports.length}</span>
            </div>

            <div className="p-2.5 bg-rose-950/30 rounded-xl border border-rose-800/50">
              <span className="text-[10px] text-rose-300 block">{language === 'ar' ? 'حالات حرجة / مرتفعة' : 'Critical/High Risk'}</span>
              <span className="text-lg font-bold text-rose-400 font-mono">{districtCriticalCount}</span>
            </div>

            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'المتضررين التقديري' : 'Affected People'}</span>
              <span className="text-lg font-bold text-teal-300 font-mono">~{districtAffectedCount}</span>
            </div>

            <div className="p-2.5 bg-amber-950/30 rounded-xl border border-amber-800/50">
              <span className="text-[10px] text-amber-300 block">{language === 'ar' ? 'إنذارات نشطة' : 'Active Alerts'}</span>
              <span className="text-lg font-bold text-amber-400 font-mono">{districtAlerts.length}</span>
            </div>
          </div>

          {/* Most Common Incident Categories */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span>{language === 'ar' ? 'أبرز المشاكل الصحية المتكررة' : 'Most Common Incident Categories'}</span>
              <span className="text-[10px] text-slate-400">{topCategories.length} {language === 'ar' ? 'فئات' : 'categories'}</span>
            </div>

            {topCategories.map(([catName, count]) => {
              const pct = districtReports.length > 0 ? Math.round((count / districtReports.length) * 100) : 0;
              return (
                <div key={catName} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-300 font-medium truncate">{translateCategory(catName)}</span>
                    <span className="text-teal-400 font-mono font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Epidemiological Trend Over Time */}
          <div className="p-2.5 bg-slate-800/70 border border-slate-700/60 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-200 text-[11px]">
              <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
              <span>{language === 'ar' ? 'مؤشر المنحنى الوبائي لآخر 7 أيام' : '7-Day Epidemiological Trend'}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {districtReports.length > 5
                ? language === 'ar'
                  ? 'نشاط وبائي مرتفع مع تركيز ملحوظ في بلاغات تلوث المياه وشبكات الصرف.'
                  : 'Elevated surveillance activity with localized concentration in water & sanitation.'
                : language === 'ar'
                  ? 'استقرار عام في مستويات الخطورة مع بلاغات فردية تحت المتابعة الميدانية.'
                  : 'Stable baseline incidence with sporadic complaints under routine field observation.'}
            </p>
          </div>
        </div>
      , document.body)}

      {/* Legend Footer */}
      <div className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-xl text-xs flex flex-wrap items-center gap-3 text-slate-300 shadow-xl pointer-events-auto`}>
        <div className="font-semibold text-slate-400 text-[10px] uppercase">{t('legendTitle')}:</div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block shadow-sm animate-pulse"></span>
          <span>{translateRisk('CRITICAL')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-sm"></span>
          <span>{translateRisk('HIGH')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm"></span>
          <span>{translateRisk('MEDIUM')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
          <span>{translateRisk('LOW')}</span>
        </div>
      </div>
    </div>
  );
};
