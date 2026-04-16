import { useState } from 'react';
import Landing from './screens/Landing';
import Onboarding from './screens/Onboarding';
import ModelSelect from './screens/ModelSelect';
import BuildView from './screens/BuildView';
import Garage from './screens/Garage';
import { Build, DriverProfile, generateBuild, selectTemplate } from './mockData';

type Screen = 'landing' | 'onboarding' | 'models' | 'build' | 'garage';

const TAStudioLayout = () => {
  const [screen, setScreen] = useState<Screen>('landing');
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [currentBuild, setCurrentBuild] = useState<Build | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [garage, setGarage] = useState<Build[]>([]);

  const handleStart = () => setScreen('onboarding');
  const handleBrowse = () => setScreen('garage');

  const handleQuizDone = (
    p: DriverProfile,
    starting: { kind: 'photo'; dataUrl: string } | { kind: 'model'; modelId: string },
  ) => {
    setProfile(p);
    if (starting.kind === 'photo') {
      // Use a "custom" placeholder modelId — the photo IS the platform.
      setUserPhoto(starting.dataUrl);
      const tmpl = selectTemplate(p);
      const build = generateBuild('custom', tmpl, undefined, starting.dataUrl);
      setCurrentBuild(build);
      setScreen('build');
    } else {
      setUserPhoto(null);
      const tmpl = selectTemplate(p);
      const build = generateBuild(starting.modelId, tmpl);
      setCurrentBuild(build);
      setScreen('build');
    }
  };

  const handleSave = (build: Build) => {
    setGarage((g) => [build, ...g]);
    setScreen('garage');
  };

  const handleOpenBuild = (build: Build) => {
    setCurrentBuild(build);
    setScreen('build');
  };

  return (
    <div className="min-h-screen bg-[hsl(0_0%_4%)] text-[hsl(0_0%_98%)] font-sans antialiased">
      {screen === 'landing' && <Landing onStart={handleStart} onBrowse={handleBrowse} />}
      {screen === 'onboarding' && (
        <Onboarding onComplete={handleQuizDone} onBack={() => setScreen('landing')} />
      )}
      {screen === 'models' && (
        <ModelSelect
          profile={profile!}
          onPick={(modelId) => {
            if (!profile) return;
            const tmpl = selectTemplate(profile);
            const build = generateBuild(modelId, tmpl);
            setCurrentBuild(build);
            setScreen('build');
          }}
          onBack={() => setScreen('onboarding')}
        />
      )}
      {screen === 'build' && currentBuild && (
        <BuildView
          build={currentBuild}
          profile={profile}
          userPhoto={userPhoto}
          onUpdate={setCurrentBuild}
          onSave={handleSave}
          onBack={() => setScreen('onboarding')}
          onGarage={() => setScreen('garage')}
        />
      )}
      {screen === 'garage' && (
        <Garage
          builds={garage}
          onOpen={handleOpenBuild}
          onNew={() => setScreen('onboarding')}
          onHome={() => setScreen('landing')}
        />
      )}
    </div>
  );
};

export default TAStudioLayout;
