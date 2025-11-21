import { useEffect, useRef } from 'react';

interface Camera {
  id: number;
  name: string;
  address: string;
  status: 'active' | 'inactive' | 'problem';
  lat: number;
  lng: number;
}

interface YandexMapProps {
  cameras: Camera[];
  onCameraClick?: (camera: Camera) => void;
  height?: string;
  clusteringEnabled?: boolean;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

const YandexMap = ({ cameras, onCameraClick, height = '600px', clusteringEnabled = true }: YandexMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const getPlacemarkColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#22c55e';
      case 'inactive':
        return '#ef4444';
      case 'problem':
        return '#eab308';
      default:
        return '#6b7280';
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      if (!window.ymaps) {
        setTimeout(initMap, 100);
        return;
      }

      window.ymaps.ready(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy();
        }

        const map = new window.ymaps.Map(mapRef.current, {
          center: [58.010455, 56.229443],
          zoom: 12,
          controls: ['zoomControl', 'typeSelector', 'fullscreenControl', 'geolocationControl'],
        });

        mapInstanceRef.current = map;

        if (clusteringEnabled && cameras.length > 0) {
          const clusterer = new window.ymaps.Clusterer({
            preset: 'islands#blueClusterIcons',
            clusterDisableClickZoom: false,
            clusterOpenBalloonOnClick: true,
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            clusterBalloonPagerSize: 5,
            clusterBalloonContentLayoutWidth: 300,
            clusterBalloonContentLayoutHeight: 200,
          });

          const placemarks = cameras.map((camera) => {
            const placemark = new window.ymaps.Placemark(
              [camera.lat, camera.lng],
              {
                balloonContentHeader: camera.name,
                balloonContentBody: camera.address,
                balloonContentFooter: `Статус: ${
                  camera.status === 'active' ? 'Активна' : camera.status === 'inactive' ? 'Неактивна' : 'Проблемная'
                }`,
                hintContent: camera.name,
              },
              {
                preset: 'islands#circleDotIcon',
                iconColor: getPlacemarkColor(camera.status),
              }
            );

            placemark.events.add('click', () => {
              if (onCameraClick) {
                onCameraClick(camera);
              }
            });

            return placemark;
          });

          clusterer.add(placemarks);
          map.geoObjects.add(clusterer);
        } else {
          cameras.forEach((camera) => {
            const placemark = new window.ymaps.Placemark(
              [camera.lat, camera.lng],
              {
                balloonContentHeader: camera.name,
                balloonContentBody: camera.address,
                balloonContentFooter: `Статус: ${
                  camera.status === 'active' ? 'Активна' : camera.status === 'inactive' ? 'Неактивна' : 'Проблемная'
                }`,
                hintContent: camera.name,
              },
              {
                preset: 'islands#circleDotIcon',
                iconColor: getPlacemarkColor(camera.status),
              }
            );

            placemark.events.add('click', () => {
              if (onCameraClick) {
                onCameraClick(camera);
              }
            });

            map.geoObjects.add(placemark);
          });
        }
      });
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [cameras, clusteringEnabled, onCameraClick]);

  return <div ref={mapRef} style={{ width: '100%', height }} className="rounded-lg" />;
};

export default YandexMap;
