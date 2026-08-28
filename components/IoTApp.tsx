'use client';

import React from 'react';
import { IoTProvider, useIoT } from '@/context/iot-context';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { FleetView } from '@/components/devices/FleetView';
import { DeviceDetailView } from '@/components/devices/DeviceDetailView';
import { AutomationsView } from '@/components/automations/AutomationsView';
import { AlertsCenter } from '@/components/alerts/AlertsCenter';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { LocationsView } from '@/components/locations/LocationsView';
import { AuditFeed } from '@/components/activity/AuditFeed';
import { MembersView } from '@/components/members/MembersView';
import { ArchitectureDocs } from '@/components/docs/ArchitectureDocs';
import { HardwareSimulatorDrawer } from '@/components/simulator/HardwareSimulatorDrawer';

function MainAppShell() {
  const { activeView, selectedDevice, setSelectedDevice } = useIoT();

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'devices':
        if (selectedDevice) {
          return (
            <DeviceDetailView
              device={selectedDevice}
              onBack={() => setSelectedDevice(null)}
            />
          );
        }
        return <FleetView />;
      case 'automations':
        return <AutomationsView />;
      case 'alerts':
        return <AlertsCenter />;
      case 'analytics':
        return <AnalyticsView />;
      case 'locations':
        return <LocationsView />;
      case 'activity':
        return <AuditFeed />;
      case 'members':
        return <MembersView />;
      case 'docs':
        return <ArchitectureDocs />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 aether-grid-bg relative overflow-x-hidden">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout Container */}
      <div className="flex-1 flex pt-16">
        
        {/* Left Sticky Sidebar */}
        <Sidebar />

        {/* Dynamic Center Stage */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      {/* Embedded ESP32 Hardware Simulator Workbench Drawer */}
      <HardwareSimulatorDrawer />

    </div>
  );
}

export function IoTApp() {
  return (
    <IoTProvider>
      <MainAppShell />
    </IoTProvider>
  );
}
