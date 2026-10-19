import ResourceUploadForm from '../../components/resources/ResourceUploadForm';
export default function UploadMaterialPage() {
  return (
    <div style={{ maxWidth: 820 }}>
      <div className="page-head">
        <h1 style={{ fontSize: '2rem' }}>Upload material</h1>
        <p>Share your study notes, previous papers, and lab files directly with your classmates in the Material Hub.</p>
      </div>
      <ResourceUploadForm />
    </div>
  );
}
