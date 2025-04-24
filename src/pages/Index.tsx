
import FaultGraph from '../components/FaultGraph';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Fault Monitoring Dashboard</h1>
        <FaultGraph />
      </div>
    </div>
  );
};

export default Index;
