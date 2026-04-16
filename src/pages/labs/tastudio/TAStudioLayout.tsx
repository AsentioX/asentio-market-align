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
  const [garage, setGarage] = useState<Build[]>([]);

  const handleStart = () => setScreen('onboarding');
  const handleBrowse = () => setScreen('garage');

  const handleQuizDone = (p: DriverProfile) => {
    setProfile(p);
    setScreen('models');
  };

  const handleModelPick = (modelId: string) => {
    if (!profile) return;
    const tmpl = selectTemplate(profile);
    const build = generateBuild(modelId, tmpl);
    setCurrentBuild(build);
    setScreen('build');
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
          onPick={handleModelPick}
          onBack={() => setScreen('onboarding')}
        />
      )}
      {screen === 'build' && currentBuild && (
        <BuildView
          build={currentBuild}
          profile={profile}
          onUpdate={setCurrentBuild}
          onSave={handleSave}
          onBack={() => setScreen('models')}
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
