import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { RESOURCE_TYPES, SEMESTERS } from '../../utils/constants';

export default function ResourceFilters({ values, onChange, onReset }) {
  const set = (k) => (e) => onChange(k, e.target.value);
  return (
    <form className="card filters" onSubmit={(e) => e.preventDefault()} aria-label="Filters">
      <Input label="College" value={values.college} onChange={set('college')} />
      <Input label="Degree" value={values.degree} onChange={set('degree')} />
      <Input label="Branch" value={values.branch} onChange={set('branch')} />
      <Select label="Semester" value={values.semester} onChange={set('semester')} placeholder="Any" options={SEMESTERS} />
      <Input label="Subject" value={values.subject} onChange={set('subject')} />
      <Input label="Unit" value={values.unit} onChange={set('unit')} />
      <Select label="Resource type" value={values.resourceType} onChange={set('resourceType')} placeholder="Any" options={RESOURCE_TYPES} />
      <Select label="Minimum rating" value={values.rating} onChange={set('rating')} placeholder="Any" options={[{ value: '4', label: '4 stars & up' }, { value: '3', label: '3 stars & up' }, { value: '2', label: '2 stars & up' }]} />
      <Button variant="ghost" onClick={onReset}>Clear filters</Button>
    </form>
  );
}
