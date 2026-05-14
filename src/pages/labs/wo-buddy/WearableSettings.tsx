import { useState } from 'react';
import { Watch, Smartphone, Radio, Bluetooth, ChevronRight, Signal, Wifi, X, AlertCircle } from 'lucide-react';
import { useWearableDevices } from './useWearableDevices';

const deviceIcons: Record<string, React.ReactNode> = {
  watch: <Watch className="w-5 h-5" />,
  ring: <Radio className="w-5 h-5" />,
  band: <Signal className="w-5 h-5" />,
  phone: <Smartphone className="w-5 h-5" />,
};

const WearableSettings = () => {
  const { devices, connect, disconnect, remove, supported } = useWearableDevices();
  const [pairing, setPairing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setError(null);
    setPairing(true);
    try {
      await connect();
    } catch (e: any) {
      // User-cancel triggers a NotFoundError; ignore that.
      if (e?.name !== 'NotFoundError') {
        setError(e?.message || 'Failed to pair device');
      }
    } finally {
      setPairing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Wearable Devices</h2>
        <p className="text-xs text-stone-700 mt-1">
          Pair any Bluetooth heart-rate strap or watch (Polar, Wahoo, Garmin, Coospo, Scosche…) to stream live data.
        </p>
      </div>

      {!supported && (
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-stone-700">
            Web Bluetooth isn't available in this browser. Use Chrome / Edge on desktop or Android.
            Apple Watch and iOS Safari are not supported by Apple.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-stone-700">{error}</p>
        </div>
      )}

      {/* Connected / saved devices */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-700 mb-3">Your Devices</h3>
        {devices.length === 0 && (
          <p className="text-xs text-stone-600 italic">No devices paired yet. Tap "Scan" below to connect a strap or watch.</p>
        )}
        <div className="space-y-2">
          {devices.map((device) => (
            <div key={device.id} className={`rounded-2xl border overflow-hidden transition-all ${
              device.connected
                ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border-emerald-500/15'
                : 'bg-transparent border-stone-200/70'
            }`}>
              <div className="p-4 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  device.connected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-stone-900/5 text-stone-600'
                }`}>
                  {deviceIcons[device.type]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{device.name}</p>
                    {device.connected && (
                      <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        <Bluetooth className="w-2.5 h-2.5" />
                        Live
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-stone-700">
                    {device.battery !== undefined && device.connected && (
                      <span className="flex items-center gap-0.5">🔋 {device.battery}%</span>
                    )}
                    {device.lastSync && <span>Last sync: {device.lastSync}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {device.connected ? (
                    <button
                      onClick={() => disconnect(device.id)}
                      className="text-[10px] font-medium px-3 py-1.5 rounded-lg bg-stone-900/5 text-stone-700 hover:text-stone-800"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => remove(device.id)}
                      className="w-7 h-7 rounded-lg bg-stone-900/5 flex items-center justify-center text-stone-600 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {device.connected && (
                <div className="px-4 pb-3 flex gap-2 flex-wrap">
                  {['Heart Rate', 'RR / HRV', 'Battery'].map(metric => (
                    <span key={metric} className="text-[9px] bg-stone-900/5 text-stone-700 px-2 py-1 rounded-full border border-stone-200/70">
                      {metric} ✓
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scan / pair */}
      <button
        onClick={handleScan}
        disabled={pairing || !supported}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border text-sm font-medium transition-all ${
          pairing
            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            : 'bg-transparent border-stone-200/70 text-stone-700 hover:bg-stone-900/5'
        } disabled:opacity-50`}
      >
        {pairing ? (
          <><Wifi className="w-4 h-4 animate-pulse" /> Waiting for device…</>
        ) : (
          <><Bluetooth className="w-4 h-4" /> Pair Bluetooth Heart-Rate Device</>
        )}
      </button>
      <p className="text-[10px] text-stone-600 text-center -mt-3">
        Wear the strap / watch and put it in pairing mode, then tap above. Your browser will show a device picker.
      </p>
    </div>
  );
};

export default WearableSettings;
