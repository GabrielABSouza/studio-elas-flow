import { SimpleBusinessHoursEditor } from '../components/operation/SimpleBusinessHoursEditor';
import { SimpleClosuresEditor } from '../components/operation/SimpleClosuresEditor';

export default function OperationPage() {
  return (
    <div className="space-y-6">
      <SimpleBusinessHoursEditor />
      <SimpleClosuresEditor />
    </div>
  );
}