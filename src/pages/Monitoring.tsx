import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { api, Camera, CameraStats } from '@/lib/api';
import CameraList from '@/components/monitoring/CameraList';
import MapPanel from '@/components/monitoring/MapPanel';
import CameraVideoDialog from '@/components/monitoring/CameraVideoDialog';
import CameraSettingsSheet from '@/components/monitoring/CameraSettingsSheet';

const Monitoring = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [ownerFilter, setOwnerFilter] = useState<string[]>([]);
  const [groupFilter, setGroupFilter] = useState<string[]>([]);
  const [divisionFilter, setDivisionFilter] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [analyticsFilter, setAnalyticsFilter] = useState<string[]>([]);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [stats, setStats] = useState<CameraStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [camerasData, statsData] = await Promise.all([
        api.getCameras(),
        api.getStats()
      ]);
      setCameras(camerasData);
      setStats(statsData);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-red-500';
      case 'problem':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активная';
      case 'inactive':
        return 'Неактивная';
      case 'problem':
        return 'Проблемная';
      default:
        return 'Неизвестно';
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    toast.success(isFullscreen ? 'Обычный режим' : 'Полноэкранный режим');
  };

  const filteredCameras = cameras.filter((camera) => {
    const matchesSearch =
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(camera.status);
    const matchesOwner = ownerFilter.length === 0 || ownerFilter.includes(camera.owner);
    const matchesGroup = groupFilter.length === 0 || groupFilter.includes(camera.group);
    const matchesDivision = divisionFilter.length === 0 || divisionFilter.includes(camera.territorial_division);
    const matchesTag = tagFilter.length === 0 || (camera.tags && tagFilter.some(t => camera.tags.includes(t)));
    const matchesAnalytics = analyticsFilter.length === 0 || (
      (analyticsFilter.includes('face') && camera.face_recognition) ||
      (analyticsFilter.includes('grz') && camera.grz_recognition)
    );
    return matchesSearch && matchesStatus && matchesOwner && matchesGroup && matchesDivision && matchesTag && matchesAnalytics;
  });

  const activeFiltersCount = [
    statusFilter.length > 0,
    ownerFilter.length > 0,
    groupFilter.length > 0,
    divisionFilter.length > 0,
    tagFilter.length > 0,
    analyticsFilter.length > 0,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="bg-background flex items-center justify-center h-96">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-[calc(100vh-8rem)]">
      <CameraList
        cameras={filteredCameras}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        ownerFilter={ownerFilter}
        onOwnerFilterChange={setOwnerFilter}
        groupFilter={groupFilter}
        onGroupFilterChange={setGroupFilter}
        divisionFilter={divisionFilter}
        onDivisionFilterChange={setDivisionFilter}
        tagFilter={tagFilter}
        onTagFilterChange={setTagFilter}
        analyticsFilter={analyticsFilter}
        onAnalyticsFilterChange={setAnalyticsFilter}
        showFilterSheet={showFilterSheet}
        onShowFilterSheetChange={setShowFilterSheet}
        activeFiltersCount={activeFiltersCount}
        getStatusColor={getStatusColor}
        onCameraClick={(camera) => { setSelectedCamera(camera); setShowVideoDialog(true); }}
      />

      <MapPanel
        cameras={filteredCameras}
        clusteringEnabled={clusteringEnabled}
        isFullscreen={isFullscreen}
        onClusteringToggle={() => setClusteringEnabled(!clusteringEnabled)}
        onFullscreenToggle={handleFullscreen}
        onCameraClick={(camera) => { setSelectedCamera(camera); setShowVideoDialog(true); }}
      />

      <CameraVideoDialog
        camera={selectedCamera}
        open={showVideoDialog}
        onOpenChange={setShowVideoDialog}
        onOpenSettings={() => setShowSettingsSheet(true)}
        getStatusColor={getStatusColor}
        getStatusLabel={getStatusLabel}
      />

      <CameraSettingsSheet
        camera={selectedCamera}
        open={showSettingsSheet}
        onOpenChange={setShowSettingsSheet}
      />
    </div>
  );
};

export default Monitoring;
