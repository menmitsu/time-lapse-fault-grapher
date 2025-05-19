
const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-full mx-auto">
        <h1 className="text-3xl font-bold mb-6">Fault Monitoring Dashboard</h1>
        <div className="mb-8">
          <FaultGraph />
        </div>
      </div>
    </div>
  );
};

import FaultGraph from '../components/FaultGraph';
export default Index;
