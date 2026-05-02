import { useState } from 'react';
import { Watch, Smartphone, Radio, Bluetooth, Check, ChevronRight, Signal, Wifi, X } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: 'watch' | 'ring' | 'band' | 'phone';
  brand: string;
  connected: boolean;
  battery?: number;
  lastSync?: string;
}

const deviceIcons: Record<string, React.ReactNode> = {
  watch: <Watch className="w-5 h-5" />,
  ring: <Radio className="w-5 h-5" />,
  band: <Signal className="w-5 h-5" />,
  phone: <Smartphone className="w-5 h-5" />,
};

const mockDevices: Device[] = [
  { id: '1', name: 'Apple Watch Series 10', type: 'watch', brand: 'Apple', connected: true, battery: 72, lastSync: '2 min ago' },
  { id: '2', name: 'Oura Ring Gen 4', type: 'ring', brand: 'Oura', connected: false, lastSync: undefined },
  { id: '3', name: 'Whoop 5.0', type: 'band', brand: 'Whoop', connected: false, lastSync: undefined },
  { id: '4', name: 'Withings Body+ Scale', type: 'band', brand: 'Withings', connected: false, lastSync: undefined },
];

const availableDevices: { name: string; type: string }[] = [
  { name: 'Garmin Forerunner', type: 'watch' },
  { name: 'Fitbit Charge 6', type: 'band' },
  { name: 'Samsung Galaxy Ring', type: 'ring' },
  { name: 'Polar Vantage V3', type: 'watch' },
];

const WearableSettings = () => {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [scanning, setScanning] = useState(false);
  const [showAvailable, setShowAvailable] = useState(false);

  const toggleConnect = (id: string) => {
    setDevices(prev => prev.map(d =>
      d.id === id ? { ...d, connected: !d.connected, lastSync: !d.connected ? 'Just now' : d.lastSync, battery: !d.connected ? Math.round(50 + Math.random() * 45) : d.battery } : d
    ));
  };

  const handleScan = () => {
    setScanning(true);
    setShowAvailable(false);
    setTimeout(() => {
      setScanning(false);
      setShowAvailable(true);
    }, 2000);
  };

  const handleAddDevice = (name: string, type: string) => {
    const newDevice: Device = {
      id: String(Date.now()),
      name,
      type: type as Device['type'],
      brand: name.split(' ')[0],
      connected: true,
      battery: Math.round(60 + Math.random() * 35),
      lastSync: 'Just now',
    };
    setDevices(prev => [...prev, newDevice]);
    setShowAvailable(false);
  };

  const removeDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Wearable Devices</h2>
        <p className="text-xs text-stone-900/40 mt-1">Pair your watch, ring, or fitness band to sync data automatically.</p>
      </div>

      {/* Connected / saved devices */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-900/50 mb-3">Your Devices</h3>
        <div className="space-y-2">
          {devices.map((device) => (
            <div key={device.id} className={`rounded-2xl border overflow-hidden transition-all ${
              device.connected
                ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border-emerald-500/15'
                : 'bg-stone-900/[0.04] border-stone-900/10'
            }`}>
              <div className="p-4 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  device.connected
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-stone-900/5 text-stone-900/30'
                }`}>
                  {deviceIcons[device.type]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{device.name}</p>
                    {device.connected && (
                      <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        <Bluetooth className="w-2.5 h-2.5" />
                        Connected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-stone-900/40">
                    {device.battery !== undefined && device.connected && (
                      <span className="flex items-center gap-0.5">
                        🔋 {device.battery}%
                      </span>
                    )}
                    {device.lastSync && (
                      <span>Last sync: {device.lastSync}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleConnect(device.id)}
                    className={`text-[10px] font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      device.connected
                        ? 'bg-stone-900/5 text-stone-900/40 hover:text-stone-900/60'
                        : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    }`}
                  >
                    {device.connected ? 'Disconnect' : 'Connect'}
                  </button>
                  {!device.connected && (
                    <button onClick={() => removeDevice(device.id)} className="w-7 h-7 rounded-lg bg-stone-900/5 flex items-center justify-center text-stone-900/20 hover:text-red-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sync data types */}
              {device.connected && (
                <div className="px-4 pb-3 flex gap-2 flex-wrap">
                  {['Heart Rate', 'Steps', 'Sleep', 'Calories'].map(metric => (
                    <span key={metric} className="text-[9px] bg-stone-900/5 text-stone-900/40 px-2 py-1 rounded-full border border-stone-900/10">
                      {metric} ✓
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scan for devices */}
      <button
        onClick={handleScan}
        disabled={scanning}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border text-sm font-medium transition-all ${
          scanning
            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            : 'bg-stone-900/[0.04] border-stone-900/10 text-stone-900/50 hover:text-stone-900/70 hover:bg-stone-900/[0.06]'
        }`}
      >
        {scanning ? (
          <>
            <Wifi className="w-4 h-4 animate-pulse" />
            Scanning for devices...
          </>
        ) : (
          <>
            <Bluetooth className="w-4 h-4" />
            Scan for New Devices
          </>
        )}
      </button>

      {/* Available devices */}
      {showAvailable && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-900/50">Available Nearby</h3>
          {availableDevices
            .filter(ad => !devices.some(d => d.name === ad.name))
            .map((ad) => (
              <button
                key={ad.name}
                onClick={() => handleAddDevice(ad.name, ad.type)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-stone-900/[0.04] border border-stone-900/10 hover:bg-stone-900/[0.06] transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-900/5 flex items-center justify-center text-stone-900/30">
                  {deviceIcons[ad.type as keyof typeof deviceIcons] || <Bluetooth className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{ad.name}</p>
                  <p className="text-[10px] text-stone-900/30">Tap to pair</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-900/20" />
              </button>
            ))}
        </div>
      )}

      {/* Health integrations */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-900/50 mb-3">Health Integrations</h3>
        <div className="space-y-2">
          {[
            { name: 'Apple Health', icon: '🍎', connected: true },
            { name: 'Google Fit', icon: '💚', connected: false },
            { name: 'Samsung Health', icon: '💙', connected: false },
            { name: 'Strava', icon: '🟠', connected: false },
          ].map(integration => (
            <div key={integration.name} className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-900/[0.04] border border-stone-900/10">
              <span className="text-xl">{integration.icon}</span>
              <span className="flex-1 text-sm font-medium">{integration.name}</span>
              <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                integration.connected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-stone-900/5 text-stone-900/40 border border-stone-900/10'
              }`}>
                {integration.connected ? 'Connected' : 'Connect'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WearableSettings;
