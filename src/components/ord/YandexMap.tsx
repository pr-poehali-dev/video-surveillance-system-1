import { useEffect, useRef } from 'react';

interface MapPoint {
  lat: number;
  lng: number;
  label: string;
  time: string;
}

interface YandexMapProps {
  points: MapPoint[];
}

type YMaps = {
  ready: (cb: () => void) => void;
  Map: new (el: HTMLElement | null, opts: object) => YMap;
  Placemark: new (coords: number[], props: object, opts: object) => YGeoObject;
  Polyline: new (coords: number[][], props: object, opts: object) => YGeoObject;
};

type YMap = {
  geoObjects: { add: (o: YGeoObject) => void; getBounds: () => number[][] | null };
  setBounds: (b: number[][], opts: object) => void;
  destroy: () => void;
};

type YGeoObject = object;

declare global {
  interface Window { ymaps: YMaps; }
}

export const YandexMap = ({ points }: YandexMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<YMap | null>(null);
  const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY;

  useEffect(() => {
    if (!mapRef.current) return;

    const scriptId = 'yandex-maps-script';
    const initMap = () => {
      window.ymaps.ready(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy();
        }

        const center = points.length > 0
          ? [points[0].lat, points[0].lng]
          : [56.8389, 60.6057];

        const map = new window.ymaps.Map(mapRef.current, {
          center,
          zoom: 14,
          controls: ['zoomControl'],
        });

        mapInstanceRef.current = map;

        const placemarks = points.map((point, index) =>
          new window.ymaps.Placemark(
            [point.lat, point.lng],
            {
              balloonContent: `<b>${point.label}</b><br/>${point.time}`,
              iconContent: String(index + 1),
            },
            { preset: 'islands#redCircleIcon' }
          )
        );

        placemarks.forEach(pm => map.geoObjects.add(pm));

        if (points.length > 1) {
          const coords = points.map(p => [p.lat, p.lng]);
          const polyline = new window.ymaps.Polyline(coords, {}, {
            strokeColor: '#ef4444',
            strokeWidth: 2,
            strokeStyle: 'dash',
          });
          map.geoObjects.add(polyline);

          const bounds = map.geoObjects.getBounds();
          if (bounds) map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 40 });
        }
      });
    };

    if (window.ymaps) {
      initMap();
    } else if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.ymaps) { clearInterval(interval); initMap(); }
      }, 100);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [points, apiKey]);

  if (!apiKey) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted rounded-lg text-muted-foreground gap-2">
        <span className="text-2xl">🗺️</span>
        <p className="text-sm">API-ключ Яндекс.Карт не задан</p>
        <p className="text-xs">Добавьте VITE_YANDEX_MAPS_API_KEY в секреты проекта</p>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
};
